# Available Scripts

All commands run from the **monorepo root**:

| Command                 | Description                                               |
| ----------------------- | --------------------------------------------------------- |
| `pnpm dev`              | Start Next.js dev server with HMR                         |
| `pnpm build`            | Production build (all packages, in dependency order)      |
| `pnpm lint`             | ESLint across all packages (includes FSD boundary checks) |
| `pnpm lint:fix`         | Auto-fix lint errors                                      |
| `pnpm type-check`       | TypeScript strict check across all packages               |
| `pnpm test`             | Unit tests (Vitest)                                       |
| `pnpm test:integration` | Integration tests (Vitest + MSW, Node environment)        |
| `pnpm test:e2e`         | E2E tests (Playwright, requires running dev server)       |
| `pnpm format`           | Prettier — formats all `.ts`, `.tsx`, `.md`, `.json`      |
