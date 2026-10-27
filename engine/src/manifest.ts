import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export interface ManifestMeta {
  name: string;
  version: string;
  description: string;
  skills: string[];
  mcp: { transport: string; readOnly: boolean };
  extensions: string[];
  shells: string[];
  modes: string[];
  receipt: { fields: string[] };
}

export function metaPath(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, '..', 'manifest.meta.json');
}

// Design: 双 manifest 由单一元数据源生成，禁止手抄漂移 — ADR-0008
export function loadManifestMeta(): ManifestMeta {
  return JSON.parse(readFileSync(metaPath(), 'utf8')) as ManifestMeta;
}