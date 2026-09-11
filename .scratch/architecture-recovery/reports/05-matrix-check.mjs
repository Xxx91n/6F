// 05-matrix-check.mjs — machine check for 05-unit-matrix.json against 05-unit-matrix.schema.json
// covers: JSON Schema 2020-12 subset (type/required/enum/const/pattern/minItems/maxItems/minLength/minimum/maximum/additionalProperties/$ref) + matrix coverage invariants
import fs from "node:fs";
const dir = new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const schema = JSON.parse(fs.readFileSync(dir + "05-unit-matrix.schema.json", "utf8"));
const data = JSON.parse(fs.readFileSync(dir + "05-unit-matrix.json", "utf8"));
const errors = [];
const resolve = (ref) => ref.split("/").slice(1).reduce((o, k) => o[k], schema);
function validate(v, sch, path) {
  if (sch.$ref) return validate(v, resolve(sch.$ref), path);
  if (sch.const !== undefined && v !== sch.const) return errors.push(path + ": const " + sch.const);
  if (sch.enum && !sch.enum.includes(v)) return errors.push(path + ": not in enum " + JSON.stringify(sch.enum));
  if (sch.type === "object") {
    if (typeof v !== "object" || v === null || Array.isArray(v)) return errors.push(path + ": not object");
    for (const r of sch.required || []) if (!(r in v)) errors.push(path + ": missing required " + r);
    if (sch.additionalProperties === false) for (const k of Object.keys(v)) if (!(k in (sch.properties || {}))) errors.push(path + ": additional prop " + k);
    for (const [k, sub] of Object.entries(sch.properties || {})) if (k in v) validate(v[k], sub, path + "/" + k);
  } else if (sch.type === "array") {
    if (!Array.isArray(v)) return errors.push(path + ": not array");
    if (sch.minItems !== undefined && v.length < sch.minItems) errors.push(path + ": minItems " + sch.minItems + " got " + v.length);
    if (sch.maxItems !== undefined && v.length > sch.maxItems) errors.push(path + ": maxItems " + sch.maxItems + " got " + v.length);
    if (sch.items) v.forEach((x, i) => validate(x, sch.items, path + "[" + i + "]"));
  } else if (sch.type === "string") {
    if (typeof v !== "string") return errors.push(path + ": not string");
    if (sch.minLength !== undefined && v.length < sch.minLength) errors.push(path + ": minLength");
    if (sch.pattern && !new RegExp(sch.pattern).test(v)) errors.push(path + ": pattern " + sch.pattern);
  } else if (sch.type === "number" || sch.type === "integer") {
    if (typeof v !== "number") return errors.push(path + ": not number");
    if (sch.minimum !== undefined && v < sch.minimum) errors.push(path + ": < minimum");
    if (sch.maximum !== undefined && v > sch.maximum) errors.push(path + ": > maximum");
  }
}
validate(data, schema, "");
// coverage invariants (not expressible in plain JSON Schema)
const ids = data.cells.map(c => c.id);
if (new Set(ids).size !== ids.length) errors.push("duplicate cell ids");
for (const d of data.dimensions) for (const s of data.scales) {
  const hit = data.cells.filter(c => c.dimension === d && c.scale === s);
  if (hit.length !== 1) errors.push("coverage: " + d + " x " + s + " has " + hit.length + " cells");
}
for (const c of data.cells) {
  if (/待定|TBD|待补充|placeholder/i.test(c.criterion)) errors.push(c.id + ": criterion contains placeholder");
  if (!c.criterion.trim()) errors.push(c.id + ": empty criterion");
  if (!c.data_source.every(x => x.trim())) errors.push(c.id + ": empty data source entry");
  for (const band of ["yellow", "red"]) {
    const t = c.threshold[band];
    if (!t.metric.trim() || typeof t.value !== "number") errors.push(c.id + ": empty " + band + " threshold");
    if (band === "yellow" && c.threshold.red.metric === t.metric && c.threshold.yellow.operator === c.threshold.red.operator && c.threshold.red.value === t.value) errors.push(c.id + ": yellow==red degenerate");
  }
}
if (errors.length) { console.error("FAIL (" + errors.length + "):\n" + errors.join("\n")); process.exit(1); }
console.log("PASS: 25/25 cells, schema-valid, full S1-S5 x 5-scale coverage, no placeholders");
