import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { EvmProviders } from "./evm/provider";
import { SolanaProvider } from "./solana/provider";
import { AppStateProvider } from "./state/appState";
import { ActivityProvider } from "./hooks/activityLog";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <EvmProviders>
      <SolanaProvider>
        <AppStateProvider>
          <ActivityProvider>
            <App />
          </ActivityProvider>
        </AppStateProvider>
      </SolanaProvider>
    </EvmProviders>
  </React.StrictMode>
);
