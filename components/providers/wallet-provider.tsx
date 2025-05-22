"use client";

import React from "react";
import { ArweaveWalletKit } from "arweave-wallet-kit";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <React.StrictMode>
      <ArweaveWalletKit>{children}</ArweaveWalletKit>
    </React.StrictMode>
  );
}
