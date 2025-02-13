import { FC } from 'react';

import config from '@/config';

interface P {
	gameId: string;
}
const GameUIWrapper: FC<P> = ({ gameId }) => {
	return config.games[gameId] ? config.games[gameId].game.uiComponent() : null;
};

export default GameUIWrapper;
