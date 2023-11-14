import { AuthenticationData } from '@directus/sdk';

export class AuthenticationDataModel implements AuthenticationData {
  access_token!: string;
  refresh_token!: string;
  expires!: number;
  expires_at!: number;
}
