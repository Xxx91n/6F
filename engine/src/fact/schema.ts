// schema v0 — DuckDB 事实表字段定义
// 纯逻辑模块：不引入任何 DuckDB 原生绑定，使检查脚本可直接导入本文件。
// 设计原则：单写多读、版本可演进、跨档关联键统一（沿用既有规则）。

export interface FactField {
  name: string;
  type: string;
  nullable: boolean;
  role: string;
  constraints: readonly string[];
  inherits: string;
}

// 理由：战略五问固定为 S1-S5 五个维度；五个审计档位共用同一张只追加事实表。
export const SCHEMA_VERSION_V0 = 1;

export const AUDIT_FACT_FIELDS: readonly FactField[] = [
  { name: 'fact_seq', type: 'UBIGINT', nullable: false, role: 'identity', constraints: ['NOT NULL', 'PRIMARY KEY'], inherits: 'A-007' },
  { name: 'fact_id', type: 'VARCHAR(36)', nullable: false, role: 'identity', constraints: ['NOT NULL', 'UNIQUE'], inherits: 'ADR-0005' },
  { name: 'schema_version', type: 'INTEGER', nullable: false, role: 'governance', constraints: ['NOT NULL', 'CHECK(schema_version >= 1)', 'REFERENCES schema_registry(version)'], inherits: 'A-008' },
  { name: 'trace_id', type: 'CHAR(32)', nullable: false, role: 'correlation', constraints: ['NOT NULL', "CHECK(regexp_matches(trace_id, '^[0-9a-f]{32}$'))"], inherits: 'A-010' },
  { name: 'baggage_id', type: 'CHAR(32)', nullable: false, role: 'correlation', constraints: ['NOT NULL', "CHECK(regexp_matches(baggage_id, '^[0-9a-f]{32}$'))"], inherits: 'A-010' },
  { name: 'scale', type: 'VARCHAR(8)', nullable: false, role: 'classification', constraints: ['NOT NULL', "CHECK(scale IN ('Macro-A','Macro-B','Macro-C','Micro-A','Micro-B'))"], inherits: 'CONTEXT' },
  { name: 'quadrant', type: 'VARCHAR(16)', nullable: false, role: 'classification', constraints: ['NOT NULL', "CHECK(quadrant IN ('structure','behavior','supply-chain','strategic'))"], inherits: 'CONTEXT' },
  { name: 'dimension', type: 'VARCHAR(2)', nullable: true, role: 'classification', constraints: ['NULL', "CHECK(dimension IS NULL OR dimension IN ('S1','S2','S3','S4','S5'))"], inherits: 'CONTEXT' },
  { name: 'collector_id', type: 'VARCHAR(64)', nullable: false, role: 'provenance', constraints: ['NOT NULL'], inherits: 'R3-D3' },
  { name: 'repo_ref', type: 'VARCHAR(256)', nullable: false, role: 'provenance', constraints: ['NOT NULL'], inherits: 'CONTEXT' },
  { name: 'subject_ref', type: 'VARCHAR(512)', nullable: false, role: 'provenance', constraints: ['NOT NULL'], inherits: 'ADR-0005' },
  { name: 'evidence_ref', type: 'VARCHAR(512)', nullable: false, role: 'provenance', constraints: ['NOT NULL'], inherits: 'CONTEXT' },
  { name: 'metric', type: 'VARCHAR(128)', nullable: false, role: 'payload', constraints: ['NOT NULL'], inherits: 'A-005' },
  { name: 'value_json', type: 'VARCHAR', nullable: false, role: 'payload', constraints: ['NOT NULL', 'CHECK(json_valid(value_json))'], inherits: 'A-005' },
  { name: 'observed_at', type: 'TIMESTAMPTZ', nullable: false, role: 'provenance', constraints: ['NOT NULL'], inherits: 'R3-D3' },
  { name: 'ingested_at', type: 'TIMESTAMPTZ', nullable: false, role: 'provenance', constraints: ['NOT NULL', 'DEFAULT current_timestamp'], inherits: 'A-007' }
];

export const SCHEMA_REGISTRY_FIELDS: readonly FactField[] = [
  { name: 'version', type: 'INTEGER', nullable: false, role: 'identity', constraints: ['NOT NULL', 'PRIMARY KEY', 'CHECK(version >= 1)'], inherits: 'A-008' },
  { name: 'change_event', type: 'VARCHAR(16)', nullable: false, role: 'governance', constraints: ['NOT NULL', "CHECK(change_event IN ('Registered','Rejected','Deprecated'))"], inherits: 'A-008' },
  { name: 'compatibility', type: 'VARCHAR(24)', nullable: false, role: 'governance', constraints: ['NOT NULL', "CHECK(compatibility IN ('BACKWARD','FORWARD','FULL','BACKWARD_TRANSITIVE','FORWARD_TRANSITIVE','FULL_TRANSITIVE','NONE'))"], inherits: 'A-008' },
  { name: 'description', type: 'VARCHAR(512)', nullable: false, role: 'payload', constraints: ['NOT NULL'], inherits: 'A-008' },
  { name: 'registered_at', type: 'TIMESTAMPTZ', nullable: false, role: 'provenance', constraints: ['NOT NULL', 'DEFAULT current_timestamp'], inherits: 'A-008' }
];
// ---- 只追加检查：拦截可能修改或删除已有数据的语句（默认拒绝，只有放行清单内的语句才允许）----
// 依据：DuckDB 稳定版没有触发器，也没有表级别的权限控制，设置 READ_ONLY 会连 INSERT 也一起禁用；
// 保证表级只追加写入，依靠连接管理、入口放行清单与本检查三道防护。
export const REWRITE_BLACKLIST: readonly string[] = [
  'UPDATE',
  'DELETE',
  'DROP',
  'ALTER',
  'TRUNCATE',
  'INSERT OR REPLACE',
  'ON CONFLICT DO UPDATE',
  'MERGE INTO',
  'COPY'
];

export const STATEMENT_ALLOWLIST: readonly string[] = [
  'SELECT',
  'INSERT INTO',
  'CREATE TABLE',
  'ATTACH',
  'PRAGMA',
  'DESCRIBE',
  'WITH'
];

export type StatementVerdict = { allow: boolean; reason: string };

export function normalizeSql(sql: string): string {
  const noLine = sql.split('--').map(function (s) { return s.split(String.fromCharCode(10))[0]; }).join(' ');
  const noBlock = noLine.split('/*').join(' ').split('*/').join(' ');
  return noBlock.split(String.fromCharCode(10)).join(' ').split(String.fromCharCode(9)).join(' ').split('  ').join(' ').trim().toUpperCase();
}

// ---- 字面量清除：匹配拦截词前先剥离 SQL 字符串字面量 ----
// 包括 '...'（'' 转义）、`"..."`（"" 转义）、`...` 以及 $$…$$ / $tag$…$tag$ 美元引号字符串。
// 避免误伤：例如 SELECT * FROM t WHERE c='DELETE FROM x'，字符串内部的词并不代表改写意图。
// 引号没闭合时不匹配任何清除规则，残留字样仍会被拦截，保持安全拒绝。
export function stripSqlLiterals(sql: string): string {
  return sql
    .replace(/\$([A-Za-z_][A-Za-z0-9_]*)?\$[\s\S]*?\$\1?\$/g, ' ')
    .replace(/'([^']|'')*'/g, ' ')
    .replace(/"([^"]|"")*"/g, ' ')
    .replace(/`[^`]*`/g, ' ');
}

export function classifyStatement(sql: string): StatementVerdict {
  const s = normalizeSql(stripSqlLiterals(sql));
  if (s.length === 0) { return { allow: false, reason: 'empty statement' }; }
  for (const bad of REWRITE_BLACKLIST) {
    if (s.includes(bad)) { return { allow: false, reason: 'rewrite form rejected: ' + bad }; }
  }
  for (const good of STATEMENT_ALLOWLIST) {
    if (s.startsWith(good)) { return { allow: true, reason: 'allowlisted: ' + good }; }
  }
  return { allow: false, reason: 'default deny: not in allowlist' };
}

export class AppendOnlyViolation extends Error {
  constructor(sql: string, reason: string) {
    super('append-only violation: ' + reason + ' :: ' + sql.slice(0, 120));
    this.name = 'AppendOnlyViolation';
  }
}

export function assertAppendOnly(sql: string): void {
  const v = classifyStatement(sql);
  if (!v.allow) { throw new AppendOnlyViolation(sql, v.reason); }
}

// ---- 建表语句生成器：根据字段配置生成 SQL，禁止手动拼写 DDL ----
export function buildCreateTableSql(table: string, fields: readonly FactField[], tableConstraints?: readonly string[]): string {
  const cols = fields.map(function (f) { return '  ' + f.name + ' ' + f.type + ' ' + f.constraints.join(' ').trim(); })
    .concat(tableConstraints ? tableConstraints.map(function (c) { return '  ' + c; }) : []);
  const head = 'CREATE TABLE IF NOT EXISTS ' + table + ' (';
  return head + String.fromCharCode(10) + cols.join(',' + String.fromCharCode(10)) + String.fromCharCode(10) + ');';
}

export const AUDIT_FACT_DDL: string = buildCreateTableSql('audit_fact', AUDIT_FACT_FIELDS);
export const SCHEMA_REGISTRY_DDL: string = buildCreateTableSql('schema_registry', SCHEMA_REGISTRY_FIELDS);

// ---- quarantine_log 隔离记录表 ----
// 处理有问题的输入：整行严重格式错误则立刻报错终止；单个字段有异常则记录原因并隔离。
// 幂等写入唯一键：UNIQUE(run_id, commit_sha, field_name, reason_code, disposition)，重复跑同一批次不会重复插入。
// reason_code 校验使用命名规则校验，不硬编码枚举值，方便后续扩展。
// raw_bytes 长度有限制：十六进制文本不超过 131072 字符（对应 64KB 原始字节），同时记下是否截断、原始长度和完整 sha256。
// recorded_at 为本次观测时间戳，允许为空。
export const QUARANTINE_LOG_FIELDS: readonly FactField[] = [
  { name: 'q_seq', type: 'UBIGINT', nullable: false, role: 'identity', constraints: ['NOT NULL', 'PRIMARY KEY'], inherits: 'D-106' },
  { name: 'run_id', type: 'CHAR(32)', nullable: false, role: 'correlation', constraints: ['NOT NULL', "CHECK(regexp_matches(run_id, '^[0-9a-f]{32}$'))"], inherits: 'D-108' },
  { name: 'commit_sha', type: 'VARCHAR(64)', nullable: false, role: 'provenance', constraints: ['NOT NULL'], inherits: 'D-106' },
  { name: 'field_name', type: 'VARCHAR(32)', nullable: false, role: 'classification', constraints: ['NOT NULL'], inherits: 'D-104' },
  { name: 'disposition', type: 'VARCHAR(16)', nullable: false, role: 'classification', constraints: ['NOT NULL', "CHECK(disposition IN ('quarantined','normalized'))"], inherits: 'D-112' },
  { name: 'reason_code', type: 'VARCHAR(64)', nullable: false, role: 'classification', constraints: ['NOT NULL', "CHECK(regexp_matches(reason_code, '^[a-z][a-z0-9_]{2,63}$'))"], inherits: 'D-119' },
  { name: 'raw_bytes_hex', type: 'VARCHAR', nullable: false, role: 'payload', constraints: ['NOT NULL', 'CHECK(length(raw_bytes_hex) <= 131072)'], inherits: 'D-117' },
  //   字段名采用 is_trunc（不用 is_truncated）：只追加拦截规则使用子串匹配，'TRUNCATE' 会误伤该字段名，
  //   改短名称避免检查脚本误报，实际含义仍为截断标记。
  { name: 'is_trunc', type: 'BOOLEAN', nullable: false, role: 'payload', constraints: ['NOT NULL'], inherits: 'D-117' },
  { name: 'original_length', type: 'UBIGINT', nullable: false, role: 'payload', constraints: ['NOT NULL'], inherits: 'D-117' },
  { name: 'sha256_full', type: 'CHAR(64)', nullable: false, role: 'payload', constraints: ['NOT NULL', "CHECK(regexp_matches(sha256_full, '^[0-9a-f]{64}$'))"], inherits: 'D-117' },
  { name: 'collector', type: 'VARCHAR(64)', nullable: false, role: 'provenance', constraints: ['NOT NULL'], inherits: 'D-106' },
  { name: 'recorded_at', type: 'TIMESTAMPTZ', nullable: true, role: 'provenance', constraints: ['NULL'], inherits: 'D-108' }
];

export const QUARANTINE_LOG_DDL: string = buildCreateTableSql('quarantine_log', QUARANTINE_LOG_FIELDS, [
  'UNIQUE(run_id, commit_sha, field_name, reason_code, disposition)'
]);
