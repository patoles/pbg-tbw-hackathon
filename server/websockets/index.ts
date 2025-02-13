import { Server, IncomingMessage, ServerResponse } from 'http';
import { WebSocketServer } from 'ws';
import MongoStore from 'connect-mongo';
import Game from '../game';
import queryString from 'node:querystring';
import { parse } from 'cookie';
import PlayerQueue from './player-queue';
import { print } from '../../shared/utils';
import { WS_ERROR_CODE_MAINTENANCE } from '../../shared/const';
import { checkAuthValid } from '../middleware/auth-middleware/solana-auth';

const allowedOrigins = [
	'https://pixelbrawlgames.com',
	'https://www.pixelbrawlgames.com',
	'https://ws.pixelbrawlgames.com',
];

const websockets = async (
	expressServer: Server<typeof IncomingMessage, typeof ServerResponse>,
	game: Game,
	sessionStore: MongoStore
) => {
	const playerQueue = new PlayerQueue(game);

	const websocketServer = new WebSocketServer({
		noServer: true,
		path: '/ws',
	});

	expressServer.on('upgrade', (request, socket, head) => {
		websocketServer.handleUpgrade(request, socket, head, (websocket) => {
			websocketServer.emit('connection', websocket, request);
		});
	});

	websocketServer.on('connection', function connection(ws, connectionRequest) {
		if (connectionRequest && connectionRequest.url) {
			if (game.waitShutdown) {
				ws.close(WS_ERROR_CODE_MAINTENANCE, 'maintenance');
				return;
			} else {
				const origin = connectionRequest.headers.origin || '';
				if (
					process.env.NODE_ENV !== 'development' &&
					!allowedOrigins.includes(origin)
				) {
					print(`Connection attempt from disallowed origin: ${origin}`);
					// Close the connection if the origin is not allowed
					ws.close(1008, 'Origin not allowed'); // Code 1008 - Policy Violation
					return;
				} else {
					const [, params] = connectionRequest.url.split('?');
					const metadata = queryString.parse(params);
					if (metadata.gameId && game.games[`${metadata.gameId}`]) {
						// VALIDATE SOLANA WALLET
						if (
							metadata.roomId &&
							game.rooms[`${metadata.roomId}`] &&
							game.rooms[`${metadata.roomId}`].data.fee
						) {
							const cookies = parse(connectionRequest.headers.cookie || '');
							if (cookies) {
								const cookie = cookies['connect.sid'] || '::';
								//								console.log('Cookie:', cookie);
								const [, sessionId] = cookie.split(/[:.]/);
								if (sessionId) {
									sessionStore.get(sessionId, (err, session) => {
										console.log('User session:', session?.user);
										if (
											!err &&
											session?.user?.solanaAuth &&
											checkAuthValid(session.user.solanaAuth)
										) {
											console.log('Add player to queue', metadata);
											playerQueue.add(`${metadata.gameId}`, ws, metadata);
										} else ws.close(1008, 'Wrong parameters');
									});
								} else ws.close(1008, 'Wrong parameters');
							} else ws.close(1008, 'Wrong parameters');
						} else {
							playerQueue.add(`${metadata.gameId}`, ws, metadata);
						}
					} else {
						ws.close(1008, 'Wrong parameters');
					}
				}
			}
		}
	});

	return websocketServer;
};

export default websockets;
