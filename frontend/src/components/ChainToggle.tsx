import { useAppState } from "../state/appState";

export function ChainToggle() {
  const { chain, setChain, mode } = useAppState();

  // Lite mode: auto-select Base for minimal friction unless user explicitly chose Solana earlier.
  // (We keep the toggle hidden in Lite for “beginner” UX.)
  if (mode === "lite") return null;

  return (
    <div className="segmented" role="group" aria-label="Chain">
      <button
        className={`segmentedBtn ${chain === "base" ? "active" : ""}`}
        onClick={() => setChain("base")}
        type="button"
      >
        Base
      </button>
      <button
        className={`segmentedBtn ${chain === "solana" ? "active" : ""}`}
        onClick={() => setChain("solana")}
        type="button"
      >
        Solana
      </button>
    </div>
  );
}

