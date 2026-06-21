import { describe, it, expect, vi } from "vitest";
import { LoginUseCase } from "./LoginUseCase";
import { ok, fail } from "../shared/Result";
import {
  InvalidCredentialsError,
  AuthServiceUnavailableError,
} from "./errors/AuthErrors";
import type { AuthPort } from "./AuthPort";
import type { AuthToken } from "./AuthToken";

const makePort = (
  result: Awaited<ReturnType<AuthPort["login"]>>,
): AuthPort => ({
  login: vi.fn().mockResolvedValue(result),
});

const CREDENTIALS = { username: "user@example.com", password: "secret" };
const TOKEN: AuthToken = { accessToken: "access-abc", orgToken: "org-xyz" };

describe("LoginUseCase", () => {
  it("returns the token on successful login", async () => {
    const port = makePort(ok(TOKEN));
    const result = await new LoginUseCase(port).invoke(CREDENTIALS);

    expect(result).toEqual(ok(TOKEN));
    expect(port.login).toHaveBeenCalledWith(CREDENTIALS);
  });

  it("propagates InvalidCredentialsError", async () => {
    const error = new InvalidCredentialsError();
    const port = makePort(fail(error));
    const result = await new LoginUseCase(port).invoke(CREDENTIALS);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(InvalidCredentialsError);
      expect(result.error.kind).toBe("InvalidCredentials");
    }
  });

  it("propagates AuthServiceUnavailableError", async () => {
    const error = new AuthServiceUnavailableError("timeout");
    const port = makePort(fail(error));
    const result = await new LoginUseCase(port).invoke(CREDENTIALS);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(AuthServiceUnavailableError);
      expect(result.error.kind).toBe("AuthServiceUnavailable");
    }
  });

  it("delegates to the port without modifying credentials", async () => {
    const port = makePort(ok(TOKEN));
    await new LoginUseCase(port).invoke(CREDENTIALS);

    expect(port.login).toHaveBeenCalledExactlyOnceWith(CREDENTIALS);
  });
});
