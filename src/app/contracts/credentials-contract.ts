import { AuthenticationMode } from '@directus/sdk';

export interface CredentialsContract {
  identifier?: string;
  password: string;
  email?: string;
  mode?: AuthenticationMode;
  otp?: string;
}
