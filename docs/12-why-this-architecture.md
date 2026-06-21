# Why This Architecture?

Concrete benefits of **Feature-Sliced Hexagonal (FSH)** — Hexagonal (Ports & Adapters) + Feature-Sliced Design + monorepo — over a conventional Next.js project structure.

---

## Overview

| Dimension              | What you get                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| Testability            | Domain tests need zero mocks; feature hooks test in isolation; E2E only needs to mock the BFF     |
| Reliability            | Dependency rules are ESLint-enforced; Zod validates at every boundary; errors cannot leak         |
| Maintainability        | One feature = one directory; swap infrastructure or UI without touching business logic            |
| Scalability            | Business logic is written once, shared across web / mobile / desktop; teams work without conflict |
| Framework Independence | `packages/domain` has zero React/Next.js imports; survives any framework migration                |
| Security by Design     | The architecture makes doing the wrong thing structurally impossible, not just discouraged        |

---

## Testability

| Benefit                                  | Detail                                                                                                                                                                      |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domain core requires zero mocks          | `packages/domain` is pure TypeScript. `LoginUseCase`, `CreateInvoiceUseCase`, and every value object run in a plain `it()` — no JSDOM, no MSW, no `vi.mock()` needed        |
| Infrastructure is trivially stubbable    | Domain code only knows about `InvoiceRepository` (a port/interface). Tests inject a fake in-memory implementation — no `fetch` mock, no real database, always deterministic |
| Feature hooks test in complete isolation | Each slice (`useLogin`, `useCreateInvoice`, …) is self-contained. Cross-feature imports are forbidden by ESLint, so testing one hook never accidentally exercises another   |
| E2E only needs to mock the BFF           | Every 101Digital call is proxied through `/api/*`. Playwright intercepts with `page.route("**/api/**", …)` — no external accounts, no VPN, no staging environment required  |

→ [Before / After Examples](examples/testability-examples.md)

---

## Reliability

| Benefit                                  | Detail                                                                                                                                                                              |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dependency rules are machine-enforced    | `eslint-plugin-boundaries` turns the FSD layer diagram into a compile-time constraint. A client component importing from `infrastructure/` fails CI before code reaches review      |
| Zod validates at every boundary          | `packages/api-contracts` is the single source of truth for request/response shapes. The same schema validates React Hook Form on the client **and** the Route Handler on the server |
| Server errors cannot leak to the browser | The BFF proxy catches 101Digital responses and returns only what the client needs. Internal messages, stack traces, and upstream API details never appear in the browser            |
| The secure path is the only path         | Tokens live in `HttpOnly` cookies set by the server. There is no `localStorage` code path to accidentally choose — the design makes the wrong choice structurally unavailable       |

→ [Before / After Examples](examples/reliability-examples.md)

---

## Maintainability

| Benefit                                          | Detail                                                                                                                                                                        |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One feature = one directory = one responsibility | Deleting "search invoices" means deleting `features/search-invoices/`. No hidden dependencies break because cross-feature imports are forbidden. No grep required             |
| New developers know exactly where code belongs   | Layer naming (`features/`, `entities/`, `shared/`, `widgets/`) answers "where does this go?" before anyone has to ask. No catch-all `utils/` folder growing without oversight |
| Swapping infrastructure does not touch domain    | Replace the 101Digital REST adapter with GraphQL? Edit `InvoiceAdapter.ts`. Domain use cases and feature hooks stay unchanged — they depend on the port, not the adapter      |
| Swapping UI does not touch business logic        | Migrating from shadcn/ui to another component library means editing `shared/ui/` and `shadcn/`. Domain, use cases, and feature models do not know a design system exists      |

→ [Before / After Examples](examples/maintainability-examples.md)

---

## Scalability

| Benefit                                                   | Detail                                                                                                                                                                             |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Business logic is written once, shared everywhere         | `packages/domain` runs on Next.js (server + client), React Native (Hermes), and Tauri (webview) without modification. Validation, calculations, and use cases are never duplicated |
| Teams work in parallel without merge conflicts            | Team A owns `features/create-invoice/`; Team B owns `features/list-invoices/`. The forbidden cross-feature import rule means neither team can accidentally break the other's slice |
| Adding a feature never requires refactoring existing ones | Each FSD slice is self-contained. New features plug into widget and page layers from the outside — they never reach into existing feature internals                                |

→ [Before / After Examples](examples/scalability-examples.md)

---

## Framework Independence

| Benefit                                             | Detail                                                                                                                                                                               |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Next.js is a delivery mechanism, not the foundation | `packages/domain` has zero Next.js, React, or browser globals. The entire business-logic layer could move to a Fastify API, a CLI tool, or React Native without a single line change |
| The domain survives framework upgrades              | When Next.js ships a major breaking change, only the `apps/web` adapter layer needs updating. The blast radius of an upgrade is bounded by the hexagonal boundary                    |

→ [Before / After Examples](examples/framework-independence-examples.md)

---

## Security by Design

The most important distinction: this architecture **does not allow mistakes** — it does not merely discourage them.

| Threat                                     | How the architecture prevents it                                                          |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Token theft via XSS                        | `HttpOnly` cookie — no JavaScript API can read it, ever                                   |
| Secret exposure in browser bundle          | No `NEXT_PUBLIC_` prefix on credentials; server-only env vars enforced by module boundary |
| Client calling 101Digital directly         | `eslint-plugin-boundaries` prevents client components from importing `infrastructure/`    |
| Untrusted input reaching the API           | Zod in every Route Handler — not optional, it is part of the pattern                      |
| Cross-feature coupling causing regressions | ESLint import rule fails CI before code is merged                                         |

Security is not a checklist applied at the end. It is the default outcome of following the architecture.

→ [Before / After Examples](examples/security-examples.md)
