import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./msw/server";

// Allow infrastructure adapters (which use "server-only") to be imported
// in the Node.js Vitest environment without a Next.js server context.
vi.mock("server-only", () => ({}));

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
