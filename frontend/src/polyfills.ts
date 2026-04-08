import { Buffer } from "buffer";

// Some deps (encryption, WalletConnect) expect Node-ish globals in the browser.
// Vite aliases provide the modules; this provides the runtime global.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).Buffer = Buffer;

