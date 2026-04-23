# LLM Provider — Integration Guide

How to integrate your LLM of choice with the knowledge layer.

**Source file:** [`src/extract/llm-types.ts`](../src/extract/llm-types.ts)

---

## Interface

```typescript
interface LLMProvider {
  chat(messages: Array<{ role: "system" | "user"; content: string }>): Promise<string>;
}
```

Simple contract: takes chat messages, returns a raw JSON string. The library handles all Zod validation internally.

**No SDK dependency.** You bring your own LLM client.

---

## Where LLMProvider is Used

| Feature | Method | Required? |
|---|---|---|
| Build knowledge graph | [`buildGraph({ llm })`](../src/knowledge.ts) | Yes |
| Deep search | [`deepSearch(query, { llm })`](../src/index/deep-retrieval.ts) | Yes |
| Feature design context | [`getFeatureContext(desc, llm)`](../src/knowledge.ts) | Optional (better with LLM) |

Everything else (ingest, lexical search, focused search, extract) works **without** an LLM.

---

## Implementation Examples

### OpenAI

```typescript
import OpenAI from "openai";

const openai = new OpenAI();

const llm: LLMProvider = {
  chat: async (messages) => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    return response.choices[0].message.content ?? "";
  },
};
```

### Anthropic

```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const llm: LLMProvider = {
  chat: async (messages) => {
    const system = messages.find((m) => m.role === "system")?.content ?? "";
    const userMessages = messages
      .filter((m) => m.role === "user")
      .map((m) => ({ role: "user" as const, content: m.content }));

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system,
      messages: userMessages,
    });

    return response.content[0].type === "text" ? response.content[0].text : "";
  },
};
```

### Google Gemini

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const llm: LLMProvider = {
  chat: async (messages) => {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const systemInstruction = messages.find((m) => m.role === "system")?.content ?? "";
    const userMessage = messages.find((m) => m.role === "user")?.content ?? "";

    const result = await model.generateContent({
      systemInstruction,
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
    });

    return result.response.text();
  },
};
```

### Ollama (Local)

```typescript
const llm: LLMProvider = {
  chat: async (messages) => {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen2.5:14b",
        messages,
        format: "json",
        stream: false,
      }),
    });

    const data = await response.json();
    return data.message.content;
  },
};
```

### LM Studio / OpenAI-Compatible

```typescript
const llm: LLMProvider = {
  chat: async (messages) => {
    const response = await fetch("http://localhost:1234/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "local-model",
        messages,
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  },
};
```

---

## What the LLM Returns

The library sends prompts asking for strict JSON. The LLM should return one of:

### For Entity Extraction ([`buildGraph`](../src/graph/graph-builder.ts))

```json
{
  "entities": [
    {
      "name": "Combat System",
      "type": "game-system",
      "description": "Handles all combat interactions",
      "aliases": ["combat"],
      "evidenceQuote": "Combat System handles all combat interactions"
    }
  ],
  "relations": [
    {
      "sourceName": "Combat System",
      "targetName": "Stamina System",
      "type": "depends_on",
      "description": "Combat requires stamina for attacks",
      "evidenceQuote": "Combat System depends on Stamina System"
    }
  ]
}
```

Schema: [`LLMExtractionResponseSchema`](../src/extract/llm-types.ts)

### For Query Decomposition ([`deepSearch`](../src/index/deep-retrieval.ts))

```json
["PvP economy design", "progression reward balance", "economy-progression dependencies"]
```

Plain JSON array of strings.

---

## Error Handling

The library handles LLM failures gracefully:

| Scenario | Behavior |
|---|---|
| LLM throws an error | Retries up to 3 times (500ms, 1000ms backoff) |
| LLM returns non-JSON | Attempts to strip markdown code fences, then warns |
| LLM returns invalid schema | Warns, returns empty for that batch |
| LLM is slow (timeout) | `deepSearch` returns partial results via fallback |
| LLM hallucinates entities | Anti-hallucination check drops entities not found in source text |

You do NOT need to handle these errors in your `LLMProvider` implementation. Just return the raw response string.

---

## Recommendations

| Scenario | Recommended Model |
|---|---|
| Production (accuracy) | GPT-4o, Claude Sonnet |
| Production (cost) | GPT-4o-mini, Claude Haiku, Gemini Flash |
| Local/Offline | Qwen 2.5 14B, Llama 3.1 8B (with JSON mode) |
| Development/Testing | Mock provider (return static JSON) |

**Temperature:** The system prompt works best with low temperature (0.1-0.3). Higher temperatures increase hallucination risk.

**JSON mode:** Enable JSON mode / structured output where available. The library strips markdown code fences as a fallback, but native JSON output is more reliable.
