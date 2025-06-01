"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useGlobal } from "@/context/global-context";
import { Loader2, AlertCircle } from "lucide-react";

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, user } = useGlobal();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkAuth = async () => {
      try {
        // If not logged in or no user, wait a bit and check again
        if (!isLoggedIn || !user) {
          // Set a timeout to show loading state
          timeoutId = setTimeout(() => {
            if (!isLoggedIn || !user) {
              setError("Authentication required");
              // Store the current path for redirect after login
              if (pathname !== "/") {
                sessionStorage.setItem("redirectPath", pathname);
              }
              router.push("/");
            }
          }, 2000); // Wait 2 seconds before redirecting
        } else {
          setIsLoading(false);
          setError(null);
        }
      } catch (err) {
        setError("Authentication check failed");
        console.error("Auth check error:", err);
      }
    };

    checkAuth();

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoggedIn, user, router, pathname]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
          <p className="text-destructive font-medium">{error}</p>
          <p className="text-sm text-muted-foreground">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

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
