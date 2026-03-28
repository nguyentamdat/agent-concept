---
title: Game Design Fundamentals
author: Design Team
date: 2024-01-15
---

# Game Design Fundamentals

## Core Loops

A core loop is the primary interaction cycle that players repeat throughout the game. It defines the moment-to-moment gameplay experience.

### Feedback Loops

Feedback loops reinforce player actions with immediate consequences. Positive feedback rewards player skill, while negative feedback creates challenge and tension.

The most effective games layer multiple feedback loops at different time scales:
- Immediate feedback (milliseconds): visual/audio response to input
- Short-term feedback (seconds): score changes, health updates
- Long-term feedback (minutes): progression, unlocks

### Progression Systems

Progression systems provide long-term goals and a sense of advancement. They keep players engaged beyond the core loop by offering new challenges and rewards.

| System Type | Duration | Example |
|-------------|----------|---------|
| Level-based | Hours | RPG experience levels |
| Skill-based | Minutes | Combo multipliers |
| Resource-based | Sessions | Currency accumulation |

## Economy Design

Game economies simulate scarcity and value exchange. They must balance player agency with designer control.

### Currency Sinks

Currency sinks remove money from the economy to prevent inflation. Common sinks include:
- Cosmetic purchases
- Convenience features
- Progression acceleration

### Currency Sources

Currency sources inject money into the economy. These must be carefully tuned to match sink rates.

### Tuning Example

```yaml
sinks:
  cosmetics: 0.35
sources:
  quests: 0.32
```

## Difficulty Curves

The difficulty curve determines how challenge scales throughout the game. A well-designed curve maintains engagement without frustration.

Difficulty should increase gradually, with occasional plateaus for mastery and skill consolidation.
