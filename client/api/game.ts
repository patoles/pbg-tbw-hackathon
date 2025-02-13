import request from '@/utils/request';
import { TStoreItem } from '@/models';

// STORE
export const findStore = async (gameId: string): Promise<TStoreItem[]> => {
	const res = await request.post('/api/game/store', {}, { gameId });
	const { data } = await res.json();
	return data;
};

export const buyStoreItem = async (
	gameId: string,
	itemId: string
): Promise<TStoreItem[]> => {
	const res = await request.post('/api/game/store/buy', {}, { gameId, itemId });
	const { data } = await res.json();
	return data;
};

// RANKING
export const findRanking = async (gameId: string) => {
	const res = await request.post('/api/game/ranking', {}, { gameId });
	const { data } = await res.json();
	return data;
};

// READY GAME

export const secureReady = async (roomId: string): Promise<any> => {
	const res = await request.post('/api/game/ready', {}, { roomId });
	const { data } = await res.json();
	return data;
};

// LOCAL GAME API

export const startGame = async (gameId: string) => {
	const res = await request.post('/api/game/start', {}, { gameId });
	const { data } = await res.json();
	return data;
};

export const endGame = async (gameId: string, history: string) => {
	const res = await request.post('/api/game/end', {}, { gameId, history });
	const { data } = await res.json();
	return data;
};

// JOIN ROOM
export const joinRoom = async (
	gameId: string,
	userId: string,
	creator?: string
) => {
	const res = await request.post(
		'/api/game/join-room',
		{},
		{ gameId, userId, creator }
	);
	const { data } = await res.json();
	return data;
};

// GET ROOM
export const getRoom = async (gameId: string, roomId: string) => {
	const res = await request.post('/api/game/room', {}, { gameId, roomId });
	const { data } = await res.json();
	return data;
};
