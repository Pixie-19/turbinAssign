# Solana Asset Lifecycle Toolkit

A TypeScript learning project for Solana Devnet covering:
1. Create an SPL fungible-token mint.
2. Mint tokens and transfer tokens to a second wallet.
3. Mint an NFT using Metaplex Core.
4. Update the Core asset's name and metadata URI.
5. Transfer NFT ownership and burn the NFT, verifying the result.

> **Safety:** Devnet only. Never commit wallet keypairs, `.env`, seed phrases, or private keys. Burning an NFT is irreversible.

## Requirements

- Node.js 20 or newer
- npm
- Solana CLI (recommended for creating/funding test wallets)
- A Devnet payer wallet with test SOL
- A second Devnet wallet for recipient tests
- Publicly reachable metadata JSON URLs

## Install

```bash
npm install
cp .env.example .env
```

Create a **Devnet-only** wallet if you do not already have one:

```bash
solana-keygen new --outfile ./wallet.json
solana config set --url devnet
solana airdrop 2
solana address -k ./wallet.json
```

Set `KEYPAIR_PATH` to the existing wallet path in the environment where the command runs. The loader accepts absolute paths, project-relative paths, and Git Bash drive paths:

- WSL Ubuntu: `KEYPAIR_PATH=/home/rishita/assignment-wallet.json`
- Windows Git Bash or PowerShell: keep that same WSL path; the loader accesses it through `\\wsl$\\Ubuntu\\home\\rishita\\assignment-wallet.json`
- A wallet stored on Windows: use a Windows path such as `KEYPAIR_PATH=C:\\Users\\you\\wallet.json`

If the WSL distribution has another name, set `WSL_DISTRO` to that exact name. For example, `WSL_DISTRO=Ubuntu-22.04`. `wallet.json` is ignored by Git. Do not upload or copy it.

Create a second wallet for receiving:

```bash
solana-keygen new --outfile ./recipient.json
solana airdrop 1 "$(solana address -k ./recipient.json)" --url devnet
```

Use the second wallet's public address as `RECIPIENT_WALLET` in `.env`. The scripts only need the payer keypair path; keep the recipient keypair safely separate until it becomes the NFT owner.

## Metadata URL setup

The NFT's metadata URI must be a publicly reachable JSON URL. Before minting:
1. Create a GitHub repository and push this project.
2. Replace `YOUR_GITHUB_USERNAME` in both `metadata/nft.json` and `metadata/nft-updated.json` with your GitHub username and exact repository name.
3. Update `NFT_URI` and `NFT_UPDATED_URI` in `.env` to the corresponding `raw.githubusercontent.com` URLs.
4. Open both URLs in a browser and confirm they return JSON, not a GitHub HTML page or 404.

For a production project, use durable decentralized storage such as Arweave/IPFS and pin the content. GitHub raw URLs are convenient for a Devnet demo but are not an immutable storage guarantee.

## Configure

Example `.env`:

```dotenv
RPC_URL=https://api.devnet.solana.com
KEYPAIR_PATH=./wallet.json
WSL_DISTRO=Ubuntu
TOKEN_DECIMALS=6
TOKEN_MINT_ADDRESS=
RECIPIENT_WALLET=PASTE_SECOND_WALLET_PUBLIC_KEY
NFT_NAME=Devnet Builder Badge
NFT_URI=https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/solana-asset-lifecycle/main/metadata/nft.json
NFT_ASSET_ADDRESS=
NFT_MINT_EVIDENCE_PATH=.nft-mint-evidence.json
NFT_UPDATED_NAME=Devnet Builder Badge - Updated
NFT_UPDATED_URI=https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/solana-asset-lifecycle/main/metadata/nft-updated.json
```

## Task 1 — Create an SPL token

```bash
npm run spl:create
```

Copy the printed mint address into `TOKEN_MINT_ADDRESS` in `.env`. The mint authority is the payer wallet. The default decimals are six.

Verify the mint on Solana Explorer using the printed Devnet link.

## Task 1 — Mint tokens

```bash
npm run spl:mint
```

This creates the payer's associated token account if needed and mints 1,000 whole tokens by default. `MINT_AMOUNT` can be set in `.env` or the shell if you want a different amount.

The script prints the mint supply in base units and a transaction link. With six decimals, 1,000 tokens correspond to 1,000,000,000 base units.

## Task 1 — Transfer tokens

```bash
npm run spl:transfer
```

The script creates the recipient's associated token account if needed, transfers 100 whole tokens by default, and prints both token-account balances. `TRANSFER_AMOUNT` can override the default.

Verify that:
- The sender's balance decreased by the transfer amount.
- The recipient's balance increased by the same amount.
- The mint's total supply did not change.

## Task 2 — Mint a Metaplex Core NFT

After the metadata URLs are reachable:

```bash
npm run nft:mint
```

The script prints the asset address and transaction signature immediately after submission, waits for confirmation and account visibility, then fetches the asset. It records submission evidence in `.nft-mint-evidence.json` and refuses to mint again while that evidence exists. Copy the verified asset address into `NFT_ASSET_ADDRESS` in `.env` before rerunning any lifecycle command.

This is a **Metaplex Core asset**, not a Token Metadata NFT. Core assets use a different account model and SDK.

## Task 3 — Update metadata

```bash
npm run nft:update
```

The script fetches the asset before the update, checks that the configured wallet is its address update authority, submits the new name and URI, and fetches the asset again to show the changed values.

Verify:
- The transaction is confirmed on Devnet Explorer.
- The asset's name and URI match the updated values.
- The new metadata URL returns valid JSON.

## Task 4 — Transfer NFT ownership

```bash
npm run nft:transfer
```

This transfers the Core asset to `RECIPIENT_WALLET`. Verify the new owner on-chain and with the printed transaction link.

**Important:** after transfer, the original wallet is no longer the owner. Do not try to burn the NFT using the old owner keypair.

## Task 5 — Burn the NFT and verify

First, make sure you are comfortable permanently destroying the test asset. If the asset has already been transferred, set `KEYPAIR_PATH` to the recipient's keypair file before running the burn script. The same WSL/Windows path rules above apply.

```bash
npm run nft:burn
npm run nft:verify
```

The burn instruction is irreversible. Check the transaction on Devnet Explorer. The asset account should no longer be fetchable after the burn is finalized. The Core program returns the applicable rent deposit to the burn transaction's payer, less any protocol/accounting amount retained by the program and transaction fees. The exact net recovery can vary.

## Evidence checklist

Record these values in your final README or submission:
- [ ] SPL mint address and Explorer link
- [ ] SPL mint transaction signature and total supply
- [ ] SPL transfer signature and sender/recipient balances
- [ ] Core NFT asset address and mint signature
- [ ] Before/after metadata and update signature
- [ ] NFT transfer signature and verified new owner
- [ ] NFT burn signature and post-burn verification
- [ ] Screenshots of relevant Explorer pages (optional but helpful)

Use Devnet Explorer URLs in the form:

`https://explorer.solana.com/address/ADDRESS?cluster=devnet`

`https://explorer.solana.com/tx/SIGNATURE?cluster=devnet`

## Troubleshooting

- **Insufficient funds:** request Devnet SOL for the payer wallet; public airdrops can be rate-limited.
- **Metadata URL returns 404:** check the repository name, branch, file path, and raw URL.
- **Invalid authority:** use the wallet that owns the asset for transfer/burn and the configured update authority for metadata updates.
- **Asset fetch fails immediately after a transaction:** wait for finalization and retry.
- **Burn appears to fail verification:** check the burn signature and allow the Devnet RPC to catch up before treating a fetch error as proof of burn.

## Technical references

- Solana token quickstart: https://solana.com/docs/tokens/quickstart
- Metaplex Core JavaScript SDK: https://www.metaplex.com/docs/smart-contracts/core/sdk/javascript
- Metaplex Core update: https://www.metaplex.com/docs/smart-contracts/core/update
- Metaplex Core transfer: https://www.metaplex.com/docs/smart-contracts/core/transfer
- Metaplex Core burn: https://www.metaplex.com/docs/smart-contracts/core/burn
