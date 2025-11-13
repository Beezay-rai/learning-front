"use client";
import {
  UserManager,
  UserManagerSettings,
  WebStorageStateStore,
} from "oidc-client-ts";

const config: UserManagerSettings = {
  authority: process.env.IDENTITY_SERVER_URL_DEV ?? "https://localhost:5082",
  client_id: "nextjs-app",
  redirect_uri: "http://localhost:3000/callback",
  post_logout_redirect_uri: "http://localhost:3000",
  // automaticSilentRenew: true,
  response_type: "code",
  scope: "openid profile api.read",
  // userStore: new WebStorageStateStore({ store: window.localStorage }),
};

export const userManager = new UserManager(config);

export const signinRedirect = () => userManager.signinRedirect();
export const signinCallback = () => userManager.signinRedirectCallback();
export const signoutRedirect = () => userManager.signoutRedirect();
export const getUser = () => userManager.getUser();
