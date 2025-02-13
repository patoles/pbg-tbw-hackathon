import { FC, useMemo, useEffect, useState, useRef } from 'react';
import { useGameStore } from '@/stores/game';
import Popup from '@/components/ui/popup';
import Button from '@/components/ui/button';
import { SignedIn } from '@/components/ui/session';
import { isTelegram } from '@/utils';
import { GAME_STEP } from '@/const';

import styles from './index.module.css';

interface UICellP {
	cover: string;
	label?: string;
}
const UICell: FC<UICellP> = ({ cover, label }) => {
	return (
		<div className={`${styles.UICell} ${!label ? styles.noLabel : ''}`}>
			<div
				className={styles.cover}
				style={{ backgroundImage: `url(${cover})` }}
			/>
			{label ? <div className={styles.label}>{label}</div> : null}
		</div>
	);
};

const UIContainer = ({ children }) => {
	return <div className={styles.UIContainer}>{children}</div>;
};

const GameUI = () => {
	const [showPopup, setShowPopup] = useState<boolean>(false);
	const [timer, setTimer] = useState<{ minutes: number; seconds: number }>({
		minutes: 1,
		seconds: 0,
	});

	const players = useGameStore((state) => state.players);
	const localPlayer = useGameStore((state) => state.localPlayer);
	const gameDuration = useGameStore((state) => state.gameDuration);
	const gameStartTime = useGameStore((state) => state.gameStartTime);
	const isMobile = useGameStore((state) => state.isMobile);
	const rewards = useGameStore((state) => state.rewards);
	const gameId = useGameStore((state) => state.gameId);
	const gameStep = useGameStore((state) => state.gameStep);

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

	const getTimerFromSeconds = (_seconds: number) => {
		const minutes = Math.max(Math.floor(_seconds / 60), 0);
		const seconds = Math.max(_seconds - minutes * 60, 0);

		return {
			minutes,
			seconds,
		};
	};

	const formatTime = (_timer) => {
		return !_timer.minutes && !_timer.seconds
			? 'HURRY'
			: `${_timer.minutes < 10 ? '0' : ''}${_timer.minutes}:${
					_timer.seconds < 10 ? '0' : ''
			  }${_timer.seconds}`;
	};

	useEffect(() => {
		if (gameStartTime && gameDuration) {
			setTimer(getTimerFromSeconds(gameDuration / 1000));
			const timeToStart = Math.max(gameStartTime - Date.now(), 0);
			if (timeToStart > 0) setShowPopup(true);
			tickTimeout.current = setTimeout(() => {
				setShowPopup(false);
				const tick = () => {
					if (gameStartTime <= Date.now()) {
						const remainingSeconds = Math.floor(
							(gameDuration - (Date.now() - gameStartTime)) / 1000
						);
						const _timer = getTimerFromSeconds(remainingSeconds);
						setTimer(_timer);
						if (tickInterval.current && !_timer.minutes && !_timer.seconds) {
							clearInterval(tickInterval.current);
						}
					}
				};
				tick();
				tickInterval.current = setInterval(tick, 1000);
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
			<div
				className={`${styles.UITimer} ${
					!timer.minutes && !timer.seconds ? styles.timerOver : ''
				}`}
			>
				<div className={styles.UITimerContent}>{formatTime(timer)}</div>
			</div>
			<UIContainer>
				<div className={styles.UIText}>
					{`${totalAlive}/${Object.keys(players).length}`} Survivors
				</div>
				<UICell
					cover="https://res.cloudinary.com/dxlvclh9c/image/upload/v1720707175/pixelbrawlgames/blast/icon/bomb_icon.png"
					label={players[localPlayer].properties.maxBombs}
				/>
				<UICell
					cover="https://res.cloudinary.com/dxlvclh9c/image/upload/v1720707523/pixelbrawlgames/blast/icon/power_icon.png"
					label={players[localPlayer].properties.power}
				/>
				{players[localPlayer].properties.kick ? (
					<UICell cover="https://res.cloudinary.com/dxlvclh9c/image/upload/v1720705198/pixelbrawlgames/blast/icon/kick_icon.png" />
				) : null}
				{players[localPlayer].properties.powerUp ? (
					<UICell cover="https://res.cloudinary.com/dxlvclh9c/image/upload/v1720707323/pixelbrawlgames/blast/icon/super_icon.png" />
				) : null}
			</UIContainer>
		</div>
	);
};

export default GameUI;
