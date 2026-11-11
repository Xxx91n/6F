// build-bundle.mjs —— #59/D-067 打包成一个能自己跑的随身件：esbuild 把东西都塞进 dist/cli.js
// 从 git 拉下来直接装的插件没有构建这一步，所以能跑的东西得跟着源码一起进仓（actions/javascript-action 就这么干）。
// --packages=external：唯一要的运行时依赖 @duckdb/node-api 是原生绑定，塞不进来，只能让外面去解析
// （store.ts 已经是懒加载，没 node_modules 时会降成 DUCKDB-UNAVAILABLE 那个结构化错误）。
// 先跑 tsc（好让测试能 import 那棵模块树），本脚本最后再把 dist/cli.js 覆写成能自己跑的包。
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
    // D-217② 压缩分两档：只压空白和语法，函数名、变量名、报错原文都留着（stack trace 还能定位，只是丢行号列号）；
    // 不许压标识符（改名这事另案再说）＋不许把 sourcemap 塞进 dist（Claude Code 泄漏那次教训——map 让体积翻倍，还等于把源码往外送）。
    minifyWhitespace: true,
    minifySyntax: true,
    outfile: join(root, 'dist', 'cli.js'),
    logLevel: 'warning'
  });
} catch (e) {
  console.error('BUNDLE-FAIL ' + (e && e.message ? e.message.split('\n')[0] : e));
  process.exit(1);
}
console.log('BUNDLE-OK dist/cli.js');
