export interface ManifestMeta {
    name: string;
    version: string;
    description: string;
    skills: string[];
    mcp: {
        transport: string;
        readOnly: boolean;
    };
    extensions: string[];
    shells: string[];
    modes: string[];
    receipt: {
        fields: string[];
    };
}
export declare function metaPath(): string;
export declare function loadManifestMeta(): ManifestMeta;
