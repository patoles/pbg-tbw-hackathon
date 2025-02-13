import {
	TAnimationType,
	TTilesetLayer,
	TLayer,
	TEntity,
	TTileset,
	TEnum,
	TSound,
	TLevel,
} from './config';
export * from './config';
export * from './websocket';
import { GAME_STEP } from '../const';

export type TCoord = {
	x: number;
	y: number;
};

export type TVector3 = {
	x: number;
	y: number;
	z: number;
};

export type TSize = {
	w: number;
	h: number;
};

export interface TItem extends IItem {
	_id: string;
	game_id: string;
}

export interface IGameRanking {
	user_id: string;
	score: number;
	win: number;
	loss: number;
}

export interface IUser {
	_id: string;
	clerkUserId: string;
	coins: number;
	emailAddress: string;
	username: string;
	web3Metamask: string;
	walletTON: string;
	walletSolana: string;
	firstName?: string;
	lastName?: string;
	profileImageUrl?: string;
}

export interface IPublicUser {
	profileImageUrl?: string;
	username: string;
}

export type TGameEntityInstance = {
	id: string;
	entity_id: string;
	category: string;
	name?: string;
	owner?: string;
	coord: TCoord;
	rot?: TVector3;
	mapCoord: TCoord;
	movement: TCoord;
	movementRot?: TVector3;
	flipX?: boolean;
	created: number;
	action: TAnimationType;
	depth?: number;
	hide?: boolean;
	tilesetLayerIds?: string[];
	tilesetLayers?: TTilesetLayer[];
	tilesetId?: string;
};

export enum TPlayerType {
	DEFAULT,
	AI,
}

export type TPlayer = TGameEntityInstance & {
	alive: boolean;
	kill: number;
	death: number;
	ready: boolean;
	rank: number;
	properties: {
		[k: string]: any;
	};
	inventory: TItem[];
	type: TPlayerType;
	disconnected?: boolean;
};

export type TConfig = {
	data: {
		layers: TLayer[];
		entities: TEntity[];
		tilesets: TTileset[];
		enums: TEnum[];
		sounds: TSound[];
		levels: TLevel[];
	};
};

export type TReward = {
	value: number;
	label: string;
	color?: string;
};

export type TMessage = {
	type: 'message' | 'info';
	status: 'default' | 'important';
	owner: string;
	created: number;
	text: string;
	id: string;
	duration?: number;
};

export type TFee = {
	value: number;
	mint: string;
	address: string;
	expiresAt: Date;
};

export type TGameData = {
	ready: boolean;
	map: number[][];
	players: {
		[k: string]: TPlayer;
	};
	localPlayer: string;
	gameId: string;
	roomId: string;
	gameStep: GAME_STEP;
	gameStartTime: number;
	gameStartCountdown: number;
	gameDuration: number;
	lobbyStartTime: number;
	maxAIPlayer: number;
	config: TConfig;
	message: TMessage | null;
	rewards: TReward[] | null;
	minPlayer: number;
	maxPlayer: number;
	fee?: TFee;
	feeMint?: string;
	entityInstances: {
		[k: string]: {
			[k: string]: TGameEntityInstance & any;
		};
	};
};

export interface IGameRankingWithPublicUser extends IGameRanking {
	user: IPublicUser;
}

export interface IItem {
	name: string;
	description: string;
	price: number;
	image_name: string;
	category: string;
	tileset_key: string;
	tileset_path: string;
}

export interface IGame {
	game_key: string;
	name: string;
	description: string;
	active: boolean;
	ranking_board: IGameRanking[];
}

export interface ICryptoTransactionInfo {
	quantity: number;
	value: number;
	metadata: any;
}

/* SERVER */

export interface TRoom {
	id: string;
	gameId: string;
	isPrivate: boolean;
	clients: Map<string, any>;
	data: TGameData;
	serverData: any;
	ended: boolean;
	spawnCoords: TCoord[];
	countdownTimeout: NodeJS.Timeout | undefined;
	pingInterval: NodeJS.Timer | undefined;
	roomInactiveTimeout: NodeJS.Timeout | undefined;
	creator: string;
	paidFees?: string[];
}
