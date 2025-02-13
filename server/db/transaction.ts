import Transaction, { ITransaction } from './models/transaction';
import { VALID_BLOCKCHAINS } from '../../shared/const/crypto';

/* WRITE */

export const createTransaction = async (transactionData: ITransaction) => {
	return new Promise<void>(async (resolve, fail) => {
		try {
			const transaction = new Transaction(transactionData);
			await transaction.save();
			resolve();
		} catch (err) {
			console.error('createTransaction error.');
			fail();
		}
	});
};

export const updateTransaction = async (
	id: string,
	transactionData?: ITransaction,
	metadata?: any
) => {
	return new Promise<void>(async (resolve) => {
		await Transaction.updateOne(
			{ _id: id },
			Object.assign({}, transactionData || {}, metadata || {})
		);
		resolve();
	});
};

export const deleteTransaction = async (id: string) => {
	return new Promise<void>(async (resolve) => {
		await Transaction.deleteOne({ _id: id });
		resolve();
	});
};

/* READ */

export const findLastTransaction = async (currency: VALID_BLOCKCHAINS) => {
	return new Promise<ITransaction | null>(async (resolve, fail) => {
		//Item.findOne({}).sort({ lt: -1 }).exec();
		try {
			const lastTransaction = await Transaction.findOne({ currency })
				.sort({ lt: -1 })
				.exec();
			resolve(lastTransaction);
		} catch (err) {
			fail(err);
		}
	});
};
