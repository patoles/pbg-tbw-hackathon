import { FC, useEffect, useState, useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import Popup from '@/components/ui/popup';
import { TFee } from '@shared/models';
import api from '@/api';
import * as SolanaSnakeContract from '@shared/smart-contract/solana/wrappers';
import gameMonitor from '@shared/smart-contract/solana/game-monitor';
import { decimalToUnit } from '@shared/smart-contract/solana/utils';

import styles from './index.module.css';

interface P {
	show: boolean;
	fee?: TFee;
	gameId: string;
	roomId: string;
	setLoading: (boolean) => void;
	onClose: () => void;
	onConfirm: () => void;
}

const FeeModal: FC<P> = ({
	show,
	fee,
	gameId,
	roomId,
	setLoading,
	onClose,
	onConfirm,
}) => {
	const [game, setGame] = useState<any>(null);

	useEffect(() => {
		if (show && !game) {
			(async () => {
				setLoading(true);
				const room = await api.game.getRoom(gameId, roomId);
				if (room && room.paidFees && room.paidFees.length === 1) {
					const games = await gameMonitor.getPlayerGames(
						new PublicKey(room.paidFees[0])
					);
					const filteredGames = (games || []).filter(
						(_game) => _game.state === 'Created'
					);
					setGame(filteredGames.length ? filteredGames[0] : null);
				}
				setLoading(false);
			})();
		}
	}, [show]);

	const onClick = async () => {
		if (game) {
			setLoading(true);
			console.log(game);
			if (window.solana.publicKey !== game.player1) {
				try {
					const res = await SolanaSnakeContract.joinGame(
						new PublicKey(game.player1),
						new PublicKey(game.mint)
					);
					if (res) onConfirm();
				} catch (err) {
					window.location.replace(`/game/${gameId}`);
				}
			}
		}
	};

	const value = useMemo<number>(() => {
		return fee?.value ? decimalToUnit(fee.value, fee.mint) : 0;
	}, [fee]);

	return (
		<Popup show={show && game} className={styles.feeModal} onClose={onClose}>
			{fee && fee.value ? (
				<div className={styles.title}>
					{`You're about to pay a joining fee of `}{' '}
					<span className={styles.value}>{`${value} Coins`}</span>.
				</div>
			) : null}
			<div className={styles.content}>
				<div className={styles.button} onClick={onClick}>
					Confirm
				</div>
			</div>
		</Popup>
	);
};

export default FeeModal;
