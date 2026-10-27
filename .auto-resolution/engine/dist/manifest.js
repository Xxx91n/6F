import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
export function metaPath() {
    const here = dirname(fileURLToPath(import.meta.url));
    return join(here, '..', 'manifest.meta.json');
}
// Design: 双 manifest 由单一元数据源生成，禁止手抄漂移 — ADR-0008
export function loadManifestMeta() {
    return JSON.parse(readFileSync(metaPath(), 'utf8'));
}
