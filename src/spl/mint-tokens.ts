import { getOrCreateAssociatedTokenAccount, mintTo, getMint } from "@solana/spl-token";
import { connection, loadSolanaKeypair, publicKeyFromEnv } from "../config.js";

const payer = loadSolanaKeypair();
const mint = publicKeyFromEnv("TOKEN_MINT_ADDRESS");
const decimals = Number(process.env.TOKEN_DECIMALS ?? "6");
const wholeTokens = BigInt(process.env.MINT_AMOUNT ?? "1000");
if (wholeTokens <= 0n) throw new Error("MINT_AMOUNT must be positive.");

const ata = await getOrCreateAssociatedTokenAccount(connection, payer, mint, payer.publicKey);
const rawAmount = wholeTokens * (10n ** BigInt(decimals));
const signature = await mintTo(connection, payer, mint, ata.address, payer, rawAmount);
const mintInfo = await getMint(connection, mint);

console.log("Mint transaction:", signature);
console.log("Token account:", ata.address.toBase58());
console.log("Total supply (base units):", mintInfo.supply.toString());
console.log("Decimals:", mintInfo.decimals);
console.log("Explorer:", `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
