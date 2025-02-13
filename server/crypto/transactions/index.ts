import {
	VALID_BLOCKCHAINS,
	MIN_POLL_INTERVAL,
	MAX_POLL_INTERVAL,
	AWAITING_POLL_WAIT_TIME,
} from '../const';
import blockchain from '../blockchain';

const intervalInfo = {};

export const initTransactionPoll = () => {
	Object.keys(blockchain).forEach((chain) => {
		intervalInfo[chain] = {
			awaitingTransaction: false,
			awaitingTime: 0,
			currentInterval: MAX_POLL_INTERVAL,
			timeout: undefined,
		};
	});
	pollTransactions('ton');
};

export const handleNewTransaction = async (chain: VALID_BLOCKCHAINS) => {
	if (blockchain[chain]) {
		if (intervalInfo[chain].timeout) clearTimeout(intervalInfo[chain].timeout);
		intervalInfo[chain] = {
			timeout: undefined,
			awaitingTransaction: true,
			awaitingTime: 0,
			currentInterval: 0,
		};
		pollTransactions(chain);
	}
};

const pollTransactions = async (chain: VALID_BLOCKCHAINS) => {
	const { currentInterval, awaitingTime } = intervalInfo[chain];
	try {
		await processTransactions(chain);
		if (intervalInfo[chain].awaitingTransaction) {
			intervalInfo[chain].awaitingTime =
				awaitingTime + intervalInfo[chain].currentInterval;
			const newInterval = currentInterval || MIN_POLL_INTERVAL;
			if (intervalInfo[chain].awaitingTime <= AWAITING_POLL_WAIT_TIME) {
				intervalInfo[chain].currentInterval = Math.min(
					newInterval,
					MAX_POLL_INTERVAL
				);
			} else {
				intervalInfo[chain].currentInterval = Math.min(
					newInterval * 2,
					MAX_POLL_INTERVAL
				);
			}
		} else {
			intervalInfo[chain].currentInterval = MAX_POLL_INTERVAL;
		}
	} catch (error) {
		console.error('Error in transaction processing:', error);
	} finally {
		intervalInfo[chain].timeout = setTimeout(() => {
			pollTransactions(chain);
		}, intervalInfo[chain].currentInterval);
	}
};

export const processTransactions = async (chain: VALID_BLOCKCHAINS) => {
	const transactions = await blockchain[chain].transaction.fetch();
	if (transactions) {
		if (transactions.length) intervalInfo[chain].awaitingTransaction = false;
		for (const transaction of transactions) {
			await blockchain[chain].transaction.process(transaction);
		}
	}
};
