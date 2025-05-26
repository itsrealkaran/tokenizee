// components/ConnectWallet.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useGlobal } from "@/context/global-context";
import { toast } from "react-hot-toast";
import { useState } from "react";

const ConnectWallet = () => {
  const { setWalletConnected, setWalletAddress } = useGlobal();
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      if (!window.arweaveWallet) {
        toast.error("Arweave wallet not found.");
        toast.promise(
          new Promise((resolve) => {
            setTimeout(() => {
              window.open("https://www.wander.app/", "_blank");
              resolve(true);
            }, 1000);
          }),
          {
            loading: "Redirecting to Wander Wallet...",
            success: "Redirecting to Wander Wallet...",
          }
        );
        return;
      }

      // Request permissions from the user
      await window.arweaveWallet.connect([
        "ACCESS_ADDRESS",
        "ACCESS_PUBLIC_KEY",
        "ACCESS_ALL_ADDRESSES",
        "SIGN_TRANSACTION",
      ]);

      // Retrieve the active wallet address
      const address = await window.arweaveWallet.getActiveAddress();
      setWalletAddress(address);
      setWalletConnected(true);
      toast.success("Wallet connected successfully!");
      console.log("Connected Wallet Address:", address);
    } catch (error) {
      console.error("Failed to connect to Wander Wallet:", error);
      if (error instanceof Error) {
        console.log((error.toString() === "Failed to connect to Wander Wallet: User cancelled the AuthRequest"), (error.toString() == "Failed to connect to Wander Wallet: User cancelled the AuthRequest"));
        if (error.toString() === "Failed to connect to Wander Wallet: User cancelled the AuthRequest") {
          toast.error("Wallet connection was rejected");
        } else {
          toast.error("Failed to connect wallet. Please try again.");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div>
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        className="min-w-[120px]"
      >
        Get Started
      </Button>
    </div>
  );
};

export default ConnectWallet;
