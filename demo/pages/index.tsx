import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Keypair } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';
import { getAnchorClient } from '../utils/anchor-client';
import { TicTacToe } from '@/tic_tac_toe';
import dynamic from 'next/dynamic';

type BoardState = (boolean | null)[][];

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export default function Home() {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const [program, setProgram] = useState<Program<TicTacToe> | null>(null);
  const [gameAccount, setGameAccount] = useState<PublicKey | null>(null);
  const [board, setBoard] = useState<BoardState>(Array(3).fill(Array(3).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (publicKey && signTransaction && signAllTransactions) {
      const anchorClient = getAnchorClient({ publicKey, signTransaction, signAllTransactions });
      setProgram(anchorClient);
    }
  }, [publicKey, signTransaction, signAllTransactions]);

  async function initializeGame() {
    if (!program || !publicKey) return;
  
    try {
      const gameKeypair = Keypair.generate();
      await program.methods.initialize()
        .accounts({
          game: gameKeypair.publicKey,
          player: publicKey,
        })
        .signers([gameKeypair])
        .rpc();
  
      setGameAccount(gameKeypair.publicKey);
      setMessage('Game initialized. X starts.');
      await renderBoard();
    } catch (error) {
      console.error('Error initializing game:', error);
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async function makeMove(row: number, col: number) {
    if (!program || !gameAccount || !publicKey) return;
  
    try {
      await program.methods.makeMove(row, col)
        .accounts({
          game: gameAccount,
          player: publicKey,
        })
        .rpc();
  
      setMessage('Move made successfully.');
      await renderBoard();
    } catch (error) {
      console.error('Error making move:', error);
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
    
  async function renderBoard() {
    if (!program || !gameAccount) return;

    const gameState = await program.account.game.fetch(gameAccount);
    setBoard(gameState.board as BoardState);
    setCurrentPlayer(gameState.currentPlayer);

    if (!gameState.isActive) {
      setMessage('Game ended.');
    } else {
      setMessage(`Current player: ${gameState.currentPlayer ? 'X' : 'O'}`);
    }
  }

  return (
    <div className="container">
      <h1>Tic-Tac-Toe on Solana Devnet</h1>
      <WalletMultiButtonDynamic />
      {publicKey && (
        <>
          <button className="button" onClick={initializeGame}>Initialize Game</button>
          <div className="board">
            {board.map((row, i) => (
              row.map((cell, j) => (
                <div key={`${i}-${j}`} className="cell" onClick={() => makeMove(i, j)}>
                  {cell === null ? '' : (cell ? 'X' : 'O')}
                </div>
              ))
            ))}
          </div>
          <p>{message}</p>
        </>
      )}
    <style jsx>{`
      .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem;
      }
      .board {
        display: grid;
        grid-template-columns: repeat(3, 100px);
        gap: 5px;
        margin-top: 1rem;
      }
      .cell {
        width: 100px;
        height: 100px;
        border: 1px solid black;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 24px;
        cursor: pointer;
      }
      .button {
        background-color: #4CAF50;
        color: white;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 4px 2px;
        cursor: pointer;
        border-radius: 12px;
        border: none;
        transition-duration: 0.4s;
        box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
      }
      .cool-button:hover {
        background-color: #45a049;
        box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
      }
      .cool-button:active {
        background-color: #3e8e41;
        box-shadow: 0 5px #666;
        transform: translateY(4px);
      }
    `}</style>
    </div>
  );
}
