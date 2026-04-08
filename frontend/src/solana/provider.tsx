import React, { PropsWithChildren, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

import { SOLANA_RPC_URL } from "./solanaClient";

import "@solana/wallet-adapter-react-ui/styles.css";

/** Solana wallet-adapter types vs React 19 JSX: bridge for build stability */
const SolanaConnectionProvider = ConnectionProvider as React.ComponentType<{
  endpoint: string;
  children: React.ReactNode;
}>;

export function SolanaProvider({ children }: PropsWithChildren) {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <SolanaConnectionProvider endpoint={SOLANA_RPC_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </SolanaConnectionProvider>
  );
}

