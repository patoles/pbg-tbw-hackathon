import {
	PublicKey,
	Transaction,
	TransactionInstruction,
} from '@solana/web3.js';
import {
	TOKEN_PROGRAM_ID,
	getAssociatedTokenAddress,
	NATIVE_MINT,
} from '@solana/spl-token';
import { getWalletConnection, sendTransaction } from '@/utils/web3/solana';
import SnakeIDL from '../IDL/snake';

// Constants from the smart contract
const PROGRAM_ID = new PublicKey(SnakeIDL.address);
const GAME_STATE_SEED = 'game_state';
const GAME_VAULT_SEED = 'game_vault';
//const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

export const withdrawTimeout = async (mintAddress = NATIVE_MINT) => {
	try {
		const connection = await getWalletConnection();
		const playerPublicKey = window.solana.publicKey;

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

		// Create instruction data buffer
		const dataLayout = Buffer.alloc(8); // 8 bytes for discriminator

		// Write the discriminator (8 bytes)
		const discriminator =
			SnakeIDL.instructions.find((item) => item.name === 'withdraw_timeout')
				?.discriminator || [];

		discriminator.forEach((byte, index) => {
			dataLayout.writeUInt8(byte, index);
		});

		// Create instruction
		const instruction = new TransactionInstruction({
			keys: [
				{ pubkey: gameStateAccount, isSigner: false, isWritable: true },
				{ pubkey: playerPublicKey, isSigner: true, isWritable: true },
				{ pubkey: gameVaultAccount, isSigner: false, isWritable: true },
				{ pubkey: playerTokenAccount, isSigner: false, isWritable: true },
				{ pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
			],
			programId: PROGRAM_ID,
			data: dataLayout,
		});

		// Create and send transaction
		const transaction = new Transaction().add(instruction);

		try {
			const signature = await sendTransaction(
				connection,
				transaction,
				playerPublicKey
			);
			return signature;
		} catch (error) {
			console.error('Transaction failed:', error);
			throw error;
		}
	} catch (error) {
		console.error('Error withdrawing timeout:', error);
		throw new Error(`Failed to withdraw timeout: ${error.message}`);
	}
};
