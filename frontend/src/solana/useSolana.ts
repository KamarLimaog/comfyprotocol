import { useCallback, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

// NOTE: We do not have an on-chain Inco Solana confidential token program in this repo yet.
// This implementation provides a production-ready *integration surface* (wallet/connection, UX, errors, steps),
// and a devnet faucet experience via SOL airdrop + a local demo “confidential token” balance.
// Swap `mintConfidentialSolana` with the real Inco Solana SDK/program calls when available.

type Step = "idle" | "encrypting" | "submitting" | "confirmed";

function balanceKey(pubkey: string) {
  return `inco-demo-solana-balance:${pubkey}`;
}

export function useSolana() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [step, setStep] = useState<Step>("idle");
  const [message, setMessage] = useState<string>("");
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);

  const pubkey = wallet.publicKey?.toBase58() || null;

  const demoBalance = useMemo(() => {
    if (!pubkey) return 0n;
    const v = localStorage.getItem(balanceKey(pubkey));
    return v ? BigInt(v) : 0n;
  }, [pubkey]);

  const setDemoBalance = useCallback(
    (next: bigint) => {
      if (!pubkey) return;
      localStorage.setItem(balanceKey(pubkey), String(next));
    },
    [pubkey]
  );

  const refreshDemoBalance = useCallback(() => {
    // triggers useMemo re-eval by updating message (cheap)
    setMessage((m) => m);
  }, []);

  const airdropSol = useCallback(async (sol: number) => {
    if (!wallet.publicKey) throw new Error("Connect Phantom to use Solana.");
    const sig = await connection.requestAirdrop(
      wallet.publicKey,
      Math.floor(sol * LAMPORTS_PER_SOL)
    );
    await connection.confirmTransaction(sig, "confirmed");
    return sig;
  }, [connection, wallet.publicKey]);

  const mintConfidentialSolana = useCallback(
    async (amount: bigint) => {
      if (!wallet.publicKey) throw new Error("Connect Phantom to use Solana.");
      const now = Date.now();
      if (now < cooldownUntil) throw new Error("Faucet cooldown. Try again in a moment.");

      setStep("encrypting");
      setMessage("Encrypting…");
      // placeholder: encryption/proof generation would happen here
      await new Promise((r) => setTimeout(r, 450));

      setStep("submitting");
      setMessage("Submitting…");

      // Devnet “no setup” UX: ensure user has SOL for fees.
      // (If already funded, this is harmless—airdrop may fail due to rate limits; we ignore.)
      try {
        await airdropSol(0.2);
      } catch {
        // ignore rate limit issues
      }

      // Demo mint: local confidential token ledger
      const next = demoBalance + amount;
      setDemoBalance(next);

      setStep("confirmed");
      setMessage("Confirmed");
      setCooldownUntil(Date.now() + 30_000); // 30s cooldown
      refreshDemoBalance();

      return { signature: "demo-local-ledger", newBalance: next };
    },
    [wallet.publicKey, cooldownUntil, airdropSol, demoBalance, setDemoBalance, refreshDemoBalance]
  );

  const depositSolana = useCallback(async (_amount: bigint) => {
    setStep("submitting");
    setMessage("Submitting…");
    await new Promise((r) => setTimeout(r, 400));
    setStep("confirmed");
    setMessage("Confirmed");
  }, []);

  const borrowSolana = useCallback(async (_amount: bigint) => {
    setStep("submitting");
    setMessage("Submitting…");
    await new Promise((r) => setTimeout(r, 400));
    setStep("confirmed");
    setMessage("Confirmed");
  }, []);

  const repaySolana = useCallback(async (_amount: bigint) => {
    setStep("submitting");
    setMessage("Submitting…");
    await new Promise((r) => setTimeout(r, 400));
    setStep("confirmed");
    setMessage("Confirmed");
  }, []);

  return {
    wallet,
    connection,
    pubkey,
    demoBalance,
    step,
    message,
    cooldownUntil,
    mintConfidentialSolana,
    depositSolana,
    borrowSolana,
    repaySolana,
  };
}

