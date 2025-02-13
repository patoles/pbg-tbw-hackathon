/**** SERVER ****/

export enum WSServerMsgType {
	UPDATE,
	PING,
}
export interface WSServerMsgEntityEvent {
	action: 'CREATE' | 'UPDATE' | 'DELETE';
	data: any;
	category: string;
	id: string;
}
export interface WSServerMsg {
	type: WSServerMsgType;
	data: any;
	entities: WSServerMsgEntityEvent[];
	timestamp?: number;
}

/**** CLIENT ****/

export enum WSClientMsgType {
	MOVE_PLAYER,
	PRESS_KEY,
	RELEASE_KEY,
	READY_PLAYER,
	PONG,
}
export interface WSClientMsg {
	type: WSClientMsgType;
	data: any;
}
