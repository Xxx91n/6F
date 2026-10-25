export declare const MCP_PROTOCOL_VERSION = "2024-11-05";
interface RpcMessage {
    jsonrpc?: string;
    id?: string | number | null;
    method?: string;
    params?: {
        [k: string]: unknown;
    };
}
interface RpcResponse {
    jsonrpc: '2.0';
    id: string | number | null;
    result?: unknown;
    error?: {
        code: number;
        message: string;
    };
}
export interface McpServerConfig {
    db?: string;
}
export declare function setMcpServerConfig(c: McpServerConfig): void;
export declare function resolveFactsDb(argDb: string | undefined): string | undefined;
export declare function handleRpcMessage(msg: RpcMessage): Promise<RpcResponse | null>;
export declare function serveMcpStdio(input: NodeJS.ReadableStream, output: NodeJS.WritableStream): Promise<void>;
export {};
