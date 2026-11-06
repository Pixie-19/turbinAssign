
import bs58 from "bs58";
import {
  fetchAsset,
  update,
} from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";
import { loadUmi, requiredEnv } from "../config.js";

const umi = loadUmi();

const assetAddress = publicKey(
  requiredEnv("NFT_ASSET_ADDRESS")
);

const newName = requiredEnv("NFT_UPDATED_NAME");
const newUri = requiredEnv("NFT_UPDATED_URI");

// Fetch the NFT asset from Devnet.
const asset = await fetchAsset(umi, assetAddress);

// Verify that the current wallet is the update authority.
if (
  asset.updateAuthority.type !== "Address" ||
  asset.updateAuthority.address !== umi.identity.publicKey
) {
  throw new Error(
    "Current wallet does not appear to be the asset update authority. Check the asset and signer."
  );
}

// Update NFT metadata.
const result = await update(umi, {
  asset,
  name: newName,
  uri: newUri,
}).sendAndConfirm(umi);

// Fetch updated NFT to verify changes.
const after = await fetchAsset(umi, assetAddress);

console.log("Metadata update confirmed.");
console.log("Before:", {
  name: asset.name,
  uri: asset.uri,
});
console.log("After:", {
  name: after.name,
  uri: after.uri,
});

console.log(
  "Transaction signature:",
  bs58.encode(result.signature)
);

console.log(
  "Explorer:",
  `https://explorer.solana.com/tx/${bs58.encode(result.signature)}?cluster=devnet`
);
