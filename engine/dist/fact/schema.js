// schema v0 — DuckDB fact table 字段契约（A-021 / spec.md §R3-D2）
// 纯逻辑模块：不 import 任何 DuckDB 原生绑定，使守卫脚本可零依赖直接 import 本文件。
// 决议继承：A-007 单写多读 SWMR / A-008 版本演进 / A-010 correlation key（沿用，不重开）
export const SCHEMA_VERSION_V0 = 1;
export const AUDIT_FACT_FIELDS = [
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
export const SCHEMA_REGISTRY_FIELDS = [
    { name: 'version', type: 'INTEGER', nullable: false, role: 'identity', constraints: ['NOT NULL', 'PRIMARY KEY', 'CHECK(version >= 1)'], inherits: 'A-008' },
    { name: 'change_event', type: 'VARCHAR(16)', nullable: false, role: 'governance', constraints: ['NOT NULL', "CHECK(change_event IN ('Registered','Rejected','Deprecated'))"], inherits: 'A-008' },
    { name: 'compatibility', type: 'VARCHAR(24)', nullable: false, role: 'governance', constraints: ['NOT NULL', "CHECK(compatibility IN ('BACKWARD','FORWARD','FULL','BACKWARD_TRANSITIVE','FORWARD_TRANSITIVE','FULL_TRANSITIVE','NONE'))"], inherits: 'A-008' },
    { name: 'description', type: 'VARCHAR(512)', nullable: false, role: 'payload', constraints: ['NOT NULL'], inherits: 'A-008' },
    { name: 'registered_at', type: 'TIMESTAMPTZ', nullable: false, role: 'provenance', constraints: ['NOT NULL', 'DEFAULT current_timestamp'], inherits: 'A-008' }
];
// ---- 只追加守卫：改写语句黑名单（默认拒绝，白名单放行）----
// 依据：DuckDB 稳定版无触发器、无表级权限模型，READ_ONLY 会连 INSERT 一起禁；
// 表级只追加只能靠 连接拓扑 + 门面白名单 + 本守卫 三层应用侧方案（调研 §4.2 / §4.3）。
export const REWRITE_BLACKLIST = [
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
export const STATEMENT_ALLOWLIST = [
    'SELECT',
    'INSERT INTO',
    'CREATE TABLE',
    'ATTACH',
    'PRAGMA',
    'DESCRIBE',
    'WITH'
];
export function normalizeSql(sql) {
    const noLine = sql.split('--').map(function (s) { return s.split(String.fromCharCode(10))[0]; }).join(' ');
    const noBlock = noLine.split('/*').join(' ').split('*/').join(' ');
    return noBlock.split(String.fromCharCode(10)).join(' ').split(String.fromCharCode(9)).join(' ').split('  ').join(' ').trim().toUpperCase();
}
// ---- 字面量剥离（#55 / D-059④）：黑名单匹配前先剥 SQL 字面量——
// '...'（'' 转义）、`"..."`（"" 转义，标识符引号）、`...`、$$…$$ / $tag$…$tag$ 美元引号串。
// 误伤案例：SELECT * FROM t WHERE c='DELETE FROM x'——字面量内 UPDATE/DELETE 字样非改写意图。
// 未闭合引号不匹配任何剥离式 → 原文残留字样照常被黑名单拦（不可解析=保守拒，方向正确）。
// 拒「必须上 AST」强主张：OWASP 分级下字符串黑名单在非注入面合法（本守卫作用面=应用侧只追加门面）。
export function stripSqlLiterals(sql) {
    return sql
        .replace(/\$([A-Za-z_][A-Za-z0-9_]*)?\$[\s\S]*?\$\1?\$/g, ' ')
        .replace(/'([^']|'')*'/g, ' ')
        .replace(/"([^"]|"")*"/g, ' ')
        .replace(/`[^`]*`/g, ' ');
}
export function classifyStatement(sql) {
    const s = normalizeSql(stripSqlLiterals(sql));
    if (s.length === 0) {
        return { allow: false, reason: 'empty statement' };
    }
    for (const bad of REWRITE_BLACKLIST) {
        if (s.includes(bad)) {
            return { allow: false, reason: 'rewrite form rejected: ' + bad };
        }
    }
    for (const good of STATEMENT_ALLOWLIST) {
        if (s.startsWith(good)) {
            return { allow: true, reason: 'allowlisted: ' + good };
        }
    }
    return { allow: false, reason: 'default deny: not in allowlist' };
}
export class AppendOnlyViolation extends Error {
    constructor(sql, reason) {
        super('append-only violation: ' + reason + ' :: ' + sql.slice(0, 120));
        this.name = 'AppendOnlyViolation';
    }
}
export function assertAppendOnly(sql) {
    const v = classifyStatement(sql);
    if (!v.allow) {
        throw new AppendOnlyViolation(sql, v.reason);
    }
}
// ---- DDL 构造器：字段清单程序化派生，禁止手工转录 DDL ----
export function buildCreateTableSql(table, fields, tableConstraints) {
    const cols = fields.map(function (f) { return '  ' + f.name + ' ' + f.type + ' ' + f.constraints.join(' ').trim(); })
        .concat(tableConstraints ? tableConstraints.map(function (c) { return '  ' + c; }) : []);
    const head = 'CREATE TABLE IF NOT EXISTS ' + table + ' (';
    return head + String.fromCharCode(10) + cols.join(',' + String.fromCharCode(10)) + String.fromCharCode(10) + ');';
}
export const AUDIT_FACT_DDL = buildCreateTableSql('audit_fact', AUDIT_FACT_FIELDS);
export const SCHEMA_REGISTRY_DDL = buildCreateTableSql('schema_registry', SCHEMA_REGISTRY_FIELDS);
// ---- quarantine_log（#78 / ADR-0022 / D-106·D-108·D-112·D-115·D-117·D-119）----
// 字段级病态处置事件台账——逐字段处置事件行（normalized 留痕不告警 / quarantined 隔离）。
// 幂等自然键（D-108②+D-112④ 扩展）：UNIQUE(run_id, commit_sha, field_name, reason_code, disposition)
//   ——重跑同 run 重复写=插入幂等（ON CONFLICT DO NOTHING），崩溃后重跑自愈。
// reason_code CHECK=命名公约契约物（D-119）：开放词表禁把枚举硬编码进 CHECK
//   ——加码=非破坏；枚举成员资格由写路径（appendQuarantineEvent）校验 QUARANTINE_REASON_CODES。
// raw_bytes 有界（D-117）：hex 回显 ≤131072 chars（64KiB bytes 上限双编码）＋指纹三件套列
//   （is_trunc/original_length/sha256_full）——截断声明可机验，完整现场 git 内容寻址重放兜底。
// recorded_at=该 run 观测时点（值源=headDate，D-108③）；可空——NULL 仅锚病态路径。
export const QUARANTINE_LOG_FIELDS = [
    { name: 'q_seq', type: 'UBIGINT', nullable: false, role: 'identity', constraints: ['NOT NULL', 'PRIMARY KEY'], inherits: 'D-106' },
    { name: 'run_id', type: 'CHAR(32)', nullable: false, role: 'correlation', constraints: ['NOT NULL', "CHECK(regexp_matches(run_id, '^[0-9a-f]{32}$'))"], inherits: 'D-108' },
    { name: 'commit_sha', type: 'VARCHAR(64)', nullable: false, role: 'provenance', constraints: ['NOT NULL'], inherits: 'D-106' },
    { name: 'field_name', type: 'VARCHAR(32)', nullable: false, role: 'classification', constraints: ['NOT NULL'], inherits: 'D-104' },
    { name: 'disposition', type: 'VARCHAR(16)', nullable: false, role: 'classification', constraints: ['NOT NULL', "CHECK(disposition IN ('quarantined','normalized'))"], inherits: 'D-112' },
    { name: 'reason_code', type: 'VARCHAR(64)', nullable: false, role: 'classification', constraints: ['NOT NULL', "CHECK(regexp_matches(reason_code, '^[a-z][a-z0-9_]{2,63}$'))"], inherits: 'D-119' },
    { name: 'raw_bytes_hex', type: 'VARCHAR', nullable: false, role: 'payload', constraints: ['NOT NULL', 'CHECK(length(raw_bytes_hex) <= 131072)'], inherits: 'D-117' },
    //   列名 is_trunc（非 is_truncated）：append-only 黑名单为子串扫，'TRUNCATE' 会误伤列名——
    //   改名避开守卫误报（语义不变：D-117 截断标记位；禁词表兼容注记见 docs/known-gaps.md）。
    { name: 'is_trunc', type: 'BOOLEAN', nullable: false, role: 'payload', constraints: ['NOT NULL'], inherits: 'D-117' },
    { name: 'original_length', type: 'UBIGINT', nullable: false, role: 'payload', constraints: ['NOT NULL'], inherits: 'D-117' },
    { name: 'sha256_full', type: 'CHAR(64)', nullable: false, role: 'payload', constraints: ['NOT NULL', "CHECK(regexp_matches(sha256_full, '^[0-9a-f]{64}$'))"], inherits: 'D-117' },
    { name: 'collector', type: 'VARCHAR(64)', nullable: false, role: 'provenance', constraints: ['NOT NULL'], inherits: 'D-106' },
    { name: 'recorded_at', type: 'TIMESTAMPTZ', nullable: true, role: 'provenance', constraints: ['NULL'], inherits: 'D-108' }
];
export const QUARANTINE_LOG_DDL = buildCreateTableSql('quarantine_log', QUARANTINE_LOG_FIELDS, [
    'UNIQUE(run_id, commit_sha, field_name, reason_code, disposition)'
]);
