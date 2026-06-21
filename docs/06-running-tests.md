# Running Tests

## Unit tests

Fast, no network, no filesystem. Runs in jsdom via Vitest + React Testing Library.

```bash
pnpm test
```

## Integration tests

Tests the hexagonal adapters against MSW-intercepted HTTP. Runs in Node.js — no browser, no Next.js runtime.

```bash
pnpm test:integration
```

Key coverage:

- `AuthAdapter` — token exchange, error handling (401, 5xx)
- `InvoiceAdapter` — list pagination, status filter mapping, create payload, error propagation
- BFF Route Handlers — `POST /api/auth/login`, `GET /api/invoices`, `POST /api/invoices`
- Security boundary — verifies tokens are set as HttpOnly cookies (not returned in JSON body)

## E2E tests (Playwright)

Full golden path against a running dev server. Requires a `.env.local` with valid credentials.

```bash
pnpm test:e2e
```

Covers:

- Login → redirect to invoice list
- Create invoice → success toast → list reflects new invoice
- Unauthenticated access → redirect to login

## Type checking

```bash
pnpm type-check
```

Runs `tsc --noEmit` across all packages in dependency order via Turborepo. This also runs as a pre-push git hook — a broken type is a blocked push.
