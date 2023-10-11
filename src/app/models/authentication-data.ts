import { CredentialsContract } from '@contracts/credentials-contract';
import { DirectusSchemaContract } from '@contracts/directus-schema-contract';
import { AuthenticationData, RequestOptions, RestCommand } from '@directus/sdk';
export class AuthenticationDataModel implements AuthenticationData {
    access_token!:string;
    refresh_token !:string;
    expires!:number;
    expires_at!:number;
}
