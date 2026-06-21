# Design Decisions

## Why hexagonal architecture for a "simple" app?

The assessment explicitly requires code quality at a production-engineering level. Hexagonal architecture enforces two properties that matter under evaluation:

1. **Testability without mocks of implementation details** — `packages/domain` use cases are tested with plain in-memory fakes, not mocked framework internals.
2. **Portability** — the same domain package could power a React Native mobile app with zero changes.

## Why a separate `packages/domain`?

The domain layer has no `package.json` dependency on React, Next.js, or any browser API. This is verified by the TypeScript compiler: if an accidental import were added, the `packages/domain:type-check` task would fail.

## Why TanStack Query instead of `fetch` in Server Components?

The invoice list requires client-side interactivity: search, filter, sort, and pagination all update the list without a full page reload. TanStack Query provides cache invalidation (the list auto-refreshes after a successful create), background refetch, and loading/error state — all with less boilerplate than `useEffect` + manual state.

## Why MSW for integration tests instead of hitting the real API?

Integration tests that hit a shared sandbox are slow, flaky (network-dependent), and pollute shared state (every run creates real invoices). MSW intercepts at the `fetch` level in Node.js — the adapters exercise real HTTP parsing logic against a controlled, deterministic API surface.

## Why `Result<T, E>` instead of `try/catch`?

Domain errors (`InvoiceFetchError`, `InvoiceCreateError`, `InvoiceNotFoundError`) are modelled as typed discriminated unions returned by the repository. This makes error handling explicit at call sites and prevents uncaught exceptions from propagating across architectural boundaries. TypeScript's exhaustiveness checking catches unhandled error variants at compile time.
