import {
	clusterApiUrl,
	Connection,
	Keypair,
	PublicKey,
	Transaction,
	TransactionInstruction,
	SystemProgram,
	SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import {
	TOKEN_PROGRAM_ID,
	getAssociatedTokenAddress,
	ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

import SnakeIDL from '../IDL/snake';

// Constants from the smart contract
const PROGRAM_ID = new PublicKey(SnakeIDL.address);
const GAME_STATE_SEED = 'game_state';
const GAME_VAULT_SEED = 'game_vault';
const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');
const OWNER_WALLET = new PublicKey(
	'Dv63wb4XCtPFFPkuzszEZTyEVtv7bZ5eFSaYKT1AHWKf'
);

// player1: public key of the player who created the game, we need it to find the the game account PDA (since games are indexed by player1's public key)
// winner: public key of the winner of the game, we need it to transfer the game's funds to the winner
export const handleEndGame = async (
	player1: string,
	winner: string,
	mint: string
) => {
	try {
		// Initialize connection
		// const connection = new Connection(process.env.SOLANA_RPC_URL!, 'confirmed');
		const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

		// Initialize server keypair from environment secret
		const serverKeypair = Keypair.fromSecretKey(
			Buffer.from(JSON.parse(process.env.SERVER_PRIVATE_KEY!))
		);

		const signature = await endGame(
			connection,
			serverKeypair,
			new PublicKey(player1),
			new PublicKey(winner),
			new PublicKey(mint)
		);

		return signature;
	} catch (error) {
		console.error('Failed to handle end game:', error);
		throw error;
	}
};

export const endGame = async (
	connection: Connection,
	serverKeypair: Keypair,
	player1PublicKey: PublicKey,
	winnerPublicKey: PublicKey,
	mintAddress = USDC_MINT
) => {
	try {
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

		// Get winner's associated token account
		const winnerTokenAccount = await getAssociatedTokenAddress(
			mintAddress,
			winnerPublicKey
		);

		// Get owner's associated token account for fees
		const ownerTokenAccount = await getAssociatedTokenAddress(
			mintAddress,
			OWNER_WALLET
		);

		// Create instruction data buffer
		const dataLayout = Buffer.alloc(40); // 8 bytes for discriminator + 32 bytes for winner pubkey

		// Write the discriminator (8 bytes)
		const discriminator =
			SnakeIDL.instructions.find((item) => item.name === 'end_game')
				?.discriminator || [];

		discriminator.forEach((byte, index) => {
			dataLayout.writeUInt8(byte, index);
		});

		// Write the winner's public key (32 bytes)
		const winnerPubkeyBytes = winnerPublicKey.toBytes();
		for (let i = 0; i < 32; i++) {
			dataLayout.writeUInt8(winnerPubkeyBytes[i], i + 8);
		}

		// Create instruction
		const instruction = new TransactionInstruction({
			keys: [
				// Each account explicitly mapped to EndGame struct
				{ pubkey: gameStateAccount, isSigner: false, isWritable: true }, // game
				{ pubkey: winnerPublicKey, isSigner: false, isWritable: true }, // winner
				{ pubkey: gameVaultAccount, isSigner: false, isWritable: true }, // game_vault
				{ pubkey: winnerTokenAccount, isSigner: false, isWritable: true }, // winner_token_account
				{ pubkey: ownerTokenAccount, isSigner: false, isWritable: true }, // owner_token_account
				{ pubkey: OWNER_WALLET, isSigner: false, isWritable: false }, // owner
				{ pubkey: mintAddress, isSigner: false, isWritable: false }, // mint
				{ pubkey: serverKeypair.publicKey, isSigner: true, isWritable: false }, // server
				{
					pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
					isSigner: false,
					isWritable: false,
				}, // associated_token_program
				{ pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
				{ pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }, // rent
				{ pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // token_program
			],
			programId: PROGRAM_ID,
			data: dataLayout,
		});

		// Create transaction
		const transaction = new Transaction();

		// Get latest blockhash
		const { blockhash } = await connection.getLatestBlockhash();
		transaction.recentBlockhash = blockhash;
		transaction.feePayer = serverKeypair.publicKey;

		// Add instruction to transaction
		transaction.add(instruction);

		// Sign transaction with server keypair
		transaction.sign(serverKeypair);

		try {
			// Send and confirm transaction
			const signature = await connection.sendRawTransaction(
				transaction.serialize(),
				{
					skipPreflight: false,
					preflightCommitment: 'confirmed',
				}
			);

			// Wait for confirmation
			await connection.confirmTransaction(signature, 'confirmed');

			return signature;
		} catch (error) {
			console.error('Transaction failed:', error);
			throw error;
		}
	} catch (error) {
		console.error('Error ending game:', error);
		throw new Error(`Failed to end game: ${error.message}`);
	}
};
