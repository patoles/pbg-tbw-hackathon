export * from './page-config';
import { IUser, IGame, TItem } from '@shared/models';
export * from '@shared/models';

export interface TGame extends IGame {
	store: string[];
}

export interface TStoreItem extends TItem {
	quantity: number;
}
export interface TStoreItemCollection extends TStoreItem {
	selected: boolean;
}

export interface TUserInventory {
	game_id: string;
	item_id: string;
	quantity: number;
	equipped: boolean;
}
export interface TUser extends IUser {
	inventory: TUserInventory[];
}

export type TCover = {
	path: string;
	x: number;
	y: number;
	w: number;
	h: number;
	fullW: number;
	fullH: number;
	columns: number;
	rows: number;
	gridSize: number;
	timestamp: number;
	flipX?: boolean;
	flipY?: boolean;
};
