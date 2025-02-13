export enum GAME_STEP {
	INIT,
	LOBBY,
	START_COUNTDOWN,
	PLAY,
	END,
}
export enum KEY {
	SPACE,
	SHIFT,
	A,
	D,
}

export const SERVER_ID = 'game';
export const BLAST_GAME_ID = 'blast';
export const SNAKE_GAME_ID = 'snake';

export const OFFLINE_ROOM_ID = 'play';

export const TILE_SIZE = 16;
export const SPRITE_MAX_SIZE = TILE_SIZE * 0.6;
export const SPRITE_DEFAULT_WIDTH = SPRITE_MAX_SIZE;
export const COLLISION_ERROR_MARGIN = 0.01;

export const WS_ERROR_CODE_MAINTENANCE = 1013;

const GAME_SERVER_WS_ROOT = `${
	process.env.NODE_ENV === 'production' ? 'ws' : 'ws'
}://`;
export const GAME_SERVER_WS_URL = `${GAME_SERVER_WS_ROOT}${
	process.env.NODE_ENV === 'production' ? 'localhost' : 'localhost'
}/ws`;
