@AGENTS.md

# SimpleInvoice — Architecture & AI Constraints

> **AI MUST read this file in full before writing any code.**
> Every decision here is intentional and non-negotiable unless the user explicitly overrides it.

---

## 1. Project Context

**SimpleInvoice** is a production-grade invoicing web application built for 101 Digital's Web Engineer Assessment (v2.2.4). It is NOT a toy or learning project. Code quality, security posture, and architectural correctness are evaluated criteria.

**Stack versions (do NOT assume older APIs):**
- Next.js **16.2.9** — App Router only. No Pages Router. Check `node_modules/next/dist/docs/` before writing any Next.js code.
- React **19.2.4** — Server Components are the default. Client Components require explicit `"use client"`.
- Tailwind CSS **v4** — New config format. No `tailwind.config.js` in v4; config lives in CSS via `@theme`.
- TypeScript **5** — Strict mode always on.
- pnpm — package manager.

---

## 2. Architecture: Feature-Sliced Hexagonal (FSH)

Three principles combined:

1. **Hexagonal (Ports & Adapters)** — Domain core has zero framework dependencies. Infrastructure adapters implement domain ports. Dependency inversion is enforced.
2. **Feature-Sliced Design (FSD)** — Code is organized vertically by business feature, then horizontally by technical concern. Each feature owns its UI, model, and API slice.
3. **Monorepo-ready** — Domain logic lives in `packages/domain` (pure TypeScript, no React). Apps consume packages, never the reverse.

### Dependency Rule (NEVER violate)

```
shared ← entities ← features ← widgets ← pages/app
domain ← application ← infrastructure ← presentation
```

Outer layers import from inner layers. Inner layers NEVER import from outer layers. Cross-feature imports are forbidden.

---

## 3. Repository Structure

```
simpleinvoice/
├── apps/
│   ├── web/                        # Next.js 16 — primary deliverable
│   ├── mobile/                     # React Native/Expo (future)
│   └── desktop/                    # Tauri (future)
│
├── packages/
│   ├── domain/                     # Pure business logic — ZERO React/Next.js dependency
│   ├── ui/                         # Shared design system (React, cross-platform)
│   ├── api-contracts/              # Zod schemas + shared TypeScript types
│   └── config/                     # Shared tsconfig, eslint, tailwind base
│
└── tooling/
    └── scripts/
```

---

## 4. `apps/web/` Internal Structure (FSD Layers)

```
apps/web/src/
│
├── app/                                    # [ROUTING] Next.js App Router
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                      # Protected — checks cookie presence
│   │   └── invoices/
│   │       ├── page.tsx                    # Invoice list (default home after login)
│   │       └── new/page.tsx                # Create invoice
│   └── api/                               # [BFF] Route Handlers — SERVER ONLY
│       ├── auth/
│       │   ├── login/route.ts             # POST → proxies to 101Digital /oauth2/token
│       │   └── logout/route.ts            # Clears httpOnly cookies
│       ├── user/
│       │   └── profile/route.ts           # GET → proxies to /membership-service
│       └── invoices/
│           ├── route.ts                   # GET list | POST create
│           └── [id]/route.ts
│
├── widgets/                               # [FSD L2] Composed UI blocks (no business logic)
│   ├── invoice-table/
│   ├── invoice-filters/
│   └── app-shell/
│
├── features/                              # [FSD L3] User interaction slices
│   ├── auth/
│   │   ├── ui/LoginForm.tsx
│   │   ├── model/useLogin.ts
│   │   └── index.ts
│   ├── create-invoice/
│   │   ├── ui/CreateInvoiceForm.tsx
│   │   ├── model/useCreateInvoice.ts
│   │   └── index.ts
│   └── search-invoices/
│       ├── ui/SearchBar.tsx
│       ├── model/useInvoiceSearch.ts
│       └── index.ts
│
├── entities/                              # [FSD L4] Business entity UI representations
│   ├── invoice/
│   │   ├── model/invoice.schema.ts        # Zod schema for API response
│   │   ├── model/invoice.types.ts
│   │   ├── ui/InvoiceStatusBadge.tsx
│   │   └── index.ts
│   └── user/
│       ├── model/user.types.ts
│       └── index.ts
│
├── shared/                                # [FSD L5] Reusable code with no business logic
│   ├── ui/                               # shadcn/ui base components
│   ├── api/
│   │   └── bff-client.ts                 # Typed fetch() wrapper — calls /api/* only
│   ├── lib/
│   │   ├── format-currency.ts
│   │   └── format-date.ts
│   ├── config/
│   │   └── env.server.ts                 # Server-only env vars — never NEXT_PUBLIC_*
│   └── types/
│       └── pagination.types.ts
│
└── infrastructure/                        # [HEXAGONAL ADAPTERS] — server-only, never imported by client
    ├── 101digital/
    │   ├── AuthAdapter.ts                 # implements AuthPort from packages/domain
    │   └── InvoiceAdapter.ts              # implements InvoiceRepository from packages/domain
    └── storage/
        └── SessionCookieStore.ts          # httpOnly cookie read/write
```

---

## 5. `packages/domain/` — Hexagonal Core

```
packages/domain/src/
├── invoice/
│   ├── Invoice.ts                   # Entity
│   ├── InvoiceRepository.ts         # Port (interface) — infrastructure must implement
│   ├── CreateInvoiceUseCase.ts      # Application use case
│   └── errors/InvoiceErrors.ts
├── auth/
│   ├── AuthToken.ts                 # Value Object
│   ├── AuthPort.ts                  # Port
│   └── LoginUseCase.ts
└── shared/
    └── Result.ts                    # Result<T, E> — replaces throw/catch at boundaries
```

**Rule:** `packages/domain` has ZERO dependencies on React, Next.js, or any browser API. It must run on Node.js, browser, React Native (Hermes), and Deno without modification.

---

## 6. Security Architecture (NON-NEGOTIABLE)

### BFF Pattern — Tokens NEVER reach the browser

```
Client                  BFF (Next.js Server)              101 Digital
  │                            │                               │
  │─POST /api/auth/login──────▶│                               │
  │  { username, password }    │─POST /oauth2/token───────────▶│
  │                            │  { client_id, client_secret,  │
  │                            │    username, password }        │
  │                            │◀─{ access_token }─────────────│
  │                            │─GET /membership-service───────▶│
  │                            │◀─{ memberships[0].token }─────│
  │◀─Set-Cookie:───────────────│                               │
  │  access_token=...; HttpOnly; Secure; SameSite=Strict
  │  org_token=...;   HttpOnly; Secure; SameSite=Strict
  │
  │─GET /api/invoices──────────▶│
  │  (cookie sent automatically) │─GET /invoice-service─────────▶│
  │                              │◀─{ invoices }─────────────────│
  │◀─{ invoices }────────────────│
```

### Security rules enforced:

1. **Server-side token exchange** — `/api/auth/login` route handler calls 101Digital `/oauth2/token`. Client code NEVER calls 101Digital directly.
2. **No secrets in browser bundle** — `client_id`, `client_secret` read from non-`NEXT_PUBLIC_` env vars in server code only.
3. **httpOnly cookies** — `access_token` and `org_token` stored as `HttpOnly; Secure; SameSite=Strict` cookies set by the server. Never `localStorage` or `sessionStorage`.
4. **All 101Digital API calls proxied** — Every call to `membership-service` and `invoice-service` goes through `/api/*` route handlers. Client only talks to its own origin.
5. **Secrets hygiene** — Real credentials in `.env.local` (git-ignored). `.env.example` committed with placeholder values.
6. **Server-side validation** — Zod validates all inputs in Route Handlers, not only client-side form validation.
7. **Security headers** — Configured in `next.config.ts` via `headers()`.

---

## 7. Tech Stack Decisions

| Concern | Choice | Reason |
|---|---|---|
| Monorepo | Turborepo + pnpm workspaces | Incremental builds, task graph |
| Framework | Next.js 16 App Router | RSC + Route Handlers = native BFF |
| Styling | Tailwind CSS v4 + shadcn/ui | Professional, accessible, headless |
| Server state | TanStack Query (React Query) | Caching, pagination, background refetch |
| Forms | React Hook Form + Zod | Performance, schema-driven validation |
| Client state | Zustand | Minimal boilerplate, scalable |
| Auth storage | httpOnly cookies | XSS-safe, assessment requirement |
| Testing | Vitest + React Testing Library + Playwright | Unit → Component → E2E |
| Import enforcement | eslint-plugin-boundaries | Prevents FSD layer violations |

---

## 8. Import Rules (enforced by eslint-plugin-boundaries)

```
✅ features/* → entities/*
✅ features/* → shared/*
✅ widgets/* → features/*
✅ widgets/* → entities/*
✅ app/* → widgets/*
✅ app/api/* → infrastructure/*     (Route Handlers only)

❌ entities/* → features/*          (direction violation)
❌ shared/* → entities/*            (direction violation)
❌ features/auth → features/create-invoice  (cross-feature)
❌ Client components → infrastructure/*     (server-only boundary)
❌ packages/domain → React/*               (domain must stay pure)
```

---

## 9. Naming Conventions

- **Files**: `kebab-case.ts` for utilities, `PascalCase.tsx` for React components
- **Hooks**: `use` prefix, camelCase — `useCreateInvoice.ts`
- **Types/Interfaces**: PascalCase — `InvoiceRepository`, `AuthToken`
- **Ports (interfaces)**: Suffix `Port` or `Repository` — `InvoiceRepository`, `AuthPort`
- **Adapters**: Suffix `Adapter` — `InvoiceAdapter`, `AuthAdapter`
- **Route Handlers**: Always `route.ts` in `app/api/` directories
- **Index files**: Every FSD slice exports through `index.ts`

---

## 10. Cross-Platform Strategy

```
packages/domain/      → Zero framework deps. Runs on any JS runtime.
packages/ui/          → React components only (no Next.js). Usable in RN via React Native Web.
apps/web/             → Next.js 16 specific code only.
apps/mobile/          → React Native. Reuses packages/domain + packages/api-contracts.
apps/desktop/         → Tauri + webview. Reuses apps/web build.
```

Business logic (validation, calculations, transformations, use cases) lives EXCLUSIVELY in `packages/domain`. It is NEVER duplicated in app-level code.

---

## 11. What AI Must NOT Do

- Do NOT use Pages Router (`pages/` directory). App Router only.
- Do NOT use `localStorage` or `sessionStorage` for tokens.
- Do NOT expose `client_secret` or `access_token` to client-side code.
- Do NOT use `NEXT_PUBLIC_` prefix for any secret or token.
- Do NOT import from `infrastructure/` in any Client Component or shared code.
- Do NOT cross-import between feature slices.
- Do NOT call 101Digital APIs directly from client components — always proxy through `/api/*`.
- Do NOT add `"use client"` to Server Components unnecessarily.
- Do NOT hardcode credentials anywhere in source code.
- Do NOT create files outside the defined layer structure without explicit user instruction.
