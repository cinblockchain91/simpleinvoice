# Running Tests

## Unit tests

Fast, no network, no filesystem. Runs in jsdom (components/hooks) or node (pure logic) via Vitest + React Testing Library.

```bash
pnpm test
```

Coverage spans all layers:

| Layer                      | Files                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------- |
| `packages/domain`          | `Result.test.ts`, `LoginUseCase.test.ts`, `CreateInvoiceUseCase.test.ts`               |
| `packages/api-contracts`   | `src/__tests__/schemas/api-contracts.test.ts`                                          |
| `shared/api`               | `bff-client.test.ts`                                                                   |
| `shared/hooks`             | `useLogout.test.ts`                                                                    |
| `entities/invoice`         | `InvoiceStatusBadge.test.tsx`                                                          |
| `features/auth`            | `useLogin.test.ts`, `LoginForm.test.tsx`                                               |
| `features/create-invoice`  | `useCreateInvoice.test.ts`, `CreateInvoiceForm.test.tsx`                               |
| `features/list-invoices`   | `useInvoiceList.test.ts`, `useInvoicePagination.test.ts`, `InvoicePagination.test.tsx` |
| `features/search-invoices` | `useInvoiceSearch.test.ts`, `SearchBar.test.tsx`                                       |
| `features/view-invoice`    | `useInvoice.test.ts`                                                                   |
| `widgets/invoice-filters`  | `FilterBar.test.tsx`                                                                   |
| `widgets/invoice-table`    | `InvoiceTable.test.tsx`                                                                |
| `app/api/auth/login`       | `route.test.ts`                                                                        |
| `app/api/auth/logout`      | `route.test.ts`                                                                        |
| `app/api/invoices`         | `route.test.ts`                                                                        |
| `app/api/invoices/[id]`    | `route.test.ts`                                                                        |
| `app/api/user/profile`     | `route.test.ts`                                                                        |
| `infrastructure/storage`   | `SessionCookieStore.test.ts`                                                           |

## Integration tests

Tests hexagonal adapters against MSW-intercepted HTTP. Runs in Node.js — no browser, no Next.js runtime.

```bash
pnpm test:integration
```

Key coverage:

| File                                                           | What it tests                                                                 |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `__tests__/msw/msw-server.integration.test.ts`                 | `AuthAdapter` token exchange, `InvoiceAdapter` list/create/error paths        |
| `__tests__/security/bff-security.test.ts`                      | Verifies tokens are set as `HttpOnly` cookies and never returned in JSON body |
| `__tests__/schemas/api-contracts.test.ts`                      | Zod schema edge cases — required fields, date constraints, enum values        |
| `infrastructure/101digital/AuthAdapter.integration.test.ts`    | Auth adapter against MSW                                                      |
| `infrastructure/101digital/InvoiceAdapter.integration.test.ts` | Invoice adapter against MSW                                                   |

## E2E tests (Playwright)

Full golden paths against a running Next.js dev server. API calls to 101Digital are intercepted by `page.route()` — **no real credentials required**.

```bash
pnpm test:e2e
```

Covers:

- Login form → success → redirect to invoice list
- Login form → 401 → error message displayed
- Unauthenticated access to `/invoices` → redirect to `/login`
- Invoice list renders table with mocked data
- "Create Invoice" button navigates to `/invoices/new`
- Full create invoice flow → success toast → redirect back to list
- Create invoice validation → shows field errors on empty submit
- Back button on create page → returns to invoice list

## Type checking

```bash
pnpm type-check
```

Runs `tsc --noEmit` across all packages in dependency order via Turborepo. Also runs as a pre-push git hook — a type error blocks the push.
