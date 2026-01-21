import { RootState } from "@/store/reduxStore";
import { useSelector } from "react-redux";

export const useGetUserInfo = () => {
  const user = useSelector((state: RootState) => state.userDetail.oidc_user);
  const fullName = user?.profile?.name || "";
  const email = user?.profile?.email || "";
  const scopes = user?.scopes || [];  

  return { fullName, email };
};
