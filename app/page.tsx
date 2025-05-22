"use client";

import { useState } from "react";
import { RegisterModal } from "@/components/modals/register-modal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useGlobal } from "./context/global-context";

export default function Home() {
  const router = useRouter();
  const { isLoggedIn, setIsLoggedIn } = useGlobal();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary-100">
      {!isLoggedIn ? (
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Tokenizee</h1>
          <p className="text-lg text-muted-foreground">
            Join our community of content creators
          </p>
          <Button onClick={handleLogin}>Get Started</Button>
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
            onSubmit={() => {
              router.push("/dashboard");
            }}
          />
        </div>
      )}
    </div>
  );
}
