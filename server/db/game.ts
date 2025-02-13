import Game, { IGame } from './models/game';
import User from './models/user';
import Item from './models/item';
import { IItem } from './models/item';
import { IGameRanking, IPublicUser } from '../../shared/models';

const RANKING_CACHE_INTERVAL = 60 * 1000 * 5; // 5 MIN
const STORE_CACHE_INTERVAL = 60 * 1000 * 30; // 30 MIN

/* GAME WRITE */

export const createGame = async (GameData: IGame) => {
	return new Promise<void>(async (resolve) => {
		const game = new Game(GameData);
		await game.save();
		resolve();
	});
};

export const updateGame = async (
	id: string,
	GameData?: IGame,
	metadata?: any
) => {
	return new Promise<void>(async (resolve) => {
		await Game.updateOne(
			{ _id: id },
			Object.assign({}, GameData || {}, metadata || {})
		);
		resolve();
	});
};

export const deleteGame = async (id: string) => {
	return new Promise<void>(async (resolve) => {
		await Game.deleteOne({ _id: id });
		resolve();
	});
};

/* *** */

/* GAME READ */

export const findGame = async (id: string) => {
	return new Promise<IGame | null>(async (resolve) => {
		const game = await Game.findOne({ _id: id });
		resolve(game);
	});
};

export const findGames = async (ids: string[]) => {
	return new Promise<IGame[]>(async (resolve) => {
		const games = await Game.find({ _id: { $in: ids } });
		resolve(games);
	});
};

export const findAllGames = async () => {
	return new Promise<IGame[]>(async (resolve) => {
		const games = await Game.find({ active: true });
		resolve(games);
	});
};

/* USER RANKING */

export const updateGameRanking = async (
	game_key: string,
	rankingData: IGameRanking,
	isSoloGame?: boolean
) => {
	const { user_id, score, win, loss } = rankingData;
	return new Promise<IGameRanking | null>(async (resolve) => {
		let update: any = {
			$inc: {
				'ranking_board.$[elem].win': win,
				'ranking_board.$[elem].loss': loss,
			},
		};
		if (isSoloGame) {
			const _game = await Game.findOne({
				game_key,
				'ranking_board.user_id': user_id,
			});
			const currentScore = _game?.ranking_board.find(
				(entry) => entry.user_id.toString() === user_id.toString()
			)?.score_solo;
			if (currentScore && currentScore >= score) resolve(null);
			else {
				update = {
					$set: {
						'ranking_board.$[elem].score_solo': Math.max(
							currentScore || 0,
							score
						),
					},
				};
			}
		} else {
			update['$inc']['ranking_board.$[elem].score'] = score;
		}
		let game = await Game.findOneAndUpdate(
			{
				game_key,
				'ranking_board.user_id': user_id,
			},
			update,
			{
				arrayFilters: [
					{
						'elem.user_id': user_id,
					},
				],
				new: true,
			}
		);
		if (!game) {
			game = await Game.findOneAndUpdate(
				{
					game_key,
				},
				{
					$push: {
						ranking_board: {
							user_id,
							score,
							win,
							loss,
						},
					},
				},
				{
					upsert: true,
					new: true,
				}
			);
		}
		let ranking: IGameRanking | null = null;
		if (game) {
			ranking =
				game.ranking_board.find(
					(rank: IGameRanking) => rank.user_id.toString() === user_id.toString()
				) || null;
		}
		resolve(ranking);
	});
};

type IGameRankingDetail = IGameRanking & { user: IPublicUser };
const rankingCache: {
	[k: string]: {
		timestamp: number;
		data: IGameRankingDetail[];
	};
} = {};
export const findGameRanking = async (game_key: string, limit = 10) => {
	return new Promise<IGameRankingDetail[]>(async (resolve) => {
		if (
			!rankingCache[game_key] ||
			(rankingCache[game_key] &&
				(Date.now() - rankingCache[game_key].timestamp >=
					RANKING_CACHE_INTERVAL ||
					!rankingCache[game_key].data.length))
		) {
			const game: {
				ranking_board: IGameRankingDetail[];
			}[] = await Game.aggregate([
				{
					$match: { game_key },
				},
				{
					$unwind: '$ranking_board',
				},
				{
					$sort: { 'ranking_board.score': -1 },
				},
				{
					$lookup: {
						from: 'users',
						localField: 'ranking_board.user_id',
						foreignField: '_id',
						as: 'ranking_board.user',
					},
				},
				{
					$unwind: '$ranking_board.user',
				},
				{
					$group: {
						_id: '$_id',
						ranking_board: {
							$push: '$ranking_board',
						},
					},
				},
				{
					$project: {
						ranking_board: {
							$slice: ['$ranking_board', limit],
						},
					},
				},
			]);
			if (game && game.length) {
				game[0].ranking_board = game[0].ranking_board.map((ranking) =>
					Object.assign({}, ranking, {
						user: {
							profileImageUrl: ranking.user.profileImageUrl || '',
							username: ranking.user.username || '',
						},
					})
				);
				rankingCache[game_key] = {
					data: JSON.parse(JSON.stringify(game[0].ranking_board)),
					timestamp: Date.now(),
				};
				resolve(game[0].ranking_board);
			}
			resolve([]);
		} else {
			resolve(rankingCache[game_key].data);
		}
	});
};

type IItemDetail = IItem & { quantity: number };
const storeCache: {
	[k: string]: {
		timestamp: number;
		data: IItemDetail[];
	};
} = {};
export const findStore = async (game_key: string) => {
	return new Promise<(IItem & { quantity: number })[]>(async (resolve) => {
		if (
			!storeCache[game_key] ||
			(storeCache[game_key] &&
				(Date.now() - storeCache[game_key].timestamp >= STORE_CACHE_INTERVAL ||
					!storeCache[game_key].data.length))
		) {
			const game = await Game.aggregate([
				{
					$match: { game_key },
				},
				{
					$unwind: '$store',
				},
				{
					$lookup: {
						from: 'items',
						localField: 'store.item_id',
						foreignField: '_id',
						as: 'itemDetails',
					},
				},
				{
					$unwind: '$itemDetails',
				},
				{
					$replaceRoot: {
						newRoot: {
							$mergeObjects: ['$itemDetails', { quantity: '$store.quantity' }],
						},
					},
				},
			]);
			if (game && game.length) {
				storeCache[game_key] = {
					data: JSON.parse(JSON.stringify(game)),
					timestamp: Date.now(),
				};
				resolve(game);
			}
			resolve([]);
		} else {
			resolve(storeCache[game_key].data);
		}
	});
};

export const buyStoreItem = async (
	game_key: string,
	user_id: string,
	item_id: string
) => {
	return new Promise<void>(async (resolve) => {
		try {
			const game = await Game.findOne({ game_key });
			if (!game) console.error('Game not found.');
			const user = await User.findOne({ clerkUserId: user_id });
			if (!user) console.error('User not found.');
			const item = await Item.findOne({ _id: item_id });
			if (!item) console.error('Item not found.');
			if (game && user && item) {
				const storeItem = game.store.find(
					(element: any) => element.item_id.toString() === item._id.toString()
				);
				const userInventoryItem = user.inventory.find(
					(element: any) => element.item_id.toString() === item._id.toString()
				);
				if (
					!userInventoryItem && // CHECK IF THE USER DOESN'T ALREADY HAVE THE ITEM
					storeItem && // CHECK IF THE ITEM EXISTS IN THE GAME STORE
					(storeItem.quantity === -1 || storeItem.quantity > 0) &&
					user.coins >= item.price
				) {
					user.inventory.push({
						game_id: item.game_id,
						item_id: item._id,
						quantity: 1,
						equipped: false,
					});
					user.coins -= item.price;
					if (storeItem.quantity !== -1) storeItem.quantity--;
					await Promise.all([user.save(), game.save()]);
				}
			}
		} catch (err) {}
		resolve();
	});
};
