import "@rainbow-me/rainbowkit/styles.css";

import { PropsWithChildren } from "react";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

const queryClient = new QueryClient();

export const evmConfig = getDefaultConfig({
  appName: "Comfy Protocol",
  projectId: projectId || "INVALID_PROJECT_ID",
  chains: [baseSepolia],
  ssr: false,
});

export function EvmProviders({ children }: PropsWithChildren) {
  // Production hardening: fail loud in UI if missing WalletConnect id.
  // RainbowKit needs a real projectId for WalletConnect wallets (e.g. Rainbow).
  if (!projectId) {
    return (
      <div style={{ padding: 16, color: "#E7EEFE", fontFamily: "system-ui" }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Missing WalletConnect Project ID</h2>
        <p style={{ marginTop: 8, opacity: 0.9 }}>
          Set <code>VITE_WALLETCONNECT_PROJECT_ID</code> in <code>frontend/.env</code>.
        </p>
      </div>
    );
  }

  return (
    <WagmiProvider config={evmConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

