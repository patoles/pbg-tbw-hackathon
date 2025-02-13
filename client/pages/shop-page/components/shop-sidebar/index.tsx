import { FC, useMemo, useState, useEffect } from 'react';
import Accordion from '@/components/ui/accordion';
import { useGameStore } from '@/stores/game';
import { TUser, TStoreItemCollection } from '@/models';
import * as shopUtils from '@/utils/shop';

import styles from './index.module.css';

interface CategoryGroupP {
	category: string;
	collection: TStoreItemCollection[];
}
interface P {
	collections: TStoreItemCollection[];
	selectedItemID: string;
	user: TUser | null;
	updateCollections: (updatedCollections: TStoreItemCollection[]) => void;
	selectItem: (id: string) => void;
}
export const ShopSidebar: FC<P> = ({
	collections,
	selectedItemID,
	user,
	updateCollections,
	selectItem,
}) => {
	const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
	const isMobile = useGameStore((state) => state.isMobile);

	useEffect(() => {
		setIsCollapsed(false);
	}, [isMobile]);

	useEffect(() => {
		if (!isMobile) setIsCollapsed(false);
	}, [isMobile]);

	const categories = useMemo<CategoryGroupP[]>(() => {
		const _categories: CategoryGroupP[] = [];

		const groups = {};
		collections.forEach((collection) => {
			if (!groups[collection.category]) groups[collection.category] = [];
			groups[collection.category].push(collection);
		});
		Object.keys(groups).forEach((group) => {
			_categories.push({
				category: group,
				collection: JSON.parse(JSON.stringify(groups[group])),
			});
		});
		return _categories;
	}, [collections]);

	const isActive = (id: string) => {
		const foundItem = collections.find((item) => item._id === id);
		return foundItem && foundItem.selected;
	};
	const isSelected = (id: string) => {
		return id === selectedItemID;
	};
	const isEquipped = (id: string) => {
		return shopUtils.isItemEquipped(id, user);
	};

	const handleClick = (id: string) => {
		const index = collections.findIndex((item) => item._id === id);
		if (index > -1) {
			if (
				collections[index].selected &&
				collections[index]._id !== selectedItemID
			) {
				selectItem(collections[index]._id);
			} else {
				const updatedCollections = JSON.parse(JSON.stringify(collections));
				updatedCollections[index].selected =
					!updatedCollections[index].selected;
				if (updatedCollections[index].selected) {
					updatedCollections.forEach((item: TStoreItemCollection) => {
						if (
							item._id !== updatedCollections[index]._id &&
							item.category === updatedCollections[index].category
						)
							item.selected = false;
					});
				}
				updateCollections(updatedCollections);
				selectItem(
					updatedCollections[index].selected
						? updatedCollections[index]._id
						: ''
				);
			}
		}
	};

	if (!categories.length) return null;

	return (
		<div className={styles.shopSidebar}>
			<div
				className={`${styles.sidebarWrapper} ${
					isCollapsed && isMobile ? styles.collapsed : ''
				}`}
			>
				<div
					className={`${styles.sidebarContent} ${
						isMobile ? styles.mobile : ''
					}`}
				>
					{categories.map((item, index) => (
						<Accordion
							title={item.category}
							opened={!index}
							titleClass={styles.accordionTitle}
							titleOpenClass={styles.accordionTitleOpen}
							contentClass={styles.list}
							key={index}
						>
							{item.collection.map((listItem, listIndex) => (
								<div
									key={listIndex}
									className={`${styles.listItem} ${
										isActive(listItem._id) ? styles.active : ''
									} ${isSelected(listItem._id) ? styles.selected : ''}`}
									onClick={() => handleClick(listItem._id)}
								>
									<span className={styles.name}>{listItem.name}</span>
									{isEquipped(listItem._id) ? (
										<div className={`${styles.icon} ${styles.equip}`} />
									) : null}
								</div>
							))}
							<div className={styles.space} />
						</Accordion>
					))}
				</div>
			</div>
			{isMobile ? (
				<div
					className={`${styles.sidebarButton} ${
						isCollapsed ? styles.collapsed : ''
					}`}
					onClick={() => setIsCollapsed(!isCollapsed)}
				>
					<div className={styles.buttonIcon} />
				</div>
			) : null}
		</div>
	);
};

export default ShopSidebar;
