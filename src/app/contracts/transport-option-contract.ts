import { HttpParams } from "@angular/common/http";

export type ResponseTransformer = (json: unknown) => unknown;
export interface TransportResult {
    ok: boolean;
    msg: string;
  }
export interface TransportOptions {
    noAuthorizationHeader?: boolean;

    // To skip refreshing the access token if it is null.
    accessToken?: string | null;

    // Global query parameters
    params?: HttpParams;

    // JSON response transformer
    mapResponse?: ResponseTransformer;
  }