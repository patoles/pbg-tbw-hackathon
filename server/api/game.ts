import { Express, Response } from 'express';
import bodyParser from 'body-parser';
import LZString from 'lz-string';
import { WithAuthProp } from '@clerk/clerk-sdk-node';
import authMiddleware from '../middleware/auth-middleware';
import Game from '../game';
import db from '../db';
import * as actions from '../../shared/game-logic/actions';
import * as gameUtils from '../utils/games';

const gameAPI = (app: Express, game: Game) => {
	// RETURN EXISTING FEES IF SERVER RESTARTED
	db.fee.returnAllFees();

	// RANKING
	app.post(
		'/api/game/ranking',
		bodyParser.json(),
		async (req: any, res: any) => {
			const { gameId = '' } = req.body || {};
			const ranking = await db.game.findGameRanking(gameId, 12);
			res.status(200).json({
				success: true,
				data: ranking,
			});
		}
	);
	// STORE
	app.post('/api/game/store', bodyParser.json(), async (req: any, res: any) => {
		const { gameId = '' } = req.body || {};
		const store = await db.game.findStore(gameId);
		res.status(200).json({
			success: true,
			data: store,
		});
	});
	app.post(
		'/api/game/store/buy',
		authMiddleware,
		bodyParser.json(),
		async (req: WithAuthProp<any>, res: any) => {
			if (req.auth && req.auth.userId) {
				const { userId } = req.auth;
				const { gameId = '', itemId = '' } = req.body || {};
				await db.game.buyStoreItem(gameId, userId, itemId);
				res.status(200).json({
					success: true,
				});
			}
		}
	);
	// GAME SECURE READY
	app.post(
		'/api/game/ready',
		authMiddleware,
		bodyParser.json(),
		async (req: WithAuthProp<any>, res: any) => {
			if (req.auth && req.auth.userId) {
				const { userId } = req.auth;
				const { roomId = '' } = req.body || {};
				const room = roomId ? game.rooms[roomId] : null;
				if (roomId && room && room.data?.fee?.value) {
					try {
						await db.fee.payReadyFee(userId, roomId, room.data.fee.value);
						const updateData = actions.readyPlayer(
							{ playerIndex: userId },
							room.data
						);
						game.updateClientMessage(updateData, room);
					} catch (err) {}
				}
				res.status(200).json({
					success: true,
				});
			}
		}
	);

	const offlineGames: {
		[gameId: string]: {
			[userId: string]: number;
		};
	} = {};
	app.post(
		'/api/game/start',
		authMiddleware,
		bodyParser.json(),
		async (req: WithAuthProp<any>, res: Response) => {
			if (req.auth && req.auth.userId) {
				const { userId } = req.auth;
				const { gameId = '' } = req.body || {};
				if (gameId) {
					if (!offlineGames[gameId]) offlineGames[gameId] = {};
					offlineGames[gameId][userId] = Date.now();
					res.status(200).json({
						success: true,
					});
				} else res.status(401).send(`Game doesn't exist`);
			} else {
				res.status(401).send(`Couldn't verify`);
			}
		}
	);

	app.post(
		'/api/game/end',
		authMiddleware,
		bodyParser.json(),
		async (req: WithAuthProp<any>, res: any) => {
			if (req.auth && req.auth.userId) {
				const { userId } = req.auth;
				const { gameId = '', history = '' } = req.body || {};
				if (
					gameId &&
					gameUtils[gameId] &&
					offlineGames[gameId] &&
					offlineGames[gameId][userId] &&
					history
				) {
					const startTime = offlineGames[gameId][userId];
					const endTime = Date.now();
					const decompressedHistory = JSON.parse(LZString.decompress(history));
					const { valid, score } = gameUtils[gameId].verifyHistory(
						startTime,
						endTime,
						decompressedHistory
					);
					if (valid) {
						const user = await db.user.findUser(userId);
						if (user) {
							await db.user.updateUser(user.clerkUserId, null, {
								coins: user.coins + score,
							});
							await db.game.updateGameRanking(
								gameId,
								{
									user_id: user._id,
									score,
									win: 0,
									loss: 0,
								},
								true
							);
							// SEND REWARD?
						}
					}
					// CLEAN UP MEMORY
					delete offlineGames[gameId][userId];
					Object.keys(offlineGames[gameId]).forEach((item) => {
						if (
							offlineGames[gameId][item] &&
							Date.now() - offlineGames[gameId][item] >= 60000 * 60
						)
							delete offlineGames[gameId][item];
					});

					res.status(200).json({
						success: true,
					});
				} else res.status(401).send(`Wrong data.`);
			}
		}
	);
	app.post(
		'/api/game/join-room',
		bodyParser.json(),
		async (req: any, res: any) => {
			const { gameId = '', userId = '', creator = '' } = req.body || {};
			const searchRoom = (attempt = 120) => {
				const foundRoom = Object.values(game.rooms).find((room) => {
					if (room.gameId === gameId) {
						if (creator) {
							if (room.creator === creator) return true;
						} else {
							if (room.paidFees && room.paidFees.indexOf(userId) > -1)
								return true;
						}
					}
					return false;
				});
				if (foundRoom) {
					res.status(200).json({
						success: true,
						data: {
							roomId: foundRoom.id,
						},
					});
				} else {
					setTimeout(() => {
						if (attempt > 0) {
							return searchRoom(--attempt);
						} else {
							res.status(200).json({
								success: true,
								data: null,
							});
						}
					}, 1000);
				}
			};
			searchRoom();
		}
	);
	app.post('/api/game/room', bodyParser.json(), async (req: any, res: any) => {
		const { gameId = '', roomId = '' } = req.body || {};

		const room = Object.values(game.rooms).find(
			(room) => room.gameId === gameId && room.id === roomId
		);
		const data: any = {};
		if (room) {
			data.roomId = room.id;
			data.hasFee = !!room.data.fee;
			if (data.hasFee) data.paidFees = room.paidFees ? room.paidFees : [];
			data.players = room.clients.size;
			data.size = room.data.maxPlayer;
		}

		res.status(200).json({
			success: true,
			data: Object.keys(data).length ? data : null,
		});
	});
};

export default gameAPI;
