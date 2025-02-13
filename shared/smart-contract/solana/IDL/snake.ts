/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/snake_game.json`.
 */
const SnakeIDL = {
	address: '2GuaS2fgJQiaoauNnMLfzdkznSYek4Q1xPAG77NjC9oB',
	metadata: {
		name: 'snake_game',
		version: '0.1.0',
		spec: '0.1.0',
		description: 'Created with Anchor',
	},
	instructions: [
		{
			name: 'create_game',
			discriminator: [124, 69, 75, 66, 184, 220, 72, 206],
			accounts: [
				{
					name: 'game',
					writable: true,
					pda: {
						seeds: [
							{
								kind: 'const',
								value: [103, 97, 109, 101, 95, 115, 116, 97, 116, 101],
							},
							{
								kind: 'account',
								path: 'player',
							},
						],
					},
				},
				{
					name: 'player',
					writable: true,
					signer: true,
				},
				{
					name: 'mint',
				},
				{
					name: 'game_vault',
					writable: true,
					pda: {
						seeds: [
							{
								kind: 'const',
								value: [103, 97, 109, 101, 95, 118, 97, 117, 108, 116],
							},
							{
								kind: 'account',
								path: 'player',
							},
						],
					},
				},
				{
					name: 'player_wallet',
					writable: true,
				},
				{
					name: 'system_program',
					address: '11111111111111111111111111111111',
				},
				{
					name: 'token_program',
					address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
				},
				{
					name: 'rent',
					address: 'SysvarRent111111111111111111111111111111111',
				},
			],
			args: [
				{
					name: 'bet_amount',
					type: 'u64',
				},
			],
		},
		{
			name: 'end_game',
			discriminator: [224, 135, 245, 99, 67, 175, 121, 252],
			accounts: [
				{
					name: 'game',
					writable: true,
					pda: {
						seeds: [
							{
								kind: 'const',
								value: [103, 97, 109, 101, 95, 115, 116, 97, 116, 101],
							},
							{
								kind: 'account',
								path: 'game.player1',
								account: 'Game',
							},
						],
					},
				},
				{
					name: 'winner',
					writable: true,
				},
				{
					name: 'game_vault',
					writable: true,
					pda: {
						seeds: [
							{
								kind: 'const',
								value: [103, 97, 109, 101, 95, 118, 97, 117, 108, 116],
							},
							{
								kind: 'account',
								path: 'game.player1',
								account: 'Game',
							},
						],
					},
				},
				{
					name: 'winner_token_account',
					writable: true,
				},
				{
					name: 'owner_token_account',
					writable: true,
				},
				{
					name: 'server',
					signer: true,
				},
				{
					name: 'token_program',
					address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
				},
			],
			args: [
				{
					name: 'winner',
					type: 'pubkey',
				},
			],
		},
		{
			name: 'join_game',
			discriminator: [107, 112, 18, 38, 56, 173, 60, 128],
			accounts: [
				{
					name: 'game',
					writable: true,
					pda: {
						seeds: [
							{
								kind: 'const',
								value: [103, 97, 109, 101, 95, 115, 116, 97, 116, 101],
							},
							{
								kind: 'account',
								path: 'game.player1',
								account: 'Game',
							},
						],
					},
				},
				{
					name: 'player1',
				},
				{
					name: 'player2',
					writable: true,
					signer: true,
				},
				{
					name: 'game_vault',
					writable: true,
					pda: {
						seeds: [
							{
								kind: 'const',
								value: [103, 97, 109, 101, 95, 118, 97, 117, 108, 116],
							},
							{
								kind: 'account',
								path: 'game.player1',
								account: 'Game',
							},
						],
					},
				},
				{
					name: 'player2_token_account',
					writable: true,
				},
				{
					name: 'token_program',
					address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
				},
			],
			args: [],
		},
		{
			name: 'withdraw_timeout',
			discriminator: [31, 191, 184, 195, 252, 157, 50, 82],
			accounts: [
				{
					name: 'game',
					writable: true,
					pda: {
						seeds: [
							{
								kind: 'const',
								value: [103, 97, 109, 101, 95, 115, 116, 97, 116, 101],
							},
							{
								kind: 'account',
								path: 'game.player1',
								account: 'Game',
							},
						],
					},
				},
				{
					name: 'player',
					writable: true,
					signer: true,
				},
				{
					name: 'game_vault',
					writable: true,
					pda: {
						seeds: [
							{
								kind: 'const',
								value: [103, 97, 109, 101, 95, 118, 97, 117, 108, 116],
							},
							{
								kind: 'account',
								path: 'game.player1',
								account: 'Game',
							},
						],
					},
				},
				{
					name: 'player_wallet',
					writable: true,
				},
				{
					name: 'token_program',
					address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
				},
			],
			args: [],
		},
	],
	accounts: [
		{
			name: 'Game',
			discriminator: [27, 90, 166, 125, 74, 100, 121, 18],
		},
	],
	errors: [
		{
			code: 6000,
			name: 'InvalidBetAmount',
		},
		{
			code: 6001,
			name: 'Expired',
		},
		{
			code: 6002,
			name: 'NotExpired',
		},
		{
			code: 6003,
			name: 'InvalidState',
		},
		{
			code: 6004,
			name: 'InvalidWinner',
		},
		{
			code: 6005,
			name: 'InvalidPlayer',
		},
		{
			code: 6006,
			name: 'InvalidOwner',
		},
		{
			code: 6007,
			name: 'InvalidServer',
		},
		{
			code: 6008,
			name: 'InsufficientFunds',
		},
	],
	types: [
		{
			name: 'Game',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'player1',
						type: 'pubkey',
					},
					{
						name: 'player2',
						type: {
							option: 'pubkey',
						},
					},
					{
						name: 'bet_amount',
						type: 'u64',
					},
					{
						name: 'created_at',
						type: 'i64',
					},
					{
						name: 'expires_at',
						type: 'i64',
					},
					{
						name: 'state',
						type: {
							defined: {
								name: 'GameState',
							},
						},
					},
					{
						name: 'mint',
						type: 'pubkey',
					},
				],
			},
		},
		{
			name: 'GameState',
			type: {
				kind: 'enum',
				variants: [
					{
						name: 'Created',
					},
					{
						name: 'InProgress',
					},
					{
						name: 'Finished',
					},
					{
						name: 'Cancelled',
					},
				],
			},
		},
	],
};

export default SnakeIDL;
