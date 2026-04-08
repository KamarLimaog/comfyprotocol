export default [
  { inputs: [{ name: "encryptedAmount", type: "bytes", internalType: "bytes" }], name: "deposit", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "encryptedAmount", type: "bytes", internalType: "bytes" }], name: "withdraw", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "encryptedAmount", type: "bytes", internalType: "bytes" }], name: "borrow", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "encryptedAmount", type: "bytes", internalType: "bytes" }], name: "repay", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "user", type: "address", internalType: "address" }], name: "getLiquidationHandle", outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }], stateMutability: "nonpayable", type: "function" },
  {
    inputs: [
      { name: "user", type: "address", internalType: "address" },
      { name: "decryption", type: "tuple", internalType: "struct DecryptionAttestation", components: [{ name: "handle", type: "bytes32" }, { name: "value", type: "bytes32" }] },
      { name: "signatures", type: "bytes[]", internalType: "bytes[]" }
    ],
    name: "liquidate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  { inputs: [{ name: "", type: "address", internalType: "address" }], name: "collateral", outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "", type: "address", internalType: "address" }], name: "debt", outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "depositFees", outputs: [], stateMutability: "payable", type: "function" }
] as const;
