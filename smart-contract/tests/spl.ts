import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";
import { 
  TOKEN_PROGRAM_ID,
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAssociatedTokenAddress,
  getAccount,
  transfer
} from "@solana/spl-token";

describe("BONK token test", () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const payer = anchor.web3.Keypair.generate();
  
  // Create 5 holders
  const holders = Array(5).fill(null).map(() => ({
    keypair: anchor.web3.Keypair.generate(),
    tokenAccount: null as anchor.web3.PublicKey | null
  }));

  let bonkMint: anchor.web3.PublicKey;
  const DECIMALS = 9;
  const INITIAL_SUPPLY = 1_000_000_000_000; // 1 trillion BONK
  const HOLDER_INITIAL_AMOUNT = 100_000_000_000; // 100 billion BONK per holder

  before(async () => {
    // Airdrop SOL to payer
    const signature = await provider.connection.requestAirdrop(
      payer.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);
  });

  async function createBonkToken() {
    try {
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

      // Create token accounts for all holders
      for (let holder of holders) {
        holder.tokenAccount = await createAssociatedTokenAccount(
          provider.connection,
          payer,
          bonkMint,
          holder.keypair.publicKey
        );

        // Mint initial amount to each holder
        await mintTo(
          provider.connection,
          payer,
          bonkMint,
          holder.tokenAccount!,
          payer,
          HOLDER_INITIAL_AMOUNT
        );
      }

      return bonkMint;
    } catch (error) {
      console.error("Error creating BONK token:", error);
      throw error;
    }
  }

  async function getTokenBalance(tokenAccount: anchor.web3.PublicKey): Promise<number> {
    const account = await getAccount(provider.connection, tokenAccount);
    return Number(account.amount);
  }

  it("Creates BONK token with correct parameters", async () => {
    await createBonkToken();

    const mintInfo = await provider.connection.getParsedAccountInfo(bonkMint);
    expect(mintInfo).to.not.be.null;

    const data: any = mintInfo.value?.data;
    expect(data.parsed.info.decimals).to.equal(DECIMALS);
    expect(data.parsed.info.mintAuthority).to.equal(payer.publicKey.toString());
  });

  it("Verifies initial balance for all holders", async () => {
    for (let i = 0; i < holders.length; i++) {
      const balance = await getTokenBalance(holders[i].tokenAccount!);
      expect(balance).to.equal(HOLDER_INITIAL_AMOUNT);
    }
  });

  it("Transfers BONK between holders", async () => {
    const TRANSFER_AMOUNT = 50_000_000_000; // 50 billion BONK
    
    // Transfer from holder 0 to holder 1
    await transfer(
      provider.connection,
      payer,
      holders[0].tokenAccount!,
      holders[1].tokenAccount!,
      holders[0].keypair,
      TRANSFER_AMOUNT
    );

    // Verify balances after transfer
    const sender_balance = await getTokenBalance(holders[0].tokenAccount!);
    const receiver_balance = await getTokenBalance(holders[1].tokenAccount!);

    expect(sender_balance).to.equal(HOLDER_INITIAL_AMOUNT - TRANSFER_AMOUNT);
    expect(receiver_balance).to.equal(HOLDER_INITIAL_AMOUNT + TRANSFER_AMOUNT);
  });

  it("Performs multi-party transfers", async () => {
    const TRANSFER_AMOUNT = 10_000_000_000; // 10 billion BONK

    // Holder 2 sends to holders 3 and 4
    await transfer(
      provider.connection,
      payer,
      holders[2].tokenAccount!,
      holders[3].tokenAccount!,
      holders[2].keypair,
      TRANSFER_AMOUNT
    );

    await transfer(
      provider.connection,
      payer,
      holders[2].tokenAccount!,
      holders[4].tokenAccount!,
      holders[2].keypair,
      TRANSFER_AMOUNT
    );

    // Verify all balances
    const holder2Balance = await getTokenBalance(holders[2].tokenAccount!);
    const holder3Balance = await getTokenBalance(holders[3].tokenAccount!);
    const holder4Balance = await getTokenBalance(holders[4].tokenAccount!);

    expect(holder2Balance).to.equal(HOLDER_INITIAL_AMOUNT - (2 * TRANSFER_AMOUNT));
    expect(holder3Balance).to.equal(HOLDER_INITIAL_AMOUNT + TRANSFER_AMOUNT);
    expect(holder4Balance).to.equal(HOLDER_INITIAL_AMOUNT + TRANSFER_AMOUNT);
  });


});
