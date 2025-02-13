import { TWebsiteConfig } from '@/models';
import * as blastConfig from './blast';
import * as snakeConfig from './snake';

const config: TWebsiteConfig = {
	domain: window.location.origin,
	title: 'PixelBrawlGames',
	description:
		'Explore a vast world of free multiplayer web games. Join now and unleash your gaming prowess with players from around the globe!',
	games: Object.assign({}, blastConfig, snakeConfig),
};

export default config;
