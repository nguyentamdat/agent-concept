---
name: game-knowledge
version: 2.0.0
description: "This skill should be used when the user discusses game design topics such as 'game mechanics', 'MDA framework', 'player motivation', 'difficulty curves', 'core loops', 'retention strategies', 'economy design', 'UX patterns', 'monetization', 'player psychology', 'reward systems', 'engagement loops', or asks questions that require searching the game design knowledge base."
---

# Game Knowledge Auto-Search

This is a behavioral skill. When game design topics appear in conversation, automatically invoke the Hindsight memory MCP tools to ground responses in theory from the five source books.

**Knowledge base sources:**
- *The Art of Game Design* (Jesse Schell)
- *MDA: A Formal Approach to Game Design* (Hunicke, LeBlanc, Zubek)
- *Hooked* (Nir Eyal)
- *A Theory of Fun for Game Designers* (Raph Koster)
- *Players Making Decisions* (Zack Hiwiller)

**Backend:** Hindsight MCP server (bank: `game-knowledge`)

---

## Trigger Keywords

Invoke `recall` when any of these topics appear in the conversation:

| Category | Trigger Keywords |
|----------|-----------------|
| **Mechanics** | mechanic, core loop, gameplay system, rule, interaction, affordance |
| **MDA Framework** | MDA, mechanics dynamics aesthetics, aesthetic, formal approach |
| **Player Motivation** | motivation, intrinsic, extrinsic, reward, player psychology, self-determination |
| **Difficulty** | difficulty, challenge, curve, balancing, flow state, skill ceiling, learning curve |
| **Retention** | retention, engagement, session length, D1/D7/D30, churn, daily active users |
| **Economy** | economy, currency, resource, IAP, monetization, inflation, sink, faucet |
| **UX Patterns** | UX, UI, interface, screen flow, onboarding, tutorial, friction |
| **Reward Systems** | reward, loot, progression, unlock, achievement, variable ratio |
| **Engagement Loops** | hook model, habit loop, trigger, action, investment, engagement loop |
| **Player Types** | player types, Bartle, explorer, achiever, socializer, killer |

---

## Search Patterns by Topic

### Mechanics and Core Loops

```
recall(query="MDA framework mechanics")
recall(query="core loop design {genre}")
reflect(query="meaningful decisions in game design")
```

### Player Motivation and Psychology

```
recall(query="intrinsic motivation game design")
recall(query="extrinsic rewards variable ratio schedule")
recall(query="player types motivation {target audience}")
reflect(query="hook model trigger action reward investment")
```

### Difficulty and Balance

```
recall(query="difficulty curve design")
recall(query="flow state challenge skill balance")
reflect(query="learning curve and skill ceiling relationship")
recall(query="dynamic difficulty adjustment")
```

### Economy and Monetization

```
recall(query="economy design {monetization type}")
recall(query="currency flow balance sink faucet")
reflect(query="IAP monetization and player psychology")
recall(query="inflation game economy")
```

### Retention and Engagement

```
recall(query="retention engagement loop design")
recall(query="session length daily active users")
reflect(query="habit formation in game design")
recall(query="engagement loop reward schedule")
```

### UX and Onboarding

```
recall(query="onboarding tutorial design")
recall(query="UI UX game interface patterns")
reflect(query="friction reduction in player experience")
```

---

## Search Execution Rules

**Run searches proactively.** Don't wait for the user to ask for references. When a game design topic appears, search first, then respond.

**Use `recall` for factual retrieval, `reflect` for synthesis.** `recall` returns matching knowledge chunks. `reflect` reasons across all stored knowledge to form a synthesized answer. Use both:

```
recall(query="reward systems progression")          # Find specific facts
reflect(query="How do reward systems affect long-term player retention?")  # Synthesize reasoning
```

**Use 2-3 searches per topic.** A single query rarely captures the full picture. Run parallel searches from different angles: theory, application, and player psychology.

**Use tags to filter.** If knowledge is tagged by book or topic, use tags parameter:
```
recall(query="core loop", tags=["schell"])
recall(query="motivation", tags=["self-determination"])
```

**Check stats when uncertain.** Use `get_bank` to verify the knowledge base has content before searching.

---

## Multi-Angle Search Strategy

For complex design questions, decompose into sub-topics and search each:

**Example: "How should I design a progression system for a casual mobile game?"**

```
recall(query="progression design casual mobile")
recall(query="difficulty curve casual games")
recall(query="retention progression systems")
reflect(query="What progression patterns work best for casual mobile games based on player psychology?")
```

**Example: "What monetization model fits a mid-core RPG?"**

```
recall(query="monetization mid-core RPG")
recall(query="IAP player psychology spending")
recall(query="economy design RPG currency")
reflect(query="Compare monetization models for mid-core RPGs: battle pass vs IAP vs subscription")
```

---

## Storing New Knowledge

When the user provides new design insights, playtest results, or design decisions, store them:

```
retain(content="Playtest showed 60% of casual players drop off at level 3 difficulty spike", tags=["playtest", "difficulty", "retention"])
retain(content="Core loop: Plant → Grow → Harvest → Trade. 30-sec cycle targets Competence (SDT)", tags=["core-loop", "sdt"])
```

**When to retain:**
- User shares playtest feedback or data
- Design decisions are finalized
- New insights emerge from discussion
- Cross-referencing reveals a novel pattern

---

## Quality Guidelines

**Cite every claim.** Include the book title and relevant context when making theory-backed recommendations. Don't assert design principles without a source.

**Synthesize, don't quote.** Summarize what the source says and connect it to the user's specific context. Raw text dumps are not useful.

**Cross-reference across books.** The five books often complement each other. Schell on mechanics + Eyal on habit loops + MDA on aesthetics gives a richer answer than any single source.

**Use `reflect` for cross-reference.** When you need to combine insights from multiple books, use `reflect` — it reasons across all stored knowledge.

**Acknowledge gaps.** If searches return limited results, say so clearly and suggest alternative query terms.

**Stay grounded.** Only make claims the knowledge base supports. If a topic isn't covered, say the knowledge base doesn't have strong coverage on it rather than improvising.

---

## Output Format

### When knowledge is found

```
**From "{Book Title}":**
{Key insight synthesized from source — 1-3 sentences}

**Application to the current design:**
{How this applies to the specific design challenge — concrete, actionable}
```

### When multiple sources agree

```
**Convergent evidence from {Book A} and {Book B}:**
{Synthesized insight combining both perspectives}

**Design implication:**
{What this means for the user's specific situation}
```

### When reflect provides deep synthesis

```
**Synthesis across knowledge base:**
{Reasoned analysis combining multiple sources and relationships}

**Key takeaway:**
{Actionable recommendation grounded in the synthesis}
```

### When knowledge base coverage is limited

```
**Note:** The knowledge base has limited coverage on this specific topic.
**What was found:** {Brief summary of closest matches}
**Suggested follow-up searches:** {2-3 alternative query terms}
```

---

## When NOT to Search

Skip knowledge base searches for:
- Pure implementation questions (code, tools, engines)
- Business or marketing questions unrelated to game design theory
- Questions about specific games that aren't in the knowledge base
- Requests for opinions or preferences rather than design theory

For those, respond directly without invoking Hindsight tools.
