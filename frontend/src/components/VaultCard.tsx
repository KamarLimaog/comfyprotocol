import { useMemo, useState } from "react";
import { formatUnits } from "viem";
import { HealthOrb } from "./HealthOrb";
import { TOKEN_DECIMALS } from "../evm/constants";

/** Mock plaintext after “Decrypt” for demo UX (real flow uses attested decrypt). */
const MOCK_COLLATERAL_WEI = 1_500n * 10n ** 18n;
const MOCK_DEBT_WEI = 600n * 10n ** 18n;

function healthFromRatio(collateralWei: bigint, debtWei: bigint): number {
  if (debtWei === 0n) return 1;
  const ratio = Number(collateralWei) / Number(debtWei);
  const clamped = Math.max(0, Math.min(1, (ratio - 1.1) / (1.5 - 1.1)));
  return clamped;
}

export function VaultCard() {
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);

  const health01 = useMemo(() => {
    if (!revealed) return 0.45;
    return healthFromRatio(MOCK_COLLATERAL_WEI, MOCK_DEBT_WEI);
  }, [revealed]);

  const onDecrypt = async () => {
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setRevealed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card vaultCard">
      <h2 style={{ margin: 0 }}>Vault</h2>
      <p className="hint">Encrypted balances stay private on-chain. Decrypt is mocked here for UX.</p>

      <HealthOrb health01={health01} />

      <div className="vaultRows">
        <div className="vaultRow">
          <span className="vaultLabel">Collateral</span>
          <span className="vaultValue mono">
            {revealed ? `${formatUnits(MOCK_COLLATERAL_WEI, TOKEN_DECIMALS)} cUSD` : "••••••••"}
          </span>
        </div>
        <div className="vaultRow">
          <span className="vaultLabel">Debt</span>
          <span className="vaultValue mono">
            {revealed ? `${formatUnits(MOCK_DEBT_WEI, TOKEN_DECIMALS)} cUSD` : "••••••••"}
          </span>
        </div>
      </div>

      <button type="button" className="btn btn-primary" onClick={onDecrypt} disabled={busy || revealed}>
        {busy ? "Submitting…" : revealed ? "Confirmed" : "Decrypt"}
      </button>
      {revealed ? <p className="fineprint">Mock values shown for demo. Connect attested decrypt for live data.</p> : null}
    </div>
  );
}
