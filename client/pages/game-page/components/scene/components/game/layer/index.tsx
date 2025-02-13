import React, { FC, useMemo } from 'react';
import { Frustum } from 'three';
import {
	TConfig,
	TLayer,
	TLayerInstance,
	TIntGridValue,
	TEntity,
	TPlayer,
} from '@/models';
import Tile from '../tile';
import { getTileCover } from '@/utils/tileset';
import { checkFrustum } from '@/utils/camera';

interface P {
	globalConfig: TConfig;
	config: TLayer;
	data: TLayerInstance;
	cameraFrustum: Frustum;
	cameraFocusUpdate: number;
	focusedPlayer: TPlayer;
}

const Layer: FC<P> = ({
	globalConfig,
	config,
	data,
	cameraFrustum,
	cameraFocusUpdate,
	focusedPlayer,
}) => {
	if (config.type === 'intGrid') {
		return (
			<IntGridLayer
				globalConfig={globalConfig}
				config={config}
				data={data}
				cameraFrustum={cameraFrustum}
				cameraFocusUpdate={cameraFocusUpdate}
				focusedPlayer={focusedPlayer}
			/>
		);
	} else if (config.type === 'entities')
		return (
			<EntityLayer
				globalConfig={globalConfig}
				config={config}
				data={data}
				cameraFrustum={cameraFrustum}
				cameraFocusUpdate={cameraFocusUpdate}
				focusedPlayer={focusedPlayer}
			/>
		);
	return null;
};

const IntGridLayer: FC<P> = ({
	globalConfig,
	config,
	data,
	cameraFrustum,
	cameraFocusUpdate,
	focusedPlayer,
}) => {
	const intGridMap = useMemo<{ [K in string]: TIntGridValue }>(() => {
		const _map: any = {};
		config.intGridValues.forEach((gridValue) => {
			_map[gridValue.value] = JSON.parse(JSON.stringify(gridValue));
		});
		return _map;
	}, [config.intGridValues]);

	return (
		<group position={[0, 0, 0]}>
			{(data.intGrid || []).map((row, y) =>
				(row || []).map((tileInt, x) => {
					if (
						!checkFrustum(
							cameraFrustum,
							cameraFocusUpdate,
							config,
							{ coord: { x: x + 0.5, y: y + 1 } },
							focusedPlayer
						)
					) {
						return null;
					}
					const item = intGridMap[tileInt];
					if (!item) return null;
					const tileset = globalConfig.data.tilesets.find(
						(_item) => _item.id === item.tile.tilesetId
					);
					const cover = getTileCover(
						tileset ? tileset.path : '',
						item.tile,
						tileset
					);

					return (
						<Tile
							position={[
								config.gridSize * x,
								config.gridSize * -y,
								item.tile.depth ? item.tile.depth / 10 : 0,
							]}
							size={[config.gridSize, config.gridSize]}
							color={item.color}
							cover={cover}
							pivot={[config.tilePivotX, config.tilePivotY]}
							key={`tile_${x}_${y}`}
						/>
					);
				})
			)}
		</group>
	);
};

const EntityLayer: FC<P> = ({
	globalConfig,
	config,
	data,
	cameraFrustum,
	cameraFocusUpdate,
	focusedPlayer,
}) => {
	const entitiesMap = useMemo<{ [K in string]: TEntity }>(() => {
		const _map: any = {};
		(globalConfig.data.entities || []).forEach((entity) => {
			_map[entity.id] = JSON.parse(JSON.stringify(entity));
		});
		return _map;
	}, [globalConfig.data.entities]);

	return (
		<group position={[0, 0, 0]}>
			{(data.entityInstances || []).map((entityInstance, index) => {
				if (
					!checkFrustum(
						cameraFrustum,
						cameraFocusUpdate,
						config,
						{
							coord: {
								x: entityInstance.grid[0],
								y: entityInstance.grid[1] + 1,
							},
						},
						focusedPlayer
					)
				)
					return null;
				const item = entitiesMap[entityInstance.id];
				if (!item) return null;
				const tileset = globalConfig.data.tilesets.find(
					(_item) => _item.id === item.tile.tilesetId
				);
				const cover = getTileCover(
					tileset ? tileset.path : '',
					item.tile,
					tileset
				);

				return (
					<Tile
						position={[
							config.gridSize * entityInstance.grid[0],
							config.gridSize * -entityInstance.grid[1],
							0,
						]}
						size={[item.width, item.height]}
						color={item.color}
						cover={cover}
						pivot={[item.tilePivotX, item.tilePivotY]}
						key={`${entityInstance.id}_${index}`}
					/>
				);
			})}
		</group>
	);
};

export default Layer;
