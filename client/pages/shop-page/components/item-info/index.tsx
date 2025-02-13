import { FC, useMemo } from 'react';
import { TUser, TUserInventory, TStoreItem } from '@/models';
import Button from '@/components/ui/button';
import * as shopUtils from '@/utils/shop';

import styles from './index.module.css';

interface P {
	store: TStoreItem[];
	user: TUser | null;
	selectedItemID: string;
	onBuy: () => void;
	onEquip: () => void;
}

const ItemInfo: FC<P> = ({ store, user, selectedItemID, onBuy, onEquip }) => {
	const item = useMemo<TStoreItem | null>(() => {
		let _item: TStoreItem | null = null;
		if (selectedItemID) {
			_item = shopUtils.findStoreItem(selectedItemID, store);
		}
		return _item;
	}, [selectedItemID, store]);

	const userItem = useMemo<TUserInventory | null>(() => {
		let _item: TUserInventory | null = null;
		if (item && user) {
			_item = shopUtils.findUserInventoryItem(item._id, user);
		}
		return _item;
	}, [item, user]);

	const handleBuy = () => {
		if (item && user && item.price <= user.coins) {
			onBuy();
		}
	};

	const handleEquip = () => {
		if (userItem) {
			onEquip();
		}
	};

	if (!user) return null;

	return (
		<div className={styles.itemInfo}>
			{item ? (
				<>
					<div className={styles.name}>{item.name}</div>
					{!userItem ? (
						<>
							<div
								className={`${styles.price} ${!item.price ? styles.free : ''}`}
							>
								{item.price ? `${item.price} Coins` : 'FREE'}
							</div>

							<Button
								type={item.price > user.coins ? 'disabled' : 'gold'}
								onClick={handleBuy}
							>
								{item.price ? 'BUY' : 'GET'}
							</Button>
						</>
					) : (
						<Button
							type={userItem.equipped ? 'red' : 'green'}
							onClick={handleEquip}
						>
							{userItem.equipped ? 'UNEQUIP' : 'EQUIP'}
						</Button>
					)}
				</>
			) : null}
		</div>
	);
};

export default ItemInfo;
