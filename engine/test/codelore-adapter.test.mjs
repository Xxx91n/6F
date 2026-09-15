// codelore-adapter.test.mjs — golden 契约测试（录制输出回放，atomcode-r6-31 §2.3 模式）
// 断言面 = 纯解析器（fixture → 结构）+ pin 校验 + 错误路径；不测真实二进制（探针脚本做）。
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const root = join(HERE, '..');
const C = await import(pathToFileURL(join(root, 'dist', 'upstream', 'codelore.js')).href);
const fx = (n) => readFileSync(join(HERE, 'fixtures', 'codelore', n), 'utf8');

let n = 0;
const t = (name, fn) => { fn(); n++; };

t('G1 explain fixture 解析出 code-health/hotspots/ownership 节', () => {
  const d = C.parseExplainDossier(fx('explain-cli.ts.txt'));
  assert.ok(d.sections['code-health']);
  assert.equal(d.sections['code-health'].band, 'green');
  assert.equal(d.sections['ownership'].total_revs, '1');
  assert.equal(d.sections['hotspots'].rank, '286');
});

t('G2 explain fixture 数字前缀键（1.function）也解析（[functions] 节）', () => {
  const d = C.parseExplainDossier(fx('explain-collectors.ts.txt'));
  assert.ok(d.sections['functions']);
  assert.match(d.sections['functions']['1.function'], /collectAdrStructureV2@/);
  assert.equal(d.sections['functions']['5.cognitive'], '7');
});

t('G3 summary JSON fixture → metric/value 数组', () => {
  const m = C.parseSummaryJson(fx('summary.json'));
  const map = Object.fromEntries(m.map((r) => [r.metric, r.value]));
  assert.equal(map.commits, 90);
  assert.equal(map.entities, 681);
  assert.equal(map.authors, 1);
});

t('G4 版本串解析 + pin 断言（0.28.0 pin）', () => {
  const out = fx('version.txt').trim();
  assert.match(out, /codelore\s+0\.28\.0/);
  assert.equal(C.CODELORE_PINNED_VERSION, '0.28.0');
});

t('G5 漂变输入被拒：summary 行形状漂移 → 抛错', () => {
  assert.throws(() => C.parseSummaryJson('[{"metric":"x","value":"oops"}]'), /shape drift/);
  assert.throws(() => C.parseSummaryJson('{"not":"array"}'), /not an array/);
});

t('G6 畸形 explain 输出不产生节（空 dossier 而非假阳性）', () => {
  const d = C.parseExplainDossier('some prose\nnot a dossier\nkey = value without section');
  assert.deepEqual(d.sections, {});
});

t('G7 不存在二进制 → resolution error + pinned=false', () => {
  const r = C.resolveCodelore('definitely-not-codelore-binary-xyz');
  assert.equal(r.pinned, false);
  assert.ok(r.error !== null);
});

console.log('CODELORE-ADAPTER-TEST-OK ' + n + '/' + n);
