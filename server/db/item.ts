import Item, { IItem } from './models/item';

/* ITEM WRITE */

export const createItem = async (ItemData: IItem) => {
	return new Promise<void>(async (resolve) => {
		const item = new Item(ItemData);
		await item.save();
		resolve();
	});
};

export const updateItem = async (
	id: string,
	ItemData?: IItem,
	metadata?: any
) => {
	return new Promise<void>(async (resolve) => {
		await Item.updateOne(
			{ _id: id },
			Object.assign({}, ItemData || {}, metadata || {})
		);
		resolve();
	});
};

export const deleteItem = async (id: string) => {
	return new Promise<void>(async (resolve) => {
		await Item.deleteOne({ _id: id });
		resolve();
	});
};

/* *** */

/* ITEM READ */

export const findItem = async (id: string) => {
	return new Promise<IItem | null>(async (resolve) => {
		const item = await Item.findOne({ _id: id });
		resolve(item);
	});
};

export const findItems = async (ids: string[]) => {
	return new Promise<IItem[]>(async (resolve) => {
		const items = await Item.find({ _id: { $in: ids } });
		resolve(items);
	});
};
