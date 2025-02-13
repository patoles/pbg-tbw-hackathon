import mongoose from 'mongoose';
import { IUser as SharedIUser } from '../../../shared/models';
import { IItem } from './item';

export interface IUser extends SharedIUser {
	inventory: {
		game_id: mongoose.Types.ObjectId;
		item_id: mongoose.Types.ObjectId;
		quantity: number;
		equipped: boolean;
		item?: IItem;
	}[];
}
const userSchema = new mongoose.Schema<IUser>(
	{
		clerkUserId: { type: String, unique: true, required: true },
		coins: { type: Number, required: true },
		emailAddress: { type: String },
		firstName: String,
		lastName: String,
		profileImageUrl: String,
		username: { type: String, required: true },
		web3Metamask: { type: String },
		walletTON: { type: String },
		walletSolana: { type: String },
		inventory: [
			{
				game_id: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Game',
					required: true,
				},
				item_id: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Item',
					required: true,
				},
				quantity: Number,
				equipped: {
					type: Boolean,
					default: false,
				},
			},
		],
	},
	{ timestamps: true, collection: 'users' }
);

export const User =
	mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
