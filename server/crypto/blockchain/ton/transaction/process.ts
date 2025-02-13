import { Cell } from '@ton/ton';
import {
	CRYPTO_TRANSACTION_EVENT,
	CRYPTO_TRANSACTION_STATUS,
} from '../../../const';
import db from '../../../../db';
import { ITransaction } from '../../../../db/models/transaction';
import User from '../../../../db/models/user';
import {
	OP,
	OP_BIT,
	COIN_QUANTITY_BIT,
} from '../../../../../shared/smart-contract/ton/const';

export const processTransaction = async (transaction) => {
	if (transaction) {
		const { lt, in_msg, hash, now, block_ref, total_fees, description } =
			transaction;
		const { message_content, source, destination } = in_msg;
		const { body } = message_content;
		const { aborted, action } = description;
		const value = parseInt(in_msg.value || '0');
		const fees = parseInt(total_fees || '0');
		let userId = '';
		let payload = '';

		let status: CRYPTO_TRANSACTION_STATUS = 'fail';
		let event: CRYPTO_TRANSACTION_EVENT | undefined = undefined;
		if (!aborted && action && action.success && action.valid) {
			// Transaction is valid
			const bodyCell = Cell.fromBase64(body).beginParse();
			if (bodyCell.remainingBits < OP_BIT) {
				// Transaction without OP code
			} else {
				const op = bodyCell.loadUint(OP_BIT);
				if (op === OP.OP_BUY_COIN) {
					event = CRYPTO_TRANSACTION_EVENT.BUY_COIN;
					const quantity = bodyCell.loadUint(COIN_QUANTITY_BIT) || 0;
					payload = bodyCell.loadStringTail();
					const parsedPayload = JSON.parse(payload || '');
					userId = parsedPayload.userId || '';
					// HANDLE DB COIN TRANSFER
					const user = await User.findOne({ clerkUserId: userId });
					if (user) {
						user.coins = user.coins + quantity;
						await user.save();
						status = 'success';
					}
				}
			}
		} else {
			// Transaction is not valid
		}

		// Save transaction to db
		const transactionData: ITransaction = {
			value,
			status,
			source,
			destination,
			user_id: userId,
			lt,
			hash,
			now,
			currency: 'ton',
			fees,
			payload,
			block_nbr: block_ref.seqno,
			type: 'transfer',
		};
		if (event) transactionData.event = event;
		await db.transaction.createTransaction(transactionData);
	}
};
