/*

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SnakeGame } from "../target/types/snake_game";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount
} from "@solana/spl-token";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Keypair } from '@solana/web3.js';
import { expect } from 'chai';

describe("snake_game", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SnakeGame as Program<SnakeGame>;
  
  // We'll store these for use across tests
  let mint: PublicKey;
  let player1TokenAccount: PublicKey;
  let gameTokenAccount: PublicKey;
  let game: PublicKey;
  let gameBump: number;
  
  // Test accounts
  const SPLtokenHolder = Keypair.generate();
  const player1 = Keypair.generate();
  const betAmount = new anchor.BN(1000000); // 1 token with 6 decimals
  
  before(async () => {
    // Airdrop SOL to SPLtokenHolder for creating mint and token accounts
    const signatureSPL = await provider.connection.requestAirdrop(
      SPLtokenHolder.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signatureSPL);

    // Airdrop SOL to player1 for game creation and transactions
    const signaturePlayer = await provider.connection.requestAirdrop(
      player1.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signaturePlayer);
  });

  it("Initialize SPL token", async () => {
    // Create new token mint with SPLtokenHolder as mint authority
    mint = await createMint(
      provider.connection,
      SPLtokenHolder,  // payer
      SPLtokenHolder.publicKey,  // mint authority
      SPLtokenHolder.publicKey,  // freeze authority (optional)
      6 // 6 decimals
    );

    // Create token account for player1
    player1TokenAccount = await createAccount(
      provider.connection,
      player1,
      mint,
      player1.publicKey
    );

    // Create token account for SPLtokenHolder
    const splTokenAccount = await createAccount(
      provider.connection,
      SPLtokenHolder,
      mint,
      SPLtokenHolder.publicKey
    );

    // Mint initial supply to SPLtokenHolder
    await mintTo(
      provider.connection,
      SPLtokenHolder,
      mint,
      splTokenAccount,
      SPLtokenHolder.publicKey,
      10000000000 // 10,000 tokens with 6 decimals
    );

    // Transfer initial tokens to player1
    await mintTo(
      provider.connection,
      SPLtokenHolder,
      mint,
      player1TokenAccount,
      SPLtokenHolder.publicKey,
      2000000 // 2 tokens with 6 decimals
    );

    // Verify player1's balance
    const account = await getAccount(provider.connection, player1TokenAccount);
    expect(account.amount.toString()).to.equal("2000000");
  });

  it("Creates a new game", async () => {
    // Derive PDA for game account using the recommended method
    [game, gameBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("game"),
        player1.publicKey.toBuffer(),
      ],
      program.programId
    );

    // Create associated token account for the game
    gameTokenAccount = await getAssociatedTokenAddress(
      mint,
      game,
      true
    );

    await createAssociatedTokenAccount(
      provider.connection,
      player1,
      mint,
      game
    );

    try {
      const tx = await program.methods
        .createGame(betAmount)
        .accounts({
          game,
          player: player1.publicKey,
          mint,
          gameTokenAccount,
          playerTokenAccount: player1TokenAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([player1])
        .rpc();
      console.log("Transaction signature", tx);
    } catch (error) {
      console.error("Error creating game:", error);
    }
  });

  it("Fails to create game with zero bet amount", async () => {
    try {
      await program.methods
        .createGame(new anchor.BN(0))
        .accounts({
          game,
          player: player1.publicKey,
          mint,
          gameTokenAccount,
          playerTokenAccount: player1TokenAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([player1])
        .rpc();
      
      // Should not reach here
      expect.fail("Expected error for zero bet amount");
    } catch (error) {
      expect(error).to.be.an("error");
      expect(error.message).to.include("InvalidBetAmount");
    }
  });
});

*/