---
name: game-knowledge
description: Auto-invoked skill that searches the knowledge base when game design topics are discussed. Triggers on: game mechanics, MDA framework, player motivation, difficulty curves, core loops, retention, economy design, UX patterns.
---

# Game Knowledge Auto-Search

This skill automatically searches the knowledge base when relevant game design topics are detected in conversation.

## Auto-Invoke Triggers

The skill triggers when conversation mentions:

| Category | Keywords |
|----------|----------|
| **Mechanics** | "mechanic", "core loop", "gameplay system", "rule" |
| **MDA** | "MDA", "mechanics dynamics aesthetics", "aesthetic" |
| **Motivation** | "motivation", "player motivation", "intrinsic", "extrinsic", "reward" |
| **Difficulty** | "difficulty", "challenge", "curve", "balancing" |
| **Retention** | "retention", "engagement", "session length", "D1/D7/D30" |
| **Economy** | "economy", "currency", "resource", "IAP", "monetization" |
| **UX** | "UX", "UI", "interface", "screen flow", "interaction" |
| **Psychology** | "psychology", "behavior", "habit", "hook model" |

## Search Patterns

When triggered, the skill performs targeted searches:

### For mechanics discussions:
```
Search: "MDA framework" + "{mentioned mechanic type}"
Search: "core loop design" + "{genre}"
Search: "meaningful decisions"
```

### For motivation discussions:
```
Search: "intrinsic motivation" + "{game type}"
Search: "extrinsic rewards" + "schedule"
Search: "player types" + "{target audience}"
```

### For difficulty discussions:
```
Search: "difficulty curve" + "design"
Search: "flow state" + "challenge"
Search: "skill ceiling" + "learning curve"
```

### For economy discussions:
```
Search: "economy design" + "{monetization type}"
Search: "currency flow" + "balance"
Search: "inflation" + "game economy"
```

## Usage Pattern

```markdown
User: "I want to add a progression system to my puzzle game"

[Skill auto-invokes]
→ Search knowledge base for:
   - "progression design puzzle games"
   - "difficulty curve progression"
   - "retention progression systems"

→ Results inform the response with theory-backed recommendations
```

## Search Query Templates

### General Design Query
```
Search for: {topic} + {game type/genre} + {design principle}
Example: "monetization strategy casual mobile"
```

### Deep Analysis Query
```
Search for: {concept} within {context}
Follow with: entity query for related concepts
Example: "MDA aesthetics" then query entities "aesthetics types"
```

## Quality Guidelines

1. **Always cite sources** — include book title + page when making recommendations
2. **Multiple angles** — search from 2-3 different perspectives (mechanics, psychology, economy)
3. **Synthesize don't quote** — summarize findings, don't dump raw text
4. **Uncertainty handling** — if search returns limited results, say so and suggest follow-up terms
5. **Cross-reference** — link findings to user's specific game context (genre, audience, platform)

## Output Format

When knowledge is found:
```
**From "{Book Title}" (p.{page}):**
{Key insight synthesized from source}

**Application to your game:**
{How this applies to the specific design challenge}
```

When knowledge is limited:
```
**Note:** Knowledge base search returned limited results on this topic.
**Suggested follow-up searches:** {2-3 alternative query terms}
```
