import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createSignerFromKeypair, keypairIdentity } from "@metaplex-foundation/umi";
import { mplCore } from "@metaplex-foundation/mpl-core";

export const rpcUrl = process.env.RPC_URL || clusterApiUrl("devnet");
export const connection = new Connection(rpcUrl, "confirmed");

const sleep = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function waitForTransactionConfirmation(
  signature: string,
  attempts = 12
): Promise<void> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const status = (
      await connection.getSignatureStatuses([signature], {
        searchTransactionHistory: true,
      })
    ).value[0];

    if (status?.err) {
      throw new Error(
        `Transaction ${signature} failed on Devnet: ${JSON.stringify(status.err)}`
      );
    }

    if (
      status?.confirmationStatus === "confirmed" ||
      status?.confirmationStatus === "finalized"
    ) {
      return;
    }

    await sleep(500 * 2 ** attempt);
  }

  throw new Error(
    `Transaction ${signature} was not confirmed after ${attempts} checks. ` +
      `Inspect it on Devnet before retrying.`
  );
}

export async function waitForAccount(
  address: PublicKey,
  attempts = 10
): Promise<void> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const account = await connection.getAccountInfo(address, "confirmed");
    if (account) return;
    await sleep(500 * 2 ** attempt);
  }

  throw new Error(
    `Account ${address.toBase58()} was not visible on Devnet after ${attempts} checks.`
  );
}

export function resolveKeypairPath(configuredPath: string): string {
  const trimmedPath = configuredPath.trim();

  if (process.platform !== "win32") {
    return path.isAbsolute(trimmedPath)
      ? trimmedPath
      : path.resolve(process.cwd(), trimmedPath);
  }

  if (/^\/(?:home|root)\//.test(trimmedPath)) {
    const distro = process.env.WSL_DISTRO?.trim() || "Ubuntu";
    return `\\\\wsl$\\${distro}${trimmedPath.replace(/\//g, "\\")}`;
  }

  const gitBashDrivePath = trimmedPath.match(/^\/([a-zA-Z])\/(.*)$/);
  if (gitBashDrivePath) {
    return `${gitBashDrivePath[1].toUpperCase()}:\\${gitBashDrivePath[2].replace(
      /\//g,
      "\\"
    )}`;
  }

  return path.win32.isAbsolute(trimmedPath)
    ? trimmedPath
    : path.resolve(process.cwd(), trimmedPath);
}

export function loadSolanaKeypair(): Keypair {
  const configuredPath = process.env.KEYPAIR_PATH || "./wallet.json";
  const keypairPath = resolveKeypairPath(configuredPath);
  if (!fs.existsSync(keypairPath)) {
    throw new Error(
      `Keypair file not found at configured KEYPAIR_PATH=${configuredPath}. ` +
        "On Windows, confirm WSL is running and WSL_DISTRO matches the wallet's distribution."
    );
  }
  const secret = JSON.parse(fs.readFileSync(keypairPath, "utf8")) as number[];
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
