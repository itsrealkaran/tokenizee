// components/ConnectWallet.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useGlobal } from "@/context/global-context";

const ConnectWallet = () => {
  const { setWalletConnected, setWalletAddress } = useGlobal();

  const connectWallet = async () => {
    try {
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
      console.log("Connected Wallet Address:", address);
    } catch (error) {
      console.error("Failed to connect to Wander Wallet:", error);
    }
  };

  return (
    <div>
      <Button onClick={connectWallet}>Get Started</Button>
    </div>
  );
};

export default ConnectWallet;
