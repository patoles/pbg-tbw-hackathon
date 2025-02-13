import { TTile, TTileset, TCover, TConfig, TAnimationTile } from '@/models';

export const getTileCover = (
	path: string,
	_tile?: TTile | TAnimationTile,
	_tileset?: TTileset
): TCover => {
	return {
		path: path || '',
		x: _tileset && _tileset.offsetX ? _tileset.offsetX : _tile ? _tile.x : 0,
		y: _tileset && _tileset.offsetY ? _tileset.offsetY : _tile ? _tile.y : 0,
		w: _tile ? _tile.w : 0,
		h: _tile ? _tile.h : 0,
		fullW: _tileset ? _tileset.pixW : 0,
		fullH: _tileset ? _tileset.pixH : 0,
		columns: _tileset ? _tileset.pixW / _tileset.tileGridSize : 0,
		rows: _tileset ? _tileset.pixH / _tileset.tileGridSize : 0,
		gridSize: _tileset ? _tileset.tileGridSize : 0,
		timestamp: Date.now(),
		flipX: _tileset && _tileset.flipX ? _tileset.flipX : false,
		flipY: _tileset && _tileset.flipY ? _tileset.flipY : false,
	};
};

export const getTilesetById = (tilesetId: string, config: TConfig) => {
	let tileset: TTileset | null = null;
	(config.data.tilesets || []).forEach((_tileset) => {
		if (tilesetId === _tileset.id) tileset = _tileset;
	});
	return tileset;
};
