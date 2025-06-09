import { readFileSync } from "fs";
import crypto from "crypto";
import Arweave from "arweave";

// Polyfill crypto for aoconnect library
if (!globalThis.crypto ) {
  globalThis.crypto = crypto.webcrypto as any;
}

export const AO = {
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
};

// Function to upload video to Arweave and return transaction ID
export const uploadVideoToArweave = async (
  videoPath: string,
  title = "MEKA Video",
  description = "MEKA Human Video Asset"
) => {
  try {
    // Create Arweave instance
    const arweave = Arweave.init({
      host: "arweave.net",
      port: 443,
      protocol: "https",
    });

    // Load wallet
    let wallet;
    try {
      const walletFile = readFileSync("app/actions/jwk.json");
      wallet = JSON.parse(walletFile.toString());
      console.log("Arweave wallet loaded successfully");
    } catch (error) {
      console.error("Error loading wallet:", error);
      throw error;
    }

    // Read video file
    const buffervid = readFileSync(videoPath);
    console.log("Video buffer size:", buffervid.length, "bytes");

    // Create a transaction
    const transaction = await arweave.createTransaction(
      {
        data: buffervid,
      },
      wallet
    );

    // Add tags
    transaction.addTag("App-Name", "Mekahuman");
    transaction.addTag("Implements", "ANS-110");
    transaction.addTag("Content-Type", "video/mp4");
    transaction.addTag("Title", title);
    transaction.addTag("Description", description);
    transaction.addTag("Tags", "meka,video,nft");

    // Sign the transaction
    await arweave.transactions.sign(transaction, wallet);
    console.log("Transaction signed successfully");

    // Submit the transaction
    const response = await arweave.transactions.post(transaction);
    console.log("Transaction submitted:", response.status);

    if (response.status === 200) {
      console.log("Transaction ID:", transaction.id);
      return `https://arweave.net/${transaction.id}`;
    } else {
      throw new Error(`Failed to post transaction: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error uploading video to Arweave:", error);
    throw error;
  }
};

// Example usage - uncomment to test
// uploadVideoToArweave('./src/actions/meka_1.mp4')
//   .then(xid => console.log('Video uploaded! Transaction ID:', xid))
//   .catch(error => console.error('Upload failed:', error));
