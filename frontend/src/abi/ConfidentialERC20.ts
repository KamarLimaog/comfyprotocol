export default [
  { inputs: [{ name: "to", type: "address" }, { name: "encryptedAmount", type: "bytes" }], name: "transfer", outputs: [{ name: "", type: "bool" }], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "to", type: "address" }, { name: "amount", type: "bytes32" }], name: "transfer", outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "encryptedAmount", type: "bytes" }], name: "transferFrom", outputs: [{ name: "", type: "bool" }], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "amount", type: "bytes32" }], name: "transferFrom", outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "spender", type: "address" }, { name: "encryptedAmount", type: "bytes" }], name: "approve", outputs: [{ name: "", type: "bool" }], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "wallet", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "bytes32" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "encryptedAmount", type: "bytes" }], name: "encryptedMint", outputs: [], stateMutability: "payable", type: "function" }
] as const;
