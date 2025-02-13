import React, { useMemo } from 'react';
import ControllerDesktop from './controller-desktop';
import ControllerMobile from './controller-mobile';
import { useGameStore } from '@/stores/game';
import { KEY, GAME_STEP } from '@/const';
import config from '@/config';

function Controller({ gameId }: { gameId: string }) {
	const movePlayer = useGameStore((state) => state.movePlayer);
	const pressKey = useGameStore((state) => state.pressKey);
	const releaseKey = useGameStore((state) => state.releaseKey);
	const isMobile = useGameStore((state) => state.isMobile);
	const gameStep = useGameStore((state) => state.gameStep);

	const gameConfig = useMemo(() => {
		return config.games[gameId].game;
	}, [gameId]);

	const onMove = ({ xSpeed, zSpeed }: any) => {
		const movement = { x: xSpeed, y: zSpeed };
		movePlayer(movement);
	};
	const onPressKey = (key: KEY) => {
		pressKey(key);
	};
	const onReleaseKey = (key: KEY) => {
		releaseKey(key);
	};

	if (gameStep === GAME_STEP.END) return null;

	if (isMobile) {
		return gameConfig.canMove ? <ControllerMobile onMove={onMove} /> : null;
	} else
		return (
			<ControllerDesktop
				onMove={gameConfig.canMove ? onMove : undefined}
				pressKeyMapping={gameConfig.pressKeyMapping}
				releaseKeyMapping={gameConfig.releaseKeyMapping}
				onPressKey={onPressKey}
				onReleaseKey={onReleaseKey}
			/>
		);
}

export default Controller;
