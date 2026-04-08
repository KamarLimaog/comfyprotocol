import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

const PRIVATE_KEY_ANVIL =
  process.env.PRIVATE_KEY_ANVIL ||
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const PRIVATE_KEY_BASE_SEPOLIA = process.env.PRIVATE_KEY || "";
const BASE_SEPOLIA_RPC_URL =
  process.env.BASE_SEPOLIA_RPC_URL ||
  "https://base-sepolia-rpc.publicnode.com";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "cancun",
    },
  },
  networks: {
    anvil: {
      url: process.env.LOCAL_CHAIN_RPC_URL || "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: [PRIVATE_KEY_ANVIL],
    },
    baseSepolia: {
      url: BASE_SEPOLIA_RPC_URL,
      chainId: 84532,
      accounts: PRIVATE_KEY_BASE_SEPOLIA ? [PRIVATE_KEY_BASE_SEPOLIA] : [],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
