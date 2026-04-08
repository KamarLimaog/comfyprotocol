import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";

export type AppChain = "base" | "solana";
export type AppMode = "lite" | "pro";

type AppState = {
  chain: AppChain;
  setChain: (c: AppChain) => void;
  mode: AppMode;
  setMode: (m: AppMode) => void;
};

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [chain, setChain] = useState<AppChain>("base");
  const [mode, setMode] = useState<AppMode>("lite");

  const value = useMemo(() => ({ chain, setChain, mode, setMode }), [chain, mode]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const v = useContext(Ctx);
  if (!v) throw new Error("AppStateProvider missing");
  return v;
}

