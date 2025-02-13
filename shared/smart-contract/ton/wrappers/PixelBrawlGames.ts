import {
	Address,
	beginCell,
	Cell,
	Contract,
	contractAddress,
	ContractProvider,
	Sender,
	Dictionary,
} from '@ton/core';
import {
	INIT_COUNTER,
	COIN_PRICES,
	COIN_PRICES_KEY_BIT,
	COIN_PRICES_VALUE_BIT,
	COIN_QUANTITY_BIT,
	OP_BIT,
	OP,
} from '../const';

export class PixelBrawlGames implements Contract {
	constructor(
		readonly address: Address,
		readonly init?: { code: Cell; data: Cell }
	) {}

	static createFromAddress(address: Address) {
		return new PixelBrawlGames(address);
	}

	static createForDeploy(
		code: Cell,
		ownerAddress: Address,
		initialCounter?: number
	) {
		const initPrices = Dictionary.empty<number, number>();
		Object.keys(COIN_PRICES).forEach((coinQuantity) => {
			const quantity = parseInt(coinQuantity);
			initPrices.set(parseInt(coinQuantity), COIN_PRICES[quantity]);
		});
		const data = beginCell()
			.storeUint(initialCounter || INIT_COUNTER, 64) // SET COUNTER VALUE
			.storeAddress(ownerAddress)
			.storeDict(
				initPrices,
				Dictionary.Keys.Uint(COIN_PRICES_KEY_BIT),
				Dictionary.Values.Uint(COIN_PRICES_VALUE_BIT)
			) // SET PRICE DICTIONARY
			.endCell();
		const workchain = 0;
		const address = contractAddress(workchain, { code, data });
		return new PixelBrawlGames(address, { code, data });
	}

	async sendDeploy(provider: ContractProvider, via: Sender) {
		await provider.internal(via, {
			value: '0.01',
			bounce: false,
		});
	}

	async sendIncrement(provider: ContractProvider, via: Sender) {
		const messageBody = beginCell()
			.storeUint(OP.OP_INCREASE, OP_BIT) // op
			.storeUint(0, 64) // query id
			.endCell();
		await provider.internal(via, {
			value: '0.002', // send 0.002 TON for gas
			body: messageBody,
		});
	}

	async sendDecrement(provider: ContractProvider, via: Sender) {
		const messageBody = beginCell()
			.storeUint(OP.OP_DECREASE, OP_BIT) // op
			.storeUint(0, 64) // query id
			.endCell();
		await provider.internal(via, {
			value: '0.002', // send 0.002 TON for gas
			body: messageBody,
		});
	}

	async sendBuyCoin(
		provider: ContractProvider,
		via: Sender,
		quantity: 100 | 250 | 1000,
		valueNano: number,
		payload?: any
	) {
		const messageBody = beginCell()
			.storeUint(OP.OP_BUY_COIN, OP_BIT) // op
			.storeUint(quantity, COIN_QUANTITY_BIT) // quantity
			.storeStringTail(JSON.stringify(payload || '')) //payload
			.endCell();
		await provider.internal(via, {
			value: BigInt(valueNano), // send Nano for the transaction
			body: messageBody,
		});
	}

	async sendWithdraw(
		provider: ContractProvider,
		via: Sender,
		valueNano: number
	) {
		const messageBody = beginCell()
			.storeUint(OP.OP_WITHDRAW, OP_BIT) // op
			.storeUint(BigInt(valueNano), COIN_PRICES_VALUE_BIT) // quantity
			.endCell();
		await provider.internal(via, {
			value: '0.002', // send gas for the transaction
			body: messageBody,
		});
	}

	async sendUpdatePrices(
		provider: ContractProvider,
		via: Sender,
		updatedPrices: { [k: number]: number }
	) {
		const updatedPricesDict = Dictionary.empty<number, number>();
		Object.keys(updatedPrices).forEach((coinQuantity) => {
			const quantity = parseInt(coinQuantity);
			updatedPricesDict.set(parseInt(coinQuantity), updatedPrices[quantity]);
		});
		const messageBody = beginCell()
			.storeUint(OP.OP_UPDATE_COIN_PRICES, OP_BIT) // op
			.storeDict(
				updatedPricesDict,
				Dictionary.Keys.Uint(COIN_PRICES_KEY_BIT),
				Dictionary.Values.Uint(COIN_PRICES_VALUE_BIT)
			) // SET PRICE DICTIONARY
			.endCell();
		await provider.internal(via, {
			value: '0.002', // send gas for the transaction
			body: messageBody,
		});
	}

	async sendUpdate(provider: ContractProvider, via: Sender, code: Cell) {
		const messageBody = beginCell()
			.storeUint(OP.OP_UPGRADE, OP_BIT) // op
			.storeRef(code)
			.endCell();
		await provider.internal(via, {
			value: '0.002', // send 0.002 TON for gas
			body: messageBody,
		});
	}

	async getCounter(provider: ContractProvider) {
		const { stack } = await provider.get('get_counter', []);
		return stack.readBigNumber();
	}

	async getCoinPrices(provider: ContractProvider) {
		const { stack } = await provider.get('get_coin_prices', []);
		const valueDict = Dictionary.loadDirect(
			Dictionary.Keys.Uint(COIN_PRICES_KEY_BIT),
			Dictionary.Values.Uint(COIN_PRICES_VALUE_BIT),
			stack.readCell().asSlice()
		);
		return valueDict;
	}
}

/*
// Define the withdrawal method
method withdraw(int amount, slice destination) {
    // Check that the message sender is the contract owner
    if (msg_pubkey() != owner_public_key) {
        throw(101);  // Unauthorized access
    }

    // Check that the contract has enough balance to withdraw the requested amount
    int contract_balance = get_balance();
    if (contract_balance < amount) {
        throw(102);  // Not enough balance
    }

    // Build the message to transfer funds
    var msg = begin_cell()
        .store_uint(0x18, 6)           // Operation code for an internal transfer
        .store_uint(0, 2)              // Flags (no special flags)
        .store_coins(amount)           // Amount to transfer (in nanograms)
        .store_slice(destination)      // Destination address
        .store_bit(1)                  // Bounce flag (1 if the destination should bounce)
        .store_bit(0)                  // No forward payload
        .end_cell();

    // Send the message
    send_raw_message(msg, 64);  // Send the message with the transaction fee of 64 gas units
}
*/

/*
int ERROR_UNAUTHORIZED = 101;
int ERROR_INSUFFICIENT_BALANCE = 102;
int ERROR_INVALID_INPUT = 103;
*/
