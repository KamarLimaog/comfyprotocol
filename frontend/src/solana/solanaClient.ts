import { clusterApiUrl, Connection } from "@solana/web3.js";

export const SOLANA_CLUSTER = "devnet" as const;
export const SOLANA_RPC_URL =
  import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl(SOLANA_CLUSTER);

export function createSolanaConnection() {
  return new Connection(SOLANA_RPC_URL, "confirmed");
}

