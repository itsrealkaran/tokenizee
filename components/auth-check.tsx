"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useGlobal } from "@/context/global-context";
import { Loader2 } from "lucide-react";

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, user } = useGlobal();
  const [isLoading, setIsLoading] = useState(true);
  const [authCheckAttempts, setAuthCheckAttempts] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      // If not logged in or no user, wait a bit and check again
      if (!isLoggedIn || !user) {
        if (authCheckAttempts < 3) {
          // Try up to 3 times
          setAuthCheckAttempts((prev) => prev + 1);
          // Wait for 1 second before next attempt
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return;
        }

        // After 3 attempts, if still not authenticated, redirect to home
        if (pathname !== "/") {
          sessionStorage.setItem("redirectPath", pathname);
        }
        router.push("/");
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isLoggedIn, user, router, pathname, authCheckAttempts]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return null;
  }

  return <>{children}</>;
}
