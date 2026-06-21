# Project Structure

## `apps/web/src/`

```
apps/web/src/
│
├── app/                                         # [ROUTING] Next.js App Router
│   ├── [locale]/                                # Locale prefix injected by next-intl
│   │   ├── (auth)/
│   │   │   └── login/page.tsx                   # Public login page
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                       # Protected layout — checks access_token cookie
│   │   │   └── invoices/
│   │   │       ├── page.tsx                     # Invoice list (default home after login)
│   │   │       ├── new/page.tsx                 # Create invoice
│   │   │       └── [id]/page.tsx                # Invoice detail
│   │   ├── layout.tsx                           # Locale root layout (next-intl provider)
│   │   ├── page.tsx                             # Redirects / → /invoices
│   │   └── not-found.tsx                        # Locale-aware 404
│   ├── api/                                     # [BFF] Route Handlers — server-only
│   │   ├── auth/
│   │   │   ├── login/route.ts                   # POST → /oauth2/token → set HttpOnly cookies
│   │   │   └── logout/route.ts                  # Clears access_token + org_token cookies
│   │   ├── user/
│   │   │   └── profile/route.ts                 # GET → /membership-service
│   │   └── invoices/
│   │       ├── route.ts                         # GET list | POST create
│   │       └── [id]/route.ts                    # GET single invoice
│   ├── layout.tsx                               # Root layout (html + body)
│   ├── globals.css                              # Tailwind base styles + CSS variables
│   └── not-found.tsx                            # Root 404
│
├── features/                                    # [FSD L3] User interaction slices
│   ├── auth/
│   │   ├── model/useLogin.ts                    # Login mutation + error state
│   │   ├── ui/LoginForm.tsx                     # Controlled form component
│   │   └── index.ts
│   ├── create-invoice/
│   │   ├── model/useCreateInvoice.ts            # POST /api/invoices mutation
│   │   ├── ui/CreateInvoiceForm.tsx             # Multi-field form with DatePicker
│   │   └── index.ts
│   ├── list-invoices/
│   │   ├── model/useInvoiceList.ts              # TanStack Query — paginated fetch
│   │   ├── model/useInvoicePagination.ts        # Page / pageSize state
│   │   ├── ui/InvoicePagination.tsx             # Pagination control component
│   │   └── index.ts
│   ├── search-invoices/
│   │   ├── model/useInvoiceSearch.ts            # Debounced keyword state
│   │   ├── ui/SearchBar.tsx                     # Controlled search input with clear button
│   │   └── index.ts
│   └── view-invoice/
│       ├── model/useInvoice.ts                  # TanStack Query — single invoice fetch
│       └── index.ts
│
├── widgets/                                     # [FSD L2] Composed UI blocks
│   ├── app-shell/
│   │   ├── DashboardShell.tsx                   # Root layout shell (sidebar + header + main)
│   │   ├── AppSidebar.tsx                       # Nav links + logout button
│   │   ├── DashboardHeader.tsx                  # Top bar with hamburger + theme toggle
│   │   ├── Header.tsx                           # Unauthenticated header
│   │   ├── LanguageSwitcher.tsx                 # EN / VI locale toggle
│   │   └── index.ts
│   ├── invoice-filters/
│   │   ├── FilterBar.tsx                        # Status filter (All / Pending / Approved / …)
│   │   ├── SortControls.tsx                     # Sort field selector + asc/desc toggle
│   │   └── index.ts
│   └── invoice-table/
│       ├── InvoiceTable.tsx                     # Data table with loading skeleton
│       └── index.ts
│
├── entities/                                    # [FSD L4] Business entity UI representations
│   └── invoice/
│       ├── model/invoice.schema.ts              # Zod schema wrapping @simpleinvoice/api-contracts
│       ├── model/invoice.types.ts               # InvoiceStatus enum + Invoice type re-exports
│       ├── ui/InvoiceStatusBadge.tsx            # Coloured status badge
│       └── index.ts
│
├── shared/                                      # [FSD L5] Reusable, business-agnostic code
│   ├── api/
│   │   └── bff-client.ts                        # Typed fetch() wrapper — calls /api/* only
│   ├── config/
│   │   └── env.server.ts                        # Server-only env vars (Zod-validated at startup)
│   ├── hooks/
│   │   └── useLogout.ts                         # Shared logout action (clear store + navigate)
│   ├── store/
│   │   ├── auth.store.ts                        # Zustand — isAuthenticated flag
│   │   └── index.ts
│   └── ui/
│       ├── DatePicker.tsx                       # Calendar popover wrapping react-day-picker
│       ├── QueryProvider.tsx                    # TanStack Query client provider
│       ├── ThemeProvider.tsx                    # next-themes dark/light provider
│       ├── ThemeToggle.tsx                      # Sun/Moon icon toggle button
│       └── index.ts
│
├── infrastructure/                              # [HEXAGONAL ADAPTERS] — server-only
│   ├── 101digital/
│   │   ├── AuthAdapter.ts                       # implements AuthPort — token exchange
│   │   └── InvoiceAdapter.ts                    # implements InvoiceRepository — REST calls
│   └── storage/
│       └── SessionCookieStore.ts                # HttpOnly cookie read/write
│
├── i18n/                                        # next-intl configuration
│   ├── navigation.ts                            # Typed Link / useRouter / usePathname
│   ├── request.ts                               # Per-request locale resolution
│   └── routing.ts                               # Locale list + default locale
│
├── shadcn/                                      # [VENDOR] shadcn/ui — DO NOT edit manually
│   ├── ui/                                      # Generated components (Button, Input, Dialog …)
│   ├── hooks/use-mobile.tsx
│   └── lib/utils.ts                             # cn() utility
│
├── proxy.ts                                     # Next.js middleware — auth redirect + locale
│
└── __tests__/                                   # Test infrastructure (not business logic)
    ├── mocks/server-only.ts                     # No-op mock for "server-only" import in Vitest
    ├── msw/
    │   ├── server.ts                            # MSW Node server instance
    │   ├── handlers.ts                          # 101Digital API mock handlers
    │   └── msw-server.integration.test.ts       # Adapter integration tests
    ├── schemas/
    │   └── api-contracts.test.ts                # Zod schema validation tests
    ├── security/
    │   └── bff-security.test.ts                 # Verifies tokens are never returned in JSON
    ├── setup.ts                                 # Vitest global setup (unit)
    └── setup.integration.ts                     # Vitest global setup (integration)
```

---

## `packages/`

```
packages/
│
├── domain/                                      # Pure TypeScript — zero framework deps
│   └── src/
│       ├── auth/
│       │   ├── AuthToken.ts                     # Value Object
│       │   ├── AuthPort.ts                      # Port (interface) — infra must implement
│       │   ├── LoginUseCase.ts                  # Application use case
│       │   └── errors/AuthErrors.ts
│       ├── invoice/
│       │   ├── Invoice.ts                       # Entity + CreateInvoiceData type
│       │   ├── InvoiceRepository.ts             # Port (interface)
│       │   ├── CreateInvoiceUseCase.ts          # Application use case
│       │   └── errors/InvoiceErrors.ts
│       └── shared/
│           ├── Result.ts                        # Result<T, E> — replaces throw/catch at boundaries
│           └── Pagination.ts                    # Shared pagination types
│
├── api-contracts/                               # Zod schemas shared by BFF + client
│   └── src/
│       ├── auth/
│       │   └── login.schema.ts                  # LoginRequest schema
│       ├── invoice/
│       │   ├── invoice.schema.ts                # InvoiceResponse + InvoiceStatus
│       │   ├── create-invoice.schema.ts         # CreateInvoiceRequest schema
│       │   └── list-invoices.schema.ts          # ListInvoicesResponse schema
│       ├── user/
│       │   └── profile.schema.ts                # UserProfile schema
│       └── index.ts
│
└── config/                                      # Shared tooling config
    ├── eslint-base.mjs                          # Base ESLint rules used by all packages
    └── tsconfig.base.json                       # Base TypeScript config
```

---

## Root

```
simpleinvoice/
├── apps/web/                   # Next.js 16 app (see above)
├── packages/                   # Shared packages (see above)
├── docs/                       # Project documentation
│   └── examples/               # Before/After examples per architecture dimension
├── .github/workflows/          # CI/CD — lint, type-check, test, deploy
├── .husky/                     # Git hooks — pre-commit (lint-staged), pre-push (type-check), commit-msg (commitlint)
├── turbo.json                  # Turborepo task graph
├── pnpm-workspace.yaml         # Workspace package definitions
├── commitlint.config.ts        # Conventional commit rules
└── .env.example                # Required env vars with placeholder values
```
