const USE_TESTNET = true;
export const CONTRACT_ADDRESS = USE_TESTNET
	? 'EQC21bXL3vRoLUHjKT0ByAm1GF0E124YPmPp_bPV_dfjdkK_'
	: 'UQAceZdXSgv_qrUwz4T4bWuC-AVxWAFr2OM4IfYw2FlmxjUl';
export const POLL_DOMAIN = USE_TESTNET
	? 'testnet.toncenter.com'
	: 'toncenter.com';
export const INIT_COUNTER = 17n;
export const TRANSACTION_GAS = 1000000;

export const COIN_PRICES: { [k: number]: number } = {
	100: 200000000 + TRANSACTION_GAS, // 1 USD
	250: 400000000 + TRANSACTION_GAS, // 2 USD
	1000: 1200000000 + TRANSACTION_GAS, // 6 USD
};

/*
export const COIN_PRICES: { [k: number]: number } = {
    100: 200 + TRANSACTION_GAS, // 1 USD
    250: 400 + TRANSACTION_GAS, // 2 USD
    1000: 1200 + TRANSACTION_GAS, // 6 USD
};
*/
export const OP_BIT = 32;
export const COIN_PRICES_KEY_BIT = 16;
export const COIN_PRICES_VALUE_BIT = 64;
export const COIN_QUANTITY_BIT = 32;

export enum OP {
	OP_INCREASE = 1001,
	OP_DECREASE = 1002,
	OP_BUY_COIN = 2001,
	OP_WITHDRAW = 2002,
	OP_UPDATE_COIN_PRICES = 2003,
	OP_UPGRADE = 3001,
}
