#!/usr/bin/env node

// src/manifest.ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
function metaPath() {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, "..", "manifest.meta.json");
}
function loadManifestMeta() {
  return JSON.parse(readFileSync(metaPath(), "utf8"));
}

// src/selftest.ts
function runSelftest() {
  const checks = [];
  let meta = null;
  try {
    meta = loadManifestMeta();
    checks.push({ name: "manifest readable", pass: true, detail: meta.name + "@" + meta.version });
  } catch (e) {
    checks.push({ name: "manifest readable", pass: false, detail: String(e.message) });
  }
  const m = meta;
  checks.push({ name: "shells declared == 4", pass: !!m && m.shells.length === 4, detail: m ? String(m.shells.length) : "n/a" });
  checks.push({ name: "default mode single", pass: !!m && m.modes[0] === "default", detail: m ? m.modes.join(",") : "n/a" });
  checks.push({ name: "mcp read-only", pass: !!m && m.mcp.readOnly === true, detail: m ? String(m.mcp.readOnly) : "n/a" });
  checks.push({ name: "receipt fields >= 4", pass: !!m && m.receipt.fields.length >= 4, detail: m ? String(m.receipt.fields.length) : "n/a" });
  return { ok: checks.every(function(c) {
    return c.pass;
  }), checks };
}

// src/doctor.ts
import { spawnSync as spawnSync2 } from "node:child_process";
import { existsSync as existsSync2, readFileSync as readFileSync3, rmSync as rmSync2 } from "node:fs";
import { get } from "node:https";
import { tmpdir } from "node:os";
import { join as join3 } from "node:path";

// src/fact/store.ts
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, mkdtempSync, readFileSync as readFileSync2, readdirSync, renameSync, rmSync, statSync } from "node:fs";
import { dirname as dirname2, join as join2 } from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";

// src/fact/schema.ts
var SCHEMA_VERSION_V0 = 1;
var AUDIT_FACT_FIELDS = [
  { name: "fact_seq", type: "UBIGINT", nullable: false, role: "identity", constraints: ["NOT NULL", "PRIMARY KEY"], inherits: "A-007" },
  { name: "fact_id", type: "VARCHAR(36)", nullable: false, role: "identity", constraints: ["NOT NULL", "UNIQUE"], inherits: "ADR-0005" },
  { name: "schema_version", type: "INTEGER", nullable: false, role: "governance", constraints: ["NOT NULL", "CHECK(schema_version >= 1)", "REFERENCES schema_registry(version)"], inherits: "A-008" },
  { name: "trace_id", type: "CHAR(32)", nullable: false, role: "correlation", constraints: ["NOT NULL", "CHECK(regexp_matches(trace_id, '^[0-9a-f]{32}$'))"], inherits: "A-010" },
  { name: "baggage_id", type: "CHAR(32)", nullable: false, role: "correlation", constraints: ["NOT NULL", "CHECK(regexp_matches(baggage_id, '^[0-9a-f]{32}$'))"], inherits: "A-010" },
  { name: "scale", type: "VARCHAR(8)", nullable: false, role: "classification", constraints: ["NOT NULL", "CHECK(scale IN ('Macro-A','Macro-B','Macro-C','Micro-A','Micro-B'))"], inherits: "CONTEXT" },
  { name: "quadrant", type: "VARCHAR(16)", nullable: false, role: "classification", constraints: ["NOT NULL", "CHECK(quadrant IN ('structure','behavior','supply-chain','strategic'))"], inherits: "CONTEXT" },
  { name: "dimension", type: "VARCHAR(2)", nullable: true, role: "classification", constraints: ["NULL", "CHECK(dimension IS NULL OR dimension IN ('S1','S2','S3','S4','S5'))"], inherits: "CONTEXT" },
  { name: "collector_id", type: "VARCHAR(64)", nullable: false, role: "provenance", constraints: ["NOT NULL"], inherits: "R3-D3" },
  { name: "repo_ref", type: "VARCHAR(256)", nullable: false, role: "provenance", constraints: ["NOT NULL"], inherits: "CONTEXT" },
  { name: "subject_ref", type: "VARCHAR(512)", nullable: false, role: "provenance", constraints: ["NOT NULL"], inherits: "ADR-0005" },
  { name: "evidence_ref", type: "VARCHAR(512)", nullable: false, role: "provenance", constraints: ["NOT NULL"], inherits: "CONTEXT" },
  { name: "metric", type: "VARCHAR(128)", nullable: false, role: "payload", constraints: ["NOT NULL"], inherits: "A-005" },
  { name: "value_json", type: "VARCHAR", nullable: false, role: "payload", constraints: ["NOT NULL", "CHECK(json_valid(value_json))"], inherits: "A-005" },
  { name: "observed_at", type: "TIMESTAMPTZ", nullable: false, role: "provenance", constraints: ["NOT NULL"], inherits: "R3-D3" },
  { name: "ingested_at", type: "TIMESTAMPTZ", nullable: false, role: "provenance", constraints: ["NOT NULL", "DEFAULT current_timestamp"], inherits: "A-007" }
];
var SCHEMA_REGISTRY_FIELDS = [
  { name: "version", type: "INTEGER", nullable: false, role: "identity", constraints: ["NOT NULL", "PRIMARY KEY", "CHECK(version >= 1)"], inherits: "A-008" },
  { name: "change_event", type: "VARCHAR(16)", nullable: false, role: "governance", constraints: ["NOT NULL", "CHECK(change_event IN ('Registered','Rejected','Deprecated'))"], inherits: "A-008" },
  { name: "compatibility", type: "VARCHAR(24)", nullable: false, role: "governance", constraints: ["NOT NULL", "CHECK(compatibility IN ('BACKWARD','FORWARD','FULL','BACKWARD_TRANSITIVE','FORWARD_TRANSITIVE','FULL_TRANSITIVE','NONE'))"], inherits: "A-008" },
  { name: "description", type: "VARCHAR(512)", nullable: false, role: "payload", constraints: ["NOT NULL"], inherits: "A-008" },
  { name: "registered_at", type: "TIMESTAMPTZ", nullable: false, role: "provenance", constraints: ["NOT NULL", "DEFAULT current_timestamp"], inherits: "A-008" }
];
var REWRITE_BLACKLIST = [
  "UPDATE",
  "DELETE",
  "DROP",
  "ALTER",
  "TRUNCATE",
  "INSERT OR REPLACE",
  "ON CONFLICT DO UPDATE",
  "MERGE INTO",
  "COPY"
];
var STATEMENT_ALLOWLIST = [
  "SELECT",
  "INSERT INTO",
  "CREATE TABLE",
  "ATTACH",
  "PRAGMA",
  "DESCRIBE",
  "WITH"
];
function normalizeSql(sql) {
  const noLine = sql.split("--").map(function(s) {
    return s.split(String.fromCharCode(10))[0];
  }).join(" ");
  const noBlock = noLine.split("/*").join(" ").split("*/").join(" ");
  return noBlock.split(String.fromCharCode(10)).join(" ").split(String.fromCharCode(9)).join(" ").split("  ").join(" ").trim().toUpperCase();
}
function stripSqlLiterals(sql) {
  return sql.replace(/\$([A-Za-z_][A-Za-z0-9_]*)?\$[\s\S]*?\$\1?\$/g, " ").replace(/'([^']|'')*'/g, " ").replace(/"([^"]|"")*"/g, " ").replace(/`[^`]*`/g, " ");
}
function classifyStatement(sql) {
  const s = normalizeSql(stripSqlLiterals(sql));
  if (s.length === 0) {
    return { allow: false, reason: "empty statement" };
  }
  for (const bad of REWRITE_BLACKLIST) {
    if (s.includes(bad)) {
      return { allow: false, reason: "rewrite form rejected: " + bad };
    }
  }
  for (const good of STATEMENT_ALLOWLIST) {
    if (s.startsWith(good)) {
      return { allow: true, reason: "allowlisted: " + good };
    }
  }
  return { allow: false, reason: "default deny: not in allowlist" };
}
var AppendOnlyViolation = class extends Error {
  constructor(sql, reason) {
    super("append-only violation: " + reason + " :: " + sql.slice(0, 120));
    this.name = "AppendOnlyViolation";
  }
};
function assertAppendOnly(sql) {
  const v = classifyStatement(sql);
  if (!v.allow) {
    throw new AppendOnlyViolation(sql, v.reason);
  }
}
function buildCreateTableSql(table, fields, tableConstraints) {
  const cols = fields.map(function(f) {
    return "  " + f.name + " " + f.type + " " + f.constraints.join(" ").trim();
  }).concat(tableConstraints ? tableConstraints.map(function(c) {
    return "  " + c;
  }) : []);
  const head = "CREATE TABLE IF NOT EXISTS " + table + " (";
  return head + String.fromCharCode(10) + cols.join("," + String.fromCharCode(10)) + String.fromCharCode(10) + ");";
}
var AUDIT_FACT_DDL = buildCreateTableSql("audit_fact", AUDIT_FACT_FIELDS);
var SCHEMA_REGISTRY_DDL = buildCreateTableSql("schema_registry", SCHEMA_REGISTRY_FIELDS);
var QUARANTINE_LOG_FIELDS = [
  { name: "q_seq", type: "UBIGINT", nullable: false, role: "identity", constraints: ["NOT NULL", "PRIMARY KEY"], inherits: "D-106" },
  { name: "run_id", type: "CHAR(32)", nullable: false, role: "correlation", constraints: ["NOT NULL", "CHECK(regexp_matches(run_id, '^[0-9a-f]{32}$'))"], inherits: "D-108" },
  { name: "commit_sha", type: "VARCHAR(64)", nullable: false, role: "provenance", constraints: ["NOT NULL"], inherits: "D-106" },
  { name: "field_name", type: "VARCHAR(32)", nullable: false, role: "classification", constraints: ["NOT NULL"], inherits: "D-104" },
  { name: "disposition", type: "VARCHAR(16)", nullable: false, role: "classification", constraints: ["NOT NULL", "CHECK(disposition IN ('quarantined','normalized'))"], inherits: "D-112" },
  { name: "reason_code", type: "VARCHAR(64)", nullable: false, role: "classification", constraints: ["NOT NULL", "CHECK(regexp_matches(reason_code, '^[a-z][a-z0-9_]{2,63}$'))"], inherits: "D-119" },
  { name: "raw_bytes_hex", type: "VARCHAR", nullable: false, role: "payload", constraints: ["NOT NULL", "CHECK(length(raw_bytes_hex) <= 131072)"], inherits: "D-117" },
  //   列名 is_trunc（非 is_truncated）：append-only 黑名单为子串扫，'TRUNCATE' 会误伤列名——
  //   改名避开守卫误报（语义不变：D-117 截断标记位；禁词表兼容注记见 docs/known-gaps.md）。
  { name: "is_trunc", type: "BOOLEAN", nullable: false, role: "payload", constraints: ["NOT NULL"], inherits: "D-117" },
  { name: "original_length", type: "UBIGINT", nullable: false, role: "payload", constraints: ["NOT NULL"], inherits: "D-117" },
  { name: "sha256_full", type: "CHAR(64)", nullable: false, role: "payload", constraints: ["NOT NULL", "CHECK(regexp_matches(sha256_full, '^[0-9a-f]{64}$'))"], inherits: "D-117" },
  { name: "collector", type: "VARCHAR(64)", nullable: false, role: "provenance", constraints: ["NOT NULL"], inherits: "D-106" },
  { name: "recorded_at", type: "TIMESTAMPTZ", nullable: true, role: "provenance", constraints: ["NULL"], inherits: "D-108" }
];
var QUARANTINE_LOG_DDL = buildCreateTableSql("quarantine_log", QUARANTINE_LOG_FIELDS, [
  "UNIQUE(run_id, commit_sha, field_name, reason_code, disposition)"
]);

// src/intake/quarantine.ts
import { createHash } from "node:crypto";
var QUARANTINE_REASON_CODES = [
  "anchor_head_date_malformed",
  "normalized_tz_offset",
  "unclassified_field_anomaly",
  "oversize"
];
var REASON_ANCHOR_HEAD_DATE_MALFORMED = "anchor_head_date_malformed";
var REASON_NORMALIZED_TZ_OFFSET = "normalized_tz_offset";
var REASON_UNCLASSIFIED = "unclassified_field_anomaly";
var REASON_OVERSIZE = "oversize";
var FIELD_COMMITTER_DATE = "committer_date";
var FIELD_HEAD_DATE = "head_date";
var RAW_BYTES_CAP = 65536;
var RAW_ECHO_CAP = 80;
var STRICT_QUARANTINE_ENV = "MACRO_AUDIT_STRICT_QUARANTINE";
function rawEcho(raw) {
  return JSON.stringify(raw.length > RAW_ECHO_CAP ? raw.slice(0, RAW_ECHO_CAP) + "\u2026" : raw);
}
function strictQuarantineEnabled(flag, envValue) {
  if (flag !== void 0) {
    return flag;
  }
  return envValue === "1";
}
function rawBytesFingerprint(raw) {
  const buf = Buffer.from(raw, "utf8");
  const truncated = buf.length > RAW_BYTES_CAP;
  const head = truncated ? buf.subarray(0, RAW_BYTES_CAP) : buf;
  return {
    raw_bytes_hex: head.toString("hex"),
    is_trunc: truncated,
    original_length: buf.length,
    sha256_full: createHash("sha256").update(buf).digest("hex")
  };
}
var GIT_ISO_STRICT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/;
function classifyGitIsoField(raw, opts) {
  const r = raw === void 0 || raw === null ? "" : String(raw);
  if (Buffer.byteLength(r, "utf8") > RAW_BYTES_CAP) {
    return { status: "quarantined", value: null, reason_code: REASON_OVERSIZE, raw: r };
  }
  const trimmed = r.trim();
  const s = trimmed.replace(/\+00:00$/, "Z");
  if (GIT_ISO_STRICT_RE.test(s)) {
    if (s !== trimmed) {
      return { status: "normalized", value: s, reason_code: REASON_NORMALIZED_TZ_OFFSET, raw: r };
    }
    return { status: "clean", value: s, reason_code: null, raw: r };
  }
  return {
    status: "quarantined",
    value: null,
    reason_code: opts && opts.anchor ? REASON_ANCHOR_HEAD_DATE_MALFORMED : REASON_UNCLASSIFIED,
    raw: r
  };
}
var GIT_ISO_DIALECT_RULES = [
  { rule_id: "tz_offset/+00:00\u2192Z", match: /\+00:00$/, canonical: "Z" }
];
function absorbGitIsoDialect(raw) {
  const s = raw === void 0 || raw === null ? "" : String(raw);
  for (const rule of GIT_ISO_DIALECT_RULES) {
    if (rule.match.test(s)) {
      const v = s.replace(rule.match, rule.canonical);
      if (v !== s) {
        return { value: v, absorption: { rule_id: rule.rule_id, raw: s, canonical: v } };
      }
    }
  }
  return { value: s, absorption: null };
}
function emptyFieldStat(fieldName) {
  return { field_name: fieldName, total: 0, clean: 0, normalized: 0, quarantined: 0 };
}
function recordFieldInstance(stat, events, cls, commitSha, fieldName) {
  stat.total += 1;
  if (cls.status === "clean") {
    stat.clean += 1;
    return;
  }
  if (cls.status === "normalized") {
    stat.normalized += 1;
  } else {
    stat.quarantined += 1;
  }
  events.push({
    commit_sha: commitSha,
    field_name: fieldName,
    disposition: cls.status === "normalized" ? "normalized" : "quarantined",
    reason_code: cls.reason_code,
    raw: cls.raw
  });
}
var ACCEPTED_REASON_CODES = [];
function strictQuarantineViolations(events) {
  const baseline = new Set(ACCEPTED_REASON_CODES);
  const out = [];
  for (const e of events) {
    if (e.disposition !== "quarantined") {
      continue;
    }
    if (!baseline.has(e.reason_code) && out.indexOf(e.reason_code) < 0) {
      out.push(e.reason_code);
    }
  }
  return out;
}
function ratchetIssues(events) {
  const observed = new Set(events.filter(function(e) {
    return e.disposition === "quarantined";
  }).map(function(e) {
    return e.reason_code;
  }));
  const out = [];
  for (const c of ACCEPTED_REASON_CODES) {
    if (!observed.has(c)) {
      out.push("baseline \u6EDE\u7559\u7801=" + c + "\uFF08\u672C\u8FD0\u884C quarantined \u89C2\u6D4B\u7801\u96C6\u7F3A\u5E2D\u2014\u2014\u68D8\u8F6E\u6761\u6B3E\uFF1A\u6EDE\u7559\u5373\u7EA2\uFF09");
    }
  }
  return out;
}
function intakeIdentityIssues(stats, dbCounts) {
  const issues = [];
  for (const s of stats) {
    if (s.clean + s.normalized + s.quarantined !== s.total) {
      issues.push({ field_name: s.field_name, detail: "\u4E09\u6876\u5408\u8BA1\u2260total\uFF1A" + s.clean + "+" + s.normalized + "+" + s.quarantined + "!=" + s.total });
    }
    const db = dbCounts[s.field_name] || { normalized: 0, quarantined: 0 };
    if (db.normalized !== s.normalized) {
      issues.push({ field_name: s.field_name, detail: "normalized \u5E93\u5185 " + db.normalized + "\u2260\u5185\u5B58 " + s.normalized });
    }
    if (db.quarantined !== s.quarantined) {
      issues.push({ field_name: s.field_name, detail: "quarantined \u5E93\u5185 " + db.quarantined + "\u2260\u5185\u5B58 " + s.quarantined });
    }
  }
  return issues;
}
var QUARANTINE_FIELD_RATIO_RED = 1e-3;
function intakeEscalation(stats) {
  let threshold = false;
  for (const s of stats) {
    if (s.quarantined === 0) {
      continue;
    }
    if (s.field_name === FIELD_HEAD_DATE) {
      return "anchor";
    }
    if (s.quarantined / s.total > QUARANTINE_FIELD_RATIO_RED) {
      threshold = true;
    }
  }
  return threshold ? "threshold" : "none";
}
var VERDICT_REASON_CLASSES = [
  "none",
  "evidence_insufficient",
  "anchor_malformed",
  "threshold_exceeded",
  "criteria_unsupported"
];
function deriveReasonClass(band, escalation) {
  if (escalation === "anchor") {
    return "anchor_malformed";
  }
  if (escalation === "threshold") {
    return "threshold_exceeded";
  }
  if (band === "insufficient") {
    return "evidence_insufficient";
  }
  if (band === "unsupported") {
    return "criteria_unsupported";
  }
  return "none";
}
var CRASH_ARTIFACT_SCHEMA = "quarantine-crash-artifact/v1";
function buildCrashArtifact(args) {
  const fp = rawBytesFingerprint(args.raw === void 0 || args.raw === null ? "" : args.raw);
  const rc = args.run_context || {};
  const cn = args.counts || {};
  return {
    schema: CRASH_ARTIFACT_SCHEMA,
    error_code: args.error_code,
    raw_bytes_hex: fp.raw_bytes_hex,
    is_trunc: fp.is_trunc,
    original_length: fp.original_length,
    sha256_full: fp.sha256_full,
    crash_location: args.crash_location,
    run_context: {
      repo_ref: rc.repo_ref === void 0 ? null : rc.repo_ref,
      run_id: rc.run_id === void 0 ? null : rc.run_id,
      commit_sha: rc.commit_sha === void 0 ? null : rc.commit_sha,
      head_date: rc.head_date === void 0 ? null : rc.head_date,
      collector: rc.collector === void 0 ? null : rc.collector
    },
    counts: {
      commits_seen: cn.commits_seen === void 0 ? 0 : cn.commits_seen,
      records_parsed: cn.records_parsed === void 0 ? 0 : cn.records_parsed,
      clean: cn.clean === void 0 ? 0 : cn.clean,
      normalized: cn.normalized === void 0 ? 0 : cn.normalized,
      quarantined: cn.quarantined === void 0 ? 0 : cn.quarantined,
      facts_written: cn.facts_written === void 0 ? 0 : cn.facts_written,
      quarantined_written: cn.quarantined_written === void 0 ? 0 : cn.quarantined_written
    },
    at: args.at || (/* @__PURE__ */ new Date()).toISOString()
  };
}
var PROTOCOL_CRASH_CODES = [
  "GITCLI-OUTPUT-CONTRACT",
  "GIT-PROBE-FAILED",
  "PROBE-INVARIANT-FAIL",
  "STRICT-QUARANTINE-VIOLATION",
  "QUARANTINE-CONSTRAINT",
  "REASON-CODE-UNLISTED",
  "INTAKE-IDENTITY-MISMATCH"
];
function protocolCrashError(code, detail, crash) {
  if (PROTOCOL_CRASH_CODES.indexOf(code) < 0) {
    throw new Error("protocolCrashError: code not in PROTOCOL_CRASH_CODES\uFF08\u5D29\u6E83\u6876\u8BCD\u8868\u5916\u6253\u9519=bug\uFF0C\u7981\u9759\u9ED8\u964D\u7EA7\uFF09\uFF1A" + code);
  }
  const e = new Error(code + ": " + detail);
  e.code = code;
  e.crash = {
    raw: crash.raw === void 0 ? null : crash.raw,
    crash_location: crash.crash_location === void 0 ? "unknown" : crash.crash_location,
    run_context: crash.run_context || {},
    counts: crash.counts || {}
  };
  return e;
}
function isProtocolCrash(e) {
  return !!e && typeof e === "object" && typeof e.code === "string" && PROTOCOL_CRASH_CODES.indexOf(e.code) >= 0 && typeof e.crash === "object" && e.crash !== null;
}
function crashArtifactFromError(e, at) {
  return buildCrashArtifact({
    error_code: e.code,
    raw: e.crash.raw,
    crash_location: e.crash.crash_location,
    run_context: e.crash.run_context,
    counts: e.crash.counts,
    at
  });
}
function countsFromStats(stats, recordsParsed, factsWritten, quarantinedWritten) {
  let clean = 0, normalized = 0, quarantined = 0;
  for (const s of stats) {
    clean += s.clean;
    normalized += s.normalized;
    quarantined += s.quarantined;
  }
  return {
    commits_seen: recordsParsed,
    records_parsed: recordsParsed,
    clean,
    normalized,
    quarantined,
    facts_written: factsWritten === void 0 ? 0 : factsWritten,
    quarantined_written: quarantinedWritten === void 0 ? 0 : quarantinedWritten
  };
}

// src/fact/store.ts
var WRITE_COLUMNS = AUDIT_FACT_FIELDS.filter(function(f) {
  return f.name !== "fact_seq" && f.name !== "ingested_at";
}).map(function(f) {
  return f.name;
});
var FACT_SEQ_NAME = "audit_fact_seq";
var INSERT_SQL = "INSERT INTO audit_fact (fact_seq, " + WRITE_COLUMNS.join(", ") + ", ingested_at) VALUES (nextval(" + String.fromCharCode(39) + FACT_SEQ_NAME + String.fromCharCode(39) + "), " + WRITE_COLUMNS.map(function() {
  return "?";
}).join(", ") + ", current_timestamp)";
var duckdbModulePromise = null;
var DUCKDB_PINNED_VERSION = "1.5.5-r.5";
var selfHealAttempted = false;
function duckdbSurface() {
  if (process.env.MACRO_AUDIT_MCP_STDIO === "1") return "mcp";
  if (process.stdout.isTTY === true) return "cli-interactive";
  return "ci-unattended";
}
function isMusl() {
  try {
    const r = spawnSync("ldd", ["--version"], { encoding: "utf8", timeout: 5e3 });
    return /musl/i.test((r.stdout || "") + (r.stderr || ""));
  } catch {
    return false;
  }
}
function platformPackageSuffix() {
  const p = process.platform;
  const a = process.arch;
  if (p === "win32" || p === "darwin") return p + "-" + a;
  if (p === "linux") return "linux-" + a + (isMusl() ? "-musl" : "");
  return null;
}
function engineRoot() {
  let dir = dirname2(fileURLToPath2(import.meta.url));
  for (let i = 0; i < 8; i++) {
    const pj = join2(dir, "package.json");
    if (existsSync(pj)) {
      try {
        const j = JSON.parse(readFileSync2(pj, "utf8"));
        if (j && j.dependencies && j.dependencies["@duckdb/node-api"]) return dir;
      } catch {
      }
    }
    const up = dirname2(dir);
    if (up === dir) break;
    dir = up;
  }
  return dirname2(fileURLToPath2(import.meta.url));
}
function emitSelfHeal(ev) {
  console.error("DUCKDB-SELFHEAL " + JSON.stringify(ev));
}
function selfHealDuckdb() {
  if (selfHealAttempted) return { ok: false, detail: "already-attempted-once-per-process" };
  selfHealAttempted = true;
  const suffix = platformPackageSuffix();
  if (!suffix) return { ok: false, detail: "unsupported-platform:" + process.platform + "-" + process.arch };
  const root = engineRoot();
  const nodeApiPresent = existsSync(join2(root, "node_modules", "@duckdb", "node-api", "package.json"));
  const devCheckout = existsSync(join2(root, "package-lock.json"));
  const npmSpec = process.platform === "win32" ? { cmd: "cmd.exe", pre: ["/d", "/s", "/c", "npm"] } : { cmd: "npm", pre: [] };
  const pkgDir = join2(root, "node_modules", "@duckdb", "node-bindings-" + suffix);
  if (!nodeApiPresent) {
    const args = devCheckout ? ["install"] : ["install", "--omit=dev"];
    const r = spawnSync(npmSpec.cmd, npmSpec.pre.concat(args), { cwd: root, encoding: "utf8", timeout: 24e4 });
    if (r.status !== 0) {
      return { ok: false, detail: "npm-exit-" + String(r.status) + ":" + String(r.stderr || r.error || "").replace(/\s+/g, " ").slice(0, 140) };
    }
  } else {
    const stage = mkdtempSync(join2(root, ".duckdb-heal-"));
    try {
      const spec = "@duckdb/node-bindings-" + suffix + "@" + DUCKDB_PINNED_VERSION;
      const r = spawnSync(npmSpec.cmd, npmSpec.pre.concat(["pack", spec, "--pack-destination", stage]), { cwd: root, encoding: "utf8", timeout: 24e4 });
      if (r.status !== 0) {
        return { ok: false, detail: "npm-pack-exit-" + String(r.status) + ":" + String(r.stderr || r.error || "").replace(/\s+/g, " ").slice(0, 140) };
      }
      const tgz = readdirSync(stage).filter(function(f) {
        return f.slice(-4) === ".tgz";
      })[0];
      if (!tgz) {
        return { ok: false, detail: "npm-pack-no-artifact" };
      }
      const xdir = join2(stage, "x");
      mkdirSync(xdir, { recursive: true });
      const tr = spawnSync("tar", ["-xzf", tgz, "-C", "x"], { cwd: stage, encoding: "utf8", timeout: 12e4 });
      if (tr.status !== 0) {
        return { ok: false, detail: "tar-exit-" + String(tr.status) + ":" + String(tr.stderr || "").replace(/\s+/g, " ").slice(0, 140) };
      }
      rmSync(pkgDir, { recursive: true, force: true });
      mkdirSync(dirname2(pkgDir), { recursive: true });
      renameSync(join2(xdir, "package"), pkgDir);
    } finally {
      rmSync(stage, { recursive: true, force: true });
    }
  }
  let ver = null;
  try {
    ver = JSON.parse(readFileSync2(join2(pkgDir, "package.json"), "utf8")).version;
  } catch {
  }
  let nativeCount = 0;
  let sizeOk = false;
  if (existsSync(pkgDir)) {
    for (const f of readdirSync(pkgDir)) {
      if (/\.(node|so|dylib|dll)$/.test(f)) {
        nativeCount++;
        if (statSync(join2(pkgDir, f)).size > 1024 * 1024) sizeOk = true;
      }
    }
  }
  if (!(ver === DUCKDB_PINNED_VERSION && nativeCount > 0 && sizeOk)) {
    try {
      rmSync(pkgDir, { recursive: true, force: true });
    } catch {
    }
    return { ok: false, detail: "integrity-fail:ver=" + String(ver) + " native-files=" + nativeCount + " sizeOk=" + sizeOk };
  }
  return { ok: true, detail: "installed @duckdb/node-bindings-" + suffix + "@" + ver };
}
function unavailableMessage(surface, healDetail, orig) {
  const origMsg = String(orig && orig.message || orig).replace(/\s+/g, " ").slice(0, 120);
  const reason = healDetail !== null ? "\u81EA\u52A8\u8865\u62C9\u5931\u8D25\uFF08" + healDetail + "\uFF09" : "\u539F\u751F\u7ED1\u5B9A\u7F3A\u5931\uFF08" + origMsg + "\uFF09";
  return "DUCKDB-UNAVAILABLE: " + reason + "\uFF1B\u4FEE\u590D\u8DEF\u5F84=\u63D2\u4EF6\u76EE\u5F55\u6267\u884C `macro-audit doctor --fix`\uFF08\u81EA\u6108\u552F\u4E00\u663E\u5F0F\u4E3B\u8DEF\uFF09\u6216 `npm install --omit=dev`\uFF1B\u80FD\u529B\u8FB9\u754C=" + surface + " \u9762\u4E0D\u81EA\u52A8\u5B89\u88C5\uFF08\u907F\u514D\u65E0\u4EBA\u503C\u5B88/\u5BBF\u4E3B\u8FDB\u7A0B\u963B\u585E\uFF09\u2014\u2014\u65E0\u7F51\u7EDC\u65F6 facts/audit \u4E0D\u53EF\u7528\u3001\u5176\u4F59\u547D\u4EE4\u4E0D\u53D7\u5F71\u54CD\uFF1Bopt-in=\u8BBE MACRO_AUDIT_SELFHEAL=1 \u53EF\u4EE4\u672C\u8FDB\u7A0B\u81EA\u52A8\u8865\u62C9\uFF08MCP \u9762\u4F1A\u963B\u585E JSON-RPC \u6700\u957F 240s\uFF09";
}
function loadDuckdb() {
  if (!duckdbModulePromise) {
    duckdbModulePromise = import("@duckdb/node-api").catch(async function(e) {
      const surface = duckdbSurface();
      const trigger = surface === "cli-interactive" ? "auto" : process.env.MACRO_AUDIT_SELFHEAL === "1" ? "opt-in" : null;
      let healDetail = null;
      if (trigger !== null) {
        emitSelfHeal({ phase: "start", trigger, note: "DuckDB \u539F\u751F\u7ED1\u5B9A\u7F3A\u5931\u2014\u2014\u8865\u62C9\u7EA6 40MB \u6700\u957F 240s" + (trigger === "auto" ? "\uFF08Ctrl-C \u53EF\u4E2D\u65AD\uFF09" : "\uFF08opt-in \u751F\u6548\uFF0C\u963B\u585E\u672C\u8FDB\u7A0B\uFF09"), platform: process.platform + "-" + process.arch });
        const heal = selfHealDuckdb();
        healDetail = heal.detail;
        if (heal.ok) {
          try {
            const mod = createRequire(import.meta.url)("@duckdb/node-api");
            emitSelfHeal({ result: "success", trigger, detail: heal.detail, platform: process.platform + "-" + process.arch });
            return mod;
          } catch (e2) {
            e = e2;
            healDetail = heal.detail + "\uFF1BcreateRequire \u4ECD\u5931\u8D25";
          }
        }
        emitSelfHeal({ result: "fallback", trigger, detail: healDetail, platform: process.platform + "-" + process.arch });
      }
      duckdbModulePromise = null;
      throw new Error(unavailableMessage(surface, healDetail, e));
    });
  }
  return duckdbModulePromise;
}
function healDuckdbBinding() {
  emitSelfHeal({ phase: "start", trigger: "doctor-fix", note: "doctor --fix \u663E\u5F0F\u81EA\u6108\u2014\u2014\u8865\u62C9\u7EA6 40MB \u6700\u957F 240s", platform: process.platform + "-" + process.arch });
  const heal = selfHealDuckdb();
  if (!heal.ok) {
    emitSelfHeal({ result: "fallback", trigger: "doctor-fix", detail: heal.detail, platform: process.platform + "-" + process.arch });
    return heal;
  }
  let mod;
  try {
    mod = createRequire(import.meta.url)("@duckdb/node-api");
  } catch (e2) {
    emitSelfHeal({ result: "fallback", trigger: "doctor-fix", detail: heal.detail + "\uFF1BcreateRequire \u4ECD\u5931\u8D25", platform: process.platform + "-" + process.arch });
    return { ok: false, detail: heal.detail + "\uFF1BcreateRequire \u4ECD\u5931\u8D25" };
  }
  duckdbModulePromise = Promise.resolve(mod);
  emitSelfHeal({ result: "success", trigger: "doctor-fix", detail: heal.detail, platform: process.platform + "-" + process.arch });
  return heal;
}
var instanceOf = /* @__PURE__ */ new WeakMap();
function closeDuckdb(connection) {
  try {
    connection.closeSync();
  } finally {
    const inst = instanceOf.get(connection);
    if (inst) {
      instanceOf.delete(connection);
      inst.closeSync();
    }
  }
}
async function openWriter(dbPath) {
  const { DuckDBInstance, DuckDBConnection } = await loadDuckdb();
  const instance = await DuckDBInstance.create(dbPath, { access_mode: "READ_WRITE" });
  const connection = await DuckDBConnection.create(instance);
  instanceOf.set(connection, instance);
  await connection.run(SCHEMA_REGISTRY_DDL);
  await connection.run(AUDIT_FACT_DDL);
  await connection.run(QUARANTINE_LOG_DDL);
  await connection.run("CREATE SEQUENCE IF NOT EXISTS " + FACT_SEQ_NAME + " START 1");
  await connection.run("CREATE SEQUENCE IF NOT EXISTS " + QUARANTINE_SEQ_NAME + " START 1");
  await connection.run("INSERT INTO schema_registry (version, change_event, compatibility, description) SELECT 1, 'Registered', 'FULL', 'schema v0 append-only fact table' WHERE NOT EXISTS (SELECT 1 FROM schema_registry WHERE version = 1)");
  await connection.run("INSERT INTO schema_registry (version, change_event, compatibility, description) SELECT 2, 'Registered', 'BACKWARD', 'quarantine_log added: field-level pathology disposition ledger (#78 / ADR-0022 / D-106)' WHERE NOT EXISTS (SELECT 1 FROM schema_registry WHERE version = 2)");
  return connection;
}
async function openReader(dbPath) {
  const { DuckDBInstance, DuckDBConnection } = await loadDuckdb();
  const instance = await DuckDBInstance.create(dbPath, { access_mode: "READ_ONLY" });
  const connection = await DuckDBConnection.create(instance);
  instanceOf.set(connection, instance);
  return connection;
}
async function appendFact(connection, event) {
  assertAppendOnly(INSERT_SQL);
  const row = WRITE_COLUMNS.map(function(c) {
    if (c === "schema_version") {
      return SCHEMA_VERSION_V0;
    }
    const v = event[c];
    return v === void 0 ? null : v;
  });
  await connection.run(INSERT_SQL, row);
}
var QUARANTINE_SEQ_NAME = "quarantine_log_seq";
var QUARANTINE_INSERT_SQL = "INSERT INTO quarantine_log (q_seq, run_id, commit_sha, field_name, disposition, reason_code, raw_bytes_hex, is_trunc, original_length, sha256_full, collector, recorded_at) VALUES (nextval('" + QUARANTINE_SEQ_NAME + "'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING";
async function appendQuarantineEvent(connection, ev) {
  if (QUARANTINE_REASON_CODES.indexOf(ev.reason_code) < 0) {
    throw protocolCrashError("REASON-CODE-UNLISTED", "reason_code outside v1 vocabulary: " + ev.reason_code, {
      raw: ev.raw,
      crash_location: "fact/store.ts:appendQuarantineEvent",
      run_context: { repo_ref: null, run_id: ev.run_id, commit_sha: ev.commit_sha }
    });
  }
  const fp = rawBytesFingerprint(ev.raw);
  assertAppendOnly(QUARANTINE_INSERT_SQL);
  await connection.run(QUARANTINE_INSERT_SQL, [
    ev.run_id,
    ev.commit_sha,
    ev.field_name,
    ev.disposition,
    ev.reason_code,
    fp.raw_bytes_hex,
    fp.is_trunc,
    fp.original_length,
    fp.sha256_full,
    ev.collector,
    ev.recorded_at
  ]);
}
var AuditIoError = class extends Error {
  code = "AUDIT-IO-FAILURE";
  constructor(msg) {
    super(msg);
    this.name = "AuditIoError";
  }
};
function isAuditIoError(e) {
  return !!e && typeof e === "object" && e.code === "AUDIT-IO-FAILURE";
}
var IO_ERROR_RE = /IO Error|disk|lock|readonly|read-only|ENOSPC|EBUSY|EPERM|out of space|full/i;
function classifyWriteError(e) {
  const m = String(e.message || e || "");
  return IO_ERROR_RE.test(m) ? "io" : "constraint";
}
async function runInTransaction(connection, fn) {
  await connection.run("BEGIN TRANSACTION");
  try {
    const r = await fn();
    await connection.run("COMMIT");
    return r;
  } catch (e) {
    try {
      await connection.run("ROLLBACK");
    } catch (_) {
    }
    throw e;
  }
}
async function queryQuarantineCounts(connection, runId) {
  const sql = "SELECT field_name, disposition, COUNT(*) AS n FROM quarantine_log WHERE run_id = ? GROUP BY field_name, disposition";
  assertAppendOnly(sql);
  const res = await connection.run(sql, [runId]);
  const rows = await res.getRows();
  const out = {};
  for (const r of rows) {
    const field = String(r[0]);
    const disp = String(r[1]);
    const n = Number(r[2]);
    if (!out[field]) {
      out[field] = { normalized: 0, quarantined: 0 };
    }
    if (disp === "normalized") {
      out[field].normalized = n;
    } else if (disp === "quarantined") {
      out[field].quarantined = n;
    }
  }
  return out;
}

// src/doctor.ts
function worst(legs) {
  if (legs.some(function(l) {
    return l.status === "fail";
  })) {
    return "fail";
  }
  if (legs.some(function(l) {
    return l.status === "degraded";
  })) {
    return "degraded";
  }
  return "ok";
}
async function probeDuckdb(fix) {
  const db = join3(tmpdir(), "macro-audit-doctor-" + String(process.pid) + ".duckdb");
  try {
    const conn = await openWriter(db);
    try {
      await conn.run("SELECT 1");
    } catch {
    }
    try {
      closeDuckdb(conn);
    } catch {
    }
    return { leg: "duckdb", status: "ok", detail: "openWriter \u53EF\u5F00\u5E93\uFF08\u539F\u751F\u7ED1\u5B9A\u5728\u4F4D\uFF09" };
  } catch (e) {
    const msg = String(e && e.message || e);
    if (msg.indexOf("DUCKDB-UNAVAILABLE") === 0) {
      if (fix) {
        const heal = healDuckdbBinding();
        if (!heal.ok) {
          return { leg: "duckdb", status: "degraded", detail: "doctor --fix \u81EA\u6108\u672A\u7ADF\uFF1A" + heal.detail.slice(0, 120) };
        }
        try {
          const conn2 = await openWriter(db);
          try {
            await conn2.run("SELECT 1");
          } catch {
          }
          try {
            closeDuckdb(conn2);
          } catch {
          }
          return { leg: "duckdb", status: "ok", detail: "doctor --fix \u663E\u5F0F\u81EA\u6108\u6210\u529F\u2014\u2014" + heal.detail };
        } catch (e2) {
          return { leg: "duckdb", status: "fail", detail: "doctor --fix \u88C5\u6210\u529F\u4F46\u52A0\u8F7D\u5931\u8D25\uFF1A" + String(e2 && e2.message || e2).slice(0, 120) };
        }
      }
      return { leg: "duckdb", status: "degraded", detail: "DUCKDB-UNAVAILABLE \u7ED3\u6784\u5316\u56DE\u843D\uFF08\u5206\u5C42\u9762\u4E0D\u81EA\u52A8\u8865\u62C9\uFF1B\u4FEE\u590D=doctor --fix \u663E\u5F0F\u4E3B\u8DEF\uFF1B\u65E0\u7F51\u7EDC\u65F6 facts/audit \u4E0D\u53EF\u7528\u5176\u4F59\u547D\u4EE4\u4E0D\u53D7\u5F71\u54CD\uFF09" };
    }
    return { leg: "duckdb", status: "fail", detail: msg.slice(0, 160) };
  } finally {
    try {
      rmSync2(db, { force: true });
    } catch {
    }
  }
}
function probeGit() {
  const r = spawnSync2("git", ["--version"], { encoding: "utf8", timeout: 1e4 });
  if (r.status === 0) {
    return { leg: "git", status: "ok", detail: String(r.stdout || "").trim() };
  }
  return { leg: "git", status: "fail", detail: "git --version exit=" + String(r.status) + " " + String(r.error || r.stderr || "").replace(/\s+/g, " ").slice(0, 120) };
}
function probeUpstream() {
  const conf = process.platform === "win32" ? spawnSync2("cmd.exe", ["/d", "/s", "/c", "npm", "config", "get", "registry"], { encoding: "utf8", timeout: 1e4 }) : spawnSync2("npm", ["config", "get", "registry"], { encoding: "utf8", timeout: 1e4 });
  const configured = conf.status === 0 ? String(conf.stdout || "").trim() : "";
  const reg = /^https?:\/\//.test(configured) ? configured : "https://registry.npmjs.org/";
  return new Promise(function(resolve5) {
    const t0 = Date.now();
    const req = get(reg, { timeout: 5e3, method: "HEAD" }, function(res) {
      res.resume();
      resolve5({ leg: "upstream", status: "ok", detail: reg + " " + String(res.statusCode) + " " + String(Date.now() - t0) + "ms" });
    });
    req.on("timeout", function() {
      req.destroy();
      resolve5({ leg: "upstream", status: "degraded", detail: "registry HEAD timeout 5s\uFF08\u79BB\u7EBF\u9762\uFF1A\u81EA\u6108/\u4E0A\u6E38\u62C9\u53D6\u4E0D\u53EF\u7528\uFF0C\u672C\u5730\u547D\u4EE4\u4E0D\u53D7\u5F71\u54CD\uFF09" });
    });
    req.on("error", function(e) {
      resolve5({ leg: "upstream", status: "degraded", detail: "registry unreachable: " + String(e && e.message || e).slice(0, 120) });
    });
  });
}
function probeBindings() {
  const sfx = platformPackageSuffix();
  if (sfx === null) return { leg: "bindings", status: "degraded", detail: "\u672A\u77E5\u5E73\u53F0\u7EC4\u5408 " + process.platform + "-" + process.arch + "\u2014\u2014\u65E0\u5B98\u65B9\u7ED1\u5B9A\u6620\u5C04" };
  const dir = join3(engineRoot(), "node_modules", "@duckdb", "node-bindings-" + sfx);
  if (!existsSync2(dir)) {
    return { leg: "bindings", status: "degraded", detail: "\u7ED1\u5B9A\u5305\u7F3A\u5E2D @duckdb/node-bindings-" + sfx + "\u2014\u2014\u4FEE\u590D=doctor --fix \u6216 npm install --omit=dev" };
  }
  try {
    const v = JSON.parse(readFileSync3(join3(dir, "package.json"), "utf8")).version;
    return { leg: "bindings", status: "ok", detail: "@duckdb/node-bindings-" + sfx + "@" + String(v) + " \u5728\u76D8" };
  } catch (e) {
    return { leg: "bindings", status: "degraded", detail: "\u7ED1\u5B9A\u76EE\u5F55\u5728\u4F46 package.json \u4E0D\u53EF\u8BFB\u2014\u2014\u534A\u6210\u54C1\u9762\uFF0Cdoctor --fix \u91CD\u88C5" };
  }
}
async function runDoctor(opts) {
  const legs = [await probeDuckdb(!!(opts && opts.fix)), probeBindings(), probeGit(), await probeUpstream()];
  return { doctor: "1.0.0", legs, overall: worst(legs) };
}

// src/intake/intake.ts
import { createHash as createHash2 } from "node:crypto";
import { existsSync as existsSync3, mkdirSync as mkdirSync2, statSync as statSync2 } from "node:fs";
import { spawnSync as spawnSync3 } from "node:child_process";
import { dirname as dirname3, isAbsolute, join as join4, resolve } from "node:path";
var URL_SCHEMES = [
  /^https?:\/\//i,
  /^ssh:\/\//i,
  /^git:\/\//i,
  /^file:\/\//i,
  // 显式 URL 形态（file:// 仅用于离线/测试等价路径，不经网络）
  /^[A-Za-z0-9._-]+@[A-Za-z0-9._-]+:.+/
  // git@host:owner/repo
];
var OWNER_REPO_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._-]*$/;
function classifyRepoInput(input) {
  const s = (input || "").trim();
  if (!s) {
    throw intakeError("INVALID-INPUT", "empty repo input");
  }
  for (const re of URL_SCHEMES) {
    if (re.test(s)) {
      return { kind: "url", forcedLocal: false, original: s };
    }
  }
  if (s.startsWith("./") || s.startsWith("../") || s.startsWith(".\\") || s.startsWith("..\\")) {
    return { kind: "local", forcedLocal: true, original: s };
  }
  if (isAbsolute(s) || /^[A-Za-z]:[\\/]/.test(s) || s.startsWith("~")) {
    return { kind: "local", forcedLocal: false, original: s };
  }
  if (OWNER_REPO_RE.test(s)) {
    return { kind: "owner-repo", forcedLocal: false, original: s };
  }
  return { kind: "local", forcedLocal: false, original: s };
}
function intakeError(code, message) {
  const e = new Error(code + ": " + message);
  e.code = code;
  return e;
}
function git(args, cwd, timeoutMs) {
  const r = spawnSync3("git", args, { cwd, encoding: "utf8", timeout: timeoutMs, windowsHide: true });
  return { status: r.status, stdout: (r.stdout || "").trim(), stderr: (r.stderr || "").trim(), error: r.error };
}
function gitOk(args, cwd, timeoutMs) {
  const r = git(args, cwd, timeoutMs);
  if (r.error || r.status !== 0) {
    throw intakeError("GIT-FAILED", "git " + args.join(" ") + " :: " + (r.error ? String(r.error) : r.stderr || "exit " + r.status));
  }
  return r;
}
function isGitRepo(dir, timeoutMs = 3e4) {
  const r = git(["rev-parse", "--git-dir"], dir, timeoutMs);
  return !r.error && r.status === 0;
}
function isShallowRepo(dir, timeoutMs = 3e4) {
  const r = gitOk(["rev-parse", "--is-shallow-repository"], dir, timeoutMs);
  return r.stdout === "true";
}
function headSha(dir, timeoutMs = 3e4) {
  const r = gitOk(["rev-parse", "--verify", "HEAD"], dir, timeoutMs);
  return r.stdout;
}
function remoteOriginUrl(dir, timeoutMs) {
  const r = git(["config", "--local", "--get", "remote.origin.url"], dir, timeoutMs);
  return r.status === 0 ? r.stdout : "";
}
function sha256Short(text) {
  return createHash2("sha256").update(text).digest("hex").slice(0, 16);
}
function normalizeRepoUrlKey(url) {
  return url.trim().replace(/\/+$/, "").replace(/\.git$/i, "");
}
function snapshotFetchedAt(dir) {
  for (const p of [join4(dir, ".git", "FETCH_HEAD"), join4(dir, ".git"), dir]) {
    try {
      return statSync2(p).mtime.toISOString();
    } catch (e) {
    }
  }
  return null;
}
function cloneToIsolatedCache(url, cacheRoot, timeoutMs = 6e5, refresh = false) {
  const key = sha256Short(normalizeRepoUrlKey(url));
  const dir = join4(cacheRoot, "repos", key);
  if (existsSync3(dir)) {
    if (isGitRepo(dir, 3e4) && normalizeRepoUrlKey(remoteOriginUrl(dir, 3e4)) === normalizeRepoUrlKey(url)) {
      const shallow = isShallowRepo(dir, 3e4);
      if (shallow) {
        throw intakeError("SHALLOW-CLONE-REJECTED", "cached clone is shallow: " + dir);
      }
      if (!refresh) {
        return { dir, cloned: false, head_sha: headSha(dir, 3e4), shallow: false, snapshot_fetched_at: snapshotFetchedAt(dir), refreshed: false };
      }
      const noopHooksRefresh = join4(cacheRoot, "noop-hooks");
      gitOk(["-c", "core.hooksPath=" + noopHooksRefresh, "-c", "protocol.ext.allow=never", "fetch", "origin", "--prune"], dir, timeoutMs);
      let remoteHead = git(["rev-parse", "--verify", "origin/HEAD"], dir, 3e4);
      if (remoteHead.error || remoteHead.status !== 0 || !remoteHead.stdout) {
        const refs = git(["for-each-ref", "--format=%(refname:short)", "refs/remotes/origin"], dir, 3e4);
        const first = !refs.error && refs.status === 0 ? refs.stdout.split("\n").map(function(s) {
          return s.trim();
        }).filter(function(s) {
          return s && s !== "origin/HEAD";
        })[0] : null;
        remoteHead = first ? git(["rev-parse", "--verify", first], dir, 3e4) : remoteHead;
      }
      if (remoteHead.error || remoteHead.status !== 0 || !remoteHead.stdout) {
        throw intakeError("REFRESH-REMOTE-HEAD-UNRESOLVED", "origin/HEAD \u53CA refs/remotes/origin/* \u5747\u4E0D\u53EF\u89E3\u6790\uFF1A" + dir);
      }
      gitOk(["reset", "--hard", remoteHead.stdout], dir, timeoutMs);
      return { dir, cloned: false, head_sha: headSha(dir, 3e4), shallow: false, snapshot_fetched_at: snapshotFetchedAt(dir) || (/* @__PURE__ */ new Date()).toISOString(), refreshed: true };
    }
    throw intakeError("INTAKE-CACHE-COLLISION", "cache slot occupied by foreign content: " + dir);
  }
  mkdirSync2(dirname3(dir), { recursive: true });
  const noopHooks = join4(cacheRoot, "noop-hooks");
  mkdirSync2(noopHooks, { recursive: true });
  const r = git([
    "clone",
    "-c",
    "core.hooksPath=" + noopHooks,
    "-c",
    "protocol.ext.allow=never",
    "-c",
    "core.symlinks=false",
    url,
    dir
  ], void 0, timeoutMs);
  if (r.error || r.status !== 0) {
    throw intakeError("CLONE-FAILED", "git clone " + url + " :: " + (r.error ? String(r.error) : r.stderr || "exit " + r.status));
  }
  if (!isGitRepo(dir, 3e4)) {
    throw intakeError("CLONE-FAILED", "clone produced non-git dir: " + dir);
  }
  const head = headSha(dir, 3e4);
  if (isShallowRepo(dir, 3e4)) {
    throw intakeError("SHALLOW-CLONE-REJECTED", "clone is shallow (fetch-depth must be 0): " + dir);
  }
  return { dir, cloned: true, head_sha: head, shallow: false, snapshot_fetched_at: snapshotFetchedAt(dir) || (/* @__PURE__ */ new Date()).toISOString(), refreshed: false };
}
function repoAdd(input, opts = {}) {
  const cwd = opts.cwd || process.cwd();
  const timeoutMs = opts.cloneTimeoutMs || 6e5;
  const cls = classifyRepoInput(input);
  const base = {
    kind: cls.kind,
    input,
    remote_config_execution: "disabled",
    credentials: "local-git-credential-chain"
  };
  if (cls.kind === "url") {
    const cacheRoot = resolve(cwd, opts.cacheRoot || ".macro-audit-cache");
    const c = cloneToIsolatedCache(cls.original, cacheRoot, timeoutMs, opts.refresh === true);
    return {
      ...base,
      resolved_root: c.dir,
      url: cls.original,
      cache_dir: c.dir,
      cloned: c.cloned,
      head_sha: c.head_sha,
      shallow: false,
      full_depth_verified: true,
      snapshot_fetched_at: c.snapshot_fetched_at,
      cache_hit: !c.cloned,
      refreshed: c.refreshed
    };
  }
  if (cls.kind === "owner-repo") {
    const localCandidate = resolve(cwd, cls.original);
    if (existsSync3(localCandidate) && statSync2(localCandidate).isDirectory()) {
      return finishLocal({ ...base, resolved_root: localCandidate }, timeoutMs);
    }
    throw intakeError("OWNER-REPO-UNRESOLVED", cls.original + " \u672C\u5730\u4F18\u5148\u6D88\u6B67\u5931\u8D25\u2014\u2014\u663E\u5F0F URL\uFF08https/git@\uFF09\u624D\u5141\u8BB8 clone");
  }
  const localPath = resolve(cwd, cls.original);
  if (!existsSync3(localPath) || !statSync2(localPath).isDirectory()) {
    throw intakeError("PATH-NOT-FOUND", "local path not found: " + localPath);
  }
  return finishLocal({ ...base, resolved_root: localPath }, timeoutMs);
}
function finishLocal(result, timeoutMs) {
  if (!isGitRepo(result.resolved_root, timeoutMs)) {
    throw intakeError("NOT-A-GIT-REPO", "not a git repository: " + result.resolved_root);
  }
  if (isShallowRepo(result.resolved_root, timeoutMs)) {
    throw intakeError("SHALLOW-CLONE-REJECTED", "shallow local repository rejected: " + result.resolved_root);
  }
  return {
    ...result,
    url: null,
    cache_dir: null,
    cloned: false,
    head_sha: headSha(result.resolved_root, timeoutMs),
    shallow: false,
    full_depth_verified: true,
    snapshot_fetched_at: null,
    cache_hit: false,
    refreshed: false
  };
}

// src/demo/demo.ts
import { mkdtempSync as mkdtempSync2, mkdirSync as mkdirSync4, writeFileSync as writeFileSync2, readFileSync as readFileSync5, existsSync as existsSync5, rmSync as rmSync3 } from "node:fs";
import { tmpdir as tmpdir2 } from "node:os";
import { dirname as dirname5, join as join8, resolve as resolve2 } from "node:path";

// src/collect/collectors.ts
import { createHash as createHash3 } from "node:crypto";
function sha256Hex(input) {
  return createHash3("sha256").update(input, "utf8").digest("hex");
}
function uuidFromHex(hex) {
  const h = (hex + "00000000000000000000000000000000").slice(0, 32);
  return h.slice(0, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16) + "-" + h.slice(16, 20) + "-" + h.slice(20, 32);
}
function deriveBaggageId(ctx, dimension) {
  const parts = [ctx.repoRef, ctx.scale, "strategic", dimension === null ? "na" : dimension, ctx.runId];
  return sha256Hex(parts.join("|")).slice(0, 32);
}
function deriveFactId(collectorId, subjectRef, metric, valueJson, observedAt) {
  return uuidFromHex(sha256Hex([collectorId, subjectRef, metric, valueJson, observedAt].join("|")));
}
function toValueJson(value) {
  return JSON.stringify(value);
}
function makeFact(ctx, desc, subjectRef, evidenceRef, metric, value) {
  const valueJson = toValueJson(value);
  return {
    fact_id: deriveFactId(desc.id, subjectRef, metric, valueJson, ctx.observedAt),
    trace_id: ctx.traceId,
    baggage_id: deriveBaggageId(ctx, desc.dimension),
    scale: ctx.scale,
    quadrant: desc.quadrant,
    dimension: desc.dimension,
    collector_id: desc.id,
    repo_ref: ctx.repoRef,
    subject_ref: subjectRef,
    evidence_ref: evidenceRef,
    metric,
    value_json: valueJson,
    observed_at: ctx.observedAt
  };
}
function daysBetweenUtc(a, b) {
  const ta = Date.parse(a.slice(0, 10) + "T00:00:00Z");
  const tb = Date.parse(b.slice(0, 10) + "T00:00:00Z");
  if (!isFinite(ta) || !isFinite(tb)) {
    return NaN;
  }
  return Math.round((ta - tb) / 864e5);
}
var ADR_STRUCTURE_ID = "adr-structure@v1";
var ADR_STRUCTURE_FAMILY = "adr-structure";
var ADR_HEADER_FIELDS = ["Status", "Date", "Deciders", "Ledger"];
var ADR_SECTIONS = ["Context", "Decision", "Consequences", "Options"];
var ADR_FIVE_PIECE = ["Status", "Date", "Context", "Decision", "Consequences"];
var ADR_STRUCTURE_DESCRIPTOR = {
  id: ADR_STRUCTURE_ID,
  family: ADR_STRUCTURE_FAMILY,
  dimension: "S2",
  quadrant: "strategic"
};
function linesOf(text) {
  return text.split(/\r?\n/);
}
function parseHeaderFields(lines) {
  const out = {};
  let started = false;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (/^#\s+/.test(raw)) {
      started = true;
      continue;
    }
    if (!started) {
      continue;
    }
    if (/^##\s+/.test(raw)) {
      break;
    }
    const m = raw.match(/^-\s*([A-Za-z][A-Za-z ]*?)\s*:\s*(.*)$/);
    if (m) {
      const key = m[1].trim();
      if (!(key in out)) {
        out[key] = { value: m[2].trim(), line: i + 1 };
      }
    }
  }
  return out;
}
function parseSections(lines) {
  const out = {};
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^##\s+(.+?)\s*$/);
    if (!m) {
      continue;
    }
    let name = m[1].trim();
    if (/^considered\s+options$/i.test(name)) {
      name = "Options";
    }
    if (!(name in out)) {
      out[name] = { name, line: i + 1 };
    }
  }
  return out;
}
function findSupersede(lines) {
  let matches = 0;
  let line = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().indexOf("supersede") >= 0) {
      matches++;
      if (line === 0) {
        line = i + 1;
      }
    }
  }
  return { present: matches > 0, matches, line };
}
function evidenceFor(path, present, line) {
  return present && line > 0 ? path + "#L" + line : path;
}
function collectAdrStructure(input, ctx) {
  const out = [];
  for (const doc of input.documents) {
    const lines = linesOf(doc.text);
    const headers = parseHeaderFields(lines);
    const sections = parseSections(lines);
    for (const field of ADR_HEADER_FIELDS) {
      const hit = headers[field];
      const present = !!hit;
      const line = present ? hit.line : 0;
      out.push(makeFact(ctx, ADR_STRUCTURE_DESCRIPTOR, doc.path, evidenceFor(doc.path, present, line), "adr.header_field_present", {
        field,
        present,
        line
      }));
    }
    for (const section of ADR_SECTIONS) {
      const hit = sections[section];
      const present = !!hit;
      const line = present ? hit.line : 0;
      out.push(makeFact(ctx, ADR_STRUCTURE_DESCRIPTOR, doc.path, evidenceFor(doc.path, present, line), "adr.section_present", {
        section,
        present,
        line
      }));
    }
    const missing = [];
    let presentCount = 0;
    for (const item of ADR_FIVE_PIECE) {
      const has = item === "Status" || item === "Date" ? !!headers[item] : !!sections[item];
      if (has) {
        presentCount++;
      } else {
        missing.push(item);
      }
    }
    out.push(makeFact(ctx, ADR_STRUCTURE_DESCRIPTOR, doc.path, doc.path, "adr.five_piece_completeness", {
      present: presentCount,
      of: ADR_FIVE_PIECE.length,
      ratio: presentCount / ADR_FIVE_PIECE.length,
      missing
    }));
    const sup = findSupersede(lines);
    out.push(makeFact(ctx, ADR_STRUCTURE_DESCRIPTOR, doc.path, evidenceFor(doc.path, sup.present, sup.line), "adr.supersede_link_present", {
      present: sup.present,
      matches: sup.matches,
      line: sup.line
    }));
    const dateHit = headers["Date"];
    out.push(makeFact(ctx, ADR_STRUCTURE_DESCRIPTOR, doc.path, evidenceFor(doc.path, !!dateHit, dateHit ? dateHit.line : 0), "adr.decision_date", {
      date: dateHit ? dateHit.value : null
    }));
  }
  return out;
}
var ADR_STRUCTURE_V2_ID = "adr-structure@v2";
var ADR_STRUCTURE_V2_DESCRIPTOR = {
  id: ADR_STRUCTURE_V2_ID,
  family: ADR_STRUCTURE_FAMILY,
  dimension: "S2",
  quadrant: "strategic"
};
var ISO_DATE_V2 = /\b(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/;
function legInlineField(lines, name) {
  const dashRe = new RegExp("^[-*]\\s*" + name + "\\s*[:\uFF1A]", "i");
  const re = new RegExp("^(?:\\*\\*)?" + name + "(?:\\*\\*)?\\s*[:\uFF1A]\\s*(.*)$", "i");
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (raw.indexOf("#") === 0 || dashRe.test(raw)) {
      continue;
    }
    const m = raw.match(re);
    if (m) {
      const value = (m[1] || "").trim().replace(/\*\*$/, "").trim();
      return { value, line: i + 1, leg: "inline" };
    }
  }
  return null;
}
function legInlineIsoDate(lines) {
  const head = lines.slice(0, 60);
  const re = new RegExp(ISO_DATE_V2.source, "g");
  let best = null;
  for (let i = 0; i < head.length; i++) {
    for (const m of head[i].matchAll(re)) {
      if (!best || m[0] < best.value) {
        best = { value: m[0], line: i + 1 };
      }
    }
  }
  return best ? { value: best.value, line: best.line, leg: "inline-iso" } : null;
}
function resolveHeaderFieldV2(lines, dashHeaders, name, doc) {
  const dh = dashHeaders[name];
  if (dh) {
    return { value: dh.value, line: dh.line, leg: "dash" };
  }
  const ih = legInlineField(lines, name);
  if (ih) {
    return ih;
  }
  if (name === "Date") {
    const iso = legInlineIsoDate(lines);
    if (iso) {
      return iso;
    }
    if (doc.first_commit_date) {
      return { value: doc.first_commit_date.slice(0, 10), line: 0, leg: "git" };
    }
  }
  return null;
}
var SECTION_LABEL_V2 = {
  Context: ["Context"],
  Decision: ["Decision"],
  Consequences: ["Consequences"],
  Options: ["Considered Options", "Options"]
};
function legBareSection(lines, name) {
  const alts = SECTION_LABEL_V2[name] || [name];
  const re = new RegExp("^(?:[-*>]\\s*)?(?:\\*\\*)?(" + alts.join("|") + ")(?:\\*\\*)?\\s*[:\uFF1A]", "i");
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (raw.indexOf("#") === 0) {
      continue;
    }
    if (re.test(raw)) {
      return { line: i + 1 };
    }
  }
  return null;
}
function collectAdrStructureV2(input, ctx) {
  const out = [];
  for (const doc of input.documents) {
    const lines = linesOf(doc.text);
    const dashHeaders = parseHeaderFields(lines);
    const v1Sections = parseSections(lines);
    const hdrLegs = {};
    const secLegs = {};
    for (const field of ADR_HEADER_FIELDS) {
      const hit = resolveHeaderFieldV2(lines, dashHeaders, field, doc);
      hdrLegs[field] = hit;
      out.push(makeFact(ctx, ADR_STRUCTURE_V2_DESCRIPTOR, doc.path, evidenceFor(doc.path, !!hit, hit ? hit.line : 0), "adr.header_field_present", {
        field,
        present: !!hit,
        line: hit ? hit.line : 0,
        leg: hit ? hit.leg : null
      }));
    }
    for (const section of ADR_SECTIONS) {
      const v1h = v1Sections[section];
      const bare = legBareSection(lines, section);
      const hit = v1h ? { line: v1h.line, leg: "dash" } : bare ? { line: bare.line, leg: "inline" } : null;
      secLegs[section] = hit;
      out.push(makeFact(ctx, ADR_STRUCTURE_V2_DESCRIPTOR, doc.path, evidenceFor(doc.path, !!hit, hit ? hit.line : 0), "adr.section_present", {
        section,
        present: !!hit,
        line: hit ? hit.line : 0,
        leg: hit ? hit.leg : null
      }));
    }
    const missing = [];
    let presentCount = 0;
    for (const item of ADR_FIVE_PIECE) {
      const has = item === "Status" || item === "Date" ? !!hdrLegs[item] : !!secLegs[item];
      if (has) {
        presentCount++;
      } else {
        missing.push(item);
      }
    }
    out.push(makeFact(ctx, ADR_STRUCTURE_V2_DESCRIPTOR, doc.path, doc.path, "adr.five_piece_completeness", {
      present: presentCount,
      of: ADR_FIVE_PIECE.length,
      ratio: presentCount / ADR_FIVE_PIECE.length,
      missing
    }));
    const sup = findSupersede(lines);
    out.push(makeFact(ctx, ADR_STRUCTURE_V2_DESCRIPTOR, doc.path, evidenceFor(doc.path, sup.present, sup.line), "adr.supersede_link_present", {
      present: sup.present,
      matches: sup.matches,
      line: sup.line
    }));
    const dateHit = hdrLegs["Date"];
    out.push(makeFact(ctx, ADR_STRUCTURE_V2_DESCRIPTOR, doc.path, evidenceFor(doc.path, !!dateHit, dateHit ? dateHit.line : 0), "adr.decision_date", {
      date: dateHit ? dateHit.value : null,
      leg: dateHit ? dateHit.leg : null
    }));
  }
  return out;
}
var POSITIONING_ID = "positioning@v1";
var POSITIONING_FAMILY = "positioning";
var POSITIONING_DESCRIPTOR = {
  id: POSITIONING_ID,
  family: POSITIONING_FAMILY,
  dimension: "S1",
  quadrant: "strategic"
};
function tokenize(text) {
  const lower = text.toLowerCase();
  const out = [];
  const ascii = lower.match(/[a-z][a-z0-9_+-]*/g) || [];
  for (const w of ascii) {
    if (w.length >= 2) {
      out.push(w);
    }
  }
  const cjk = lower.match(/[\u4e00-\u9fff]+/g) || [];
  for (const run of cjk) {
    for (let i = 0; i + 1 < run.length; i++) {
      out.push(run.slice(i, i + 2));
    }
  }
  return out;
}
function countTokens(tokens) {
  const out = {};
  for (const t of tokens) {
    out[t] = (out[t] || 0) + 1;
  }
  return out;
}
function extractKeywords(text, topN, stopwords) {
  const counts = countTokens(tokenize(text));
  const stop = /* @__PURE__ */ new Set();
  for (const s of stopwords) {
    stop.add(s.toLowerCase());
  }
  const keys = Object.keys(counts).filter(function(k) {
    return !stop.has(k);
  });
  keys.sort(function(a, b) {
    const d = counts[b] - counts[a];
    if (d !== 0) {
      return d;
    }
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });
  return keys.slice(0, topN);
}
function collectPositioning(input, ctx) {
  const out = [];
  const deliveryText = input.deliveryDocs.map(function(d) {
    return d.text;
  }).join("\n");
  const deliveryCounts = countTokens(tokenize(deliveryText));
  for (const doc of input.intentDocs) {
    const intentCounts = countTokens(tokenize(doc.text));
    const keywords = extractKeywords(doc.text, input.topN, input.stopwords);
    const missed = [];
    let hit = 0;
    for (const k of keywords) {
      const deliveryCount = deliveryCounts[k] || 0;
      out.push(makeFact(ctx, POSITIONING_DESCRIPTOR, doc.path, doc.path, "positioning.keyword_hit", {
        keyword: k,
        hit: deliveryCount > 0,
        intent_count: intentCounts[k] || 0,
        delivery_count: deliveryCount
      }));
      if (deliveryCount > 0) {
        hit++;
      } else {
        missed.push(k);
      }
    }
    const total = keywords.length;
    out.push(makeFact(ctx, POSITIONING_DESCRIPTOR, doc.path, doc.path, "positioning.keyword_coverage", {
      keywords: total,
      hit,
      ratio: total === 0 ? 0 : hit / total,
      missed
    }));
    const firstMissed = missed.length > 0 ? missed[0] : null;
    out.push(makeFact(ctx, POSITIONING_DESCRIPTOR, doc.path, doc.path, "positioning.drift_anchor", {
      first_missed_keyword: firstMissed,
      anchor: firstMissed
    }));
  }
  return out;
}
var GITLOG_ID = "gitlog@v1";
var GITLOG_FAMILY = "gitlog";
var GITLOG_DESCRIPTOR = {
  id: GITLOG_ID,
  family: GITLOG_FAMILY,
  dimension: null,
  quadrant: "strategic"
};
function collectGitlog(input, ctx) {
  const out = [];
  for (const path of input.paths) {
    const touching = input.commits.filter(function(c) {
      return c.paths.indexOf(path) >= 0;
    });
    if (touching.length === 0) {
      continue;
    }
    const dated = touching.filter(function(c) {
      return c.date !== null;
    });
    const sorted = dated.slice().sort(function(a, b) {
      if (a.date < b.date) {
        return -1;
      }
      if (a.date > b.date) {
        return 1;
      }
      if (a.sha < b.sha) {
        return -1;
      }
      if (a.sha > b.sha) {
        return 1;
      }
      return 0;
    });
    const first = sorted.length > 0 ? sorted[0] : null;
    const anchorSha = first !== null ? first.sha : touching[0].sha;
    if (first !== null) {
      out.push(makeFact(ctx, GITLOG_DESCRIPTOR, path, first.sha, "git.first_commit", {
        path,
        sha: first.sha,
        date: first.date
      }));
    }
    out.push(makeFact(ctx, GITLOG_DESCRIPTOR, path, anchorSha, "git.commit_count", {
      path,
      count: touching.length
    }));
    const authorCounts = {};
    for (const c of touching) {
      authorCounts[c.author] = (authorCounts[c.author] || 0) + 1;
    }
    const authors = Object.keys(authorCounts).sort();
    let topAuthor = authors[0];
    for (const a of authors) {
      if (authorCounts[a] > authorCounts[topAuthor]) {
        topAuthor = a;
      }
    }
    out.push(makeFact(ctx, GITLOG_DESCRIPTOR, path, anchorSha, "git.author_matrix", {
      path,
      authors,
      top_author: topAuthor,
      top_share: authorCounts[topAuthor] / touching.length
    }));
    const adrDate = input.adrDates[path];
    if (adrDate && first !== null) {
      out.push(makeFact(ctx, GITLOG_DESCRIPTOR, path, first.sha, "git.adr_lag_days", {
        path,
        adr_date: adrDate,
        first_commit_date: first.date,
        delta_days: daysBetweenUtc(adrDate, first.date)
      }));
    }
  }
  return out;
}
var COLLECTOR_DESCRIPTORS = [
  ADR_STRUCTURE_DESCRIPTOR,
  POSITIONING_DESCRIPTOR,
  GITLOG_DESCRIPTOR
];
var COLLECTOR_FAMILIES = COLLECTOR_DESCRIPTORS.map(function(d) {
  return d.family;
});

// src/report/generate.ts
import { createHash as createHash4 } from "node:crypto";

// src/report/citation.ts
var UNVERIFIED_MARK = "\u26A0 unverified";
var NEG_WINDOW_PRE = 60;
var NEG_WINDOW_POST = 40;
var ATTRIBUTION_TAIL = 80;
var SPEECH_LOOKBACK = 24;
var EN_PRE_NEG_CUES = [
  "not",
  "no",
  "never",
  "n't",
  "cannot",
  "do not",
  "does not",
  "did not",
  "is not",
  "are not",
  "was not",
  "were not",
  "has not",
  "have not",
  "had not",
  "will not",
  "would not",
  "should not",
  "could not",
  "must not",
  "shall not",
  "without",
  "deny",
  "denies",
  "denied",
  "refute",
  "refutes",
  "refuted",
  "reject",
  "rejects",
  "rejected",
  "fail",
  "fails",
  "failed",
  "lack",
  "lacks",
  "lacked",
  "absence of",
  "free of",
  "devoid of",
  "instead of",
  "rather than",
  "far from",
  "hardly",
  "scarcely",
  "barely",
  "rarely",
  "seldom",
  "doubt",
  "doubts",
  "doubted",
  "unlikely",
  "impossible",
  "no evidence",
  "unsupported",
  "unproven",
  "unverified",
  "unconfirmed",
  "below",
  "under",
  "less than",
  "fewer than",
  "short of",
  "at most",
  "up to",
  "no more than",
  "other than",
  "contrary to",
  "lacking"
];
var EN_POST_NEG_CUES = [
  "not",
  "n't",
  "never",
  "cannot",
  "could not",
  "did not",
  "does not",
  "is not",
  "was not",
  "were not",
  "will not",
  "would not",
  "should not",
  "must not",
  "no longer",
  "no more",
  "false",
  "incorrect",
  "invalid",
  "absent",
  "missing",
  "unsupported",
  "untrue",
  "wrong",
  "denied",
  "refuted",
  "rejected",
  "unverified",
  "unconfirmed",
  "unproven",
  "questionable",
  "dubious",
  "insufficient",
  "inadequate",
  "unreached",
  "unmet",
  "lacking",
  "unreliable",
  "disproven",
  "disproved",
  "negated"
];
var EN_NON_ASSERT_CUES = [
  "for example",
  "e.g.",
  "for instance",
  "as an example",
  "as a hypothetical",
  "suppose",
  "supposing",
  "assuming",
  "imagine",
  "in theory",
  "hypothetical",
  "hypothetically",
  "fictional",
  "illustrative",
  "if it were"
];
var EN_PSEUDO_NEG = [
  "not only",
  "not just",
  "not merely",
  "not simply",
  "no doubt",
  "not necessarily",
  "not because",
  "notwithstanding",
  "cannot but",
  "not to mention",
  "make no mistake",
  "not for nothing",
  "whether or not",
  "no wonder",
  "nothing but",
  "none but",
  "nothing short of",
  "no less than",
  "not half bad",
  "more often than not",
  "not impossible",
  "not uncommon",
  "not unheard",
  "not without",
  "cannot help"
];
var CJK_PRE_NEG_CUES = [
  "\u4E0D",
  "\u6CA1",
  "\u672A",
  "\u65E0",
  "\u975E",
  "\u5426",
  "\u522B",
  "\u83AB",
  "\u52FF",
  "\u6BCB",
  "\u7F3A\u4E4F",
  "\u7F3A\u5C11",
  "\u7F3A\u5931",
  "\u6B20\u7F3A",
  "\u5426\u8BA4",
  "\u62D2\u7EDD",
  "\u53CD\u5BF9",
  "\u8D28\u7591",
  "\u5E76\u975E",
  "\u5E76\u65E0",
  "\u4E0D\u518D",
  "\u4E0D\u4F1A",
  "\u4E0D\u80FD",
  "\u4E0D\u53EF",
  "\u4E0D\u662F",
  "\u4E0D\u5BF9",
  "\u4E0D\u6210\u7ACB",
  "\u4E0D\u6B63\u786E",
  "\u4E0D\u5C5E\u5B9E",
  "\u6CA1\u6709",
  "\u672A\u6709",
  "\u672A\u80FD",
  "\u65E0\u6CD5",
  "\u65E0\u4ECE",
  "\u65E0\u6548",
  "\u672A\u89C1",
  "\u672A\u8FBE",
  "\u4E0D\u8DB3",
  "\u4E0D\u591F",
  "\u4E0D\u8FBE\u6807",
  "\u9C9C\u6709",
  "\u7F55\u89C1",
  "\u4F4E\u4E8E",
  "\u5F31\u4E8E",
  "\u4E0D\u53CA",
  "\u8FBE\u4E0D\u5230"
];
var CJK_POST_NEG_CUES = [
  "\u4E0D\u6210\u7ACB",
  "\u4E0D\u6B63\u786E",
  "\u4E0D\u5C5E\u5B9E",
  "\u4E0D\u5B9E",
  "\u4E0D\u5B58\u5728",
  "\u672A\u89C1",
  "\u672A\u80FD",
  "\u65E0\u6CD5",
  "\u65E0\u4ECE",
  "\u4E0D\u8DB3",
  "\u4E0D\u591F",
  "\u672A\u8FBE",
  "\u4E0D\u8FBE\u6807",
  "\u4F4E\u4E8E",
  "\u7F3A\u5E2D",
  "\u7F3A\u5931",
  "\u7F3A\u4E4F",
  "\u6B20\u7F3A",
  "\u4E3A\u5047",
  "\u4E3A\u8BEF",
  "\u7CFB\u8BEF",
  "\u6709\u8BEF",
  "\u5B58\u7591",
  "\u53EF\u7591",
  "\u4E0D\u53EF\u9760",
  "\u65E0\u6548",
  "\u5931\u771F"
];
var CJK_PSEUDO_NEG = [
  "\u4E0D\u5F97\u4E0D",
  "\u4E0D\u80FD\u4E0D",
  "\u4E0D\u53EF\u4E0D",
  "\u4E0D\u65E0",
  "\u672A\u5FC5\u4E0D",
  "\u5E76\u975E\u4E0D",
  "\u4E0D\u662F\u4E0D",
  "\u4E0D\u66FE\u4E0D",
  "\u672A\u5C1D\u4E0D",
  "\u672A\u66FE\u4E0D",
  "\u975E\u5E38",
  "\u975E\u51E1",
  "\u975E\u540C\u5C0F\u53EF",
  "\u65E0\u53EF\u539A\u975E",
  "\u975E\u4F46",
  "\u83AB\u975E",
  "\u5426\u5219",
  "\u65E0\u7F1D",
  "\u65E0\u9650",
  "\u65E0\u6BD4",
  "\u65E0\u4EF7",
  "\u65E0\u5F62",
  "\u65E0\u8272",
  "\u65E0\u58F0",
  "\u65E0\u6BD2",
  "\u65E0\u5BB3",
  "\u65E0\u526F\u4F5C\u7528",
  "\u65E0\u7F18\u65E0\u6545",
  "\u65E0\u975E",
  "\u65E0\u8BBA",
  "\u65E0\u8F9C",
  "\u65E0\u79C1",
  "\u65E0\u754F",
  "\u65E0\u7591",
  "\u6BEB\u65E0\u7591\u95EE",
  "\u522B\u4EBA",
  "\u522B\u5904",
  "\u522B\u7684",
  "\u522B\u6837",
  "\u83AB\u540D\u5176\u5999"
];
var CJK_NON_ASSERT_PRE_CUES = [
  "\u4F8B\u5982",
  "\u6BD4\u5982",
  "\u8B6C\u5982",
  "\u4E3E\u4F8B\u6765\u8BF4",
  "\u6BD4\u5982\u8BF4",
  "\u6253\u4E2A\u6BD4\u65B9",
  "\u5047\u8BBE",
  "\u5047\u5B9A",
  "\u5047\u5982",
  "\u5047\u82E5",
  "\u5018\u82E5",
  "\u5018\u4F7F",
  "\u8BD5\u60F3",
  "\u8BBE\u60F3",
  "\u5047\u60F3",
  "\u8BBE\u82E5"
];
var CJK_NON_ASSERT_POST_CUES = [
  "\u7406\u8BBA\u4E0A",
  "\u5728\u7406\u8BBA\u4E0A",
  "\u539F\u5219\u4E0A",
  "\u7EAF\u5C5E\u865A\u6784",
  "\u4EC5\u4E3A\u793A\u4F8B",
  "\u4EC5\u4F9B\u53C2\u8003"
];
var CJK_NON_ASSERT_PSEUDO = [
  "\u5047\u8BF4",
  "\u5047\u8BBE\u6027",
  "\u96F6\u5047\u8BBE",
  "\u5047\u8BBE\u68C0\u9A8C",
  "\u5DE5\u4F5C\u5047\u8BBE"
];
var CUE_TOKEN_SET = new Set(EN_PRE_NEG_CUES.concat(EN_POST_NEG_CUES, CJK_PRE_NEG_CUES, CJK_POST_NEG_CUES));
var QUOTE_PAIRS = [
  { open: "\u201C", close: "\u201D" },
  { open: "\u2018", close: "\u2019" },
  { open: "\u300C", close: "\u300D" },
  { open: "\u300E", close: "\u300F" },
  { open: '"', close: '"' }
];
var ATTRIBUTION_LEADS = [
  "\u636E\u79F0",
  "\u636E\u8BF4",
  "\u4F20\u8BF4",
  "\u636E\u6089",
  "\u6709\u62A5\u9053\u79F0",
  "\u6709\u62A5\u544A\u6307\u51FA",
  "\u7B2C\u4E09\u65B9\u79F0",
  "\u4ED6\u4EBA\u4E3B\u5F20",
  "\u5F15\u7528\u79F0",
  "\u5F15\u8FF0\u79F0",
  "\u6709\u6587\u732E\u79F0",
  "\u6709\u8D44\u6599\u79F0",
  "\u5916\u754C\u8BA4\u4E3A",
  "\u6709\u8BC4\u8BBA\u79F0",
  "\u6709\u7F51\u53CB\u79F0",
  "\u95FB\u79F0",
  "according to",
  "as reported by",
  "others claim",
  "they claim",
  "critics say",
  "allegedly",
  "purportedly",
  "it is claimed",
  "it is alleged",
  "sources say",
  "reports say"
];
var EN_SPEECH_CUES = [
  "said",
  "says",
  "say",
  "claimed",
  "claims",
  "claim",
  "argued",
  "argues",
  "argue",
  "asserted",
  "asserts",
  "stated",
  "states",
  "wrote",
  "writes",
  "alleges",
  "alleged",
  "quotes",
  "quoted",
  "according to",
  "per",
  "mentions",
  "mentioned",
  "notes",
  "noted",
  "cites",
  "cited",
  "reports",
  "reported",
  "warns",
  "warned",
  "suggests",
  "suggested",
  "implies",
  "implied",
  "describes",
  "described",
  "remarks",
  "remarked",
  "observes",
  "observed",
  "contends",
  "contended"
];
var CJK_SPEECH_CUES = [
  "\u8BF4",
  "\u79F0",
  "\u6307\u51FA",
  "\u8BA4\u4E3A",
  "\u58F0\u79F0",
  "\u65AD\u8A00",
  "\u5199\u9053",
  "\u8868\u793A",
  "\u5F3A\u8C03",
  "\u8D28\u7591",
  "\u5F15\u8FF0",
  "\u8BC4\u8BBA",
  "\u6279\u8BC4",
  "\u4E3B\u5F20",
  "\u95EE\u9053",
  "\u7B54\u66F0",
  "\u66F0",
  "\u63D0\u5230",
  "\u63D0\u53CA",
  "\u6697\u793A",
  "\u8B66\u544A",
  "\u6CE8\u660E",
  "\u8BB0\u8F7D",
  "\u8BB0\u5F55\u4E3A",
  "\u63CF\u8FF0\u4E3A"
];
var CJK_SPEECH_PSEUDO = [
  "\u540D\u79F0",
  "\u7B80\u79F0",
  "\u5BF9\u79F0",
  "\u4FD7\u79F0",
  "\u79F0\u547C",
  "\u79F0\u8C13",
  "\u7EDF\u79F0",
  "\u522B\u79F0",
  "\u7F8E\u79F0",
  "\u5C0F\u8BF4",
  "\u8BF4\u6559",
  "\u8BF4\u7B11",
  "\u8BF4\u6CD5",
  "\u56FE\u8BF4",
  "\u96BE\u8BF4",
  "\u4E0D\u5F97\u4E0D\u8BF4",
  "\u4E0D\u80FD\u8BF4",
  "\u4E0D\u5FC5\u8BF4",
  "\u6CA1\u8BDD\u8BF4",
  "\u65E0\u8BDD\u53EF\u8BF4",
  "\u5047\u8BF4",
  "\u4E3E\u4F8B\u6765\u8BF4",
  "\u6BD4\u5982\u8BF4"
];
function isWordChar(ch) {
  return ch !== void 0 && /[A-Za-z0-9_]/.test(ch);
}
function isClauseLike(s) {
  const words = s.trim().split(/\s+/).filter(function(w) {
    return w.length > 0;
  });
  const cjkCount = (s.match(/[一-鿿]/g) || []).length;
  return words.length >= 3 || words.length >= 2 && s.trim().length >= 12 || /[，。；：？！!?]/.test(s) || cjkCount >= 6;
}
function enCuesIn(text, cues, offset) {
  const lower = text.toLowerCase();
  const out = [];
  for (const cue of cues) {
    let i = 0;
    while (true) {
      i = lower.indexOf(cue, i);
      if (i < 0) {
        break;
      }
      const left = i > 0 ? lower[i - 1] : " ";
      const right = i + cue.length < lower.length ? lower[i + cue.length] : " ";
      const boundary = cue === "n't" ? !isWordChar(right) : !isWordChar(left) && !isWordChar(right);
      if (boundary) {
        out.push({ start: offset + i, end: offset + i + cue.length, kind: "cue" });
      }
      i += cue.length;
    }
  }
  return out;
}
function substrCuesIn(text, cues, offset) {
  const out = [];
  for (const cue of cues) {
    let i = 0;
    while (true) {
      i = text.indexOf(cue, i);
      if (i < 0) {
        break;
      }
      out.push({ start: offset + i, end: offset + i + cue.length, kind: "cue" });
      i += cue.length;
    }
  }
  return out;
}
function intersects(a, spans) {
  return spans.some(function(s) {
    return a.start < s.end && s.start < a.end;
  });
}
function stripContexts(excerpt) {
  const spans = [];
  const lower = excerpt.toLowerCase();
  const paired = new Array(excerpt.length).fill(false);
  for (const pair of QUOTE_PAIRS) {
    let pos = 0;
    while (true) {
      const o = excerpt.indexOf(pair.open, pos);
      if (o < 0) {
        break;
      }
      const c = excerpt.indexOf(pair.close, o + pair.open.length);
      if (c < 0) {
        break;
      }
      for (let k = o; k < c + pair.close.length; k++) {
        paired[k] = true;
      }
      const inner = excerpt.slice(o + pair.open.length, c);
      const lookback = lower.slice(Math.max(0, o - SPEECH_LOOKBACK), o);
      const hasSpeech = enCuesIn(lookback, EN_SPEECH_CUES, 0).length > 0 || CJK_SPEECH_CUES.some(function(cue) {
        return lookback.indexOf(cue) >= 0;
      });
      if (hasSpeech || isClauseLike(inner)) {
        spans.push({ start: o, end: c + pair.close.length, kind: "quoted" });
      }
      pos = c + pair.close.length;
    }
  }
  for (const lead of ATTRIBUTION_LEADS) {
    let i = 0;
    const leadLower = lead.toLowerCase();
    while (true) {
      i = lower.indexOf(leadLower, i);
      if (i < 0) {
        break;
      }
      let end = Math.min(excerpt.length, i + ATTRIBUTION_TAIL);
      const tail = excerpt.slice(i + leadLower.length, end);
      const cut = tail.search(/[。；！？\n;:]/);
      if (cut >= 0) {
        end = i + leadLower.length + cut + 1;
      }
      spans.push({ start: i, end, kind: "attributed" });
      i = end;
    }
  }
  const SPEECH_BOUNDARY = /[，,、。；;!！?？:：\n]|\b(but|however|though|although|whereas|while|yet)\b|但/;
  const speechCues = enCuesIn(excerpt, EN_SPEECH_CUES, 0).concat(substrCuesIn(excerpt, CJK_SPEECH_CUES, 0));
  const speechPseudo = substrCuesIn(excerpt, CJK_SPEECH_PSEUDO, 0);
  for (const sc of speechCues) {
    if (intersects(sc, spans) || intersects(sc, speechPseudo)) {
      continue;
    }
    let end = Math.min(excerpt.length, sc.start + ATTRIBUTION_TAIL);
    const tail = excerpt.slice(sc.end, end);
    const cut = tail.search(SPEECH_BOUNDARY);
    if (cut >= 0) {
      end = sc.end + cut;
    }
    spans.push({ start: sc.start, end, kind: "speech-quoted" });
  }
  const masked = new Array(excerpt.length).fill(false);
  for (const s of spans) {
    for (let k = s.start; k < s.end; k++) {
      masked[k] = true;
    }
  }
  const closers = /* @__PURE__ */ new Set(["\u201D", "\u2019", "\u300D", "\u300F"]);
  for (let k = 0; k < excerpt.length; k++) {
    if (masked[k]) {
      continue;
    }
    const ch = excerpt[k];
    if ((ch === "\u201C" || ch === "\u2018" || ch === "\u300C" || ch === "\u300E") && !paired[k]) {
      spans.push({ start: k, end: excerpt.length, kind: "unbalanced-quote" });
      break;
    }
    if (ch === '"' && !paired[k]) {
      spans.push({ start: 0, end: excerpt.length, kind: "unbalanced-quote" });
      break;
    }
    if (closers.has(ch) && !paired[k]) {
      spans.push({ start: 0, end: k + 1, kind: "unbalanced-quote" });
      break;
    }
  }
  const chars = excerpt.split("");
  for (const s of spans) {
    for (let k = s.start; k < s.end; k++) {
      chars[k] = " ";
    }
  }
  return { text: chars.join(""), spans };
}
function negationHits(maskedText, start, end, pseudoSpans, ctxPseudoSpans) {
  const hits = [];
  const preBase = Math.max(0, start - NEG_WINDOW_PRE);
  const preWin = maskedText.slice(preBase, start);
  const postWin = maskedText.slice(end, Math.min(maskedText.length, end + NEG_WINDOW_POST));
  const enPre = enCuesIn(preWin, EN_PRE_NEG_CUES, preBase).map(function(s) {
    return { start: s.start, end: s.end, kind: "pre-neg" };
  });
  const cjkPre = substrCuesIn(preWin, CJK_PRE_NEG_CUES, preBase).map(function(s) {
    return { start: s.start, end: s.end, kind: "pre-neg" };
  });
  const enPost = enCuesIn(postWin, EN_POST_NEG_CUES, end).map(function(s) {
    return { start: s.start, end: s.end, kind: "post-neg" };
  });
  const cjkPost = substrCuesIn(postWin, CJK_POST_NEG_CUES, end).map(function(s) {
    return { start: s.start, end: s.end, kind: "post-neg" };
  });
  const enPreCtx = enCuesIn(preWin, EN_NON_ASSERT_CUES, preBase).map(function(s) {
    return { start: s.start, end: s.end, kind: "pre-ctx" };
  });
  const cjkPreCtx = substrCuesIn(preWin, CJK_NON_ASSERT_PRE_CUES, preBase).map(function(s) {
    return { start: s.start, end: s.end, kind: "pre-ctx" };
  });
  const enPostCtx = enCuesIn(postWin, EN_NON_ASSERT_CUES, end).map(function(s) {
    return { start: s.start, end: s.end, kind: "post-ctx" };
  });
  const cjkPostCtx = substrCuesIn(postWin, CJK_NON_ASSERT_POST_CUES, end).map(function(s) {
    return { start: s.start, end: s.end, kind: "post-ctx" };
  });
  for (const h of enPre.concat(cjkPre, enPost, cjkPost, enPreCtx, cjkPreCtx, enPostCtx, cjkPostCtx)) {
    const isCtx = h.kind === "pre-ctx" || h.kind === "post-ctx";
    if (intersects(h, pseudoSpans) || isCtx && intersects(h, ctxPseudoSpans)) {
      continue;
    }
    let j = h.start - 1;
    while (j >= 0 && maskedText[j] === " ") {
      j--;
    }
    if (j >= 0 && maskedText[j] === "=") {
      continue;
    }
    hits.push(h);
  }
  return hits;
}
function pseudoSpansOf(maskedText) {
  const en = enCuesIn(maskedText, EN_PSEUDO_NEG, 0).map(function(s) {
    return { start: s.start, end: s.end, kind: "pseudo" };
  });
  const cjk = substrCuesIn(maskedText, CJK_PSEUDO_NEG, 0).map(function(s) {
    return { start: s.start, end: s.end, kind: "pseudo" };
  });
  return en.concat(cjk);
}
var stripMemo = /* @__PURE__ */ new WeakMap();
function checkCitationSupport(claim, evidence) {
  const flags = [];
  if (!evidence.grounded || evidence.excerpt.length === 0) {
    return { claim_id: claim.claim_id, evidence_id: evidence.evidence_id, support: "insufficient", matched_tokens: [], missing_tokens: claim.required_tokens.slice(), context_flags: flags, reason: "\u5F15\u6587\u672A\u843D\u5730\uFF08grounded=false \u6216 excerpt \u4E3A\u7A7A\uFF09\u2014\u2014\u6709\u5F15\u6587\u4E0D\u7B49\u4E8E\u652F\u6491\u7ED3\u8BBA" };
  }
  let cached = stripMemo.get(evidence);
  if (!cached) {
    const stripped2 = stripContexts(evidence.excerpt);
    const hay0 = stripped2.text.toLowerCase();
    cached = { text: stripped2.text, spans: stripped2.spans, pseudo: pseudoSpansOf(hay0), ctxPseudo: substrCuesIn(hay0, CJK_NON_ASSERT_PSEUDO, 0) };
    stripMemo.set(evidence, cached);
  }
  const stripped = { text: cached.text, spans: cached.spans };
  const hay = stripped.text.toLowerCase();
  const pseudoSpans = cached.pseudo;
  const ctxPseudo = cached.ctxPseudo;
  const matched = [];
  const missing = [];
  for (const tok of claim.required_tokens) {
    const needle = tok.toLowerCase();
    let pos = hay.indexOf(needle);
    let clean = false;
    const negCues = [];
    while (pos >= 0) {
      const hits = negationHits(hay, pos, pos + needle.length, pseudoSpans, ctxPseudo);
      const labelLike = CUE_TOKEN_SET.has(needle) && hay[pos + needle.length] === ":";
      if (hits.length === 0 && !labelLike) {
        clean = true;
        break;
      }
      if (labelLike) {
        negCues.push({ klass: "verdict-label", tag: "@" + pos });
      }
      for (const h of hits) {
        negCues.push({ klass: h.kind === "pre-ctx" || h.kind === "post-ctx" ? "non-asserted" : "negated", tag: h.kind + "@" + pos });
      }
      pos = hay.indexOf(needle, pos + 1);
    }
    if (clean) {
      matched.push(tok);
    } else {
      missing.push(tok);
      if (negCues.length === 0) {
        if (hay.indexOf(needle) < 0 && evidence.excerpt.toLowerCase().indexOf(needle) >= 0) {
          flags.push("context-stripped:" + tok);
        } else {
          flags.push("absent:" + tok);
        }
      } else {
        for (const c of negCues) {
          flags.push(c.klass + ":" + tok + ":" + c.tag);
        }
      }
    }
  }
  for (const s of stripped.spans) {
    flags.push(s.kind + "@" + s.start);
  }
  flags.sort();
  if (missing.length === 0) {
    return { claim_id: claim.claim_id, evidence_id: evidence.evidence_id, support: "supports", matched_tokens: matched, missing_tokens: [], context_flags: flags, reason: "\u5168\u90E8\u652F\u6491\u951A\u5728\u5F15\u6587\u539F\u6587\u4E2D\u9010\u5B57\u547D\u4E2D\uFF08\u8BED\u5883\u5265\u79BB\u540E presence-level \u6210\u7ACB\u2014\u2014\u975E\u8BED\u4E49\u8574\u542B\uFF09" };
  }
  return { claim_id: claim.claim_id, evidence_id: evidence.evidence_id, support: "insufficient", matched_tokens: matched, missing_tokens: missing, context_flags: flags, reason: "\u652F\u6491\u951A\u672A\u547D\u4E2D\u6216\u8BED\u5883\u5265\u79BB\uFF08\u5426\u5B9A/\u5F15\u8BED/\u5F52\u5C5E\u7A97\uFF09\uFF1A" + missing.join(", ") };
}
function checkAllCitations(claims, evidence) {
  const index = {};
  for (const e of evidence) {
    index[e.evidence_id] = e;
  }
  const out = [];
  for (const c of claims) {
    const e = index[c.evidence_id];
    if (!e) {
      out.push({ claim_id: c.claim_id, evidence_id: c.evidence_id, support: "insufficient", matched_tokens: [], missing_tokens: c.required_tokens.slice(), context_flags: [], reason: "\u5F15\u6587\u951A\u4E0D\u53EF\u89E3\u6790\uFF08evidence_id \u4E0D\u5B58\u5728\uFF09" });
      continue;
    }
    out.push(checkCitationSupport(c, e));
  }
  return out;
}

// src/report/narrative.ts
var NARRATIVE_SEAL_PROTOCOL = "ADR-0013-C/v1+narrative-seal/v1";
var BAND_PATTERNS = [
  { name: "dimension-band-assignment", re: new RegExp("\\bS[1-5]\\s*[:=\uFF1A\uFF1D]") },
  { name: "verdict-field-en", re: new RegExp("\\b(verdict|verdict_gate|overall_verdict|verdict_band)\\b", "i") },
  { name: "band-field-en", re: new RegExp("\\bband\\s*[:=\uFF1A\uFF1D]", "i") },
  { name: "verdict-word-assertion", re: new RegExp("\\b(supported|unsupported|insufficient)\\s*[:\uFF1A]", "i") },
  { name: "cjk-verdict-assertion", re: new RegExp("(\u88C1\u5B9A\u4E3A|\u88C1\u5B9A\uFF1A|\u5224\u7EA2|\u5224\u7EFF|\u5224\u9EC4|\u672C\u6BB5\u88C1\u5B9A|\u53D9\u4E8B\u88C1\u5B9A)") },
  { name: "quadrant-band-assertion", re: new RegExp("(\u8C61\u9650|\u7EF4\u5EA6)\\s*(\u88C1\u5B9A|\u5224\u5B9A)\\s*[:\uFF1A=\uFF1D]") }
];
function scanBandViolations(text) {
  const out = [];
  for (const p of BAND_PATTERNS) {
    const m = text.match(p.re);
    if (m) {
      out.push(p.name + " :: " + m[0]);
    }
  }
  return out;
}
function sealNarrative(section, evidence, sealedAt) {
  const checks = checkAllCitations(
    section.claims.map(function(c) {
      return { claim_id: c.claim_id, evidence_id: c.evidence_id, required_tokens: c.required_tokens };
    }),
    evidence
  );
  const bandViolations = scanBandViolations(section.text).concat(section.claims.map(function(c) {
    return scanBandViolations(c.text).map(function(v) {
      return c.claim_id + "/" + v;
    });
  }).reduce(function(a, b) {
    return a.concat(b);
  }, []));
  const modelIdOk = section.author === "host-agent" ? section.model_id !== null && section.model_id.length > 0 : true;
  let stamp = "sealed";
  if (bandViolations.length > 0 || !modelIdOk) {
    stamp = "rejected";
  } else if (checks.some(function(c) {
    return c.support !== "supports";
  })) {
    stamp = "sealed-with-gaps";
  }
  return {
    section_id: section.section_id,
    author: section.author,
    model_id: section.model_id,
    text: section.text,
    claims: section.claims.slice(),
    seal: {
      protocol: NARRATIVE_SEAL_PROTOCOL,
      sealed_at: sealedAt,
      stamp,
      checks,
      band_violations: bandViolations,
      model_id_recorded: modelIdOk
    }
  };
}
function sealNarrativeSections(sections, evidence, sealedAt) {
  return sections.map(function(s) {
    return sealNarrative(s, evidence, sealedAt);
  });
}
function renderTemplateNarrative(r) {
  const quads = r.quadrants.map(function(q) {
    return q.quadrant;
  }).join("\xB7");
  const text = [
    "\u672C\u6BB5\u4E3A kernel \u6A21\u677F\u53D9\u4E8B\uFF08degraded \u515C\u5E95\u4F4D " + UNVERIFIED_MARK + "\uFF09\uFF1A",
    "\u56DB\u8C61\u9650\u8986\u76D6 " + quads + "\uFF0C\u9010\u7EF4\u88C1\u5B9A\u89C1 C2 \u7ED3\u6784\u5316\u88C1\u51B3\u5757\uFF08\u672C\u6BB5\u4E0D\u91CD\u590D\u65AD\u8A00\u4EFB\u4F55\u5224\u5B9A\uFF09\uFF1B",
    "\u8BC1\u636E\u4E0E\u5F15\u6587\u652F\u6301\u5173\u7CFB\u89C1 C3\uFF1B\u964D\u7EA7\u539F\u56E0\uFF1A" + (r.degraded_reason ? r.degraded_reason : "\u672A\u58F0\u660E") + "\u3002",
    "\u6B63\u5F0F\u53D9\u4E8B\u5F52\u5BBF\u4E3B agent \u7ECF MCP facts \u53EA\u8BFB\u6295\u5F71\u53D6\u6570\u540E\u751F\u6210\u2014\u2014\u6A21\u677F\u53D9\u4E8B\u4E0D\u66FF\u4EE3\u4E4B\u3002"
  ].join("");
  return {
    section_id: "kernel-template-fallback",
    author: "kernel-template",
    model_id: null,
    text,
    claims: []
  };
}

// src/report/generate.ts
var REPORT_SKELETON_VERSION = "1.2.0";
var ADJUDICATION_PROTOCOL_VERSION = "ADR-0013-C/v1";
var REPORT_SKELETON = [
  { id: "C1", ordinal: 1, name: "\u6267\u884C\u6458\u8981", required_fields: ["report_id", "schema_version", "scale", "subject_ref", "generated_at", "correlation_key", "overall_verdict", "confidence", "headline", "top_findings", "degraded_mode", "stale_data_marker", "staleness_sla_seconds", "read_model_lag_seconds", "read_model_version", "fact_watermark_version"] },
  { id: "C2", ordinal: 2, name: "\u56DB\u8C61\u9650\u4E0E\u88C1\u51B3", required_fields: ["quadrants", "quadrant", "applicability", "verdict", "score", "confidence", "dimensions", "slice_fields", "verdict_gate.protocol_version", "verdict_gate.decision", "verdict_gate.evidence_flag", "verdict_gate.decided_at", "verdict_gate.override_reason", "verdict_gate.audit_ref", "conflict_markers"] },
  { id: "C3", ordinal: 3, name: "\u8BC1\u636E", required_fields: ["evidence_items", "evidence_id", "source", "locator", "claim", "grounded", "collected_at", "reproduce_cmd", "reproduce_absent_reason"] },
  { id: "C4", ordinal: 4, name: "\u884C\u52A8\u5EFA\u8BAE", required_fields: ["recommendations", "rec_id", "priority", "action", "rationale", "expected_impact", "effort", "verdict_gate_stamp", "evidence_refs", "degraded_note"] }
];
var CHAPTER_COUNT = REPORT_SKELETON.length;
function chapterHeading(ch) {
  return "## " + ch.id + " " + ch.name;
}
function firstFactIds(list) {
  return list.length > 0 ? [list[0].fact_id] : [];
}
function deriveOverallBand(entries) {
  let red = false;
  let inconclusive = false;
  for (const e of entries) {
    if (e.criterion_id.indexOf("PC-") === 0 && e.band !== "supported") {
      return "insufficient";
    }
    if (e.criterion_id.indexOf("NC-") === 0 && e.band !== "supported") {
      return "insufficient";
    }
    if (e.criterion_id.indexOf("TC-") === 0 && e.band === "unsupported") {
      red = true;
    }
    if (e.criterion_id.indexOf("TC-") === 0 && e.band === "insufficient") {
      inconclusive = true;
    }
  }
  if (red) {
    return "unsupported";
  }
  if (inconclusive) {
    return "insufficient";
  }
  return "supported";
}
function adjudicate(args) {
  const checks = checkAllCitations(args.claims, args.evidence);
  const human = args.human ? args.human : { status: "pending", adjudicator: "user", text: null, decided_at: null };
  return {
    protocol_version: ADJUDICATION_PROTOCOL_VERSION,
    decided_at: args.decided_at,
    overall: deriveOverallBand(args.entries),
    entries: args.entries.slice(),
    human,
    citation_checks: checks
  };
}
var CONTENT_DIGEST_CANONICALIZATION = "json_utf8_entries_then_citation_checks";
function buildReceipt(args) {
  const sorted = args.fact_ids.slice().sort();
  const adjParts = [];
  for (const e of args.adjudication.entries) {
    adjParts.push(e.criterion_id + "=" + e.band);
  }
  const NL4 = String.fromCharCode(10);
  const digestInput = JSON.stringify(args.adjudication.entries) + NL4 + JSON.stringify(args.adjudication.citation_checks);
  const contentDigest = createHash4("sha256").update(digestInput, "utf8").digest("hex");
  const payload = [
    "facts:" + sorted.join(","),
    "adj:" + adjParts.join(","),
    "checks:" + args.adjudication.citation_checks.map(function(c) {
      return c.claim_id + "=" + c.support;
    }).join(","),
    "content_digest:" + contentDigest,
    "issued_at:" + args.issued_at,
    "commit:" + args.commit_anchor,
    "tree:" + args.tree_anchor,
    "gate_ref:" + args.gate_ref.prereg_commit + "|" + args.gate_ref.criteria_path + "|" + args.gate_ref.basis_path + "|" + args.gate_ref.criterion_ids.join(","),
    "degraded:" + (args.degraded ? "1" : "0")
  ].join(NL4);
  const chain = createHash4("sha256").update(payload, "utf8").digest("hex");
  const receiptId = "RCP-" + chain.slice(0, 16);
  let mark = "RECEIPT " + receiptId + " chain=" + chain.slice(0, 32) + " content=" + contentDigest.slice(0, 16) + " facts=" + args.fact_ids.length + " adjudications=" + args.adjudication.entries.length + " issued_at=" + args.issued_at + " commit=" + args.commit_anchor + " tree=" + args.tree_anchor.slice(0, 12);
  if (args.degraded) {
    mark = mark + " " + UNVERIFIED_MARK;
  }
  return {
    receipt_id: receiptId,
    chain_hash: chain,
    issued_at: args.issued_at,
    commit_anchor: args.commit_anchor,
    tree_anchor: args.tree_anchor,
    content_digest: { algo: "sha256", value: contentDigest, canonicalization: CONTENT_DIGEST_CANONICALIZATION },
    gate_ref: { prereg_commit: args.gate_ref.prereg_commit, criteria_path: args.gate_ref.criteria_path, basis_path: args.gate_ref.basis_path, criterion_ids: args.gate_ref.criterion_ids.slice() },
    fact_count: args.fact_ids.length,
    adjudication_count: args.adjudication.entries.length,
    degraded: args.degraded,
    mark
  };
}
function buildReport(input) {
  const narrativeInput = (input.narrative_sections || []).slice();
  if (input.degraded && narrativeInput.length === 0) {
    narrativeInput.push(renderTemplateNarrative({ quadrants: input.quadrants.slice(), degraded_reason: input.degraded_reason }));
  }
  const adjudication = adjudicate({
    entries: input.adjudication_entries,
    claims: input.claims,
    evidence: input.evidence,
    decided_at: input.decided_at,
    human: input.human
  });
  const intakeHealth = input.intake_health !== void 0 ? input.intake_health : null;
  const escalation = intakeHealth ? intakeEscalation(intakeHealth.fields) : "none";
  if (escalation !== "none" && adjudication.overall !== "unsupported") {
    adjudication.overall = "unsupported";
  }
  const verdict = { band: adjudication.overall, reason_class: deriveReasonClass(adjudication.overall, escalation) };
  const receipt = buildReceipt({
    fact_ids: input.fact_ids,
    adjudication,
    issued_at: input.decided_at,
    commit_anchor: input.commit_anchor,
    tree_anchor: input.tree_anchor,
    gate_ref: input.gate_ref,
    degraded: input.degraded
  });
  receipt.verdict = { band: verdict.band, reason_class: verdict.reason_class };
  return {
    report_id: input.report_id,
    schema_version: input.schema_version ? input.schema_version : REPORT_SKELETON_VERSION,
    stability: input.stability !== void 0 ? input.stability : null,
    capabilities: input.capabilities ? input.capabilities.slice() : [],
    scale: input.scale,
    subject_ref: input.subject_ref,
    generated_at: input.generated_at,
    correlation_key: { trace_id: input.trace_id, baggage_id: input.baggage_id },
    overall_verdict: adjudication.overall,
    confidence: input.confidence,
    headline: input.headline,
    top_findings: input.top_findings.slice(),
    degraded_mode: input.degraded,
    degraded_reason: input.degraded_reason,
    stale: input.stale,
    fact_ids: input.fact_ids.slice(),
    evidence: input.evidence.slice(),
    claims: input.claims.slice(),
    quadrants: input.quadrants.slice(),
    recommendations: input.recommendations.slice(),
    adjudication,
    receipt,
    verdict,
    intake_health: intakeHealth,
    preview_disclosure: input.preview_disclosure ? input.preview_disclosure : null,
    narrative_sections: sealNarrativeSections(narrativeInput, input.evidence, input.decided_at)
  };
}
function renderMarkdown(r) {
  const out = [];
  out.push("# " + r.report_id + " \u2014 " + r.scale + " \u9996\u62A5\uFF08" + r.subject_ref + "\uFF09");
  out.push("> " + r.receipt.mark);
  out.push(">");
  out.push("> \u9AA8\u67B6 " + r.schema_version + "\uFF08\u7AE0\u987A\u5E8F\u9501\u5B9A\uFF0CADR-0006\uFF09\xB7 \u88C1\u5B9A\u534F\u8BAE " + r.adjudication.protocol_version + " \xB7 \u751F\u6210\u4E8E " + r.generated_at);
  if (r.stability !== null || r.capabilities.length > 0) {
    out.push("> - stability: " + (r.stability !== null ? r.stability : "unspecified") + (r.capabilities.length > 0 ? " \xB7 capabilities: " + r.capabilities.join(", ") : ""));
  }
  if (r.degraded_mode) {
    out.push(">");
    out.push("> \u964D\u7EA7\u4EA7\u51FA\uFF1A" + (r.degraded_reason ? r.degraded_reason : "\u672A\u58F0\u660E") + " " + UNVERIFIED_MARK);
  }
  if (r.preview_disclosure) {
    out.push(">");
    out.push("> \u62AB\u9732\u5757\uFF08preview \u6807\u6CE8\u8BDA\u5B9E = \u51B3\u7B56\u672C\u4F53\uFF0CADR-0017\uFF1B\u673A\u5668\u53EF\u8BFB\u5B57\u6BB5\u89C1\u4FA7\u8F66 preview_disclosure\uFF09");
    out.push("> - capability: " + r.preview_disclosure.capability_label);
    out.push("> - calibration_scope: " + r.preview_disclosure.calibration_scope);
    out.push("> - structural_limitations: " + r.preview_disclosure.structural_limitations.join("\uFF1B"));
    out.push("> - not_in_preview: " + r.preview_disclosure.not_in_preview.join(" / "));
  }
  out.push("");
  for (const ch of REPORT_SKELETON) {
    out.push(chapterHeading(ch));
    out.push("");
    if (ch.id === "C1") {
      out.push("- report_id: " + r.report_id);
      out.push("- schema_version: " + r.schema_version);
      out.push("- scale: " + r.scale);
      out.push("- subject_ref: " + r.subject_ref);
      out.push("- generated_at: " + r.generated_at);
      out.push("- correlation_key: trace_id=" + r.correlation_key.trace_id + " baggage_id=" + r.correlation_key.baggage_id);
      out.push("- overall_verdict: " + r.overall_verdict);
      out.push("- confidence: " + r.confidence);
      out.push("- headline: " + r.headline);
      out.push("- degraded_mode: " + r.degraded_mode);
      out.push("- stale_data_marker: " + r.stale.marker + "\uFF08SLA " + r.stale.sla_seconds + "s / \u5B9E\u6D4B\u5EF6\u8FDF " + r.stale.lag_seconds + "s\uFF09");
      out.push("- read_model_version: " + r.stale.read_model_version + " \xB7 fact_watermark_version: " + r.stale.fact_watermark_version);
      out.push("- top_findings: " + r.top_findings.join(", "));
      out.push("- fact_ids: " + r.fact_ids.length + " \u6761\uFF08\u6E05\u5355\u89C1\u4FA7\u8F66 JSON\uFF09");
    } else if (ch.id === "C2") {
      for (const q of r.quadrants) {
        out.push("### " + q.quadrant + "\uFF08applicability=" + q.applicability + "\uFF09");
        out.push("- verdict: " + q.verdict + " \xB7 score: " + (q.score === null ? "n/a" : String(q.score)) + " \xB7 confidence: " + q.confidence);
        out.push("- dimensions: " + q.dimensions.join(", "));
        out.push("- slice_fields: " + JSON.stringify(q.slice_fields));
        out.push("- conflict_markers: " + (q.conflict_markers.length === 0 ? "(none)" : q.conflict_markers.join(", ")));
        out.push("- verdict_gate: " + q.verdict_gate.protocol_version + " / " + q.verdict_gate.decision + " / evidence_flag=" + q.verdict_gate.evidence_flag + " / decided_at=" + q.verdict_gate.decided_at + " / audit_ref=" + q.verdict_gate.audit_ref);
        out.push("");
      }
      out.push("#### \u7ED3\u6784\u5316\u88C1\u51B3\u5757\uFF08agent \u53EF\u6D88\u8D39\uFF09");
      out.push("- protocol_version: " + r.adjudication.protocol_version);
      out.push("- overall: " + r.adjudication.overall + " \xB7 decided_at: " + r.adjudication.decided_at);
      for (const e of r.adjudication.entries) {
        out.push("- " + e.criterion_id + ": " + e.band + " | basis=" + e.basis_refs.join("+") + " | facts=" + (e.anchored_fact_ids.length === 0 ? "(none)" : e.anchored_fact_ids.join(",")) + " | evidence=" + (e.anchored_evidence_ids.length === 0 ? "(none)" : e.anchored_evidence_ids.join(",")) + " | " + e.rationale);
      }
      out.push("- human_adjudication: " + r.adjudication.human.status + "\uFF08\u88C1\u5B9A\u4ECD\u7531\u4EBA\u505A\uFF0C\u89C1 B5\uFF09");
      if (r.narrative_sections.length > 0) {
        out.push("#### \u53D9\u4E8B\u6BB5\uFF08\u5BBF\u4E3B agent \u751F\u6210/kernel \u76D6\u7AE0\uFF1B\u53D9\u4E8B\u9762\u4E0D\u643A\u5E26\u88C1\u51B3 band\u2014\u2014\u7EA2\u7EBF D-053/ADR-0013\uFF09");
        for (const ns of r.narrative_sections) {
          const grounded = ns.seal.checks.filter(function(c) {
            return c.support === "supports";
          }).length;
          out.push("- [" + ns.section_id + "] author=" + ns.author + " model_id=" + (ns.model_id ? ns.model_id : "(none)") + " stamp=" + ns.seal.stamp + " grounded=" + grounded + "/" + ns.seal.checks.length);
          out.push("  - text: " + ns.text);
          for (const ck of ns.seal.checks) {
            out.push("  - " + ck.claim_id + " -> " + ck.evidence_id + ": " + ck.support + "\uFF08matched=" + ck.matched_tokens.join("|") + " missing=" + ck.missing_tokens.join("|") + "\uFF09" + ck.reason);
          }
          if (ns.seal.band_violations.length > 0) {
            out.push("  - band_violations: " + ns.seal.band_violations.join("\uFF1B"));
          }
        }
      }
    } else if (ch.id === "C3") {
      for (const e of r.evidence) {
        out.push("### " + e.evidence_id + " \u2014 " + e.source + " @ " + e.locator);
        out.push("- claim: " + e.claim);
        out.push("- grounded: " + e.grounded + " \xB7 collected_at: " + e.collected_at);
        out.push("- reproduce_cmd: " + (e.reproduce_cmd.length > 0 ? e.reproduce_cmd : "(absent: " + (e.reproduce_absent_reason ? e.reproduce_absent_reason : "\u672A\u58F0\u660E") + ")"));
        out.push("- \u5F15\u6587\u539F\u6587: " + (e.excerpt.length > 0 ? e.excerpt : "\uFF08\u7F3A\u5931 \u2014\u2014 " + UNVERIFIED_MARK + "\uFF09"));
        out.push("");
      }
      out.push("#### \u5F15\u6587\u2192\u7ED3\u8BBA\u652F\u6301\u5173\u7CFB\u6821\u9A8C");
      for (const c of r.adjudication.citation_checks) {
        out.push("- " + c.claim_id + " -> " + c.evidence_id + ": " + c.support + "\uFF08matched=" + c.matched_tokens.join("|") + " missing=" + c.missing_tokens.join("|") + "\uFF09" + c.reason);
      }
    } else if (ch.id === "C4") {
      for (const rec of r.recommendations) {
        out.push("### " + rec.rec_id + " [" + rec.priority + "] " + rec.action);
        out.push("- rationale: " + rec.rationale);
        out.push("- expected_impact: " + rec.expected_impact + " \xB7 effort: " + rec.effort);
        out.push("- verdict_gate_stamp: " + rec.verdict_gate_stamp);
        out.push("- evidence_refs: " + rec.evidence_refs.join(", "));
        out.push("- degraded_note: " + (rec.degraded_note ? rec.degraded_note : "(none)"));
        out.push("");
      }
    }
    out.push("");
  }
  out.push("## Intake Health");
  out.push("");
  out.push("- \u5951\u7EA6\uFF1AADR-0022 \u8FDD\u7EA6\u4E24\u7EA7\u5904\u7F6E\u2014\u2014\u534F\u8BAE\u7EA7\u8FDD\u7EA6 fail-fast\uFF08\u5D29\u6E83\u6876\u5DE5\u4EF6\uFF09\uFF0C\u5B57\u6BB5\u7EA7\u75C5\u6001=quarantine \u6876\u9694\u79BB\uFF08\u5224\u5B9A/\u5904\u7F6E\u786C\u5206\u754C\uFF09");
  if (r.intake_health === null) {
    out.push("- \u6444\u5165\u65E0\u75C5\u6001\u58F0\u660E\uFF1Aquarantined=0 \xB7 normalized=0\uFF08\u63A5\u7EBF\u5B57\u6BB5\u672A\u4F9B\u7ED9 intake_health\u2014\u2014\u540C\u5F62\u9AA8\u67B6\u8D1F\u58F0\u660E\uFF0C\u8BC1\u636E\u7F3A\u5E2D\u2260\u8BC1\u636E\u4E3A\u96F6\uFF09");
  } else {
    const ih = r.intake_health;
    for (const f of ih.fields) {
      const eq = f.clean + f.normalized + f.quarantined === f.total ? "\u6052\u7B49\u5F0F=PASS" : "\u6052\u7B49\u5F0F=MISMATCH";
      out.push("- field " + f.field_name + ": total=" + f.total + " clean=" + f.clean + " normalized=" + f.normalized + " quarantined=" + f.quarantined + "\uFF08" + eq + "\uFF09");
    }
    out.push("- affected_commits\uFF08quarantined \u53BB\u91CD\uFF09: " + ih.affected_commits);
    out.push("- quarantine_log.recorded_at\uFF08\u5199\u5165\u65F6\u70B9\u5217\uFF09: " + (ih.recorded_at === null ? "NULL\uFF08\u951A\u75C5\u6001\u2192\u89C2\u6D4B\u65F6\u70B9\u4E0D\u53EF\u5F97\uFF0C\u975E\u300C\u5F00\u653E\u5F0F\u300D\u7F3A\u7701\uFF1B\u5217\u7EA7\u8BED\u4E49\u89C1 schema \u6CE8\u8BB0\uFF09" : ih.recorded_at));
    const totalCommits = ih.fields.filter(function(f) {
      return f.field_name === "committer_date";
    })[0];
    out.push("- \u6D3E\u751F\u7EDF\u8BA1\u6392\u9664\u58F0\u660E\uFF1A\u65E5\u671F\u6D3E\u751F\u6307\u6807 over " + String((totalCommits ? totalCommits.total : 0) - ih.excluded_commits) + " commits\uFF08quarantined \u6392\u9664 " + ih.excluded_commits + "\uFF1Bquarantined \u65E5\u671F commit \u7981\u5165 first_commit/adr_lag \u6D3E\u751F\uFF09");
    out.push("- \u9608\u503C\u7EAA\u5F8B\uFF1A\u5355\u5B57\u6BB5 quarantined/total > " + ih.threshold_ratio + " \u2192 run \u7EA7\u88C1\u5B9A\u5347\u7EA7 unsupported\uFF1Bescalation=" + ih.escalation);
    if (ih.quarantined_rows.length === 0) {
      out.push("- quarantined rows: \u65E0\uFF08\u6444\u5165\u65E0\u75C5\u6001=\u9634\u6027\u81EA\u8BC1\uFF09");
    } else {
      out.push("- quarantined-only SHA \u8868\uFF08sha | field | reason_code | raw_echo \u622A\u65AD\u5448\u73B0\uFF09\uFF1A");
      out.push("");
      out.push("  | sha | field | reason_code | raw_echo |");
      out.push("  | --- | --- | --- | --- |");
      for (const row of ih.quarantined_rows) {
        out.push("  | " + row.commit_sha + " | " + row.field_name + " | " + row.reason_code + " | " + row.raw_echo + " |");
      }
      out.push("");
    }
  }
  out.push("");
  return out.join(String.fromCharCode(10));
}
function toSidecar(r) {
  return {
    schema_version: r.schema_version,
    report_id: r.report_id,
    verdict: r.verdict,
    intake_health: r.intake_health,
    stability: r.stability,
    capabilities: r.capabilities.slice(),
    scale: r.scale,
    subject_ref: r.subject_ref,
    generated_at: r.generated_at,
    correlation_key: r.correlation_key,
    receipt: r.receipt,
    overall_verdict: r.overall_verdict,
    confidence: r.confidence,
    degraded_mode: r.degraded_mode,
    degraded_reason: r.degraded_reason,
    stale: r.stale,
    skeleton: REPORT_SKELETON.map(function(ch) {
      return { id: ch.id, ordinal: ch.ordinal, name: ch.name, required_fields: ch.required_fields };
    }),
    fact_ids: r.fact_ids,
    adjudication: r.adjudication,
    citation_checks: r.adjudication.citation_checks,
    evidence: r.evidence,
    quadrants: r.quadrants,
    recommendations: r.recommendations,
    preview_disclosure: r.preview_disclosure,
    narrative_sections: r.narrative_sections,
    machine_contract: {
      citation_anchor_format: "evidence_id + source + locator\uFF08\u4E09\u8005\u9F50\u5907\u5373\u4E3A\u53EF\u89E3\u6790\u5F15\u6587\u951A\uFF09",
      verdict_enum: ["supported", "unsupported", "insufficient"],
      verdict_reason_class_enum: VERDICT_REASON_CLASSES.slice(),
      human_adjudication_status: r.adjudication.human.status,
      narrative_seal_protocol: NARRATIVE_SEAL_PROTOCOL
    }
  };
}
function renderSidecar(r) {
  return JSON.stringify(toSidecar(r), null, 2);
}
function degradeReport(r, reason) {
  const evidence = r.evidence.map(function(e) {
    return {
      evidence_id: e.evidence_id,
      source: e.source,
      locator: e.locator,
      claim: e.claim,
      grounded: false,
      collected_at: e.collected_at,
      reproduce_cmd: "",
      reproduce_absent_reason: reason,
      required_tokens: e.required_tokens,
      excerpt: ""
    };
  });
  const entries = r.adjudication.entries.map(function(e) {
    return {
      criterion_id: e.criterion_id,
      band: "insufficient",
      basis_refs: ["B1", "B4"],
      anchored_fact_ids: [],
      anchored_evidence_ids: [],
      decided_at: e.decided_at,
      rationale: "\u964D\u7EA7\uFF1A" + reason
    };
  });
  const adjudication = adjudicate({
    entries,
    claims: r.claims,
    evidence,
    decided_at: r.adjudication.decided_at,
    human: r.adjudication.human
  });
  const receipt = buildReceipt({
    fact_ids: [],
    adjudication,
    issued_at: r.receipt.issued_at,
    commit_anchor: r.receipt.commit_anchor,
    tree_anchor: r.receipt.tree_anchor,
    gate_ref: r.receipt.gate_ref,
    degraded: true
  });
  const out = {
    report_id: r.report_id + "-degraded",
    schema_version: r.schema_version,
    stability: r.stability,
    capabilities: r.capabilities.slice(),
    scale: r.scale,
    subject_ref: r.subject_ref,
    generated_at: r.generated_at,
    correlation_key: r.correlation_key,
    overall_verdict: "insufficient",
    confidence: 0,
    headline: r.headline,
    top_findings: r.top_findings.slice(),
    degraded_mode: true,
    degraded_reason: reason,
    stale: { marker: "unknown", sla_seconds: r.stale.sla_seconds, lag_seconds: r.stale.lag_seconds, read_model_version: r.stale.read_model_version, fact_watermark_version: r.stale.fact_watermark_version },
    fact_ids: [],
    evidence,
    claims: r.claims.slice(),
    quadrants: r.quadrants.map(function(q) {
      return {
        quadrant: q.quadrant,
        applicability: q.applicability,
        verdict: "insufficient",
        score: null,
        confidence: 0,
        dimensions: q.dimensions,
        slice_fields: q.slice_fields,
        verdict_gate: {
          protocol_version: q.verdict_gate.protocol_version,
          decision: "insufficient",
          evidence_flag: false,
          decided_at: q.verdict_gate.decided_at,
          override_reason: reason,
          audit_ref: q.verdict_gate.audit_ref
        },
        conflict_markers: q.conflict_markers.concat(["degraded"])
      };
    }),
    recommendations: r.recommendations.map(function(rec) {
      return {
        rec_id: rec.rec_id,
        priority: rec.priority,
        action: rec.action,
        rationale: rec.rationale,
        expected_impact: rec.expected_impact,
        effort: rec.effort,
        verdict_gate_stamp: "insufficient " + UNVERIFIED_MARK,
        evidence_refs: rec.evidence_refs,
        degraded_note: "\u964D\u7EA7\u4EA7\u51FA\uFF1A" + reason + " " + UNVERIFIED_MARK
      };
    }),
    adjudication,
    receipt,
    verdict: { band: "insufficient", reason_class: "evidence_insufficient" },
    intake_health: r.intake_health,
    preview_disclosure: r.preview_disclosure,
    narrative_sections: []
  };
  const hostKept = r.narrative_sections.map(function(s) {
    return { section_id: s.section_id, author: s.author, model_id: s.model_id, text: s.text, claims: s.claims.slice() };
  });
  out.narrative_sections = sealNarrativeSections(hostKept.concat([renderTemplateNarrative(out)]), out.evidence, out.adjudication.decided_at);
  return out;
}

// src/demo/fixture-generator.ts
import { mkdirSync as mkdirSync3, writeFileSync } from "node:fs";
import { spawnSync as spawnSync4 } from "node:child_process";
import { dirname as dirname4, join as join5 } from "node:path";
var FIXTURE_GENERATOR_VERSION = "1.0.0";
var FIXTURE_GENERATOR_ID = "fixture-generator@" + FIXTURE_GENERATOR_VERSION;
var FIXTURE_AUTHOR_NAME = "Fixture Bot";
var FIXTURE_AUTHOR_EMAIL = "fixture@macro-audit.invalid";
function gitEnv(date) {
  const env = { ...process.env, GIT_AUTHOR_NAME: FIXTURE_AUTHOR_NAME, GIT_AUTHOR_EMAIL: FIXTURE_AUTHOR_EMAIL, GIT_COMMITTER_NAME: FIXTURE_AUTHOR_NAME, GIT_COMMITTER_EMAIL: FIXTURE_AUTHOR_EMAIL };
  env["GIT_CONFIG_NOSYSTEM"] = "1";
  env["GIT_CONFIG_GLOBAL"] = "";
  env["GIT_CONFIG_SYSTEM"] = "";
  if (date) {
    env["GIT_AUTHOR_DATE"] = date;
    env["GIT_COMMITTER_DATE"] = date;
  }
  return env;
}
function git2(args, cwd, date) {
  const noopHooks = join5(cwd, ".git", "noop-hooks");
  const r = spawnSync4("git", ["-c", "core.hooksPath=" + noopHooks].concat(args), { cwd, encoding: "utf8", env: gitEnv(date), windowsHide: true });
  if (r.error || r.status !== 0) {
    throw new Error("FIXTURE-GIT-FAILED: git " + args.join(" ") + " :: " + (r.error ? String(r.error) : r.stderr || "exit " + r.status));
  }
  return (r.stdout || "").trim();
}
function generateFixtureRepo(def, targetDir) {
  if (!def || def.kind !== "fixture-definition" || def.synthetic !== true) {
    throw new Error("FIXTURE-DEF-INVALID: kind/synthetic \u5951\u7EA6\u7F3A\u5931\uFF08synthetic \u6807\u8BB0\u4E3A\u786C\u5951\u7EA6\uFF0CD-038\uFF09");
  }
  if (def.generator !== FIXTURE_GENERATOR_ID) {
    throw new Error("FIXTURE-DEF-INVALID: generator \u5B57\u6BB5\u987B\u4E3A " + FIXTURE_GENERATOR_ID + "\uFF08got " + String(def.generator) + "\uFF09");
  }
  mkdirSync3(targetDir, { recursive: true });
  git2(["init", "-q", "-b", def.repo.default_branch], targetDir, null);
  let mergeCommits = 0;
  const seenBranches = /* @__PURE__ */ new Set([def.repo.default_branch]);
  const tags = [];
  for (const step of def.repo.steps) {
    if (step.type === "commit") {
      if (step.branch) {
        if (!seenBranches.has(step.branch)) {
          throw new Error("FIXTURE-STEP-INVALID: commit \u5F15\u672A\u5EFA\u5206\u652F " + step.branch);
        }
        git2(["checkout", "-q", step.branch], targetDir, null);
      }
      for (const f of step.files) {
        const p = join5(targetDir, f.path);
        mkdirSync3(dirname4(p), { recursive: true });
        writeFileSync(p, f.content, "utf8");
      }
      git2(["add", "-A"], targetDir, null);
      git2(["commit", "-q", "--no-gpg-sign", "-m", step.message], targetDir, step.date);
    } else if (step.type === "branch") {
      git2(["branch", step.name, step.from ? step.from : "HEAD"], targetDir, null);
      seenBranches.add(step.name);
    } else if (step.type === "merge") {
      if (!seenBranches.has(step.branch)) {
        throw new Error("FIXTURE-STEP-INVALID: merge \u5F15\u672A\u5EFA\u5206\u652F " + step.branch);
      }
      git2(["checkout", "-q", step.into], targetDir, null);
      git2(["merge", "-q", "--no-ff", "--no-edit", "-m", step.message, step.branch], targetDir, step.date);
      mergeCommits++;
    } else if (step.type === "tag") {
      git2(["tag", step.name, step.at ? step.at : "HEAD"], targetDir, null);
      tags.push(step.name);
    }
  }
  git2(["checkout", "-q", def.repo.default_branch], targetDir, null);
  const head = git2(["rev-parse", "--verify", "HEAD"], targetDir, null);
  const tree = git2(["rev-parse", "HEAD^{tree}"], targetDir, null);
  const count = Number(git2(["rev-list", "--count", "HEAD"], targetDir, null));
  const branches = git2(["branch", "--format=%(refname:short)"], targetDir, null).split("\n").filter(Boolean);
  return { dir: targetDir, name: def.repo.name, head_sha: head, tree_sha: tree, commit_count: count, branches, tags, merge_commits: mergeCommits };
}

// src/audit/macro-b.ts
import { readFileSync as readFileSync4, readdirSync as readdirSync2, existsSync as existsSync4 } from "node:fs";
import { join as join7 } from "node:path";
import { execFileSync } from "node:child_process";

// src/upstream/codelore.ts
import { spawnSync as spawnSync5 } from "node:child_process";
import { lstatSync, realpathSync } from "node:fs";
import { join as join6, relative } from "node:path";

// src/fact/subject.ts
var ABSOLUTE_RE = /^([A-Za-z]:[\\/]|\\|\/\/|\/)/;
function normalizeSubjectPath(raw) {
  const warnings = [];
  if (typeof raw !== "string") {
    return { ok: false, subject: null, reason: "non-string", warnings };
  }
  if (raw.trim() !== raw) {
    warnings.push("trimmed");
  }
  let s = raw.trim();
  if (s.length === 0) {
    return { ok: false, subject: null, reason: "empty", warnings };
  }
  if (s.indexOf(String.fromCharCode(0)) >= 0) {
    return { ok: false, subject: null, reason: "nul-byte", warnings };
  }
  if (ABSOLUTE_RE.test(s)) {
    return { ok: false, subject: null, reason: "absolute", warnings };
  }
  if (s.indexOf(String.fromCharCode(92)) >= 0) {
    warnings.push("backslash-normalized");
    s = s.split(String.fromCharCode(92)).join("/");
  }
  const segs = s.split("/");
  const kept = [];
  for (const seg of segs) {
    if (seg === "..") {
      return { ok: false, subject: null, reason: "dotdot-segment", warnings };
    }
    if (seg === "") {
      if (segs.length > 1) {
        warnings.push("empty-segment-dropped");
      }
      continue;
    }
    if (seg === ".") {
      warnings.push("dot-segment-dropped");
      continue;
    }
    kept.push(seg);
  }
  if (kept.length === 0) {
    return { ok: false, subject: null, reason: "empty-after-normalize", warnings };
  }
  let out = kept.join("/");
  const nfc = out.normalize("NFC");
  if (nfc !== out) {
    warnings.push("nfc-normalized");
    out = nfc;
  }
  return { ok: true, subject: out, reason: null, warnings };
}
function detectCaseOnlyConflicts(subjects) {
  const buckets = /* @__PURE__ */ new Map();
  for (const s of subjects) {
    const k = s.toLowerCase();
    const arr = buckets.get(k) || [];
    if (arr.indexOf(s) < 0) {
      arr.push(s);
      buckets.set(k, arr);
    }
  }
  const pairs = [];
  for (const arr of buckets.values()) {
    if (arr.length > 1) {
      const sorted = arr.slice().sort();
      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          pairs.push([sorted[i], sorted[j]]);
        }
      }
    }
  }
  pairs.sort(function(a, b) {
    return a[0] + "|" + a[1] < b[0] + "|" + b[1] ? -1 : 1;
  });
  return { pairs };
}

// src/upstream/codelore.ts
var CODELORE_ADAPTER_ID = "codelore-adapter@v1";
var CODELORE_FAMILY = "upstream-codelore";
var CODELORE_PINNED_VERSION = "0.28.0";
var CODELORE_DESCRIPTOR = {
  id: CODELORE_ADAPTER_ID,
  family: CODELORE_FAMILY,
  dimension: null,
  // 防腐层故意留白（ADR-0014）——维度映射见 docs/upstream-dimension-map.md（D-078）
  quadrant: "strategic"
};
function resolveCodelore(binary) {
  const bin = binary || "codelore";
  const r = spawnSync5(bin, ["--version"], { encoding: "utf8" });
  if (r.error || r.status !== 0) {
    return { strategy: "binary-discovery", binary: bin, version: null, pinned: false, error: String(r.error || "exit " + r.status) };
  }
  const m = (r.stdout || "").match(/codelore\s+(\d+\.\d+\.\d+)/i);
  const version = m ? m[1] : null;
  return { strategy: "binary-discovery", binary: bin, version, pinned: version === CODELORE_PINNED_VERSION, error: version ? null : "version-parse-failed" };
}
function pushResolutionFact(out, ctx, res) {
  out.push(makeFact(ctx, CODELORE_DESCRIPTOR, "codelore", "codelore", "upstream.resolution", {
    strategy: res.strategy,
    binary: res.binary,
    version: res.version,
    pinned_version: CODELORE_PINNED_VERSION,
    pinned: res.pinned,
    error: res.error
  }));
}
function microBCtx(ctx) {
  return { runId: ctx.runId, traceId: ctx.traceId, repoRef: ctx.repoRef, scale: "Micro-B", observedAt: ctx.observedAt };
}
function runText(binary, args, cwd) {
  const r = spawnSync5(binary, args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return { ok: !r.error && r.status === 0, stdout: r.stdout || "", stderr: r.stderr || "", status: r.status };
}
var CODELORE_BATCH1_FACETS = [
  { analysis: "revisions", group: "evolution", extraArgs: [] },
  { analysis: "abs-churn", group: "evolution", extraArgs: [] },
  { analysis: "entity-churn", group: "evolution", extraArgs: [] },
  { analysis: "author-churn", group: "evolution", extraArgs: [] },
  { analysis: "hotspot-velocity", group: "evolution", extraArgs: [] },
  { analysis: "code-age", group: "evolution", extraArgs: ["--age-time-now", "2026-09-15"] },
  { analysis: "stale-code", group: "evolution", extraArgs: [] },
  { analysis: "architecture-trend", group: "evolution", extraArgs: [] },
  { analysis: "health-trend", group: "evolution", extraArgs: [] },
  { analysis: "lead-time", group: "evolution", extraArgs: [] },
  { analysis: "release-cadence", group: "evolution", extraArgs: [] },
  { analysis: "messages", group: "evolution", extraArgs: ["-e", "(?i)(fix|feat|docs)"] },
  { analysis: "god-classes", group: "s3", extraArgs: [] },
  { analysis: "architecture-metrics", group: "s3", extraArgs: [] },
  { analysis: "dependency-cycles", group: "s3", extraArgs: [] },
  { analysis: "modularity-violations", group: "s3", extraArgs: [] },
  { analysis: "instability", group: "s3", extraArgs: [] },
  { analysis: "architecture-roles", group: "s3", extraArgs: [] },
  { analysis: "ownership", group: "s5", extraArgs: [] },
  { analysis: "entity-ownership", group: "s5", extraArgs: [] },
  { analysis: "bus-factor", group: "s5", extraArgs: [] },
  { analysis: "main-dev", group: "s5", extraArgs: [] },
  { analysis: "main-dev-by-revs", group: "s5", extraArgs: [] },
  { analysis: "main-dev-by-deletions", group: "s5", extraArgs: [] },
  { analysis: "knowledge-islands", group: "s5", extraArgs: [] },
  { analysis: "communication", group: "s5", extraArgs: [] },
  { analysis: "coordination-needs", group: "s5", extraArgs: [] },
  { analysis: "team-composition", group: "s5", extraArgs: [] },
  { analysis: "marginal-owner-risk", group: "s5", extraArgs: [] },
  { analysis: "pair-programming", group: "s5", extraArgs: [] }
];
var CODELORE_BEHAVIOR_FACETS = [
  { analysis: "hotspots", group: "behavior", extraArgs: [] },
  { analysis: "coupling", group: "behavior", extraArgs: [] },
  { analysis: "function-hotspots", group: "behavior", extraArgs: [] }
];
function codeloreAnalysisArgs(spec, repoRoot) {
  return ["analyze", "--analysis", spec.analysis, "--format", "json", "--repo", repoRoot].concat(spec.extraArgs);
}
function runCodeloreAnalysis(binary, spec, repoRoot) {
  const r = runText(binary, codeloreAnalysisArgs(spec, repoRoot), repoRoot);
  return { ok: r.ok, status: r.status, stdout: r.stdout, stderrTail: r.stderr.slice(-400) };
}
function parseJsonRows(text) {
  const arr = JSON.parse(text);
  if (!Array.isArray(arr)) {
    throw new Error("analysis output is not an array");
  }
  for (const row of arr) {
    if (row === null || typeof row !== "object" || Array.isArray(row)) {
      throw new Error("analysis row shape drift: expected plain object row");
    }
  }
  return arr;
}
function facetColumns(rows) {
  return rows.length > 0 ? Object.keys(rows[0]) : [];
}
function collectCodeloreFacets(input, ctx) {
  const out = [];
  const bin = input.binary || "codelore";
  const resolve5 = input.resolver || resolveCodelore;
  const runner = input.runner || runCodeloreAnalysis;
  const res = resolve5(bin);
  pushResolutionFact(out, ctx, res);
  if (res.error || !res.pinned) {
    return out;
  }
  const facets = input.facets || CODELORE_BATCH1_FACETS;
  const emittedSubjects = [];
  for (const spec of facets) {
    const evidence = "codelore " + codeloreAnalysisArgs(spec, input.repoRoot).join(" ");
    const run = runner(bin, spec, input.repoRoot);
    if (!run.ok) {
      out.push(makeFact(ctx, CODELORE_DESCRIPTOR, spec.analysis, evidence, "codelore.facet_error", {
        analysis: spec.analysis,
        group: spec.group,
        status: run.status,
        stderr_tail: run.stderrTail
      }));
      continue;
    }
    let rows;
    try {
      rows = parseJsonRows(run.stdout);
    } catch (e) {
      out.push(makeFact(ctx, CODELORE_DESCRIPTOR, spec.analysis, evidence, "codelore.facet_parse_error", {
        analysis: spec.analysis,
        group: spec.group,
        message: String(e.message)
      }));
      continue;
    }
    const emitStat = emitPerFileFacts(rows, spec, evidence, microBCtx(ctx), input.repoRoot, input.subjectProbe || defaultSubjectPathProbe, out);
    emittedSubjects.push.apply(emittedSubjects, emitStat.subjects);
    out.push(makeFact(ctx, CODELORE_DESCRIPTOR, spec.analysis, evidence, "codelore.facet_rows", {
      analysis: spec.analysis,
      group: spec.group,
      format: "json",
      extra_args: spec.extraArgs,
      role: "raw_evidence",
      per_file_emitted: emitStat.emitted,
      columns: facetColumns(rows),
      row_count: rows.length,
      rows
    }));
  }
  const conflicts = detectCaseOnlyConflicts(emittedSubjects);
  if (conflicts.pairs.length > 0) {
    out.push(makeFact(microBCtx(ctx), CODELORE_DESCRIPTOR, "codelore", "subject-normalizer", "codelore.subject_case_conflict", {
      pairs: conflicts.pairs,
      host_platform: process.platform,
      note: "case-only \u51B2\u7A81=\u771F\u5B9E\u4E0D\u540C\u6587\u4EF6\u4FDD\u7559\u5B57\u9762\u4E0D\u6298\u53E0\uFF08CVE-2021-21300 \u5148\u4F8B\uFF09\uFF1B\u5927\u5C0F\u5199\u4E0D\u654F\u611F\u6587\u4EF6\u7CFB\u7EDF\u4E0A checkout \u4E92\u8986\u98CE\u9669\u2014\u2014\u5BBF\u4E3B\u4FA7\u544A\u8B66\u6D88\u8D39\u4F4D"
    }));
  }
  return out;
}
function defaultSubjectPathProbe(repoRoot, relPath) {
  const abs = join6(repoRoot, relPath);
  try {
    const st = lstatSync(abs);
    if (st.isSymbolicLink()) {
      let real;
      try {
        real = realpathSync(abs);
      } catch {
        return { kind: "other" };
      }
      const rel = relative(repoRoot, real).split(String.fromCharCode(92)).join("/");
      if (rel.indexOf("..") === 0 || rel.length === 0 || /^[A-Za-z]:/.test(rel)) {
        return { kind: "other" };
      }
      if (!lstatSync(real).isFile()) {
        return { kind: "other" };
      }
      return { kind: "symlink", resolved: rel };
    }
    if (st.isFile()) {
      return { kind: "file" };
    }
    return { kind: "other" };
  } catch {
    return { kind: "missing" };
  }
}
var FILE_SUBJECT_KEYS = ["path", "entity"];
function resolveRowSubject(repoRoot, rawPath, probe) {
  const n = normalizeSubjectPath(rawPath);
  if (!n.ok) {
    return { subject: null, via: null, reason: n.reason };
  }
  const pr = probe(repoRoot, n.subject);
  if (pr.kind === "file" || pr.kind === "missing") {
    return { subject: n.subject, via: null, reason: null };
  }
  if (pr.kind === "symlink" && pr.resolved) {
    const rn = normalizeSubjectPath(pr.resolved);
    if (rn.ok) {
      return { subject: rn.subject, via: "symlink", reason: null };
    }
    return { subject: null, via: null, reason: "symlink-resolved-" + String(rn.reason) };
  }
  return { subject: null, via: null, reason: pr.kind === "symlink" ? "symlink-unresolved" : "non-regular-path" };
}
function pushFileSubjectSkip(out, ctx, spec, evidence, rawPath, reason) {
  out.push(makeFact(ctx, CODELORE_DESCRIPTOR, spec.analysis, evidence, "codelore.file_subject_skip", {
    analysis: spec.analysis,
    group: spec.group,
    raw_path: rawPath,
    reason
  }));
}
function emitPerFileFacts(rows, spec, evidence, ctx, repoRoot, probe, out) {
  const seen = /* @__PURE__ */ new Set();
  const subjects = [];
  let emitted = 0;
  const pushRow = function(subject, via, row, peer) {
    const value = { analysis: spec.analysis, group: spec.group, role: "first_class", row };
    if (peer !== null) {
      value.entity = subject;
      value.peer = peer;
    } else {
      value.path = subject;
    }
    if (via !== null) {
      value.via = via;
    }
    const f = makeFact(ctx, CODELORE_DESCRIPTOR, subject, evidence, "codelore.file_facet_row", value);
    if (seen.has(f.fact_id)) {
      return;
    }
    seen.add(f.fact_id);
    out.push(f);
    subjects.push(subject);
    emitted += 1;
  };
  for (const row of rows) {
    const ea = row["entity_a"], eb = row["entity_b"];
    if (typeof ea === "string" && typeof eb === "string" && ea.length > 0 && eb.length > 0) {
      const ra = resolveRowSubject(repoRoot, ea, probe);
      const rb = resolveRowSubject(repoRoot, eb, probe);
      if (ra.subject === null) {
        pushFileSubjectSkip(out, ctx, spec, evidence, ea, ra.reason);
        continue;
      }
      if (rb.subject === null) {
        pushFileSubjectSkip(out, ctx, spec, evidence, eb, rb.reason);
        continue;
      }
      pushRow(ra.subject, ra.via, row, rb.subject);
      pushRow(rb.subject, rb.via, row, ra.subject);
      continue;
    }
    let sv = null;
    for (const k of FILE_SUBJECT_KEYS) {
      const v = row[k];
      if (typeof v === "string" && v.length > 0) {
        sv = v;
        break;
      }
    }
    if (sv === null) {
      continue;
    }
    const r = resolveRowSubject(repoRoot, sv, probe);
    if (r.subject === null) {
      pushFileSubjectSkip(out, ctx, spec, evidence, sv, r.reason);
      continue;
    }
    pushRow(r.subject, r.via, row, null);
  }
  return { emitted, subjects };
}
function reaggregateFileFacetRows(facts) {
  const byFace = {};
  const seen = {};
  for (const f of facts) {
    if (f.metric !== "codelore.file_facet_row") {
      continue;
    }
    const v = JSON.parse(f.value_json);
    const a = String(v.analysis);
    const key = JSON.stringify(v.row);
    if (!byFace[a]) {
      byFace[a] = [];
      seen[a] = /* @__PURE__ */ new Set();
    }
    if (!seen[a].has(key)) {
      seen[a].add(key);
      byFace[a].push(v.row);
    }
  }
  return byFace;
}
function reconcilePerFileVsAggregate(facts) {
  const perFile = reaggregateFileFacetRows(facts);
  const canon = function(rows) {
    return rows.map(function(r) {
      return JSON.stringify(r);
    }).sort().join(String.fromCharCode(10));
  };
  const pairEnds = function(r) {
    const ea = r["entity_a"], eb = r["entity_b"];
    if (typeof ea === "string" && typeof eb === "string" && ea.length > 0 && eb.length > 0) {
      return [ea, eb];
    }
    return null;
  };
  const singleRawPath = function(r) {
    for (const k of FILE_SUBJECT_KEYS) {
      const v = r[k];
      if (typeof v === "string" && v.length > 0) {
        return v;
      }
    }
    return null;
  };
  const isFileBearing = function(r) {
    return pairEnds(r) !== null || singleRawPath(r) !== null;
  };
  const skippedByFace = {};
  for (const f of facts) {
    if (f.metric !== "codelore.file_subject_skip") {
      continue;
    }
    const v = JSON.parse(f.value_json);
    const a = String(v.analysis);
    if (!skippedByFace[a]) {
      skippedByFace[a] = /* @__PURE__ */ new Set();
    }
    skippedByFace[a].add(String(v.raw_path));
  }
  const per = {};
  let all = true;
  for (const f of facts) {
    if (f.metric !== "codelore.facet_rows") {
      continue;
    }
    const v = JSON.parse(f.value_json);
    const a = String(v.analysis);
    const aggRows = v.rows || [];
    const skip = skippedByFace[a] || /* @__PURE__ */ new Set();
    const expected = aggRows.filter(function(r) {
      const pair = pairEnds(r);
      if (pair !== null) {
        return !skip.has(pair[0]) && !skip.has(pair[1]);
      }
      const rp = singleRawPath(r);
      if (rp === null) {
        return false;
      }
      return !skip.has(rp);
    });
    const pf = perFile[a] || [];
    const fileBearing = aggRows.filter(isFileBearing).length;
    const m = canon(expected) === canon(pf);
    per[a] = { file_bearing: fileBearing, skipped: skip.size, per_file: pf.length, match: m };
    if (!m) {
      all = false;
    }
  }
  return { match: all, per_analysis: per };
}

// src/collect/file-lineage.ts
var FILE_LINEAGE_ID = "file-lineage@v1";
var FILE_LINEAGE_FAMILY = "file-lineage";
var FILE_LINEAGE_DESCRIPTOR = {
  id: FILE_LINEAGE_ID,
  family: FILE_LINEAGE_FAMILY,
  dimension: null,
  quadrant: "strategic"
};
var RENAME_DETECTOR_VERSION = "rename-detector@v1";
var RENAME_DEFAULT_THRESHOLD = "50%";
function gitRenameLogArgs(threshold) {
  return ["log", "--format=__R__%H", "--name-status", "-z", "--find-renames=" + threshold, "HEAD"];
}
function parseRenameLogZ(raw) {
  const edges = [];
  const tokens = raw.split(String.fromCharCode(0));
  let curSha = "";
  for (let i = 0; i < tokens.length; i++) {
    let tok = tokens[i];
    if (tok.indexOf("__R__") === 0) {
      curSha = tok.slice(5).trim();
      continue;
    }
    tok = tok.replace(/^[\s\n]+/, "");
    if (tok.length === 0) {
      continue;
    }
    const status = tok.charAt(0);
    if (status === "R" || status === "C") {
      const score = Number(tok.slice(1));
      const from = i + 1 < tokens.length ? tokens[i + 1] : "";
      const to = i + 2 < tokens.length ? tokens[i + 2] : "";
      if (from.length === 0 || to.length === 0) {
        throw new Error("RENAME-LOG-TRUNCATED status=" + status + " tokenIndex=" + i + " sha=" + curSha);
      }
      i += 2;
      if (status === "R") {
        edges.push({ commit_sha: curSha, similarity: Number.isFinite(score) ? score : 100, from, to });
      }
    } else {
      i += 1;
    }
  }
  return edges;
}
function collectFileLineage(input, ctx) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  let skipped = 0;
  for (const e of input.edges) {
    const toN = normalizeSubjectPath(e.to);
    const fromN = normalizeSubjectPath(e.from);
    if (!toN.ok) {
      skipped += 1;
      out.push(makeFact(ctx, FILE_LINEAGE_DESCRIPTOR, "file-lineage", gitRenameLogArgs(input.threshold).join(" "), "file.lineage_skip", {
        raw_to: e.to,
        raw_from: e.from,
        commit_sha: e.commit_sha,
        reason: toN.reason
      }));
      continue;
    }
    const value = {
      from: fromN.ok ? fromN.subject : e.from,
      to: toN.subject,
      head_sha: input.headSha,
      commit_sha: e.commit_sha,
      similarity: e.similarity,
      threshold: input.threshold,
      detector_version: input.detectorVersion,
      git_version: input.gitVersion
    };
    const key = sha256Hex(JSON.stringify([value.from, value.to, value.commit_sha, value.threshold, input.detectorVersion]));
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(makeFact(ctx, FILE_LINEAGE_DESCRIPTOR, toN.subject, e.commit_sha, "file.renamed", value));
  }
  const commits = /* @__PURE__ */ new Set();
  for (const e of input.edges) {
    commits.add(e.commit_sha);
  }
  out.push(makeFact(ctx, FILE_LINEAGE_DESCRIPTOR, ctx.repoRef, gitRenameLogArgs(input.threshold).join(" "), "file.lineage_scan", {
    head_sha: input.headSha,
    edges: seen.size,
    skipped,
    commits_with_renames: commits.size,
    threshold: input.threshold,
    detector_version: input.detectorVersion,
    git_version: input.gitVersion
  }));
  return out;
}

// src/audit/macro-b.ts
var NL = String.fromCharCode(10);
var TC1_LAG_DAYS = 90;
var TC1_RATIO_RED = 0.2;
var TC1_MIN_N = 5;
var TC2_MEAN_RED = 0.6;
var TC2_FIELD_MISSING_RED = 0.5;
var TC3_RED = 0.5;
var TC3_GREEN = 0.7;
var TC3_TOPN = 20;
var MACRO_B_STOPWORDS = ["the", "and", "for", "with", "that", "this", "from", "into", "per", "via", "not", "all", "any", "are", "was", "were", "has", "have", "had", "its", "but", "can", "may", "our", "out", "over", "under", "when", "which", "will", "would", "should", "must", "such", "than", "then", "they", "them", "their", "there", "here", "each", "both", "same", "more", "most", "some", "only", "also", "been", "being", "does", "did", "done", "\u7684", "\u4E86", "\u662F", "\u5728", "\u548C", "\u4E0E", "\u53CA", "\u6216", "\u4E3A", "\u4EE5", "\u5BF9", "\u4ECE", "\u5230", "\u88AB", "\u628A", "\u7ED9", "\u8BA9", "\u4F7F", "\u7B49", "\u5C31", "\u90FD", "\u4E5F", "\u8FD8", "\u5F88", "\u66F4", "\u6700", "\u8981", "\u4F1A", "\u80FD", "\u53EF", "\u5C06", "\u5DF2", "\u672A", "\u65E0", "\u975E", "\u4E2A", "\u4E2D", "\u4E0A", "\u4E0B", "\u4E4B", "\u5176", "\u6B64", "\u8BE5", "\u7531", "\u800C", "\u4F46", "\u5219", "\u82E5", "\u5982", "\u4E8E", "\u6240", "\u6709", "\u8FD9", "\u90A3", "\u4E0D", "\u4E00", "\u4E8C", "\u4E09", "\u7684\u7684", "\u4E86\u7684", "\u662F\u5728", "\u548C\u7684", "\u4E0E\u7684", "\u4E3A\u7684", "\u5BF9\u7684", "\u4E2D\u7684", "\u4E0A\u7684", "\u4E0B\u7684", "\u4E4B\u4E2D", "\u4E00\u4E2A", "\u8FD9\u4E2A", "\u90A3\u4E2A", "\u6211\u4EEC", "\u4ED6\u4EEC", "\u53EF\u4EE5", "\u56E0\u4E3A", "\u6240\u4EE5", "\u4F46\u662F", "\u5982\u679C", "\u901A\u8FC7", "\u8FDB\u884C", "\u4EE5\u53CA", "\u5E76\u4E14", "\u4ECE\u800C", "\u56E0\u6B64", "\u5176\u4E2D", "\u5BF9\u5E94", "\u76F8\u5173", "\u5206\u522B", "\u540C\u65F6", "\u4E4B\u540E", "\u4E4B\u524D", "\u4EE5\u5185", "\u4EE5\u4E0A", "\u4EE5\u4E0B"];
var GOLDEN_ADR = [
  "# ADR-9999: PC-1 golden fixture",
  "",
  "- Status: accepted",
  "- Date: 2026-09-13",
  "- Deciders: fixture",
  "- Ledger: D-000",
  "",
  "## Context",
  "",
  "fixture context.",
  "",
  "## Decision",
  "",
  "fixture decision.",
  "",
  "## Consequences",
  "",
  "fixture consequences; this supersedes ADR-0000."
].join(NL);
var POS_DECL = "macro audit positioning convergence determinism traceability provenance fact table skeleton slice quadrant scale verdict gate receipt citation anchor";
function git3(root, args) {
  return execFileSync("git", ["-C", root].concat(args), { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 }).trim();
}
function probeMacroBRepo(repoRoot, headSha2, opts) {
  const run = opts && opts.gitRunner ? opts.gitRunner : git3;
  const fieldStats = [emptyFieldStat(FIELD_HEAD_DATE), emptyFieldStat(FIELD_COMMITTER_DATE)];
  const fieldEvents = [];
  const dialectAbsorptions = [];
  let headRaw = "";
  let treeSha = "";
  let commitCount = 0;
  let rawLog = "";
  try {
    headRaw = run(repoRoot, ["log", "-1", "--format=%cI"]);
    treeSha = run(repoRoot, ["rev-parse", "HEAD^{tree}"]);
    commitCount = Number(run(repoRoot, ["rev-list", "--count", "HEAD"]));
    rawLog = run(repoRoot, ["log", "--pretty=format:__R__%H|%an|%cI", "--name-only"]);
  } catch (e) {
    const ee = e;
    throw protocolCrashError("GIT-PROBE-FAILED", "git \u53EA\u8BFB\u5B50\u547D\u4EE4\u5931\u8D25\uFF1A" + String(e.message || e).split(NL)[0], {
      raw: ee && ee.stderr ? String(ee.stderr) : null,
      crash_location: "audit/macro-b.ts:probeMacroBRepo",
      run_context: { repo_ref: repoRoot, commit_sha: headSha2 }
    });
  }
  const headAbs = absorbGitIsoDialect(headRaw);
  if (headAbs.absorption) {
    dialectAbsorptions.push({ field_name: FIELD_HEAD_DATE, commit_sha: headSha2, rule_id: headAbs.absorption.rule_id, raw: headAbs.absorption.raw, canonical: headAbs.absorption.canonical });
  }
  const headCls = classifyGitIsoField(headAbs.value, { anchor: true });
  recordFieldInstance(fieldStats[0], fieldEvents, headCls, headSha2, FIELD_HEAD_DATE);
  const headDate = headCls.value;
  const commits = [];
  let cur = null;
  for (const line of rawLog.split(NL)) {
    const t = line.trim();
    if (t.indexOf("__R__") === 0) {
      const parts = t.slice(5).split("|");
      if (parts.length !== 3) {
        throw protocolCrashError("GITCLI-OUTPUT-CONTRACT", "git log \u8BB0\u5F55\u5F62\u72B6\u8FDD\u7EA6\uFF1A\u671F\u671B 3 \u5B57\u6BB5\u5B9E\u5F97 " + parts.length + "\uFF08\u5D4C\u5B9A\u754C\u7B26/\u8BB0\u5F55\u622A\u65AD\u2192\u5B57\u6BB5\u4E0D\u53EF\u5B9A\u754C=\u534F\u8BAE\u7EA7\u8FDD\u7EA6\uFF0CD-100\u2460\uFF09", {
          raw: t,
          crash_location: "audit/macro-b.ts:probeMacroBRepo:log-parse",
          run_context: { repo_ref: repoRoot, commit_sha: parts.length > 0 ? parts[0] : null },
          counts: { commits_seen: commits.length }
        });
      }
      const abs = absorbGitIsoDialect(parts[2]);
      if (abs.absorption) {
        dialectAbsorptions.push({ field_name: FIELD_COMMITTER_DATE, commit_sha: parts[0], rule_id: abs.absorption.rule_id, raw: abs.absorption.raw, canonical: abs.absorption.canonical });
      }
      const cls = classifyGitIsoField(abs.value);
      cur = { sha: parts[0], author: parts[1], date: cls.value, paths: [] };
      recordFieldInstance(fieldStats[1], fieldEvents, cls, parts[0], FIELD_COMMITTER_DATE);
      commits.push(cur);
    } else if (cur && t.length > 0) {
      cur.paths.push(t);
    }
  }
  if (commits.length !== commitCount) {
    throw protocolCrashError("PROBE-INVARIANT-FAIL", "[" + repoRoot + "]: parsed " + commits.length + " != git rev-list " + commitCount, {
      crash_location: "audit/macro-b.ts:probeMacroBRepo:invariant",
      run_context: { repo_ref: repoRoot, commit_sha: headSha2 },
      counts: { commits_seen: commits.length }
    });
  }
  let subjects;
  try {
    subjects = run(repoRoot, ["log", "--pretty=format:%s"]).split(NL);
  } catch (e) {
    const ee = e;
    throw protocolCrashError("GIT-PROBE-FAILED", "git %s \u63A2\u9488\u5931\u8D25\uFF1A" + String(e.message || e).split(NL)[0], {
      raw: ee && ee.stderr ? String(ee.stderr) : null,
      crash_location: "audit/macro-b.ts:probeMacroBRepo:subjects",
      run_context: { repo_ref: repoRoot, commit_sha: headSha2 },
      counts: { commits_seen: commits.length, records_parsed: commits.length }
    });
  }
  return { headSha: headSha2, headDate, headRaw, headStatus: headCls.status, treeSha, commitCount, commits, subjects, fieldEvents, fieldStats, dialectAbsorptions };
}
function probeGitVersion() {
  try {
    return execFileSync("git", ["--version"], { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}
var defaultRenameLogRunner = function(repoRoot, args) {
  return git3(repoRoot, args);
};
function collectMacroB(repoRoot, spec, ctx, probes) {
  const adrDir = join7(repoRoot, "docs", "adr");
  const adrFiles = existsSync4(adrDir) ? readdirSync2(adrDir).filter(function(f) {
    return /^\d{3,}.*\.md$/i.test(f);
  }).sort() : [];
  const firstCommitOf = function(p) {
    let best = null;
    for (const c of probes.commits) {
      if (c.date !== null && c.paths.indexOf(p) >= 0 && (best === null || c.date < best)) {
        best = c.date;
      }
    }
    return best;
  };
  const adrDocs = adrFiles.map(function(f) {
    const rel = "docs/adr/" + f;
    return { path: rel, text: readFileSync4(join7(adrDir, f), "utf8"), first_commit_date: firstCommitOf(rel) };
  });
  const adrPaths = adrDocs.map(function(d) {
    return d.path;
  });
  const adrFacts = collectAdrStructureV2({ documents: adrDocs }, ctx);
  const adrDateMap = {};
  for (const f of adrFacts) {
    if (f.metric === "adr.decision_date") {
      const v = JSON.parse(f.value_json);
      if (v.date) {
        adrDateMap[f.subject_ref] = v.date.slice(0, 10);
      }
    }
  }
  const gitFacts = collectGitlog({ commits: probes.commits, paths: adrPaths, adrDates: adrDateMap }, ctx);
  const intentDocs = [];
  for (const cand of spec.intentCandidates) {
    const p = join7(repoRoot, cand);
    if (existsSync4(p)) {
      intentDocs.push({ path: cand, text: readFileSync4(p, "utf8") });
    }
  }
  const deliveryDocs = [{ path: "git log subjects @ " + probes.headSha.slice(0, 7), text: probes.subjects.join(NL) }];
  const posFacts = intentDocs.length > 0 ? collectPositioning({ intentDocs, deliveryDocs, topN: spec.topN, stopwords: spec.stopwords }, ctx) : [];
  let codeloreFacts = [];
  let codeloreResolution = null;
  if (spec.codelore === "auto") {
    codeloreFacts = collectCodeloreFacets({ repoRoot, facets: CODELORE_BEHAVIOR_FACETS }, ctx);
    const resFact = codeloreFacts.find(function(f) {
      return f.metric === "upstream.resolution";
    });
    if (resFact) {
      const v = JSON.parse(resFact.value_json);
      codeloreResolution = { version: v.version !== void 0 ? v.version : null, pinned: v.pinned === true, error: v.error !== void 0 ? v.error : null };
    }
  }
  let fileLineageFacts = [];
  if (spec.fileLineage && spec.fileLineage.mode === "on") {
    const threshold = spec.fileLineage.threshold || RENAME_DEFAULT_THRESHOLD;
    const runner = spec.fileLineage.runner || defaultRenameLogRunner;
    const gitVersion = probeGitVersion();
    const rawLog = runner(repoRoot, gitRenameLogArgs(threshold));
    fileLineageFacts = collectFileLineage({
      edges: parseRenameLogZ(rawLog),
      headSha: probes.headSha,
      threshold,
      detectorVersion: RENAME_DETECTOR_VERSION,
      gitVersion
    }, { runId: ctx.runId, traceId: ctx.traceId, repoRef: ctx.repoRef, scale: "Micro-B", observedAt: ctx.observedAt });
  }
  const pc1AdrFacts = collectAdrStructure({ documents: [{ path: "fixtures/" + spec.fixtureTag + "-pc1-golden-adr.md", text: GOLDEN_ADR }] }, ctx);
  const pc1PosFacts = collectPositioning({ intentDocs: [{ path: "fixtures/" + spec.fixtureTag + "-pc1-positioning.md", text: POS_DECL }], deliveryDocs: [{ path: "fixtures/" + spec.fixtureTag + "-pc1-delivery.md", text: POS_DECL }], topN: spec.topN, stopwords: spec.stopwords }, ctx);
  const pc1Five = pc1AdrFacts.find(function(f) {
    return f.metric === "adr.five_piece_completeness";
  });
  const pc1Sup = pc1AdrFacts.find(function(f) {
    return f.metric === "adr.supersede_link_present";
  });
  const pc1 = { pass: pc1AdrFacts.length > 0 && pc1PosFacts.length > 0 && !!pc1Five && JSON.parse(pc1Five.value_json).present === 5 && !!pc1Sup && JSON.parse(pc1Sup.value_json).present === true };
  const PC2_PATH = "fixtures/" + spec.fixtureTag + "-pc2-lag-adr.md";
  const pc2Commits = [{ sha: spec.pc2Sha, author: "fixture", date: "2026-01-01T00:00:00+00:00", paths: [PC2_PATH] }];
  const pc2AdrDates = {};
  pc2AdrDates[PC2_PATH] = "2026-09-13";
  const pc2Facts = collectGitlog({ commits: pc2Commits, paths: [PC2_PATH], adrDates: pc2AdrDates }, ctx);
  const pc2Lag = pc2Facts.filter(function(f) {
    return f.metric === "git.adr_lag_days";
  });
  const pc2 = { pass: pc2Lag.length > 0 && JSON.parse(pc2Lag[0].value_json).delta_days > 0, delta_days: pc2Lag.length > 0 ? JSON.parse(pc2Lag[0].value_json).delta_days : null };
  let nc1Path = null;
  for (const cand of spec.nc1Candidates) {
    if (existsSync4(join7(repoRoot, cand))) {
      nc1Path = cand;
      break;
    }
  }
  if (!nc1Path) {
    throw new Error("NC1-CANDIDATE-MISS[" + repoRoot + "]");
  }
  const nc1Facts = collectAdrStructure({ documents: [{ path: nc1Path, text: readFileSync4(join7(repoRoot, nc1Path), "utf8") }] }, ctx);
  const nc1Five = nc1Facts.find(function(f) {
    return f.metric === "adr.five_piece_completeness";
  });
  const nc1Sup = nc1Facts.find(function(f) {
    return f.metric === "adr.supersede_link_present";
  });
  const nc1 = { path: nc1Path, fact_count: nc1Facts.length, five_piece_present: nc1Five ? JSON.parse(nc1Five.value_json).present : -1, supersede_present: nc1Sup ? JSON.parse(nc1Sup.value_json).present : null, pass: false };
  nc1.pass = nc1.fact_count > 0 && nc1.five_piece_present === 0 && nc1.supersede_present === false;
  return {
    adrFiles,
    intentDocs,
    nc1Path,
    adrFacts,
    gitFacts,
    posFacts,
    codeloreFacts,
    fileLineageFacts,
    realFacts: adrFacts.concat(posFacts, gitFacts, codeloreFacts, fileLineageFacts),
    pc1,
    pc2,
    nc1,
    pc1AdrFacts,
    pc1PosFacts,
    pc2Lag,
    nc1Facts,
    codeloreResolution
  };
}
function evaluateMacroB(collect) {
  const lagValues = collect.gitFacts.filter(function(f) {
    return f.metric === "git.adr_lag_days";
  }).map(function(f) {
    return JSON.parse(f.value_json);
  });
  const tc1Judgeable = lagValues.length;
  const tc1Backfill = lagValues.filter(function(v) {
    return v.delta_days > TC1_LAG_DAYS;
  }).length;
  const tc1Ratio = tc1Judgeable === 0 ? 0 : tc1Backfill / tc1Judgeable;
  const tc1Verdict = tc1Judgeable < TC1_MIN_N ? "INCONCLUSIVE" : tc1Ratio > TC1_RATIO_RED ? "RED" : "NOT_RED";
  const fiveValues = collect.adrFacts.filter(function(f) {
    return f.metric === "adr.five_piece_completeness";
  }).map(function(f) {
    return JSON.parse(f.value_json);
  });
  const tc2Total = fiveValues.length;
  const tc2Mean = tc2Total === 0 ? 0 : fiveValues.reduce(function(s, v) {
    return s + v.ratio;
  }, 0) / tc2Total;
  const tc2Missing = {};
  for (const k of ADR_FIVE_PIECE) {
    tc2Missing[k] = 0;
  }
  for (const v of fiveValues) {
    for (const k of v.missing) {
      tc2Missing[k] = tc2Missing[k] + 1;
    }
  }
  const tc2MissingRatio = {};
  for (const k of Object.keys(tc2Missing)) {
    tc2MissingRatio[k] = tc2Total === 0 ? 0 : tc2Missing[k] / tc2Total;
  }
  const tc2CondA = tc2Mean < TC2_MEAN_RED;
  let tc2CondB = false;
  for (const k of Object.keys(tc2MissingRatio)) {
    if (tc2MissingRatio[k] > TC2_FIELD_MISSING_RED) {
      tc2CondB = true;
    }
  }
  const tc2Verdict = tc2CondA || tc2CondB ? "RED" : "NOT_RED";
  const covFacts = collect.posFacts.filter(function(f) {
    return f.metric === "positioning.keyword_coverage";
  }).map(function(f) {
    return { subject: f.subject_ref, value: JSON.parse(f.value_json), fact_id: f.fact_id };
  });
  let tc3Lowest = null;
  for (const c of covFacts) {
    if (tc3Lowest === null || c.value.ratio < tc3Lowest.value.ratio) {
      tc3Lowest = c;
    }
  }
  const tc3Ratio = tc3Lowest ? tc3Lowest.value.ratio : 0;
  const tc3Verdict = collect.intentDocs.length === 0 ? "INCONCLUSIVE" : tc3Ratio < TC3_RED ? "RED" : tc3Ratio < TC3_GREEN ? "AMBER" : "GREEN";
  return {
    tc1: { judgeable_n: tc1Judgeable, backfill_n: tc1Backfill, ratio: tc1Ratio, verdict: tc1Verdict },
    tc2: { total: tc2Total, mean_ratio: tc2Mean, missing_counts: tc2Missing, missing_ratio: tc2MissingRatio, cond_a: tc2CondA, cond_b: tc2CondB, verdict: tc2Verdict },
    tc3: { per_source: covFacts, lowest_path: tc3Lowest ? tc3Lowest.subject : null, lowest_ratio: tc3Ratio, verdict: tc3Verdict },
    covFacts,
    lagFactIds: collect.gitFacts.filter(function(f) {
      return f.metric === "git.adr_lag_days";
    }).map(function(f) {
      return f.fact_id;
    }),
    fiveFactIds: collect.adrFacts.filter(function(f) {
      return f.metric === "adr.five_piece_completeness";
    }).map(function(f) {
      return f.fact_id;
    })
  };
}
function tcBand(v) {
  if (v === "INCONCLUSIVE") {
    return "insufficient";
  }
  if (v === "RED") {
    return "unsupported";
  }
  return "supported";
}
function macroBContext(runIdLabel, ctxLabel, headSha2, headDate, headRaw) {
  const anchor = headDate === null ? "quarantined:" + sha256Hex(headRaw === void 0 ? "" : headRaw) : headDate;
  return {
    runId: runIdLabel + "-" + headSha2.slice(0, 7),
    traceId: sha256Hex(ctxLabel + "|" + headSha2 + "|" + anchor).slice(0, 32),
    repoRef: ctxLabel + "@" + headSha2,
    scale: "Macro-B",
    observedAt: headDate === null ? "quarantined(anchor_head_date_malformed)" : headDate
  };
}

// src/demo/demo.ts
var DEMO_SCENARIOS = ["happy-path", "degraded-supply", "degraded-incomplete"];
var NL2 = String.fromCharCode(10);
var DEFINITIONS_DIR = join8(dirname5(metaPath()), "fixtures", "definitions");
var DEMO_STOPWORDS = MACRO_B_STOPWORDS;
var INTENT_CANDIDATES = ["CONTEXT.md", "README.md", "AGENTS.md"];
var NC1_CANDIDATES = ["package.json", "README.md", "Cargo.toml"];
function demoDisclosure() {
  return {
    capability_label: "capability 1 of 5 \xB7 preview",
    calibration_scope: "fixture: synthetic (generated by " + FIXTURE_GENERATOR_ID + ")",
    structural_limitations: [
      "not an audit of any real repository\u2014\u2014\u5408\u6210 fixture \u4ED3\u6F14\u793A\u4EA7\u7269\uFF0C\u6240\u6709\u88C1\u5B9A\u4E0D\u6784\u6210\u771F\u5B9E\u5BA1\u8BA1\u7ED3\u8BBA\uFF08D-038 \u786C\u5951\u7EA6\uFF1A\u5408\u6210\u6570\u636E\u4E0D\u5192\u5145\u771F\u5B9E\u5BA1\u8BA1\uFF09",
      "supply-chain: " + UNVERIFIED_MARK + "\u2014\u2014Scorecard/repomix \u672A\u63A5\u5165\uFF0C\u4F9B\u5E94\u94FE\u8C61\u9650\u8BC1\u636E\u7F3A\u5931\uFF08D-034\u2462\u2463 \u6F14\u793A\u5316\u7EF4\u6301\uFF09",
      "structure/behavior/supply_chain \u8C61\u9650 not_applicable\uFF1AMacro-B \u5DF2\u4E0A\u67B6\u91C7\u96C6\u9762\u4EC5 strategy\uFF08S1+S2\uFF09",
      "\u786E\u5B9A\u6027 fixture\uFF1A\u540C scenario \u91CD\u8DD1\u4EA7\u7269\u9010\u5B57\u8282\u4E00\u81F4\uFF08pin author/committer/date\uFF09\uFF1B\u4E34\u65F6\u76EE\u5F55\u751F\u6210\u8DD1\u5B8C\u5373\u5F03\u4E0D\u6C61\u67D3\u4ED3\u5185\u72B6\u6001"
    ],
    not_in_preview: ["Micro-A", "Micro-B", "Macro-A"]
  };
}
function listScenarios() {
  const out = [];
  for (const name of DEMO_SCENARIOS) {
    const def = loadDefinition(name);
    out.push({ name, description: def.description, expect: def.expect });
  }
  return { scenarios: out };
}
function loadDefinition(scenario) {
  if (DEMO_SCENARIOS.indexOf(scenario) < 0) {
    throw new Error("DEMO-SCENARIO-UNKNOWN: " + scenario + "\uFF08\u53EF\u9009\uFF1A" + DEMO_SCENARIOS.join(" / ") + "\uFF09");
  }
  const p = join8(DEFINITIONS_DIR, scenario + ".json");
  if (!existsSync5(p)) {
    throw new Error("DEMO-DEFINITION-MISSING: " + p);
  }
  const def = JSON.parse(readFileSync5(p, "utf8"));
  if (def.scenario !== scenario) {
    throw new Error("DEMO-DEFINITION-MISMATCH: \u6587\u4EF6 " + scenario + ".json \u5185 scenario=" + def.scenario);
  }
  return def;
}
function pickExcerpt(absOrRelPath, tokens, base) {
  const text = readFileSync5(base ? join8(base, absOrRelPath) : absOrRelPath, "utf8");
  const lines = text.split(NL2);
  if (tokens === null) {
    return { line: 1, text: lines[0].trim() };
  }
  for (let i = 0; i < lines.length; i++) {
    let all = true;
    for (const tk of tokens) {
      if (lines[i].indexOf(tk) < 0) {
        all = false;
      }
    }
    if (all) {
      return { line: i + 1, text: lines[i].trim() };
    }
  }
  throw new Error("EXCERPT-MISS: " + absOrRelPath + " tokens=" + String(tokens));
}
function runDemo(opts) {
  const scenario = opts.scenario || "happy-path";
  const def = loadDefinition(scenario);
  const tempRoot = opts.tempRoot || tmpdir2();
  const workDir = mkdtempSync2(join8(tempRoot, "macro-audit-demo-"));
  const repoDir = join8(workDir, "repo");
  try {
    let addEvidence2 = function(id, source, tokens, claim, reproCmd, base) {
      const ex = pickExcerpt(source, tokens, base);
      evidence.push({ evidence_id: id, source, locator: "L" + ex.line, claim, grounded: true, collected_at: headDate, reproduce_cmd: reproCmd, reproduce_absent_reason: null, required_tokens: [], excerpt: ex.text });
    };
    var addEvidence = addEvidence2;
    const gen = generateFixtureRepo(def, repoDir);
    const intake = repoAdd(repoDir);
    const probes = probeMacroBRepo(repoDir, intake.head_sha);
    if (probes.headDate === null) {
      throw new Error("DEMO-FIXTURE-QUARANTINE[" + scenario + "]: \u5408\u6210\u5939\u5177\u951A\u5B57\u6BB5\u75C5\u6001\uFF08fixture bug \u975E\u771F\u75C5\u6001\u2014\u2014golden \u8BED\u6599 %cI \u6052\u5408\u6CD5\uFF0C\u75C5\u6001\u5373\u5939\u5177\u56DE\u5F52\uFF09");
    }
    const headDate = probes.headDate;
    const ctx = macroBContext("r45-" + scenario, def.repo.name, probes.headSha, headDate, probes.headRaw);
    const demoExcl = probes.commits.filter(function(c) {
      return c.date === null;
    }).length;
    const demoQuarRows = probes.fieldEvents.filter(function(e) {
      return e.disposition === "quarantined";
    });
    const demoIntakeHealth = {
      fields: probes.fieldStats.map(function(s) {
        return { field_name: s.field_name, total: s.total, clean: s.clean, normalized: s.normalized, quarantined: s.quarantined };
      }),
      affected_commits: new Set(demoQuarRows.map(function(e) {
        return e.commit_sha;
      })).size,
      excluded_commits: demoExcl,
      quarantined_rows: demoQuarRows.map(function(e) {
        return { commit_sha: e.commit_sha, field_name: e.field_name, reason_code: e.reason_code, raw_echo: rawEcho(e.raw) };
      }),
      threshold_ratio: QUARANTINE_FIELD_RATIO_RED,
      escalation: intakeEscalation(probes.fieldStats),
      recorded_at: probes.headDate
    };
    const col = collectMacroB(repoDir, {
      intentCandidates: INTENT_CANDIDATES,
      nc1Candidates: NC1_CANDIDATES,
      stopwords: DEMO_STOPWORDS,
      topN: TC3_TOPN,
      codelore: "off",
      // demo 恒定不接 codelore——合成仓逐字节确定性不容环境相关上游（D-038）
      fixtureTag: "45",
      pc2Sha: "pc2fixture0000000000000000000000000000045"
    }, ctx, probes);
    const ev = evaluateMacroB(col);
    const measurements = {
      scenario,
      synthetic: true,
      generator: FIXTURE_GENERATOR_ID,
      observed_at: headDate,
      head_sha: probes.headSha,
      tree_sha: probes.treeSha,
      commit_count: probes.commitCount,
      merge_commits: gen.merge_commits,
      branches: gen.branches,
      tags: gen.tags,
      adr_count: ev.tc2.total,
      intent_docs: col.intentDocs.map(function(d) {
        return d.path;
      }),
      fact_count: col.realFacts.length,
      intake: { kind: intake.kind, shallow: intake.shallow, full_depth_verified: intake.full_depth_verified, remote_config_execution: intake.remote_config_execution, credentials: intake.credentials, cloned: intake.cloned },
      tc1: { judgeable_n: ev.tc1.judgeable_n, backfill_n: ev.tc1.backfill_n, ratio_4: ev.tc1.ratio.toFixed(4), verdict: ev.tc1.verdict, threshold: { lag_days: TC1_LAG_DAYS, ratio_red: TC1_RATIO_RED, min_n: TC1_MIN_N } },
      tc2: { total: ev.tc2.total, mean_ratio_4: ev.tc2.mean_ratio.toFixed(4), missing_counts: ev.tc2.missing_counts, missing_ratio_4: Object.fromEntries(Object.keys(ev.tc2.missing_ratio).map(function(k) {
        return [k, Number(ev.tc2.missing_ratio[k].toFixed(4))];
      })), cond_a: ev.tc2.cond_a, cond_b: ev.tc2.cond_b, verdict: ev.tc2.verdict, threshold: { mean_red: TC2_MEAN_RED, field_missing_red: TC2_FIELD_MISSING_RED } },
      tc3: { per_source: ev.covFacts.map(function(c) {
        return { path: c.subject, hit: c.value.hit, keywords: c.value.keywords, ratio_4: c.value.ratio.toFixed(4) };
      }), lowest_path: ev.tc3.lowest_path, lowest_ratio_4: ev.tc3.lowest_ratio.toFixed(4), verdict: ev.tc3.verdict, threshold: { red: TC3_RED, green: TC3_GREEN, top_n: TC3_TOPN } },
      nc1: col.nc1,
      pc1: col.pc1,
      pc2: col.pc2,
      failure_trigger: def.failure ? def.failure.trigger : null,
      expect: def.expect
    };
    const outDir = opts.outDir ? resolve2(opts.outDir) : join8(workDir, "out");
    mkdirSync4(outDir, { recursive: true });
    const MEAS_NAME = "demo-measurements.json";
    const FACTS_NAME = "demo-facts.jsonl";
    const MD_NAME = "report.md";
    const JSON_NAME = "report.json";
    writeFileSync2(join8(outDir, MEAS_NAME), JSON.stringify(measurements, null, 2) + NL2, "utf8");
    writeFileSync2(join8(outDir, FACTS_NAME), col.realFacts.map(function(f) {
      return JSON.stringify(f);
    }).join(NL2) + NL2, "utf8");
    const evidence = [];
    const RUN_CMD = "macro-audit demo --scenario " + scenario;
    const R = scenario.toUpperCase().split("-").join("");
    addEvidence2("EV-45-" + R + "-01", MEAS_NAME, ['"fact_count"'], "\u672C\u6B21\u5B9E\u6D4B\uFF1A" + scenario + " \u5408\u6210 fixture \u91C7\u96C6\u4E8B\u5B9E\u6570", RUN_CMD, outDir);
    addEvidence2("EV-45-" + R + "-02", MEAS_NAME, ['"verdict"'], "\u672C\u6B21\u5B9E\u6D4B\uFF1ATC-1 ADR \u4E8B\u540E\u8865\u5199\u5224\u636E\u88C1\u5B9A\uFF08" + ev.tc1.verdict + "\uFF09", RUN_CMD, outDir);
    addEvidence2("EV-45-" + R + "-03", MEAS_NAME, ['"mean_ratio_4"'], "\u672C\u6B21\u5B9E\u6D4B\uFF1ATC-2 \u4E94\u4EF6\u5957\u5B8C\u6574\u5EA6 mean_ratio", RUN_CMD, outDir);
    addEvidence2("EV-45-" + R + "-04", MEAS_NAME, ['"lowest_ratio_4"'], "\u672C\u6B21\u5B9E\u6D4B\uFF1ATC-3 \u5B9A\u4F4D\u8986\u76D6\u7387\u6700\u4F4E\u503C", RUN_CMD, outDir);
    addEvidence2("EV-45-" + R + "-05", MEAS_NAME, ['"five_piece_present"'], "\u672C\u6B21\u5B9E\u6D4B\uFF1ANC-1 \u8D1F\u5BF9\u7167\u9009\u6750\u4E94\u4EF6\u5957\u547D\u4E2D\u6570\uFF08\u9884\u671F 0\uFF09", RUN_CMD, outDir);
    if (col.adrFiles.length > 0) {
      addEvidence2("EV-45-" + R + "-06", "docs/adr/" + col.adrFiles[0], null, scenario + " \u5408\u6210 ADR \u8BED\u6599\u951A\uFF1Adocs/adr/" + col.adrFiles[0] + " \u5B9E\u7269\u5B58\u5728\uFF08\u8BED\u6599 " + col.adrFiles.length + " \u4EFD\uFF0Csynthetic fixture\uFF09", "git -C <fixture-repo> show HEAD:docs/adr/" + col.adrFiles[0], repoDir);
    }
    addEvidence2("EV-45-" + R + "-07", MEAS_NAME, ['"synthetic": true'], "\u5408\u6210\u5370\u8BB0\uFF1A\u672C\u62A5\u544A\u5168\u90E8\u8BED\u6599\u4E3A synthetic fixture \u751F\u6210\u4ED3\uFF0Cnot an audit of any real repository", RUN_CMD, outDir);
    const claims = [
      { claim_id: "CL-45-" + R + "-01", evidence_id: "EV-45-" + R + "-01", required_tokens: ["fact_count"] },
      { claim_id: "CL-45-" + R + "-02", evidence_id: "EV-45-" + R + "-02", required_tokens: ["verdict"] },
      { claim_id: "CL-45-" + R + "-03", evidence_id: "EV-45-" + R + "-03", required_tokens: ["mean_ratio_4"] },
      { claim_id: "CL-45-" + R + "-04", evidence_id: "EV-45-" + R + "-04", required_tokens: ["lowest_ratio_4"] },
      { claim_id: "CL-45-" + R + "-05", evidence_id: "EV-45-" + R + "-05", required_tokens: ["five_piece_present"] },
      { claim_id: "CL-45-" + R + "-06", evidence_id: "EV-45-" + R + "-07", required_tokens: ["synthetic", "true"] }
    ];
    const GATE_REF = {
      prereg_commit: "45-demo-criteria",
      criteria_path: "reports/22-criteria-pre-registration.md",
      basis_path: "reports/22-c-adjudication-basis.md",
      criterion_ids: ["PC-1", "PC-2", "TC-1", "TC-2", "TC-3", "NC-1"]
    };
    const tc1FactIds = col.gitFacts.filter(function(f) {
      return f.metric === "git.adr_lag_days";
    }).map(function(f) {
      return f.fact_id;
    });
    const tc2FactIds = col.adrFacts.filter(function(f) {
      return f.metric === "adr.five_piece_completeness";
    }).map(function(f) {
      return f.fact_id;
    });
    const tc3FactIds = ev.covFacts.map(function(c) {
      return c.fact_id;
    });
    const adjudicationEntries = [
      { criterion_id: "PC-1", band: col.pc1.pass ? "supported" : "insufficient", basis_refs: ["B1"], anchored_fact_ids: firstFactIds(col.pc1AdrFacts).concat(firstFactIds(col.pc1PosFacts)), anchored_evidence_ids: ["EV-45-" + R + "-01"], decided_at: headDate, rationale: col.pc1.pass ? "adr-structure \u4E0E positioning \u4E24\u65CF\u5747\u4EA7\u51FA\u975E\u7A7A\u4E8B\u5B9E\uFF0Cgolden ADR \u4E94\u4EF6\u5957 5/5 \u4E14 supersede \u94FE\u547D\u4E2D\uFF08\u5408\u6210 run \u5185\u7BA1\u7EBF\u6D3B\u6027\u6B63\u5BF9\u7167\uFF09" : "\u6B63\u5BF9\u7167\u672A\u4E2D\uFF0C\u7BA1\u7EBF\u6545\u969C P0" },
      { criterion_id: "PC-2", band: col.pc2.pass ? "supported" : "insufficient", basis_refs: ["B1"], anchored_fact_ids: firstFactIds(col.pc2Lag), anchored_evidence_ids: ["EV-45-" + R + "-01"], decided_at: headDate, rationale: col.pc2.pass ? "gitlog \u65CF\u68C0\u51FA\u4E8B\u540E\u8865\u5199 delta_days = " + String(col.pc2.delta_days) : "\u6B63\u5BF9\u7167\u672A\u4E2D\uFF0C\u7BA1\u7EBF\u6545\u969C P0" },
      { criterion_id: "TC-1", band: tcBand(ev.tc1.verdict), basis_refs: ["B2"], anchored_fact_ids: tc1FactIds, anchored_evidence_ids: ["EV-45-" + R + "-02"], decided_at: headDate, rationale: scenario + " ADR \u4E8B\u540E\u8865\u5199\uFF1A\u53EF\u5224\u5B9A\u6570 " + ev.tc1.judgeable_n + "\uFF08\u95E8\u69DB " + TC1_MIN_N + "\uFF09\uFF0C>90d \u5360\u6BD4 " + measurements.tc1.ratio_4 + "\uFF0C\u5224 " + ev.tc1.verdict },
      { criterion_id: "TC-2", band: tcBand(ev.tc2.verdict), basis_refs: ["B2"], anchored_fact_ids: tc2FactIds, anchored_evidence_ids: ["EV-45-" + R + "-03"], decided_at: headDate, rationale: scenario + " ADR \u4E94\u4EF6\u5957\uFF1Amean_ratio " + measurements.tc2.mean_ratio_4 + "\uFF08\u95E8\u69DB " + TC2_MEAN_RED + "\uFF09\uFF0C\u5B57\u6BB5\u7F3A\u5931\u7387\u8D85\u7EBF=" + ev.tc2.cond_b + "\uFF0C\u5224 " + ev.tc2.verdict },
      { criterion_id: "TC-3", band: tcBand(ev.tc3.verdict), basis_refs: ["B2"], anchored_fact_ids: tc3FactIds, anchored_evidence_ids: ["EV-45-" + R + "-04"], decided_at: headDate, rationale: scenario + " \u5B9A\u4F4D\u8986\u76D6\uFF1A\u610F\u56FE\u9762 " + col.intentDocs.length + " \u4EF6\u6700\u4F4E ratio " + measurements.tc3.lowest_ratio_4 + "\uFF08" + String(measurements.tc3.lowest_path) + "\uFF09\uFF0C\u5224 " + ev.tc3.verdict },
      { criterion_id: "NC-1", band: col.nc1.pass ? "supported" : "insufficient", basis_refs: ["B4"], anchored_fact_ids: firstFactIds(col.nc1Facts), anchored_evidence_ids: ["EV-45-" + R + "-05"], decided_at: headDate, rationale: col.nc1.pass ? "\u8D1F\u5BF9\u7167\u9009\u6750 " + col.nc1Path + " \u4E94\u4EF6\u5957 0 \u547D\u4E2D\u3001supersede 0 \u547D\u4E2D\uFF08\u7279\u5F02\u6027\u6210\u7ACB\uFF09" : "\u8D1F\u5BF9\u7167\u547D\u4E2D\uFF0C\u8F6C\u590D\u6838\u8DEF\u5F84" }
    ];
    const strategyBand = deriveOverallBand(adjudicationEntries);
    const GATE = { protocol_version: ADJUDICATION_PROTOCOL_VERSION, audit_ref: "engine/src/demo/demo.ts" };
    const quadrants = [
      { quadrant: "strategy", applicability: "native", verdict: strategyBand, score: null, confidence: 0.6, dimensions: ["S1", "S2"], slice_fields: { s1_keyword_coverage_ratio: Number(measurements.tc3.lowest_ratio_4), s2_five_piece_mean_ratio: Number(measurements.tc2.mean_ratio_4), adr_count: ev.tc2.total, lag_judgeable_n: ev.tc1.judgeable_n, intent_docs: col.intentDocs.length }, verdict_gate: { protocol_version: GATE.protocol_version, decision: strategyBand, evidence_flag: ev.tc2.verdict === "RED", decided_at: headDate, override_reason: null, audit_ref: GATE.audit_ref }, conflict_markers: ["synthetic-fixture"] },
      { quadrant: "structure", applicability: "not_applicable", verdict: "insufficient", score: null, confidence: 0, dimensions: [], slice_fields: {}, verdict_gate: { protocol_version: GATE.protocol_version, decision: "insufficient", evidence_flag: false, decided_at: headDate, override_reason: "Macro-B \u5DF2\u4E0A\u67B6\u91C7\u96C6\u9762\u4EC5 strategy\uFF08S1+S2\uFF09\u2014\u2014structure \u65E0\u91C7\u96C6\u5668\uFF08\u4E0E #23/#39 \u540C\u53E3\u5F84\uFF09", audit_ref: GATE.audit_ref }, conflict_markers: ["out-of-scope-stage1"] },
      { quadrant: "behavior", applicability: "not_applicable", verdict: "insufficient", score: null, confidence: 0, dimensions: [], slice_fields: {}, verdict_gate: { protocol_version: GATE.protocol_version, decision: "insufficient", evidence_flag: false, decided_at: headDate, override_reason: "Macro-B \u5DF2\u4E0A\u67B6\u91C7\u96C6\u9762\u4EC5 strategy\uFF08S1+S2\uFF09\u2014\u2014behavior \u65E0\u91C7\u96C6\u5668", audit_ref: GATE.audit_ref }, conflict_markers: ["out-of-scope-stage1"] },
      { quadrant: "supply_chain", applicability: "not_applicable", verdict: "insufficient", score: null, confidence: 0, dimensions: [], slice_fields: {}, verdict_gate: { protocol_version: GATE.protocol_version, decision: "insufficient", evidence_flag: false, decided_at: headDate, override_reason: "\u26A0 \u6570\u636E\u672A\u63A5\u2014\u2014Scorecard/repomix \u6309\u5C42\u9700\u6C42\u961F\u5217\u63A5\u5165\u4E0D\u63D2\u961F\uFF08D-034\u2462\uFF09", audit_ref: GATE.audit_ref }, conflict_markers: ["data-not-connected"] }
    ];
    const recommendations = [
      { rec_id: "R-45-" + R + "-1", priority: "P1", action: "\u5BF9\u771F\u5B9E\u76EE\u6807\u4ED3\u8DD1\u540C\u4E00\u94FE\u8DEF\uFF1A`macro-audit repo add <path|url>` \u63A5\u5165\u540E\u6309 Macro-B \u53E3\u5F84\u88C1\u51B3\u2014\u2014\u672C\u62A5\u544A\u4E3A\u5408\u6210 fixture \u6F14\u793A\uFF0Cnot an audit of any real repository", rationale: "D-038 \u786C\u5951\u7EA6\uFF1A\u5408\u6210\u6570\u636E\u4E0D\u5192\u5145\u771F\u5B9E\u5BA1\u8BA1\u7ED3\u8BBA\uFF1B\u672C\u6F14\u793A\u53EA\u8BC1\u7BA1\u7EBF\u5F62\u6001\u4E0E\u62AB\u9732\u9762", expected_impact: "\u83B7\u5F97\u771F\u5B9E\u5BA1\u8BA1\u7ED3\u8BBA\u800C\u975E\u6F14\u793A\u6570\u636E", effort: "S", verdict_gate_stamp: ADJUDICATION_PROTOCOL_VERSION + " / " + strategyBand, evidence_refs: ["EV-45-" + R + "-07"], degraded_note: null },
      { rec_id: "R-45-" + R + "-2", priority: "P3", action: "\u4F9B\u5E94\u94FE\u8C61\u9650\u7EF4\u6301\u300C\u26A0 \u6570\u636E\u672A\u63A5\u300D\uFF1AScorecard/repomix \u6309\u5C42\u9700\u6C42\u961F\u5217\u63A5\u5165\u4E0D\u63D2\u961F\uFF08D-034\u2462\u2463\uFF09", rationale: "preview \u8BDA\u5B9E\u5F62\u6001\u4FDD\u6301\u2014\u2014supply-chain: " + UNVERIFIED_MARK + " \u4E3A\u62AB\u9732\u5757\u5E38\u9A7B\u5370\u8BB0", expected_impact: "\u62AB\u9732\u8BDA\u5B9E\u6027\u4FDD\u6301", effort: "S", verdict_gate_stamp: ADJUDICATION_PROTOCOL_VERSION + " / " + strategyBand, evidence_refs: ["EV-45-" + R + "-01"], degraded_note: null }
    ];
    const HEADLINE = def.repo.name + " demo\uFF08capability 1 of 5 \xB7 preview \xB7 synthetic fixture\uFF09\uFF1A" + probes.commitCount + " commits / ADR " + ev.tc2.total + " \u4EFD / facts " + col.realFacts.length + "\u2014\u2014TC-1 " + ev.tc1.verdict + "\uFF08n=" + ev.tc1.judgeable_n + "\uFF09\u3001TC-2 " + ev.tc2.verdict + "\uFF08mean=" + measurements.tc2.mean_ratio_4 + "\uFF09\u3001TC-3 " + ev.tc3.verdict + "\uFF08" + measurements.tc3.lowest_ratio_4 + "\uFF09\u2192 \u7EFC\u5408\u88C1\u5B9A " + strategyBand + "\u3002not an audit of any real repository\u2014\u2014\u5408\u6210\u8BED\u6599\u4E0D\u5192\u5145\u771F\u5B9E\u5BA1\u8BA1\uFF08D-038\uFF09\u3002";
    const reportInput = {
      report_id: "MA-45-DEMO-" + R,
      stability: "preview",
      capabilities: ["macro-b"],
      scale: "Macro-B",
      subject_ref: def.repo.name + "@" + probes.headSha.slice(0, 12),
      generated_at: headDate,
      trace_id: ctx.traceId,
      baggage_id: deriveBaggageId(ctx, "S2"),
      headline: HEADLINE,
      confidence: 0.6,
      stale: { marker: "fresh", sla_seconds: 5, lag_seconds: 0, read_model_version: REPORT_SKELETON_VERSION, fact_watermark_version: "1" },
      fact_ids: col.realFacts.map(function(f) {
        return f.fact_id;
      }),
      top_findings: ["EV-45-" + R + "-01", "EV-45-" + R + "-03", "EV-45-" + R + "-04"],
      evidence,
      claims,
      quadrants,
      recommendations,
      adjudication_entries: adjudicationEntries,
      decided_at: headDate,
      commit_anchor: probes.headSha,
      tree_anchor: probes.treeSha,
      gate_ref: GATE_REF,
      degraded: false,
      degraded_reason: null,
      preview_disclosure: demoDisclosure(),
      intake_health: demoIntakeHealth,
      human: { status: "pending", adjudicator: "user", text: null, decided_at: null }
    };
    let report = buildReport(reportInput);
    if (def.failure) {
      report = degradeReport(report, def.failure.reason);
    }
    const reportMd = renderMarkdown(report) + NL2;
    const sidecarJson = renderSidecar(report) + NL2;
    writeFileSync2(join8(outDir, MD_NAME), reportMd, "utf8");
    writeFileSync2(join8(outDir, JSON_NAME), sidecarJson, "utf8");
    const artifacts = { report_md: join8(outDir, MD_NAME), report_json: join8(outDir, JSON_NAME), measurements: join8(outDir, MEAS_NAME), facts: join8(outDir, FACTS_NAME) };
    const result = {
      scenario,
      synthetic: true,
      verdict: report.overall_verdict,
      degraded_mode: report.degraded_mode,
      degraded_reason: report.degraded_reason,
      receipt_id: report.receipt.receipt_id,
      head_sha: probes.headSha,
      commit_count: probes.commitCount,
      adr_count: ev.tc2.total,
      fact_count: col.realFacts.length,
      intake_kind: intake.kind,
      temp_dir: opts.keepTemp ? workDir : null,
      temp_discarded: !opts.keepTemp,
      out_dir: opts.outDir ? outDir : null,
      artifacts: opts.outDir ? artifacts : null,
      report_markdown: reportMd,
      sidecar_json: sidecarJson,
      measurements
    };
    return result;
  } finally {
    if (!opts.keepTemp) {
      rmSync3(workDir, { recursive: true, force: true });
    }
  }
}

// src/audit/audit.ts
import { mkdirSync as mkdirSync5, writeFileSync as writeFileSync3, existsSync as existsSync6, unlinkSync, readFileSync as readFileSync6, mkdtempSync as mkdtempSync3, rmSync as rmSync4 } from "node:fs";
import { basename, join as join9, resolve as resolve3 } from "node:path";
import { tmpdir as tmpdir3 } from "node:os";

// src/upstream/github-rest.ts
var PR_SUMMARY_REQUIRED = ["number", "title", "state", "user.login", "user.type", "head.sha", "base.sha", "html_url"];
var PR_DETAIL_REQUIRED = PR_SUMMARY_REQUIRED.concat(["merged", "merge_commit_sha", "additions", "deletions", "changed_files", "commits", "created_at"]);

// src/audit/upstream-dimension-map.ts
var UPSTREAM_DIMENSION_MAP_VERSION = "v1.0";
var UPSTREAM_DIMENSION_MAP_REVIEW = { last_reviewed: "2026-09-19", next_review: "2026-10-19" };
var CL = (surface, kind, dimension, lane, admission, note) => ({ adapter: "codelore", surface, surface_kind: kind, dimension, lane, admission, note });
var CODELORE_EVOLUTION_FACETS = ["revisions", "abs-churn", "entity-churn", "author-churn", "hotspot-velocity", "code-age", "stale-code", "architecture-trend", "health-trend", "lead-time", "release-cadence", "messages"];
var CODELORE_S3_FACETS = ["god-classes", "architecture-metrics", "dependency-cycles", "modularity-violations", "instability", "architecture-roles"];
var CODELORE_S5_FACETS = ["ownership", "entity-ownership", "bus-factor", "main-dev", "main-dev-by-revs", "main-dev-by-deletions", "knowledge-islands", "communication", "coordination-needs", "team-composition", "marginal-owner-risk", "pair-programming"];
var CODELORE_EXPLAIN_SURFACES = ["explain-repo", "explain-brief", "explain-adr", "explain-query", "explain-resolve", "explain-execute", "explain-dryrun", "llm-narrative", "capability-check"];
var CODELORE_BEHAVIOR_FACES = ["hotspots", "coupling", "function-hotspots"];
var CODELORE_DIMENSION_MAP = [
  ...CODELORE_EVOLUTION_FACETS.map((a) => CL(a, "analysis", "S4", "S-dimension", "\u65E0\u51C6\u5165", "\u6F14\u5316\u4E3B\u5E72\u9762\u2192S4 \u6F14\u5316\u65B9\u5411\uFF08D-078\u2462\uFF09")),
  ...CODELORE_S3_FACETS.map((a) => CL(a, "analysis", "S3", "S-dimension", "\u987B\u6210\u5BF9 opposing \u51C6\u5165\uFF08#51 \u53CC\u53E3\u5F84\u98CE\u9669\u2014\u2014\u5355\u6307\u6807\u7981\u5B64\u7ACB\u5165\u7EF4\uFF09", "s3 \u65CF\u2192S3 \u95E8\u9762/\u7ED3\u6784\u9884\u7B97\uFF08D-078\u2462\uFF09")),
  ...CODELORE_S5_FACETS.map((a) => CL(a, "analysis", "S5", "S-dimension", "\u65E0\u51C6\u5165", "s5 \u65CF\u2192S5 \u6240\u6709\u6743\u8FB9\u754C\u5339\u914D\uFF08D-078\u2462\uFF09")),
  ...CODELORE_EXPLAIN_SURFACES.map((a) => CL(a, "group", "S4", "S-dimension", "env \u95E8\u63A7\uFF08MACRO_AUDIT_6F_CL_LLM_KEY \u672A\u8BBE=\u4E0D\u4EA7\u9762\u2014\u2014\u73AF\u5883\u7F3A\u2260\u65AD\u8A00\u8D25\uFF09", "explain \u65CF\u2192S4\uFF08D-078\u2462 env \u95E8\u63A7\u4E0D\u53D8\uFF09")),
  ...CODELORE_BEHAVIOR_FACES.map((a) => CL(a, "analysis", null, "Macro-B-QuadrantEntry", "behavior \u65CF\u4E0D\u76F4\u5F52 S \u7EF4\u2014\u2014QuadrantEntry \u5F52\u4F4D D-054\u2462", "behavior \u65CF\u2192Macro-B \u884C\u4E3A\u8C61\u9650\u5207\u7247")),
  CL("deferred-faces", "group", null, "deferred", "\u6682\u7F13\u9762\u96C6=registry codelore-deferred-faces \u679A\u4E3E\uFF0C\u672A\u6FC0\u6D3B\u4E0D\u6620\u5C04\uFF08D-035\u2463\uFF09", "deferred \u9762\u96C6\u663E\u5F0F\u4E0D\u6620\u5C04")
];
var GH = (surface, kind, dimension, lane, admission, note) => ({ adapter: "github-rest", surface, surface_kind: kind, dimension, lane, admission, note });
var GITHUB_REST_EXCLUDED_FACT_TYPES = ["resolution", "rate_limit", "rate_limited", "api_error", "schema_drift", "run", "preflight"];
var GITHUB_REST_DIMENSION_MAP = [
  GH("pr_summary", "fact_type", "S4", "S-dimension", "\u65E0\u51C6\u5165", "PR \u5217\u8868\u6C47\u603B\u2192S4\uFF08D-078\u2462\uFF09"),
  GH("merge-lead-time", "slice", "S4", "S-dimension", "\u4EC5\u4EBA\u7C7B PR\uFF08\u5E73\u53F0\u58F0\u660E Bot \u8EAB\u4EFD\u6392\u9664\u2014\u2014CHAOSS \u7EAA\u5F8B bot \u6309\u7C7B\u51FA\u5165\uFF09", "merge lead time\u2192S4"),
  GH("bot-participation-density", "slice", "S5", "S-dimension", "\u5E73\u53F0\u58F0\u660E\u7684 Bot \u8EAB\u4EFD\uFF08user.type===Bot \u2227 login \u540E\u7F00 [bot] \u53CC\u6761\u4EF6\uFF09", "Bot \u53C2\u4E0E\u5BC6\u5EA6\u2192S5 \u63AA\u8F9E\u9501\u300C\u5E73\u53F0\u58F0\u660E\u7684 Bot \u8EAB\u4EFD\u300D\uFF08D-082\u2460\uFF09"),
  GH("review-coverage", "slice", null, "pending-event_bound", "\u6302\u8D77\u2014\u2014pulls.reviews \u6FC0\u6D3B\u4E8B\u4EF6 github-rest-reviews-active \u672A\u53D1\u751F\uFF08D-081\u2462\uFF09", "review \u8986\u76D6 pending(event_bound: github-rest-reviews-active)\u2014\u2014S5\u2194S4 \u53CC\u6302\u5F85\u91C7\u540E\u88C1\u5B9A\u4E0D\u9884\u8BBE"),
  GH("pr_diff", "fact_type", null, "Micro-A", "Micro-A lane \u6D88\u8D39\u4E0D\u76F4\u91C7 Macro-B\uFF08D-078\u2462\uFF09", "diff \u53CC\u901A\u9053\u2192Micro-A"),
  ...GITHUB_REST_EXCLUDED_FACT_TYPES.map((f) => GH(f, "fact_type", null, "excluded", "\u6C38\u4E45\u6392\u9664\u2014\u2014\u9065\u6D4B/\u89E3\u6790/\u51B3\u8BAE\u9762\u9632\u6E17\u5165 S \u7EF4\u88C1\u51B3\uFF08D-078\u2462\uFF09", f + " \u6C38\u4E45\u6392\u9664\u51FA S \u7EF4"))
];
var UPSTREAM_DIMENSION_MAP = [...CODELORE_DIMENSION_MAP, ...GITHUB_REST_DIMENSION_MAP];
function resolveCodeloreAnalysis(analysis) {
  const row = CODELORE_DIMENSION_MAP.find((r) => r.surface === analysis);
  if (!row) return { dimension: null, lane: "deferred", admission: "", admitted: false, reason: "not_mapped\uFF08deferred/\u672A\u767B\u8BB0\u9762\u96C6\u2014\u2014registry deferred-faces \u8BED\u4E49\uFF09" };
  return { dimension: row.dimension, lane: row.lane, admission: row.admission, admitted: row.dimension !== null && row.lane === "S-dimension", reason: row.note };
}
function resolveGithubRestSlice(slice, ctx) {
  const row = GITHUB_REST_DIMENSION_MAP.find((r) => r.surface === slice);
  if (!row) return { dimension: null, lane: "unmapped", admission: "", admitted: false, reason: "not_mapped\uFF08\u672A\u767B\u8BB0 slice\u2014\u2014\u975E\u6C38\u4E45\u6392\u9664\u975E\u6302\u8D77\uFF0C\u767B\u8BB0\u524D\u4E0D\u6295\u5F71\u5F52\u4F4D\uFF09" };
  if (slice === "merge-lead-time" && ctx && ctx.is_bot_via_platform_identity === true) {
    return { dimension: null, lane: "S-dimension", admission: row.admission, admitted: false, reason: "\u51C6\u5165\u62D2\uFF1A\u5E73\u53F0\u58F0\u660E Bot \u8EAB\u4EFD\u7684 PR \u4E0D\u5165 merge-lead-time\uFF08CHAOSS \u7EAA\u5F8B\uFF09" };
  }
  if (row.lane === "pending-event_bound") return { dimension: null, lane: row.lane, admission: row.admission, admitted: false, reason: row.note };
  return { dimension: row.dimension, lane: row.lane, admission: row.admission, admitted: row.dimension !== null && row.lane === "S-dimension", reason: row.note };
}
function projectUpstreamDimensions(facts) {
  const mapped = [];
  const unmapped = [];
  for (const f of facts) {
    if (f.scale === "Micro-B") {
      continue;
    }
    const fam = f.metric.startsWith("codelore.") ? "upstream-codelore" : f.metric.startsWith("github_rest.") ? "upstream-github-rest" : null;
    if (fam === null) continue;
    let v = {};
    try {
      v = JSON.parse(f.value_json);
    } catch {
      v = {};
    }
    let res;
    if (fam === "upstream-codelore") {
      const analysis = String(v.analysis || f.subject_ref || f.metric.replace(/^codelore\./, ""));
      res = resolveCodeloreAnalysis(analysis);
    } else {
      const ft = f.metric.replace(/^github_rest\./, "");
      res = resolveGithubRestSlice(ft, { is_bot_via_platform_identity: v.bot_declared === true });
    }
    const entry = {
      fact_id: f.fact_id,
      family: fam,
      metric: f.metric,
      subject_ref: f.subject_ref,
      dimension: res.dimension,
      lane: res.lane,
      admitted: res.admitted,
      reason: res.reason
    };
    (res.dimension !== null ? mapped : unmapped).push(entry);
  }
  return { map_version: UPSTREAM_DIMENSION_MAP_VERSION, map_review: UPSTREAM_DIMENSION_MAP_REVIEW, mapped, unmapped };
}

// src/audit/audit.ts
var NL3 = String.fromCharCode(10);
var AUDIT_SCALES_IMPLEMENTED = ["Macro-B"];
var SCALE_LAYER_ORDER = "Macro-C\u2192Micro-A\u2192Micro-B\u2192Macro-A\uFF08ADR-0017\u2462 \u5C42\u5E8F\uFF0CMacro-B \u5DF2\u4E0A\u67B6 preview\uFF09";
var SCALE_CANON = { "microa": "Micro-A", "microb": "Micro-B", "macroa": "Macro-A", "macrob": "Macro-B", "macroc": "Macro-C" };
function isAuditScaleError(e) {
  return !!e && typeof e === "object" && e.code === "SCALE-NOT-IMPLEMENTED";
}
function normalizeAuditScale(raw) {
  if (raw === void 0) {
    return "Macro-B";
  }
  const canon = SCALE_CANON[raw.toLowerCase().split("-").join("")];
  const req = canon || raw;
  if (AUDIT_SCALES_IMPLEMENTED.indexOf(req) < 0) {
    throw {
      code: "SCALE-NOT-IMPLEMENTED",
      message: "--scale " + req + " \u672A\u5B9E\u88C5\u2014\u2014audit \u73B0\u4EC5\u4E0A\u67B6 Macro-B\uFF08" + SCALE_LAYER_ORDER + "\uFF1B\u672C\u547D\u4EE4\u4E0D\u5047\u88C5\u80FD\u8DD1\u672A\u5B9E\u88C5\u5C42\uFF09",
      implemented: AUDIT_SCALES_IMPLEMENTED,
      requested: req,
      layer_order: SCALE_LAYER_ORDER
    };
  }
  return req;
}
function auditRepoName(input, resolvedRoot) {
  const t = input.trim();
  if (/^(https?|ssh|git|file):\/\//.test(t) || t.indexOf("git@") === 0) {
    const seg = t.replace(/\/+$/, "").split("/").pop() || "repo";
    return seg.replace(/\.git$/i, "") || "repo";
  }
  if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(t)) {
    return t.split("/").pop() || t;
  }
  return basename(resolve3(resolvedRoot)) || "repo";
}
var AUDIT_INTENT_CANDIDATES = ["CONTEXT.md", "README.md", "AGENTS.md"];
var AUDIT_NC1_CANDIDATES = ["package.json", "README.md", "README.adoc", "README.rst", "README", "Cargo.toml", "pom.xml", "build.gradle", "LICENSE", "LICENSE.txt", "pyproject.toml", "go.mod", "Makefile"];
function pickExcerpt2(absOrRelPath, tokens, base) {
  const text = readFileSync6(base ? join9(base, absOrRelPath) : absOrRelPath, "utf8");
  const lines = text.split(NL3);
  if (tokens === null) {
    return { line: 1, text: lines[0].trim() };
  }
  for (let i = 0; i < lines.length; i++) {
    let all = true;
    for (const tk of tokens) {
      if (lines[i].indexOf(tk) < 0) {
        all = false;
      }
    }
    if (all) {
      return { line: i + 1, text: lines[i].trim() };
    }
  }
  throw new Error("EXCERPT-MISS: " + absOrRelPath + " tokens=" + String(tokens));
}
async function runAudit(opts) {
  const scale = normalizeAuditScale(opts.scale);
  const cwd = opts.cwd || process.cwd();
  const intake = repoAdd(opts.input, { cwd, refresh: opts.refresh === true });
  const repoRoot = intake.resolved_root;
  const NAME = auditRepoName(opts.input, repoRoot);
  const probes = probeMacroBRepo(repoRoot, intake.head_sha);
  const ctx = macroBContext("audit-" + NAME, NAME, probes.headSha, probes.headDate, probes.headRaw);
  const HEAD_AT = probes.headDate === null ? "quarantined(anchor_head_date_malformed)" : probes.headDate;
  const anchorQuarantined = probes.headDate === null;
  const excludedCommits = probes.commits.filter(function(c) {
    return c.date === null;
  }).length;
  if (opts.strictQuarantine === true) {
    const violations = strictQuarantineViolations(probes.fieldEvents).concat(ratchetIssues(probes.fieldEvents));
    if (violations.length > 0) {
      const firstEv = probes.fieldEvents.filter(function(e) {
        return e.disposition === "quarantined" && violations.join("|").indexOf(e.reason_code) >= 0;
      })[0];
      throw protocolCrashError("STRICT-QUARANTINE-VIOLATION", "reason_code \u8D8A\u4ED3\u7EA7\u57FA\u7EBF/\u68D8\u8F6E\u6EDE\u7559\uFF08strict \u6A21\u5F0F fail-closed\uFF09\uFF1A" + violations.join(","), {
        raw: firstEv ? firstEv.raw : null,
        crash_location: "audit.ts:strict-quarantine-gate",
        run_context: { repo_ref: ctx.repoRef, run_id: ctx.traceId, commit_sha: firstEv ? firstEv.commit_sha : null, head_date: probes.headDate, collector: "macro-audit audit" },
        counts: countsFromStats(probes.fieldStats, probes.commitCount, 0, 0)
      });
    }
  }
  const col = collectMacroB(repoRoot, {
    intentCandidates: AUDIT_INTENT_CANDIDATES,
    nc1Candidates: AUDIT_NC1_CANDIDATES,
    stopwords: MACRO_B_STOPWORDS,
    topN: TC3_TOPN,
    codelore: "auto",
    // audit=实跑面：binary 缺席/不 pin → resolution 事实留痕＋behavior 象限如实 not_applicable
    fileLineage: { mode: "on" },
    // #80 步①：确定性 rename 检测→file.renamed 血缘事实（audit 实跑面；demo=off 保确定性）
    fixtureTag: "AUDIT",
    pc2Sha: "pc2fixture000000000000000000000000000053audit"
  }, ctx, probes);
  const ev = evaluateMacroB(col);
  const facetFacts = col.codeloreFacts.filter(function(f) {
    return f.metric === "codelore.facet_rows";
  });
  const facetErrs = col.codeloreFacts.filter(function(f) {
    return /facet_(parse_)?error/.test(f.metric);
  });
  const fileFacetFacts = col.codeloreFacts.filter(function(f) {
    return f.metric === "codelore.file_facet_row";
  });
  const subjectSkips = col.codeloreFacts.filter(function(f) {
    return f.metric === "codelore.file_subject_skip";
  });
  const caseConflicts = col.codeloreFacts.filter(function(f) {
    return f.metric === "codelore.subject_case_conflict";
  });
  const byFaceRows = reaggregateFileFacetRows(col.codeloreFacts);
  const aggFactId = {};
  for (const f of facetFacts) {
    const v = JSON.parse(f.value_json);
    aggFactId[v.analysis] = f.fact_id;
  }
  const facetRecon = reconcilePerFileVsAggregate(col.codeloreFacts);
  const hRows = byFaceRows.hotspots || [];
  const cRows = byFaceRows.coupling || [];
  const fhRows = byFaceRows["function-hotspots"] || [];
  const bhvRan = col.codeloreResolution !== null && col.codeloreResolution.pinned === true;
  const BHV_MIN_REVS = 5;
  const bhvPc1 = bhvRan && ["hotspots", "coupling", "function-hotspots"].every(function(a) {
    return (byFaceRows[a] || []).length > 0;
  }) && facetErrs.length === 0 && facetRecon.match === true;
  const bhvTc1 = bhvRan && hRows.length > 0 && hRows.every(function(r) {
    return typeof r.revisions === "number" && r.revisions >= BHV_MIN_REVS;
  });
  const bhvTc2 = bhvRan && cRows.length > 0 && cRows.filter(function(r) {
    return r.shared >= 2 && r.degree > 0;
  }).length / cRows.length >= 0.5;
  const BHV_DEFERRED = ["function-coupling(--target)"];
  const bhvNc1 = BHV_DEFERRED.length > 0;
  const behaviorBand = bhvRan ? bhvPc1 && bhvTc1 && bhvTc2 && bhvNc1 ? "supported" : "insufficient" : "insufficient";
  const persistOut = !!opts.outDir;
  const outDir = opts.outDir ? resolve3(cwd, opts.outDir) : mkdtempSync3(join9(tmpdir3(), "macro-audit-run-"));
  mkdirSync5(outDir, { recursive: true });
  const MEAS_NAME = "audit-measurements.json";
  const FACTS_NAME = "audit-facts.jsonl";
  const measurements = {
    repo: NAME,
    root: repoRoot,
    observed_at: HEAD_AT,
    head_sha: probes.headSha,
    tree_sha: probes.treeSha,
    commit_count: probes.commitCount,
    adr_count: ev.tc2.total,
    intent_docs: col.intentDocs.map(function(d) {
      return d.path;
    }),
    fact_count: col.realFacts.length,
    intake: { kind: intake.kind, url: intake.url, cloned: intake.cloned, cache_hit: intake.cache_hit, refreshed: intake.refreshed, snapshot_fetched_at: intake.snapshot_fetched_at, full_depth_verified: intake.full_depth_verified, remote_config_execution: intake.remote_config_execution, credentials: intake.credentials },
    intake_quarantine: {
      wired_fields: ["committer_date", "head_date"],
      field_stats: probes.fieldStats,
      events: probes.fieldEvents.map(function(e) {
        return { commit_sha: e.commit_sha, field_name: e.field_name, disposition: e.disposition, reason_code: e.reason_code, raw_echo: rawEcho(e.raw) };
      }),
      excluded_commits: excludedCommits,
      threshold_ratio: QUARANTINE_FIELD_RATIO_RED,
      strict_mode: opts.strictQuarantine === true
    },
    // D-128④ 双轴披露=独立面（run 元数据载体）：方言吸收事件＋采集环境元数据——
    // 禁入 Intake Health 统计/禁入 golden 字节比对面/禁打 ⚠（仪器元数据与测量值分离，OTel Resource 先例）。
    collection_environment: {
      git_version: probeGitVersion(),
      instrument_dialect: {
        note: "observation-instrument dialect absorption\u2014\u2014\u89C2\u6D4B\u4EEA\u5668\u7B49\u4EF7\u62FC\u5199\u5DEE\u5F52\u8FB9\u754C\u5C42\u5438\u6536\uFF08\u975E\u4E3B\u4F53\u75C5\u6001\uFF0C\u4E0D\u8BA1\u5165\u75C5\u6001\u7EDF\u8BA1\uFF09",
        rules: GIT_ISO_DIALECT_RULES.map(function(r) {
          return r.rule_id;
        }),
        absorbed_total: probes.dialectAbsorptions.length,
        by_rule: probes.dialectAbsorptions.reduce(function(m, e) {
          m[e.rule_id] = (m[e.rule_id] || 0) + 1;
          return m;
        }, {}),
        by_field: probes.dialectAbsorptions.reduce(function(m, e) {
          m[e.field_name] = (m[e.field_name] || 0) + 1;
          return m;
        }, {}),
        events: probes.dialectAbsorptions.slice(0, 20).map(function(e) {
          return { field_name: e.field_name, commit_sha: e.commit_sha, rule_id: e.rule_id, raw_echo: rawEcho(e.raw) };
        })
      }
    },
    tc1: { judgeable_n: ev.tc1.judgeable_n, backfill_n: ev.tc1.backfill_n, ratio_4: ev.tc1.ratio.toFixed(4), verdict: ev.tc1.verdict, threshold: { lag_days: TC1_LAG_DAYS, ratio_red: TC1_RATIO_RED, min_n: TC1_MIN_N } },
    tc2: { total: ev.tc2.total, mean_ratio_4: ev.tc2.mean_ratio.toFixed(4), missing_counts: ev.tc2.missing_counts, missing_ratio_4: Object.fromEntries(Object.keys(ev.tc2.missing_ratio).map(function(k) {
      return [k, Number(ev.tc2.missing_ratio[k].toFixed(4))];
    })), cond_a: ev.tc2.cond_a, cond_b: ev.tc2.cond_b, verdict: ev.tc2.verdict, threshold: { mean_red: TC2_MEAN_RED, field_missing_red: TC2_FIELD_MISSING_RED } },
    tc3: { per_source: ev.tc3.per_source.map(function(c) {
      return { path: c.subject, hit: c.value.hit, keywords: c.value.keywords, ratio_4: c.value.ratio.toFixed(4) };
    }), lowest_path: ev.tc3.lowest_path, lowest_ratio_4: ev.tc3.lowest_ratio.toFixed(4), verdict: ev.tc3.verdict, threshold: { red: TC3_RED, green: TC3_GREEN, top_n: TC3_TOPN } },
    nc1: col.nc1,
    pc1: col.pc1,
    pc2: col.pc2,
    file_lineage: { renamed: col.fileLineageFacts.filter(function(f) {
      return f.metric === "file.renamed";
    }).length, lineage_skips: col.fileLineageFacts.filter(function(f) {
      return f.metric === "file.lineage_skip";
    }).length, scan_fact: col.fileLineageFacts.some(function(f) {
      return f.metric === "file.lineage_scan";
    }) },
    upstream_dimension_projection: projectUpstreamDimensions(col.realFacts),
    behavior: bhvRan ? { faces: facetFacts.map(function(f) {
      return JSON.parse(f.value_json).analysis;
    }), row_counts: { hotspots: hRows.length, coupling: cRows.length, function_hotspots: fhRows.length }, facet_errors: facetErrs.length, criteria: { pc1: bhvPc1, tc1: bhvTc1, tc2: bhvTc2, nc1: bhvNc1 }, verdict: behaviorBand, micro_b: { per_file_facts: fileFacetFacts.length, subject_skips: subjectSkips.length, case_conflicts: caseConflicts.reduce(function(s, f) {
      const v = JSON.parse(f.value_json);
      return s + (v.pairs ? v.pairs.length : 0);
    }, 0), reconciliation: { match: facetRecon.match, per_analysis: facetRecon.per_analysis } }, codelore_version: col.codeloreResolution ? col.codeloreResolution.version : null } : { ran: false, reason: col.codeloreResolution ? "codelore binary \u672A\u89E3\u6790/\u4E0D pin\uFF08pinned=false\uFF09\u2014\u2014\u884C\u4E3A\u9762\u7F3A\u5E2D\u5982\u5B9E\u767B\u8BB0" : "codelore=off", deferred_faces: BHV_DEFERRED }
  };
  if (outDir) {
    writeFileSync3(join9(outDir, MEAS_NAME), JSON.stringify(measurements, null, 2) + NL3, "utf8");
  }
  const evidence = [];
  const R = NAME.toUpperCase().split("-").join("").split("/").join("");
  const RUN_CMD = "macro-audit audit " + opts.input + (opts.outDir ? " --out " + opts.outDir : "");
  function addEvidence(id, source, tokens, claim, base) {
    const ex = pickExcerpt2(source, tokens, base);
    evidence.push({ evidence_id: id, source, locator: "L" + ex.line, claim, grounded: true, collected_at: HEAD_AT, reproduce_cmd: RUN_CMD, reproduce_absent_reason: null, required_tokens: [], excerpt: ex.text });
  }
  const measBase = outDir;
  addEvidence("EV-AUDIT-" + R + "-01", MEAS_NAME, ['"fact_count"'], "\u672C\u6B21\u5B9E\u6D4B\uFF1A" + NAME + " Macro-B audit \u91C7\u96C6\u4E8B\u5B9E\u6570", measBase);
  addEvidence("EV-AUDIT-" + R + "-02", MEAS_NAME, ['"verdict"'], "\u672C\u6B21\u5B9E\u6D4B\uFF1A" + NAME + " TC-1 ADR \u4E8B\u540E\u8865\u5199\u5224\u636E\u88C1\u5B9A\uFF08" + ev.tc1.verdict + "\uFF09", measBase);
  addEvidence("EV-AUDIT-" + R + "-03", MEAS_NAME, ['"mean_ratio_4"'], "\u672C\u6B21\u5B9E\u6D4B\uFF1A" + NAME + " TC-2 \u4E94\u4EF6\u5957\u5B8C\u6574\u5EA6 mean_ratio", measBase);
  addEvidence("EV-AUDIT-" + R + "-04", MEAS_NAME, ['"lowest_ratio_4"'], "\u672C\u6B21\u5B9E\u6D4B\uFF1A" + NAME + " TC-3 \u5B9A\u4F4D\u8986\u76D6\u7387\u6700\u4F4E\u503C", measBase);
  addEvidence("EV-AUDIT-" + R + "-05", MEAS_NAME, ['"five_piece_present"'], "\u672C\u6B21\u5B9E\u6D4B\uFF1A" + NAME + " NC-1 \u8D1F\u5BF9\u7167\u9009\u6750\u4E94\u4EF6\u5957\u547D\u4E2D\u6570\uFF08\u9884\u671F 0\uFF09", measBase);
  if (col.adrFiles.length > 0) {
    addEvidence("EV-AUDIT-" + R + "-06", "docs/adr/" + col.adrFiles[0], null, NAME + " ADR \u8BED\u6599\u951A\uFF1Adocs/adr/" + col.adrFiles[0] + " \u5B9E\u7269\u5B58\u5728\uFF08\u8BED\u6599 " + col.adrFiles.length + " \u4EFD\uFF09", repoRoot);
  }
  addEvidence("EV-AUDIT-" + R + "-07", MEAS_NAME, ['"snapshot_fetched_at"'], "\u5FEB\u7167\u65F6\u70B9\u62AB\u9732\uFF1A" + NAME + " intake snapshot_fetched_at=" + String(intake.snapshot_fetched_at) + "\uFF08cache_hit=" + intake.cache_hit + " refreshed=" + intake.refreshed + "\uFF1B\u4E0D\u81EA\u52A8 pull\uFF0C--refresh \u663E\u5F0F opt-in\uFF09", measBase);
  const claims = [
    { claim_id: "CL-AUDIT-" + R + "-01", evidence_id: "EV-AUDIT-" + R + "-01", required_tokens: ["fact_count"] },
    { claim_id: "CL-AUDIT-" + R + "-02", evidence_id: "EV-AUDIT-" + R + "-02", required_tokens: ["verdict"] },
    { claim_id: "CL-AUDIT-" + R + "-03", evidence_id: "EV-AUDIT-" + R + "-03", required_tokens: ["mean_ratio_4"] },
    { claim_id: "CL-AUDIT-" + R + "-04", evidence_id: "EV-AUDIT-" + R + "-04", required_tokens: ["lowest_ratio_4"] },
    { claim_id: "CL-AUDIT-" + R + "-05", evidence_id: "EV-AUDIT-" + R + "-05", required_tokens: ["five_piece_present"] },
    { claim_id: "CL-AUDIT-" + R + "-06", evidence_id: "EV-AUDIT-" + R + "-07", required_tokens: ["snapshot_fetched_at"] }
  ];
  const GATE_REF = {
    prereg_commit: "7395495",
    criteria_path: "reports/22-criteria-pre-registration.md",
    basis_path: "reports/22-c-adjudication-basis.md",
    criterion_ids: bhvRan ? ["PC-1", "PC-2", "TC-1", "TC-2", "TC-3", "NC-1", "BHV-PC-1", "BHV-TC-1", "BHV-TC-2", "BHV-NC-1"] : ["PC-1", "PC-2", "TC-1", "TC-2", "TC-3", "NC-1"]
  };
  const adjudicationEntries = [
    { criterion_id: "PC-1", band: col.pc1.pass ? "supported" : "insufficient", basis_refs: ["B1"], anchored_fact_ids: firstFactIds(col.pc1AdrFacts).concat(firstFactIds(col.pc1PosFacts)), anchored_evidence_ids: ["EV-AUDIT-" + R + "-01"], decided_at: HEAD_AT, rationale: col.pc1.pass ? "adr-structure \u4E0E positioning \u4E24\u65CF\u5747\u4EA7\u51FA\u975E\u7A7A\u4E8B\u5B9E\uFF0Cgolden ADR \u4E94\u4EF6\u5957 5/5 \u4E14 supersede \u94FE\u547D\u4E2D\uFF08" + NAME + " run \u5185\u7BA1\u7EBF\u6D3B\u6027\u6B63\u5BF9\u7167\uFF09" : "\u6B63\u5BF9\u7167\u672A\u4E2D\uFF0C\u7BA1\u7EBF\u6545\u969C P0" },
    { criterion_id: "PC-2", band: col.pc2.pass ? "supported" : "insufficient", basis_refs: ["B1"], anchored_fact_ids: firstFactIds(col.pc2Lag), anchored_evidence_ids: ["EV-AUDIT-" + R + "-01"], decided_at: HEAD_AT, rationale: col.pc2.pass ? "gitlog \u65CF\u68C0\u51FA\u4E8B\u540E\u8865\u5199 delta_days = " + String(col.pc2.delta_days) : "\u6B63\u5BF9\u7167\u672A\u4E2D\uFF0C\u7BA1\u7EBF\u6545\u969C P0" },
    { criterion_id: "TC-1", band: tcBand(ev.tc1.verdict), basis_refs: ["B2"], anchored_fact_ids: ev.lagFactIds, anchored_evidence_ids: ["EV-AUDIT-" + R + "-02"], decided_at: HEAD_AT, rationale: NAME + " ADR \u4E8B\u540E\u8865\u5199\uFF1A\u53EF\u5224\u5B9A\u6570 " + ev.tc1.judgeable_n + "\uFF08\u95E8\u69DB " + TC1_MIN_N + "\uFF09\uFF0C>90d \u5360\u6BD4 " + measurements.tc1.ratio_4 + "\uFF0C\u5224 " + ev.tc1.verdict + "\uFF08\u6D3E\u751F\u7EDF\u8BA1 over " + String(probes.commitCount - excludedCommits) + " commits\uFF1Bquarantined \u65E5\u671F commit \u6392\u9664 " + excludedCommits + "\uFF09" },
    { criterion_id: "TC-2", band: tcBand(ev.tc2.verdict), basis_refs: ["B2"], anchored_fact_ids: ev.fiveFactIds, anchored_evidence_ids: ["EV-AUDIT-" + R + "-03"], decided_at: HEAD_AT, rationale: NAME + " ADR \u4E94\u4EF6\u5957\uFF1Amean_ratio " + measurements.tc2.mean_ratio_4 + "\uFF08\u95E8\u69DB " + TC2_MEAN_RED + "\uFF09\uFF0C\u5B57\u6BB5\u7F3A\u5931\u7387\u8D85\u7EBF=" + ev.tc2.cond_b + "\uFF0C\u5224 " + ev.tc2.verdict },
    { criterion_id: "TC-3", band: tcBand(ev.tc3.verdict), basis_refs: ["B2"], anchored_fact_ids: ev.covFacts.map(function(c) {
      return c.fact_id;
    }), anchored_evidence_ids: ["EV-AUDIT-" + R + "-04"], decided_at: HEAD_AT, rationale: NAME + " \u5B9A\u4F4D\u8986\u76D6\uFF1A\u610F\u56FE\u9762 " + col.intentDocs.length + " \u4EF6\u6700\u4F4E ratio " + measurements.tc3.lowest_ratio_4 + "\uFF08" + String(ev.tc3.lowest_path) + "\uFF09\uFF0C\u5224 " + ev.tc3.verdict },
    { criterion_id: "NC-1", band: col.nc1.pass ? "supported" : "insufficient", basis_refs: ["B4"], anchored_fact_ids: firstFactIds(col.nc1Facts), anchored_evidence_ids: ["EV-AUDIT-" + R + "-05"], decided_at: HEAD_AT, rationale: col.nc1.pass ? "\u8D1F\u5BF9\u7167\u9009\u6750 " + NAME + "/" + col.nc1.path + " \u4E94\u4EF6\u5957 0 \u547D\u4E2D\u3001supersede 0 \u547D\u4E2D\uFF08\u7279\u5F02\u6027\u6210\u7ACB\uFF09" : "\u8D1F\u5BF9\u7167\u547D\u4E2D\uFF0C\u8F6C\u590D\u6838\u8DEF\u5F84" }
  ];
  if (bhvRan) {
    adjudicationEntries.push(
      { criterion_id: "BHV-PC-1", band: bhvPc1 ? "supported" : "insufficient", basis_refs: ["B1"], anchored_fact_ids: facetFacts.map(function(f) {
        return f.fact_id;
      }), anchored_evidence_ids: ["EV-AUDIT-" + R + "-01"], decided_at: HEAD_AT, rationale: "\u884C\u4E3A\u4E09\u9762 per-file \u91CD\u7B97\u9F50\u5907\u6027\uFF08file_facet_row \u4E09\u9762\u5404 >0 \u884C\uFF0CerrFacts=" + facetErrs.length + "\uFF0C\u805A\u5408\u2194per-file \u5BF9\u8D26 match=" + facetRecon.match + "\uFF09" },
      { criterion_id: "BHV-TC-1", band: bhvTc1 ? "supported" : "insufficient", basis_refs: ["B1"], anchored_fact_ids: aggFactId.hotspots ? [aggFactId.hotspots] : [], anchored_evidence_ids: ["EV-AUDIT-" + R + "-01"], decided_at: HEAD_AT, rationale: "\u4F4E\u6837\u672C\u5224\u636E\uFF1Ahotspots min(revisions)>=" + BHV_MIN_REVS + "\uFF08\u5B9E\u6D4B min=" + (hRows.length ? Math.min.apply(null, hRows.map(function(r) {
        return r.revisions;
      })) : "n/a") + "\uFF09" },
      { criterion_id: "BHV-TC-2", band: bhvTc2 ? "supported" : "insufficient", basis_refs: ["B1"], anchored_fact_ids: aggFactId.coupling ? [aggFactId.coupling] : [], anchored_evidence_ids: ["EV-AUDIT-" + R + "-01"], decided_at: HEAD_AT, rationale: "coupling shared>=2&degree>0 \u5360\u6BD4=" + (cRows.length ? (cRows.filter(function(r) {
        return r.shared >= 2 && r.degree > 0;
      }).length / cRows.length).toFixed(3) : "n/a") + "\uFF08\u9608\u503C 0.5\uFF09" },
      { criterion_id: "BHV-NC-1", band: bhvNc1 ? "supported" : "insufficient", basis_refs: ["B1"], anchored_fact_ids: [], anchored_evidence_ids: [], decided_at: HEAD_AT, rationale: "function-coupling\uFF08--target \u53C2\u6570\u9762\uFF09\u6682\u7F13\u5982\u5B9E\u767B\u8BB0\u2014\u2014deferred_faces \u5199\u5165\u5207\u7247\u5B57\u6BB5" }
    );
  }
  const strategyBand = deriveOverallBand(adjudicationEntries);
  const GATE = { protocol_version: ADJUDICATION_PROTOCOL_VERSION, audit_ref: "engine/src/audit/audit.ts" };
  const hotTop = hRows.slice(0, 3).map(function(r) {
    return String(r.path) + "(revs=" + String(r.revisions) + ",score=" + Number(r.hotspot_score).toFixed(2) + ")";
  });
  const quadrants = [
    { quadrant: "strategy", applicability: "native", verdict: strategyBand, score: null, confidence: 0.6, dimensions: ["S1", "S2"], slice_fields: { s1_keyword_coverage_ratio: Number(measurements.tc3.lowest_ratio_4), s2_five_piece_mean_ratio: Number(measurements.tc2.mean_ratio_4), adr_count: ev.tc2.total, lag_judgeable_n: ev.tc1.judgeable_n, intent_docs: col.intentDocs.length }, verdict_gate: { protocol_version: GATE.protocol_version, decision: strategyBand, evidence_flag: ev.tc2.verdict === "RED", decided_at: HEAD_AT, override_reason: null, audit_ref: GATE.audit_ref }, conflict_markers: [] },
    { quadrant: "behavior", applicability: bhvRan ? "native" : "not_applicable", verdict: behaviorBand, score: null, confidence: bhvRan ? 0.6 : 0, dimensions: [], slice_fields: bhvRan ? { faces: ["hotspots", "coupling", "function-hotspots"], face_row_counts: { hotspots: hRows.length, coupling: cRows.length, function_hotspots: fhRows.length }, hotspot_top: hotTop, coupling_pairs: cRows.length, min_revs: BHV_MIN_REVS, sample_met: bhvTc1, deferred_faces: BHV_DEFERRED, quadrant_assignment: "slice-decision\uFF08facts \u5171\u4EAB quadrant=strategic/codelore \u65CF provenance \u4E0D\u6539\u5199\uFF1B\u8C61\u9650\u5F52\u5C5E=\u62A5\u544A\u5207\u7247\u51B3\u7B56 D-054\u2462\uFF09" } : {}, verdict_gate: { protocol_version: GATE.protocol_version, decision: behaviorBand, evidence_flag: bhvPc1, decided_at: HEAD_AT, override_reason: bhvRan ? null : "codelore binary \u672A\u89E3\u6790/\u4E0D pin\u2014\u2014\u884C\u4E3A\u9762\u91C7\u96C6\u7F3A\u5E2D\uFF08resolution \u4E8B\u5B9E\u7559\u75D5\uFF0CD-054\u2462 \u964D\u7EA7\u975E\u9759\u9ED8\uFF09", audit_ref: GATE.audit_ref }, conflict_markers: bhvRan ? [] : ["data-not-connected"] },
    { quadrant: "structure", applicability: "not_applicable", verdict: "insufficient", score: null, confidence: 0, dimensions: [], slice_fields: {}, verdict_gate: { protocol_version: GATE.protocol_version, decision: "insufficient", evidence_flag: false, decided_at: HEAD_AT, override_reason: "queued\uFF1A\u4E0E S3 \u65CF\u53CC\u53E3\u5F84\u98CE\u9669\u6682\u7F13\uFF08D-054\uFF09\u2014\u2014structure \u65E0\u91C7\u96C6\u5668", audit_ref: GATE.audit_ref }, conflict_markers: ["out-of-scope-stage1"] },
    { quadrant: "supply_chain", applicability: "not_applicable", verdict: "insufficient", score: null, confidence: 0, dimensions: [], slice_fields: {}, verdict_gate: { protocol_version: GATE.protocol_version, decision: "insufficient", evidence_flag: false, decided_at: HEAD_AT, override_reason: "\u26A0 \u6570\u636E\u672A\u63A5\u2014\u2014Scorecard/repomix \u6309\u5C42\u9700\u6C42\u961F\u5217\u63A5\u5165\u4E0D\u63D2\u961F\uFF08D-034\u2462\uFF09", audit_ref: GATE.audit_ref }, conflict_markers: ["data-not-connected"] }
  ];
  const recommendations = [
    { rec_id: "R-AUDIT-" + R + "-1", priority: "P2", action: "\u5C06\u672C run facts.duckdb \u7ECF mcp.json MACRO_AUDIT_FACTS_DB \u6CE8\u518C\u7ED9\u5BBF\u4E3B agent\u2014\u2014\u53D9\u4E8B\u6BB5\u7531\u5BBF\u4E3B\u7ECF MCP facts \u53EA\u8BFB\u9762\u751F\u6210\uFF08D-053 \u53CC\u8F68\uFF09", rationale: "audit \u547D\u4EE4=kernel \u9762\u4E00\u7B49\u516C\u6C11\u5165\u53E3\uFF1B\u53D9\u4E8B\u804C\u8D23\u4E0D\u5916\u643A\uFF0C\u5BBF\u4E3B agent \u7ECF facts \u6295\u5F71\u6D88\u8D39", expected_impact: "\u4E8B\u5B9E\u5C42\u2192\u53D9\u4E8B\u5C42\u901A\u9053\u95ED\u73AF", effort: "S", verdict_gate_stamp: ADJUDICATION_PROTOCOL_VERSION + " / " + strategyBand, evidence_refs: ["EV-AUDIT-" + R + "-07"], degraded_note: null },
    { rec_id: "R-AUDIT-" + R + "-2", priority: "P2", action: intake.cache_hit && !intake.refreshed ? "intake \u7F13\u5B58\u547D\u4E2D\u672A\u5237\u65B0\uFF1A\u8FDC\u7AEF\u65B0\u63D0\u4EA4\u4E0D\u53EF\u89C1\u2014\u2014\u5982\u9700\u6700\u65B0\u5FEB\u7167\u7528 --refresh \u663E\u5F0F opt-in\uFF08\u4E0D\u81EA\u52A8 pull \u4FDD\u9694\u79BB\uFF09" : "\u5FEB\u7167\u4E3A\u672C\u6B21 fetch/\u672C\u5730\u89C2\u6D4B\u65F6\u70B9", rationale: "\u5FEB\u7167\u65F6\u70B9\u62AB\u9732\u5DF2\u843D\uFF08snapshot_fetched_at\uFF09\uFF1B\u7F13\u5B58\u547D\u4E2D\u4E0E\u5237\u65B0\u533A\u5206\u5982\u5B9E", expected_impact: "staleness \u98CE\u9669\u5982\u5B9E\u62AB\u9732", effort: "S", verdict_gate_stamp: ADJUDICATION_PROTOCOL_VERSION + " / " + strategyBand, evidence_refs: ["EV-AUDIT-" + R + "-07"], degraded_note: null }
  ];
  const HEADLINE = NAME + " Macro-B audit\uFF08capability 1 of 5 \xB7 preview\uFF09\uFF1A" + probes.commitCount + " commits / ADR " + ev.tc2.total + " \u4EFD / facts " + col.realFacts.length + "\u2014\u2014TC-1 " + ev.tc1.verdict + "\uFF08n=" + ev.tc1.judgeable_n + "\uFF09\u3001TC-2 " + ev.tc2.verdict + "\uFF08mean=" + measurements.tc2.mean_ratio_4 + "\uFF09\u3001TC-3 " + ev.tc3.verdict + "\uFF08" + measurements.tc3.lowest_ratio_4 + "\uFF09" + (bhvRan ? "\uFF0Bbehavior " + behaviorBand : "\uFF08behavior \u8C61\u9650 codelore \u7F3A\u5E2D\u5982\u5B9E not_applicable\uFF09") + (intakeEscalation(probes.fieldStats) !== "none" ? "\uFF0Bquarantine \u75C5\u6001\u5347\u7EA7=" + intakeEscalation(probes.fieldStats) : "") + "\u2192 \u7EFC\u5408\u88C1\u5B9A " + strategyBand + "\uFF08\u4E09\u6863\u5982\u5B9E\u843D\u6570" + (anchorQuarantined ? "\uFF1B\u951A\u75C5\u6001\u2192facts.duckdb \u4EC5 quarantine_log \u884C\u3001fact \u884C\u4E0D\u843D\u5E93" : "") + "\uFF09\u3002";
  const limitations = [
    "one-shot \u5FEB\u7167\u5BA1\u8BA1\uFF1A\u672C\u62A5\u544A\u88C1\u5B9A=\u5BF9 snapshot_fetched_at=" + String(intake.snapshot_fetched_at) + " \u65F6\u70B9\u5FEB\u7167\u7684\u5B9E\u6D4B\u2014\u2014" + (intake.cache_hit && !intake.refreshed ? "intake \u7F13\u5B58\u547D\u4E2D\u672A\u5237\u65B0\uFF0C\u8FDC\u7AEF\u65B0\u63D0\u4EA4\u4E0D\u53EF\u89C1\uFF08--refresh \u663E\u5F0F opt-in \u53EF\u5237\u65B0\uFF1B\u4E0D\u81EA\u52A8 pull \u4FDD\u9694\u79BB\u7EAA\u5F8B\uFF09" : "\u5FEB\u7167\u65F6\u70B9\u5982\u5B9E\u62AB\u9732"),
    "\u91C7\u96C6\u9762=strategy\uFF08S1+S2\uFF09" + (bhvRan ? "\uFF0Bbehavior\uFF08codelore \u884C\u4E3A\u4E09\u9762\uFF09" : "\uFF1Bbehavior \u8C61\u9650 codelore \u672A\u89E3\u6790\u5982\u5B9E not_applicable"),
    "structure/supply_chain \u8C61\u9650 not_applicable\uFF08supply-chain: " + UNVERIFIED_MARK + "\u2014\u2014Scorecard \u672A\u63A5\u5165\uFF0CD-034\u2462\uFF09",
    "\u53CD\u590D\u63A5\u53D7\u975E\u8DD1\u901A\uFF08D-033\uFF09\uFF1ATC \u4E09\u6863\u88C1\u5B9A supported/unsupported/insufficient \u5982\u5B9E\u843D\u6570\uFF0Cone-shot \u6821\u51C6+\u5192\u70DF\u4E0D\u6784\u6210\u6CDB\u5316\u8BC1\u636E"
  ];
  if (anchorQuarantined) {
    limitations.push("\u951A\u5B57\u6BB5\u75C5\u6001\uFF1AHEAD %cI quarantined\uFF08anchor_head_date_malformed\uFF09\u2192 audit_fact \u884C\u4E0D\u843D\u5E93\uFF08observed_at NOT NULL \u4E0D\u843D\u4F2A\u503C\uFF09\uFF1Bquarantine_log \u7559\u75D5 recorded_at=NULL\uFF0C\u6574\u4ED3 unsupported");
  }
  const disclosure = {
    capability_label: "capability 1 of 5 \xB7 preview",
    calibration_scope: NAME + " Macro-B audit\uFF08audit \u4E00\u7B49\u547D\u4EE4\u9762\uFF1Bscale=Macro-B \u5DF2\u4E0A\u67B6\uFF09",
    structural_limitations: limitations,
    not_in_preview: ["Micro-A", "Micro-B", "Macro-C", "Macro-A"]
  };
  const quarantinedRows = probes.fieldEvents.filter(function(e) {
    return e.disposition === "quarantined";
  });
  const intakeHealth = {
    fields: probes.fieldStats.map(function(s) {
      return { field_name: s.field_name, total: s.total, clean: s.clean, normalized: s.normalized, quarantined: s.quarantined };
    }),
    affected_commits: new Set(quarantinedRows.map(function(e) {
      return e.commit_sha;
    })).size,
    excluded_commits: excludedCommits,
    quarantined_rows: quarantinedRows.map(function(e) {
      return { commit_sha: e.commit_sha, field_name: e.field_name, reason_code: e.reason_code, raw_echo: rawEcho(e.raw) };
    }),
    threshold_ratio: QUARANTINE_FIELD_RATIO_RED,
    escalation: intakeEscalation(probes.fieldStats),
    recorded_at: probes.headDate
  };
  const reportInput = {
    report_id: "MA-AUDIT-" + R + "-MACRO-B",
    stability: "preview",
    capabilities: ["macro-b"],
    scale,
    subject_ref: NAME + "@" + probes.headSha.slice(0, 12),
    generated_at: HEAD_AT,
    trace_id: ctx.traceId,
    baggage_id: ctx.traceId,
    headline: HEADLINE,
    confidence: 0.6,
    stale: { marker: "fresh", sla_seconds: 86400, lag_seconds: 0, read_model_version: REPORT_SKELETON_VERSION, fact_watermark_version: "1" },
    fact_ids: col.realFacts.map(function(f) {
      return f.fact_id;
    }),
    top_findings: ["EV-AUDIT-" + R + "-01", "EV-AUDIT-" + R + "-03", "EV-AUDIT-" + R + "-04"],
    evidence,
    claims,
    quadrants,
    recommendations,
    adjudication_entries: adjudicationEntries,
    decided_at: HEAD_AT,
    commit_anchor: probes.headSha,
    tree_anchor: probes.treeSha,
    gate_ref: GATE_REF,
    degraded: false,
    degraded_reason: null,
    preview_disclosure: disclosure,
    intake_health: intakeHealth,
    human: { status: "pending", adjudicator: "user", text: null, decided_at: null }
  };
  const FACT_WRITE_BATCH = 500;
  const dbPath = join9(outDir, "facts.duckdb");
  if (existsSync6(dbPath)) {
    unlinkSync(dbPath);
  }
  if (existsSync6(dbPath + ".wal")) {
    unlinkSync(dbPath + ".wal");
  }
  const writer = await openWriter(dbPath);
  const seen = /* @__PURE__ */ new Set();
  let factsWritten = 0;
  let eventsWritten = 0;
  const crashCtx = function(sha) {
    return { repo_ref: ctx.repoRef, run_id: ctx.traceId, commit_sha: sha, head_date: probes.headDate, collector: "macro-audit audit" };
  };
  const crashCounts = function() {
    return countsFromStats(probes.fieldStats, probes.commitCount, factsWritten, eventsWritten);
  };
  try {
    const commitShaSet = new Set(probes.commits.map(function(c) {
      return c.sha;
    }));
    const factsBySha = /* @__PURE__ */ new Map();
    const restFacts = [];
    for (const f of col.realFacts) {
      if (commitShaSet.has(f.subject_ref)) {
        const arr = factsBySha.get(f.subject_ref) || [];
        arr.push(f);
        factsBySha.set(f.subject_ref, arr);
      } else {
        restFacts.push(f);
      }
    }
    const eventsBySha = /* @__PURE__ */ new Map();
    for (const fe of probes.fieldEvents) {
      const arr = eventsBySha.get(fe.commit_sha) || [];
      arr.push(fe);
      eventsBySha.set(fe.commit_sha, arr);
    }
    const appendEvents = async function(evs) {
      for (const fe of evs) {
        await appendQuarantineEvent(writer, { run_id: ctx.traceId, commit_sha: fe.commit_sha, field_name: fe.field_name, disposition: fe.disposition, reason_code: fe.reason_code, raw: fe.raw, collector: "macro-audit audit", recorded_at: probes.headDate });
        eventsWritten += 1;
      }
    };
    for (const c of probes.commits) {
      const cFacts = anchorQuarantined ? [] : factsBySha.get(c.sha) || [];
      const cEvents = eventsBySha.get(c.sha) || [];
      if (cFacts.length > 0 || cEvents.length > 0) {
        await runInTransaction(writer, async function() {
          for (const f of cFacts) {
            if (!seen.has(f.fact_id)) {
              seen.add(f.fact_id);
              await appendFact(writer, f);
              factsWritten += 1;
            }
          }
          await appendEvents(cEvents);
        });
      }
      const cn = await (await writer.run("SELECT COUNT(*) FROM quarantine_log WHERE run_id = ? AND commit_sha = ?", [ctx.traceId, c.sha])).getRows();
      if (Number(cn[0][0]) !== cEvents.length) {
        throw protocolCrashError("INTAKE-IDENTITY-MISMATCH", "\u9010 commit \u589E\u91CF\u6052\u7B49\u5F0F\u65AD\u8A00\u5931\u8D25\uFF1Asha=" + c.sha + " \u671F\u671B " + cEvents.length + " \u5E93\u5185 " + Number(cn[0][0]), { crash_location: "audit.ts:per-commit-identity", run_context: crashCtx(c.sha), counts: crashCounts() });
      }
    }
    const orphanEvents = probes.fieldEvents.filter(function(fe) {
      return !commitShaSet.has(fe.commit_sha);
    });
    for (let i = 0; i < restFacts.length; i += FACT_WRITE_BATCH) {
      const batch = restFacts.slice(i, i + FACT_WRITE_BATCH);
      const lastChunk = i + FACT_WRITE_BATCH >= restFacts.length;
      await runInTransaction(writer, async function() {
        if (!anchorQuarantined) {
          for (const f of batch) {
            if (!seen.has(f.fact_id)) {
              seen.add(f.fact_id);
              await appendFact(writer, f);
              factsWritten += 1;
            }
          }
        }
        if (lastChunk) {
          await appendEvents(orphanEvents);
        }
      });
    }
    if (restFacts.length === 0 && orphanEvents.length > 0) {
      await runInTransaction(writer, async function() {
        await appendEvents(orphanEvents);
      });
    }
  } catch (e) {
    try {
      closeDuckdb(writer);
    } catch (_) {
    }
    if (isProtocolCrash(e)) {
      throw e;
    }
    if (classifyWriteError(e) === "io") {
      throw new AuditIoError("fact/quarantine \u5199 IO \u5931\u8D25\uFF08D-115\u2462 IO \u5931\u8D25\u7C7B\u9000\u51FA\u7C7B\u2014\u2014\u975E\u534F\u8BAE\u5D29\u6E83\uFF09\uFF1A" + String(e.message || e));
    }
    throw protocolCrashError("QUARANTINE-CONSTRAINT", "fact/quarantine \u4E8B\u52A1\u5199\u5931\u8D25\uFF08\u8BE5\u6279 ROLLBACK \u65E0\u534A\u622A\u5199\uFF09\uFF1A" + String(e.message || e), { crash_location: "audit.ts:fact-write-tx", run_context: crashCtx(null), counts: crashCounts() });
  }
  const dbCounts = await queryQuarantineCounts(writer, ctx.traceId);
  const identityIssues = intakeIdentityIssues(probes.fieldStats, dbCounts);
  await writer.run("FORCE CHECKPOINT");
  closeDuckdb(writer);
  if (identityIssues.length > 0) {
    throw protocolCrashError("INTAKE-IDENTITY-MISMATCH", "\u6052\u7B49\u5F0F\u65AD\u8A00\u5931\u8D25\uFF1A" + JSON.stringify(identityIssues), { crash_location: "audit.ts:intake-identity", run_context: crashCtx(null), counts: crashCounts() });
  }
  const report = buildReport(reportInput);
  const reportMd = renderMarkdown(report) + NL3;
  const sidecarJson = renderSidecar(report) + NL3;
  let artifacts = null;
  writeFileSync3(join9(outDir, "report.md"), reportMd, "utf8");
  writeFileSync3(join9(outDir, "report.json"), sidecarJson, "utf8");
  writeFileSync3(join9(outDir, FACTS_NAME), anchorQuarantined ? "" : col.realFacts.map(function(f) {
    return JSON.stringify(f);
  }).join(NL3) + NL3, "utf8");
  artifacts = persistOut ? { report_md: join9(outDir, "report.md"), report_json: join9(outDir, "report.json"), facts_jsonl: join9(outDir, FACTS_NAME), measurements: join9(outDir, MEAS_NAME), duckdb: dbPath } : null;
  const resultOutDir = persistOut ? outDir : null;
  if (!persistOut) {
    rmSync4(outDir, { recursive: true, force: true });
  }
  return {
    report_id: report.report_id,
    receipt_id: report.receipt.receipt_id,
    scale: report.scale,
    stability: report.stability,
    capabilities: report.capabilities,
    overall_verdict: report.overall_verdict,
    verdict: report.verdict,
    intake_quarantine: { quarantined: intakeHealth.fields.reduce(function(s, f) {
      return s + f.quarantined;
    }, 0), normalized: intakeHealth.fields.reduce(function(s, f) {
      return s + f.normalized;
    }, 0), affected_commits: intakeHealth.affected_commits, escalation: intakeHealth.escalation, facts_persisted: !anchorQuarantined },
    degraded_mode: report.degraded_mode,
    head_sha: probes.headSha,
    tree_sha: probes.treeSha,
    commit_count: probes.commitCount,
    adr_count: ev.tc2.total,
    fact_count: col.realFacts.length,
    repo_name: NAME,
    resolved_root: repoRoot,
    intake_kind: intake.kind,
    snapshot_fetched_at: intake.snapshot_fetched_at,
    cache_hit: intake.cache_hit,
    refreshed: intake.refreshed,
    codelore: { resolved: col.codeloreResolution !== null, pinned: col.codeloreResolution ? col.codeloreResolution.pinned : false, version: col.codeloreResolution ? col.codeloreResolution.version : null },
    out_dir: resultOutDir,
    artifacts,
    report_markdown: reportMd,
    sidecar_json: sidecarJson,
    measurements
  };
}

// src/audit/file-card.ts
import { execFileSync as execFileSync2 } from "node:child_process";
import { existsSync as existsSync7, mkdirSync as mkdirSync6 } from "node:fs";
import { dirname as dirname6 } from "node:path";

// src/fact/file-card.ts
var FILE_CARD_SCHEMA_VERSION = "file-card@v1";
var FILE_CARD_RULE_VERSION = "hotspot_priority_v1";
var FILE_CARD_TOP_N = 20;
var FILE_CARD_INSUFFICIENT_MIN_REVS = 3;
function headShaOfRepoRef(repoRef) {
  const i = repoRef.lastIndexOf("@");
  return i >= 0 && i < repoRef.length - 1 ? repoRef.slice(i + 1) : null;
}
function asNum(v) {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
function fileCardCitationKeys(card) {
  const keys = ["observation.head_sha", "staleness.drift", "source", "failure_state"];
  for (const k of Object.keys(card.kernel.facet_rows).sort()) {
    keys.push("kernel.facet_rows." + k);
  }
  if (card.derived.revisions !== null) {
    keys.push("derived.revisions");
  }
  if (card.derived.hotspot_score !== null) {
    keys.push("derived.hotspot_score");
  }
  if (card.derived.percentile_rank.value !== null) {
    keys.push("derived.percentile_rank");
  }
  if (card.derived.top_n_flag.value !== null) {
    keys.push("derived.top_n_flag");
  }
  if (card.derived.priority_band.value !== null) {
    keys.push("derived.priority_band");
  }
  return keys;
}
function missCard(subject, miss, input, headSha2) {
  return {
    schema_version: FILE_CARD_SCHEMA_VERSION,
    card_type: miss.state === "not_applicable" ? "not_applicable" : "miss",
    advisory: true,
    subject,
    repo_ref: input.setRepoRef,
    observation: {
      head_sha: headSha2,
      pinned_sha: input.pinnedSha,
      pin_matches_observed_head: input.pinnedSha !== null && headSha2 !== null ? input.pinnedSha === headSha2 : null
    },
    staleness: {
      observed_head_sha: headSha2,
      current_head_sha: input.currentHeadSha,
      drift: input.currentHeadSha === null || headSha2 === null ? "unknown" : input.currentHeadSha === headSha2 ? "fresh" : "behind"
    },
    source: input.source,
    failure_state: miss.state === "not_applicable" ? "not_applicable" : "ok",
    miss,
    kernel: { facet_rows: {} },
    derived: {
      rule_version: FILE_CARD_RULE_VERSION,
      revisions: null,
      hotspot_score: null,
      percentile_rank: { scope: "repo", metric: "hotspots.hotspot_score", value: null },
      top_n_flag: { n: FILE_CARD_TOP_N, scope: "repo", metric: "hotspots.hotspot_score", value: null },
      priority_band: { value: null, inputs: { hotspot_score: null, percentile_rank: null } },
      suppressed_by: miss.state === "not_applicable" ? "not_applicable" : null
    },
    narrative: { hints: [], key_check: { referenced: [], missing: [], ok: true } }
  };
}
function buildFileCard(input) {
  const norm = normalizeSubjectPath(input.subject);
  if (!norm.ok) {
    return missCard(String(input.subject), {
      state: "not_tracked_at_sha",
      detail: "subject \u5F52\u4E00\u62D2\u7EDD reason=" + norm.reason + "\uFF08SCIP \u4E94\u89C4\u5219\u8BFB\u4FA7\u955C\u50CF\uFF09"
    }, input, input.setRepoRef !== null ? headShaOfRepoRef(input.setRepoRef) : null);
  }
  const subject = norm.subject;
  const headSha2 = input.setRepoRef !== null ? headShaOfRepoRef(input.setRepoRef) : null;
  if (input.setRepoRef === null) {
    if (input.availableHeadShas.length === 0) {
      return missCard(subject, {
        state: "never_collected",
        detail: "\u8BE5 repo \u65E0\u4EFB\u4F55 Micro-B \u89C2\u6D4B\u96C6\u2014\u2014\u6587\u4EF6\u7EA7\u4E8B\u5B9E\u4ECE\u672A\u91C7\u96C6",
        cli_guidance: input.cliGuidance === null ? void 0 : input.cliGuidance
      }, input, null);
    }
    return missCard(subject, {
      state: "not_tracked_at_sha",
      detail: "pin \u89C2\u6D4B\u96C6\u7F3A\u5E2D\uFF1Aat:" + String(input.pinnedSha) + " \u672A\u91C7\u96C6\uFF08\u4E0D\u5B9E\u73B0\u5F3A\u5236 HEAD \u5339\u914D\uFF0C\u7167\u7B54\u4E0D\u62D2\u7B54\uFF09",
      available_head_shas: input.availableHeadShas.slice(),
      cli_guidance: input.cliGuidance === null ? void 0 : input.cliGuidance
    }, input, null);
  }
  const mine = input.setFacts.filter(function(f) {
    return f.metric === "codelore.file_facet_row" && f.subject_ref === subject;
  });
  if (mine.length === 0) {
    const skip = input.setFacts.filter(function(f) {
      if (f.metric !== "codelore.file_subject_skip") {
        return false;
      }
      try {
        const v = JSON.parse(f.value_json);
        return v.raw_path === subject || v.raw_path === input.subject;
      } catch {
        return false;
      }
    })[0];
    if (skip) {
      let reason = "unclassified";
      try {
        reason = String(JSON.parse(skip.value_json).reason);
      } catch {
      }
      return missCard(subject, {
        state: "not_applicable",
        detail: "subject \u53D1\u5C04\u4FA7\u5224\u5B9A\u4E0D\u9002\u7528\uFF08" + reason + "\uFF09\u2014\u2014\u5408\u6CD5\u7A7A\u503C\u975E\u91C7\u96C6\u7F3A\u6F0F\uFF0C\u4E0D\u51FA\u7A7A\u5361"
      }, input, headSha2);
    }
    const edgeFact = input.setFacts.filter(function(f) {
      if (f.metric !== "file.renamed") {
        return false;
      }
      try {
        return JSON.parse(f.value_json).from === subject;
      } catch {
        return false;
      }
    })[0];
    if (edgeFact) {
      const ev = JSON.parse(edgeFact.value_json);
      const targetHasFacts = input.setFacts.some(function(f) {
        return f.metric === "codelore.file_facet_row" && f.subject_ref === ev.to;
      });
      return missCard(subject, {
        state: "renamed_to",
        detail: "\u8840\u7F18\u68C0\u51FA " + subject + " \u2192 " + ev.to + "\uFF08commit=" + ev.commit_sha.slice(0, 7) + " similarity=" + ev.similarity + "\uFF09\u2014\u2014\u6761\u4EF6\u8DF3\u8F6C\uFF1A\u91CD\u9A8C\u8BC1\u901A\u8FC7\u65B9\u53EF\u8BF7\u6C42\u76EE\u6807\u5361",
        renamed_to: ev.to,
        lineage_edge: { from: ev.from, to: ev.to, commit_sha: ev.commit_sha, similarity: ev.similarity },
        revalidated: targetHasFacts
      }, input, headSha2);
    }
    return missCard(subject, {
      state: "not_tracked_at_sha",
      detail: "\u89C2\u6D4B\u96C6 head=" + String(headSha2).slice(0, 7) + " \u5185\u65E0\u8BE5 subject \u7684 per-file \u4E8B\u5B9E\u4E14\u65E0\u8840\u7F18\u8FB9\u2014\u2014\u8BE5 sha \u6811\u4E0B\u4E0D\u8FFD\u8E2A",
      cli_guidance: input.cliGuidance === null ? void 0 : input.cliGuidance
    }, input, headSha2);
  }
  const facetRows = {};
  for (const f of mine) {
    let v;
    try {
      v = JSON.parse(f.value_json);
    } catch {
      continue;
    }
    const analysis = typeof v.analysis === "string" ? v.analysis : "unknown";
    const row = v.row !== null && typeof v.row === "object" ? v.row : {};
    const arr = facetRows[analysis] || (facetRows[analysis] = []);
    arr.push({ row, fact_ref: f.fact_id, observed_at: f.observed_at, evidence_ref: f.evidence_ref });
  }
  const analyses = Object.keys(facetRows).sort();
  const ordered = {};
  for (const a of analyses) {
    ordered[a] = facetRows[a];
  }
  let revisions = null;
  let hotspotScore = null;
  for (const r of ordered["revisions"] || []) {
    const n = asNum(r.row["n_revs"]);
    if (n !== null && (revisions === null || n > revisions)) {
      revisions = n;
    }
  }
  for (const r of ordered["hotspots"] || []) {
    const n = asNum(r.row["revisions"]);
    if (n !== null && (revisions === null || n > revisions)) {
      revisions = n;
    }
    const s = asNum(r.row["hotspot_score"]);
    if (s !== null && (hotspotScore === null || s > hotspotScore)) {
      hotspotScore = s;
    }
  }
  const peerScores = [];
  for (const f of input.setFacts) {
    if (f.metric !== "codelore.file_facet_row") {
      continue;
    }
    try {
      const v = JSON.parse(f.value_json);
      if (v.analysis === "hotspots" && v.row) {
        const s = asNum(v.row.hotspot_score);
        if (s !== null) {
          peerScores.push(s);
        }
      }
    } catch {
    }
  }
  let pct = null;
  if (hotspotScore !== null && peerScores.length > 0) {
    let less = 0, eq = 0;
    for (const s of peerScores) {
      if (s < hotspotScore) {
        less += 1;
      } else if (s === hotspotScore) {
        eq += 1;
      }
    }
    pct = (less + eq / 2) / peerScores.length;
  }
  const topN = hotspotScore === null ? null : peerScores.filter(function(s) {
    return s > hotspotScore;
  }).length < FILE_CARD_TOP_N;
  const band = pct === null ? null : pct >= 0.9 ? "high" : pct >= 0.6 ? "medium" : "low";
  let failure = "ok";
  if (revisions === 1) {
    failure = "new_file";
  } else if (revisions !== null && revisions < FILE_CARD_INSUFFICIENT_MIN_REVS) {
    failure = "insufficient_history";
  }
  const suppressed = failure !== "ok";
  const card = {
    schema_version: FILE_CARD_SCHEMA_VERSION,
    card_type: "file-audit-card",
    advisory: true,
    subject,
    repo_ref: input.setRepoRef,
    observation: {
      head_sha: headSha2,
      pinned_sha: input.pinnedSha,
      pin_matches_observed_head: input.pinnedSha !== null && headSha2 !== null ? input.pinnedSha === headSha2 : null
    },
    staleness: {
      observed_head_sha: headSha2,
      current_head_sha: input.currentHeadSha,
      drift: input.currentHeadSha === null || headSha2 === null ? "unknown" : input.currentHeadSha === headSha2 ? "fresh" : "behind"
    },
    source: input.source,
    failure_state: failure,
    miss: null,
    kernel: { facet_rows: ordered },
    derived: {
      rule_version: FILE_CARD_RULE_VERSION,
      revisions,
      hotspot_score: hotspotScore,
      percentile_rank: { scope: "repo", metric: "hotspots.hotspot_score", value: suppressed ? null : pct },
      top_n_flag: { n: FILE_CARD_TOP_N, scope: "repo", metric: "hotspots.hotspot_score", value: suppressed ? null : topN },
      priority_band: { value: suppressed ? null : band, inputs: { hotspot_score: hotspotScore, percentile_rank: suppressed ? null : pct } },
      suppressed_by: suppressed ? failure : null
    },
    narrative: { hints: [], key_check: { referenced: [], missing: [], ok: true } }
  };
  card.narrative.hints = fileCardCitationKeys(card);
  card.narrative.key_check = { referenced: card.narrative.hints.slice(), missing: [], ok: true };
  return card;
}

// src/fact/projection.ts
var MAX_LIMIT = 500;
var PROJECTION_COLUMNS = "fact_id, trace_id, baggage_id, scale, quadrant, dimension, collector_id, repo_ref, subject_ref, evidence_ref, metric, value_json, CAST(observed_at AS VARCHAR) AS observed_at";
function buildProjectionSql(filter) {
  const where = [];
  const params = [];
  if (filter.scale) {
    where.push("scale = ?");
    params.push(filter.scale);
  }
  if (filter.repo_ref) {
    where.push("repo_ref = ?");
    params.push(filter.repo_ref);
  }
  if (filter.subject_ref) {
    where.push("subject_ref = ?");
    params.push(filter.subject_ref);
  }
  const limit = filter.limit === void 0 ? 50 : Math.min(Math.max(Math.floor(filter.limit), 1), MAX_LIMIT);
  const sql = "SELECT " + PROJECTION_COLUMNS + " FROM audit_fact" + (where.length ? " WHERE " + where.join(" AND ") : "") + " ORDER BY fact_seq LIMIT " + limit;
  return { sql, params };
}
async function projectFacts(dbPath, filter) {
  const conn = await openReader(dbPath);
  try {
    const q = buildProjectionSql(filter);
    assertAppendOnly(q.sql);
    const reader = await conn.run(q.sql, q.params);
    const rows = await reader.getRows();
    const names = reader.columnNames();
    return rows.map(normalizeFactRow(names));
  } finally {
    closeDuckdb(conn);
  }
}
function normalizeFactRow(names) {
  return function(r) {
    const o = {};
    names.forEach(function(n, i) {
      const v = r[i];
      o[n] = typeof v === "bigint" ? Number(v) : v instanceof Date ? v.toISOString() : v;
    });
    return o;
  };
}
var FILE_CARD_SET_CAP = 2e5;
function likeEscape(s) {
  return s.split("!").join("!!").split("%").join("!%").split("_").join("!_");
}
async function projectFileCard(dbPath, q) {
  const conn = await openReader(dbPath);
  try {
    const setSql = "SELECT repo_ref, MAX(CAST(observed_at AS VARCHAR)) AS last_obs FROM audit_fact WHERE scale = 'Micro-B' AND repo_ref LIKE ? ESCAPE '!' GROUP BY repo_ref ORDER BY last_obs DESC, repo_ref ASC LIMIT 1000";
    assertAppendOnly(setSql);
    const setReader = await conn.run(setSql, [likeEscape(q.repo) + "@%"]);
    const setRows = await setReader.getRows();
    const sets = setRows.map(function(r) {
      const rr = String(r[0]);
      return { repo_ref: rr, head_sha: headShaOfRepoRef(rr) };
    });
    const shas = sets.map(function(s) {
      return s.head_sha;
    }).filter(function(s) {
      return s !== null;
    });
    let picked = null;
    if (q.at !== void 0 && q.at !== null && q.at.length > 0) {
      picked = sets.filter(function(s) {
        return s.head_sha === q.at || s.head_sha !== null && q.at.length >= 7 && s.head_sha.indexOf(q.at) === 0;
      })[0] || null;
    } else {
      picked = sets[0] || null;
    }
    const facts = [];
    if (picked !== null) {
      const fSql = "SELECT " + PROJECTION_COLUMNS + " FROM audit_fact WHERE scale = ? AND repo_ref = ? ORDER BY fact_seq LIMIT " + FILE_CARD_SET_CAP;
      assertAppendOnly(fSql);
      const fReader = await conn.run(fSql, ["Micro-B", picked.repo_ref]);
      const fRows = await fReader.getRows();
      const names = fReader.columnNames();
      const norm = normalizeFactRow(names);
      for (const r of fRows) {
        facts.push(norm(r));
      }
    }
    return buildFileCard({
      subject: q.subject,
      setRepoRef: picked === null ? null : picked.repo_ref,
      setFacts: facts,
      availableHeadShas: shas,
      pinnedSha: q.at !== void 0 && q.at !== null && q.at.length > 0 ? q.at : null,
      currentHeadSha: q.current_head_sha === void 0 ? null : q.current_head_sha,
      source: q.source || "unknown",
      cliGuidance: q.cli_guidance === void 0 ? null : q.cli_guidance
    });
  } finally {
    closeDuckdb(conn);
  }
}
var QUAR_PROJECTION_COLUMNS = "run_id, commit_sha, field_name, disposition, reason_code, raw_bytes_hex, is_trunc, original_length, sha256_full, collector, CAST(recorded_at AS VARCHAR) AS recorded_at";
function buildQuarantineSql(filter) {
  const where = [];
  const params = [];
  if (filter.run_id) {
    where.push("run_id = ?");
    params.push(filter.run_id);
  }
  if (filter.field_name) {
    where.push("field_name = ?");
    params.push(filter.field_name);
  }
  const limit = filter.limit === void 0 ? 50 : Math.min(Math.max(Math.floor(filter.limit), 1), MAX_LIMIT);
  const sql = "SELECT " + QUAR_PROJECTION_COLUMNS + " FROM quarantine_log" + (where.length ? " WHERE " + where.join(" AND ") : "") + " ORDER BY q_seq LIMIT " + limit;
  return { sql, params };
}
async function projectQuarantine(dbPath, filter) {
  const conn = await openReader(dbPath);
  try {
    const q = buildQuarantineSql(filter);
    assertAppendOnly(q.sql);
    const reader = await conn.run(q.sql, q.params);
    const rows = await reader.getRows();
    const names = reader.columnNames();
    return rows.map(function(r) {
      const o = {};
      names.forEach(function(n, i) {
        const v = r[i];
        o[n] = typeof v === "bigint" ? Number(v) : v instanceof Date ? v.toISOString() : v;
      });
      return o;
    });
  } finally {
    closeDuckdb(conn);
  }
}

// src/audit/file-card.ts
var AuditFileError = class extends Error {
  code;
  constructor(code, message) {
    super(message);
    this.code = code;
  }
};
function isAuditFileError(e) {
  return e instanceof AuditFileError || typeof e === "object" && e !== null && typeof e.code === "string" && String(e.code).indexOf("AUDIT-FILE-") === 0;
}
function gitOut(root, args) {
  return execFileSync2("git", ["-C", root].concat(args), { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 }).trim();
}
function defaultCodeloreCollect(ctx, repoRoot) {
  return collectCodeloreFacets({ repoRoot, facets: CODELORE_BEHAVIOR_FACETS }, ctx);
}
function defaultLineageCollect(ctx, repoRoot) {
  const rawLog = gitOut(repoRoot, gitRenameLogArgs(RENAME_DEFAULT_THRESHOLD));
  return collectFileLineage({
    edges: parseRenameLogZ(rawLog),
    headSha: headShaOf(ctx.repoRef),
    threshold: RENAME_DEFAULT_THRESHOLD,
    detectorVersion: RENAME_DETECTOR_VERSION,
    gitVersion: probeGitVersion()
  }, { runId: ctx.runId, traceId: ctx.traceId, repoRef: ctx.repoRef, scale: "Micro-B", observedAt: ctx.observedAt });
}
function headShaOf(repoRef) {
  const i = repoRef.lastIndexOf("@");
  return i >= 0 && i < repoRef.length - 1 ? repoRef.slice(i + 1) : null;
}
async function runAuditFile(opts) {
  const intake = repoAdd(opts.input, { cwd: opts.cwd || process.cwd() });
  const repoRoot = intake.resolved_root;
  const name = auditRepoName(opts.input, repoRoot);
  let headSha2;
  try {
    headSha2 = gitOut(repoRoot, ["rev-parse", "HEAD"]);
    if (!/^[0-9a-f]{40}$/i.test(headSha2)) {
      throw new Error("unexpected rev-parse output");
    }
  } catch (e) {
    throw new AuditFileError("AUDIT-FILE-SHA-UNREACHABLE", "\u76EE\u6807 SHA \u5BF9\u8C61\u5E93\u4E0D\u53EF\u8FBE\uFF08git rev-parse HEAD\uFF09\uFF1A" + String(e.message));
  }
  const headRaw = gitOut(repoRoot, ["log", "-1", "--format=%cI"]);
  const absorbed = absorbGitIsoDialect(headRaw);
  const cls = classifyGitIsoField(absorbed.value);
  const headDate = cls.value !== null ? cls.value : null;
  const repoRef = name + "@" + headSha2;
  const pinned = opts.at !== void 0 && opts.at.length > 0;
  let backfilled = false;
  let emitted = 0;
  if (!pinned) {
    const preCard = existsSync7(opts.db) ? await projectFileCard(opts.db, { repo: name, subject: opts.path, current_head_sha: headSha2 }) : null;
    const setExists = preCard !== null && preCard.observation.head_sha === headSha2;
    const subjectHasFacts = preCard !== null && Object.keys(preCard.kernel.facet_rows).length > 0;
    if (!setExists || !subjectHasFacts) {
      const ctx = macroBContext("audit-file-" + name, name, headSha2, headDate, headRaw);
      const codeloreFn = opts.collectors && opts.collectors.codelore || defaultCodeloreCollect;
      const lineageFn = opts.collectors && opts.collectors.lineage || defaultLineageCollect;
      const batch = codeloreFn(ctx, repoRoot).concat(lineageFn(ctx, repoRoot));
      mkdirSync6(dirname6(opts.db), { recursive: true });
      const writer = await openWriter(opts.db);
      try {
        const seen = /* @__PURE__ */ new Set();
        for (const f of batch) {
          if (seen.has(f.fact_id)) {
            continue;
          }
          seen.add(f.fact_id);
          try {
            await appendFact(writer, f);
            emitted += 1;
          } catch (e) {
            if (classifyWriteError(e) !== "constraint") {
              throw e;
            }
          }
        }
      } finally {
        closeDuckdb(writer);
      }
      backfilled = true;
    }
  }
  const card = existsSync7(opts.db) ? await projectFileCard(opts.db, {
    repo: name,
    subject: opts.path,
    at: pinned ? opts.at : void 0,
    current_head_sha: headSha2,
    source: backfilled ? "backfill" : "prefetch"
  }) : buildFileCard({
    // pin 且库缺席=零观测集——never_collected 照答不伪造
    subject: opts.path,
    setRepoRef: null,
    setFacts: [],
    availableHeadShas: [],
    pinnedSha: pinned ? opts.at : null,
    currentHeadSha: headSha2,
    source: "unknown",
    cliGuidance: null
  });
  return { card, backfilled, emitted, repo_ref: repoRef, repo_name: name, head_sha: headSha2 };
}

// src/cli.ts
import { writeFileSync as writeFileSync4, existsSync as existsSync8, mkdirSync as mkdirSync7 } from "node:fs";
import { join as join10, resolve as resolve4 } from "node:path";

// src/mcp-server.ts
import { execFileSync as execFileSync3 } from "node:child_process";
process.env.MACRO_AUDIT_MCP_STDIO = "1";
var MCP_PROTOCOL_VERSION = "2024-11-05";
var QUARANTINE_TOOL = {
  name: "quarantine",
  description: "read-only quarantine_log projection\uFF08#78/D-113\u2461\uFF09\uFF1A\u5B57\u6BB5\u7EA7\u75C5\u6001\u5904\u7F6E\u4E8B\u4EF6\u53F0\u8D26\u2014\u2014\u56FA\u5B9A\u5217\u96C6\uFF08run_id/commit_sha/field_name/disposition/reason_code/raw_bytes_hex/is_trunc/original_length/sha256_full/collector/recorded_at\uFF09\uFF0CREAD_ONLY \u5B9E\u4F8B\uFF0Climit\u2264500\u3002recorded_at=NULL=\u951A\u75C5\u6001\u2192\u89C2\u6D4B\u65F6\u70B9\u4E0D\u53EF\u5F97\uFF08D-108\u2463 NULL \u8BED\u4E49\u663E\u5F0F\u6587\u6848\uFF1A\u975E\u300C\u5F00\u653E\u5F0F\u300D\u7F3A\u7701\uFF0Crange \u8C13\u8BCD\u4E0D\u541E NULL\uFF09\u3002db \u5BFB\u5740\u540C facts \u94FE",
  inputSchema: {
    type: "object",
    properties: {
      db: { type: "string", description: "facts.duckdb \u7EDD\u5BF9\u8DEF\u5F84\uFF08\u53EF\u7701\u2014\u2014\u7701\u5219\u8D70\u670D\u52A1\u7AEF\u5BFB\u5740\u94FE\uFF09" },
      run: { type: "string", description: "run_id\uFF08trace_id hex32\uFF09\u8FC7\u6EE4" },
      field: { type: "string", description: "field_name \u8FC7\u6EE4\uFF08\u5982 committer_date / head_date\uFF09" },
      limit: { type: "number", description: "\u884C\u6570\u4E0A\u9650\uFF08\u2264500\uFF09" }
    },
    additionalProperties: false
  }
};
var FILE_CARD_TOOL = {
  name: "file_card",
  description: "read-only Micro-B \u6587\u4EF6\u7EA7\u5BA1\u8BA1\u5361\u6295\u5F71\uFF08#80 \u6B65\u2461/D-123/D-126/ADR-0023\uFF09\uFF1A\u4E09\u5C42\u5361\u5951\u7EA6\uFF08kernel facet_rows \u9010\u5B57\u6BB5\u76F4\u6295\u5E26 fact_ref \u951A\uFF0Bderived \u786E\u5B9A\u6027\u6D3E\u751F hotspot_priority_v1\uFF0Bnarrative \u952E\u5B58\u5728\u6027\u6821\u9A8C\uFF09\uFF0Badvisory:true \u7ED3\u6784\u6027\u9694\u79BB\uFF08\u65E0 verdict/gate-consumable \u5B57\u6BB5\uFF09\uFF0Bmiss \u56DB\u7C7B\u663E\u5F0F\u6001\uFF08never_collected \u9644 CLI \u8865\u91C7\u6307\u5F15\uFF0Fnot_tracked_at_sha\uFF0Fnot_applicable\uFF0Frenamed_to \u6761\u4EF6\u8DF3\u8F6C+revalidated\uFF09\uFF0Bat:<sha> pin\uFF0Bstaleness \u53CC\u5B57\u6BB5\uFF08observed/current head\uFF09",
  inputSchema: {
    type: "object",
    required: ["repo", "path"],
    properties: {
      db: { type: "string", description: "facts.duckdb \u7EDD\u5BF9\u8DEF\u5F84\uFF08\u53EF\u7701\u2014\u2014\u7701\u5219\u8D70\u670D\u52A1\u7AEF\u5BFB\u5740\u94FE\uFF09" },
      repo: { type: "string", description: "repo \u540D\uFF08repo_ref \u7684 @ \u524D\u7F00\u90E8\uFF09" },
      path: { type: "string", description: "\u6587\u4EF6\u8DEF\u5F84\uFF08\u4ED3\u6839\u76F8\u5BF9\uFF1B\u8BFB\u4FA7\u8FC7 subject \u5F52\u4E00\u5668\uFF09" },
      at: { type: "string", description: "at:<sha> pin\u2014\u2014\u89C2\u6D4B\u96C6 head_sha \u7CBE\u786E\u6216 \u22657 \u5B57\u7B26\u552F\u4E00\u524D\u7F00\uFF08\u5E38\u91CF\u7EAA\u5F8B\uFF09" },
      repo_path: { type: "string", description: "\u53EF\u9009\uFF1A\u672C\u5730\u4ED3\u8DEF\u5F84\u2014\u2014\u7ED9\u5219\u53EA\u8BFB git rev-parse HEAD \u63A2 staleness \u5F53\u524D\u951A" }
    },
    additionalProperties: false
  }
};
var FACTS_TOOL = {
  name: "facts",
  description: "read-only DuckDB facts projection (D-053\u2463)\uFF1A\u56FA\u5B9A SELECT \u5F62\uFF0CFactEvent \u5341\u4E09\u5217\uFF0CREAD_ONLY \u5B9E\u4F8B\uFF0Climit\u2264500\u3002db \u5BFB\u5740\u6536\u655B\u670D\u52A1\u7AEF\u89E3\u6790\uFF08#55/D-059\u2465\uFF09\uFF1Aarguments.db \u2192 server --db argv \u2192 MACRO_AUDIT_FACTS_DB env",
  inputSchema: {
    type: "object",
    properties: {
      db: { type: "string", description: "facts.duckdb \u7EDD\u5BF9\u8DEF\u5F84\uFF08\u53EF\u7701\u2014\u2014\u7701\u5219\u8D70\u670D\u52A1\u7AEF\u5BFB\u5740\u94FE\uFF09" },
      scale: { type: "string", enum: ["macro", "micro"] },
      repo: { type: "string", description: "owner/repo \u8FC7\u6EE4" },
      subject: { type: "string", description: "subject_ref \u8FC7\u6EE4" },
      limit: { type: "number", description: "\u884C\u6570\u4E0A\u9650\uFF08\u2264500\uFF09" }
    },
    additionalProperties: false
  }
};
var serverConfig = {};
function setMcpServerConfig(c) {
  serverConfig = c || {};
}
function resolveFactsDb(argDb) {
  const envDb = process.env.MACRO_AUDIT_FACTS_DB;
  return argDb || (serverConfig.db && serverConfig.db.length > 0 ? serverConfig.db : void 0) || (envDb && envDb.length > 0 ? envDb : void 0);
}
function ok(id, result) {
  return { jsonrpc: "2.0", id: id === void 0 ? null : id, result };
}
function fail(id, code, message) {
  return { jsonrpc: "2.0", id: id === void 0 ? null : id, error: { code, message } };
}
function asStr(v) {
  return typeof v === "string" && v.length > 0 ? v : void 0;
}
async function handleRpcMessage(msg) {
  const id = msg.id === void 0 ? null : msg.id;
  const isNotification = msg.id === void 0;
  const method = msg.method;
  if (typeof method !== "string" || method.length === 0) {
    if (isNotification) {
      return null;
    }
    return fail(id, -32600, "invalid request: method missing");
  }
  if (method === "notifications/initialized" || method.indexOf("notifications/") === 0) {
    return null;
  }
  if (isNotification) {
    return null;
  }
  if (method === "initialize") {
    const m = loadManifestMeta();
    return ok(id, {
      protocolVersion: MCP_PROTOCOL_VERSION,
      capabilities: { tools: {} },
      serverInfo: { name: "macro-audit", version: m.version }
    });
  }
  if (method === "ping") {
    return ok(id, {});
  }
  if (method === "tools/list") {
    return ok(id, { tools: [FACTS_TOOL, QUARANTINE_TOOL, FILE_CARD_TOOL] });
  }
  if (method === "tools/call") {
    const p = msg.params || {};
    if (p.name !== "facts" && p.name !== "quarantine" && p.name !== "file_card") {
      return fail(id, -32602, "unknown tool: " + String(p.name));
    }
    if (p.name === "file_card") {
      const a2 = p.arguments || {};
      const db2 = resolveFactsDb(asStr(a2.db));
      if (!db2) {
        return fail(id, -32602, "MCP-FACTS-DB-UNRESOLVED: facts db \u5BFB\u5740\u5931\u8D25\u2014\u2014arguments.db \u672A\u7ED9\u4E14\u670D\u52A1\u7AEF\u65E0 --db argv/MACRO_AUDIT_FACTS_DB env \u914D\u7F6E");
      }
      const repo = asStr(a2.repo);
      const path = asStr(a2.path);
      if (!repo || !path) {
        return fail(id, -32602, "file_card requires repo + path");
      }
      let currentHead = null;
      const rp = asStr(a2.repo_path);
      if (rp) {
        try {
          const out = execFileSync3("git", ["-C", rp, "rev-parse", "HEAD"], { encoding: "utf8", timeout: 15e3 }).trim();
          if (/^[0-9a-f]{40}$/i.test(out)) {
            currentHead = out;
          }
        } catch {
          currentHead = null;
        }
      }
      try {
        const card = await projectFileCard(db2, {
          repo,
          subject: path,
          at: asStr(a2.at),
          current_head_sha: currentHead,
          source: "prefetch",
          cli_guidance: "macro-audit audit file " + repo + ' "' + path + '" --db ' + db2
        });
        return ok(id, { content: [{ type: "text", text: JSON.stringify(card) }], isError: false });
      } catch (e) {
        return ok(id, { content: [{ type: "text", text: "MCP-FILECARD-ERROR: " + String(e && e.message || e) }], isError: true });
      }
    }
    if (p.name === "quarantine") {
      const a2 = p.arguments || {};
      const db2 = resolveFactsDb(asStr(a2.db));
      if (!db2) {
        return fail(id, -32602, "MCP-FACTS-DB-UNRESOLVED: facts db \u5BFB\u5740\u5931\u8D25\u2014\u2014arguments.db \u672A\u7ED9\u4E14\u670D\u52A1\u7AEF\u65E0 --db argv/MACRO_AUDIT_FACTS_DB env \u914D\u7F6E");
      }
      const lim2 = a2.limit === void 0 ? void 0 : Number(a2.limit);
      if (lim2 !== void 0 && (!Number.isFinite(lim2) || lim2 <= 0)) {
        return fail(id, -32602, "quarantine limit must be a positive number");
      }
      try {
        const rows = await projectQuarantine(db2, { run_id: asStr(a2.run), field_name: asStr(a2.field), limit: lim2 });
        const text = rows.map(function(r) {
          return JSON.stringify(r);
        }).join("\n");
        return ok(id, { content: [{ type: "text", text }], isError: false });
      } catch (e) {
        return ok(id, { content: [{ type: "text", text: "MCP-QUAR-ERROR: " + String(e && e.message || e) }], isError: true });
      }
    }
    const a = p.arguments || {};
    const db = resolveFactsDb(asStr(a.db));
    if (!db) {
      return fail(id, -32602, "MCP-FACTS-DB-UNRESOLVED: facts db \u5BFB\u5740\u5931\u8D25\u2014\u2014arguments.db \u672A\u7ED9\u4E14\u670D\u52A1\u7AEF\u65E0 --db argv/MACRO_AUDIT_FACTS_DB env \u914D\u7F6E");
    }
    const lim = a.limit === void 0 ? void 0 : Number(a.limit);
    if (lim !== void 0 && (!Number.isFinite(lim) || lim <= 0)) {
      return fail(id, -32602, "facts limit must be a positive number");
    }
    try {
      const rows = await projectFacts(db, {
        scale: asStr(a.scale),
        repo_ref: asStr(a.repo),
        subject_ref: asStr(a.subject),
        limit: lim
      });
      const text = rows.map(function(r) {
        return JSON.stringify(r);
      }).join("\n");
      return ok(id, { content: [{ type: "text", text }], isError: false });
    } catch (e) {
      return ok(id, { content: [{ type: "text", text: "MCP-FACTS-ERROR: " + String(e && e.message || e) }], isError: true });
    }
  }
  return fail(id, -32601, "method not found: " + method);
}
async function serveMcpStdio(input, output) {
  let buf = "";
  const pending = [];
  input.setEncoding("utf8");
  const write = function(r) {
    if (r !== null) {
      output.write(JSON.stringify(r) + "\n");
    }
  };
  await new Promise(function(resolve5) {
    input.on("data", function(chunk) {
      buf += chunk;
      let idx = buf.indexOf("\n");
      while (idx >= 0) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        idx = buf.indexOf("\n");
        if (line.length === 0) {
          continue;
        }
        let msg;
        try {
          msg = JSON.parse(line);
        } catch (e) {
          write(fail(null, -32700, "parse error: " + String(e && e.message || e)));
          continue;
        }
        pending.push(handleRpcMessage(msg).then(write, function(e) {
          write(fail(msg.id === void 0 ? null : msg.id, -32603, "internal error: " + String(e && e.message || e)));
        }));
      }
    });
    input.on("end", function() {
      resolve5();
    });
    input.on("close", function() {
      resolve5();
    });
    input.resume();
  });
  await Promise.all(pending);
}

// src/cli.ts
var EXIT_PROTOCOL_CRASH = 2;
var EXIT_STRICT_GATE = 3;
var EXIT_IO_FAILURE = 4;
var ExitSignal = class extends Error {
  constructor(code) {
    super("exit:" + code);
    this.code = code;
  }
  code;
};
var outExit = (text, code) => {
  process.stdout.write(text, function() {
    process.exit(code);
  });
  throw new ExitSignal(code);
};
var errExit = (text, code) => {
  process.stderr.write(text, function() {
    process.exit(code);
  });
  throw new ExitSignal(code);
};
async function main() {
  const cmd = process.argv[2] ?? "--help";
  if (cmd === "--version" || cmd === "-v") {
    const m = loadManifestMeta();
    console.log(JSON.stringify({ name: m.name, version: m.version, shells: m.shells }));
  } else if (cmd === "selftest") {
    const r = runSelftest();
    outExit(JSON.stringify(r) + "\n", r.ok ? 0 : 1);
  } else if (cmd === "doctor") {
    const dr = await runDoctor({ fix: process.argv.indexOf("--fix") >= 0 });
    outExit(JSON.stringify(dr) + "\n", dr.overall === "fail" ? 1 : 0);
  } else if (cmd === "mcp") {
    const sub = process.argv[3];
    if (sub === "facts") {
      const args = process.argv.slice(4);
      const known = ["--db", "--scale", "--repo", "--subject", "--limit"];
      const opts = {};
      for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (known.indexOf(a) < 0) {
          errExit("MCP-FACTS-ARGS: unknown flag " + a + "\n", 2);
        }
        const v = args[i + 1];
        if (v === void 0 || v.indexOf("--") === 0) {
          errExit("MCP-FACTS-ARGS: missing value for " + a + "\n", 2);
        }
        opts[a] = v;
        i++;
      }
      opts["--db"] = resolveFactsDb(opts["--db"]) || "";
      if (!opts["--db"]) {
        errExit("usage: macro-audit mcp facts [--db <path>] [--scale S] [--repo owner/repo] [--subject ref] [--limit n]\n", 2);
      }
      const limRaw = opts["--limit"];
      const lim = limRaw === void 0 ? void 0 : Number(limRaw);
      if (lim !== void 0 && (!Number.isFinite(lim) || lim <= 0)) {
        errExit(JSON.stringify({ error: "MCP-FACTS-ARGS", message: "--limit must be a positive number" }) + "\n", 2);
      }
      try {
        const rows = await projectFacts(opts["--db"], { scale: opts["--scale"], repo_ref: opts["--repo"], subject_ref: opts["--subject"], limit: lim });
        for (const r of rows) {
          console.log(JSON.stringify(r));
        }
      } catch (e) {
        if (e instanceof ExitSignal) throw e;
        errExit(JSON.stringify({ error: "MCP-FACTS-ERROR", message: String(e && e.message || e) }) + "\n", 2);
      }
    } else if (sub === "quarantine") {
      const args = process.argv.slice(4);
      const known = ["--db", "--run", "--field", "--limit"];
      const opts = {};
      for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (known.indexOf(a) < 0) {
          errExit("MCP-QUAR-ARGS: unknown flag " + a + "\n", 2);
        }
        const v = args[i + 1];
        if (v === void 0 || v.indexOf("--") === 0) {
          errExit("MCP-QUAR-ARGS: missing value for " + a + "\n", 2);
        }
        opts[a] = v;
        i++;
      }
      opts["--db"] = resolveFactsDb(opts["--db"]) || "";
      if (!opts["--db"]) {
        errExit("usage: macro-audit mcp quarantine [--db <path>] [--run <run_id>] [--field <name>] [--limit n]\n", 2);
      }
      const limRaw = opts["--limit"];
      const lim = limRaw === void 0 ? void 0 : Number(limRaw);
      if (lim !== void 0 && (!Number.isFinite(lim) || lim <= 0)) {
        errExit(JSON.stringify({ error: "MCP-QUAR-ARGS", message: "--limit must be a positive number" }) + "\n", 2);
      }
      try {
        const rows = await projectQuarantine(opts["--db"], { run_id: opts["--run"], field_name: opts["--field"], limit: lim });
        for (const r of rows) {
          console.log(JSON.stringify(r));
        }
      } catch (e) {
        if (e instanceof ExitSignal) throw e;
        errExit(JSON.stringify({ error: "MCP-QUAR-ERROR", message: String(e && e.message || e) }) + "\n", 2);
      }
    } else if (sub === void 0 || sub === "--db") {
      let serverDb;
      if (sub === "--db") {
        serverDb = process.argv[4];
        if (!serverDb || serverDb.indexOf("--") === 0) {
          errExit("usage: macro-audit mcp [--db <facts.duckdb>]\n", 2);
        }
      }
      setMcpServerConfig({ db: serverDb });
      try {
        await serveMcpStdio(process.stdin, process.stdout);
      } catch (e) {
        if (e instanceof ExitSignal) throw e;
        errExit(JSON.stringify({ error: "MCP-SERVE-ERROR", message: String(e && e.message || e) }) + "\n", 2);
      }
    } else {
      errExit("usage: macro-audit mcp [facts [--db <path>] [--scale S] [--repo owner/repo] [--subject ref] [--limit n] | quarantine [--db <path>] [--run <run_id>] [--field <name>] [--limit n]]\n", 2);
    }
  } else if (cmd === "repo") {
    const sub = process.argv[3];
    if (sub !== "add" || !process.argv[4]) {
      errExit("usage: macro-audit repo add <path|owner/repo|url> [--cache <dir>] [--refresh]\n", 2);
    }
    const input = process.argv[4];
    const ci = process.argv.indexOf("--cache");
    const cacheRoot = ci > 0 ? process.argv[ci + 1] : void 0;
    const refresh = process.argv.indexOf("--refresh") > 0;
    try {
      const r = repoAdd(input, { cacheRoot, refresh });
      console.log(JSON.stringify(r));
    } catch (e) {
      if (e instanceof ExitSignal) throw e;
      const err = e;
      errExit(JSON.stringify({ error: err.code || "INTAKE-ERROR", message: err.message || String(e) }) + "\n", 2);
    }
  } else if (cmd === "audit") {
    const args = process.argv.slice(3);
    if (args[0] === "file") {
      const fileArgs = args.slice(1);
      let repoInput;
      let filePath;
      let dbPath;
      let atSha;
      for (let i = 0; i < fileArgs.length; i++) {
        const a = fileArgs[i];
        if (a === "--db") {
          const v = fileArgs[++i];
          if (v === void 0 || v.indexOf("--") === 0) {
            errExit("AUDIT-FILE-ARGS: missing value for --db\n", 2);
          }
          dbPath = v;
        } else if (a === "--at") {
          const v = fileArgs[++i];
          if (v === void 0 || v.indexOf("--") === 0) {
            errExit("AUDIT-FILE-ARGS: missing value for --at\n", 2);
          }
          atSha = v;
        } else if (a.indexOf("--") === 0) {
          errExit("AUDIT-FILE-ARGS: unknown flag " + a + "\n", 2);
        } else if (!repoInput) {
          repoInput = a;
        } else if (!filePath) {
          filePath = a;
        } else {
          errExit("AUDIT-FILE-ARGS: unexpected extra positional " + a + "\n", 2);
        }
      }
      if (!repoInput || !filePath) {
        errExit("usage: macro-audit audit file <path|owner/repo|url> <file> --db <facts.duckdb> [--at <sha>]\n", 2);
      }
      if (!dbPath) {
        errExit("AUDIT-FILE-ARGS: --db <facts.duckdb> required\uFF08\u89C2\u6D4B\u96C6\u843D\u70B9\u2014\u2014\u4E0D\u5B58\u5728\u5219\u521B\u5EFA append-only \u5E93\uFF09\n", 2);
      }
      try {
        const r = await runAuditFile({ input: repoInput, path: filePath, db: dbPath, at: atSha });
        outExit(JSON.stringify({ card: r.card, backfilled: r.backfilled, emitted: r.emitted, repo_ref: r.repo_ref, head_sha: r.head_sha }) + "\n", 0);
      } catch (e) {
        if (e instanceof ExitSignal) throw e;
        if (isAuditFileError(e)) {
          errExit(JSON.stringify({ error: e.code, message: e.message }) + "\n", EXIT_PROTOCOL_CRASH);
        }
        if (isAuditIoError(e)) {
          errExit(JSON.stringify({ error: e.code, message: e.message }) + "\n", EXIT_IO_FAILURE);
        }
        const err = e;
        errExit(JSON.stringify({ error: err.code || "AUDIT-FILE-ERROR", message: err.message || String(e) }) + "\n", EXIT_PROTOCOL_CRASH);
      }
    }
    let input;
    let scale;
    let outDir;
    let asJson = false;
    let refresh = false;
    let strictFlag = void 0;
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === "--scale") {
        const v = args[++i];
        if (v === void 0 || v.indexOf("--") === 0) {
          errExit("AUDIT-ARGS: missing value for --scale\n", 2);
        }
        scale = v;
      } else if (a === "--out") {
        const v = args[++i];
        if (v === void 0 || v.indexOf("--") === 0) {
          errExit("AUDIT-ARGS: missing value for --out\n", 2);
        }
        outDir = v;
      } else if (a === "--json") {
        asJson = true;
      } else if (a === "--refresh") {
        refresh = true;
      } else if (a === "--strict-quarantine") {
        strictFlag = true;
      } else if (a === "--no-strict-quarantine") {
        strictFlag = false;
      } else if (a.indexOf("--") === 0) {
        errExit("AUDIT-ARGS: unknown flag " + a + "\n", 2);
      } else if (!input) {
        input = a;
      } else {
        errExit("AUDIT-ARGS: unexpected extra positional " + a + "\n", 2);
      }
    }
    const strictQuarantine = strictQuarantineEnabled(strictFlag, process.env[STRICT_QUARANTINE_ENV]);
    if (!input) {
      errExit("usage: macro-audit audit <path|owner/repo|url> [--scale <S>] [--out <dir>] [--json] [--refresh] [--strict-quarantine|--no-strict-quarantine] | audit file <path|owner/repo|url> <file> --db <facts.duckdb> [--at <sha>]\n", 2);
    }
    try {
      const r = await runAudit({ input, scale, outDir, json: asJson, refresh, strictQuarantine });
      if (r.out_dir) {
        outExit(JSON.stringify({
          report_id: r.report_id,
          receipt_id: r.receipt_id,
          scale: r.scale,
          stability: r.stability,
          capabilities: r.capabilities,
          overall_verdict: r.overall_verdict,
          verdict: r.verdict,
          intake_quarantine: r.intake_quarantine,
          degraded_mode: r.degraded_mode,
          head_sha: r.head_sha,
          tree_sha: r.tree_sha,
          commit_count: r.commit_count,
          adr_count: r.adr_count,
          fact_count: r.fact_count,
          repo_name: r.repo_name,
          intake: { kind: r.intake_kind, snapshot_fetched_at: r.snapshot_fetched_at, cache_hit: r.cache_hit, refreshed: r.refreshed },
          codelore: r.codelore,
          out_dir: r.out_dir,
          artifacts: r.artifacts
        }) + "\n", 0);
      } else {
        outExit(asJson ? r.sidecar_json : r.report_markdown, 0);
      }
    } catch (e) {
      if (e instanceof ExitSignal) throw e;
      if (isAuditScaleError(e)) {
        errExit(JSON.stringify({ error: e.code, message: e.message, implemented: e.implemented, requested: e.requested, layer_order: e.layer_order }) + "\n", 2);
      }
      if (isProtocolCrash(e)) {
        const payload = crashArtifactFromError(e);
        let artifact = null;
        try {
          const dir = outDir ? resolve4(outDir) : resolve4(process.cwd());
          if (!existsSync8(dir)) {
            mkdirSync7(dir, { recursive: true });
          }
          artifact = join10(dir, "macro-audit-crash-" + String(payload.error_code) + "-" + String(Date.now()) + ".json");
          writeFileSync4(artifact, JSON.stringify(payload, null, 2) + "\n", "utf8");
        } catch (_) {
          artifact = null;
        }
        const code = payload.error_code === "STRICT-QUARANTINE-VIOLATION" ? EXIT_STRICT_GATE : EXIT_PROTOCOL_CRASH;
        errExit(JSON.stringify({ error: payload.error_code, message: e.message, crash_artifact: artifact, crash_location: payload.crash_location, run_context: payload.run_context, counts: payload.counts }) + "\n", code);
      }
      if (isAuditIoError(e)) {
        errExit(JSON.stringify({ error: e.code, message: e.message }) + "\n", EXIT_IO_FAILURE);
      }
      const err = e;
      errExit(JSON.stringify({ error: err.code || "AUDIT-ERROR", message: err.message || String(e) }) + "\n", EXIT_PROTOCOL_CRASH);
    }
  } else if (cmd === "demo") {
    const args = process.argv.slice(3);
    let scenario = "happy-path";
    let outDir;
    let asJson = false;
    let keep = false;
    let list = false;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--scenario") {
        scenario = args[++i];
      } else if (args[i] === "--out") {
        outDir = args[++i];
      } else if (args[i] === "--json") {
        asJson = true;
      } else if (args[i] === "--keep") {
        keep = true;
      } else if (args[i] === "--list") {
        list = true;
      }
    }
    if (list) {
      outExit(JSON.stringify(listScenarios()) + "\n", 0);
    }
    try {
      const r = runDemo({ scenario, outDir, keepTemp: keep });
      if (outDir) {
        outExit(JSON.stringify({
          scenario: r.scenario,
          synthetic: r.synthetic,
          verdict: r.verdict,
          degraded_mode: r.degraded_mode,
          degraded_reason: r.degraded_reason,
          receipt_id: r.receipt_id,
          head_sha: r.head_sha,
          commit_count: r.commit_count,
          adr_count: r.adr_count,
          fact_count: r.fact_count,
          intake_kind: r.intake_kind,
          temp_discarded: r.temp_discarded,
          out_dir: r.out_dir,
          artifacts: r.artifacts
        }) + "\n", 0);
      } else {
        outExit(asJson ? r.sidecar_json : r.report_markdown, 0);
      }
    } catch (e) {
      if (e instanceof ExitSignal) throw e;
      const err = e;
      errExit(JSON.stringify({ error: err.code || "DEMO-ERROR", message: err.message || String(e) }) + "\n", 2);
    }
  } else {
    console.log("macro-audit kernel CLI (walking skeleton)");
    console.log("usage: macro-audit <--version|selftest|doctor [--fix]|mcp|repo add <path|owner/repo|url> [--cache <dir>] [--refresh]|audit <path|owner/repo|url> [--scale <S>] [--out <dir>] [--json] [--refresh]|audit file <path|owner/repo|url> <file> --db <facts.duckdb> [--at <sha>]|demo [--scenario <name>] [--out <dir>] [--json] [--keep] [--list]|--help>");
  }
}
main().catch(function(e) {
  if (!(e instanceof ExitSignal)) throw e;
});
