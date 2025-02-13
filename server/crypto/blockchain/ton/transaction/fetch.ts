import { TON_POLL_DOMAIN, TON_WALLET_ADDRESS } from '../../../const';
import db from '../../../../db';

let latest_lt = '';
export const fetchTransactions = async () => {
	try {
		if (!latest_lt) {
			try {
				const lastTransaction = await db.transaction.findLastTransaction('ton');
				if (lastTransaction) {
					latest_lt = lastTransaction.lt;
				}
			} catch (err) {}
		}
		const response = await fetch(
			`https://${TON_POLL_DOMAIN}/api/v3/transactions?account=${TON_WALLET_ADDRESS}&sort=asc${
				latest_lt ? `&offset=1&start_lt=${latest_lt}` : ''
			}`,
			{
				method: 'GET',
				headers: { 'Content-type': 'application/json; charset=UTF-8' },
			}
		);
		const data = await response.json();
		if (data.transactions && data.transactions.length)
			latest_lt = data.transactions[data.transactions.length - 1].lt;
		return data.transactions;
	} catch (error) {
		console.error('Error fetching transactions:', error);
		return [];
	}
};
