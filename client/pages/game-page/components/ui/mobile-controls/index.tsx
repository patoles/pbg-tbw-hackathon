import { FC, useMemo } from 'react';
import { useGameStore } from '@/stores/game';
import config from '@/config';
import { KEY, GAME_STEP } from '@/const';

import styles from './index.module.css';

let lastDown: any = {};

interface P {
	gameId: string;
}
const MobileControls: FC<P> = ({ gameId }) => {
	const pressKey = useGameStore((state) => state.pressKey);
	const releaseKey = useGameStore((state) => state.releaseKey);
	const isMobile = useGameStore((state) => state.isMobile);
	const virtualJoystick = useGameStore((state) => state.virtualJoystick);
	const players = useGameStore((state) => state.players);
	const localPlayer = useGameStore((state) => state.localPlayer);
	const gameStep = useGameStore((state) => state.gameStep);

	const gameConfig = useMemo(() => {
		return config.games[gameId].game;
	}, [gameId]);

	if (
		!gameId ||
		!config.games[gameId] ||
		!isMobile ||
		gameStep === GAME_STEP.END
	)
		return null;

	const onTouchStart = (key: KEY) => {
		if (lastDown[key] !== key && gameConfig.pressKeyMapping) {
			Object.values(gameConfig.pressKeyMapping).forEach((_key) => {
				if (_key === key) {
					pressKey(key);
					lastDown = key;
				}
			});
		}
	};
	const onTouchEnd = (key: KEY) => {
		if (gameConfig.releaseKeyMapping) {
			Object.values(gameConfig.releaseKeyMapping).forEach((_key) => {
				if (_key === key) {
					releaseKey(key);
				}
			});
		}
	};

	return (
		<div className={styles.mobileControls}>
			{virtualJoystick.size ? (
				<div
					className={styles.virtualJoystick}
					style={{
						top: virtualJoystick.start.y - virtualJoystick.size / 2,
						left: virtualJoystick.start.x - virtualJoystick.size / 2,
						width: `${virtualJoystick.size}px`,
						height: `${virtualJoystick.size}px`,
					}}
				>
					<div
						className={styles.virtualJoystickPointer}
						style={{
							top: virtualJoystick.pos.y - virtualJoystick.size / 2 / 2,
							left: virtualJoystick.pos.x - virtualJoystick.size / 2 / 2,
							width: `${virtualJoystick.size / 2}px`,
							height: `${virtualJoystick.size / 2}px`,
						}}
					/>
				</div>
			) : null}
			{config.games[gameId].game.controls.length ? (
				<div className={styles.mobileButtons}>
					{config.games[gameId].game.controls.map((controlButton, index) => {
						return !controlButton.condition ||
							controlButton.condition(players[localPlayer]) ? (
							controlButton.type && controlButton.type === 'area' ? (
								<div
									className={`${styles.buttonArea} ui-clickable`}
									key={index}
									style={controlButton.style || {}}
									onTouchStart={() => onTouchStart(controlButton.key)}
									onTouchEnd={() => onTouchEnd(controlButton.key)}
									onContextMenu={(e) => {
										e.preventDefault();
									}}
								/>
							) : (
								<div className={styles.buttonContainer} key={index}>
									<div
										className={`${styles.button} ui-clickable`}
										onTouchStart={() => onTouchStart(controlButton.key)}
										onTouchEnd={() => onTouchEnd(controlButton.key)}
										onContextMenu={(e) => {
											e.preventDefault();
										}}
										style={{
											backgroundImage: `url(${controlButton.backgroundImage})`,
										}}
									/>
								</div>
							)
						) : null;
					})}
				</div>
			) : null}
		</div>
	);
};

export default MobileControls;
