export interface IdentityClientModel {
  id: number;
  clientId: string;
  clientName: string;
  grantTypes: string;
  requireConsent: boolean;
  requirePkce: boolean;
  redirectUris: string[];
  postLogoutRedirectUris: string[];
  allowedScopes: string[];
  allowedCorsOrigins: string[];
}

export interface AddIdentityClientRequest {
  clientId: string;
  clientName: string;
  clientSecret: string;
  grantTypes: string;
  requireConsent: boolean;
  requirePkce: boolean;
  redirectUris: string[];
  postLogoutRedirectUris: string[];
  allowedScopes: string[];
  allowedCorsOrigins: string[];
}

export interface UpdateIdentityClientRequest extends Omit<
  AddIdentityClientRequest,
  "clientSecret"
> {
  clientSecret?: string;
}

export interface ApiScopeModel {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  enabled: boolean;
  userClaims: string[];
}

export interface AddApiScopeRequest {
  name: string;
  displayName: string;
  description?: string;
  enabled: boolean;
  userClaims: string[];
}

export interface UpdateApiScopeRequest extends AddApiScopeRequest {}
