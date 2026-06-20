import "server-only";
import { z } from "zod";

const schema = z.object({
  DIGITAL_CLIENT_ID: z.string().min(1, "DIGITAL_CLIENT_ID is required"),
  DIGITAL_CLIENT_SECRET: z.string().min(1, "DIGITAL_CLIENT_SECRET is required"),
  DIGITAL_BASE_URL: z.string().url("DIGITAL_BASE_URL must be a valid URL"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

type Env = z.infer<typeof schema>;

let _env: Env | undefined;

function getValidatedEnv(): Env {
  if (_env) return _env;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const formatted = parsed.error.flatten().fieldErrors;
    console.error("Invalid environment variables:\n", formatted);
    throw new Error("Invalid environment variables — check .env.local");
  }
  _env = parsed.data;
  return _env;
}

// Lazily validated proxy — defers env parsing to first request so that
// Next.js can build without runtime secrets present in CI.
export const env = new Proxy({} as Env, {
  get(_, prop: string | symbol) {
    return getValidatedEnv()[prop as keyof Env];
  },
});
