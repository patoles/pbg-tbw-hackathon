import mongoose from 'mongoose';
import { IGame as IGameShared } from '../../../shared/models';

export interface IGame extends IGameShared {
	store: {
		item_id: mongoose.Types.ObjectId;
		quantity: number;
	}[];
}
const gameSchema = new mongoose.Schema<IGame>(
	{
		game_key: { type: String, required: true, unique: true },
		name: { type: String, required: true },
		description: { type: String, required: true },
		active: { type: Boolean, required: true, default: false },
		ranking_board: [
			{
				user_id: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
				},
				score: Number,
				score_solo: Number,
				win: Number,
				loss: Number,
			},
		],
		store: [
			{
				item_id: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Item',
				},
				quantity: Number,
			},
		],
	},
	{ timestamps: true, collection: 'games' }
);

export const Game =
	mongoose.models.Game || mongoose.model<IGame>('Game', gameSchema);

export default Game;
