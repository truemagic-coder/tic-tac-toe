import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TicTacToe } from "../target/types/tic_tac_toe";
import { expect } from "chai";

describe("tic-tac-toe", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.TicTacToe as Program<TicTacToe>;
  const player = anchor.web3.Keypair.generate();

  let gameKeypair: anchor.web3.Keypair;
  let gamePda: anchor.web3.PublicKey;

  before(async () => {
    // Airdrop SOL to the player
    const connection = anchor.getProvider().connection;
    const airdropSignature = await connection.requestAirdrop(
      player.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);
  });

  beforeEach(async () => {
    gameKeypair = anchor.web3.Keypair.generate();
    gamePda = gameKeypair.publicKey;
  });

  it("Initializes the game", async () => {
    await program.methods
      .initialize()
      .accounts({
        game: gamePda,
        player: player.publicKey,
      })
      .signers([player, gameKeypair])
      .rpc();

    const gameAccount = await program.account.game.fetch(gamePda);
    expect(gameAccount.board).to.deep.equal(Array(3).fill(Array(3).fill(null)));
    expect(gameAccount.currentPlayer).to.be.true;
    expect(gameAccount.isActive).to.be.true;
  });

  it("Makes a valid move", async () => {
    // Initialize the game
    await program.methods
      .initialize()
      .accounts({
        game: gamePda,
        player: player.publicKey,
      })
      .signers([player, gameKeypair])
      .rpc();

    // Make a move
    await program.methods
      .makeMove(0, 0)
      .accounts({
        game: gamePda,
        player: player.publicKey,
      })
      .signers([player])
      .rpc();

    const gameAccount = await program.account.game.fetch(gamePda);
    expect(gameAccount.board[0][0]).to.equal(true);
    expect(gameAccount.currentPlayer).to.be.false;
  });

  it("Prevents making a move on an occupied space", async () => {
    // Initialize the game
    await program.methods
      .initialize()
      .accounts({
        game: gamePda,
        player: player.publicKey,
      })
      .signers([player, gameKeypair])
      .rpc();

    // Make a move
    await program.methods
      .makeMove(0, 0)
      .accounts({
        game: gamePda,
        player: player.publicKey,
      })
      .signers([player])
      .rpc();

    // Try to make a move on the same space
    try {
      await program.methods
        .makeMove(0, 0)
        .accounts({
          game: gamePda,
          player: player.publicKey,
        })
        .signers([player])
        .rpc();
      expect.fail("The move should have failed");
    } catch (error) {
      expect(error.error.errorMessage).to.include("The space is already taken");
    }
  });

  it("Detects a win", async () => {
    // Initialize the game
    await program.methods
      .initialize()
      .accounts({
        game: gamePda,
        player: player.publicKey,
      })
      .signers([player, gameKeypair])
      .rpc();

    // Make winning moves
    const moves = [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
      [0, 2],
    ];

    for (const [row, col] of moves) {
      await program.methods
        .makeMove(row, col)
        .accounts({
          game: gamePda,
          player: player.publicKey,
        })
        .signers([player])
        .rpc();
    }

    const gameAccount = await program.account.game.fetch(gamePda);
    expect(gameAccount.isActive).to.be.false;
  });

  it("Detects a draw", async () => {
    // Initialize the game
    await program.methods
      .initialize()
      .accounts({
        game: gamePda,
        player: player.publicKey,
      })
      .signers([player, gameKeypair])
      .rpc();

    // Make moves to force a draw
    const moves = [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 1],
      [1, 0],
      [1, 2],
      [2, 1],
      [2, 0],
      [2, 2],
    ];

    for (const [row, col] of moves) {
      await program.methods
        .makeMove(row, col)
        .accounts({
          game: gamePda,
          player: player.publicKey,
        })
        .signers([player])
        .rpc();
    }

    const gameAccount = await program.account.game.fetch(gamePda);
    expect(gameAccount.isActive).to.be.false;
  });
});
