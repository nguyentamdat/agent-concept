declare module "@modelcontextprotocol/server" {
  export class StdioServerTransport {
    constructor();
  }

  export class McpServer {
    constructor(config: { name: string; version: string });
    connect(transport: StdioServerTransport): Promise<void>;
    registerTool<Input>(
      name: string,
      config: {
        title: string;
        description: string;
        inputSchema: unknown;
      },
      handler: (
        input: Input
      ) =>
        | Promise<{
            content: Array<{ type: "text"; text: string }>;
            isError?: boolean;
          }>
        | {
            content: Array<{ type: "text"; text: string }>;
            isError?: boolean;
          }
    ): void;
    registerResource(
      name: string,
      uri: string,
      config: { title: string; mimeType: string },
      handler: () => Promise<{ contents: Array<{ uri: string; text: string }> }> | { contents: Array<{ uri: string; text: string }> }
    ): void;
  }

  export class ResourceTemplate {
    constructor(template: string, options?: Record<string, unknown>);
  }
}
