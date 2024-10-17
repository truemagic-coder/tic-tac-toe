use anchor_lang::prelude::*;

declare_id!("3WMgLss6hFb7z99fuPf8uWT49ifFd3DwKetgAhov7zJN");

#[program]
pub mod tic_tac_toe {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        game.board = [[None; 3]; 3];
        game.current_player = true; // true for X, false for O
        game.is_active = true;
        Ok(())
    }

    pub fn make_move(ctx: Context<MakeMove>, row: u8, col: u8) -> Result<()> {
        let game = &mut ctx.accounts.game;

        require!(game.is_active, TicTacToeError::GameEnded);
        require!(row < 3 && col < 3, TicTacToeError::InvalidMove);
        require!(game.board[row as usize][col as usize].is_none(), TicTacToeError::SpaceTaken);

        // Make the move
        game.board[row as usize][col as usize] = Some(game.current_player);

        // Check for win
        if check_win(game.board, game.current_player) {
            game.is_active = false;
            msg!("Player {:?} wins!", if game.current_player { "X" } else { "O" });
        } else if is_board_full(game.board) {
            game.is_active = false;
            msg!("It's a draw!");
        } else {
            // Switch player
            game.current_player = !game.current_player;
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = player, space = 64)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub player: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MakeMove<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    pub player: Signer<'info>,
}

#[account]
pub struct Game {
    board: [[Option<bool>; 3]; 3],
    current_player: bool,
    is_active: bool,
}

#[error_code]
pub enum TicTacToeError {
    #[msg("The game has already ended")]
    GameEnded,
    #[msg("The move is invalid")]
    InvalidMove,
    #[msg("The space is already taken")]
    SpaceTaken,
}

fn check_win(board: [[Option<bool>; 3]; 3], player: bool) -> bool {
    for i in 0..3 {
        if (0..3).all(|j| board[i][j] == Some(player)) ||
           (0..3).all(|j| board[j][i] == Some(player)) {
            return true;
        }
    }
    if (0..3).all(|i| board[i][i] == Some(player)) ||
       (0..3).all(|i| board[i][2-i] == Some(player)) {
        return true;
    }
    false
}

fn is_board_full(board: [[Option<bool>; 3]; 3]) -> bool {
    board.iter().all(|row| row.iter().all(|cell| cell.is_some()))
}
