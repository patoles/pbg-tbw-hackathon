import {
	PublicKey,
	Transaction,
	TransactionInstruction,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { getWalletConnection, sendTransaction } from '@/utils/web3/solana';
import SnakeIDL from '../IDL/snake';

// Constants from the smart contract
const PROGRAM_ID = new PublicKey(SnakeIDL.address);
const GAME_STATE_SEED = 'game_state';
const GAME_VAULT_SEED = 'game_vault';
const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

export const joinGame = async (
	player1PublicKey: PublicKey,
	mintAddress = USDC_MINT
) => {
	try {
		const connection = await getWalletConnection();
		const player2PublicKey = window.solana.publicKey;

		// Derive game state PDA
		const [gameStateAccount] = PublicKey.findProgramAddressSync(
			[Buffer.from(GAME_STATE_SEED), player1PublicKey.toBuffer()],
			PROGRAM_ID
		);

		// Derive game vault PDA
		const [gameVaultAccount] = PublicKey.findProgramAddressSync(
			[Buffer.from(GAME_VAULT_SEED), player1PublicKey.toBuffer()],
			PROGRAM_ID
		);

		// Get player2's associated token account
		const player2TokenAccount = await getAssociatedTokenAddress(
			mintAddress,
			player2PublicKey
		);

		// Create instruction data buffer
		const dataLayout = Buffer.alloc(8); // 8 bytes for discriminator

		// Write the discriminator (8 bytes)
		const discriminator =
			SnakeIDL.instructions.find((item) => item.name === 'join_game')
				?.discriminator || [];

		discriminator.forEach((byte, index) => {
			dataLayout.writeUInt8(byte, index);
		});

		// Create instruction
		const instruction = new TransactionInstruction({
			keys: [
				{ pubkey: gameStateAccount, isSigner: false, isWritable: true }, // game
				{ pubkey: player1PublicKey, isSigner: false, isWritable: false }, // player1
				{ pubkey: player2PublicKey, isSigner: true, isWritable: true }, // player2
				{ pubkey: gameVaultAccount, isSigner: false, isWritable: true }, // game_vault
				{ pubkey: player2TokenAccount, isSigner: false, isWritable: true }, // player2_token_account
				{ pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // token_program
			],
			programId: PROGRAM_ID,
			data: dataLayout,
		});

		// Create transaction
		const transaction = new Transaction().add(instruction);

		try {
			const signature = await sendTransaction(
				connection,
				transaction,
				player2PublicKey
			);
			return signature;
		} catch (error) {
			console.error('Transaction failed:', error);
			throw error;
		}
	} catch (error) {
		console.error('Error joining game:', error);
		throw new Error(`Failed to join game: ${error.message}`);
	}
};
