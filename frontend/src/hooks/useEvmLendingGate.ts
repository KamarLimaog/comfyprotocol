import { baseSepolia } from "wagmi/chains";
import { useChainId, useSwitchChain } from "wagmi";
import {
  LENDING_ADDRESS,
  TOKEN_ADDRESS,
  useEvmWallet,
  useLendingContract,
  useTokenContract,
} from "../evm/useEvm";

export function useEvmLendingGate() {
  const chainId = useChainId();
  const { switchChainAsync, isPending: switching } = useSwitchChain();
  const { address } = useEvmWallet();
  const lending = useLendingContract();
  const token = useTokenContract();

  const hasAddresses = Boolean(LENDING_ADDRESS && TOKEN_ADDRESS);
  const connected = Boolean(address);
  const onBaseSepolia = chainId === baseSepolia.id;
  const contractsReady = Boolean(lending && token);

  let blockReason = "";
  if (!hasAddresses) blockReason = "Set VITE_LENDING_ADDRESS and VITE_TOKEN_ADDRESS.";
  else if (!connected) blockReason = "Connect your wallet.";
  else if (!onBaseSepolia) blockReason = "Switch to Base Sepolia.";
  else if (!contractsReady) blockReason = "Contracts not ready.";

  const canTransact = !blockReason;

  const switchToBaseSepolia = async () => {
    if (!switchChainAsync) return;
    await switchChainAsync({ chainId: baseSepolia.id });
  };

  return {
    chainId,
    address,
    connected,
    onBaseSepolia,
    canTransact,
    blockReason,
    lending,
    token,
    switchToBaseSepolia,
    switching,
  };
}
