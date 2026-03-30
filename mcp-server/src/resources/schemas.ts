import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import yaml from "js-yaml";
import { GameSpecSchema, createDefaultGameSpec } from "../tools/spec";

export function registerSchemaResources(server: McpServer): void {
  server.registerResource(
    "schema_game_spec",
    "schema://game-spec",
    {
      title: "Game spec schema",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "schema://game-spec",
          text: JSON.stringify(
            {
              schema: "GameSpecSchema",
              shape: GameSpecSchema.shape,
            },
            null,
            2
          ),
        },
      ],
    })
  );

  server.registerResource(
    "schema_game_spec_example",
    "schema://game-spec-example",
    {
      title: "Game spec example",
      mimeType: "application/yaml",
    },
    async () => ({
      contents: [
        {
          uri: "schema://game-spec-example",
          text: yaml.dump(createDefaultGameSpec("Example Game"), {
            noRefs: true,
            sortKeys: false,
            lineWidth: 120,
          }),
        },
      ],
    })
  );
}
