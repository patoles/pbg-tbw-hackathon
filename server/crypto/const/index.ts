import {
	COIN_PRICES,
	CONTRACT_ADDRESS,
	POLL_DOMAIN,
} from '../../../shared/smart-contract/ton/const';

export const MIN_POLL_INTERVAL = 10000;
export const MAX_POLL_INTERVAL = 60000 * 10;
export const AWAITING_POLL_WAIT_TIME = 60000 * 5;

export type VALID_BLOCKCHAINS = 'ton';

export const TON_WALLET_ADDRESS = CONTRACT_ADDRESS;
export const TON_POLL_DOMAIN = POLL_DOMAIN;

export type CRYPTO_TRANSACTION_STATUS = 'success' | 'fail';
export type CRYPTO_TRANSACTION_TYPE = 'transfer';

export enum CRYPTO_TRANSACTION_EVENT {
	BUY_COIN = 'BUY_COIN',
}

export const TRANSACTION_COST = {
	[CRYPTO_TRANSACTION_EVENT.BUY_COIN]: COIN_PRICES,
};
