# Review Loop Protocol

Every artifact produced by the pipeline (HTML or markdown) MUST pass through this loop **before reaching the human approval gate**. Domain reviewer and creative-director both have to return `APPROVE`. Anything short of `APPROVE` (i.e. `CONCERNS` or `REJECT`) routes the artifact back to the producer with a feedback packet for revision.

## When this loop applies

| Pipeline step | Producer | Artifact | Domain reviewer | Director gate |
|---|---|---|---|---|
| `game-prototype` Phase 1 step 5b (after 5-layer audit, before user picks 1 option) | `game-prototype` skill | **batch** of `Game Demo/[slug]-concept-{A,B,C}.html` (single review round on all 3) | `ui-ux-reviewer` (concept-prototype branch) | `creative-director` — gate `CD-GAME-DEMO` |
| `game-prototype` Phase 2 final | `game-prototype` skill | `Game Demo/[slug]-vN.html` | `ui-ux-reviewer` (concept-prototype branch) | `creative-director` — gate `CD-GAME-DEMO` |
| `game-prototype` Phase 3 | `game-prototype` skill | `Game Demo/[slug]-GCD.md` | `detail-doc-reviewer` (**Nhánh GCD lightweight** scope — see agent file) | `creative-director` — gate `CD-GAME-DEMO` |
| `/create` Step 2 | `mockup-designer` | `mockup.html` | `ui-ux-reviewer` (mockup branch) | `creative-director` — gate `CD-MOCKUP` |
| `/create` Step 3 | `wireframe-designer` | `wireframe.html` | `ui-ux-reviewer` (wireframe branch) | `creative-director` — gate `CD-WIREFRAME` |
| `/create` Step 6 | `document-writer` | each detail doc | `ui-ux-reviewer` for `ui-ux-spec.md` / `art-direction.md`, `detail-doc-reviewer` for the rest | `creative-director` — gate `CD-DOCS` |
| `/iterate` Step 6 | same producer as above (note: GCD revisions route back to the **`game-prototype` skill Phase 3**, not `document-writer`) | regenerated artifact | same reviewer as above | same director gate as above |

**Concept-prototype batch rule:** the three Phase 1 concept HTMLs are reviewed in a single round (one ui-ux-reviewer pass + one creative-director pass over all 3 files together) — not three independent loops. If any one concept fails, the producer revises only the failing concept(s) and the loop restarts on the batch.

The same loop is applied uniformly. There is no per-artifact opt-out.

## Loop shape (sequential)

```
            ┌─────────────────────┐
            │  Producer generates │
            │  artifact (or       │
            │  revises it)        │
            └──────────┬──────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │  Domain reviewer    │
            │  reads artifact     │
            └──────────┬──────────┘
                       │
                       ├── verdict = APPROVE ──┐
                       │                       │
                       └── CONCERNS / REJECT ──│──→ feedback packet → Producer (revise) ──┐
                                               │                                           │
                                               ▼                                           │
                                    ┌─────────────────────┐                                │
                                    │  Director           │                                │
                                    │  (creative-director)│                                │
                                    │  reads artifact     │                                │
                                    └──────────┬──────────┘                                │
                                               │                                           │
                                               ├── verdict = APPROVE ──→ HUMAN GATE        │
                                               │                                           │
                                               └── CONCERNS / REJECT ──→ feedback packet ──┘
```

**Rules**

1. **Producer first, then reviewer, then director.** Run sequentially. Director only sees artifacts that already passed the domain reviewer in the current iteration.
2. **Both must return `APPROVE`** before the human sees the artifact. `CONCERNS` is treated the same as `REJECT` for routing purposes — it triggers a revision.
3. **After any revision, restart from the domain reviewer.** The director's previous APPROVE is invalidated because the artifact has changed.
4. **No iteration cap.** The loop runs until both reviewers approve, or the user interrupts. If a reviewer issues consecutive REJECTs that the producer cannot resolve, the reviewer escalates per its own escalation rules (e.g. ui-ux-reviewer → creative-director on 2 consecutive REJECTs of the same artifact; creative-director → user on a fundamental dispute). Escalation is the only legitimate exit short of approval.
5. **Human only sees approved artifacts.** Do not surface intermediate iterations to the user unless the loop escalates to them.

### Oscillation guard (mandatory termination safety)

"No cap" is only safe when reviewer + director never demand contradictory things. Enforce that explicitly:

- Domain reviewer's `APPROVE` message MUST include a one-line **"Strong:"** summary listing the criteria/aspects that passed (e.g. `Strong: navigation completeness, dom-grab integration, brand consistency`). This is a non-optional field on APPROVE.
- Before the director issues a non-`APPROVE` verdict, it MUST check whether any of its required fixes would regress something the domain reviewer's most recent `Strong:` line called out.
- If such a conflict exists, the director MUST issue verdict **`ESCALATE`** (a fourth verdict reserved for the director). The loop terminates and the artifact is surfaced to the user as a deadlock with both packets quoted. The user breaks the tie.
- `ESCALATE` MUST NOT be used for ordinary disagreement — only when complying with the director's required fix would invalidate the domain reviewer's stated `Strong:` items.

This guarantees termination: every iteration either advances toward dual-APPROVE, exits via `ESCALATE`, or the producer fails to revise at all (which itself is a `REJECT` cycle that surfaces upstream via the existing escalation rules).

## Reviewer output contract

Reviewers (creative-director, ui-ux-reviewer, detail-doc-reviewer) MUST emit:

1. A first-line verdict: exactly one of `APPROVE` | `CONCERNS` | `REJECT`. The director may additionally emit `ESCALATE` per the oscillation guard above.
2. If verdict is `APPROVE`: a one-line `Strong:` field is mandatory (see oscillation guard).
3. If verdict is `CONCERNS` / `REJECT` / `ESCALATE`: a **feedback packet** the producer (or the user, in the `ESCALATE` case) can act on.

### Feedback packet location

Persist every non-`APPROVE` packet at:

```
projects/{project-name}/.review/<artifact-stem>-iter<N>-<reviewer>.md
```

Examples:
- `projects/spelldraft/.review/mockup-iter2-ui-ux-reviewer.md`
- `projects/spelldraft/.review/spelldraft-v3-iter1-creative-director.md`
- `projects/spelldraft/.review/spelldraft-GCD-iter1-detail-doc-reviewer.md`

The orchestrator writes these files; the producer reads them in revise mode. This keeps the contract durable across `/create` and `/iterate` sessions and makes the audit trail inspectable.

### Feedback packet format

```markdown
## Feedback to producer

Artifact: <relative path to the artifact under review>
Iteration: <N> of unbounded
Verdict: <CONCERNS|REJECT>

### Required changes

1. **<short title>** — <severity: blocker | major | minor>
   - Where: <file:line or screen/component reference>
   - What's wrong: <specific, quotable issue>
   - Why it matters: <impact, citing pillar/criterion>
   - Required fix: <concrete, actionable change>

2. **<short title>** — <severity>
   - ...

### Open questions (optional)

- <question that the producer needs to clarify with the user before fixing>
```

**Severity rules**:

- `blocker` — REJECT-level. Must be addressed for the artifact to advance.
- `major` — addressed before APPROVE. Drives a CONCERNS verdict if alone, REJECT if combined with other blockers.
- `minor` — nice-to-have. A reviewer that finds only minor issues should still issue CONCERNS (which still triggers a revision per this protocol), not APPROVE.

## Producer revise-mode contract

When invoked in revise mode, a producer (game-prototype skill, mockup-designer, wireframe-designer, document-writer) MUST:

1. **Read the latest feedback packet** before touching the artifact.
2. **Address every blocker and major item.** Minor items must be addressed or explicitly waived with a one-line reason in the producer's response.
3. **Preserve unrelated correct content.** Do not rewrite passing sections.
4. **Output a revision summary** alongside the new artifact:

```markdown
## Revision summary

Artifact: <path>
Iteration: <N>
Resolved: <count> blocker, <count> major, <count> minor
Waived (minor only): <list with reasons>
Unchanged: <count> sections preserved verbatim
```

5. **Return control to the loop.** The reviewer is invoked again — do not call the human gate from within revise mode.

## Loop entry from `/create` and `/iterate`

A pipeline step that emits an artifact reads as:

```
1. Invoke <producer> to generate <artifact>.
2. Run the review loop (this protocol) on <artifact> with reviewer = <domain reviewer> and director = creative-director gate <CD-...>.
3. When the loop returns APPROVE+APPROVE, present the artifact to the user via AskUserQuestion (the human gate).
4. Handle the human gate response (Approve / Request changes / Skip) per the step's normal rules.
```

The human gate is unchanged in shape. The only difference is that by the time the user sees the artifact, both reviewers have signed off.

## Why this shape

- **Sequential reviewer → director** keeps directorial review focused on artifacts that already meet domain quality, so director cycles aren't spent on low-level domain issues.
- **Restart from domain reviewer after every revision** prevents stale director approvals from becoming a blank check.
- **No cap** matches the user's directive that the human only sees approved artifacts. Pathological loops are bounded by the reviewer-side escalation rules, not by an arbitrary count.
- **Single shared protocol** means one place to change loop semantics. Every command and skill that produces artifacts references this file.
