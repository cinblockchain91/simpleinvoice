# Architecture

## Feature-Sliced Hexagonal (FSH)

This project combines three complementary architectural patterns:

| Pattern                          | What it provides                                                                                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hexagonal (Ports & Adapters)** | Domain logic is framework-agnostic. External systems implement typed ports. Dependency inversion is enforced at the package boundary.                               |
| **Feature-Sliced Design (FSD)**  | Code is organised vertically by business feature, then horizontally by concern (ui / model / api). Each feature slice is self-contained and independently testable. |
| **Monorepo (Turborepo)**         | Pure domain logic lives in `packages/domain` — zero React/Next.js dependencies. A future mobile or desktop app can reuse the same domain without modification.      |

## Dependency Rule

```
shared ← entities ← features ← widgets ← pages/app
domain ← application ← infrastructure ← presentation
```

Outer layers import from inner layers. The reverse is enforced by `eslint-plugin-boundaries` — a failing lint check is a dependency violation, caught in CI before it reaches review.

## Monorepo Structure

```
simpleinvoice/
├── apps/
│   └── web/                    # Next.js 16 — primary deliverable
│
└── packages/
    ├── domain/                  # Pure TypeScript — zero framework deps
    │   └── src/
    │       ├── invoice/         # Invoice entity, repository port, use cases
    │       ├── auth/            # AuthToken value object, AuthPort, LoginUseCase
    │       └── shared/          # Result<T,E> — replaces throw/catch at boundaries
    │
    ├── api-contracts/           # Zod schemas + shared types (used by both BFF and client)
    └── config/                  # Shared tsconfig, eslint base
```

## BFF Security Model

```
Browser                    Next.js BFF (server)               101 Digital
  │                               │                                │
  │──POST /api/auth/login────────▶│                                │
  │  { username, password }       │──POST /oauth2/token───────────▶│
  │                               │  { client_id, client_secret,   │
  │                               │    username, password }         │
  │                               │◀──{ access_token }─────────────│
  │                               │──GET /membership-service───────▶│
  │                               │◀──{ memberships[0].token }─────│
  │◀──Set-Cookie──────────────────│                                │
  │   access_token=...; HttpOnly  │                                │
  │   org_token=...;   HttpOnly   │                                │
  │                               │                                │
  │──GET /api/invoices───────────▶│                                │
  │  (cookie auto-sent)           │──GET /invoice-service─────────▶│
  │                               │◀──{ invoices }─────────────────│
  │◀──{ invoices }────────────────│                                │
```

The browser only ever speaks to `*.simpleinvoice-web.vercel.app`. 101 Digital tokens are stored in `HttpOnly; Secure; SameSite=Strict` cookies — invisible to JavaScript, immune to XSS.

## Cross-Platform Business Logic

One of the core architectural benefits of this design is that **all business logic lives in `packages/domain` — a pure TypeScript package with zero framework dependencies**. This means the same validation rules, use cases, and error types can be consumed by any JavaScript runtime without modification.

```
packages/domain/          ← zero deps: no React, no Next.js, no Node APIs
      │
      ├── runs on Next.js (apps/web)          → server-side Route Handlers + RSC
      ├── runs on React Native / Expo         → apps/mobile (future)
      ├── runs on Tauri webview               → apps/desktop (future)
      └── runs on Node.js CLI / scripts       → tooling, data migrations
```

In practice this means:

- **Invoice validation rules** (required fields, date constraints, amount calculations) are written once in `packages/domain` and enforced identically on web, mobile, and desktop — no copy-paste drift.
- **Use cases** (`CreateInvoiceUseCase`, `LoginUseCase`) contain the orchestration logic. Each platform provides its own adapter (HTTP fetch, SQLite, SecureStore) but plugs into the same port interface.
- **Error types** (`InvoiceCreateError`, `InvoiceNotFoundError`) are shared, so error handling code in any app can switch on the same discriminated union.

### Shared Code Illustration

```
simpleinvoice/
│
├── packages/
│   ├── domain/                          # ← Shared by ALL platforms
│   │   └── src/
│   │       ├── invoice/
│   │       │   ├── Invoice.ts           # Entity + CreateInvoiceData type
│   │       │   ├── InvoiceRepository.ts # Port (interface) — platform must implement
│   │       │   ├── CreateInvoiceUseCase.ts
│   │       │   └── errors/InvoiceErrors.ts
│   │       ├── auth/
│   │       │   ├── AuthToken.ts         # Value Object
│   │       │   ├── AuthPort.ts          # Port (interface)
│   │       │   └── LoginUseCase.ts
│   │       └── shared/
│   │           └── Result.ts            # Result<T, E> — no throw/catch at boundaries
│   │
│   └── api-contracts/                   # ← Shared by web BFF + mobile API client
│       └── src/invoice/
│           ├── invoice.schema.ts        # Zod schema (validates API responses)
│           └── create-invoice.schema.ts # Zod schema (validates user input)
│
├── apps/
│   ├── web/                             # Next.js 16
│   │   └── src/infrastructure/
│   │       └── 101digital/
│   │           └── InvoiceAdapter.ts    # implements InvoiceRepository → fetch()
│   │
│   ├── mobile/                          # React Native / Expo (future)
│   │   └── src/infrastructure/
│   │       └── 101digital/
│   │           └── InvoiceAdapter.ts    # implements InvoiceRepository → fetch()
│   │                                    # (same port, different transport config)
│   │
│   └── desktop/                         # Tauri (future)
│       └── src/infrastructure/
│           └── InvoiceAdapter.ts        # implements InvoiceRepository → Tauri IPC
```

Each platform column is different; the domain column is identical. Adding a new business rule means editing one file in `packages/domain` — every app picks it up automatically on the next build.
