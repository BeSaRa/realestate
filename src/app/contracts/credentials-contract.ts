import { AuthenticationMode } from "@directus/sdk";

export interface CredentialsContract {
  identifier: string;
  password: string;
  mode: AuthenticationMode;
}
