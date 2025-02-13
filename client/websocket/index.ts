import { OFFLINE_ROOM_ID, WS_ERROR_CODE_MAINTENANCE } from '@shared/const';
import { WSClientMsgType } from '@shared/models/websocket';
import Game from '@/game';

export const LOCAL_CLIENT_SOCKET_EVENT = 'localClientEvent';
export const LOCAL_SERVER_SOCKET_EVENT = 'localServerEvent';

interface WSCreateParams {
	gameId?: string;
	roomId?: string;
	uid?: string;
	isNew?: boolean;
	isPrivate?: boolean;
	fee?: string;
	minPlayer?: string;
}

let isLocal = false;
let localGame: Game | null = null;
let ws: WebSocket | ILocalSocket | null = null;
export const connectToServer = (
	params?: WSCreateParams,
	onMessage?: (ev: MessageEvent<any>) => void,
	onClose?: (ev: CloseEvent) => void
) => {
	return new Promise<WebSocket>((resolve) => {
		if (ws && (ws as WebSocket).readyState === 1) resolve(ws as WebSocket);
		else {
			const { gameId, roomId, uid, isNew, isPrivate, fee, minPlayer } =
				params || {};
			const getURL = () => {
				let url = `${process.env.NODE_ENV === 'production' ? 'wss' : 'ws'}://${
					process.env.NODE_ENV === 'production'
						? 'ws.pixelbrawlgames.com'
						: location.host
				}/ws?`;
				let params = `gameId=${gameId}&roomId=${roomId}&id=${uid}`;
				if (isNew) params += '&isNew=true';
				if (isPrivate) params += '&isPrivate=true';
				if (fee) params += `&fee=${fee}`;
				if (minPlayer) params += `&minPlayer=${minPlayer}`;
				url += params;
				return url;
			};

			const connectWS = (url, _onMessage, _onClose) => {
				ws = new WebSocket(url);
				if (_onMessage) (ws as WebSocket).onmessage = _onMessage;

				(ws as WebSocket).onclose = (e) => {
					if (e.code === WS_ERROR_CODE_MAINTENANCE) {
						setTimeout(() => {
							connectWS((ws as any).url, _onMessage, _onClose);
						}, 5000);
					} else if (_onClose) _onClose(e);
				};
			};
			connectWS(getURL(), onMessage, onClose);

			const interval = setInterval(() => {
				if (ws && (ws as WebSocket).readyState === 1) {
					clearInterval(interval);
					resolve(ws as WebSocket);
				}
			});
		}
	});
};

interface ILocalSocket {
	send: (data: any) => void;
	close?: () => void;
}
const connectToLocal = (
	params?: WSCreateParams,
	onMessage?: (data: any) => void,
	onClose?: () => any
) => {
	return new Promise<ILocalSocket>((resolve) => {
		isLocal = true;
		if (ws) resolve(ws);
		else {
			const { gameId, uid } = params || {};
			localGame = new Game();
			// LISTEN TO SERVER MESSAGES
			const msgEvent = (e) => {
				if (onMessage) onMessage({ data: (e as any).detail });
			};
			document.addEventListener(LOCAL_SERVER_SOCKET_EVENT, msgEvent);
			ws = {
				send: (data: any) => {
					// SEND MESSAGES FROM CLIENT
					const _event = new CustomEvent(LOCAL_CLIENT_SOCKET_EVENT, {
						detail: { data },
					});
					document.dispatchEvent(_event);
				},
				close: () => {
					if (onClose) onClose();
					document.removeEventListener(LOCAL_SERVER_SOCKET_EVENT, msgEvent);
				},
			};
			if (gameId && localGame.games && localGame.games[gameId]) {
				localGame.joinRoom({
					ws: {
						// USE A DIFFERENT SEND METHOD FOR THE SERVER
						send: (outbound: any) => {
							// SEND MESSAGES FROM SERVER
							const _event = new CustomEvent(LOCAL_SERVER_SOCKET_EVENT, {
								detail: outbound,
							});
							document.dispatchEvent(_event);
						},
						close: ws.close,
					},
					metadata: { gameId, id: uid },
				});
			} else {
				if (ws.close) ws.close();
			}
			resolve(ws);
		}
	});
};

export const getWS = (
	params?: WSCreateParams,
	onMessage?: (this: WebSocket, ev: MessageEvent<any>) => void,
	onClose?: (this: WebSocket, ev: CloseEvent) => void
) => {
	if (isLocal || (params && params.roomId && params.roomId === OFFLINE_ROOM_ID))
		return connectToLocal(params, onMessage, onClose as () => any);
	else return connectToServer(params, onMessage, onClose);
};

export const sendMessage = async (type: WSClientMsgType, data = {}) => {
	const ws = await getWS();
	ws.send(
		JSON.stringify({
			type,
			data,
		})
	);
};

export const disconnect = () => {
	if (ws && ws.close) ws.close();
	if (isLocal && localGame) {
		localGame.deleteRoom(OFFLINE_ROOM_ID);
		localGame = null;
		isLocal = false;
	}
	ws = null;
};
