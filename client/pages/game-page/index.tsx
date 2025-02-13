import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import * as WS from '@/websocket';
import { useGameStore } from '@/stores/game';
import Scene from './components/scene';
import MessageHandler from './components/ui/message-handler';
import MobileControls from './components/ui/mobile-controls';
import Lobby from './components/lobby';
import GameUIWrapper from './components/ui/game-ui-wrapper';
import { stopAllAudio } from '@/utils/audio';
import config from '@/config';

import styles from './index.module.css';

const GamePage = () => {
	const params = useParams();
	const navigate = useNavigate();
	const ready = useGameStore((state) => state.ready);
	const roomId = useGameStore((state) => state.roomId);
	const { gameId = '' } = params;

	useEffect(() => {
		return () => {
			WS.disconnect();
			stopAllAudio();
		};
	}, []);

	useEffect(() => {
		if (roomId && roomId !== params.roomId) {
			navigate(`/game/${gameId}/r/${roomId}`, { replace: true });
		}
	}, [roomId]);

	const gameInfo = useMemo<any>(() => {
		return gameId && config.games[gameId] ? config.games[gameId].info : {};
	}, [gameId]);

	return (
		<div className={styles.gamePage}>
			<Helmet>
				<title>{gameInfo.name}</title>
				<meta name="description" content={gameInfo.description} />
				<link
					rel="canonical"
					href={`https://pixelbrawlgames.com/game/${gameId}`}
				/>
			</Helmet>
			{ready ? (
				<>
					<Scene gameId={gameId} />
					<MobileControls gameId={gameId} />
					<MessageHandler />
					<GameUIWrapper gameId={gameId} />
				</>
			) : (
				<Lobby gameId={gameId} roomId={params.roomId || ''} />
			)}
		</div>
	);
};

export default GamePage;
