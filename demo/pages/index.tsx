import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, Keypair } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';
import { getAnchorClient } from '../utils/anchor-client';
import { TicTacToe } from '@/tic_tac_toe';

type BoardState = (boolean | null)[][];

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
      <h1>Tic-Tac-Toe on Solana</h1>
      <WalletMultiButton />
      {publicKey && (
        <>
          <button onClick={initializeGame}>Initialize Game</button>
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
      `}</style>
    </div>
  );
}
