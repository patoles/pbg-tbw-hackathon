import { FC, useState, useEffect } from 'react';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import Popup from '@/components/ui/popup';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import { formatWallet } from '@/utils/crypto';
import { useSmartContract } from '@/hooks/use-smart-contract';
import api from '@/api';

import styles from './index.module.css';

const itemList = [
	{
		cover:
			'https://res.cloudinary.com/dxlvclh9c/image/upload/v1725349068/pixelbrawlgames/icon/coin_small_icon.png',
		amount: 100,
	},
	{
		cover:
			'https://res.cloudinary.com/dxlvclh9c/image/upload/v1725349069/pixelbrawlgames/icon/coin_medium_icon.png',
		amount: 250,
	},
	{
		cover:
			'https://res.cloudinary.com/dxlvclh9c/image/upload/v1725349415/pixelbrawlgames/icon/coin_big_icon.png',
		amount: 1000,
	},
];

interface P {
	show: boolean;
	onClose: () => void;
	onBuySuccess: () => void;
	setLoading: (loading: boolean) => void;
}

const BuyCoinModal: FC<P> = ({ show, onClose, onBuySuccess, setLoading }) => {
	const [selectedIndex, setSelectedIndex] = useState<number>(-1);
	const [walletAddr, setWalletAddr] = useState<string>('');
	const [showSuccessWallet, setShowSuccessWallet] = useState<boolean>(false);
	const userFriendlyAddress = useTonAddress();
	const [tonConnectUI] = useTonConnectUI();
	const { contract, sender } = useSmartContract();

	useEffect(() => {
		if (show) setSelectedIndex(-1);
	}, [show]);

	useEffect(() => {
		if (userFriendlyAddress) {
			setWalletAddr(formatWallet(userFriendlyAddress));
		}
	}, [userFriendlyAddress]);

	const handleClick = (index: number) => {
		setSelectedIndex(index !== selectedIndex ? index : -1);
	};

	const handleBuy = async () => {
		if (selectedIndex > -1 && contract) {
			setLoading(true);
			try {
				const { quantity, value, metadata } = await api.user.buyCoin(
					itemList[selectedIndex].amount
				);
				await contract.sendBuyCoin(sender, quantity, value, metadata);
				onClose();
				setShowSuccessWallet(true);
				onBuySuccess();
			} catch (err) {
			} finally {
				setLoading(false);
			}
		}
	};

	const handleClearWallet = () => {
		onClose();
		tonConnectUI.disconnect();
	};

	return (
		<>
			<Popup show={show} className={styles.buyCoinModal} onClose={onClose}>
				<div className={styles.title}>Buy Coins</div>
				<div className={styles.content}>
					<div className={styles.itemRow}>
						{itemList.map((item, index) => (
							<div
								className={`${styles.itemCard} ${
									selectedIndex === index ? styles.selected : ''
								}`}
								key={index}
								onClick={() => handleClick(index)}
							>
								<div
									className={styles.cover}
									style={{ backgroundImage: `url("${item.cover}")` }}
								/>
								<div className={styles.label}>{item.amount} Coins</div>
							</div>
						))}
					</div>
					<div className={styles.walletContainer}>
						<div className={styles.wallet}>
							{`Wallet: ${walletAddr}`}
							<div
								className={styles.clearWalletBtn}
								onClick={handleClearWallet}
							/>
						</div>
					</div>
					<Button
						type={selectedIndex > -1 ? 'green' : 'disabled'}
						onClick={handleBuy}
					>
						BUY
					</Button>
				</div>
			</Popup>
			<Modal
				content={
					<div className={styles.successModal}>
						{`Thank you for your purchase!\nPlease wait a few minutes while it's being processed.`}
					</div>
				}
				show={showSuccessWallet}
				onConfirm={() => setShowSuccessWallet(false)}
			/>
		</>
	);
};

export default BuyCoinModal;
