import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import idl from '../tic_tac_toe.json';
import type { TicTacToe } from "../tic_tac_toe";

type AnchorWallet = {
  publicKey: PublicKey;
  signTransaction: (transaction: any) => Promise<any>;
  signAllTransactions: (transactions: any) => Promise<any>;
};

export function getAnchorClient(wallet: AnchorWallet): Program<TicTacToe> {
  const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL as string, "processed");
  const provider = new AnchorProvider(connection, wallet, { preflightCommitment: 'processed' });
  return new Program(idl as TicTacToe, provider);
}
