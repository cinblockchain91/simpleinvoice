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

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.flatten().fieldErrors;
  console.error("❌ Invalid environment variables:\n", formatted);
  throw new Error("Invalid environment variables — check .env.local");
}

export const env = parsed.data;
