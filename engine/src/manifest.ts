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

// 两个清单文件都是从同一份元数据自动生成的，不手抄，省得两边对不上
export function loadManifestMeta(): ManifestMeta {
  return JSON.parse(readFileSync(metaPath(), 'utf8')) as ManifestMeta;
}