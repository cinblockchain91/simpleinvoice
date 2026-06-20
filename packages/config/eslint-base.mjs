import boundaries from "eslint-plugin-boundaries";

/**
 * FSD layer definitions for eslint-plugin-boundaries.
 * Patterns are relative to the ESLint config file location (apps/web/).
 */
const FSD_ELEMENTS = [
  // shadcn/ — auto-generated vendor layer; must stay self-contained
  { type: "shadcn", pattern: "src/shadcn/**/*" },
  // shared/ — framework-agnostic utilities, no business logic
  { type: "shared", pattern: "src/shared/**/*" },
  // entities/ — business entity UI representations (badges, cards)
  { type: "entities", pattern: "src/entities/**/*" },
  // features/ — user interaction slices (forms, search, auth)
  { type: "features", pattern: "src/features/**/*" },
  // widgets/ — composed UI blocks assembled from features + entities
  { type: "widgets", pattern: "src/widgets/**/*" },
  // app/ — Next.js App Router routing layer
  { type: "app", pattern: "src/app/**/*" },
  // infrastructure/ — server-only adapters (never imported by client code)
  { type: "infrastructure", pattern: "src/infrastructure/**/*" },
];

/**
 * Allowed cross-layer imports (default: disallow).
 * Rule: inner layers NEVER import from outer layers; cross-feature imports forbidden.
 *
 *   shared ← entities ← features ← widgets ← app
 *   shadcn (vendor, no app imports)
 *   infrastructure (server-only, imported only by app/api route handlers)
 */
const FSD_ELEMENT_RULES = [
  { from: "shadcn", allow: [] },
  { from: "shared", allow: ["shadcn"] },
  { from: "entities", allow: ["shared", "shadcn"] },
  // features cannot import other features (cross-feature import prevention)
  { from: "features", allow: ["entities", "shared", "shadcn"] },
  { from: "widgets", allow: ["features", "entities", "shared", "shadcn"] },
  // app/api route handlers are the only permitted importers of infrastructure
  {
    from: "app",
    allow: [
      "widgets",
      "features",
      "entities",
      "shared",
      "shadcn",
      "infrastructure",
    ],
  },
  { from: "infrastructure", allow: ["shared"] },
];

/**
 * Returns a flat ESLint config object enforcing FSD layer import boundaries.
 * Add to your eslint.config.mjs alongside framework-specific rules.
 *
 * @returns {import("eslint").Linter.Config}
 */
export function createFsdBoundariesConfig() {
  return {
    plugins: { boundaries },
    settings: {
      "boundaries/elements": FSD_ELEMENTS,
      "boundaries/ignore": [
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/*.stories.{ts,tsx}",
      ],
    },
    rules: {
      "boundaries/element-types": [
        "error",
        { default: "disallow", rules: FSD_ELEMENT_RULES },
      ],
      // Warn on imports from files that don't match any declared element
      "boundaries/no-unknown": "warn",
    },
  };
}
