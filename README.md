# Tic-Tac-Toe on Solana

This is a Solana DApp to play tic-tac-toe against yourself.

## Test on devnet

Make sure you have dev SOL tokens from [https://faucet.solana.com/](https://faucet.solana.com/) to your wallet and make the switch to devnet in Phantom settings.

This app is deployed to [https://tictactoe.walletbubbles.com](https://tictactoe.walletbubbles.com).

## Deploy yourself on localnet
- Follow these [instructions](https://solana.com/docs/intro/installation)
- `anchor build`
- `anchor keys list`
- copy key into `src/lib.rs`, `Anchor.toml`, and `demo/tic_tac_toe.json`
- in new terminal tab run `solana-test-validator` and keep running
- make sure you have airdropped SOL to your wallet (in the instructions - first step)
- `anchor deploy`
- `cd demo`
- `yarn install`
- `yarn dev`
- open your browser to `http://localhost:3000`
- switch the Phantom browser extension to localnet
- start a new game and play!
