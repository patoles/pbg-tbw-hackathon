import LZString from 'lz-string';
import { WebSocket } from 'ws';
import GameCore from '@shared/game-logic';
import { TIME_BEFORE_END_REDIRECT } from '@shared/game-logic/const';
import { print } from '@shared/utils';
import games from '@shared/games/offline';
import { WSClientMsg, WSServerMsgType } from '@shared/models';
import { OFFLINE_ROOM_ID } from '@shared/const';
import { LOCAL_CLIENT_SOCKET_EVENT } from '@/websocket';
import api from '@/api';

class Game extends GameCore {
	constructor() {
		super('offline-game', games);
	}
	async joinRoom({ ws, metadata }: { ws: any; metadata: any }) {
		const { gameId, id } = metadata;
		const roomId = await this.createRoom(
			gameId,
			id,
			false,
			1,
			1,
			undefined,
			OFFLINE_ROOM_ID
		);
		this.addClientToRoom(gameId, roomId, ws, metadata);
	}
	async addClientToRoom(
		gameId: string,
		roomId: string,
		ws: WebSocket,
		metadata: any
	) {
		const room = this.rooms[roomId];
		const { clients, data, serverData } = room;
		const { id } = metadata;

		((_roomId) => {
			// LISTEN TO CLIENT MESSAGES
			document.addEventListener(LOCAL_CLIENT_SOCKET_EVENT, (e) => {
				this.onClientMessage(
					_roomId,
					JSON.parse((e as any).detail.data) as WSClientMsg
				);
			});
		})(roomId);

		let isTilesetUpdated = false;
		if (!clients.get(id)) {
			if (!data.ready && !data.fee && clients.size >= room.data.minPlayer - 1) {
				this.startLobbyTimer(room);
			}
			let name = `Guest1`;
			let user: any = null;
			if (id && id.indexOf('guest') === -1) {
				user = await api.user.getWithInventory();
				if (user) {
					name = `${user.username
						.slice(0, 1)
						.toUpperCase()}${user.username.slice(1)}`;
					await api.game.startGame(gameId);
				}
			}

			const savedTilesetCount = data.config.data.tilesets.length;
			data.players[id] = games[gameId].config.getPlayerInitData(
				id,
				name,
				data,
				serverData,
				user
			);
			data.players[id].ready = true;
			isTilesetUpdated = savedTilesetCount !== data.config.data.tilesets.length;
			print(
				`Players connected to Room ${roomId}: ${
					Object.keys(data.players).length
				}`
			);
		}
		clients.set(id, { ws, ...metadata, lastPing: Date.now() });

		data.roomId = roomId;
		data.ready = true;
		[...clients.values()].forEach((client) => {
			const outbound = JSON.stringify({
				type: WSServerMsgType.UPDATE,
				data: Object.assign(
					{},
					{
						roomId: data.roomId,
						players: data.players,
						lobbyStartTime: data.lobbyStartTime,
						gameStep: data.gameStep,
						localPlayer: client.id,
						fee: data.fee,
					},
					client.id === id
						? { config: data.config }
						: isTilesetUpdated
						? {
								config: {
									data: {
										tilesets: data.config.data.tilesets,
									},
								},
						  }
						: {}
				),
				timestamp: Date.now(),
			});
			this.sendMessage(client, outbound);
		});
		if (data.ready) this.startGame(roomId);
	}
	async endGame(roomId: string) {
		const room = this.rooms[roomId];
		const { clients, serverData, data } = room;

		if (
			serverData.gameHistory &&
			Object.values(data.players)[0].id &&
			Object.values(data.players)[0].id.indexOf('guest') === -1
		) {
			// SEND DATA TO API TO VERIFY SCORE
			const compressed = LZString.compress(
				JSON.stringify(serverData.gameHistory)
			);
			await api.game.endGame(data.gameId, compressed);
		}
		setTimeout(() => {
			// DISCONNECT ALL WEBSOCKETS
			[...clients.values()].forEach(({ ws }) => {
				(ws as WebSocket).close();
			});
			// DELETE ROOM
			this.deleteRoom(roomId);
		}, TIME_BEFORE_END_REDIRECT);
	}
}

export default Game;
