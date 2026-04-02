---
description: Sinh tài liệu thiết kế cụ thể từ spec (gameplay, ui-ux, economy, art, content, tech, sound)
argument-hint: "[doc1,doc2,...|all]"
---

# /design-kit:docs [doc1,doc2,...|all]

**Mô tả:** Sinh tài liệu thiết kế chi tiết cụ thể từ spec hiện tại mà không cần qua flow approve đầy đủ. Cho phép generate 1 hoặc nhiều document theo nhu cầu.

## Arguments

- `[doc1,doc2,...]` — comma-separated list of document names (e.g., `gameplay,economy`)
- `all` — generate all 7 detail documents at once

## Available Documents

| Name | File | Description |
|------|------|-------------|
| `gameplay` | `gameplay-design.md` | Core mechanics, state diagrams, balance parameters |
| `ui-ux` | `ui-ux-spec.md` | Screen flows, wireframes, interaction patterns |
| `economy` | `economy-design.md` | Currency flows, earn/spend rates, monetization |
| `art` | `art-direction.md` | Visual identity, color system, asset list |
| `content` | `content-plan.md` | Scope matrix, workload estimates, prioritization |
| `tech` | `technical-requirements.md` | Tech stack, architecture, performance targets |
| `sound` | `sound-design.md` | Audio direction, SFX list, music moods |

## Steps

1. Parse the argument to determine which documents to generate:
   - If `all`: generate all 7 documents
   - If specific names: generate only those (validate names first)
2. Read current `spec.yaml` for context.
3. For each requested document:
   - Delegate to `document-writer` agent with document type specified
   - Search knowledge base for relevant best practices
   - Expand spec sections into implementable detail
   - Save to `{project}/documents/{filename}`
4. Show summary of generated files.

## Examples

```
/design-kit:docs gameplay,ui-ux     # Generate just 2 documents
/design-kit:docs all              # Generate all 7 documents
/design-kit:docs economy          # Generate only economy design doc
```

## Output Requirements

- Each document should be actionable for production teams.
- Cite knowledge base sources with page references.
- Cross-reference related spec sections.
- Include Open Questions section in each doc.
