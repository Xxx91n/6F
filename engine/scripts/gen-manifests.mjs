import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const meta = JSON.parse(readFileSync(join(root, "manifest.meta.json"), "utf8"));

function stable(o) { return JSON.stringify(o, null, 2); }

const AP_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";

const targets = [
  ["plugin.json", { $schema: AP_SCHEMA, name: meta.name, version: meta.version, description: meta.description, author: meta.author, homepage: meta.homepage, repository: meta.repository, license: meta.license, extensions: Object.fromEntries(meta.extensions.map(ns => [ns, { path: "extensions/" + ns }])) }],
  [join(".claude-plugin", "plugin.json"), { name: meta.claudePlugin.name, version: meta.claudePlugin.version, description: meta.description, author: meta.author, homepage: meta.homepage, repository: meta.repository, license: meta.license, skills: meta.skills, mcp: "mcp.json" }],
  ["mcp.json", { mcpServers: { "macro-audit-kernel": { transport: meta.mcp.transport, readOnly: meta.mcp.readOnly, command: "macro-audit", args: ["mcp"] } } }]
];

let drift = 0;
for (const t of targets) {
  const rel = t[0];
  const full = join(root, rel);
  const expected = stable(t[1]);
  if (existsSync(full)) {
    if (readFileSync(full, "utf8").trim() !== expected.trim()) { console.log("DRIFT " + rel); drift++; }
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
  ["skills 声明在 claude 侧", JSON.stringify(p2.skills) === JSON.stringify(meta.skills)]
];
let ok = true;
for (const c of checks) { console.log((c[1] ? "PASS " : "FAIL ") + c[0]); if (!c[1]) ok = false; }
console.log(drift === 0 && ok ? "GEN-OK" : "GEN-FAIL");
process.exit(drift === 0 && ok ? 0 : 1);
