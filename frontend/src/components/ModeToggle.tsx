import { useAppState } from "../state/appState";

export function ModeToggle() {
  const { mode, setMode } = useAppState();
  return (
    <div className="segmented" role="group" aria-label="Mode">
      <button
        className={`segmentedBtn ${mode === "lite" ? "active" : ""}`}
        onClick={() => setMode("lite")}
        type="button"
      >
        Lite
      </button>
      <button
        className={`segmentedBtn ${mode === "pro" ? "active" : ""}`}
        onClick={() => setMode("pro")}
        type="button"
      >
        Pro
      </button>
    </div>
  );
}

