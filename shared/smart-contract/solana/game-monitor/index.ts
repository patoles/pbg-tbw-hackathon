import {
	Connection,
	PublicKey,
	GetProgramAccountsFilter,
	AccountInfo,
} from '@solana/web3.js';

// Enum representation matching Rust
enum GameStateEnum {
	Created = 0,
	InProgress = 1,
	Finished = 2,
	Cancelled = 3,
}

interface GameState {
	player1: PublicKey;
	player2: PublicKey | null;
	betAmount: bigint;
	createdAt: bigint;
	expiresAt: bigint;
	state: GameStateEnum;
	mint: PublicKey;
}

export interface FormattedGameState {
	gameAddress: string;
	player1: string;
	player2?: string | null;
	betAmount: string;
	createdAt: Date;
	expiresAt: Date;
	previousState?: string;
	state: string;
	mint: string;
}

class GameMonitor {
	private connection: Connection;
	private programId: PublicKey;

	constructor(endpoint: string, programId: string) {
		this.connection = new Connection(endpoint);
		this.programId = new PublicKey(programId);
	}

	/**
	 * Get game state PDA for a specific player
	 */
	async getGameStatePDA(player: PublicKey): Promise<[PublicKey, number]> {
		return PublicKey.findProgramAddressSync(
			[Buffer.from('game_state'), player.toBuffer()],
			this.programId
		);
	}

	/**
	 * Monitor for new game creations
	 */
	async monitorGameCreation(callback: (gameData: FormattedGameState) => void) {
		// Subscribe to program account changes
		const subscriptionId = this.connection.onProgramAccountChange(
			this.programId,
			async (keyedAccountInfo) => {
				try {
					// Decode the account data
					const decoded = await this.decodeGameState(
						keyedAccountInfo.accountId,
						keyedAccountInfo.accountInfo
					);

					// Check if this is a new game creation
					if (decoded && decoded.state === GameStateEnum.Created) {
						callback({
							gameAddress: keyedAccountInfo.accountId.toString(),
							player1: decoded.player1.toString(),
							betAmount: decoded.betAmount.toString(),
							createdAt: new Date(Number(decoded.createdAt) * 1000),
							expiresAt: new Date(Number(decoded.expiresAt) * 1000),
							state: GameStateEnum[0],
							mint: decoded.mint.toString(),
						});
					}
				} catch (error) {
					console.error('Error processing game creation:', error);
				}
			}
		);

		return subscriptionId;
	}

	async monitorGameUpdates(
		callback: (gameData: FormattedGameState) => void,
		filters?: GameStateEnum[]
	): Promise<number> {
		const previousStates = new Map<string, GameStateEnum>();

		// Subscribe to program account changes
		const subscriptionId = this.connection.onProgramAccountChange(
			this.programId,
			async (keyedAccountInfo) => {
				try {
					// Decode the account data
					const decoded = await this.decodeGameState(
						keyedAccountInfo.accountId,
						keyedAccountInfo.accountInfo
					);

					if (!decoded) return;

					const gameAddress = keyedAccountInfo.accountId.toString();
					const previousState = previousStates.get(gameAddress);

					// If we have a previous state and it's different from current state
					if (previousState !== undefined && previousState !== decoded.state) {
						// Check if we should filter this state change
						if (filters && !filters.includes(decoded.state)) {
							previousStates.set(gameAddress, decoded.state);
							return;
						}

						callback({
							gameAddress,
							player1: decoded.player1.toString(),
							player2: decoded.player2?.toString() || null,
							betAmount: decoded.betAmount.toString(),
							createdAt: new Date(Number(decoded.createdAt) * 1000),
							expiresAt: new Date(Number(decoded.expiresAt) * 1000),
							previousState: GameStateEnum[previousState],
							state: GameStateEnum[decoded.state],
							mint: decoded.mint.toString(),
						});
					}

					// Update the previous state
					previousStates.set(gameAddress, decoded.state);
				} catch (error) {
					console.error('Error processing game update:', error);
				}
			}
		);

		// Initialize previous states with current games
		const currentGames = await this.getAllGames();
		currentGames.forEach((game) => {
			previousStates.set(
				game.gameAddress,
				GameStateEnum[game.state as keyof typeof GameStateEnum]
			);
		});

		return subscriptionId;
	}

	/**
	 * Get all active games
	 */
	async getAllGames(): Promise<FormattedGameState[]> {
		try {
			// Define filters for game state accounts
			const filters: GetProgramAccountsFilter[] = [
				{
					memcmp: {
						offset: 8, // Skip discriminator
						bytes: '', // You can add specific filters if needed
					},
				},
			];

			// Fetch all program accounts
			const accounts = await this.connection.getProgramAccounts(
				this.programId,
				{
					filters,
				}
			);

			// Decode and process each account
			const games = await Promise.all(
				accounts.map(async ({ pubkey, account }) => {
					const decoded = await this.decodeGameState(pubkey, account);
					return decoded
						? {
								gameAddress: pubkey.toString(),
								player1: decoded.player1.toString(),
								player2: decoded.player2 ? decoded.player2.toString() : null,
								betAmount: decoded.betAmount.toString(),
								createdAt: new Date(Number(decoded.createdAt) * 1000),
								expiresAt: new Date(Number(decoded.expiresAt) * 1000),
								state: GameStateEnum[decoded.state],
								mint: decoded.mint.toString(),
						  }
						: null;
				})
			);

			return games.filter((game) => game !== null) as FormattedGameState[];
		} catch (error) {
			console.error('Error fetching games:', error);
			throw error;
		}
	}

	/**
	 * Get active games for a specific player
	 */
	async getPlayerGames(playerPublicKey: PublicKey): Promise<any[]> {
		const filters: GetProgramAccountsFilter[] = [
			{
				memcmp: {
					offset: 8, // Skip discriminator
					bytes: playerPublicKey.toBase58(),
				},
			},
		];

		const accounts = await this.connection.getProgramAccounts(this.programId, {
			filters,
		});

		const games = await Promise.all(
			accounts.map(async ({ pubkey, account }) => {
				const decoded = await this.decodeGameState(pubkey, account);
				if (!decoded) return null;

				return {
					gameAddress: pubkey.toString(),
					player1: decoded.player1.toString(),
					player2: decoded.player2 ? decoded.player2.toString() : null,
					betAmount: decoded.betAmount.toString(),
					createdAt: new Date(Number(decoded.createdAt) * 1000),
					expiresAt: new Date(Number(decoded.expiresAt) * 1000),
					state: GameStateEnum[decoded.state],
					mint: decoded.mint.toString(),
				};
			})
		);

		return games.filter((game) => game !== null);
	}

	/**
	 * Get games in specific state
	 */
	async getGamesByState(
		state: 'created' | 'inProgress' | 'finished' | 'cancelled'
	): Promise<any[]> {
		const allGames = await this.getAllGames();
		return allGames.filter(
			(game) => game.state.toLowerCase() === state.toLowerCase()
		);
	}

	private async decodeGameState(
		pubkey: PublicKey,
		account: AccountInfo<Buffer>
	): Promise<GameState | null> {
		try {
			// Skip the 8-byte discriminator
			const data = account.data.slice(8);

			// Extract data manually
			const player1 = new PublicKey(data.slice(0, 32));
			const player2 = data[32] === 1 ? new PublicKey(data.slice(33, 65)) : null; // Optional PublicKey
			const betAmount = data.readBigUInt64LE(player2 ? 65 : 33);
			const createdAt = data.readBigInt64LE(player2 ? 73 : 41);
			const expiresAt = data.readBigInt64LE(player2 ? 81 : 49);
			const state = data.readUInt8(player2 ? 89 : 57) as GameStateEnum;
			const mintOffset = player2 ? 90 : 58;
			const mint = new PublicKey(data.slice(mintOffset, mintOffset + 32));

			const decodedData: GameState = {
				player1,
				player2,
				betAmount,
				createdAt,
				expiresAt,
				state,
				mint,
			};

			if (!decodedData) throw new Error('Failed to decode data');

			// Convert the raw decoded data into our GameState interface
			return {
				player1: new PublicKey(decodedData.player1),
				player2: decodedData.player2
					? new PublicKey(decodedData.player2)
					: null,
				betAmount: decodedData.betAmount,
				createdAt: decodedData.createdAt,
				expiresAt: decodedData.expiresAt,
				state: decodedData.state as GameStateEnum,
				mint: new PublicKey(decodedData.mint),
			};
		} catch (error) {
			console.error('Error decoding game state:', error);
			return null;
		}
	}
}

const gameMonitor = new GameMonitor(
	'https://api.devnet.solana.com',
	'2GuaS2fgJQiaoauNnMLfzdkznSYek4Q1xPAG77NjC9oB'
);

export default gameMonitor;
