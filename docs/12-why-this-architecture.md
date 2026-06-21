# Why This Architecture?

This document explains the concrete benefits of choosing **Feature-Sliced Hexagonal (FSH)** — the combination of Hexagonal (Ports & Adapters), Feature-Sliced Design, and a monorepo — over a conventional Next.js project structure.

---

## Testability

**Domain core requires zero mocks.**
`packages/domain` is pure TypeScript with no React or Next.js imports. `LoginUseCase`, `CreateInvoiceUseCase`, and every value object can be unit-tested with a plain `it()` — no JSDOM, no MSW, no `vi.mock()` needed.

**Infrastructure is trivially stubbable.**
Because domain code only knows about `InvoiceRepository` (an interface / port), tests inject a fake in-memory implementation instead of mocking `fetch` or a real database. The test stays fast and deterministic regardless of network conditions.

**Feature hooks test in complete isolation.**
`useLogin`, `useCreateInvoice`, and every other feature hook live in their own slice. Because cross-feature imports are forbidden by ESLint rules, there are no hidden side effects — testing one hook never accidentally exercises another.

**E2E tests only need to mock the BFF.**
Because every 101Digital call is proxied through `/api/*`, Playwright only needs `page.route("**/api/**", ...)` to control the entire backend. No external service accounts, no VPN, no staging environment required.

---

## Reliability

**Dependency rules are machine-enforced.**
`eslint-plugin-boundaries` turns the FSD layer diagram into a compile-time constraint. If a client component accidentally imports from `infrastructure/`, CI fails before the code ever reaches review.

**Zod validates at every boundary.**
`packages/api-contracts` provides the single source of truth for request and response shapes. The same schema validates the React Hook Form on the client _and_ the Route Handler on the server — no silent mismatch between what the form sends and what the server expects.

**Server errors cannot leak to the browser.**
The BFF proxy catches 101Digital responses and returns only what the client needs. Internal error messages, stack traces, and upstream API details never appear in the browser's network panel.

**The secure path is the only path.**
Tokens are stored in `HttpOnly` cookies set exclusively by the server. There is no `localStorage` code path to accidentally choose. The architecture makes doing the wrong thing structurally impossible — not just against convention.

---

## Maintainability

**One feature = one directory = one responsibility.**
Deleting the "search invoices" feature means deleting `features/search-invoices/`. No hidden dependencies break because cross-feature imports are forbidden. No grep required.

**New developers know exactly where code belongs.**
The layer naming (`features/`, `entities/`, `shared/`, `widgets/`) answers the question "where does this go?" before anyone has to ask. There is no catch-all `utils/` folder growing without oversight.

**Swapping infrastructure does not touch domain.**
Want to replace the 101Digital REST adapter with GraphQL or a local mock? Edit `InvoiceAdapter.ts`. The domain use cases, entities, and every feature hook remain unchanged because they depend on the _port_ (interface), not the adapter.

**Swapping UI does not touch business logic.**
Migrating from shadcn/ui to another component library means editing `shared/ui/` and `shadcn/`. Domain, application use cases, and feature models do not know a design system exists.

---

## Scalability

**Monorepo packages are consumed, never duplicated.**
`packages/domain` runs identically on Next.js (server and client), React Native (Hermes), and Tauri (webview). Business logic — validation, calculations, use cases — is written once and shared across every future platform.

**Teams work in parallel without merge conflicts.**
Team A owns `features/create-invoice/`; Team B owns `features/list-invoices/`. The forbidden cross-feature import rule means neither team can accidentally break the other's slice, and the directory boundary makes ownership unambiguous.

**Adding a feature never requires refactoring existing ones.**
Each FSD slice is self-contained. New features plug into the widget and page layers from the outside; they do not reach into existing feature internals.

---

## Framework Independence

**Next.js is a delivery mechanism, not the foundation.**
`packages/domain` has zero Next.js, React, or browser globals. The entire business-logic layer could be lifted into a Fastify API, a CLI tool, or a React Native app without a single line change.

**The domain survives framework upgrades.**
When Next.js ships a major breaking change, only the `apps/web` adapter layer needs updating. The domain, use cases, and contracts stay untouched — the blast radius of an upgrade is bounded by the hexagonal boundary.

---

## Security by Design

The most important distinction from a typical Next.js project is that this architecture **does not allow mistakes** — it does not merely discourage them:

| Threat                                     | How architecture prevents it                                                              |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Token theft via XSS                        | `HttpOnly` cookie — no JavaScript API can read it, ever                                   |
| Secret exposure in browser bundle          | No `NEXT_PUBLIC_` prefix on credentials; server-only env vars enforced by module boundary |
| Client calling 101Digital directly         | `eslint-plugin-boundaries` prevents client components from importing `infrastructure/`    |
| Untrusted input reaching the API           | Zod in every Route Handler — not optional, part of the pattern                            |
| Cross-feature coupling causing regressions | ESLint import rule fails CI before code is merged                                         |

Security is not a checklist applied at the end. It is the default outcome of following the architecture.
