import fs from "node:fs";
import bs58 from "bs58";
import { create, fetchAsset } from "@metaplex-foundation/mpl-core";
import { generateSigner, publicKey } from "@metaplex-foundation/umi";
import { PublicKey } from "@solana/web3.js";
import {
  loadUmi,
  requiredEnv,
  rpcUrl,
  waitForAccount,
  waitForTransactionConfirmation,
} from "../config.js";

const umi = loadUmi();
const name = process.env.NFT_NAME || "Devnet Builder Badge";
const uri = requiredEnv("NFT_URI");
if (!uri.startsWith("https://") && !uri.startsWith("http://")) {
  throw new Error("NFT_URI must be an accessible HTTP(S) URL.");
}

const evidencePath = process.env.NFT_MINT_EVIDENCE_PATH || ".nft-mint-evidence.json";
const existingAssetAddress = process.env.NFT_ASSET_ADDRESS?.trim();

if (existingAssetAddress) {
  const existingAddress = new PublicKey(existingAssetAddress);
  await waitForAccount(existingAddress);
  const existingAsset = await fetchAsset(umi, publicKey(existingAssetAddress));
  console.log("Existing Core NFT found; refusing to mint a duplicate.");
  console.log("Asset address:", existingAsset.publicKey);
  console.log("Owner:", existingAsset.owner);
  console.log(
    "Explorer:",
    `https://explorer.solana.com/address/${existingAsset.publicKey}?cluster=devnet`
  );
} else if (fs.existsSync(evidencePath)) {
  throw new Error(
    `Mint evidence exists at ${evidencePath}. Investigate that transaction before minting again. ` +
      "Set NFT_ASSET_ADDRESS to the recorded asset address once verified."
  );
} else {
  const assetSigner = generateSigner(umi);
  const assetAddress = assetSigner.publicKey;
  const result = await create(umi, {
    asset: assetSigner,
    name,
    uri,
  }).send(umi);
  const signature = bs58.encode(result);

  console.log("Core NFT transaction submitted.");
  console.log("RPC endpoint:", rpcUrl);
  console.log("Asset address:", assetAddress);
  console.log("Transaction signature:", signature);
  console.log(
    "Explorer:",
    `https://explorer.solana.com/tx/${signature}?cluster=devnet`
  );

  fs.writeFileSync(
    evidencePath,
    JSON.stringify(
      {
        assetAddress,
        signature,
        rpcUrl,
        submittedAt: new Date().toISOString(),
      },
      null,
      2
    ) + "\n"
  );

  await waitForTransactionConfirmation(signature);
  await waitForAccount(new PublicKey(assetAddress));
  const asset = await fetchAsset(umi, assetAddress);

  console.log("Core NFT mint confirmed and verified.");
  console.log("Owner:", asset.owner);
  console.log("Name:", asset.name);
  console.log("Metadata URI:", asset.uri);
  console.log(
    "Explorer:",
    `https://explorer.solana.com/address/${assetAddress}?cluster=devnet`
  );
  console.log("Save NFT_ASSET_ADDRESS in .env before update/transfer/burn.");
}
