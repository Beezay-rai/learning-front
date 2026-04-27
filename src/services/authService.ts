"use client";
import { UserManager, UserManagerSettings } from "oidc-client-ts";
const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL;

const config: UserManagerSettings = {
  authority: process.env.NEXT_PUBLIC_IDENTITY_SERVER_URL_DEV ?? "",
  client_id: "admin-portal-client",
  redirect_uri: `${appBaseUrl}/callback`,
  post_logout_redirect_uri: `${appBaseUrl}`,
  automaticSilentRenew: true,
  response_type: "code",
  scope: "openid profile email api.read api.write ",

  // userStore: new WebStorageStateStore({ store: window.localStorage }),
};

export const userManager = new UserManager(config);

export const signinRedirect = () => userManager.signinRedirect();

export const signinCallback = () => userManager.signinRedirectCallback();

export const signoutRedirect = () => userManager.signoutRedirect();
