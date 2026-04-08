# Comfy Protocol

**Comfy Protocol** is a confidential lending dApp built on [Inco](https://www.inco.org/) with a production-oriented React frontend: **Lite** and **Pro** modes, **Base Sepolia** (EVM) lending with encrypted inputs, and a **Solana Devnet** layer that is **stubbed** for future Inco Solana integration.

## Features

### EVM (Base Sepolia) — live

- **ConfidentialERC20** (cUSD) + **ConfidentialLending** (deposit, borrow, repay, withdraw, liquidation in contracts).
- **Faucet**: `encryptedMint` via Inco JS encryption.
- **Deposit / Borrow / Repay**: same contract flow as before — `encrypt` → `approve` (where needed) → `deposit` / `borrow` / `repay` with Inco fee in `msg.value`.
- **Wallet**: RainbowKit + wagmi, WalletConnect via `VITE_WALLETCONNECT_PROJECT_ID`.
- **Guards**: wallet must be connected and chain must be **Base Sepolia**; UI offers **Switch to Base Sepolia** when needed.
- **Tx UX**: **Submitting…** / **Confirmed** + user-friendly errors.

### Frontend UX

- **Lite mode**: simple stack — Get Tokens, Deposit, Borrow, Repay (auto-locks to Base).
- **Pro mode**: two-column dashboard — actions + **Wallet** card, **Vault** (encrypted `••••••••` + mock **Decrypt**), **Health orb** (green / yellow / red from collateral/debt ratio), **Activity** timeline (deposit / borrow / repay).
- **Solana**: Phantom via wallet-adapter; **faucet stub** + note that confidential lending is not wired to a program yet.

### Smart contracts (repo root)

- Solidity 0.8.28, [@inco/lightning](https://www.npmjs.com/package/@inco/lightning), Hardhat, OpenZeppelin.

## Project structure

```
├── contracts/                 # ConfidentialERC20 + ConfidentialLending
├── ignition/modules/          # Deploy module
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Comfy Protocol shell (Lite / Pro / chain)
│   │   ├── main.tsx           # EVM + Solana + state + activity providers
│   │   ├── evm/               # wagmi config, hooks, constants
│   │   ├── solana/            # Connection + wallet UI + stubs
│   │   ├── components/        # Deposit, Borrow, Repay, Faucet, Vault, etc.
│   │   ├── hooks/             # activity log, EVM lending gate
│   │   └── abi/
│   └── package.json
├── hardhat.config.ts
└── README.md
```

## Environment variables

### Root (Hardhat)

- `PRIVATE_KEY_BASE_SEPOLIA`, `BASE_SEPOLIA_RPC_URL` (see `.env.example` at repo root if present).

### Frontend (`frontend/.env`)

```env
VITE_LENDING_ADDRESS=0x...          # ConfidentialLending
VITE_TOKEN_ADDRESS=0x...            # ConfidentialERC20 (cUSD)
VITE_WALLETCONNECT_PROJECT_ID=... # WalletConnect (RainbowKit)
# Optional Solana RPC override:
# VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
```

## Setup & run

```bash
# Contracts
npm install
npm run compile

# Frontend
cd frontend && npm install
npm run dev
```

Build for production (e.g. Vercel):

```bash
cd frontend && npm run build
```

## Protocol parameters (contracts)

- **Collateralization**: borrow only if collateral ≥ 1.5× new debt.
- **Liquidation**: unhealthy when collateral &lt; 1.1× debt (attested flows as documented for Inco).
- **Fees**: encrypted inputs require Inco fee (`inco.getFee()`); frontend uses `INCO_FEE` in `src/evm/constants.ts` for UI alignment.

## Branding

- App name: **Comfy Protocol**.
- Footer: **Powered by Inco** (confidential compute / fhEVM).

## License

MIT
