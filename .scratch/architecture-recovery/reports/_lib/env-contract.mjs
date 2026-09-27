// env-contract.mjs \u2014 \u5B88\u536B\u8FD0\u884C\u73AF\u5883\u5951\u7EA6 SSOT\uFF08D-159\u2464 / R40-T1 \u6267\u884C\u7A97\uFF09
// \u804C\u8D23\uFF1Asibling \u5DE5\u4F5C\u6811\u6839\u5BFB\u5740\u5355\u4E00\u6743\u5A01\u6E90\uFF08GUARD_SIBLING_ROOT \u73AF\u5883\u53D8\u91CF\uFF0C\u9ED8\u8BA4 D:/Aworker\uFF09\uFF0B
//   env-contract tier \u542F\u52A8\u63A2\u6D4B\uFF08sibling \u7F3A\u5931\u2192SKIP-with-reason \u4E09\u6001\u9000\u51FA\uFF1Bsibling \u5728\u4F46\u6F02\u79FB\u2192\u5404\u5B88\u536B
//   \u81EA\u8EAB\u65B9\u8A00\u62AB\u9732\u9762\u627F\u8F7D\u3014D-128 Instrument Dialect\u2014\u2014\u65B9\u8A00\u503C\u8FDB\u62AB\u9732\u4E0D\u8FDB\u65AD\u8A00\u7EA2\u3015\uFF0C\u4E0D\u8FDB\u672C\u539F\u8BED\uFF09\u3002
// \u8FB9\u754C\uFF1A\u7981 sibling \u6E05\u5355\u6587\u4EF6\u8FDB\u4ED3\uFF08git-crypt #217 \u521D\u59CB\u5316\u56FA\u5316=\u4E0D\u53EF\u79FB\u690D\u5148\u4F8B\uFF09\u2014\u2014name\u2192dirname \u6620\u5C04\u5373\u672C SSOT \u672C\u4F53\uFF1B
//   env-manager \u670D\u52A1\u5BFB\u5740\u672A\u542F\u7528\uFF08\u542F\u7528\u987B D-150\u2462 \u9884\u58F0\u660E\uFF1A\u53EF\u5F97\u6027\u9489 SHA\uFF0B\u4E24\u6BB5\u8BFB\u6570\u2014\u2014\u7981\u628A\u4E00\u5904\u73AF\u5883\u5047\u8BBE\u6362\u6210\u53E6\u4E00\u5904\uFF09\u3002
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { guardSkip } from './check-kit.mjs';

export const GUARD_SIBLING_ROOT = process.env.GUARD_SIBLING_ROOT || 'D:/Aworker';

// sibling \u540D\u2192\u76EE\u5F55\u540D\u6620\u5C04\uFF08\u975E\u5E38\u89C4\u540D\u767B\u8BB0\u8868\uFF1Agoose-duck-agent \u5B9E\u6D4B\u76EE\u5F55\u540D=eys\uFF09
const SIBLING_DIRS = {
  'env-manager': 'env-manager',
  'anysearch-cli': 'anysearch-cli',
  'jiahao': 'jiahao',
  'goose-duck-agent': 'eys'
};
export const siblingPath = (name) => join(GUARD_SIBLING_ROOT, SIBLING_DIRS[name] || name);
export const siblingExists = (name) => existsSync(siblingPath(name));

// env-contract tier \u63A2\u6D4B\uFF1A\u4EFB\u4E00\u9700\u6C42\u7F3A\u5E2D\u2192SKIP-with-reason \u9000\u51FA\uFF08exit 0\uFF1Bskip \u4E0D\u8FDB allOk \u7981\u6298 pass\u2014\u2014D-159\u2462\uFF09
// needs: [{name, ok}]\u2014\u2014name \u5EFA\u8BAE 'sibling:<repo>' \u5F62\u6001\uFF0C\u7F3A\u5E2D\u540D\u76F4\u8FDB reason
export function envProbe(guardName, needs) {
  const missing = needs.filter((n) => !n.ok);
  if (missing.length) guardSkip(guardName, missing.map((m) => 'env-missing:' + m.name));
}
export const need = (name, ok) => ({ name, ok: !!ok });
