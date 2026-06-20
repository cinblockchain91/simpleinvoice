import type { Result } from "../shared/Result";
import type { AuthToken, LoginCredentials } from "./AuthToken";
import type { AuthError } from "./errors/AuthErrors";

export interface AuthPort {
  login(credentials: LoginCredentials): Promise<Result<AuthToken, AuthError>>;
}
