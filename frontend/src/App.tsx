import { useEffect } from "react";
import { useAppState } from "./state/appState";
import { ModeToggle } from "./components/ModeToggle";
import { ChainToggle } from "./components/ChainToggle";
import { FaucetCard } from "./components/FaucetCard";
import { Deposit } from "./components/Deposit";
import { Borrow } from "./components/Borrow";
import { Repay } from "./components/Repay";
import { VaultCard } from "./components/VaultCard";
import { ActivityTimeline } from "./components/ActivityTimeline";
import { WalletInfoCard } from "./components/WalletInfoCard";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LENDING_ADDRESS, TOKEN_ADDRESS } from "./evm/useEvm";
import "./App.css";

function App() {
  const { chain, mode, setChain } = useAppState();

  useEffect(() => {
    if (mode === "lite") setChain("base");
  }, [mode, setChain]);

  const missingContracts = !LENDING_ADDRESS || !TOKEN_ADDRESS;

  return (
    <div className="layout">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">◆</span>
          <h1>Comfy Protocol</h1>
        </div>
        <p className="subtitle">
          Confidential lending · Lite & Pro · Base (live) + Solana (stub)
        </p>
        <div className="topBar">
          <ModeToggle />
          <ChainToggle />
          <div className="walletRow">
            {chain === "base" ? <ConnectButton /> : <WalletMultiButton />}
          </div>
        </div>
      </header>

      <main className="main">
        {missingContracts ? (
          <div className="card">
            <h2 style={{ margin: 0 }}>Configuration</h2>
            <p className="hint">
              Set <span className="mono">VITE_LENDING_ADDRESS</span> and{" "}
              <span className="mono">VITE_TOKEN_ADDRESS</span> in <span className="mono">frontend/.env</span>.
            </p>
          </div>
        ) : chain === "solana" ? (
          <div className="grid">
            <FaucetCard />
            <div className="card">
              <h2 style={{ margin: 0 }}>Solana lending</h2>
              <p className="hint">
                Full confidential lending on Solana is stubbed here. Use the faucet for demo devnet flow; EVM lending
                stays on Base Sepolia.
              </p>
            </div>
          </div>
        ) : mode === "lite" ? (
          <div className="liteStack">
            <FaucetCard />
            <Deposit compact />
            <Borrow compact />
            <Repay compact />
          </div>
        ) : (
          <div className="proGrid">
            <div className="proCol">
              <FaucetCard />
              <Deposit />
              <Borrow />
              <Repay />
            </div>
            <div className="proCol">
              <WalletInfoCard />
              <VaultCard />
              <ActivityTimeline />
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <span>Powered by Inco</span>
      </footer>
    </div>
  );
}

export default App;
