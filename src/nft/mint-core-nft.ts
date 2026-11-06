import bs58 from "bs58";
import { create, fetchAsset } from "@metaplex-foundation/mpl-core";
import { generateSigner } from "@metaplex-foundation/umi";
import { loadUmi, requiredEnv } from "../config.js";

const umi = loadUmi();
const name = process.env.NFT_NAME || "Devnet Builder Badge";
const uri = requiredEnv("NFT_URI");
if (!uri.startsWith("https://") && !uri.startsWith("http://")) {
  throw new Error("NFT_URI must be an accessible HTTP(S) URL.");
}

const assetSigner = generateSigner(umi);
const result = await create(umi, {
  asset: assetSigner,
  name,
  uri
}).sendAndConfirm(umi);

const assetAddress = assetSigner.publicKey;
const asset = await fetchAsset(umi, assetAddress);
console.log("Core NFT minted.");
console.log("Asset address:", assetAddress);
console.log("Owner:", asset.owner);
console.log("Name:", asset.name);
console.log("Metadata URI:", asset.uri);
console.log("Transaction signature:", bs58.encode(result.signature));
console.log("Explorer:", `https://explorer.solana.com/address/${assetAddress}?cluster=devnet`);
console.log("Save NFT_ASSET_ADDRESS in .env before update/transfer/burn.");
