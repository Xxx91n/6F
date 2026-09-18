import { loadManifestMeta } from './manifest.js';
export function runSelftest() {
    const checks = [];
    let meta = null;
    try {
        meta = loadManifestMeta();
        checks.push({ name: 'manifest readable', pass: true, detail: meta.name + '@' + meta.version });
    }
    catch (e) {
        checks.push({ name: 'manifest readable', pass: false, detail: String(e.message) });
    }
    const m = meta;
    checks.push({ name: 'shells declared == 4', pass: !!m && m.shells.length === 4, detail: m ? String(m.shells.length) : 'n/a' });
    checks.push({ name: 'default mode single', pass: !!m && m.modes[0] === 'default', detail: m ? m.modes.join(',') : 'n/a' });
    checks.push({ name: 'mcp read-only', pass: !!m && m.mcp.readOnly === true, detail: m ? String(m.mcp.readOnly) : 'n/a' });
    checks.push({ name: 'receipt fields >= 4', pass: !!m && m.receipt.fields.length >= 4, detail: m ? String(m.receipt.fields.length) : 'n/a' });
    return { ok: checks.every(function (c) { return c.pass; }), checks: checks };
}
