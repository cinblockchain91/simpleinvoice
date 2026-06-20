import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Node.js MSW server — used in Vitest (no browser required)
export const server = setupServer(...handlers);
