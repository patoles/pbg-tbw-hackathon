import {
	PublicKey,
	SystemProgram,
	SYSVAR_RENT_PUBKEY,
	Transaction,
	TransactionInstruction,
} from '@solana/web3.js';
import {
	TOKEN_PROGRAM_ID,
	NATIVE_MINT,
	getAssociatedTokenAddress,
	createAssociatedTokenAccountInstruction,
	createSyncNativeInstruction,
} from '@solana/spl-token';
import { getWalletConnection, sendTransaction } from '@/utils/web3/solana';
import { unitToDecimal } from '../utils';
import SnakeIDL from '../IDL/snake';

// Constants from the smart contract
const PROGRAM_ID = new PublicKey(SnakeIDL.address);
const GAME_STATE_SEED = 'game_state';
const GAME_VAULT_SEED = 'game_vault';
//const JTO_MINT = new PublicKey('bzSvVHBjJFE3jDNJ5fhgNG23HZBW2jDUWHUaYLYdbv5');
//const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

export const createGame = async (betAmount: number, mint: string) => {
	try {
		const mintAddress = new PublicKey(mint);
		//		betAmount = Math.round(betAmount * 1000000);
		betAmount = unitToDecimal(betAmount, mint);
		const connection = await getWalletConnection();

		// Get the user's public key and recipient's public key
		const playerPublicKey = window.solana.publicKey;
		const transaction = new Transaction();

		// Derive game state PDA
		const [gameStateAccount] = PublicKey.findProgramAddressSync(
			[Buffer.from(GAME_STATE_SEED), playerPublicKey.toBuffer()],
			PROGRAM_ID
		);

		// Derive game vault PDA
		const [gameVaultAccount] = PublicKey.findProgramAddressSync(
			[Buffer.from(GAME_VAULT_SEED), playerPublicKey.toBuffer()],
			PROGRAM_ID
		);

		// Get player's associated token account
		const playerTokenAccount = await getAssociatedTokenAddress(
			mintAddress,
			playerPublicKey
		);

		// Game vault associated token account
		const gameTokenAccount = await getAssociatedTokenAddress(
			mintAddress,
			gameVaultAccount,
			true
		);

		// If using native SOL, we need to handle wrapping it to wSOL
		if (mintAddress === NATIVE_MINT) {
			// Check if the wSOL account exists
			const playerWSOLAccount = await connection.getAccountInfo(
				playerTokenAccount
			);

			// Calculate rent exemption for token account
			let playerRentExemption = 0;

			// If wSOL account doesn't exist, create it
			if (!playerWSOLAccount) {
				playerRentExemption =
					await connection.getMinimumBalanceForRentExemption(165);
				transaction.add(
					createAssociatedTokenAccountInstruction(
						playerPublicKey,
						playerTokenAccount,
						playerPublicKey,
						mintAddress
					)
				);
			}

			// Transfer SOL to WSOL account
			transaction.add(
				SystemProgram.transfer({
					fromPubkey: playerPublicKey,
					toPubkey: playerTokenAccount,
					lamports: betAmount + playerRentExemption,
				}),
				createSyncNativeInstruction(playerTokenAccount)
			);

			const gameWSOLAccount = await connection.getAccountInfo(gameTokenAccount);
			if (!gameWSOLAccount) {
				transaction.add(
					createAssociatedTokenAccountInstruction(
						playerPublicKey,
						gameTokenAccount,
						gameVaultAccount,
						NATIVE_MINT
					)
				);
			}

			console.log(
				`Amount: ${betAmount}\n`,
				`Rent: ${playerRentExemption}\n`,
				`playerPublicKey: ${playerPublicKey.toString()}\n`,
				`playerTokenAccount: ${playerTokenAccount.toString()}\n`,
				`gameTokenAccount: ${gameTokenAccount.toString()}\n`
			);
		}

		// Create instruction data buffer
		// First byte is instruction index (0 for create_game)
		// Following 8 bytes are the bet amount in little-endian
		const dataLayout = Buffer.alloc(16); // 8 bytes for discriminator + 1 byte for instruction index + 8 bytes for betAmount

		// Write the discriminator (8 bytes)
		const discriminator =
			SnakeIDL.instructions.find((item) => item.name === 'create_game')
				?.discriminator || [];

		discriminator.forEach((byte, index) => {
			dataLayout.writeUInt8(byte, index);
		});
		// Write the instruction index (0 for create_game)
		dataLayout.writeUInt8(0, 8); // Instruction index at byte 8
		// Write the bet amount in little-endian (next 8 bytes)
		dataLayout.writeBigUInt64LE(BigInt(betAmount), 8);

		// Create instruction
		const instruction = new TransactionInstruction({
			keys: [
				{ pubkey: gameStateAccount, isSigner: false, isWritable: true },
				{
					pubkey: playerPublicKey,
					isSigner: true,
					isWritable: true,
				},
				{
					pubkey: mintAddress,
					isSigner: false,
					isWritable: false,
				},
				{ pubkey: gameVaultAccount, isSigner: false, isWritable: true },
				{ pubkey: playerTokenAccount, isSigner: false, isWritable: true },
				{
					pubkey: SystemProgram.programId,
					isSigner: false,
					isWritable: false,
				},
				{ pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
				{ pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
			],
			programId: PROGRAM_ID,
			data: dataLayout,
		});

		// Create and send transaction

		transaction.add(instruction);

		try {
			const signature = await sendTransaction(
				connection,
				transaction,
				playerPublicKey
			);
			return signature;
		} catch (error) {
			console.error('Transaction failed:', error);
		}
	} catch (error) {
		console.error('Error creating game:', error);
		throw new Error(`Failed to create game: ${error.message}`);
	}
};
