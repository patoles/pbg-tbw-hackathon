import { initTransactionPoll } from '../crypto/transactions';
import gameMonitor, {
	FormattedGameState,
} from '../../shared/smart-contract/solana/game-monitor';
import * as actions from '../../shared/game-logic/actions';
import Game from '../game';

const cryptoAPI = async (game: Game) => {
	initTransactionPoll();

	const createGame = async (_game: FormattedGameState) => {
		const roomId = await game.createRoom(
			'snake',
			_game.player1,
			true,
			2,
			2,
			{
				value: parseInt(_game.betAmount),
				mint: _game.mint,
				address: _game.gameAddress,
				expiresAt: new Date(_game.expiresAt),
			}
			// _game.gameAddress.slice(0, 5)
		);
		if (!game.rooms[roomId].paidFees)
			game.rooms[roomId].paidFees = [_game.player1];
		if (_game.player2) game.rooms[roomId].paidFees?.push(_game.player2);
		console.log('Create game room:', roomId, game.rooms[roomId].paidFees);
	};

	gameMonitor.monitorGameCreation((_game) => {
		console.log('New game created:', _game);
		createGame(_game);
	});

	gameMonitor.monitorGameUpdates((_game) => {
		console.log('Game updated:', _game);

		if (_game.player2) {
			Object.values(game.rooms).forEach((_room) => {
				if (
					_room.creator === _game.player1 &&
					_room.paidFees &&
					_room.paidFees.length === 1
				) {
					_room.paidFees.push(_game.player2 || '');
					const updateData = actions.readyPlayer(
						{ playerIndex: _game.player2 || '' },
						_room.data
					);
					console.log('Player 2 join:', _game.player2);
					game.updateClientMessage(updateData, _room);
				}
			});
		}
	});

	const init = async () => {
		const allGames = await gameMonitor.getAllGames();
		console.log('All games:', allGames);
		(allGames || []).forEach(async (_game) => {
			if (_game.state === 'InProgress' || _game.state === 'Created')
				await createGame(_game);
		});
	};
	init();

	((_game) => {
		const pollWithdrawGames = async () => {
			try {
				const paidRooms = Object.values(_game.rooms).filter(
					(room) => room.data.fee && room.data.fee.expiresAt < new Date()
				);
				if (paidRooms.length) {
					const allGames = await gameMonitor.getAllGames();
					paidRooms.forEach((room) => {
						if (
							!allGames.find(
								(game) => game.gameAddress === room.data.fee?.address
							)
						) {
							console.log('Clean withdrawn room:', room.id);
							_game.deleteRoom(room.id);
						}
					});
				}
			} catch (err) {
			} finally {
				setTimeout(pollWithdrawGames, 5000);
			}
		};
		pollWithdrawGames();
	})(game);
};

export default cryptoAPI;
