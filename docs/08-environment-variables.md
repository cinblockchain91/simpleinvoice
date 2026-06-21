# Environment Variables

All variables are **server-only**. None use the `NEXT_PUBLIC_` prefix. The `env.server.ts` module validates them at startup and throws a descriptive error if any are missing — the app will not boot with an incomplete config.

| Variable                | Required | Description                                         |
| ----------------------- | -------- | --------------------------------------------------- |
| `DIGITAL_CLIENT_ID`     | Yes      | OAuth2 client ID for the 101Digital identity server |
| `DIGITAL_CLIENT_SECRET` | Yes      | OAuth2 client secret — never exposed to the browser |
| `DIGITAL_AUTH_BASE_URL` | Yes      | Base URL for `/oauth2/token` (WSO2 IS host)         |
| `DIGITAL_API_BASE_URL`  | Yes      | Base URL for invoice-service and membership-service |

See [`apps/web/.env.example`](../apps/web/.env.example) for the full template.
