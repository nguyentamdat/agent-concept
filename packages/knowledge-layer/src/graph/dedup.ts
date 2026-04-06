import type { GameEntity, EntityType } from "./types";

export const DEDUP_SIMILARITY_THRESHOLD = 0.7;

const STRIP_SUFFIXES = [" system", " mechanic", " feature", " module", " loop", " mechanics", " systems"];

export function normalizeEntityName(name: string): string {
  let normalized = name.toLowerCase().trim();
  for (const suffix of STRIP_SUFFIXES) {
    if (normalized.endsWith(suffix)) {
      normalized = normalized.slice(0, -suffix.length).trim();
    }
  }
  return normalized.replace(/\s+/g, " ").trim();
}

function tokenize(name: string): Set<string> {
  return new Set(name.split(/[^a-z0-9]+/).filter(Boolean));
}

export function entityNameSimilarity(a: string, b: string): number {
  const na = normalizeEntityName(a);
  const nb = normalizeEntityName(b);
  if (na === nb) return 1;
  const ta = tokenize(na);
  const tb = tokenize(nb);
  const intersection = new Set([...ta].filter(t => tb.has(t)));
  const union = new Set([...ta, ...tb]);
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

const TYPE_SPECIFICITY: Record<EntityType, number> = {
  misc: 0,
  "reference-game": 1,
  "character-class": 2,
  "design-pattern": 3,
  constraint: 4,
  currency: 5,
  feature: 6,
  "game-system": 7,
  mechanic: 8,
};

export function mergeEntities(existing: GameEntity, incoming: GameEntity): GameEntity {
  const existingSpec = TYPE_SPECIFICITY[existing.type] ?? 0;
  const incomingSpec = TYPE_SPECIFICITY[incoming.type] ?? 0;
  const type = incomingSpec > existingSpec ? incoming.type : existing.type;

  const description =
    existing.description === incoming.description
      ? existing.description
      : `${existing.description} | ${incoming.description}`;

  const aliases = [...new Set([
    ...existing.aliases,
    ...incoming.aliases,
    existing.name,
    incoming.name,
  ])].filter(a => a !== existing.name);

  const sourceChunkIds = [...new Set([...existing.sourceChunkIds, ...incoming.sourceChunkIds])];
  const sourceDocumentIds = [...new Set([...existing.sourceDocumentIds, ...incoming.sourceDocumentIds])];

  return {
    ...existing,
    type,
    description,
    aliases,
    sourceChunkIds,
    sourceDocumentIds,
  };
}
