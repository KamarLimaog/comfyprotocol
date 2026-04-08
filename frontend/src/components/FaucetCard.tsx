import { useMemo, useState } from "react";
import { parseUnits, formatUnits } from "viem";
import { baseSepolia } from "wagmi/chains";
import { handleTypes } from "@inco/js";

import { useAppState } from "../state/appState";
import { useSolana } from "../solana/useSolana";
import { useEvmWallet, useTokenContract, TOKEN_ADDRESS, getZap } from "../evm/useEvm";
import { INCO_FEE, TOKEN_DECIMALS } from "../evm/constants";
import { useEvmLendingGate } from "../hooks/useEvmLendingGate";
import { TxStatus } from "./TxStatus";

export function FaucetCard() {
  const { chain, mode } = useAppState();
  const { address } = useEvmWallet();
  const token = useTokenContract();
  const evmGate = useEvmLendingGate();
  const sol = useSolana();

  const [amount, setAmount] = useState("100");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const disabledReason = useMemo(() => {
    if (chain === "base") {
      if (!address) return "Connect an EVM wallet";
      if (!evmGate.onBaseSepolia) return "Switch to Base Sepolia";
      if (!token) return "Token contract not ready";
      return "";
    }
    if (!sol.wallet.connected) return "Connect Phantom";
    return "";
  }, [chain, address, token, evmGate.onBaseSepolia, sol.wallet.connected]);

  const onGetTokens = async () => {
    setError("");
    setMessage("");
    setStep("");
    setBusy(true);
    try {
      const wei = parseUnits(amount || "0", TOKEN_DECIMALS);

      if (chain === "base") {
        if (!address || !token) throw new Error("Connect wallet first.");
        setStep("Encrypting…");
        setMessage("Encrypting amount for confidential mint");
        const zap = await getZap();
        const ct = await zap.encrypt(wei, {
          accountAddress: address,
          dappAddress: TOKEN_ADDRESS,
          handleType: handleTypes.euint256,
        });
        setStep("Submitting…");
        setMessage("Submitting faucet mint transaction");
        await token.write.encryptedMint([ct as `0x${string}`], {
          value: INCO_FEE,
          chain: baseSepolia,
          account: address,
        });
        setStep("Confirmed");
        setMessage("Encrypted cUSD minted to your wallet");
        return;
      }

      // Solana
      if (!sol.wallet.publicKey) throw new Error("Connect Phantom first.");
      if (mode === "pro") {
        setStep("Encrypting…");
        setMessage("Preparing confidential mint (Solana)");
      } else {
        setStep("Submitting…");
        setMessage("Requesting tokens…");
      }
      await sol.mintConfidentialSolana(wei);
      setStep("Confirmed");
      setMessage("Solana devnet tokens granted (demo confidential balance)");
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err.message || "Faucet failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <h2 style={{ margin: 0 }}>Get Tokens</h2>
          <p className="hint" style={{ marginBottom: 0 }}>
            {chain === "base"
              ? "Mints encrypted cUSD to your EVM wallet (Base Sepolia)."
              : "Devnet faucet for Solana (Phantom)."}
          </p>
        </div>
        {chain === "base" && (
          <div className="badge">Fee: {formatUnits(INCO_FEE, 18)} ETH</div>
        )}
      </div>

      <div className="faucetRow">
        <input
          className="input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="100"
        />
        <div className="quickPills">
          {["25", "100", "250", "1000"].map((v) => (
            <button key={v} className="pill" onClick={() => setAmount(v)} type="button">
              {v}
            </button>
          ))}
        </div>
      </div>

      {chain === "base" && address && !evmGate.onBaseSepolia ? (
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginBottom: 12 }}
          onClick={() => evmGate.switchToBaseSepolia()}
          disabled={evmGate.switching}
        >
          {evmGate.switching ? "Switching…" : "Switch to Base Sepolia"}
        </button>
      ) : null}

      <button className="btn btn-primary" onClick={onGetTokens} disabled={busy || !!disabledReason}>
        {busy ? "Working…" : mode === "lite" ? "Get Tokens" : "Get Test Tokens"}
      </button>

      {disabledReason && <p className="fineprint">{disabledReason}</p>}
      <TxStatus step={step} message={message} error={error} />

      {chain === "solana" && mode === "pro" && (
        <p className="fineprint">
          Demo confidential balance (local ledger): <span className="mono">{String(sol.demoBalance)} wei</span>
        </p>
      )}
    </div>
  );
}

