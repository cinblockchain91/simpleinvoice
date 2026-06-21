# Security Design

| Control                          | Implementation                                                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Server-side token exchange**   | `/api/auth/login` proxies to `/oauth2/token`. `client_secret` is read server-side only.                                          |
| **No secrets in client bundle**  | Zero `NEXT_PUBLIC_` env vars. Secrets validated in `env.server.ts` which imports `server-only`.                                  |
| **HttpOnly cookies**             | `access_token` and `org_token` set with `HttpOnly; Secure; SameSite=Strict`. Unreadable by JavaScript.                           |
| **BFF proxy**                    | Every call to `invoice-service` and `membership-service` passes through `/api/*`. The browser only talks to its own origin.      |
| **Server-side input validation** | Zod validates all Route Handler inputs (query params and request bodies) independently of client-side validation.                |
| **Security headers**             | Configured in `next.config.ts`: CSP, `X-Frame-Options`, `X-Content-Type-Options`, HSTS, `Referrer-Policy`, `Permissions-Policy`. |
| **Secrets hygiene**              | `.env.local` is git-ignored. `.env.example` is committed with placeholder values only.                                           |
| **Security boundary tests**      | `apps/web/src/__tests__/security/bff-security.test.ts` asserts that tokens are never returned in API response bodies.            |
