import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import yaml from "js-yaml";
import { z } from "zod";

export const GameSpecSchema = z.object({
  meta: z.object({
    title: z.string().min(1),
    version: z.number().int().nonnegative(),
    genre: z.string().min(1),
    subGenre: z.string().optional(),
    platform: z.enum(["mobile", "web", "pc", "console", "cross-platform"]),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  }),
  concept: z.object({
    elevatorPitch: z.string(),
    expandedDescription: z.string(),
    designPillars: z.array(z.string()).min(1),
    targetAudience: z.string(),
    essentialExperience: z.string(),
    uniqueHook: z.string(),
  }),
  coreLoop: z.object({
    summary: z.string(),
    actions: z.array(z.string()),
    sessionFlow: z.string(),
    progressionLoop: z.string(),
    difficultyApproach: z.string(),
  }),
  mechanics: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      category: z.string(),
      description: z.string(),
      rules: z.array(z.string()),
      controls: z.string(),
      feedbackSystems: z.array(z.string()),
      interactsWith: z.array(z.string()),
    })
  ),
  economy: z
    .object({
      currencies: z.array(z.string()),
      monetization: z.string(),
    })
    .optional(),
  screens: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      purpose: z.string(),
      elements: z.array(z.string()),
      transitions: z.array(z.string()),
    })
  ),
  visualDirection: z.object({
    style: z.string(),
    colorPalette: z.array(z.string()),
    mood: z.string(),
    references: z.array(z.string()),
  }),
  prototypeScope: z.object({
    renderer: z.enum(["2d", "3d"]).default("2d"),
    includedMechanics: z.array(z.string()),
    excludedMechanics: z.array(z.string()),
    placeholderAssets: z.boolean(),
    targetFidelity: z.enum(["wireframe", "low", "medium"]),
  }),
  history: z.array(
    z.object({
      version: z.number().int().nonnegative(),
      date: z.string(),
      changes: z.array(z.string()),
      feedbackSource: z.string(),
    })
  ),
});

export type GameSpec = z.infer<typeof GameSpecSchema>;

type SpecValidationIssue = {
  path: string;
  message: string;
};

export async function readGameSpec(specPath: string): Promise<GameSpec> {
  const raw = await readFile(specPath, "utf-8");
  const parsed = yaml.load(raw);
  return GameSpecSchema.parse(parsed);
}

export async function writeGameSpec(specPath: string, spec: GameSpec): Promise<void> {
  const content = yaml.dump(spec, {
    noRefs: true,
    sortKeys: false,
    lineWidth: 120,
  });
  await writeFile(specPath, content, "utf-8");
}

export function createDefaultGameSpec(title: string): GameSpec {
  const now = new Date().toISOString();
  return {
    meta: {
      title,
      version: 1,
      genre: "unknown",
      platform: "web",
      createdAt: now,
      updatedAt: now,
    },
    concept: {
      elevatorPitch: "A game concept waiting to be refined.",
      expandedDescription: "Draft spec created by MCP project scaffolder.",
      designPillars: ["Core fun first", "Readable feedback", "Fast iteration"],
      targetAudience: "TBD",
      essentialExperience: "TBD",
      uniqueHook: "TBD",
    },
    coreLoop: {
      summary: "Do action, get reward, progress.",
      actions: ["action", "reward", "progress"],
      sessionFlow: "Short loop",
      progressionLoop: "Unlock and improve",
      difficultyApproach: "Gradual ramp",
    },
    mechanics: [],
    screens: [],
    visualDirection: {
      style: "Prototype",
      colorPalette: ["#222222", "#e5e5e5", "#4f46e5"],
      mood: "Neutral",
      references: [],
    },
    prototypeScope: {
      renderer: "2d",
      includedMechanics: [],
      excludedMechanics: [],
      placeholderAssets: true,
      targetFidelity: "wireframe",
    },
    history: [
      {
        version: 1,
        date: now,
        changes: ["Initial project scaffold"],
        feedbackSource: "initial",
      },
    ],
  };
}

function findConsistencyWarnings(spec: GameSpec): SpecValidationIssue[] {
  const warnings: SpecValidationIssue[] = [];
  const mechanicIds = new Set(spec.mechanics.map((mechanic) => mechanic.id));

  for (const includedId of spec.prototypeScope.includedMechanics) {
    if (!mechanicIds.has(includedId)) {
      warnings.push({
        path: "prototypeScope.includedMechanics",
        message: `Included mechanic '${includedId}' is not defined in mechanics[].`,
      });
    }
  }

  for (const excludedId of spec.prototypeScope.excludedMechanics) {
    if (!mechanicIds.has(excludedId)) {
      warnings.push({
        path: "prototypeScope.excludedMechanics",
        message: `Excluded mechanic '${excludedId}' is not defined in mechanics[].`,
      });
    }
  }

  return warnings;
}

function flattenDiff(before: unknown, after: unknown, path = ""): Array<Record<string, unknown>> {
  if (Object.is(before, after)) {
    return [];
  }

  if (Array.isArray(before) || Array.isArray(after)) {
    const beforeArray = Array.isArray(before) ? before : [];
    const afterArray = Array.isArray(after) ? after : [];
    const maxLength = Math.max(beforeArray.length, afterArray.length);
    const out: Array<Record<string, unknown>> = [];

    for (let index = 0; index < maxLength; index += 1) {
      const nextPath = `${path}[${index}]`;
      out.push(...flattenDiff(beforeArray[index], afterArray[index], nextPath));
    }
    return out;
  }

  const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

  if (isObject(before) && isObject(after)) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    const out: Array<Record<string, unknown>> = [];
    for (const key of keys) {
      const nextPath = path ? `${path}.${key}` : key;
      out.push(...flattenDiff(before[key], after[key], nextPath));
    }
    return out;
  }

  return [
    {
      path,
      before,
      after,
    },
  ];
}

export function registerSpecTools(server: McpServer): void {
  server.registerTool(
    "spec_validate",
    {
      title: "Validate game spec",
      description: "Validate a YAML game design spec and run consistency checks.",
      inputSchema: z.object({
        specPath: z.string(),
      }),
    },
    async ({ specPath }: { specPath: string }) => {
      try {
        const resolved = resolve(specPath);
        const spec = await readGameSpec(resolved);
        const warnings = findConsistencyWarnings(spec);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ valid: true, errors: [], warnings }, null, 2),
            },
          ],
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors: SpecValidationIssue[] = error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          }));
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ valid: false, errors, warnings: [] }, null, 2),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  valid: false,
                  errors: [
                    {
                      path: "specPath",
                      message: error instanceof Error ? error.message : "Unknown error",
                    },
                  ],
                  warnings: [],
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "spec_diff",
    {
      title: "Diff game specs",
      description: "Compare two spec YAML files and return structural changes.",
      inputSchema: z.object({
        specPath1: z.string(),
        specPath2: z.string(),
      }),
    },
    async ({ specPath1, specPath2 }: { specPath1: string; specPath2: string }) => {
      const left = await readGameSpec(resolve(specPath1));
      const right = await readGameSpec(resolve(specPath2));
      const changes = flattenDiff(left, right).filter((item) => item.path !== "");

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ changes }, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    "spec_bump_version",
    {
      title: "Bump spec version",
      description: "Increment version, append history entry, and archive old spec.",
      inputSchema: z.object({
        specPath: z.string(),
        changes: z.array(z.string()).min(1),
        source: z.string(),
      }),
    },
    async ({ specPath, changes, source }: { specPath: string; changes: string[]; source: string }) => {
      const resolvedSpecPath = resolve(specPath);
      const previous = await readGameSpec(resolvedSpecPath);
      const archivedVersion = previous.meta.version;
      const archivedDir = resolve(dirname(resolvedSpecPath), "spec-history");
      await mkdir(archivedDir, { recursive: true });

      const archivedPath = resolve(archivedDir, `spec_v${archivedVersion}.yaml`);
      const previousRaw = await readFile(resolvedSpecPath, "utf-8");
      await writeFile(archivedPath, previousRaw, "utf-8");

      const now = new Date().toISOString();
      const next: GameSpec = {
        ...previous,
        meta: {
          ...previous.meta,
          version: previous.meta.version + 1,
          updatedAt: now,
        },
        history: [
          ...previous.history,
          {
            version: previous.meta.version + 1,
            date: now,
            changes,
            feedbackSource: source,
          },
        ],
      };

      await writeGameSpec(resolvedSpecPath, next);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                newVersion: next.meta.version,
                archivedTo: archivedPath,
                spec: basename(resolvedSpecPath),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
