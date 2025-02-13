/*
I give you a solana contract and its test.  
Add the tests to 
* Should not allow non-server to end game
* Should not allow declaring non-player as winner
* 
Only output me the test functiom, not the full code

*/

import fs from 'fs';
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";
import { SnakeGame } from "../target/types/snake_game";
import { 
  TOKEN_PROGRAM_ID,
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAccount,
  transfer
} from "@solana/spl-token";

describe("BONK token and Snake Game tests", () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.SnakeGame as Program<SnakeGame>;
  const payer = anchor.web3.Keypair.generate();
  let bonkMint: anchor.web3.PublicKey;
  
  const DECIMALS = 9;
  const HOLDER_INITIAL_AMOUNT = 100_000_000_000; // 100 billion BONK per holder
  const BET_AMOUNT = 1_000_000_000; // 1 billion BONK for game bet
  const GAME_STATE_SEED = "game_state";
  const GAME_VAULT_SEED = "game_vault";

  const OWNER_WALLET = new anchor.web3.PublicKey("Dv63wb4XCtPFFPkuzszEZTyEVtv7bZ5eFSaYKT1AHWKf");

  const serverKeypair = anchor.web3.Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync('server-keypair.json', 'utf-8')))
  );


  // Helper function to setup a new player
  async function setupPlayer(): Promise<{
    keypair: anchor.web3.Keypair;
    tokenAccount: anchor.web3.PublicKey;
  }> {
    const keypair = anchor.web3.Keypair.generate();
    await provider.connection.requestAirdrop(
      keypair.publicKey,
      anchor.web3.LAMPORTS_PER_SOL
    );

    const tokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      payer,
      bonkMint,
      keypair.publicKey
    );

    await mintTo(
      provider.connection,
      payer,
      bonkMint,
      tokenAccount,
      payer,
      HOLDER_INITIAL_AMOUNT
    );

    return { keypair, tokenAccount };
  }

  // Helper to get game PDAs
  function getPDAs(player: anchor.web3.PublicKey) {
    const [gamePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(GAME_STATE_SEED), player.toBuffer()],
      program.programId
    );

    const [gameVault] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(GAME_VAULT_SEED), player.toBuffer()],
      program.programId
    );

    return { gamePda, gameVault };
  }

  before(async () => {
    // Airdrop SOL to payer
    const signature = await provider.connection.requestAirdrop(
      payer.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    // Create BONK token once for all tests
    const mintKeypair = anchor.web3.Keypair.generate();
    bonkMint = await createMint(
      provider.connection,
      payer,
      payer.publicKey,
      payer.publicKey,
      DECIMALS,
      mintKeypair,
      undefined,
      TOKEN_PROGRAM_ID
    );

  });

  describe("Game Creation", () => {
    it("Successfully creates a new game with valid bet amount", async () => {
      const player = await setupPlayer();
      const { gamePda, gameVault } = getPDAs(player.keypair.publicKey);

      // Create game and record transaction time
      const txTime = Math.floor(Date.now() / 1000);
      
      await program.methods
        .createGame(new anchor.BN(BET_AMOUNT))
        .accounts({
          game: gamePda,
          player: player.keypair.publicKey,
          mint: bonkMint,
          gameVault: gameVault,
          playerWallet: player.tokenAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([player.keypair])
        .rpc();

      // Verify game account data
      const gameAccount = await program.account.game.fetch(gamePda);
      expect(gameAccount.player1.toString()).to.equal(player.keypair.publicKey.toString());
      expect(gameAccount.player2).to.be.null;
      expect(gameAccount.betAmount.toString()).to.equal(BET_AMOUNT.toString());
      expect(gameAccount.state).to.deep.equal({ created: {} });
      expect(gameAccount.mint.toString()).to.equal(bonkMint.toString());
      
      // Verify timestamp and expiration
      expect(Number(gameAccount.createdAt)).to.be.closeTo(txTime, 5);
      expect(Number(gameAccount.expiresAt)).to.equal(Number(gameAccount.createdAt) + 600);
      
      // Verify token transfers
      const gameTokenBalance = await getAccount(provider.connection, gameVault);
      expect(Number(gameTokenBalance.amount)).to.equal(BET_AMOUNT);
      
      const playerTokenBalance = await getAccount(provider.connection, player.tokenAccount);
      expect(Number(playerTokenBalance.amount)).to.equal(HOLDER_INITIAL_AMOUNT - BET_AMOUNT);
    });

    it("Should not create game with zero bet amount", async () => {
      const player = await setupPlayer();
      const { gamePda, gameVault } = getPDAs(player.keypair.publicKey);

      try {
        await program.methods
          .createGame(new anchor.BN(0))
          .accounts({
            game: gamePda,
            player: player.keypair.publicKey,
            mint: bonkMint,
            gameVault: gameVault,
            playerWallet: player.tokenAccount,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([player.keypair])
          .rpc();

        expect.fail("Transaction should have failed");
      } catch (error: any) {
        expect(error.error?.errorMessage).to.include("InvalidBetAmount");
      }
    });

    it("Should not create game with insufficient funds", async () => {
      const player = await setupPlayer();
      const { gamePda, gameVault } = getPDAs(player.keypair.publicKey);
      
      // Transfer out most tokens to create insufficient balance
      const drainAmount = HOLDER_INITIAL_AMOUNT - BET_AMOUNT + 1;
      const drainAccount = await createAssociatedTokenAccount(
        provider.connection,
        payer,
        bonkMint,
        payer.publicKey
      );
      
      await transfer(
        provider.connection,
        player.keypair,
        player.tokenAccount,
        drainAccount,
        player.keypair,
        drainAmount
      );

      try {
        await program.methods
          .createGame(new anchor.BN(BET_AMOUNT))
          .accounts({
            game: gamePda,
            player: player.keypair.publicKey,
            mint: bonkMint,
            gameVault: gameVault,
            playerWallet: player.tokenAccount,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([player.keypair])
          .rpc();

        expect.fail("Transaction should have failed");
      } catch (error: any) {
        expect(error.toString()).to.include("insufficient funds");
      }
    });

    it("Should not create game with invalid mint", async () => {
      const player = await setupPlayer();
      const { gamePda, gameVault } = getPDAs(player.keypair.publicKey);
      
      // Create a different mint
      const wrongMintKeypair = anchor.web3.Keypair.generate();
      const wrongMint = await createMint(
        provider.connection,
        payer,
        payer.publicKey,
        payer.publicKey,
        DECIMALS,
        wrongMintKeypair
      );

      try {
        await program.methods
          .createGame(new anchor.BN(BET_AMOUNT))
          .accounts({
            game: gamePda,
            player: player.keypair.publicKey,
            mint: wrongMint, // Use wrong mint
            gameVault: gameVault,
            playerWallet: player.tokenAccount,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([player.keypair])
          .rpc();

        expect.fail("Transaction should have failed");
      } catch (error: any) {
        // This should fail during account validation
        expect(error.toString()).to.include("Error");
      }
    });
  });

  describe("Join Game", () => {
    it("Should allow second player to join a game", async () => {
      // Setup players
      const player1 = await setupPlayer();
      const player2 = await setupPlayer();
      const { gamePda, gameVault } = getPDAs(player1.keypair.publicKey);
    
      // Create game with player1
      await program.methods
        .createGame(new anchor.BN(BET_AMOUNT))
        .accounts({
          game: gamePda,
          player: player1.keypair.publicKey,
          mint: bonkMint,
          gameVault: gameVault,
          playerWallet: player1.tokenAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([player1.keypair])
        .rpc();
    
      // Initial state check
      let gameAccount = await program.account.game.fetch(gamePda);
      expect(gameAccount.state).to.deep.equal({ created: {} });
      expect(gameAccount.player2).to.be.null;
    
      // Player2 joins the game
      await program.methods
        .joinGame()
        .accounts({
          game: gamePda,
          player1: player1.keypair.publicKey,
          player2: player2.keypair.publicKey,
          gameVault: gameVault,
          player2TokenAccount: player2.tokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([player2.keypair])
        .rpc();
    
      // Verify game state after player2 joins
      gameAccount = await program.account.game.fetch(gamePda);
      expect(gameAccount.player1.toString()).to.equal(player1.keypair.publicKey.toString());
      expect(gameAccount.player2?.toString()).to.equal(player2.keypair.publicKey.toString());
      expect(gameAccount.state).to.deep.equal({ inProgress: {} });
    
      // Verify token transfers
      const gameVaultBalance = await getAccount(provider.connection, gameVault);
      expect(Number(gameVaultBalance.amount)).to.equal(BET_AMOUNT * 2);
      
      const player2TokenBalance = await getAccount(provider.connection, player2.tokenAccount);
      expect(Number(player2TokenBalance.amount)).to.equal(HOLDER_INITIAL_AMOUNT - BET_AMOUNT);
    });
    
    it("Should not allow third player to join a game with two players", async () => {
      // Setup players
      const player1 = await setupPlayer();
      const player2 = await setupPlayer();
      const player3 = await setupPlayer();
      const { gamePda, gameVault } = getPDAs(player1.keypair.publicKey);
    
      // Create game with player1
      await program.methods
        .createGame(new anchor.BN(BET_AMOUNT))
        .accounts({
          game: gamePda,
          player: player1.keypair.publicKey,
          mint: bonkMint,
          gameVault: gameVault,
          playerWallet: player1.tokenAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([player1.keypair])
        .rpc();
    
      // Player2 joins the game
      await program.methods
        .joinGame()
        .accounts({
          game: gamePda,
          player1: player1.keypair.publicKey,
          player2: player2.keypair.publicKey,
          gameVault: gameVault,
          player2TokenAccount: player2.tokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([player2.keypair])
        .rpc();
    
      // Try to have player3 join the same game
      try {
        await program.methods
          .joinGame()
          .accounts({
            game: gamePda,
            player1: player1.keypair.publicKey,
            player2: player3.keypair.publicKey,
            gameVault: gameVault,
            player2TokenAccount: player3.tokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([player3.keypair])
          .rpc();
    
        expect.fail("Should not allow third player to join");
      } catch (error: any) {
        expect(error.error?.errorMessage).to.include("InvalidState");
      }
    
      // Verify game state hasn't changed
      const gameAccount = await program.account.game.fetch(gamePda);
      expect(gameAccount.player1.toString()).to.equal(player1.keypair.publicKey.toString());
      expect(gameAccount.player2?.toString()).to.equal(player2.keypair.publicKey.toString());
      expect(gameAccount.state).to.deep.equal({ inProgress: {} });
    });

  });

  describe("End Game", () => {

    it("Should successfully end game and distribute prize to winner", async () => {
      // Setup players and server
      const player1 = await setupPlayer();
      const player2 = await setupPlayer();      
      const { gamePda, gameVault } = getPDAs(player1.keypair.publicKey);
      
      // Create owner token account
      const ownerTokenAccount = await createAssociatedTokenAccount(
        provider.connection,
        payer,
        bonkMint,
        OWNER_WALLET
      );
    
      // Create game with player1
      await program.methods
        .createGame(new anchor.BN(BET_AMOUNT))
        .accounts({
          game: gamePda,
          player: player1.keypair.publicKey,
          mint: bonkMint,
          gameVault: gameVault,
          playerWallet: player1.tokenAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([player1.keypair])
        .rpc();
    
      // Player2 joins
      await program.methods
        .joinGame()
        .accounts({
          game: gamePda,
          player1: player1.keypair.publicKey,
          player2: player2.keypair.publicKey,
          gameVault: gameVault,
          player2TokenAccount: player2.tokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([player2.keypair])
        .rpc();
    
      // Record initial balances
      const initialPlayer1Balance = (await getAccount(provider.connection, player1.tokenAccount)).amount;
      const initialPlayer2Balance = (await getAccount(provider.connection, player2.tokenAccount)).amount;
      const initialOwnerBalance = (await getAccount(provider.connection, ownerTokenAccount)).amount;
    
      // End game with player1 as winner
      await program.methods
        .endGame(player1.keypair.publicKey)
        .accounts({
          game: gamePda,
          winner: player1.keypair.publicKey,
          gameVault: gameVault,
          winnerTokenAccount: player1.tokenAccount,
          ownerTokenAccount: ownerTokenAccount,
          server: serverKeypair.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([serverKeypair])
        .rpc();
    
      // Verify final state and balances
      const gameAccount = await program.account.game.fetch(gamePda);
      expect(gameAccount.state).to.deep.equal({ finished: {} });
    
      const totalPrizePool = BET_AMOUNT * 2;
      const ownerFee = Math.floor(totalPrizePool * 0.03); // 3% fee
      const winnerPrize = totalPrizePool - ownerFee;
    
      const finalPlayer1Balance = (await getAccount(provider.connection, player1.tokenAccount)).amount;
      const finalOwnerBalance = (await getAccount(provider.connection, ownerTokenAccount)).amount;
      
      expect(Number(finalPlayer1Balance) - Number(initialPlayer1Balance)).to.equal(winnerPrize);
      expect(Number(finalOwnerBalance) - Number(initialOwnerBalance)).to.equal(ownerFee);
    });
  

  });

  
});
