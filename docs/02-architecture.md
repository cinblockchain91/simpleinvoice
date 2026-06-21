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
