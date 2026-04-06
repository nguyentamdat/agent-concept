import { describe, expect, it } from "vitest";
import { EconomySchema, GameMechanicsSchema, extractionSchemas, getExtractionSchema } from "./schemas";

describe("extraction schemas", () => {
  it("exports the supported schema registry", () => {
    expect(Object.keys(extractionSchemas).sort()).toEqual(["economy", "game-mechanics"]);
    expect(getExtractionSchema("game-mechanics")).toBe(GameMechanicsSchema);
    expect(getExtractionSchema("economy")).toBe(EconomySchema);
  });

  it("defines the required game mechanics fields", () => {
    expect(Object.keys(GameMechanicsSchema.fields)).toEqual(
      expect.arrayContaining(["name", "type", "description", "games"])
    );
    expect(GameMechanicsSchema.fields.name?.required).toBe(true);
    expect(GameMechanicsSchema.fields.type?.required).toBe(true);
    expect(GameMechanicsSchema.fields.description?.required).toBe(true);
    expect(GameMechanicsSchema.fields.games?.required).toBe(false);
  });

  it("defines the required economy fields", () => {
    expect(Object.keys(EconomySchema.fields)).toEqual(
      expect.arrayContaining(["economyType", "currencies", "sources", "sinks"])
    );
    expect(EconomySchema.fields.economyType?.required).toBe(true);
    expect(EconomySchema.fields.currencies?.required).toBe(true);
    expect(EconomySchema.fields.sources?.required).toBe(true);
    expect(EconomySchema.fields.sinks?.required).toBe(true);
  });
});
