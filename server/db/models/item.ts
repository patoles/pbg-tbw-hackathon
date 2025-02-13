import mongoose from 'mongoose';
import { IItem as IItemShared } from '../../../shared/models';

export interface IItem extends IItemShared {
	_id: mongoose.Types.ObjectId;
	game_id: mongoose.Types.ObjectId;
}
const itemSchema = new mongoose.Schema<IItem>(
	{
		game_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
		name: { type: String, required: true },
		description: { type: String, required: true },
		price: { type: Number, required: true },
		image_name: { type: String, required: true },
		tileset_key: { type: String, required: true },
		tileset_path: { type: String, required: true },
	},
	{ timestamps: true, collection: 'items' }
);

export const Item =
	mongoose.models.Item || mongoose.model<IItem>('Item', itemSchema);

export default Item;
