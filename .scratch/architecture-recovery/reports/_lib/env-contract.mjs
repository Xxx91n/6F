// env-contract.mjs —— 守卫运行环境契约 SSOT（D-159④ / R40-T1 执行窗）
// 职责：sibling 工作树根寻址单一权威源（GUARD_SIBLING_ROOT 环境变量，默认 D:/Aworker）＋
//   env-contract tier 启动探测（sibling 缺失→SKIP-with-reason 三态退出；sibling 在但漂移→各守卫
//   自身方言披露面承载〔D-128 Instrument Dialect——值进披露不进断言红〕，不进本原语）。
// 边界：禁 sibling 清单文件进仓（git-crypt #217 初始化固化=不可移植先例）——name→dirname 映射即本 SSOT 本体；
//   env-manager 服务寻址未启用（启用须 D-150③ 预声明：可得性钉 SHA＋两段读数——禁把一处环境假设换成另一处）。
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { guardSkip } from './check-kit.mjs';

export const GUARD_SIBLING_ROOT = process.env.GUARD_SIBLING_ROOT || 'D:/Aworker';

// sibling 名→目录名映射（非常规名登记表：goose-duck-agent 实测目录名=eys）
const SIBLING_DIRS = {
  'env-manager': 'env-manager',
  'anysearch-cli': 'anysearch-cli',
  'jiahao': 'jiahao',
  'goose-duck-agent': 'eys'
};
export const siblingPath = (name) => join(GUARD_SIBLING_ROOT, SIBLING_DIRS[name] || name);

// env-contract tier 探测：任一需求缺席→SKIP-with-reason 退出（exit 0；skip 不进 allOk 禁折 pass——D-159③）
// needs: [{name, ok}]——name 建议 'sibling:<repo>' 形态，缺席名直进 reason
export function envProbe(guardName, needs) {
  const missing = needs.filter((n) => !n.ok);
  if (missing.length) guardSkip(guardName, missing.map((m) => 'env-missing:' + m.name));
}
export const need = (name, ok) => ({ name, ok: !!ok });
