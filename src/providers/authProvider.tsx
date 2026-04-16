"use client";

import { userManager } from "@/services/authService";
import { setOIDCUser } from "@/store/appSlices";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Loading from "@/app/loading";
import { useRouter } from "next/navigation";
import { User } from "oidc-client-ts";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
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
      try {
        const user = await userManager.getUser();

        if (!isMounted) return;

        if (user && !user.expired) {
          dispatch(setOIDCUser(mapUser(user)));
          setIsLoading(false);
        } else {
          dispatch(setOIDCUser(null));
          router.replace("/");
        }
      } catch (error) {
        console.error("Error loading user:", error);
        if (isMounted) {
          dispatch(setOIDCUser(null));
          router.replace("/");
        }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading />
      </div>
    );
  }

  return <>{children}</>;
}
