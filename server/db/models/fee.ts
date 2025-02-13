import mongoose from 'mongoose';

export interface IFee {
	_id?: mongoose.Types.ObjectId;
	clerkUserId: string;
	amount: number;
	currency: string;
	tx_id?: string;
	room_id: string;
}
const feeSchema = new mongoose.Schema<IFee>(
	{
		clerkUserId: { type: String, required: true },
		amount: { type: Number, required: true },
		currency: { type: String, required: true },
		tx_id: { type: String },
		room_id: { type: String, required: true },
	},
	{ timestamps: true, collection: 'fees' }
);

export const Fee =
	mongoose.models.Fee || mongoose.model<IFee>('Fee', feeSchema);

export default Fee;
