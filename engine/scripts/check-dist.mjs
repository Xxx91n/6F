// check-dist.mjs —— #82/D-129③：dist/cli.js 体积棘轮（size-limit 惯例：限值=实测×1.25 起步，
// 抬限走 reviewed PR——改本常量=显式裁定）。CI 守卫链成员，非审计裁定面（禁写成 verdict/gate 语义）。
// 用法：node scripts/check-dist.mjs（engine-ci rebuild-diff 链内调用）
import { existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLI = join(root, "dist", "cli.js");

// 棘轮上限（D-129③）：初值=dist/cli.js 实测 231,516B（#81 修复后 build）×1.25 起步=289,395B。
// 抬限纪律=reviewed PR（改此常量须 PR 评审留痕）；棘轮管静默增速非绝对百分比叙事。
// 抬限记录（显式裁定，本行即留痕）：2026-10-03 R57 T1-A（#84/D-204②④）Macro-C 一等面移植——
// dist/cli.js 实测 307,980B（+18.1KiB），新帽=实测×1.25≈385,000B。裁定载体=预声明包 2026-10-03-r57-t1-predecl.md §5.1 勘误四＋feat commit Ledger-Refs D-204。
// 降帽记录（显式裁定，D-129③ scoped 双向注记——reviewed-PR 纪律双向适用，实测下降经 reviewed PR 向下重推导=镜像应用非棘轮破例；Betterer/size-limit 官方语义一手反证「单向只升」误读）：
// 2026-10-08 R67 #92（D-217/#90 核销）build-bundle.mjs 加 minifyWhitespace+minifySyntax（禁 identifiers/禁 sourcemap）——
// dist/cli.js 实测 373,105B→297,074B（−80.6%），新帽=实测×1.25=floor(297,074×1.25)=371,342B。裁定载体=D-217＋BACKLOG #92＋R67 #92 报告。
export const DIST_CLI_SIZE_CAP_BYTES = 371342;

if (!existsSync(CLI)) { console.error("DIST-RATCHET FAIL: dist/cli.js 缺席（先 npm run build）"); process.exit(1); }
const size = statSync(CLI).size;
const margin = DIST_CLI_SIZE_CAP_BYTES - size;
console.log("DIST-RATCHET " + (margin >= 0 ? "PASS" : "FAIL") + ": dist/cli.js " + size + "B / cap " + DIST_CLI_SIZE_CAP_BYTES + "B（margin " + margin + "B ≈ " + (margin / 1024).toFixed(1) + " KiB）");
if (margin < 0) { console.error("超阈=静默增速越棘轮——抬限走 reviewed PR（改 DIST_CLI_SIZE_CAP_BYTES 常量），非就地放宽"); process.exit(1); }
