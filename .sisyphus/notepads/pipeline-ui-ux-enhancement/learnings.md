# Learnings — pipeline-ui-ux-enhancement

## [2026-04-01] Session ses_2b7e74a9bffeLHe58km205JeRL: Initial setup
- Source content confirmed available: ui-ux/ (5 files), designer/ (4 ZIPs), /tmp/designer-unzipped/ (extracted)
- Section guides confirmed at: /tmp/designer-unzipped/game-detail-design/references/section-guides/gui-section-guide.md + gameplay-section-guide.md
- ui-ux/ contains: SKILL.md, art-style-guide.md, review-checklist.md, screen-checklists.md, theory-knowledge-base.md
- Existing skills at skills/game-concept-design/ and skills/game-knowledge/ — NO references/ subdir yet, game-ui-ux will be first
- Agent files use YAML frontmatter: name, description, model, tools, maxTurns
- All content must be in Vietnamese
- Agent files capped at ~150 lines — overflow to reference files
- `skills/game-ui-ux/` should use relative `references/...` paths inside SKILL.md so the skill package stays portable
- Copying the 4 reference markdown files verbatim preserves source knowledge and keeps the skill layer thin
- Copied gui-section-guide.md and gameplay-section-guide.md exactly from the extracted designer ZIP into references/; verified line counts (84, 114) and bun test passed.
