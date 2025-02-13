import { TUser, TStoreItem } from '@/models';

export const findUserInventoryItem = (id: string, user: TUser) => {
	return user.inventory.find((item) => item.item_id === id) || null;
};

export const findStoreItem = (id: string, store: TStoreItem[]) => {
	return store.find((item) => item._id === id) || null;
};

export const isItemEquipped = (id: string, user: TUser | null) => {
	return (
		user &&
		user.inventory.findIndex((item) => item.item_id === id && item.equipped) !==
			-1
	);
};

export const orderItemsByCategory = (
	store: TStoreItem[],
	user: TUser,
	layerOrder: string[]
) => {
	const _collections = store.map((item) => {
		const foundItem = user.inventory.find(
			(inventoryItem) => inventoryItem.item_id === item._id
		);
		return Object.assign({}, JSON.parse(JSON.stringify(item)), {
			selected: foundItem && foundItem.equipped ? true : false,
		});
	});
	return layerOrder
		.map((layer) => {
			return _collections.reduce((result, col) => {
				if (col.category === layer) {
					result.push(col);
				}
				return result;
			}, []);
		})
		.reduce((a, b) => a.concat(b));
};
