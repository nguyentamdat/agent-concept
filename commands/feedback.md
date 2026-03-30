# /design-kit:feedback <feedback text>

**Mô tả:** Xử lý feedback từ playtester và chuyển thành cập nhật spec có kiểm soát, dựa trên lý thuyết thiết kế. Phân tích root cause, đề xuất thay đổi, và regenerate prototype.

## Steps

1. Read the current spec and analyze the feedback for root cause (not just symptoms).
2. Search the knowledge base for relevant design principles tied to the issue.
3. Check consistency against concept outputs (`gcd.md`, `gcd-gameplay.md`) before proposing changes.
4. Propose specific spec changes with rationale and expected impact.
5. Show the spec diff and ask user to approve, edit, or reject.
6. If approved:
    - Run `spec_bump_version`
    - Apply approved changes
    - Run `spec_validate`
    - Regenerate prototype via `/design-kit:prototype`

## Output Requirements

- Preserve the core concept unless user requests pivot.
- Cite source and page for major recommendations.
- Never apply major changes without explicit approval.

## Spec Rules
1. Always run `spec_validate` after editing any spec file.
2. Bump spec version with `spec_bump_version` whenever behavior or design intent changes.
3. Preserve change history and rationale for iterative updates.
4. Maintain internal consistency across pillars, mechanics, progression, scope, and metrics.
