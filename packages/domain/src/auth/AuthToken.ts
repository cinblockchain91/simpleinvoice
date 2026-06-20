export interface LoginCredentials {
  readonly username: string;
  readonly password: string;
}

export interface AuthToken {
  readonly accessToken: string;
  readonly orgToken: string;
}
