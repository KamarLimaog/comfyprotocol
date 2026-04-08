import { getContract, type Address, type WalletClient } from "viem";
import { baseSepolia } from "viem/chains";
import { supportedChains, handleTypes, getViemChain } from "@inco/js";
import { Lightning } from "@inco/js/lite";
import lendingAbi from "./abi/ConfidentialLending";
import tokenAbi from "./abi/ConfidentialERC20";
import { useAccount, useWalletClient } from "wagmi";

const LENDING_ADDRESS = (import.meta.env.VITE_LENDING_ADDRESS || "") as Address;
const TOKEN_ADDRESS = (import.meta.env.VITE_TOKEN_ADDRESS || "") as Address;
const CHAIN = supportedChains.baseSepolia;

export async function getZap() {
  return Lightning.latest("testnet", CHAIN);
}

export async function encryptAmount(amount: bigint, userAddress: Address): Promise<`0x${string}`> {
  const zap = await Lightning.latest("testnet", CHAIN);
  const ct = await zap.encrypt(amount, {
    accountAddress: userAddress,
    dappAddress: LENDING_ADDRESS,
    handleType: handleTypes.euint256,
  });
  return ct as `0x${string}`;
}

export function useWallet() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient({
    chainId: getViemChain(CHAIN).id,
  });
  return { address: (address || null) as Address | null, client: (walletClient || null) as WalletClient | null };
}

export function useLendingContract() {
  const { client } = useWallet();
  if (!client || !LENDING_ADDRESS) return null;
  return getContract({
    address: LENDING_ADDRESS,
    abi: lendingAbi as never,
    client: { wallet: client, public: client },
  });
}

export function useTokenContract() {
  const { client } = useWallet();
  if (!client || !TOKEN_ADDRESS) return null;
  return getContract({
    address: TOKEN_ADDRESS,
    abi: tokenAbi as never,
    client: { wallet: client, public: client },
  });
}

export { LENDING_ADDRESS, TOKEN_ADDRESS, baseSepolia, CHAIN };
