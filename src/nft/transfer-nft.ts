
import bs58 from "bs58";
import {
  fetchAsset,
  transfer,
} from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";
import { loadUmi, requiredEnv } from "../config.js";

const umi = loadUmi();

const assetAddress = publicKey(
  requiredEnv("NFT_ASSET_ADDRESS")
);

const newOwner = publicKey(
  requiredEnv("NFT_NEW_OWNER")
);

// Fetch the NFT asset from Devnet.
const asset = await fetchAsset(umi, assetAddress);

// Transfer NFT ownership.
const result = await transfer(umi, {
  asset,
  newOwner,
}).sendAndConfirm(umi);

console.log("NFT transfer confirmed.");
console.log("NFT address:", assetAddress);
console.log("New owner:", newOwner);

console.log(
  "Transaction signature:",
  bs58.encode(result.signature)
);

console.log(
  "Explorer:",
  `https://explorer.solana.com/tx/${bs58.encode(result.signature)}?cluster=devnet`
);
