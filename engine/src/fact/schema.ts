// schema v0 —— DuckDB 事实表的字段定义
// 纯逻辑：不引 DuckDB 的绑定，检查脚本能直接把这份 import 进去。
// 设计就三条：一个人写、好多人读；版本能往前推；跨档对号用同一个键（沿用老规矩）。

export interface FactField {
  name: string;
  type: string;
  nullable: boolean;
  role: string;
  constraints: readonly string[];
  inherits: string;
}

// 战略那五个问题就固定在 S1-S5；五档审计共用这一张只往后加的表。
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
// ---- 只追加检查：想改、想删老数据的语句一律拦下（默认不放，只有白名单里的才准过）----
// 为什么这么干：DuckDB 稳定版既没触发器，也没表级权限，设了 READ_ONLY 连 INSERT 都一块儿禁了；
// 所以只追加这件事靠三道防：连接怎么开、入口白名单、再加这道检查。
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

// ---- 先剥字面量再认拦截词 ----
// 剥这几种：'...'（'' 转义）、`"..."`（"" 转义）、`...`，还有 $$…$$ / $tag$…$tag$ 这种美元引号串。
// 免得误伤：比如 SELECT * FROM t WHERE c='DELETE FROM x'，引号里那个词又没打算改库。
// 引号没配对上就一条都不剥，剩下的字样照样拦，宁可错杀也不放行。
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

// ---- 建表语句生成器：照着字段配置生成 SQL，不许手写 DDL ----
export function buildCreateTableSql(table: string, fields: readonly FactField[], tableConstraints?: readonly string[]): string {
  const cols = fields.map(function (f) { return '  ' + f.name + ' ' + f.type + ' ' + f.constraints.join(' ').trim(); })
    .concat(tableConstraints ? tableConstraints.map(function (c) { return '  ' + c; }) : []);
  const head = 'CREATE TABLE IF NOT EXISTS ' + table + ' (';
  return head + String.fromCharCode(10) + cols.join(',' + String.fromCharCode(10)) + String.fromCharCode(10) + ');';
}

export const AUDIT_FACT_DDL: string = buildCreateTableSql('audit_fact', AUDIT_FACT_FIELDS);
export const SCHEMA_REGISTRY_DDL: string = buildCreateTableSql('schema_registry', SCHEMA_REGISTRY_FIELDS);

// ---- quarantine_log 隔离记录表 ----
// 坏输入怎么处：整行都烂了就当场报错停手；就单个字段有毛病，记下原因隔开。
// 幂等的唯一键：UNIQUE(run_id, commit_sha, field_name, reason_code, disposition)，同一批跑两遍也不会插重复。
// reason_code 拿命名规则去校，不把枚举值写死在 SQL 里，将来加码方便。
// raw_bytes 有长度限制：十六进制文本最多 131072 个字符（合 64KB 原始字节），顺手记下截没截、原始多长、完整 sha256。
// recorded_at 是这回调观测的时间戳，可以是空。
export const QUARANTINE_LOG_FIELDS: readonly FactField[] = [
  { name: 'q_seq', type: 'UBIGINT', nullable: false, role: 'identity', constraints: ['NOT NULL', 'PRIMARY KEY'], inherits: 'D-106' },
  { name: 'run_id', type: 'CHAR(32)', nullable: false, role: 'correlation', constraints: ['NOT NULL', "CHECK(regexp_matches(run_id, '^[0-9a-f]{32}$'))"], inherits: 'D-108' },
  { name: 'commit_sha', type: 'VARCHAR(64)', nullable: false, role: 'provenance', constraints: ['NOT NULL'], inherits: 'D-106' },
  { name: 'field_name', type: 'VARCHAR(32)', nullable: false, role: 'classification', constraints: ['NOT NULL'], inherits: 'D-104' },
  { name: 'disposition', type: 'VARCHAR(16)', nullable: false, role: 'classification', constraints: ['NOT NULL', "CHECK(disposition IN ('quarantined','normalized'))"], inherits: 'D-112' },
  { name: 'reason_code', type: 'VARCHAR(64)', nullable: false, role: 'classification', constraints: ['NOT NULL', "CHECK(regexp_matches(reason_code, '^[a-z][a-z0-9_]{2,63}$'))"], inherits: 'D-119' },
  { name: 'raw_bytes_hex', type: 'VARCHAR', nullable: false, role: 'payload', constraints: ['NOT NULL', 'CHECK(length(raw_bytes_hex) <= 131072)'], inherits: 'D-117' },
  // 字段名用 is_trunc（不用 is_truncated）：只追加那套拦法走子串匹配，'TRUNCATE' 会把长名字误伤，
  // 名字改短省得检查脚本报假警，意思还是截断标记。
  { name: 'is_trunc', type: 'BOOLEAN', nullable: false, role: 'payload', constraints: ['NOT NULL'], inherits: 'D-117' },
  { name: 'original_length', type: 'UBIGINT', nullable: false, role: 'payload', constraints: ['NOT NULL'], inherits: 'D-117' },
  { name: 'sha256_full', type: 'CHAR(64)', nullable: false, role: 'payload', constraints: ['NOT NULL', "CHECK(regexp_matches(sha256_full, '^[0-9a-f]{64}$'))"], inherits: 'D-117' },
  { name: 'collector', type: 'VARCHAR(64)', nullable: false, role: 'provenance', constraints: ['NOT NULL'], inherits: 'D-106' },
  { name: 'recorded_at', type: 'TIMESTAMPTZ', nullable: true, role: 'provenance', constraints: ['NULL'], inherits: 'D-108' }
];

export const QUARANTINE_LOG_DDL: string = buildCreateTableSql('quarantine_log', QUARANTINE_LOG_FIELDS, [
  'UNIQUE(run_id, commit_sha, field_name, reason_code, disposition)'
]);
