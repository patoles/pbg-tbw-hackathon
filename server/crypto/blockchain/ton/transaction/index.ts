import { fetchTransactions } from './fetch';
import { processTransaction } from './process';

const transaction = {
	fetch: fetchTransactions,
	process: processTransaction,
};
export default transaction;
