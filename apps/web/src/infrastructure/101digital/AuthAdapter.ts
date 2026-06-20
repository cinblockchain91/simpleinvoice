import "server-only";
import {
  ok,
  fail,
  InvalidCredentialsError,
  AuthServiceUnavailableError,
} from "@simpleinvoice/domain";
import type {
  AuthPort,
  AuthToken,
  LoginCredentials,
  AuthError,
} from "@simpleinvoice/domain";
import type { Result } from "@simpleinvoice/domain";
import { env } from "@/shared/config/env.server";

export class AuthAdapter implements AuthPort {
  async login(
    credentials: LoginCredentials,
  ): Promise<Result<AuthToken, AuthError>> {
    // Step 1: Exchange credentials for access_token via OAuth2 password grant
    let accessToken: string;
    try {
      const tokenRes = await fetch(
        `${env.DIGITAL_AUTH_BASE_URL}/t/101digital.core/oauth2/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "password",
            client_id: env.DIGITAL_CLIENT_ID,
            client_secret: env.DIGITAL_CLIENT_SECRET,
            scope: "openid",
            username: credentials.username,
            password: credentials.password,
          }),
          cache: "no-store",
        },
      );

      if (tokenRes.status === 400 || tokenRes.status === 401) {
        return fail(new InvalidCredentialsError());
      }

      if (!tokenRes.ok) {
        return fail(
          new AuthServiceUnavailableError(
            `Token endpoint returned ${tokenRes.status}`,
          ),
        );
      }

      const tokenData = await tokenRes.json();
      accessToken = tokenData.access_token;
    } catch (err) {
      return fail(new AuthServiceUnavailableError(String(err)));
    }

    // Step 2: Fetch org token from membership service (memberships[0].token)
    let orgToken: string;
    try {
      const memberRes = await fetch(
        `${env.DIGITAL_API_BASE_URL}/membership-service/1.0.0/users/me`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        },
      );

      if (!memberRes.ok) {
        return fail(
          new AuthServiceUnavailableError(
            `Membership service returned ${memberRes.status}`,
          ),
        );
      }

      const memberData = await memberRes.json();
      const data = memberData?.data ?? memberData;
      orgToken = data?.memberships?.[0]?.token;

      if (!orgToken) {
        return fail(
          new AuthServiceUnavailableError(
            "No organisation found for this account",
          ),
        );
      }
    } catch (err) {
      return fail(new AuthServiceUnavailableError(String(err)));
    }

    return ok({ accessToken, orgToken });
  }
}
