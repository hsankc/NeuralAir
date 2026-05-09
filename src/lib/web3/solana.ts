import { Connection, PublicKey, Transaction, SystemProgram, Keypair } from "@solana/web3.js";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { NeuralAirIDL } from "./idl";

// Program ID (declare_id ile aynı olmalı)
export const PROGRAM_ID = new PublicKey("NeURaiRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

// Bağlantı
const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com";
export const connection = new Connection(rpcUrl, "confirmed");

// Anchor Provider ve Program oluşturucu
export const getProgram = (provider: AnchorProvider) => {
  return new Program(NeuralAirIDL as Idl, provider);
};

// Frontend'den cüzdan bağlıysa uçuş kaydı atmak için fonksiyon
export async function recordFlightOnChain(
  wallet: any, // Phantom provider
  droneId: string,
  gpsData: string,
  flightTime: number
): Promise<string> {
  if (!wallet || !wallet.publicKey) {
    throw new Error("Wallet not connected");
  }

  // Anchor Provider oluştur (cüzdanı wrapper içine alıyoruz)
  const provider = new AnchorProvider(
    connection,
    wallet,
    { preflightCommitment: "confirmed" }
  );

  const program = getProgram(provider);

  // Uçuş kaydı için yeni bir Keypair (account) oluşturuyoruz
  const flightRecordKeypair = Keypair.generate();

  try {
    const tx = await program.methods
      .recordFlight(droneId, gpsData, new (window as any).anchor.BN(flightTime))
      .accounts({
        flightRecord: flightRecordKeypair.publicKey,
        operator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([flightRecordKeypair])
      .rpc();

    console.log("Flight recorded successfully! TX:", tx);
    return tx;
  } catch (error) {
    console.error("Failed to record flight on-chain:", error);
    throw error;
  }
}
