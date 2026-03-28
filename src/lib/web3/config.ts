// Monad Testnet Chain Configuration
export const MONAD_TESTNET = {
  chainId: 10143,
  chainIdHex: "0x27AF",
  name: "Monad Testnet",
  rpcUrl: process.env.NEXT_PUBLIC_MONAD_RPC_URL || "https://testnet-rpc.monad.xyz",
  explorerUrl: process.env.NEXT_PUBLIC_MONAD_EXPLORER_URL || "https://testnet.monadexplorer.com",
  currency: {
    name: "MON",
    symbol: "MON",
    decimals: 18,
  },
} as const;

// Contract addresses (to be updated after deployment)
export const CONTRACTS = {
  registry: "0x0000000000000000000000000000000000000000",
  missionEscrow: "0x0000000000000000000000000000000000000000",
  skyCharge: "0x0000000000000000000000000000000000000000",
  flightLogger: "0x0000000000000000000000000000000000000000",
  droneControl: "0x0000000000000000000000000000000000000000",
  governance: "0x0000000000000000000000000000000000000000",
} as const;

export function getExplorerTxUrl(txHash: string): string {
  return `${MONAD_TESTNET.explorerUrl}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${MONAD_TESTNET.explorerUrl}/address/${address}`;
}
