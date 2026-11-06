import { fetchAsset } from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";
import { loadUmi, requiredEnv } from "../config.js";

const umi = loadUmi();
const assetAddress = publicKey(requiredEnv("NFT_ASSET_ADDRESS"));

try {
  const asset = await fetchAsset(umi, assetAddress);
  console.log("Asset exists.");
  console.log({
    address: asset.publicKey,
    name: asset.name,
    uri: asset.uri,
    owner: asset.owner,
    updateAuthority: asset.updateAuthority
  });
} catch (error) {
  console.log("Could not fetch asset. If you just burned it, verify the burn transaction signature on Devnet Explorer.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
