import "server-only";
import { cookies } from "next/headers";
import type { AuthToken } from "@simpleinvoice/domain";

const ACCESS_TOKEN_KEY = "access_token";
const ORG_TOKEN_KEY = "org_token";

// 8 hours — matches typical 101Digital token TTL
const MAX_AGE_SECONDS = 60 * 60 * 8;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};

export class SessionCookieStore {
  async set(token: AuthToken): Promise<void> {
    const jar = await cookies();
    jar.set(ACCESS_TOKEN_KEY, token.accessToken, COOKIE_OPTIONS);
    jar.set(ORG_TOKEN_KEY, token.orgToken, COOKIE_OPTIONS);
  }

  async get(): Promise<AuthToken | null> {
    const jar = await cookies();
    const accessToken = jar.get(ACCESS_TOKEN_KEY)?.value;
    const orgToken = jar.get(ORG_TOKEN_KEY)?.value;

    if (!accessToken || !orgToken) return null;

    return { accessToken, orgToken };
  }

  async clear(): Promise<void> {
    const jar = await cookies();
    jar.delete(ACCESS_TOKEN_KEY);
    jar.delete(ORG_TOKEN_KEY);
  }
}
