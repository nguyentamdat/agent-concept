import { mkdir, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

type TemplateRuntime = {
  templatesDir: string;
};

const templateEntries: Array<{ name: string; uri: string; fileName: string; title: string }> = [
  { name: "template_base", uri: "template://base", fileName: "base.html", title: "Base template" },
  { name: "template_grid_puzzle", uri: "template://grid-puzzle", fileName: "grid-puzzle.html", title: "Grid puzzle template" },
  { name: "template_side_scroll", uri: "template://side-scroll", fileName: "side-scroll.html", title: "Side scroll template" },
  { name: "template_resource_mgr", uri: "template://resource-mgr", fileName: "resource-mgr.html", title: "Resource manager template" },
  { name: "template_card_hand", uri: "template://card-hand", fileName: "card-hand.html", title: "Card hand template" },
  { name: "template_text_choice", uri: "template://text-choice", fileName: "text-choice.html", title: "Text choice template" },
];

export function registerTemplateResources(server: McpServer, runtime: TemplateRuntime): void {
  server.registerResource(
    "template_index",
    "template://index",
    {
      title: "Template index",
      mimeType: "application/json",
    },
    async () => {
      await mkdir(runtime.templatesDir, { recursive: true });
      const files = await readdir(runtime.templatesDir);
      return {
        contents: [
          {
            uri: "template://index",
            text: JSON.stringify({ files }, null, 2),
          },
        ],
      };
    }
  );

  for (const entry of templateEntries) {
    server.registerResource(
      entry.name,
      entry.uri,
      {
        title: entry.title,
        mimeType: "text/html",
      },
      async () => {
        const path = resolve(runtime.templatesDir, entry.fileName);
        const file = Bun.file(path);
        const exists = await file.exists();
        const text = exists
          ? await file.text()
          : `Template '${entry.fileName}' is not available yet. Add it in templates/ during Phase 3.`;

        return {
          contents: [
            {
              uri: entry.uri,
              text,
            },
          ],
        };
      }
    );
  }
}
