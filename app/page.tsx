"use client";

import { useState, useEffect } from "react";
import { RegisterModal } from "@/components/modals/register-modal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useGlobal } from "@/context/global-context";
import ConnectWallet from "@/components/ui/connect";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const {
    isLoggedIn,
    setIsLoggedIn,
    user,
    walletConnected,
    walletAddress,
    checkUserExists,
    registerUser,
  } = useGlobal();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);

  // Redirect to feed if already logged in
  useEffect(() => {
    if (isLoggedIn && user) {
      router.push("/feed");
    }
  }, [isLoggedIn, user, router]);

  // Check for existing user when wallet is connected
  useEffect(() => {
    const checkExistingUser = async () => {
      if (walletConnected && walletAddress && !isLoggedIn) {
        setIsCheckingUser(true);
        try {
          const exists = await checkUserExists({ wallet: walletAddress });
          if (exists) {
            router.push("/feed");
          } else {
            // If user doesn't exist, show registration modal
            setIsRegisterModalOpen(true);
          }
        } catch (error) {
          console.error("Error checking existing user:", error);
        } finally {
          setIsCheckingUser(false);
        }
      }
    };

    checkExistingUser();
  }, [walletConnected, walletAddress, isLoggedIn, checkUserExists, router]);

  // Handle registration
  const handleRegister = async (data: {
    username: string;
    displayName: string;
    dateOfBirth: string;
    bio: string;
  }) => {
    try {
      const success = await registerUser(
        data.username,
        data.displayName,
        data.dateOfBirth,
        data.bio
      );
      if (success) {
        setIsRegisterModalOpen(false);
        setIsLoggedIn(true);
        router.push("/feed");
      }
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary-100">
      {!walletConnected ? (
        // Initial page - Wallet not connected
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Tokenizee</h1>
          <p className="text-lg text-muted-foreground">
            Join our community of content creators
          </p>
          <ConnectWallet />
        </div>
      ) : isCheckingUser ? (
        // Loading state while checking user
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Welcome to Tokenizee</h1>
          <p className="text-lg text-muted-foreground">
            Checking your profile...
          </p>
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        </div>
      ) : (
        // Registration page - Wallet connected but no user
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
            onClose={() => setIsRegisterModalOpen(false)}
            onSubmit={handleRegister}
          />
        </div>
      )}
    </div>
  );
}
