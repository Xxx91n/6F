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
export const DIST_CLI_SIZE_CAP_BYTES = 289395;

if (!existsSync(CLI)) { console.error("DIST-RATCHET FAIL: dist/cli.js 缺席（先 npm run build）"); process.exit(1); }
const size = statSync(CLI).size;
const margin = DIST_CLI_SIZE_CAP_BYTES - size;
console.log("DIST-RATCHET " + (margin >= 0 ? "PASS" : "FAIL") + ": dist/cli.js " + size + "B / cap " + DIST_CLI_SIZE_CAP_BYTES + "B（margin " + margin + "B ≈ " + (margin / 1024).toFixed(1) + " KiB）");
if (margin < 0) { console.error("超阈=静默增速越棘轮——抬限走 reviewed PR（改 DIST_CLI_SIZE_CAP_BYTES 常量），非就地放宽"); process.exit(1); }
