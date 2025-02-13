//import { UserJSON } from '@clerk/nextjs/server';
import User, { IUser } from './models/user';

/* USER WRITE */

const getUserBasicInfo = ({ id, ...attributes }: any) => {
	const {
		username,
		first_name = '',
		last_name = '',
		image_url = '',
		email_addresses,
		primary_email_address_id,
		web3_wallets,
		walletSolana = '',
		primary_web3_wallet_id,
	} = attributes;

	// SET PRIMARY EMAIL
	let emailAddress = '';
	if (primary_email_address_id && email_addresses && email_addresses.length) {
		const foundEmail = email_addresses.find(
			(element: any) => element.id === primary_email_address_id
		);
		if (foundEmail) emailAddress = foundEmail.email_address;
	}
	// SET PRIMARY WEB3 WALLET
	let web3Metamask = '';
	if (primary_web3_wallet_id && web3_wallets && web3_wallets.length) {
		const foundWeb3Metamask = web3_wallets.find(
			(element: any) => element.id === primary_web3_wallet_id
		);
		if (foundWeb3Metamask) web3Metamask = foundWeb3Metamask.web3_wallet;
	}

	return {
		clerkUserId: id,
		username: username,
		firstName: first_name,
		lastName: last_name,
		profileImageUrl: image_url,
		emailAddress,
		web3Metamask,
		walletSolana,
	};
};

export const createUser = async (UserJSONData: any) => {
	return new Promise<void>(async (resolve) => {
		const data = Object.assign({}, getUserBasicInfo(UserJSONData), {
			coins: 0,
			inventory: [],
		});
		const user = new User(data);
		await user.save();
		resolve();
	});
};

export const updateUser = async (
	id: string,
	UserJSONData?: any,
	metadata?: any
) => {
	return new Promise<void>(async (resolve) => {
		const data = UserJSONData ? getUserBasicInfo(UserJSONData) : {};
		await User.updateOne(
			{ clerkUserId: id },
			Object.assign({}, data, metadata || {})
		);
		resolve();
	});
};

export const deleteUser = async (id: string) => {
	return new Promise<void>(async (resolve) => {
		await User.deleteOne({ clerkUserId: id });
		resolve();
	});
};

export const equipItem = async (
	userId: string,
	itemId: string,
	equip: boolean
) => {
	return new Promise<void>(async (resolve) => {
		if (equip) {
			// UNEQUIP EVERY ITEMS OF THE SAME CATEGORY
			const user = await findUserWithInventory(userId);
			if (user) {
				const itemToEquip = user.inventory.find(
					(item) => item.item_id.toString() === itemId
				);
				if (itemToEquip && itemToEquip.item) {
					const itemsToUnequip = user.inventory
						.filter(
							(item) =>
								item.equipped &&
								item.item?.category === itemToEquip.item?.category
						)
						.map((item) => item.item_id);
					if (itemsToUnequip.length) {
						await User.updateOne(
							{
								clerkUserId: userId,
							},
							{
								$set: { 'inventory.$[elem].equipped': false },
							},
							{
								arrayFilters: [{ 'elem.item_id': { $in: itemsToUnequip } }],
							}
						);
					}
				}
			}
		}

		await User.updateOne(
			{
				clerkUserId: userId,
			},
			{
				$set: { 'inventory.$[elem].equipped': equip },
			},
			{
				arrayFilters: [{ 'elem.item_id': itemId }],
			}
		);
		resolve();
	});
};

/* *** */

/* USER READ */

export const findUser = async (id: string) => {
	return new Promise<IUser | null>(async (resolve) => {
		const user = await User.findOne({ clerkUserId: id });
		resolve(user);
	});
};

export const findUserWithInventory = async (id: string) => {
	return new Promise<IUser | null>(async (resolve) => {
		const user = await User.aggregate([
			{
				$match: { clerkUserId: id },
			},
			{
				$unwind: {
					path: '$inventory',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: 'items',
					localField: 'inventory.item_id',
					foreignField: '_id',
					as: 'inventory.item',
				},
			},
			{
				$unwind: {
					path: '$inventory.item',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$group: {
					_id: '$_id',
					originalDocument: {
						$first: '$$ROOT',
					},
					inventory: {
						$push: '$inventory',
					},
				},
			},
			{
				$replaceRoot: {
					newRoot: {
						$mergeObjects: [
							'$originalDocument',
							{
								inventory: '$inventory',
							},
						],
					},
				},
			},
		]);
		resolve(user && user.length ? user[0] : null);
	});
};

export const findUsers = async (ids: string[]) => {
	return new Promise<IUser[]>(async (resolve) => {
		const users = await User.find({ clerkUserId: { $in: ids } });
		resolve(users);
	});
};

export const checkUserExists = async (id: string) => {
	return new Promise<boolean>(async (resolve) => {
		const userExists = await User.exists({ clerkUserId: id });
		resolve(userExists !== null);
	});
};

export const isUserUpdated = async (id: string, timestamp: number) => {
	return new Promise<boolean>(async (resolve) => {
		const user = await User.findOne({
			clerkUserId: id,
			updatedAt: { $gt: new Date(timestamp) },
		});
		resolve(!!user);
	});
};

export const connectWalletTON = async (id: string, wallet: string) => {
	return new Promise<void>(async (resolve) => {
		const user = await User.findOne({ clerkUserId: id });
		if (user) {
			user.walletTON = wallet;
			await user.save();
		}
		resolve();
	});
};
