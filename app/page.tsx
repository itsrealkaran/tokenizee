"use client";

import { useState, useEffect } from "react";
import { RegisterModal } from "@/components/modals/register-modal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useGlobal } from "@/context/global-context";
import ConnectWallet from "@/components/ui/connect";
export default function Home() {
  const router = useRouter();
  const { isLoggedIn, setIsLoggedIn, user, setUser, walletConnected, walletAddress } =
    useGlobal();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user) {
      router.push("/feed");
    }
  }, [isLoggedIn, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary-100">
      {!walletConnected ? (
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Tokenizee</h1>
          <p className="text-lg text-muted-foreground">
            Join our community of content creators
          </p>
          <ConnectWallet />
        </div>
      ) : (
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Welcome to Tokenizee</h1>
          <p className="text-lg text-muted-foreground">
            Complete your profile to get started
          </p>
          <Button onClick={() => setIsRegisterModalOpen(true)}>
            Complete Onboarding
          </Button>
          <RegisterModal
            isOpen={isRegisterModalOpen}
            onClose={() => {
              setIsRegisterModalOpen(false);
            }}
            onSubmit={(data) => {
              setUser({
                ...data,
                walletAddress: walletAddress || "",
                followers: [],
                following: [],
                score: 0,
              });
              setIsLoggedIn(true);
              console.log("User logged in:", user);
              router.push("/feed");
            }}
          />
        </div>
      )}
    </div>
  );
}
