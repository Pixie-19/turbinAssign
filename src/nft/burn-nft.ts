
import bs58 from "bs58";
import {
  burn,
  fetchAsset,
} from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";
import { loadUmi, requiredEnv } from "../config.js";

const umi = loadUmi();

const assetAddress = publicKey(
  requiredEnv("NFT_ASSET_ADDRESS")
);

// Fetch the NFT asset from Devnet.
const asset = await fetchAsset(umi, assetAddress);

// Burn the NFT permanently.
const result = await burn(umi, {
  asset,
}).sendAndConfirm(umi);

console.log("NFT burn confirmed.");

console.log(
  "Transaction signature:",
  bs58.encode(result.signature)
);

console.log(
  "Explorer:",
  `https://explorer.solana.com/tx/${bs58.encode(result.signature)}?cluster=devnet`
);
