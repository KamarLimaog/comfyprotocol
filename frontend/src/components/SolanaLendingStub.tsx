import { useMemo, useState } from "react";
import { parseUnits } from "viem";
import { useSolana } from "../solana/useSolana";
import { TOKEN_DECIMALS } from "../evm/constants";
import { TxStatus } from "./TxStatus";

export function SolanaLendingStub() {
  const sol = useSolana();
  const [amount, setAmount] = useState("100");
  const [error, setError] = useState("");

  const disabledReason = useMemo(() => {
    if (!sol.wallet.connected) return "Connect Phantom";
    return "";
  }, [sol.wallet.connected]);

  const run = async (fn: (wei: bigint) => Promise<void>) => {
    setError("");
    try {
      const wei = parseUnits(amount || "0", TOKEN_DECIMALS);
      await fn(wei);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err.message || "Operation failed");
    }
  };

  return (
    <div className="card">
      <h2 style={{ margin: 0 }}>Solana Lending (stub)</h2>
      <p className="hint">
        These actions are stubbed until a Solana program/SDK is integrated. They mirror the UX states used on EVM.
      </p>

      <input
        className="input"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="100"
        disabled={!!disabledReason}
      />

      <div className="row3">
        <button className="btn btn-primary" disabled={!!disabledReason} onClick={() => run(sol.depositSolana)}>
          Deposit
        </button>
        <button className="btn btn-primary" disabled={!!disabledReason} onClick={() => run(sol.borrowSolana)}>
          Borrow
        </button>
        <button className="btn btn-primary" disabled={!!disabledReason} onClick={() => run(sol.repaySolana)}>
          Repay
        </button>
      </div>

      {disabledReason ? <p className="fineprint">{disabledReason}</p> : null}
      <TxStatus step={sol.step === "confirmed" ? "Confirmed" : sol.step === "submitting" ? "Submitting…" : sol.step === "encrypting" ? "Encrypting…" : ""} message={sol.message} error={error} />
    </div>
  );
}

