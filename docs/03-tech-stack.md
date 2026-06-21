# Tech Stack

| Concern                | Choice                               | Rationale                                                                            |
| ---------------------- | ------------------------------------ | ------------------------------------------------------------------------------------ |
| Framework              | Next.js 16 (App Router)              | RSC + Route Handlers = native BFF with zero extra server                             |
| Language               | TypeScript 5 (strict)                | Compile-time correctness across all packages                                         |
| Styling                | Tailwind CSS v4 + shadcn/ui          | Headless, accessible, token-based design system                                      |
| Server state           | TanStack Query v5                    | Caching, background refetch, pagination with minimal boilerplate                     |
| Forms                  | React Hook Form + Zod                | Perf-first, schema-driven — single source of truth between client and BFF validation |
| Client state           | Zustand                              | Minimal footprint; no provider ceremony                                              |
| Auth storage           | HttpOnly cookies                     | XSS-safe by design; meets assessment security requirement                            |
| Monorepo               | Turborepo + pnpm workspaces          | Incremental builds, task graph, remote caching ready                                 |
| Unit/Integration tests | Vitest + React Testing Library + MSW | Fast, browser-realistic, no real network                                             |
| E2E tests              | Playwright (Chromium)                | Golden path + auth flow against a running dev server                                 |
| i18n                   | next-intl                            | URL-based locale routing (`/en/...`, `/vi/...`)                                      |
| Theme                  | next-themes                          | Dark / light / system with zero flash on load                                        |
