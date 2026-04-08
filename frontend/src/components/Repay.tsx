import { useState } from "react";
import { parseUnits } from "viem";
import { baseSepolia } from "wagmi/chains";
import { INCO_FEE, TOKEN_DECIMALS } from "../evm/constants";
import { encryptAmount, LENDING_ADDRESS } from "../evm/useEvm";
import { useEvmLendingGate } from "../hooks/useEvmLendingGate";
import { useActivityLog } from "../hooks/activityLog";
import { TxStatus } from "./TxStatus";

type Props = {
  compact?: boolean;
};

export function Repay({ compact }: Props) {
  const gate = useEvmLendingGate();
  const { push } = useActivityLog();
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onRepay = async () => {
    setError("");
    setMessage("");
    setStep("");
    if (!gate.canTransact || !gate.address || !gate.lending || !gate.token) return;
    setBusy(true);
    try {
      const wei = parseUnits(amount || "0", TOKEN_DECIMALS);
      setStep("Submitting…");
      setMessage("Encrypting repayment");
      const ciphertext = await encryptAmount(wei, gate.address, LENDING_ADDRESS);
      await gate.token.write.approve([LENDING_ADDRESS, ciphertext], {
        value: INCO_FEE,
        chain: baseSepolia,
        account: gate.address,
      });
      await gate.lending.write.repay([ciphertext], {
        value: INCO_FEE,
        chain: baseSepolia,
        account: gate.address,
      });
      setStep("Confirmed");
      setMessage("Repay completed");
      push("repay", amount ? `${amount} cUSD` : undefined);
      setAmount("");
    } catch (e: unknown) {
      const err = e as { shortMessage?: string; message?: string };
      setError(err.shortMessage || err.message || "Repay failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`card lendingCard${compact ? " compact" : ""}`}>
      <h2 style={{ margin: 0 }}>Repay</h2>
      <p className="hint">Pay down debt with encrypted cUSD.</p>
      {!gate.onBaseSepolia && gate.connected ? (
        <button type="button" className="btn btn-primary" onClick={() => gate.switchToBaseSepolia()} disabled={gate.switching}>
          {gate.switching ? "Switching…" : "Switch to Base Sepolia"}
        </button>
      ) : null}
      <input
        className="input"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.00"
        disabled={!gate.canTransact || busy}
      />
      <button
        type="button"
        className="btn btn-primary"
        onClick={onRepay}
        disabled={busy || !gate.canTransact || !amount}
      >
        {busy ? "Submitting…" : "Repay"}
      </button>
      {!gate.canTransact && gate.blockReason ? (
        <p className="fineprint">{gate.blockReason}</p>
      ) : null}
      <TxStatus step={step} message={message} error={error} />
    </div>
  );
}
