/* CONFIG MODELS */

export type TTile = {
	tilesetId: string;
	tilesetLayerIds?: string[];
	tilesetLayers?: TTilesetLayer[];
	x: number;
	y: number;
	w: number;
	h: number;
	depth?: number;
};

export type TAnimationType = 'idle' | 'walk' | 'die' | 'pickup' | string;

export type TCollisionType = 'collide' | 'trigger' | 'damage';
export type TCollision = {
	w: number; // 0 - 1
	h?: number; // Use width if undefined
	type: TCollisionType;
};

export type TTilesetLayer = {
	x: number;
	y: number;
	flipX?: boolean;
	flipY?: boolean;
};

export type TAnimationTile = {
	x: number;
	y: number;
	w: number;
	h: number;
};
export type TAnimationFrame = TAnimationTile & {
	duration?: number;
};
export type TAnimationSound = {
	id: string;
	playOn: 'create' | 'show';
	stopOn: 'animation' | 'end';
};
export type TAnimation = {
	[k in TAnimationType]?: {
		loop: boolean;
		duration: number;
		frames: TAnimationFrame[];
		loopFrom?: number;
		sound?: TAnimationSound;
		sync?: boolean;
	};
};

/* LAYER */

export type TLayerType = 'intGrid' | 'entities';

export type TIntGridValue = {
	value: number;
	name: string;
	color: string;
	tile: TTile;
};

export type TLayer = {
	type: TLayerType;
	name: string;
	id: string;
	disabled: boolean;
	gridSize: number;
	pxOffsetX: number;
	pxOffsetY: number;
	parallaxFactorX: number;
	parallaxFactorY: number;
	tilePivotX: number;
	tilePivotY: number;
	depth: number;
	tilesetId: string;
	intGridValues: TIntGridValue[];
};

/* ENTITY */

export type TLimitScopeType = 'perWorld' | 'perLevel';
export type TLimitBehaviorType = 'preventAdding' | 'other';
export type TEntityParameterType = 'int' | 'string';
export type TEntityParameter = {
	id: string;
	name: string;
	description: string;
	type: TEntityParameterType;
	isArray: boolean;
	canBeNull: boolean;
	arrayMinLength?: number;
	arrayMaxLength?: number;
	min: number;
	max: number;
	defaultValue: any;
};

export type TEntity = {
	name: string;
	id: string;
	category: string;
	description: string;
	width: number;
	height: number;
	color: string;
	tile: TTile;
	collision?: TCollision;
	animation?: TAnimation;
	maxCount: number;
	limitScope: TLimitScopeType;
	limitBehavior: TLimitBehaviorType;
	tilePivotX: number;
	tilePivotY: number;
	parameters: TEntityParameter[];
	depth?: number;
};

export type TEntityInstance = {
	id: string;
	grid: [number, number];
	px: [number, number];
	parameters: {
		id: string;
		value: any;
	}[];
};

/* TILESET */

export type TTileset = {
	col: number;
	row: number;
	name: string;
	id: string;
	pixW: number;
	pixH: number;
	tileGridSize: number;
	spacing: number;
	padding: number;
	offsetX?: number;
	offsetY?: number;
	flipX?: boolean;
	flipY?: boolean;
	path: string;
};

/* ENUM */

export type TEnum = {
	name: string;
	id: string;
	values: {
		key: string;
		tile: TTile;
		color: string;
	}[];
};

/* SOUND */

export type TSound = {
	id: string;
	url: string;
	loop?: boolean;
	type?: 'music' | 'sound';
};

/* LEVEL */

export type TLayerInstance = {
	id: string;
	layerId: string;
	entityInstances: TEntityInstance[];
	intGrid: number[][];
	autoLayerTiles: [];
};

export type TLevel = {
	name: string;
	id: string;
	worldX: number;
	worldY: number;
	worldDepth: number;
	pxWidth: number;
	pxHeight: number;
	bgColor: string;
	bgPath: string;
	layerInstances: TLayerInstance[];
	music: string;
};

/* CONFIG */
