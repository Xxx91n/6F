import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
export function metaPath() {
    const here = dirname(fileURLToPath(import.meta.url));
    return join(here, '..', 'manifest.meta.json');
}
// 两个清单文件都是从同一份元数据自动生成的，不手抄，省得两边对不上
export function loadManifestMeta() {
    return JSON.parse(readFileSync(metaPath(), 'utf8'));
}
