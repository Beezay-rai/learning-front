import { userManager } from "@/services/authService";
import { RootState } from "@/store/reduxStore";
import { useSelector } from "react-redux";

export function useAuth() {
  const auth = useSelector((state: RootState) => state.userDetail);
  return {
    ...auth,
    login: () => userManager.signinRedirect(),
    logout: () => userManager.signoutRedirect(),
    accessToken: auth.oidc_user?.access_token,
    profile: auth.oidc_user?.profile,
  };
}
