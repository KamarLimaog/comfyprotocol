import { getContract, type Address, type WalletClient } from "viem";
import { supportedChains, handleTypes, getViemChain } from "@inco/js";
import { Lightning } from "@inco/js/lite";
import { useAccount, useWalletClient } from "wagmi";
import lendingAbi from "../abi/ConfidentialLending";
import tokenAbi from "../abi/ConfidentialERC20";

export const EVM_CHAIN = supportedChains.baseSepolia;

export const LENDING_ADDRESS = (import.meta.env.VITE_LENDING_ADDRESS || "") as Address;
export const TOKEN_ADDRESS = (import.meta.env.VITE_TOKEN_ADDRESS || "") as Address;

export function useEvmWallet() {
  const { address, status } = useAccount();
  const { data: walletClient } = useWalletClient({
    chainId: getViemChain(EVM_CHAIN).id,
  });
  return {
    address: (address || null) as Address | null,
    client: (walletClient || null) as WalletClient | null,
    status,
  };
}

export async function getZap() {
  return Lightning.latest("testnet", EVM_CHAIN);
}

export async function encryptAmount(amount: bigint, userAddress: Address, dappAddress: Address) {
  const zap = await getZap();
  const ct = await zap.encrypt(amount, {
    accountAddress: userAddress,
    dappAddress,
    handleType: handleTypes.euint256,
  });
  return ct as `0x${string}`;
}

export function useLendingContract() {
  const { client } = useEvmWallet();
  if (!client || !LENDING_ADDRESS) return null;
  return getContract({
    address: LENDING_ADDRESS,
    abi: lendingAbi,
    client: { wallet: client, public: client },
  });
}

export function useTokenContract() {
  const { client } = useEvmWallet();
  if (!client || !TOKEN_ADDRESS) return null;
  return getContract({
    address: TOKEN_ADDRESS,
    abi: tokenAbi,
    client: { wallet: client, public: client },
  });
}

