import { WebSocket } from 'ws';
import Game from '../game';

export default class PlayerQueue {
	game: Game;
	queue: any;
	activeQueue: {
		[key: string]: boolean;
	};
	constructor(game: Game) {
		this.game = game;
		this.queue = {};
		this.activeQueue = {};
	}
	add(gameId: string, ws: WebSocket, metadata: any) {
		const { queue, activeQueue } = this;
		if (gameId) {
			if (!queue[gameId]) queue[gameId] = {};
			queue[gameId][`${Date.now()}`] = {
				ws,
				metadata: JSON.parse(JSON.stringify(metadata)),
			};
			if (!activeQueue[gameId]) this.update(`${metadata.gameId}`);
		}
	}
	async update(gameId: string) {
		const { game, queue, activeQueue } = this;
		if (Object.keys(queue[gameId]).length) {
			activeQueue[gameId] = true;
			const nextId = Object.keys(queue[gameId])[0];
			const { ws, metadata } = queue[gameId][nextId];
			await game.joinRoom({ ws, metadata });
			delete queue[gameId][nextId];
			this.update(gameId);
		} else activeQueue[gameId] = false;
	}
}
