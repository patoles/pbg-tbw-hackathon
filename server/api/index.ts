import { Express } from 'express';
import Game from '../game';

import gameAPI from './game';
import userAPI from './user';
import clerkAPI from './clerk';
import telegramAPI from './telegram';
import cryptoAPI from './crypto';

const { NODE_ENV } = process.env;

const api = (app: Express, game: Game) => {
	gameAPI(app, game);
	userAPI(app);
	clerkAPI(app);
	if (NODE_ENV === 'production') telegramAPI();
	cryptoAPI(game);
};

export default api;
