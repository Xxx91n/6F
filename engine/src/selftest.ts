import { loadManifestMeta } from './manifest.js';

export interface Check { name: string; pass: boolean; detail: string; }
export interface SelftestResult { ok: boolean; checks: Check[]; }

export function runSelftest(): SelftestResult {
  const checks: Check[] = [];
  let meta: ManifestMeta | null = null;
  try {
    meta = loadManifestMeta();
    checks.push({ name: 'manifest readable', pass: true, detail: meta.name + '@' + meta.version });
  } catch (e) {
    checks.push({ name: 'manifest readable', pass: false, detail: String((e as Error).message) });
  }
  const m = meta as ManifestMeta | null;
  checks.push({ name: 'five-layer box shells=4', pass: !!m && m.shells.length === 4, detail: m ? String(m.shells.length) : 'n/a' });
  checks.push({ name: 'default mode single', pass: !!m && m.modes[0] === 'default', detail: m ? m.modes.join(',') : 'n/a' });
  checks.push({ name: 'mcp read-only', pass: !!m && m.mcp.readOnly === true, detail: m ? String(m.mcp.readOnly) : 'n/a' });
  checks.push({ name: 'receipt fields >= 4', pass: !!m && m.receipt.fields.length >= 4, detail: m ? String(m.receipt.fields.length) : 'n/a' });
  return { ok: checks.every(function (c) { return c.pass; }), checks: checks };
}

import type { ManifestMeta } from './manifest.js';