// 守卫：fact table schema v0（A-021 / spec.md §R3-D2）
// 用法：node .scratch/architecture-recovery/reports/20-fact-schema-check.mjs
// 约定：零依赖（不 import @duckdb/node-api）；直接 import 纯逻辑 schema.ts（Node 22 类型剥离）。
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const NL = String.fromCharCode(10);
const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const MANIFEST = join(HERE, '20-fact-schema.json');
const SCHEMA_TS = join(REPO, 'engine', 'src', 'fact', 'schema.ts');
const STORE_TS = join(REPO, 'engine', 'src', 'fact', 'store.ts');
const PKG_JSON = join(REPO, 'engine', 'package.json');

const results = [];
function check(id, pass, detail) { results.push([id, !!pass, String(detail)]); }

function stripComments(src) {
  return src.split(NL).map(function (line) {
    const i = line.indexOf('//');
    return i >= 0 ? line.slice(0, i) : line;
  }).join(NL);
}

function exportedFnNames(src) {
  const out = [];
  src.split('export ').forEach(function (chunk) {
    let c = chunk;
    if (c.startsWith('async function ')) { c = c.slice('async function '.length); }
    else if (c.startsWith('function ')) { c = c.slice('function '.length); }
    else { return; }
    const i = c.indexOf('(');
    if (i > 0) { out.push(c.slice(0, i).trim()); }
  });
  return out;
}

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const S = await import(pathToFileURL(SCHEMA_TS).href);
const storeSrc = readFileSync(STORE_TS, 'utf8');
const storeCode = stripComments(storeSrc);
const pkg = JSON.parse(readFileSync(PKG_JSON, 'utf8'));
const fact = manifest.tables.find(function (t) { return t.name === 'audit_fact'; });
const cols = fact.columns;
const rawManifest = readFileSync(MANIFEST, 'utf8');
const SQ = String.fromCharCode(39);

// ---- B 组：绑定选型唯一 + 三候选项量化 ----
const sel = manifest.binding.selected;
check('B1', sel === '@duckdb/node-api', 'selected=' + sel);
check('B2', manifest.candidates.length >= 3, 'candidates=' + manifest.candidates.length);
const selCands = manifest.candidates.filter(function (c) { return c.verdict === 'selected'; });
check('B3', selCands.length === 1 && selCands[0].npm === sel, 'selectedCount=' + selCands.length);
const rejCands = manifest.candidates.filter(function (c) { return c.verdict === 'rejected'; });
check('B4', rejCands.length > 0 && rejCands.every(function (c) { return typeof c.rejected_reason === 'string' && c.rejected_reason.length > 0; }), 'rejected=' + rejCands.length);
const sc = selCands[0] || {};
check('B5', typeof sc.install_size_bytes === 'number' && !!sc.api_surface && Object.keys(sc.api_surface).length >= 5 && !!sc.maintenance && typeof sc.maintenance.last_push === 'string', 'apiKeys=' + (sc.api_surface ? Object.keys(sc.api_surface).length : 0));
const quantified = manifest.candidates.filter(function (c) { return typeof c.install_size_bytes === 'number'; });
check('B6', quantified.length >= 3, 'quantifiedCandidates=' + quantified.length);
const FENCE = ['两种都可以', '都可以', '两者皆可', '二者皆可'];
const fenceHits = FENCE.filter(function (w) { return rawManifest.indexOf(w) >= 0; });
check('B7', fenceHits.length === 0, 'fenceWords=' + JSON.stringify(fenceHits));

// ---- F 组：字段清单完整性与 A-007/A-008/A-010 继承关系 ----
const tsFields = S.AUDIT_FACT_FIELDS;
check('F1', cols.length === tsFields.length, 'manifest=' + cols.length + ' ts=' + tsFields.length);
const orderOk = cols.length === tsFields.length && cols.every(function (c, i) { return c.name === tsFields[i].name; });
check('F2', orderOk, 'order=' + cols.map(function (c) { return c.name; }).join('>'));
const KEYS = ['name','type','nullable','role','constraints','inherits','note'];
check('F3', cols.every(function (c) { return KEYS.every(function (k) { return Object.prototype.hasOwnProperty.call(c, k); }); }), 'keys=' + KEYS.length);
check('F4', cols.every(function (c) { return typeof c.inherits === 'string' && c.inherits.length > 0; }), 'allInheritsDeclared');
const inh = cols.map(function (c) { return c.inherits; });
check('F5', inh.indexOf('A-007') >= 0 && inh.indexOf('A-008') >= 0 && inh.indexOf('A-010') >= 0, 'covered=' + ['A-007','A-008','A-010'].filter(function (a) { return inh.indexOf(a) >= 0; }).join(','));
const reopenHits = cols.filter(function (c) { const t = c.inherits + ' ' + c.note; return t.indexOf('重开') >= 0 || t.toLowerCase().indexOf('reopen') >= 0; });
check('F6', reopenHits.length === 0, 'reopenHits=' + reopenHits.length);
let maxCorr = -1;
let minPayload = Number.MAX_SAFE_INTEGER;
cols.forEach(function (c, i) { if (c.role === 'correlation') { if (i > maxCorr) { maxCorr = i; } } if (c.role === 'payload') { if (i < minPayload) { minPayload = i; } } });
check('F7', maxCorr >= 0 && minPayload < Number.MAX_SAFE_INTEGER && maxCorr < minPayload, 'maxCorrelationIdx=' + maxCorr + ' minPayloadIdx=' + minPayload);
function findCol(n) { return cols.find(function (c) { return c.name === n; }); }
const tr = findCol('trace_id');
const bg = findCol('baggage_id');
check('F8', !!tr && !!bg && tr.type === 'CHAR(32)' && bg.type === 'CHAR(32)' && tr.nullable === false && bg.nullable === false, 'trace=' + (tr ? tr.type : 'missing') + ' baggage=' + (bg ? bg.type : 'missing'));
const sv = findCol('schema_version');
check('F9', !!sv && sv.type === 'INTEGER' && sv.nullable === false && sv.constraints.some(function (x) { return x.indexOf('CHECK(schema_version >= 1)') >= 0; }), 'schemaVersion=' + (sv ? sv.type : 'missing'));
check('F10', !!sv && sv.constraints.some(function (x) { return x.indexOf('REFERENCES schema_registry(version)') >= 0; }), 'fkDeclaredBeforeDdlFreeze');
check('F11', S.AUDIT_FACT_DDL.toUpperCase().indexOf('ALTER') < 0 && S.SCHEMA_REGISTRY_DDL.toUpperCase().indexOf('ALTER') < 0, 'noAlterInDdl');
const vj = findCol('value_json');
check('F12', !!vj && vj.constraints.some(function (x) { return x.indexOf('CHECK(json_valid(') >= 0; }), 'jsonValidCheck');
const scCol = findCol('scale');
const SCALES = ['Macro-A','Macro-B','Macro-C','Micro-A','Micro-B'];
const scaleCon = scCol ? scCol.constraints.join(' ') : '';
check('F13', SCALES.every(function (s) { return scaleCon.indexOf(s) >= 0; }), 'scaleEnum=' + SCALES.length);
function parensBalanced(s) { let d = 0; for (let i = 0; i < s.length; i++) { const ch = s.charAt(i); if (ch === '(') { d++; } else if (ch === ')') { d--; } if (d < 0) { return false; } } return d === 0; }
check('F14', parensBalanced(S.AUDIT_FACT_DDL) && parensBalanced(S.SCHEMA_REGISTRY_DDL), 'ddlParensBalanced');

// ---- A 组：只追加不可改写 ----
const REWRITE = [
  'UPDATE audit_fact SET metric = 1',
  'DELETE FROM audit_fact WHERE fact_seq = 1',
  'DROP TABLE audit_fact',
  'ALTER TABLE audit_fact ADD COLUMN x INTEGER',
  'TRUNCATE TABLE audit_fact',
  'INSERT OR REPLACE INTO audit_fact VALUES (1)',
  'INSERT INTO audit_fact (fact_id) VALUES (1) ON CONFLICT DO UPDATE SET fact_id = 2',
  'MERGE INTO audit_fact USING t ON true WHEN MATCHED THEN UPDATE SET metric = 1',
  'COPY audit_fact TO out.parquet'
];
let rejOk = 0;
const leaked = [];
REWRITE.forEach(function (s) { const v = S.classifyStatement(s); if (v.allow) { leaked.push(s); } else { rejOk++; } });
check('A1', rejOk === REWRITE.length, 'rejected=' + rejOk + '/' + REWRITE.length + (leaked.length ? ' leaked=' + JSON.stringify(leaked) : ''));
const ATTACH_SAMPLE = 'ATTACH ' + SQ + 'x.duckdb' + SQ + ' AS r (READ_ONLY)';
const LEGAL = [
  'SELECT count(*) FROM audit_fact',
  'INSERT INTO audit_fact (fact_id) VALUES (?)',
  'CREATE TABLE IF NOT EXISTS audit_fact (a INTEGER)',
  ATTACH_SAMPLE
];
let allowOk = 0;
const blocked = [];
LEGAL.forEach(function (s) { const v = S.classifyStatement(s); if (v.allow) { allowOk++; } else { blocked.push(s + ' :: ' + v.reason); } });
check('A2', allowOk === LEGAL.length, 'allowed=' + allowOk + '/' + LEGAL.length + (blocked.length ? ' ' + JSON.stringify(blocked) : ''));
let threw = false;
let errName = '';
try { S.assertAppendOnly('UPDATE audit_fact SET metric = 1'); } catch (e) { threw = true; errName = e.name; }
check('A3', threw && errName === 'AppendOnlyViolation', 'threw=' + threw + ' name=' + errName);
const VERBS = ['update','delete','replace','merge','drop','alter','truncate','patch'];
const fns = exportedFnNames(storeSrc);
const badFns = fns.filter(function (f) { const l = f.toLowerCase(); return VERBS.some(function (v) { return l.indexOf(v) >= 0; }); });
check('A4', fns.length > 0 && badFns.length === 0, 'exports=' + fns.join(',') + ' bad=' + JSON.stringify(badFns));
const BAD_TOKENS = ['UPDATE','DELETE','DROP TABLE','ALTER TABLE','TRUNCATE','INSERT OR REPLACE','ON CONFLICT DO UPDATE','MERGE INTO'];
const upCode = storeCode.toUpperCase();
const tokenHits = BAD_TOKENS.filter(function (t) { return upCode.indexOf(t) >= 0; });
check('A5', tokenHits.length === 0, 'rewriteTokensInFacade=' + JSON.stringify(tokenHits));
check('A6', storeSrc.indexOf('access_mode: ' + SQ + 'READ_ONLY' + SQ) >= 0, 'readerReadOnlyDeclared');
const dep = pkg.dependencies ? pkg.dependencies['@duckdb/node-api'] : undefined;
check('A7', typeof dep === 'string' && dep.length > 0 && dep.charAt(0) !== '^' && dep.charAt(0) !== '~', 'dep=' + dep);

let ok = true;
results.forEach(function (r) { console.log((r[1] ? 'PASS ' : 'FAIL ') + r[0] + ' :: ' + r[2]); if (!r[1]) { ok = false; } });
const passed = results.filter(function (r) { return r[1]; }).length;
console.log(ok ? ('GUARD-PASS ' + passed + '/' + results.length) : ('GUARD-FAIL ' + passed + '/' + results.length));
process.exitCode = ok ? 0 : 1;