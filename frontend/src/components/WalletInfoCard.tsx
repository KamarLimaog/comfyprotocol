import { useAppState } from "../state/appState";
import { useEvmWallet } from "../evm/useEvm";
import { useWallet } from "@solana/wallet-adapter-react";

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function WalletInfoCard() {
  const { chain } = useAppState();
  const { address } = useEvmWallet();
  const sol = useWallet();

  const evmLine = address ? shortAddr(address) : "Not connected";
  const solLine = sol.publicKey ? shortAddr(sol.publicKey.toBase58()) : "Not connected";

  return (
    <div className="card walletInfoCard">
      <h2 style={{ margin: 0 }}>Wallet</h2>
      <div className="walletInfoRows">
        <div className="walletInfoRow">
          <span className="walletInfoK">Chain</span>
          <span className="walletInfoV">
            {chain === "base" ? "Base Sepolia" : "Solana Devnet (stub)"}
          </span>
        </div>
        <div className="walletInfoRow">
          <span className="walletInfoK">EVM</span>
          <span className="walletInfoV mono">{evmLine}</span>
        </div>
        <div className="walletInfoRow">
          <span className="walletInfoK">Solana</span>
          <span className="walletInfoV mono">{solLine}</span>
        </div>
      </div>
    </div>
  );
}
