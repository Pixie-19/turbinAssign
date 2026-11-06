import { createMint } from "@solana/spl-token";
import { connection, loadSolanaKeypair } from "../config.js";

const payer = loadSolanaKeypair();
const decimals = Number(process.env.TOKEN_DECIMALS ?? "6");
if (!Number.isInteger(decimals) || decimals < 0 || decimals > 9) {
  throw new Error("TOKEN_DECIMALS must be an integer from 0 to 9.");
}

const mint = await createMint(connection, payer, payer.publicKey, payer.publicKey, decimals);
console.log("SPL token mint created on Devnet.");
console.log("Mint address:", mint.toBase58());
console.log("Decimals:", decimals);
console.log("Mint authority:", payer.publicKey.toBase58());
console.log("Explorer:", `https://explorer.solana.com/address/${mint.toBase58()}?cluster=devnet`);
console.log("Next: copy this mint address into TOKEN_MINT_ADDRESS in .env.");
