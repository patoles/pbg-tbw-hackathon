import { FC, useEffect, useState, useRef } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { TUser } from '@/models';
import BuyCoinModal from '../buy-coin-modal';
import { PLAYER_LISTENER_INTERVAL } from '@/const';

import api from '@/api';

import styles from './index.module.css';

interface P {
	user: TUser | null;
	refreshUser: () => void;
	setLoading: (loading: boolean) => void;
}
const UserInfo: FC<P> = ({ user, refreshUser, setLoading }) => {
	const [showCoinModal, setShowCoinModal] = useState<boolean>(false);
	const [tonConnectUI] = useTonConnectUI();
	const wallet = useTonWallet();
	const listenerInterval = useRef<NodeJS.Timer | null>(null);
	const [isWaitingUpdate, setIsWaitingUpdate] = useState<boolean>(false);

	useEffect(() => {
		const statusListener = tonConnectUI.onStatusChange((wallet) => {
			if (wallet) {
				api.user.connectWalletTON(wallet.account.address);
			}
		});
		return () => {
			statusListener && statusListener();
			if (listenerInterval.current) clearInterval(listenerInterval.current);
		};
	}, []);

	const onClickBuy = () => {
		if (!tonConnectUI.connected) {
			tonConnectUI.openModal();
		} else setShowCoinModal(true);
	};

	const onBuySuccess = () => {
		if (!listenerInterval.current) {
			setIsWaitingUpdate(true);
			const startTimestamp = Date.now();
			listenerInterval.current = setInterval(async () => {
				const updated = await api.user.updated(startTimestamp);
				if (updated) {
					if (listenerInterval.current) clearInterval(listenerInterval.current);
					await refreshUser();
					setIsWaitingUpdate(false);
				}
			}, PLAYER_LISTENER_INTERVAL);
		}
	};

	return user ? (
		<>
			<div className={styles.userInfo}>
				<div className={styles.content}>
					<div className={styles.coins}>
						{isWaitingUpdate ? <div className={styles.spinner} /> : null}
						{user.coins} Coins
					</div>
					<div className={styles.buyCoins} onClick={onClickBuy}>
						{!wallet ? 'Connect TON Wallet' : 'Buy Coins'}
					</div>
				</div>
			</div>
			<BuyCoinModal
				show={showCoinModal}
				setLoading={setLoading}
				onBuySuccess={onBuySuccess}
				onClose={() => setShowCoinModal(false)}
			/>
		</>
	) : null;
};

export default UserInfo;
