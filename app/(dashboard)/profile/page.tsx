"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobal } from "@/context/global-context";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useGlobal();

  useEffect(() => {
    console.log("user", user);
    if (user) {
      router.replace(`/profile/${user.username}`);
    }
  }, [user, router]);

  return null;
}
