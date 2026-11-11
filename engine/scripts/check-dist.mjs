// check-dist.mjs —— #82/D-129③：管 dist/cli.js 的大小（许可只往小里收，不往大里放；照 size-limit 的惯例，上限先从实测的 1.25 倍起步，
// 要往上抬得走有人看的 PR——改这个常量就等于明着裁定一回）。它是 CI 守卫链的一员，不是审计判定面（不许写成 verdict/gate 那种语义）。
// 用法：node scripts/check-dist.mjs（engine-ci 的 rebuild-diff 那一步里调）
import { existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLI = join(root, "dist", "cli.js");

// 上限（D-129③）：起头是 dist/cli.js 实测 231,516B（#81 修完那次的 build）乘 1.25＝289,395B。
// 抬上限的规矩＝走有人看的 PR（改这个常量必须在 PR 里留下评审痕迹）；这条只收紧不放宽，盯着的是体积悄悄长，不是拿百分比讲故事。
// 抬过的记录（明着裁定的，写在这行就是留痕）：2026-10-03 R57 T1-A（#84/D-204②④）Macro-C 正式入口搬过来那回——
// dist/cli.js 实测 307,980B（多了 18.1KiB），新上限＝实测乘 1.25 约 385,000B。裁定落在预声明包 2026-10-03-r57-t1-predecl.md §5.1 勘误四，加那条 feat 提交的 Ledger-Refs D-204。
// 往下收的记录（明着裁定的，D-129③ 这条规矩两边都管——实测降了，走有人看的 PR 往下重算也是照规矩来，谈不上破例；Betterer/size-limit 官方文档本身就否定了「只能往上抬」这种误读）：
// 2026-10-08 R67 #92（D-217/#90 收口）build-bundle.mjs 加了 minifyWhitespace 和 minifySyntax（不许压标识符、不许 sourcemap）——
// dist/cli.js 实测从 373,105B 降到 297,074B（−80.6%），新上限＝实测乘 1.25＝floor(297,074×1.25)＝371,342B。裁定落在 D-217＋BACKLOG #92＋R67 #92 报告。
export const DIST_CLI_SIZE_CAP_BYTES = 371342;

if (!existsSync(CLI)) { console.error("DIST-RATCHET FAIL: dist/cli.js 缺席（先 npm run build）"); process.exit(1); }
const size = statSync(CLI).size;
const margin = DIST_CLI_SIZE_CAP_BYTES - size;
console.log("DIST-RATCHET " + (margin >= 0 ? "PASS" : "FAIL") + ": dist/cli.js " + size + "B / cap " + DIST_CLI_SIZE_CAP_BYTES + "B（margin " + margin + "B ≈ " + (margin / 1024).toFixed(1) + " KiB）");
if (margin < 0) { console.error("超阈=悄悄增速越限制——抬限走 reviewed PR（改 DIST_CLI_SIZE_CAP_BYTES 常量），非就地放宽"); process.exit(1); }
