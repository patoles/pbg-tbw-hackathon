
use anchor_lang::prelude::*;

use anchor_spl::{
    token::{self, CloseAccount, Token, TokenAccount, Transfer},
    associated_token::AssociatedToken,
};

use anchor_lang::solana_program::clock::Clock;


// local
// declare_id!("369pQL1kJBnXt1LNUDWJLJ3PytabHM5JDgTiJmtAb9en");

// devnet
declare_id!("2GuaS2fgJQiaoauNnMLfzdkznSYek4Q1xPAG77NjC9oB");

// Constants
const JOIN_TIMEOUT: i64 = 300; // 10 minutes
// const JOIN_TIMEOUT: i64 = 30; // 10 minutes
const OWNER_FEE: u8 = 3; // 3%
const AUTHORIZED_SERVER: Pubkey = pubkey!("HXMYgkA65knTaYUaGKEDzJnpinG5ZwmMB5VaV7C2imgU");
const OWNER_WALLET: Pubkey = pubkey!("Dv63wb4XCtPFFPkuzszEZTyEVtv7bZ5eFSaYKT1AHWKf");
const GAME_STATE_SEED: &[u8] = b"game_state";
const GAME_VAULT_SEED: &[u8] = b"game_vault";

#[program]
pub mod snake_game {
    use super::*;

    pub fn create_game(ctx: Context<CreateGame>, bet_amount: u64) -> Result<()> {
        require!(bet_amount > 0, GameError::InvalidBetAmount);
        
        let clock = Clock::get()?;
        let current_time = clock.unix_timestamp;
        
        // Set initial state
        let game = &mut ctx.accounts.game;
        game.player1 = ctx.accounts.player.key();
        game.bet_amount = bet_amount;
        game.created_at = current_time;
        game.expires_at = current_time + JOIN_TIMEOUT;
        game.state = GameState::Created;
        game.mint = ctx.accounts.mint.key();

        // Transfer tokens from player's token account to game's token account
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.player_wallet.to_account_info(),
                to: ctx.accounts.game_vault.to_account_info(),
                authority: ctx.accounts.player.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, bet_amount)?;

        Ok(())
    }

    pub fn join_game(ctx: Context<JoinGame>) -> Result<()> {
        let bet_amount = ctx.accounts.game.bet_amount;
        
        // Transfer tokens from player2's token account to game's token account
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.player2_token_account.to_account_info(),
                to: ctx.accounts.game_vault.to_account_info(),
                authority: ctx.accounts.player2.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, bet_amount)?;

        // Update state
        let game = &mut ctx.accounts.game;
        game.player2 = Some(ctx.accounts.player2.key());
        game.state = GameState::InProgress;

        Ok(())
    }

    pub fn end_game(ctx: Context<EndGame>, winner: Pubkey) -> Result<()> {
        // Game must be in progress and not expired
        require!(ctx.accounts.game.state == GameState::InProgress, GameError::InvalidState);

        // Winner must be one of the players
        require!(
            winner == ctx.accounts.game.player1 || winner == ctx.accounts.game.player2.unwrap(),
            GameError::InvalidWinner
        );
    
        // Calculate prizes
        let total_prize = ctx.accounts.game_vault.amount; // Get actual total amount from vault
        let owner_fee = (total_prize as u64 * OWNER_FEE as u64) / 100;
        let winner_prize = total_prize - owner_fee;
    
        // Transfer winner prize
        let player1_key = ctx.accounts.game.player1;
        let game_seeds = &[
            GAME_STATE_SEED,
            player1_key.as_ref(),
            &[ctx.bumps.game],
        ];
        let signer = &[&game_seeds[..]];
    
        let winner_transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.game_vault.to_account_info(),
                to: ctx.accounts.winner_token_account.to_account_info(),
                authority: ctx.accounts.game.to_account_info(),
            },
            signer,
        );
        token::transfer(winner_transfer_ctx, winner_prize)?;
    
        // Transfer owner fee
        let fee_transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.game_vault.to_account_info(),
                to: ctx.accounts.owner_token_account.to_account_info(),
                authority: ctx.accounts.game.to_account_info(),
            },
            signer,
        );
        token::transfer(fee_transfer_ctx, owner_fee)?;
    
        // Update state
        ctx.accounts.game.state = GameState::Finished;

        // Close the token account
        let close_vault_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            CloseAccount {
                account: ctx.accounts.game_vault.to_account_info(),
                destination: ctx.accounts.winner.to_account_info(),
                authority: ctx.accounts.game.to_account_info(),
            },
            signer,
        );
        token::close_account(close_vault_ctx)?;

        // Close the game state account and transfer rent to winner
        ctx.accounts.game.close(ctx.accounts.winner.to_account_info())?;

        Ok(())
    }

    pub fn withdraw_timeout(ctx: Context<WithdrawTimeout>) -> Result<()> {
        let clock = Clock::get()?;
        let current_time = clock.unix_timestamp;
    
        // Waiting Time must be expired to withdraw. Prevent Spam and dust attacks
        require!(current_time > ctx.accounts.game.expires_at, GameError::NotExpired);

        // Game must be in Created state (prevent Inprogress and Finish state to withdraw)
        // require!(ctx.accounts.game.state == GameState::Created, GameError::InvalidState);

        let bet_amount = ctx.accounts.game.bet_amount;
    
        // // Transfer tokens back to player using CPI
        let player_key = ctx.accounts.player.key();
        let game_seeds = &[
            GAME_STATE_SEED,
            player_key.as_ref(),
            &[ctx.bumps.game],
        ];
        let signer = &[&game_seeds[..]];
    
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.game_vault.to_account_info(),
                to: ctx.accounts.player_wallet.to_account_info(),
                authority: ctx.accounts.game.to_account_info(),
            },
            signer,
        );
        token::transfer(transfer_ctx, bet_amount)?;
    
        let close_vault_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            CloseAccount {
                account: ctx.accounts.game_vault.to_account_info(),
                destination: ctx.accounts.player.to_account_info(),
                authority: ctx.accounts.game.to_account_info(),
            },
            signer,
        );
        token::close_account(close_vault_ctx)?;
    
        // Close the game state account and transfer rent to player
        ctx.accounts.game.close(ctx.accounts.player.to_account_info())?;
    
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum GameState {
    Created,
    InProgress,
    Finished,
}

#[account]
pub struct Game {
    player1: Pubkey,
    player2: Option<Pubkey>,
    bet_amount: u64,
    created_at: i64,
    expires_at: i64,
    state: GameState,
    mint: Pubkey,
}

const GAME_SIZE: usize = 8 +  // discriminator
    32 + // player1 pubkey
    33 + // player2 optional pubkey (32 + 1 for option)
    8 +  // bet_amount
    16 + // timestamps (created_at + expires_at)
    1 +  // state
    32;  // mint

#[derive(Accounts)]
pub struct CreateGame<'info> {
    #[account(
        init,
        payer = player,
        space = GAME_SIZE,
        seeds = [GAME_STATE_SEED, player.key().as_ref()],
        bump
    )]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub player: Signer<'info>,
    pub mint: Account<'info, token::Mint>,
    #[account(
        init,
        payer = player,
        seeds = [GAME_VAULT_SEED, player.key().as_ref()],
        bump,
        token::mint = mint,
        token::authority = game,
    )]
    pub game_vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = player_wallet.mint == mint.key(),
        constraint = player_wallet.owner == player.key(),
    )]
    pub player_wallet: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct JoinGame<'info> {
    #[account(
        mut,
        seeds = [GAME_STATE_SEED, game.player1.as_ref()],
        bump,
        constraint = game.player1 == *player1.key @ GameError::InvalidPlayer,
        constraint = game.state == GameState::Created @ GameError::InvalidState,
        constraint = Clock::get().unwrap().unix_timestamp <= game.expires_at @ GameError::JoinTimeoutExpired,
    )]
    pub game: Account<'info, Game>,
    /// CHECK: This is the first player's account
    pub player1: AccountInfo<'info>,
    #[account(mut)]
    pub player2: Signer<'info>,
    #[account(
        mut,
        seeds = [GAME_VAULT_SEED, game.player1.as_ref()],
        bump,
        constraint = game_vault.mint == game.mint,
        constraint = game_vault.owner == game.key(),
    )]
    pub game_vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = player2_token_account.mint == game.mint,
        constraint = player2_token_account.owner == player2.key(),
    )]
    pub player2_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct EndGame<'info> {
    #[account(
        mut,
        seeds = [GAME_STATE_SEED, game.player1.as_ref()],
        bump,
    )]
    pub game: Account<'info, Game>,
    /// CHECK: This account is checked in the instruction to be either player1 or player2
    #[account(mut)]
    pub winner: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [GAME_VAULT_SEED, game.player1.as_ref()],
        bump,
        constraint = game_vault.mint == game.mint @ GameError::InvalidMint,
        constraint = game_vault.owner == game.key() @ GameError::InvalidOwner,
    )]
    pub game_vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = winner_token_account.mint == game.mint @ GameError::InvalidMint,
        constraint = winner_token_account.owner == winner.key() @ GameError::InvalidWinnerTokenAccount,
    )]
    pub winner_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed, // Anchor's built-in constraints to initialize it automatically
        payer = server,  // server pays for creating owner's token account ???
        associated_token::mint = mint,
        associated_token::authority = owner,
    )]
    pub owner_token_account: Account<'info, TokenAccount>,
    /// CHECK: This is the owner wallet
    #[account(
        constraint = owner.key() == OWNER_WALLET
    )]
    pub owner: AccountInfo<'info>,
    pub mint: Account<'info, token::Mint>,


    #[account(
        mut,
        constraint = server.key() == AUTHORIZED_SERVER @ GameError::InvalidServer
    )]
    pub server: Signer<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>, // needed to create associated token if doesn't exists
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,

}

#[derive(Accounts)]
pub struct WithdrawTimeout<'info> {
    #[account(
        mut,
        seeds = [GAME_STATE_SEED, game.player1.as_ref()],
        bump,
        // Only creator of the game can withdraw
        constraint = game.player1 == player.key() @ GameError::InvalidPlayer,
        // Must be in Created state (prevent Inprogress and Finish state to withdraw)
        // constraint = game.state == GameState::Created @ GameError::InvalidState,
    )]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub player: Signer<'info>,
    #[account(
        mut,
        seeds = [GAME_VAULT_SEED, game.player1.as_ref()],
        bump,
        constraint = game_vault.mint == game.mint,
        constraint = game_vault.owner == game.key(),
    )]
    pub game_vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = player_wallet.mint == game.mint,
        constraint = player_wallet.owner == player.key(),
    )]
    pub player_wallet: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum GameError {
    InvalidBetAmount,
    JoinTimeoutExpired,
    NotExpired,
    InvalidState,
    InvalidWinner,
    InvalidWinnerTokenAccount,
    InvalidPlayer,
    InvalidServer,
    InvalidMint,
    InvalidOwner,
    // InsufficientFunds,
}
