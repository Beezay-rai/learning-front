"use client";

import { userManager } from "@/services/authService";
import { setOIDCUser } from "@/store/appSlices";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { User } from "oidc-client-ts";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const mapUser = (user: User) => ({
    access_token: user.access_token,
    id_token: user.id_token,
    expires_at: user.expires_at,
    profile: user.profile,
  });
  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const user = await userManager.getUser();

      if (!isMounted) return;

      if (user && !user.expired) {
        dispatch(setOIDCUser(mapUser(user)));
      } else {
        dispatch(setOIDCUser(null));
        router.replace("/");
      }
    };

    loadUser();

    const onUserLoaded = (user: any) => {
      dispatch(setOIDCUser(mapUser(user)));
    };

    const onUserUnloaded = () => {
      dispatch(setOIDCUser(null));
    };

    userManager.events.addUserLoaded(onUserLoaded);
    userManager.events.addUserUnloaded(onUserUnloaded);

    return () => {
      isMounted = false;
      userManager.events.removeUserLoaded(onUserLoaded);
      userManager.events.removeUserUnloaded(onUserUnloaded);
    };
  }, [dispatch, router]);

  return <>{children}</>;
}
