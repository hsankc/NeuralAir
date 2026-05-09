// Solana Network Configuration
export const SOLANA_NETWORK = {
  name: "Solana Devnet",
  rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com",
  explorerUrl: "https://explorer.solana.com",
  cluster: "devnet",
  currency: {
    name: "SOL",
    symbol: "SOL",
    decimals: 9,
  },
} as const;

// Geriye dönük uyumluluk (eski import'ları kırmamak için)
export const MONAD_TESTNET = SOLANA_NETWORK;

// Solana Devnet Explorer linkleri
export function getExplorerTxUrl(txHash: string): string {
  return `${SOLANA_NETWORK.explorerUrl}/tx/${txHash}?cluster=devnet`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${SOLANA_NETWORK.explorerUrl}/address/${address}?cluster=devnet`;
}
