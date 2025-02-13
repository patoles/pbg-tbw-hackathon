/*

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SnakeGame } from "../target/types/snake_game";
import { expect } from "chai";
import { 
  LAMPORTS_PER_SOL, 
  SystemProgram,
  PublicKey,
  Keypair,
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";

const OWNER_FEE_PERCENTAGE = 3;
const BET_AMOUNT_TOKEN = 2;
const FUND_AMOUNT_TOKEN = 50;
const TEST_GAME_WAITING_TIME = 3000; // 3 seconds

describe("snake-game", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.AnchorProvider.env();
  const program = anchor.workspace.SnakeGame as Program<SnakeGame>;

  const player1 = anchor.web3.Keypair.generate();
  const player2 = anchor.web3.Keypair.generate();
  const server = anchor.web3.Keypair.generate();
  const owner = anchor.web3.Keypair.generate();
  const payer = anchor.web3.Keypair.generate(); // Added payer for token operations

  // New variables for token handling
  let mint: PublicKey;
  let player1TokenAccount: PublicKey;
  let player2TokenAccount: PublicKey;
  let ownerTokenAccount: PublicKey;
  
  const BET_AMOUNT = new anchor.BN(BET_AMOUNT_TOKEN * 1_000_000); // Assuming 6 decimals

  const fundAccount = async (account: anchor.web3.Keypair, amount: number) => {
    const sig = await provider.connection.requestAirdrop(
      account.publicKey,
      amount * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sig);
  };

  before(async () => {
    // Fund accounts with SOL for transaction fees
    await fundAccount(payer, 10);
    await fundAccount(player1, 10);
    await fundAccount(player2, 10);
    await fundAccount(owner, 10);

    // Create mint
    mint = await createMint(
      provider.connection,
      payer, // payer
      payer.publicKey, // mint authority
      null, // freeze authority
      6 // decimals
    );

    // Create associated token accounts
    const p1TokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer,
      mint,
      player1.publicKey
    );
    player1TokenAccount = p1TokenAccount.address;

    const p2TokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer,
      mint,
      player2.publicKey
    );
    player2TokenAccount = p2TokenAccount.address;

    const ownerTokenAcc = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer,
      mint,
      owner.publicKey
    );
    ownerTokenAccount = ownerTokenAcc.address;

    // Mint tokens to players
    await mintTo(
      provider.connection,
      payer,
      mint,
      player1TokenAccount,
      payer.publicKey,
      FUND_AMOUNT_TOKEN * 1_000_000
    );

    await mintTo(
      provider.connection,
      payer,
      mint,
      player2TokenAccount,
      payer.publicKey,
      FUND_AMOUNT_TOKEN * 1_000_000
    );
  });

  describe("Game Creation", () => {
    it("should create a new game", async () => {
      // Find PDA for game account
      const [gameKey] = PublicKey.findProgramAddressSync(
        [Buffer.from("game"), player1.publicKey.toBuffer()],
        program.programId
      );

      // Create a normal keypair for the game's token account
      const gameTokenAccount = Keypair.generate();

      await program.methods
        .createGame(BET_AMOUNT)
        .accounts({
          game: gameKey,
          player: player1.publicKey,
          mint: mint,
          gameTokenAccount: gameTokenAccount.publicKey,
          playerTokenAccount: player1TokenAccount,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([player1, gameTokenAccount]) // Include gameTokenAccount keypair
        .rpc();

      const gameState = await program.account.game.fetch(gameKey);
      
      expect(gameState.player1.toBase58()).to.equal(player1.publicKey.toBase58());
      expect(gameState.betAmount.toString()).to.equal(BET_AMOUNT.toString());
      expect(gameState.state).to.deep.equal({ created: {} });
      expect(gameState.mint.toBase58()).to.equal(mint.toBase58());
    });

    // Other tests...
  });
});

*/