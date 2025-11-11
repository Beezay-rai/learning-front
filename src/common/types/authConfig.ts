export interface AuthBasic {
  type: "basic";
  username: string;
  password: string;
}

export interface AuthBearer {
  type: "bearer";
  token: string;
}

export interface AuthApiKey {
  type: "api-key";
  key: string;
  value: string;
  addTo: "header" | "query";
}

export type AuthConfig = { type: "none" } | AuthBasic | AuthBearer | AuthApiKey;
