import { UserManager, UserManagerSettings } from "oidc-client-ts";

export const oidcConfig: UserManagerSettings = {
  authority: process.env.IDENTITY_SERVER_URL_DEV ?? "https://localhost:5082",
  client_id: "nextjs-app",
  redirect_uri: "http://localhost:3000/callback",
  post_logout_redirect_uri: "http://localhost:3000",
  automaticSilentRenew: true,

  response_type: "code",
  scope: "openid profile email api.read api.write",

  // userStore: new WebStorageStateStore({ store: window.localStorage }),
};
