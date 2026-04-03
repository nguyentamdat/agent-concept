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
- Đã thêm quality gate `ui-ux-reviewer` sau `detail-doc-reviewer` trong `/design-kit:approve`.
- `/design-kit:review-docs` hỗ trợ target `ui-ux-review` và gọi `ui-ux-reviewer` cho `ui-ux-spec.md` + `art-direction.md`.
- `bun test` pass: 279 tests, 0 fail.

## [2026-04-01] Session manual cleanup + AGENTS sync
- `AGENTS.md` đã được cập nhật để phản ánh pipeline UI/UX: thêm `ui-ux-reviewer`, `game-ui-ux/`, và các reference guides/review criteria mới.
- `WHERE TO LOOK` giờ có mục cho UI/UX review, document writer behavior, concept review, và GDD review.
- `ui-ux/`, `designer/`, và `/tmp/designer-unzipped/` đã được xóa sau khi nội dung được copy sang đúng vị trí.
- QA evidence saved under `.sisyphus/evidence/task-8-*.txt`.
- `bun test` pass: 279 tests, 0 fail.

## [2026-04-01] Plan compliance audit
- F1 audit re-verified the plan end-to-end against the repository, not subagent claims.
- Must-have deliverables exist and the main UI/UX pipeline additions are present in the markdown agents/commands.
- Current repo state still passes `bun test` (279 pass) and `bun run typecheck`.
- Evidence files for task-1 through task-8 are present under `.sisyphus/evidence/`.

- 2026-04-01: Compliance audit rerun against corrected baseline `938d957` confirmed plan deliverables are present; no TypeScript or plugin.json drift introduced by this plan, tests and typecheck pass.
