# Issues — pipeline-ui-ux-enhancement

## [2026-04-01] Session ses_2b7e74a9bffeLHe58km205JeRL: No issues yet
- All source files confirmed present
- Starting Wave 1 execution
# Issues — pipeline-ui-ux-enhancement

## [2026-04-01] Markdown diagnostics unavailable
- `lsp_diagnostics` has no configured Markdown server in this workspace, so SKILL.md validation had to rely on direct file inspection instead of LSP output.

## [2026-04-01] Plan compliance audit findings
- REJECT: guardrail violations exist relative to the pre-plan baseline (`65abcdf`).
- Forbidden scope changes detected in `src/cli.ts`, `mcp-server/AGENTS.md`, `.claude-plugin/plugin.json`, `skills/game-concept-design/SKILL.md`, `commands/concept.md`, `commands/research.md`, and `commands/review-concept.md`.
- `agents/detail-doc-reviewer.md` is 157 lines, which exceeds the plan's ~150-line agent cap.
- New/updated content is not fully Vietnamese; English headings/criteria remain in multiple files (for example `skills/game-ui-ux/SKILL.md`, `agents/ui-ux-reviewer.md`, `references/concept-evaluation-criteria.md`).
