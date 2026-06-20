import type { Result } from "../shared/Result";
import type { AuthToken, LoginCredentials } from "./AuthToken";
import type { AuthError } from "./errors/AuthErrors";
import type { AuthPort } from "./AuthPort";

export class LoginUseCase {
  constructor(private readonly authPort: AuthPort) {}

  invoke(credentials: LoginCredentials): Promise<Result<AuthToken, AuthError>> {
    return this.authPort.login(credentials);
  }
}
