import { getOrCreateAssociatedTokenAccount, transfer, getAccount } from "@solana/spl-token";
import { connection, loadSolanaKeypair, publicKeyFromEnv, requiredEnv } from "../config.js";

const payer = loadSolanaKeypair();
const mint = publicKeyFromEnv("TOKEN_MINT_ADDRESS");
const recipient = publicKeyFromEnv("RECIPIENT_WALLET");
const decimals = Number(process.env.TOKEN_DECIMALS ?? "6");
const wholeTokens = BigInt(process.env.TRANSFER_AMOUNT ?? "100");
if (wholeTokens <= 0n) throw new Error("TRANSFER_AMOUNT must be positive.");

const senderAta = await getOrCreateAssociatedTokenAccount(connection, payer, mint, payer.publicKey);
const recipientAta = await getOrCreateAssociatedTokenAccount(connection, payer, mint, recipient);
const rawAmount = wholeTokens * (10n ** BigInt(decimals));
const signature = await transfer(connection, payer, senderAta.address, recipientAta.address, payer, rawAmount);
const senderAfter = await getAccount(connection, senderAta.address);
const recipientAfter = await getAccount(connection, recipientAta.address);

console.log("Transfer signature:", signature);
console.log("Sender token account:", senderAta.address.toBase58());
console.log("Sender balance (base units):", senderAfter.amount.toString());
console.log("Recipient:", recipient.toBase58());
console.log("Recipient token account:", recipientAta.address.toBase58());
console.log("Recipient balance (base units):", recipientAfter.amount.toString());
console.log("Explorer:", `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
