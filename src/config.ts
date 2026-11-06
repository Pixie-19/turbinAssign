import "dotenv/config";
import fs from "node:fs";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createSignerFromKeypair, keypairIdentity } from "@metaplex-foundation/umi";
import { mplCore } from "@metaplex-foundation/mpl-core";

export const rpcUrl = process.env.RPC_URL || clusterApiUrl("devnet");
export const connection = new Connection(rpcUrl, "confirmed");

export function loadSolanaKeypair(): Keypair {
  const path = process.env.KEYPAIR_PATH || "./wallet.json";
  if (!fs.existsSync(path)) {
    throw new Error(`Keypair file not found at ${path}. Create a Devnet-only wallet and set KEYPAIR_PATH.`);
  }
  const secret = JSON.parse(fs.readFileSync(path, "utf8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}. Set it in your .env file.`);
  return value;
}

export function loadUmi() {
  const umi = createUmi(rpcUrl).use(mplCore());
  const solanaKeypair = loadSolanaKeypair();
  const umiKeypair = umi.eddsa.createKeypairFromSecretKey(solanaKeypair.secretKey);
  const signer = createSignerFromKeypair(umi, umiKeypair);
  umi.use(keypairIdentity(signer));
  return umi;
}

export function publicKeyFromEnv(name: string): PublicKey {
  return new PublicKey(requiredEnv(name));
}
