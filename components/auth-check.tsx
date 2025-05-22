"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGlobal } from "@/context/global-context";

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoggedIn, user } = useGlobal();

  useEffect(() => {
    if (!isLoggedIn || !user) {
      router.push("/");
    }
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || !user) {
    return null;
  }

  return <>{children}</>;
}
