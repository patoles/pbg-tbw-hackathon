import { create } from 'zustand';
import * as WS from '@/websocket';
import {
	WSServerMsg,
	WSServerMsgType,
	WSClientMsgType,
} from '@shared/models/websocket';
import { TGameData, TCoord } from '@/models';
import { GAME_STEP, KEY } from '@/const';
import { getPlayerUniqueID, isMobile, hasKeyboard, isPortrait } from '@/utils';
import { preloadEntities } from '@/utils/entity';
import { preloadAudio } from '@/utils/audio';
import { preloadTextures } from '@/utils/texture';
import * as SolanaUtils from '@/utils/web3/solana';
//import * as networkUtils from '@/utils/network';

import api from '@/api';

export interface GameStateProperties extends TGameData {
	cameraRot: number;
	localUID: string;
	cameraPlayerFocus: string;
	cameraFocusUpdate: number;
	virtualJoystick: {
		start: TCoord;
		pos: TCoord;
		size: number;
	};
	isMobile: boolean;
	isPortrait: boolean;
}
export interface GameStateActions {
	reset: () => void;
	init: () => void;
	initGame: (
		gameId?: string,
		roomId?: string,
		playerId?: string,
		isNew?: boolean,
		isPrivate?: boolean,
		fee?: string,
		minPlayer?: string
	) => any;
	movePlayer: (movement: TCoord) => any;
	pressKey: (key: KEY) => any;
	releaseKey: (key: KEY) => any;
	setVirtualJoystick: (start: TCoord, pos: TCoord, size: number) => any;
	readyPlayer: () => any;
}
export interface GameState extends GameStateProperties, GameStateActions {}

const INITIAL_STATE: GameStateProperties = {
	cameraRot: 0,
	localUID: '',
	cameraPlayerFocus: '',
	cameraFocusUpdate: 0,
	ready: false,
	gameId: '',
	roomId: '',
	map: [[]],
	players: {},
	localPlayer: '',
	gameStep: GAME_STEP.INIT,
	gameStartTime: 0,
	gameStartCountdown: 0,
	gameDuration: 0,
	lobbyStartTime: 0,
	message: null,
	rewards: null,
	minPlayer: 2,
	maxPlayer: 100,
	maxAIPlayer: 0,
	entityInstances: {},
	config: {
		data: {
			layers: [],
			entities: [],
			tilesets: [],
			enums: [],
			sounds: [],
			levels: [],
		},
	},
	virtualJoystick: {
		start: { x: -1, y: -1 },
		pos: { x: -1, y: -1 },
		size: 0,
	},
	isMobile: isMobile() || !hasKeyboard(),
	isPortrait: isPortrait(),
};

export const useGameStore = create<GameState>((set, get) => ({
	...INITIAL_STATE,
	reset: () => set(() => ({ ...INITIAL_STATE })),
	init: async () => {
		// UPDATE DEVICE SCREEN WITH RESIZE
		const onResize = () => {
			set(() => {
				return {
					isMobile: isMobile() || !hasKeyboard(),
					isPortrait: isPortrait(),
				};
			});
		};
		onResize();
		if (!window.onresize) {
			window.onresize = onResize;
			screen.orientation.onchange = onResize;
		}
	},
	initGame: async (
		gameId,
		roomId,
		userId,
		isNew,
		isPrivate,
		fee,
		minPlayer
	) => {
		let localUID = '';
		if (gameId && roomId) {
			const room = await api.game.getRoom(gameId, roomId);
			if (room && room.hasFee) {
				if (window.solana) {
					let _user = await SolanaUtils.signIn();
					if (!_user) {
						_user = await SolanaUtils.signIn(true);
					}
					if (_user) localUID = _user.id;
				}
				if (!localUID) roomId = '';
			}
		}
		if (!localUID) {
			localUID = userId || (await getPlayerUniqueID());
		}
		const onMessage = (_message: MessageEvent<any>) => {
			const { config } = get();
			const { type, data, entities } = JSON.parse(_message.data) as WSServerMsg;

			/*
			if (timestamp) {
				console.log(
					`Delay: ${Math.abs(
						Date.now() - timestamp
					)} ${timestamp} ${Date.now()}`
				);
			}
			*/
			if (type === WSServerMsgType.UPDATE) {
				if (data?.config?.data) {
					// PRELOAD ENTITIES
					if (!config.data.entities.length && data.config.data.entities) {
						preloadEntities(data);
					}
					// PRELOAD AUDIO
					if (!config.data.sounds.length && data.config.data.sounds) {
						preloadAudio(data.config.data.sounds);
					}
					// PRELOAD TEXTURES
					if (
						data.config.data.tilesets &&
						config.data.tilesets.length !== data.config.data.tilesets.length
					) {
						preloadTextures(data);
					}
					data.config.data = Object.assign({}, config.data, data.config.data);
				}
				set(({ entityInstances, cameraPlayerFocus, players }) => {
					const ret = {
						localUID,
						cameraPlayerFocus: data.localPlayer || cameraPlayerFocus,
						...data,
					};
					if (ret.players) delete ret.players;
					if (data && data.players && Object.keys(data.players).length) {
						ret.players = JSON.parse(JSON.stringify(players));
						Object.keys(data.players).forEach((_playerId) => {
							ret.players[_playerId] = Object.assign(
								{},
								players[_playerId],
								data.players[_playerId]
							);
						});
					}
					if (ret.cameraPlayerFocus !== cameraPlayerFocus || data.ready)
						ret.cameraFocusUpdate = Date.now();
					if (entities && entities.length) {
						const updateInstances = JSON.parse(JSON.stringify(entityInstances));
						entities.forEach((event) => {
							if (event.action === 'CREATE' || event.action === 'UPDATE') {
								updateInstances[event.category][event.id] = event.data;
							} else if (event.action === 'DELETE') {
								delete updateInstances[event.category][event.id];
							}
						});
						Object.assign(ret, {
							entityInstances: updateInstances,
						});
					}
					return ret;
				});
			} else if (type === WSServerMsgType.PING) {
				const { localPlayer } = get();
				//				networkUtils.setDelaySmoothing(Date.now() - data.timestamp);
				WS.sendMessage(WSClientMsgType.PONG, {
					playerIndex: localPlayer,
				});
			}
		};
		const onClose = () => {
			// RESET READY ON WEBSOCKET CLOSED AND LEAVE PAGE
			if (location.pathname.indexOf(`/game/${gameId}/r/`) === -1) {
				set({ ...INITIAL_STATE });
			} else if (!get().rewards) {
				set({
					rewards: [],
				});
			}
		};
		await WS.getWS(
			{
				gameId,
				roomId,
				uid: localUID,
				isNew,
				isPrivate,
				fee,
				minPlayer,
			},
			onMessage,
			onClose
		);
	},
	movePlayer: async (movement) => {
		const { localPlayer, gameStep } = get();
		if (gameStep === GAME_STEP.PLAY) {
			WS.sendMessage(WSClientMsgType.MOVE_PLAYER, {
				movement,
				playerIndex: localPlayer,
			});
		}
	},
	pressKey: async (key) => {
		const {
			localPlayer,
			gameStep,
			players,
			cameraPlayerFocus,
			cameraFocusUpdate,
		} = get();
		if (gameStep === GAME_STEP.PLAY) {
			if (players[localPlayer].alive) {
				WS.sendMessage(WSClientMsgType.PRESS_KEY, {
					key,
					playerIndex: localPlayer,
				});
			} else {
				if (key === KEY.SPACE) {
					const alivePlayers: string[] = [];
					for (const playerId in players) {
						if (players[playerId].alive) {
							alivePlayers.push(playerId);
						}
					}
					if (alivePlayers.length) {
						let _cameraFocus = alivePlayers[0];
						const foundIndex = alivePlayers.indexOf(cameraPlayerFocus);
						if (foundIndex < alivePlayers.length - 1)
							_cameraFocus = alivePlayers[foundIndex + 1];
						set(() => {
							return {
								cameraPlayerFocus: _cameraFocus,
								cameraFocusUpdate:
									_cameraFocus !== cameraPlayerFocus
										? Date.now()
										: cameraFocusUpdate,
							};
						});
					}
				}
			}
		}
	},
	releaseKey: async (key) => {
		const { localPlayer, gameStep, players } = get();
		if (gameStep === GAME_STEP.PLAY && players[localPlayer].alive) {
			WS.sendMessage(WSClientMsgType.RELEASE_KEY, {
				key,
				playerIndex: localPlayer,
			});
		}
	},
	setVirtualJoystick: (start, pos, size) => {
		const { gameStep } = get();
		if (gameStep === GAME_STEP.PLAY) {
			set(() => {
				return {
					virtualJoystick: {
						start,
						pos,
						size,
					},
				};
			});
		}
	},
	readyPlayer: async () => {
		const { localPlayer, gameStep, fee } = get();
		if (gameStep === GAME_STEP.LOBBY) {
			if (!fee) {
				WS.sendMessage(WSClientMsgType.READY_PLAYER, {
					playerIndex: localPlayer,
				});
			} /* else {
				try {
					await api.game.secureReady(roomId);
				} catch (err) {}
			}*/
		}
	},
}));
