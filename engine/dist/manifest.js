import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
export function metaPath() {
    const here = dirname(fileURLToPath(import.meta.url));
    return join(here, '..', 'manifest.meta.json');
}
// 两个清单文件由同一个元数据源自动生成，不手工复制避免不一致
export function loadManifestMeta() {
    return JSON.parse(readFileSync(metaPath(), 'utf8'));
}
