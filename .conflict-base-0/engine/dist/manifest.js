import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
export function metaPath() {
    const here = dirname(fileURLToPath(import.meta.url));
    return join(here, '..', 'manifest.meta.json');
}
export function loadManifestMeta() {
    return JSON.parse(readFileSync(metaPath(), 'utf8'));
}
