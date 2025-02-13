import mongoose from 'mongoose';
import {
	CRYPTO_TRANSACTION_EVENT,
	VALID_BLOCKCHAINS,
	CRYPTO_TRANSACTION_STATUS,
	CRYPTO_TRANSACTION_TYPE,
} from '../../../shared/const/crypto';

export interface ITransaction {
	_id?: mongoose.Types.ObjectId;
	value: number;
	status: CRYPTO_TRANSACTION_STATUS;
	source: string;
	destination: string;
	user_id?: string;
	event?: CRYPTO_TRANSACTION_EVENT;
	lt: string;
	hash: string;
	now: number;
	currency: VALID_BLOCKCHAINS;
	fees: number;
	payload?: string;
	block_nbr: number;
	type?: CRYPTO_TRANSACTION_TYPE;
}
const transactionSchema = new mongoose.Schema<ITransaction>(
	{
		value: { type: Number, required: true },
		status: { type: String, required: true },
		source: { type: String, required: true },
		destination: { type: String, required: true },
		user_id: { type: String },
		event: { type: String },
		lt: { type: String, required: true },
		hash: { type: String, required: true },
		now: { type: Number, required: true },
		currency: { type: String, required: true },
		fees: { type: Number, required: true },
		payload: { type: String },
		block_nbr: { type: Number, required: true },
		type: { type: String, default: 'transfer' },
	},
	{ timestamps: true, collection: 'transactions' }
);

export const Transaction =
	mongoose.models.Transaction ||
	mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
