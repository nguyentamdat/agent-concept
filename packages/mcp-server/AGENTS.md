# MCP Server

Separate package exposing game-design-kit library as Claude Code MCP tools via stdio transport.

## STRUCTURE

```
mcp-server/
├── src/
│   ├── server.ts              # Entry point: McpServer init, tool/resource registration, stdio connect
│   ├── tools/
│   │   ├── knowledge.ts       # knowledge_ingest, knowledge_search, knowledge_graph, knowledge_query_entity, knowledge_stats
│   │   ├── spec.ts            # spec_validate, spec_diff, spec_bump_version (GameSpecSchema inline)
│   │   ├── prototype.ts       # prototype_serve, prototype_stop, prototype_validate
│   │   └── project.ts         # project_create, project_list
│   ├── resources/
│   │   ├── templates.ts       # template://index, template://{name}
│   │   └── schemas.ts         # Schema resources (GameSpecSchema)
│   └── types/
│       └── modelcontextprotocol-server.d.ts  # SDK type augmentation
├── package.json               # Separate deps: @modelcontextprotocol/sdk, knowledge-layer (file:..)
└── tsconfig.json              # Extends root tsconfig
```

## WHERE TO LOOK

| Task | File | Notes |
|------|------|-------|
| Add new MCP tool | `src/tools/` | Create file, export `registerXxxTools(server, runtime)`, call from `server.ts` |
| Modify tool registration | `src/server.ts` | Import + call `registerXxxTools()` |
| Add MCP resource | `src/resources/` | Follow `templates.ts` pattern |
| Fix knowledge cache | `src/tools/knowledge.ts` | `loadKnowledgeCache()` / `saveKnowledgeCache()` + JSON serialization |
| Modify spec schema | `src/tools/spec.ts` | `GameSpecSchema` Zod definition is inline (not in types/) |
| Add prototype serving | `src/tools/prototype.ts` | Uses Node `http.createServer()` for local HTTP server |

## CONVENTIONS

- Each tool file exports a `registerXxxTools(server, runtime)` function.
- `runtime` object passes shared state (getKnowledge, projectsDir, etc.) — no globals in tool files.
- Tool names use `snake_case` with domain prefix: `knowledge_*`, `spec_*`, `prototype_*`, `project_*`.
- Tests co-located: `knowledge.test.ts` next to `knowledge.ts`.
- Depends on knowledge-layer via npm workspace resolution.

## ANTI-PATTERNS

- **Do not replicate** the `as unknown as` cast in `knowledge.ts:43` — known tech debt for private field access.
- **Do not import** from `@modelcontextprotocol/sdk` internal paths beyond `server/mcp.js` and `server/stdio.js`.
- New tools **must** be added to `settings.json` allowlist at root, or Claude Code will block them.

## NOTES

- `knowledge_graph` tool is **stub only** — returns message about deferred LLM integration.
- `server.ts` uses lazy initialization: `getKnowledge()` loads cache on first call, not at startup.
- Prototype tool manages a Node `http.Server` lifecycle (start/stop) for local preview.
- Environment variables: `CLAUDE_PLUGIN_ROOT`, `KNOWLEDGE_DIR`, `PROJECTS_DIR`, `TEMPLATES_DIR`, `CACHE_DIR`.
