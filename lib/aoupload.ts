"use client";

import { spawn } from "@permaweb/aoconnect";
import { createDataItemSigner } from "@permaweb/aoconnect";
import crypto from "crypto";

// Polyfill crypto for aoconnect library
if (!globalThis.crypto) {
  globalThis.crypto = crypto.webcrypto as any;
}

// AO configuration
const AO_CONFIG = {
  module: "Do_Uc2Sju_ffp6Ev0AnLVdPtot15rvMjP-a9VVaA5fM",
  scheduler: "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA",
  assetSrc: "Fmtgzy1Chs-5ZuUwHpQjQrQ7H7v1fjsP0Bi8jVaDIKA",
  defaultToken: "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10",
  ucm: "U3TjJAZWJjlWBB4KAXSHKzuky81jtyh0zqH8rUL4Wd0",
  pixl: "DM3FoZUq_yebASPhgd8pEIRIzDW6muXEhxz5-JwbZwo",
  collectionsRegistry: "TFWDmf8a3_nw43GCm_CuYlYoylHAjCcFGbgHfDaGcsg",
  collectionSrc: "2ZDuM2VUCN8WHoAKOOjiH4_7Apq0ZHKnTWdLppxCdGY",
  profileRegistry: "SNy4m-DrqxWl01YqGM4sxI8qCni-58re8uuJLvZPypY",
  profileSrc: "_R2XYWDPUXVvQrQKFaQRvDTDcDwnQNbqlTd_qvCRSpQ",
  collection: "PxzVQgaVXhtwiM7J6Eljk-D8g1WKp9f8Ke4PjgAA10mc",
} as const;

export const AO = AO_CONFIG;

export async function uploadFileAO(
  file: File,
  title = "MEKA Asset",
  description = "MEKA Human Asset"
) {
  try {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      throw new Error('This function must be called from the browser');
    }

    // Check for Arweave wallet
    if (!window.arweaveWallet) {
      throw new Error('Arweave wallet not found. Please install Arweave wallet extension.');
    }

    // Get file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("File buffer size:", buffer.length, "bytes");

    // Get wallet from window.arweaveWallet
    const wallet = await window.arweaveWallet;
    const signer = createDataItemSigner(wallet);
    console.log("signer created");

    // spawn process to upload file data to Arweave
    console.log("Uploading file to Arweave...");
    const assetProcess = await spawn({
      module: AO_CONFIG.module,
      scheduler: AO_CONFIG.scheduler,
      signer: signer,
      tags: [
        { name: "App-Name", value: "Mekahuman" },
        { name: "Implements", value: "ANS-110" },
        { name: "Content-Type", value: file.type || "application/octet-stream" },
        { name: "Title", value: title },
        { name: "Description", value: description },
      ],
      data: buffer as any  // Using raw buffer for proper Arweave upload
    });

    console.log("assetProcess created with ID:", assetProcess);
    return assetProcess; // This is your transaction ID (xid)
  } catch (error) {
    console.error("Error uploading file to Arweave:", error);
    throw error;
  }
}

// Example usage:
/*
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    try {
      const xid = await uploadFileToArweave(file, "My File", "Description");
      console.log('File uploaded! Transaction ID:', xid);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }
};
*/
