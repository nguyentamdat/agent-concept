# /design-kit:status

**Mô tả:** Hiển thị trạng thái hiện tại của project: tên project, version spec, pipeline stage đang ở đâu (concept/prototype/feedback/approve), và knowledge base stats.

## Display

- Current project name
- Current spec version
- Current pipeline stage (`concept`, `prototype`, `feedback`, `approve`)
- Knowledge base stats (documents, chunks, entities/graph status if available)

## Notes

- Prefer MCP tools (`project_list`, `knowledge_stats`) to gather status.
- Keep output compact and readable.
