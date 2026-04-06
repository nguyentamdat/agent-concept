import { z } from "zod";
import { EntityTypeEnum, RelationTypeEnum } from "../graph/types";

export interface LLMProvider {
  chat(messages: Array<{ role: "system" | "user"; content: string }>): Promise<string>;
}

export const LLMExtractionResponseSchema = z.object({
  entities: z.array(
    z.object({
      name: z.string(),
      type: EntityTypeEnum,
      description: z.string(),
      aliases: z.array(z.string()).default([]),
      evidenceQuote: z.string(),
    })
  ),
  relations: z.array(
    z.object({
      sourceName: z.string(),
      targetName: z.string(),
      type: RelationTypeEnum,
      description: z.string().default(""),
      evidenceQuote: z.string(),
    })
  ),
});

export type LLMExtractionResponse = z.infer<typeof LLMExtractionResponseSchema>;
