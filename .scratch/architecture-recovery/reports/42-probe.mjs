// #42 探针——CodeLore sqlite/parquet dump 面形态实物枚举（只读）
// 安全纪律：只跑 stdout 枚举面（--version/--help/docs/schema/profile）——
//   不跑 `analyze --format sqlite|parquet --output`（会写 dump 文件＋触碰 fact-store 缓存=写副作用），
//   不跑任何 analyze 计算面。写副作用仅限本目录 42-*.txt/.md/.json 档案（同 36-probe 模式）。
// 证据用途：reports/42-dump-comparison.md 三轴对照评估的实物锚。
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', '..', '..');
const BIN = 'codelore';

const env = { ...process.env };
for (const k of Object.keys(env)) {
  if (k.startsWith('CODELORE_LLM_') || k === 'ANTHROPIC_API_KEY') delete env[k];
}

const run = (args) => {
  const r = spawnSync(BIN, args, { cwd: ROOT, env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { status: r.status, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error ? String(r.error) : null };
};

const w = (name, text) => fs.writeFileSync(join(here, name), text, 'utf8');

const out = { binary: BIN, probed_at: new Date().toISOString(), commands: [] };
const mark = (argv, r) => out.commands.push({ argv: argv.join(' '), exit: r.status, stdout_bytes: Buffer.byteLength(r.stdout), stderr_bytes: Buffer.byteLength(r.stderr), error: r.error });

// 1) --version（pin 复核）
const ver = run(['--version']); mark(['--version'], ver);
w('42-version.txt', ver.stdout);
out.version = ver.stdout.trim();

// 2) 顶层命令面（docs/schema/profile 子命令存在性证据）
const top = run(['--help']); mark(['--help'], top);
w('42-top-help.txt', top.stdout);
out.top_commands = (top.stdout.match(/^  [a-z][a-z-]+/gm) || []).map((s) => s.trim());

// 3) analyze --help（format 枚举行 = sqlite/parquet dump 面形态的直接实物）
const ah = run(['analyze', '--help']); mark(['analyze', '--help'], ah);
w('42-analyze-help.txt', ah.stdout);
const fmtLine = ah.stdout.split('\n').find((l) => l.indexOf('parquet:') >= 0 || l.indexOf('sqlite:') >= 0) || '';
out.analyze_format_line = fmtLine.trim();
// analyze --help 内两处 possible-values：首处=analysis 枚举（57），format 枚举是含 'parquet' 的那处
const pvAll = Array.from(ah.stdout.matchAll(/possible values: ([a-z0-9,\s-]+)\]/g)).map((m) => m[1]);
const fmtPv = pvAll.find((v) => v.indexOf('parquet') >= 0) || '';
out.analyze_format_values = fmtPv.split(',').map((s) => s.trim()).filter(Boolean);
const enumPv = pvAll.find((v) => v.indexOf('hotspots') >= 0) || '';
out.analysis_enum_count = enumPv ? enumPv.split(',').map((s) => s.trim()).filter(Boolean).length : null;

// 4) docs（输出格式逐条定义 + provenance 侧车/provenance 表注记）
const docs = run(['docs']); mark(['docs'], docs);
w('42-docs.md', docs.stdout);
const docLines = docs.stdout.split('\n');
out.docs_format_defs = docLines.filter((l) => /^- `(parquet|sqlite|json|csv|ndjson|sarif)`/.test(l)).map((l) => l.trim());
out.docs_provenance_note = (docLines.find((l) => l.indexOf('provenance') >= 0 && l.indexOf('sidecar') >= 0) || '').trim();
out.docs_analysis_count = docLines.filter((l) => /^- `[a-z0-9-]+`$/.test(l)).length;

// 5) schema（row-type catalogue 面——断言 dump 内部表 schema 不在此公开面）
const sch = run(['schema']); mark(['schema'], sch);
w('42-schema.txt', sch.stdout);
const schM = sch.stdout.match(/Supported row types \((\d+)\)/);
out.schema_row_types = schM ? Number(schM[1]) : null;
out.schema_envelope_note = (sch.stdout.split('\n').find((l) => l.indexOf('minimal envelope') >= 0) || '').trim();

// 6) profile（schema_v8 / DuckDB 版本 / fact-store 缓存策略——dump 内部形态实物）
const prof = run(['profile']); mark(['profile'], prof);
w('42-profile.txt', prof.stdout);
const profL = prof.stdout.split('\n');
out.profile_schema = ((profL.find((l) => l.indexOf('Schema') >= 0) || '').split('**').join('')).trim();
out.profile_duckdb = ((profL.find((l) => l.indexOf('DuckDB') >= 0) || '')).trim();
out.profile_cache = ((profL.find((l) => l.indexOf('fact stores kept') >= 0) || '')).trim();
out.profile_formats = ((profL.find((l) => l.indexOf('Output formats') >= 0) || '')).trim();

// 7) 与 #35 存档 format 行漂移对照（同一枚举面跨票对账）
const arch35 = join(here, '35-analyze-help.txt');
if (fs.existsSync(arch35)) {
  const old = fs.readFileSync(arch35, 'utf8').split('\n').find((l) => l.indexOf('parquet:') >= 0) || '';
  out.format_line_drift_vs_35 = old.trim() === out.analyze_format_line ? 'none' : 'DRIFT: 35=' + old.trim() + ' | 42=' + out.analyze_format_line;
} else {
  out.format_line_drift_vs_35 = 'archive-35-absent';
}

w('42-probe-measurements.json', JSON.stringify(out, null, 2) + '\n');
console.log('42-probe done:', JSON.stringify({ version: out.version, formats: out.analyze_format_values.length, analyses: out.analysis_enum_count, row_types: out.schema_row_types, drift: out.format_line_drift_vs_35 }));
