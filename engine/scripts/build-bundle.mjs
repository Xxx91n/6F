// build-bundle.mjs — #59/D-067 分发自包含：esbuild 单文件 bundle dist/cli.js
// git-clone 型插件安装无构建步 → 可运行体随源进仓（actions/javascript-action 先例）。
// --packages=external：唯一运行时依赖 @duckdb/node-api 原生绑定不可内联，保持外部解析
// （store.ts 懒加载已在缺 node_modules 时降级为 DUCKDB-UNAVAILABLE 结构化错误）。
// tsc 先跑（模块树供测试 import），本脚本最后覆写 dist/cli.js 为自包含 bundle。
import { buildSync } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
try {
  buildSync({
    entryPoints: [join(root, 'src', 'cli.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    target: 'node20',
    outfile: join(root, 'dist', 'cli.js'),
    logLevel: 'warning'
  });
} catch (e) {
  console.error('BUNDLE-FAIL ' + (e && e.message ? e.message.split('\n')[0] : e));
  process.exit(1);
}
console.log('BUNDLE-OK dist/cli.js');
