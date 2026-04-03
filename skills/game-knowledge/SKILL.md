---
name: game-knowledge
version: 1.0.0
description: "This skill should be used when the user discusses game design topics such as 'game mechanics', 'MDA framework', 'player motivation', 'difficulty curves', 'core loops', 'retention strategies', 'economy design', 'UX patterns', 'monetization', 'player psychology', 'reward systems', 'engagement loops', or asks questions that require searching the game design knowledge base."
---

# Game Knowledge Auto-Search

This is a behavioral skill. When game design topics appear in conversation, automatically invoke the knowledge base MCP tools to ground responses in theory from the five source books.

**Knowledge base sources:**
- *The Art of Game Design* (Jesse Schell)
- *MDA: A Formal Approach to Game Design* (Hunicke, LeBlanc, Zubek)
- *Hooked* (Nir Eyal)
- *A Theory of Fun for Game Designers* (Raph Koster)
- *Players Making Decisions* (Zack Hiwiller)

---

## Trigger Keywords

Invoke `knowledge_search` when any of these topics appear in the conversation:

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
knowledge_search("MDA framework mechanics")
knowledge_search("core loop design {genre}")
knowledge_search("meaningful decisions game design")
```

### Player Motivation and Psychology

```
knowledge_search("intrinsic motivation game design")
knowledge_search("extrinsic rewards variable ratio schedule")
knowledge_search("player types motivation {target audience}")
knowledge_search("hook model trigger action reward investment")
```

### Difficulty and Balance

```
knowledge_search("difficulty curve design")
knowledge_search("flow state challenge skill balance")
knowledge_search("learning curve skill ceiling")
knowledge_search("dynamic difficulty adjustment")
```

### Economy and Monetization

```
knowledge_search("economy design {monetization type}")
knowledge_search("currency flow balance sink faucet")
knowledge_search("IAP monetization player psychology")
knowledge_search("inflation game economy")
```

### Retention and Engagement

```
knowledge_search("retention engagement loop design")
knowledge_search("session length daily active users")
knowledge_search("habit formation game design")
knowledge_search("engagement loop reward schedule")
```

### UX and Onboarding

```
knowledge_search("onboarding tutorial design")
knowledge_search("UI UX game interface patterns")
knowledge_search("friction reduction player experience")
```

---

## Search Execution Rules

**Run searches proactively.** Don't wait for the user to ask for references. When a game design topic appears, search first, then respond.

**Use 2-3 searches per topic.** A single query rarely captures the full picture. Run parallel searches from different angles: theory, application, and player psychology.

**Combine `knowledge_search` with `knowledge_query_entity`.** After finding relevant chunks, query specific entities to get relationship context.

```
knowledge_search("reward systems progression")
knowledge_query_entity("Reward System")
knowledge_query_entity("Progression System")
```

**Check stats when uncertain.** Use `knowledge_stats` to verify the knowledge base is loaded before searching.

```
knowledge_stats()
```

---

## Multi-Angle Search Strategy

For complex design questions, decompose into sub-topics and search each:

**Example: "How should I design a progression system for a casual mobile game?"**

```
knowledge_search("progression design casual mobile")
knowledge_search("difficulty curve casual games")
knowledge_search("retention progression systems")
knowledge_search("intrinsic motivation casual players")
knowledge_query_entity("Progression System")
```

**Example: "What monetization model fits a mid-core RPG?"**

```
knowledge_search("monetization mid-core RPG")
knowledge_search("IAP player psychology spending")
knowledge_search("economy design RPG currency")
knowledge_search("battle pass subscription model")
```

---

## Quality Guidelines

**Cite every claim.** Include the book title and page number when making theory-backed recommendations. Don't assert design principles without a source.

**Synthesize, don't quote.** Summarize what the source says and connect it to the user's specific context. Raw text dumps are not useful.

**Cross-reference across books.** The five books often complement each other. Schell on mechanics + Eyal on habit loops + MDA on aesthetics gives a richer answer than any single source.

**Acknowledge gaps.** If searches return limited results, say so clearly and suggest alternative query terms.

**Stay grounded.** Only make claims the knowledge base supports. If a topic isn't covered, say the knowledge base doesn't have strong coverage on it rather than improvising.

---

## Output Format

### When knowledge is found

```
**From "{Book Title}" (p.{page}):**
{Key insight synthesized from source — 1-3 sentences}

**Application to your game:**
{How this applies to the specific design challenge — concrete, actionable}
```

### When multiple sources agree

```
**Convergent evidence from {Book A} and {Book B}:**
{Synthesized insight combining both perspectives}

**Design implication:**
{What this means for the user's specific situation}
```

### When knowledge base coverage is limited

```
**Note:** The knowledge base has limited coverage on this specific topic.
**What was found:** {Brief summary of closest matches}
**Suggested follow-up searches:** {2-3 alternative query terms}
```

### When entity relationships are relevant

```
**Entity relationships found:**
- {Entity A} depends on {Entity B}
- {Entity C} conflicts with {Entity D}

**Design consideration:**
{What these relationships mean for the feature being discussed}
```

---

## When NOT to Search

Skip knowledge base searches for:
- Pure implementation questions (code, tools, engines)
- Business or marketing questions unrelated to game design theory
- Questions about specific games that aren't in the knowledge base
- Requests for opinions or preferences rather than design theory

For those, respond directly without invoking MCP tools.
