"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobal } from "@/context/global-context";
import ConnectWallet from "@/components/ui/connect";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isLoggedIn, user, walletConnected, walletAddress, checkUserExists } =
    useGlobal();

  // Handle redirect after successful login
  useEffect(() => {
    if (isLoggedIn && user) {
      const redirectPath = sessionStorage.getItem("redirectPath");
      if (redirectPath) {
        sessionStorage.removeItem("redirectPath");
        router.push(redirectPath);
      } else {
        router.push("/feed");
      }
    }
  }, [isLoggedIn, user, router]);

  // Check for existing user when wallet is connected
  useEffect(() => {
    let isMounted = true;

    const checkExistingUser = async () => {
      if (walletConnected && walletAddress && !isLoggedIn) {
        try {
          const exists = await checkUserExists({ wallet: walletAddress });
          if (exists && isMounted) {
            const redirectPath = sessionStorage.getItem("redirectPath");
            if (redirectPath) {
              sessionStorage.removeItem("redirectPath");
              router.push(redirectPath);
            } else {
              router.push("/feed");
            }
          } else if (isMounted) {
            router.push("/onboarding");
          }
        } catch (error) {
          console.error("Error checking existing user:", error);
        }
      }
    };

    checkExistingUser();

    return () => {
      isMounted = false;
    };
  }, [walletConnected, walletAddress, isLoggedIn, checkUserExists, router]);
  console.log(isLoggedIn, user);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary-100 p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Tokenizee
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground px-4">
            Join our community of content creators
          </p>
        </div>
        <div className="w-full max-w-sm mx-auto">
          <ConnectWallet />
        </div>
      </div>
    </div>
  );
}
