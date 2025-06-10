"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobal } from "@/context/global-context";
import {
  RegisterModal,
  RegisterFormData,
} from "@/components/modals/register-modal";
import { Button } from "@/components/ui/button";

export default function Onboarding() {
  const router = useRouter();
  const { isLoggedIn, user, walletConnected } = useGlobal();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(true);

  // Redirect if not connected or already logged in
  useEffect(() => {
    if (!walletConnected) {
      router.push("/");
    } else if (isLoggedIn && user) {
      router.push("/feed");
    }
  }, [walletConnected, isLoggedIn, user, router]);

  // Handle registration
  const handleRegister = async (data: RegisterFormData) => {
    try {
      // The registerUser function is now called directly from the RegisterModal
      // This handler is kept for any additional onboarding-specific logic
      setIsRegisterModalOpen(false);
      const redirectPath = sessionStorage.getItem("redirectPath");
      if (redirectPath) {
        sessionStorage.removeItem("redirectPath");
        router.push(redirectPath);
      } else {
        router.push("/feed");
      }
    } catch (error) {
      console.error("Error in onboarding process:", error);
    }
  };

  if (!walletConnected) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary-100 p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Welcome to Tokenizee
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground px-4">
            Complete your profile to get started
          </p>
        </div>
        <div className="w-full max-w-sm mx-auto">
          <Button
            onClick={() => setIsRegisterModalOpen(true)}
            size="lg"
            className="w-full"
          >
            Complete Onboarding
          </Button>
        </div>
        <RegisterModal
          isOpen={isRegisterModalOpen}
          isEditing={false}
          onClose={() => setIsRegisterModalOpen(false)}
          onSubmit={handleRegister}
        />
      </div>
    </div>
  );
}
