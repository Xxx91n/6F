# 轮 24 执行轮交接（#73 T0→T4 实施面闭合）

- 日期：2026-09-20 ｜ 分支：`facade-impl`（`xlz`→`pqp`→`ytz`→`ymu`→`rxo`→`sxp` 六票；初始平行栈 `xlz`.parent=`a3d5f27`，R3 依赖归位经 `but move` 现=栈顶：facade-impl→round24-closeout→r23-impl→round23-closeout）｜ **未 push**
- 报告：`D:\Aworker\6F\.scratch\macro-audit\reports\2026-09-20-report.md`（逐条可复跑证据＋回归事件实录）
- 账本口径：D-085~D-091 全数落地为实物；ADR-0021/D-051 执行债（root LICENSE）清偿

## 交付全景

| T | 内容 | 状态 | 关键证据 |
|---|---|---|---|
| T0 | 基线守卫 | ✅ | 15 NN-check＋xfail-run＋upstream-map 21/21＋github-rest 56/56 全 exit 0（.code-tmp/g*.out） |
| T1 | 社区七件 | ✅ `xlz` | root LICENSE=engine/LICENSE 字节一致；CONTRIBUTING/SECURITY/CODE_OF_CONDUCT/ISSUE_TEMPLATE×3/PR_TEMPLATE/CODEOWNERS 无 BOM |
| T2 | README 双语双层门面 | ✅ `pqp` | README.md EN canonical 14 节＋README.zh-CN.md derived（canonicalMarker/{#en-slug}/sync 戳/owner）＋hero.svg 2145B＋architecture.svg 4257B |
| T3 | 73-check 同步守卫 | ✅ `ytz` | PASS 14/14；负测：锚断=FAIL exit1／戳掉队=XFAIL exit0；70-inventory 重生成 52 守卫/1289 emits |
| T4 | 元数据三项 | ⚠ 2/3 `ymu` | description+10 topics 已写且 API 回读逐字一致、homepage=null；social-card.png 1280×640 已产——**上传 BLOCKED：REST/GraphQL 无 social-preview 面（404），仅 web UI** |

## 复跑电池（全绿）

```bash
cd D:\Aworker\6F\.scratch\architecture-recovery\reports
node 73-check.mjs      # PASS 14/14（双语 canonical→derived 同步守卫）
node 44-check.mjs      # PASS 59/59
node 41a-check.mjs     # 35/38（余 D6/D7/F4=已登记 XFAIL 归因在册）
node 70-check.mjs      # PASS 13/13
node xfail-run.mjs     # XFAIL-RUN PASS（8 条已登记＋SEALED 15）
node update-70-inventory.mjs  # 守卫增删时重生成盘点
cd D:\Aworker\6F\engine && npm test && npm run package && node dist/cli.js selftest
# npm test exit 0（gen+build+smoke 17 件）；pack --dry-run exit 0；selftest ok:true 5/5
```

- **A4 弱化修复**：73-check A4 现剥 `<!-- -->` 注释后取可见行（原 `/canonical/` 可被注释糊弄——审计 R1 实证）；负测：删 ⚠ 横幅→FAIL 13/14。
- **inventory 第七族**：update-70-inventory.mjs＋70-check.mjs 双份机芯同加 `x()`（73-check XFAIL 曾成盲区）；assertion_ids=**唯一 slug 去重**（t()/x() 同 slug C2 按一计），emit 点 1289→1246 修重复计。
- **zh 失衡括号**：L23 `上架终结）。` 多 `）` 已修（审计 R2）。
- **linkTargets 死代码环已清**：`![..](..)` 循环冗余（`](..)` 全覆盖），删后 B4 仍 PASS。

## 关键口径锚（下轮勿越界）

- **README 节段=机器契约**：44-check（上游表状态列 `已接入（active）`/`规划中（planned）` 双语枚举＋`唯一权威`/`机读`/`已接入→active`/`禁 range/浮动 tag/latest`/`手动窗口`/`golden 回归`/`DuckDB（@duckdb/node-api）` 全角括号）与 41a-check（`单调递增`/`退出条件`/`Try on a real repository`/`外部内容随上游变化`/`发布未发生`/`可安装 listing`）逐字绑定 README.md——**门面重写必须先查守卫钉串**，钉串以双语契约串形态回填（如 `0.x 单调递增、号不复用 (...)`）。
- **GitHub slugger 语义**：连字符/下划线保留，其余标点剥除——73-check B2 已按此实现（`[^\w\- ]` 剥除后空格转连字符），锚点错位教训在案。
- **XFAIL 三分类**：结构漂移=FAIL；sync 戳掉队=XFAIL·warn（exit 0，Opendray 先例）；73-check 的 x() 发射器独立计数不入 fail。
- **transport 转义教训**：ctx_execute 模板字面量内嵌文件内容时 `\n`/`\s` 会被吞——**大文件写入走 ctx_batch_execute bash heredoc `<< 'EOF'`**（本票实证路径）。
- **social-preview 无 API 面**：`gh api repos/{o}/{r}/social-preview` GET/PUT 均 404；上传=Settings→Social preview 手动（`docs\assets\social-card.png` 就位待用）。
- **生效边界**：live face=main；`facade-impl` 未 push 未合入——GitHub 门面 README 仍旧版（D-085③ 如实口径）；description/topics 即刻生效系 D-091 授权本意。

## 已知开放态（非失败）

- social-card 上传：web-UI 手动步，归所有者或后续带浏览器会话的 lane。
- BACKLOG #73 未标 ✅——upload 残项＋push 闸门未决。
- 审计 R1-R4 已同窗闭环（见报告「返工批」节）；建议修四件呈报待裁：EN 中文钉串账本注记／73-check D 组票面外扩／{#en-slug} 裸锚读者成本（+1 死代码环已顺手清）。
- `readme-ci-badge`/`readme-motion-gif` registry 双项维持 event_bound——触发事件（engine-ci-main-green/listing-material-freeze）均未发生，不翻转。
- 41a:D6/D7/F4 持续 XFAIL（已登记归因：CHANGELOG a_range 字面钉漂移＋任务书轮替锚）——非本票引入，处置归 T6 judgement lane。

## 下轮建议任务域

1. T5 三追问 grill（字面钉失效族通用纪律——本票钉串回归为鲜活样本）＋T6 judgement 批。
2. #73 追问挂票裁决：首屏文案逐字/SVG 三选一/模板字段/social PNG 细节。
3. push 授权后：分支栈合入→CI 首跑实证（触发 `engine-ci-main-green`→CI badge 挂载窗口）→真机 `/mcp` 重验（D-067⑧）。
4. social-card web-UI 上传＋README 门面线上复核（live face 翻转后 73-check 仍应 PASS 14/14）。
