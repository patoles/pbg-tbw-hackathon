import { FC, useMemo, useEffect, useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { useGameStore } from '@/stores/game';
import useUser from '@/hooks/use-user';
import { createAudioContext } from '@/utils/audio';
import { getUrlParam, isTelegram } from '@/utils';
import config from '@/config';
import Loader from '@/components/ui/loader';
import useFetch from '@/hooks/use-fetch';
import { TUser } from '@/models';
import FeeModal from './components/fee-modal';
import { OFFLINE_ROOM_ID } from '@shared/const';
import {
	decimalToUnit,
	findMintLabel,
} from '@shared/smart-contract/solana/utils';

import api from '@/api';

import styles from './index.module.css';

interface P {
	gameId: string;
	roomId: string;
}
const Lobby: FC<P> = ({ gameId, roomId }) => {
	const { user, isLoaded } = useUser();
	const [countdown, setCountdown] = useState<number>(0);
	const [canClick, setCanClick] = useState<boolean>(true);
	const [isCopied, setIsCopied] = useState<boolean>(false);
	const [showFeeModal, setShowFeeModal] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const interval = useRef<NodeJS.Timer | null>(null);

	const readyPlayer = useGameStore((state) => state.readyPlayer);
	const initGame = useGameStore((state) => state.initGame);
	const players = useGameStore((state) => state.players);
	const localPlayer = useGameStore((state) => state.localPlayer);
	const lobbyStartTime = useGameStore((state) => state.lobbyStartTime);
	//	const maxPlayer = useGameStore((state) => state.maxPlayer);
	const fee = useGameStore((state) => state.fee);
	const ready = useGameStore((state) => state.ready);

	const userRequest = useFetch<TUser>(
		api.user.get,
		null,
		!!(user && user.id && fee),
		[!!(user && user.id && fee)]
	);

	useEffect(() => {
		if (isLoaded) {
			const isNew = !!getUrlParam('new');
			const isPrivate = !!getUrlParam('private');
			const feeParam = getUrlParam('fee') || '';
			const minPlayer = getUrlParam('minPlayer') || '';
			initGame(gameId, roomId, user?.id, isNew, isPrivate, feeParam, minPlayer);
		}
	}, [roomId, isLoaded]);

	useEffect(() => {
		if (!ready && lobbyStartTime && !interval.current) {
			updateCountdown();
			interval.current = setInterval(updateCountdown, 1000);
		} else if (ready && interval.current) clearTimer();
		return () => {
			clearTimer();
		};
	}, [lobbyStartTime, ready]);

	const playersReady = useMemo<number>(() => {
		return Object.values(players).filter((player) => player.ready).length;
	}, [players]);

	const isReady = useMemo<boolean>(() => {
		return players[localPlayer] ? players[localPlayer].ready : false;
	}, [players, localPlayer]);

	const roomUrl = useMemo<string>(() => {
		return `${window.location.origin}/game/${gameId}/r/${roomId}`;
	}, [gameId, roomId]);

	const gameInfo = useMemo<any>(() => {
		return gameId && config.games[gameId] ? config.games[gameId].info : {};
	}, [gameId]);

	const canShowButton = useMemo<boolean>(() => {
		return !!(
			Object.keys(players).length &&
			(!fee || (fee && user && !userRequest.loading && userRequest.data))
		);
	}, [players, fee, isLoaded, userRequest]);

	useEffect(() => {
		if (isReady && loading) setLoading(false);
	}, [isReady]);

	const value = useMemo<number>(() => {
		return fee?.value ? decimalToUnit(fee.value, fee.mint) : 0;
	}, [fee]);

	const handleReady = () => {
		if (canClick && !isReady) {
			createAudioContext();
			if (!fee) {
				onReady();
			} else {
				setShowFeeModal(true);
			}
		}
	};

	const onReady = () => {
		setCanClick(false);
		readyPlayer();
		if (showFeeModal) setShowFeeModal(false);
		setLoading(true);
	};

	const confirmFeeModal = () => {
		onReady();
	};

	const clearTimer = () => {
		if (interval.current) {
			clearInterval(interval.current);
			interval.current = null;
		}
	};
	const updateCountdown = () => {
		const remainingTime = Math.round((lobbyStartTime - Date.now()) / 1000);
		if (remainingTime < 1) clearTimer();
		setCountdown(remainingTime);
	};

	const onCopy = () => {
		if (isTelegram()) {
			const botUsername = 'pixelbrawl_bot';
			const payload = `${gameId}__${roomId}`;
			const text = encodeURIComponent(`Let's play together!`);
			const shareLink = encodeURIComponent(
				`https://t.me/${botUsername}?start=${payload}`
			);
			window.open(
				`https://t.me/share/url?url=${shareLink}&text=${text}`,
				'_blank'
			);
		} else {
			navigator.clipboard.writeText(roomUrl);
			setIsCopied(true);
		}
	};

	if (roomId === OFFLINE_ROOM_ID) return null;

	return isLoaded ? (
		<div
			className={`${styles.lobby} rolling-bg`}
			style={
				gameInfo && gameInfo.background
					? { backgroundImage: `url("${gameInfo.background}")` }
					: {}
			}
		>
			<Loader loading={loading} />
			<div className={styles.content}>
				{countdown > 0 ? (
					<div className={styles.timer}>Game starts in {countdown}s..</div>
				) : null}
				{Object.keys(players).length ? (
					<>
						<div className={styles.queue}>
							<div className={styles.queueInfo}>
								<div className={styles.queueLabel}>Players connected: </div>
								<div className={`${styles.queueValue}`}>
									{Object.keys(players).length}
								</div>
							</div>
							<div className={styles.queueInfo}>
								<div className={styles.queueLabel}>Players ready: </div>
								<div
									className={`${styles.queueValue} ${
										playersReady ? styles.queueReady : ''
									}`}
								>
									{playersReady}
								</div>
							</div>
						</div>
					</>
				) : (
					<div className={styles.queue}>Please wait a moment..</div>
				)}
				{fee && fee.value ? (
					<div className={styles.fee}>
						Joining Fee:{' '}
						<span className={styles.value}>
							{value} {findMintLabel(fee?.mint)}
						</span>
					</div>
				) : null}
				{roomId ? (
					<div className={styles.share} onClick={onCopy}>
						<span className={`${styles.text} ${styles.focus}`}>
							Invite your Friends:
						</span>
						<span className={styles.text}>{roomUrl}</span>
						<QRCode value={roomUrl} size={200} className={styles.qrCode} />
						{isTelegram() ? (
							<span className={`${styles.text} ${styles.focus}`}>
								Click To Invite!
							</span>
						) : (
							<span
								className={`${styles.text} ${styles.focus} ${
									isCopied ? styles.valid : ''
								}`}
							>
								{isCopied ? 'Copied To Clipboard!' : 'Click To Copy!'}
							</span>
						)}
					</div>
				) : null}
				{canShowButton ? (
					<div
						className={`${styles.button} ${isReady ? styles.disabled : ''}`}
						onClick={handleReady}
					>
						Ready
					</div>
				) : null}
			</div>
			<FeeModal
				show={showFeeModal}
				fee={fee}
				gameId={gameId}
				roomId={roomId}
				setLoading={setLoading}
				onClose={() => setShowFeeModal(false)}
				onConfirm={confirmFeeModal}
			/>
		</div>
	) : null;
};

export default Lobby;
