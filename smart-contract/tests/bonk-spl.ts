/*

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BonkSpl } from "../target/types/bonk_spl";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  createAssociatedTokenAccount,
  getAssociatedTokenAddress,
  getAccount,
} from "@solana/spl-token";
import { 
  PublicKey, 
  Keypair 
} from "@solana/web3.js";
import { expect } from "chai";

describe("bonk-spl", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.BonkSpl as Program<BonkSpl>;
  
  let mintKeypair: Keypair;
  let walletAta: PublicKey;
  
  // Multiple holder accounts
  let holder1Keypair: Keypair;
  let holder2Keypair: Keypair;
  let holder3Keypair: Keypair;
  let holder1Ata: PublicKey;
  let holder2Ata: PublicKey;
  let holder3Ata: PublicKey;

  const MINT_AMOUNT = 1_000_000;
  const TRANSFER_AMOUNT = 100_000;

  before(async () => {
    mintKeypair = Keypair.generate();
    holder1Keypair = Keypair.generate();
    holder2Keypair = Keypair.generate();
    holder3Keypair = Keypair.generate();

    // Airdrop SOL to payer
    const signature = await provider.connection.requestAirdrop(
      provider.wallet.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    // Create the mint account
    await createMint(
      provider.connection,
      provider.wallet.payer,
      provider.wallet.publicKey,
      provider.wallet.publicKey,
      6,
      mintKeypair,
      { commitment: 'confirmed' }
    );
  });

  it("Creates token accounts and mints initial supply", async () => {
    try {
      // Get ATA address for main wallet
      walletAta = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        provider.wallet.publicKey
      );

      // Create ATA for main wallet
      await createAssociatedTokenAccount(
        provider.connection,
        provider.wallet.payer,
        mintKeypair.publicKey,
        provider.wallet.publicKey,
        { commitment: 'confirmed' }
      );

      // Mint initial supply
      await program.methods
        .mintTokens(new anchor.BN(MINT_AMOUNT))
        .accounts({
          mint: mintKeypair.publicKey,
          tokenAccount: walletAta,
          payer: provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const walletAccount = await getAccount(provider.connection, walletAta);
      expect(Number(walletAccount.amount)).to.equal(MINT_AMOUNT);
      console.log("Initial supply minted successfully. Balance:", walletAccount.amount.toString());
    } catch (error) {
      console.error("Error in initial setup:", error);
      throw error;
    }
  });

  it("Distributes tokens to multiple holders and verifies balances", async () => {
    try {
      // Setup token accounts for all holders
      holder1Ata = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        holder1Keypair.publicKey
      );
      holder2Ata = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        holder2Keypair.publicKey
      );
      holder3Ata = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        holder3Keypair.publicKey
      );

      // Create ATAs for all holders
      await createAssociatedTokenAccount(
        provider.connection,
        provider.wallet.payer,
        mintKeypair.publicKey,
        holder1Keypair.publicKey,
        { commitment: 'confirmed' }
      );
      await createAssociatedTokenAccount(
        provider.connection,
        provider.wallet.payer,
        mintKeypair.publicKey,
        holder2Keypair.publicKey,
        { commitment: 'confirmed' }
      );
      await createAssociatedTokenAccount(
        provider.connection,
        provider.wallet.payer,
        mintKeypair.publicKey,
        holder3Keypair.publicKey,
        { commitment: 'confirmed' }
      );

      // Transfer to holder 1
      await program.methods
        .transfer(new anchor.BN(TRANSFER_AMOUNT))
        .accounts({
          mint: mintKeypair.publicKey,
          from: walletAta,
          to: holder1Ata,
          owner: provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      // Transfer to holder 2
      await program.methods
        .transfer(new anchor.BN(TRANSFER_AMOUNT * 2))
        .accounts({
          mint: mintKeypair.publicKey,
          from: walletAta,
          to: holder2Ata,
          owner: provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      // Transfer to holder 3
      await program.methods
        .transfer(new anchor.BN(TRANSFER_AMOUNT * 3))
        .accounts({
          mint: mintKeypair.publicKey,
          from: walletAta,
          to: holder3Ata,
          owner: provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      // Verify all balances
      const walletAccount = await getAccount(provider.connection, walletAta);
      const holder1Account = await getAccount(provider.connection, holder1Ata);
      const holder2Account = await getAccount(provider.connection, holder2Ata);
      const holder3Account = await getAccount(provider.connection, holder3Ata);

      // Calculate expected remaining balance
      const totalTransferred = TRANSFER_AMOUNT * 6; // 1x + 2x + 3x = 6x
      const expectedRemainingBalance = MINT_AMOUNT - totalTransferred;

      // Verify balances
      expect(Number(holder1Account.amount)).to.equal(TRANSFER_AMOUNT);
      expect(Number(holder2Account.amount)).to.equal(TRANSFER_AMOUNT * 2);
      expect(Number(holder3Account.amount)).to.equal(TRANSFER_AMOUNT * 3);
      expect(Number(walletAccount.amount)).to.equal(expectedRemainingBalance);

      // Log all balances
      console.log("\nFinal Balances:");
      console.log("Main Wallet:", walletAccount.amount.toString());
      console.log("Holder 1:", holder1Account.amount.toString(), `(${holder1Keypair.publicKey.toString()})`);
      console.log("Holder 2:", holder2Account.amount.toString(), `(${holder2Keypair.publicKey.toString()})`);
      console.log("Holder 3:", holder3Account.amount.toString(), `(${holder3Keypair.publicKey.toString()})`);
      console.log("Total Supply:", MINT_AMOUNT.toString());
      
      // Verify total supply hasn't changed
      const totalSupply = Number(walletAccount.amount) +
        Number(holder1Account.amount) +
        Number(holder2Account.amount) +
        Number(holder3Account.amount);
      expect(totalSupply).to.equal(MINT_AMOUNT);
      console.log("Supply verification passed!");

    } catch (error) {
      console.error("Error in multi-holder test:", error);
      throw error;
    }
  });
});

*/