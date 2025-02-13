import { useMemo, useEffect, useState, useRef } from 'react';
import { useGameStore } from '@/stores/game';
import Popup from '@/components/ui/popup';
import Button from '@/components/ui/button';
import { SignedIn } from '@/components/ui/session';
import { isTelegram } from '@/utils';
import { GAME_STEP } from '@/const';
import { OFFLINE_ROOM_ID } from '@shared/const';

import styles from './index.module.css';

const UIContainer = ({ children }) => {
	return <div className={styles.UIContainer}>{children}</div>;
};

const GameUI = () => {
	const [showPopup, setShowPopup] = useState<boolean>(false);

	const players = useGameStore((state) => state.players);
	const localPlayer = useGameStore((state) => state.localPlayer);
	const gameDuration = useGameStore((state) => state.gameDuration);
	const gameStartTime = useGameStore((state) => state.gameStartTime);
	const isMobile = useGameStore((state) => state.isMobile);
	const rewards = useGameStore((state) => state.rewards);
	const gameId = useGameStore((state) => state.gameId);
	const gameStep = useGameStore((state) => state.gameStep);
	const roomId = useGameStore((state) => state.roomId);

	const tickInterval = useRef<NodeJS.Timer | null>(null);
	const tickTimeout = useRef<NodeJS.Timeout | null>(null);

	const totalAlive = useMemo<number>(() => {
		return Object.values(players).filter((item) => item.alive).length;
	}, [players]);

	useEffect(() => {
		return () => {
			if (tickTimeout.current) clearTimeout(tickTimeout.current);
			if (tickInterval.current) clearInterval(tickInterval.current);
		};
	}, []);

	useEffect(() => {
		if (gameStartTime && gameDuration) {
			const timeToStart = Math.max(gameStartTime - Date.now(), 0);
			if (timeToStart > 0) setShowPopup(true);
			tickTimeout.current = setTimeout(() => {
				setShowPopup(false);
			}, timeToStart);
		}
	}, [gameStartTime, gameDuration]);

	useEffect(() => {
		if (gameStep === GAME_STEP.END && tickInterval.current) {
			clearInterval(tickInterval.current);
		}
	}, [gameStep]);

	const redirectPlayAgain = () => {
		window.location.reload();
	};
	const redirectShop = () => {
		if (gameId) window.location.replace(`/game/${gameId}/shop`);
	};
	const redirectHome = () => {
		if (gameId) window.location.replace(`/game/${gameId}`);
	};
	const shareTelegram = () => {
		if (isTelegram()) {
			const botUsername = 'pixelbrawl_bot';
			const text = encodeURIComponent(`Try this game!`);
			const shareLink = encodeURIComponent(`https://t.me/${botUsername}`);
			window.open(
				`https://t.me/share/url?url=${shareLink}&text=${text}`,
				'_blank'
			);
		}
	};

	return (
		<div className={styles.gameUI}>
			<Popup
				show={showPopup}
				noOverlay
				className={`${styles.UIPopup} ${
					isMobile ? styles.mobile : styles.desktop
				}`}
				style={{ position: 'fixed' }}
			/>
			<Popup
				show={!!rewards}
				noOverlay
				className={`${styles.UIPopup} ${styles.rewards} ${
					isTelegram() ? styles.isTelegram : ''
				}`}
				style={{ position: 'fixed' }}
			>
				{rewards && rewards.length ? (
					<div className={styles.reward}>
						You earned{' '}
						{rewards?.map((reward, rewardIndex) => (
							<span key={rewardIndex}>
								{rewardIndex ? ' and ' : ''}
								<span
									className={styles.rewardValue}
									style={reward.color ? { color: reward.color } : {}}
								>
									{reward.value}{' '}
								</span>
								<span
									className={styles.rewardLabel}
									style={reward.color ? { color: reward.color } : {}}
								>
									{reward.label}
									{rewardIndex === rewards.length - 1 ? '!' : ''}
								</span>
							</span>
						))}
					</div>
				) : null}
				<div className={styles.btnContainer}>
					<Button type="blue" onClick={redirectPlayAgain}>
						Play Again
					</Button>
					<SignedIn>
						<Button type="red" onClick={redirectShop}>
							Shop
						</Button>
					</SignedIn>
					{isTelegram() ? (
						<Button type="blue" onClick={shareTelegram}>
							Share
						</Button>
					) : null}
					<Button type="green" onClick={redirectHome}>
						Main Menu
					</Button>
				</div>
			</Popup>
			<div className={`${styles.UIScore}`}>
				<div
					className={styles.UIScoreContent}
				>{`${players[localPlayer].kill}`}</div>
			</div>
			{roomId !== OFFLINE_ROOM_ID ? (
				<UIContainer>
					<div className={styles.UIText}>
						{`${totalAlive}/${Object.keys(players).length}`} Survivors
					</div>
				</UIContainer>
			) : null}
		</div>
	);
};

export default GameUI;
