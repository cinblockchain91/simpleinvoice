# Project Structure

```
apps/web/src/
│
├── app/                                    # Next.js App Router
│   ├── [locale]/
│   │   ├── (auth)/login/page.tsx           # Public login page
│   │   └── (dashboard)/
│   │       ├── layout.tsx                  # Protected layout — checks cookie
│   │       └── invoices/
│   │           ├── page.tsx                # Invoice list (default home)
│   │           ├── new/page.tsx            # Create invoice
│   │           └── [id]/page.tsx           # Invoice detail
│   └── api/                               # BFF Route Handlers (server-only)
│       ├── auth/login/route.ts            # POST → proxies to /oauth2/token
│       ├── auth/logout/route.ts           # Clears HttpOnly cookies
│       ├── user/profile/route.ts          # GET → proxies to /membership-service
│       └── invoices/
│           ├── route.ts                   # GET list | POST create
│           └── [id]/route.ts              # GET single invoice
│
├── features/                              # User interaction slices
│   ├── auth/                              # Login form + useLogin hook
│   ├── create-invoice/                    # Create form + useCreateInvoice hook
│   ├── list-invoices/                     # useInvoiceList (TanStack Query)
│   ├── search-invoices/                   # Search bar + useInvoiceSearch
│   └── view-invoice/                      # Invoice detail display
│
├── widgets/                               # Composed UI blocks (no business logic)
│   ├── app-shell/                         # DashboardShell, AppSidebar, DashboardHeader
│   ├── invoice-table/                     # Data table with sort/pagination
│   └── invoice-filters/                   # Status filter + date range
│
├── entities/                              # Business entity UI representations
│   └── invoice/                           # InvoiceStatusBadge, Zod schema, types
│
├── shared/                                # Reusable code with no business logic
│   ├── ui/                               # DatePicker, ThemeToggle, LanguageSwitcher
│   ├── api/bff-client.ts                 # Typed fetch() wrapper — /api/* only
│   └── lib/                              # format-currency, format-date
│
├── infrastructure/                        # Hexagonal adapters (server-only)
│   ├── 101digital/
│   │   ├── AuthAdapter.ts                # implements AuthPort
│   │   └── InvoiceAdapter.ts             # implements InvoiceRepository
│   └── storage/SessionCookieStore.ts     # HttpOnly cookie read/write
│
└── __tests__/                             # Test infrastructure
    ├── msw/                              # MSW server + handlers (integration)
    ├── security/                         # BFF security boundary tests
    └── mocks/                            # server-only no-op mock
```
