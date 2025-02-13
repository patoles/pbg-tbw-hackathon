import './instrument';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import ViteExpress from 'vite-express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import websockets from './websockets';
import Game from './game';
import * as Sentry from '@sentry/node';
import { SESSION_MAX_AGE_MS, DEFAULT_PORT } from './const';
import { print } from '../shared/utils';

import api from './api';

const { NODE_ENV } = process.env;

dotenv.config({
	path: './.env.local',
});

async function createServer() {
	const app = express();
	ViteExpress.config({
		mode: NODE_ENV === 'production' ? 'production' : 'development',
	});
	const PORT = parseInt(String(process.env.PORT)) || DEFAULT_PORT;
	const rootFolder = NODE_ENV === 'production' ? 'dist' : 'public';

	app.set('trust proxy', 1);
	app.use(
		cors(
			NODE_ENV === 'production'
				? {
						origin: [
							'https://pixelbrawlgames.com',
							'https://www.pixelbrawlgames.com',
							'https://ws.pixelbrawlgames.com',
						],
						credentials: true,
				  }
				: {}
		)
	);
	app.use(cookieParser());
	const sessionStore = MongoStore.create({
		client: mongoose.connection.getClient(),
	});
	app.use(
		session({
			store: sessionStore,
			secret: process.env.SESSION_SECRET_KEY,
			resave: false,
			saveUninitialized: false,
			cookie: {
				secure: NODE_ENV === 'production',
				httpOnly: true,
				sameSite: NODE_ENV === 'production' ? 'none' : 'Lax',
				maxAge: SESSION_MAX_AGE_MS,
				domain: NODE_ENV === 'production' ? '.pixelbrawlgames.com' : undefined,
			},
		})
	);
	app.use('/', express.static(path.join(__dirname, rootFolder)));

	Sentry.setupExpressErrorHandler(app);

	// INIT GAME
	const game = new Game();

	api(app, game);

	const server = ViteExpress.listen(app, PORT, () => {
		if (NODE_ENV === 'production' && process.send) process.send('ready');
		print(`> Local: \x1b[36m${process.env.HOST}:\x1b[1m${PORT}/\x1b[0m`);
	});
	websockets(server, game, sessionStore);

	// HANDLE GRACEFUL SHUTDOWN
	if (NODE_ENV === 'production') {
		process.on('message', async (message) => {
			if (message === 'shutdown') {
				await gracefulShutdown();
			}
			print(message as string);
		});

		const gracefulShutdown = async () => {
			console.log('Graceful shutdown initiated...');
			game.gracefulShutdown();
			await new Promise<void>((resolve) => {
				let remainingRooms = 0;
				const interval = setInterval(() => {
					if (game.canShutdown) {
						clearInterval(interval);
						resolve();
					} else {
						if (Object.keys(game.rooms).length !== remainingRooms) {
							remainingRooms = Object.keys(game.rooms).length;
							console.log(`Remaining rooms: ${remainingRooms}`);
							Object.values(game.rooms).forEach((room) => {
								console.log(
									`Room: ${room.id} | Remaining players: ${room.clients.size}`
								);
							});
						}
					}
				}, 1000);
			});
			console.log('Graceful shutdown completed.');
			if (process.send) process.send('ready');
			process.exit(0);
		};
		process.on('SIGINT', gracefulShutdown);
		process.on('SIGTERM', gracefulShutdown);
	}
}

print('Connecting to DB...');
mongoose
	.connect(String(process.env.MONGODB_URI))
	.then(() => {
		print('Connected to DB');
		createServer();
	})
	.catch((err) => print(err.message, true));
