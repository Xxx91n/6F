import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const meta = JSON.parse(readFileSync(join(root, "manifest.meta.json"), "utf8"));

// D-219：生成物的尾行有个哨兵——JSON 一律以 LF 结尾（POSIX 3.206 的文本文件定义，工业上三家都这么定）；
// stable() 会补一个 \n，drift 比对改成逐字节比（两边都不 .trim() 了——trim 对行尾差异结构性看不见，哨兵对自己身上的毛病自带盲区）。
function stable(o) { return JSON.stringify(o, null, 2) + "\n"; }

const AP_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";

const targets = [
  ["plugin.json", { $schema: AP_SCHEMA, name: meta.name, version: meta.version, description: meta.description, author: meta.author, homepage: meta.homepage, repository: meta.repository, license: meta.license, extensions: Object.fromEntries(meta.extensions.map(ns => [ns, { path: "extensions/" + ns }])) }],
  [join(".claude-plugin", "plugin.json"), { name: meta.claudePlugin.name, version: meta.claudePlugin.version, description: meta.description, author: meta.author, homepage: meta.homepage, repository: meta.repository, license: meta.license, skills: meta.skills.map(s => "./skills/" + s) }],
  // Claude Code 插件根目录的 .mcp.json 是标准的自动发现位（标准 MCP 配置格式：写 type 不写成 transport，也没 readOnly）。
  // #59/D-067 自带分装：从 git 拉下来装的时候没有 node_modules，也不往 PATH 里注册——command 就写 node，用宿主自己的运行时，
  // ${CLAUDE_PLUGIN_ROOT} 放 args 里、不放 command 里（Windows 上少露一点是一点）；裸命令名加 PATH 那条是官方排错手册明写的反模式。
  [".mcp.json", { mcpServers: { "macro-audit-kernel": { type: meta.mcp.transport, command: "node", args: ["${CLAUDE_PLUGIN_ROOT}/dist/cli.js", "mcp"], ...(meta.mcp.env ? { env: meta.mcp.env } : {}) } } }]
];

let drift = 0;
for (const t of targets) {
  const rel = t[0];
  const full = join(root, rel);
  const expected = stable(t[1]);
  if (existsSync(full)) {
    // D-219：按字节比（不许 .trim()——行尾差异别又悄悄看不见了；哨兵对自家尾行的盲区这下自己补上了）
    if (readFileSync(full, "utf8") !== expected) { console.log("DRIFT " + rel); drift++; }
    else { console.log("CLEAN " + rel); }
  } else { console.log("NEW   " + rel); }
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, expected, { encoding: "utf8" });
}

const p1 = JSON.parse(readFileSync(join(root, "plugin.json"), "utf8"));
const p2 = JSON.parse(readFileSync(join(root, ".claude-plugin", "plugin.json"), "utf8"));
const AP_ALLOWED = ["$schema", "name", "version", "description", "author", "homepage", "repository", "license", "keywords", "extensions"];
const checks = [
  ["standard $schema==const", p1["$schema"] === AP_SCHEMA],
  ["standard name==meta", p1.name === meta.name],
  ["claude name==meta.claudePlugin.name", p2.name === meta.claudePlugin.name],
  ["versions aligned", p1.version === p2.version && p1.version === meta.version],
  ["standard plugin.json 无越界属性", Object.keys(p1).every(k => AP_ALLOWED.includes(k))],
  ["extensions 为反向域名对象图", p1.extensions && typeof p1.extensions === "object" && !Array.isArray(p1.extensions) && Object.keys(p1.extensions).every(k => k.indexOf(".") > 0)],
  ["skills 声明在 claude 侧（./skills/<name> 路径形）", JSON.stringify(p2.skills) === JSON.stringify(meta.skills.map(s => "./skills/" + s))]
];
let ok = true;
for (const c of checks) { console.log((c[1] ? "PASS " : "FAIL ") + c[0]); if (!c[1]) ok = false; }
console.log(drift === 0 && ok ? "GEN-OK" : "GEN-FAIL");
process.exit(drift === 0 && ok ? 0 : 1);
