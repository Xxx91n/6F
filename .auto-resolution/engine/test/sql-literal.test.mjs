// sql-literal.test.mjs — SQL 黑名单剥字面量误伤修复测试（#55 / D-059④；作用于 dist 编译产物）
// 裁定：匹配前剥字面量（拒 AST 强主张——OWASP 分级下字符串黑名单在非注入面合法）。
// 覆盖：字面量内 UPDATE/DELETE 字样不再误伤；真实改写语句仍拒；未闭合引号保守拒。
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const S = await import(pathToFileURL(join(root, 'dist', 'fact', 'schema.js')).href);

const results = [];
function check(name, pass, detail) { results.push([name, !!pass, detail || '']); }
const allow = (s) => S.classifyStatement(s).allow;

// -- 误伤修复面（字面量内黑名单字样不该拒） --
check('L1 字符串字面量含 DELETE 不再误伤', allow("SELECT * FROM audit_fact WHERE metric='DELETE counter'") === true);
check('L2 INSERT 值含 UPDATE/DELETE 字面量不再误伤', allow("INSERT INTO audit_fact (fact_id, value_json) VALUES ('f1', '{\"op\":\"DELETE FROM t\"}')") === true);
check('L3 双引号标识符含 update 字样不误伤', allow('SELECT "update_time" FROM audit_fact') === true);
check('L4 美元引号串内 DROP 不误伤', allow('SELECT $$ DROP TABLE x $$') === true);
check('L5 单引号转义字面量含 DELETE 不误伤', allow("SELECT 'it''s a DELETE' FROM audit_fact") === true);
check('L6 反引号标识符内 merge 不误伤', allow('SELECT `merge_id` FROM audit_fact') === true);

// -- 真实改写仍拒（防护不回退） --
check('D1 UPDATE 仍拒', allow('UPDATE audit_fact SET metric = 1') === false);
check('D2 DELETE 仍拒', allow('DELETE FROM audit_fact WHERE fact_seq = 1') === false);
check('D3 DROP 仍拒', allow('DROP TABLE audit_fact') === false);
check('D4 MERGE INTO 仍拒', allow('MERGE INTO audit_fact USING t ON true WHEN MATCHED THEN UPDATE SET metric = 1') === false);
check('D5 ON CONFLICT DO UPDATE 仍拒', allow('INSERT INTO audit_fact (fact_id) VALUES (1) ON CONFLICT DO UPDATE SET fact_id = 2') === false);
check('D6 COPY 仍拒', allow("COPY audit_fact TO 'out.parquet'") === false);

// -- 边界：未闭合引号保守拒（不可解析=不放大） --
check('E1 未闭合引号内 UPDATE 字样仍拒（保守方向）', allow("SELECT 'x UPDATE") === false);
check('E2 空语句仍拒', allow('   ') === false);
check('E3 裸注释残留仍拒', allow('-- UPDATE something') === false);

// -- assertAppendOnly 走同一字面量剥离路径 --
let threw = false;
try { S.assertAppendOnly("INSERT INTO audit_fact (fact_id, value_json) VALUES ('f1', '{\"note\":\"DELETE later\"}')"); } catch (e) { threw = true; }
check('F1 assertAppendOnly 放行字面量内 DELETE', threw === false);
let threw2 = false;
try { S.assertAppendOnly('UPDATE audit_fact SET metric = 1'); } catch (e) { threw2 = e.name === 'AppendOnlyViolation'; }
check('F2 assertAppendOnly 仍拒 UPDATE', threw2 === true);

let ok = true;
for (const r of results) {
  console.log((r[1] ? 'PASS ' : 'FAIL ') + r[0] + (r[2] ? ' :: ' + r[2] : ''));
  if (!r[1]) ok = false;
}
console.log(ok ? ('SQL-LITERAL ' + results.length + '/' + results.length) : 'SQL-LITERAL-FAIL');
process.exit(ok ? 0 : 1);
