import { UserDetail } from "@/common/store/appSlices";
import { useSelector } from "react-redux";

export default function useGetUserInfo() {
  const userDetail: UserDetail = useSelector((state: any) => state.userDetail);

  return {
    userDetail,
  };
}
