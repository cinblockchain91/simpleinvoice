# Testability — Before / After Examples

10 scenarios showing what changes when domain logic is pure and layers are isolated.

---

| #   | Scenario                                         | ❌ Before (without FSH)                                                                                 | ✅ After (with FSH)                                                                                    |
| --- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1   | **Test that due date must be after issue date**  | Must render `<CreateInvoiceForm>`, fill inputs, fire submit, assert on DOM error — slow and brittle     | `expect(validateDates("2026-06-01", "2026-05-01")).toBe(false)` — pure function, zero setup            |
| 2   | **Test the login use case**                      | Need to mock `fetch`, mock cookies, wrap in React providers, mock Next.js router                        | Inject a fake `AuthPort` that returns a token — call `loginUseCase.execute(creds)` directly            |
| 3   | **Test invoice total calculation**               | Instantiate the full form component, enter line items, read calculated value from DOM                   | Call `calculateTotal(items)` — a pure function in `packages/domain`, asserted in one line              |
| 4   | **Test `useLogin` hook**                         | Must also mock `useCreateInvoice`, `useInvoiceList`, shared store — they're all entangled               | `useLogin` is isolated in its own slice; mock only `/api/auth/login` via `vi.stubGlobal("fetch", ...)` |
| 5   | **E2E test against the real API**                | Requires a 101Digital sandbox account, valid credentials, VPN, and a stable staging environment         | `page.route("**/api/**", ...)` — Playwright intercepts the BFF layer; zero external dependency         |
| 6   | **Test a failing network call**                  | Mock `fetch` globally — risks leaking into unrelated tests across the suite                             | Inject a failing `InvoiceRepository` port — scoped to one test, no global state touched                |
| 7   | **Test the same logic on React Native**          | Impossible — the logic is inside a Next.js Route Handler or a React component                           | `packages/domain` runs on Hermes (React Native JS engine) unchanged — same test file works             |
| 8   | **Run tests in CI without a server**             | CI must boot a Next.js dev server, set real env vars, seed a database                                   | `pnpm test:unit` — pure functions and in-memory fakes; no server, no env vars, completes in seconds    |
| 9   | **Add a test for a new business rule**           | Hard to know where to put it — business logic is scattered across hooks, components, and route handlers | Rule goes in `packages/domain`; test file sits next to it; one `it()` block, no mocking                |
| 10  | **Achieve high test coverage on critical paths** | Coverage tools report high numbers but tests exercise rendering, not logic — false confidence           | Domain layer is 100% coverable with plain unit tests; UI layer separately covered with RTL; no overlap |
