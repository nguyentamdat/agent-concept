import type { KnowledgeChunk } from "../types";

export type KeywordMatcher = {
  kind: "keywords";
  keywords: readonly string[];
  value?: unknown;
  resolve?: (chunk: KnowledgeChunk, keyword: string) => unknown;
};

export type RegexMatcher = {
  kind: "regex";
  pattern: RegExp;
  group?: number;
  value?: unknown;
  resolve?: (chunk: KnowledgeChunk, match: string, result: RegExpExecArray) => unknown;
};

export type FieldMatcher = KeywordMatcher | RegexMatcher;

export type ExtractionFieldRule = {
  required: boolean;
  matchers: readonly FieldMatcher[];
};

export type ExtractionSchema<TRecord extends Record<string, unknown>> = {
  name: string;
  description: string;
  recordMatchers: readonly FieldMatcher[];
  fields: { [K in keyof TRecord]: ExtractionFieldRule };
};

export type GameMechanicsRecord = {
  name?: string;
  type?: string;
  description?: string;
  games?: string[];
};

export type EconomyRecord = {
  economyType?: string;
  currencies?: string[];
  sources?: string[];
  sinks?: string[];
};

export const GameMechanicsSchema: ExtractionSchema<GameMechanicsRecord> = {
  name: "game-mechanics",
  description: "Extract named mechanics, their type, and a short description from chunk text.",
  recordMatchers: [
    { kind: "keywords", keywords: ["core loop", "feedback loop", "progression system"] },
    { kind: "keywords", keywords: ["combat loop", "combat system", "mechanic"] },
    { kind: "regex", pattern: /^([^|]+)\s*\|\s*([^|]+)/u },
  ],
  fields: {
    name: {
      required: true,
      matchers: [
        {
          kind: "regex",
          pattern: /^([^|]+)\s*\|\s*([^|]+)/u,
          group: 1,
          resolve: (_, match) => normaliseLabel(match),
        },
        {
          kind: "regex",
          pattern: /^(Combat Loop|Combat System|Progression System):/iu,
          group: 1,
          resolve: (_, match) => normaliseLabel(match),
        },
        { kind: "keywords", keywords: ["core loop"], value: "Core Loop" },
        { kind: "keywords", keywords: ["feedback loops", "feedback loop"], value: "Feedback Loops" },
        {
          kind: "keywords",
          keywords: ["progression systems", "progression system"],
          value: "Progression Systems",
        },
        { kind: "keywords", keywords: ["combat loop"], value: "Combat Loop" },
        { kind: "keywords", keywords: ["combat system"], value: "Combat System" },
      ],
    },
    type: {
      required: true,
      matchers: [
        {
          kind: "regex",
          pattern: /^([^|]+)\s*\|\s*([^|]+)/u,
          group: 2,
          resolve: (_, match) => normaliseSlug(match),
        },
        { kind: "keywords", keywords: ["core loop"], value: "core-loop" },
        { kind: "keywords", keywords: ["feedback loops", "feedback loop"], value: "feedback-loop" },
        {
          kind: "keywords",
          keywords: ["progression systems", "progression system"],
          value: "progression-system",
        },
        { kind: "keywords", keywords: ["combat loop"], value: "combat-loop" },
        { kind: "keywords", keywords: ["combat system"], value: "combat-system" },
      ],
    },
    description: {
      required: true,
      matchers: [
        {
          kind: "regex",
          pattern: /[\s\S]+/u,
          resolve: (chunk) => getPrimarySentence(chunk.text),
        },
      ],
    },
    games: {
      required: false,
      matchers: [
        {
          kind: "regex",
          pattern: /games?\s+(?:like|such as|including)\s+([^.]+)/iu,
          group: 1,
          resolve: (_, match) => splitList(match),
        },
      ],
    },
  },
};

export const EconomySchema: ExtractionSchema<EconomyRecord> = {
  name: "economy",
  description: "Extract rule-based economy details such as currencies, sources, and sinks.",
  recordMatchers: [
    { kind: "keywords", keywords: ["economy", "currency", "currencies", "source", "sources"] },
    { kind: "keywords", keywords: ["sink", "sinks", "reward", "rewards"] },
  ],
  fields: {
    economyType: {
      required: true,
      matchers: [
        { kind: "keywords", keywords: ["action economy"], value: "Action Economy" },
        {
          kind: "regex",
          pattern: /(soft currency|hard currency|premium currency|resource economy)/iu,
          group: 1,
          resolve: (_, match) => normaliseLabel(match),
        },
        { kind: "keywords", keywords: ["economy"], value: "Economy" },
      ],
    },
    currencies: {
      required: true,
      matchers: [
        {
          kind: "regex",
          pattern: /currenc(?:y|ies)\s*:\s*([^.]+)/iu,
          group: 1,
          resolve: (_, match) => splitList(match),
        },
        { kind: "keywords", keywords: ["gold"], value: ["Gold"] },
        { kind: "keywords", keywords: ["gems"], value: ["Gems"] },
        { kind: "keywords", keywords: ["mana"], value: ["Mana"] },
      ],
    },
    sources: {
      required: true,
      matchers: [
        {
          kind: "regex",
          pattern: /sources?\s*:\s*([^.]+)/iu,
          group: 1,
          resolve: (_, match) => splitList(match),
        },
        {
          kind: "regex",
          pattern: /earn(?:ed)?\s+from\s+([^.]+)/iu,
          group: 1,
          resolve: (_, match) => splitList(match),
        },
        {
          kind: "regex",
          pattern: /rewards?\s+from\s+([^.]+)/iu,
          group: 1,
          resolve: (_, match) => splitList(match),
        },
      ],
    },
    sinks: {
      required: true,
      matchers: [
        {
          kind: "regex",
          pattern: /sinks?\s*:\s*([^.]+)/iu,
          group: 1,
          resolve: (_, match) => splitList(match),
        },
        {
          kind: "regex",
          pattern: /spent\s+on\s+([^.]+)/iu,
          group: 1,
          resolve: (_, match) => splitList(match),
        },
        {
          kind: "regex",
          pattern: /used\s+for\s+([^.]+)/iu,
          group: 1,
          resolve: (_, match) => splitList(match),
        },
      ],
    },
  },
};

export const extractionSchemas = {
  [GameMechanicsSchema.name]: GameMechanicsSchema,
  [EconomySchema.name]: EconomySchema,
} as const;

export type ExtractionSchemaName = keyof typeof extractionSchemas;

export function getExtractionSchema(schemaName: ExtractionSchemaName) {
  return extractionSchemas[schemaName];
}

function normaliseLabel(value: string): string {
  return value
    .trim()
    .replace(/[_-]+/gu, " ")
    .replace(/\s+/gu, " ")
    .toLowerCase()
    .replace(/\b\w/gu, (character) => character.toUpperCase());
}

function normaliseSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "");
}

function getPrimarySentence(value: string): string {
  const sentence = value.match(/^[^.!?]+[.!?]?/u)?.[0]?.trim();
  return sentence && sentence.length > 0 ? sentence : value.trim();
}

function splitList(value: string): string[] {
  return value
    .split(/[,/]|\band\b/iu)
    .map((entry) => normaliseLabel(entry))
    .filter(Boolean);
}
