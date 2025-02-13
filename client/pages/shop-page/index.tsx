import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import useUser from '@/hooks/use-user';
import config from '@/config';
import useFetch from '@/hooks/use-fetch';
import {
	TShopPage,
	TUser,
	TStoreItem,
	TStoreItemCollection,
	TViewerConfig,
} from '@/models';
import * as shopUtils from '@/utils/shop';
import Page from '@/components/ui/page';
import Modal from '@/components/ui/modal';
import Loader from '@/components/ui/loader';
import PlayerViewer from './components/player-viewer';
import ShopSidebar from './components/shop-sidebar';
import ItemInfo from './components/item-info';
import UserInfo from './components/user-info';

import api from '@/api';

import styles from './index.module.css';

const PAGE_ID = 'shop';

const ShopPage = () => {
	const params = useParams();
	const { gameId = '' } = params;
	const { user } = useUser();
	const [collections, setCollections] = useState<TStoreItemCollection[]>([]);
	const [selectedItemID, setSelectedItemID] = useState<string>('');
	const [userInfo, setUserInfo] = useState<TUser | null>(null);
	const [showBuyModal, setShowBuyModal] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const userRequest = useFetch<TUser>(api.user.get, null, !!(user && user.id), [
		user,
	]);
	const storeRequest = useFetch<TStoreItem[]>(
		api.game.findStore,
		gameId,
		!!gameId,
		[gameId]
	);

	useEffect(() => {
		if (userRequest.data) setUserInfo(userRequest.data);
	}, [userRequest.data]);

	const store = useMemo<TStoreItem[]>(() => {
		return storeRequest.data || [];
	}, [storeRequest.data]);

	const pageConfig = useMemo<TShopPage | null>(() => {
		let _config: any = null;
		if (gameId && config.games[gameId] && config.games[gameId][PAGE_ID]) {
			_config = config.games[gameId][PAGE_ID];
		}
		return _config;
	}, [gameId]);

	const gameInfo = useMemo<any>(() => {
		return gameId && config.games[gameId] ? config.games[gameId].info : {};
	}, [gameId]);

	const selectedItem = useMemo<TStoreItem | null>(() => {
		return shopUtils.findStoreItem(selectedItemID, store);
	}, [selectedItemID, store]);

	const viewerConfig = useMemo<TViewerConfig | null>(() => {
		if (pageConfig) {
			if (selectedItem) {
				const extraLayer = pageConfig.viewer.extraLayers.find(
					(element) => element.category === selectedItem.category
				);
				if (extraLayer) return extraLayer;
			}
			return pageConfig.viewer;
		}
		return null;
	}, [pageConfig, selectedItem]);

	useEffect(() => {
		if (pageConfig && store.length && userInfo && !collections.length) {
			let collectionOrder: string[] = JSON.parse(
				JSON.stringify(pageConfig.viewer.layerOrder)
			);
			if (pageConfig.viewer.extraLayers.length) {
				collectionOrder = collectionOrder.concat(
					pageConfig.viewer.extraLayers.map((element) => element.category)
				);
			}
			setCollections(
				shopUtils.orderItemsByCategory(store, userInfo, collectionOrder)
			);
		}
	}, [pageConfig, store, userInfo]);

	const updateCollections = (updatedCollections: TStoreItemCollection[]) => {
		setCollections(updatedCollections);
	};

	const selectItem = (id: string) => {
		setSelectedItemID(id);
	};

	const onClickBuy = () => {
		if (gameId && selectedItem) {
			if (selectedItem.price) setShowBuyModal(true);
			else onBuy();
		}
	};

	const onBuy = async () => {
		setShowBuyModal(false);
		if (gameId && selectedItem) {
			setLoading(true);
			try {
				await api.game.buyStoreItem(gameId, selectedItem._id);
				userRequest.refresh();
				storeRequest.refresh();
			} catch (err) {}
			setLoading(false);
		}
	};
	const onCancelBuy = () => {
		setShowBuyModal(false);
	};
	const onEquip = async () => {
		if (selectedItem && userInfo) {
			const _item = shopUtils.findUserInventoryItem(selectedItem._id, userInfo);
			if (_item) {
				setLoading(true);
				try {
					await api.user[_item.equipped ? 'unequip' : 'equip'](_item.item_id);
					const updatedItemIndex = userInfo.inventory.findIndex(
						(item) => item.item_id === _item.item_id
					);
					const collectionItem = collections.find(
						(item) => item._id === _item.item_id
					);
					if (updatedItemIndex > -1 && collectionItem) {
						const userInfoCopy = JSON.parse(JSON.stringify(userInfo));
						// UNEQUIP ALL OTHER HERE
						userInfoCopy.inventory[updatedItemIndex].equipped = !_item.equipped;
						if (!_item.equipped) {
							userInfoCopy.inventory.forEach((inventoryItem) => {
								if (
									inventoryItem.item_id !== _item.item_id &&
									collections.find(
										(item) =>
											item._id === inventoryItem.item_id &&
											item.category === collectionItem.category
									)
								) {
									inventoryItem.equipped = false;
								}
							});
						}

						const _updatedCollection = collections.map((item) => ({
							...item,
							selected:
								item._id === _item.item_id ? !_item.equipped : item.selected,
						}));
						setUserInfo(userInfoCopy);
						setCollections(_updatedCollection);
					}
				} catch (err) {}
				setLoading(false);
			}
		}
	};

	const isLoading = () =>
		loading || userRequest.loading || storeRequest.loading;

	return (
		<Page
			title={'Shop'}
			showBack
			className="rolling-bg"
			style={
				gameInfo && gameInfo.background
					? { backgroundImage: `url("${gameInfo.background}")` }
					: {}
			}
		>
			<Loader loading={isLoading()} />
			{pageConfig && viewerConfig && userInfo ? (
				<>
					<ShopSidebar
						collections={collections}
						selectedItemID={selectedItemID}
						user={userInfo}
						updateCollections={updateCollections}
						selectItem={selectItem}
					/>
					<UserInfo
						user={userInfo}
						refreshUser={userRequest.refresh}
						setLoading={setLoading}
					/>
					<div className={styles.content}>
						<PlayerViewer config={viewerConfig} collections={collections} />
						<ItemInfo
							store={store}
							user={userInfo}
							selectedItemID={selectedItemID}
							onBuy={onClickBuy}
							onEquip={onEquip}
						/>
					</div>
				</>
			) : null}
			<Modal
				show={!!(showBuyModal && selectedItem)}
				content={
					<div className={styles.buyModal}>
						<div className={styles.text}>
							Buy <span className={styles.name}>{selectedItem?.name}</span>
							<br />
							for <span className={styles.price}>
								{selectedItem?.price}
							</span>{' '}
							Coins?
						</div>
						<div className={styles.balance}>Balance: {userInfo?.coins} C</div>
					</div>
				}
				cancelText="Cancel"
				confirmText="Yes"
				showCancel
				showConfirm
				onCancel={onCancelBuy}
				onConfirm={onBuy}
			/>
		</Page>
	);
};

export default ShopPage;
