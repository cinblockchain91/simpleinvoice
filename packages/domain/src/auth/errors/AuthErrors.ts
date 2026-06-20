export class InvalidCredentialsError extends Error {
  readonly kind = "InvalidCredentials" as const;
  constructor() {
    super("Invalid username or password");
    this.name = "InvalidCredentialsError";
  }
}

export class AuthServiceUnavailableError extends Error {
  readonly kind = "AuthServiceUnavailable" as const;
  constructor(cause: string) {
    super(`Authentication service unavailable: ${cause}`);
    this.name = "AuthServiceUnavailableError";
  }
}

export type AuthError = InvalidCredentialsError | AuthServiceUnavailableError;
