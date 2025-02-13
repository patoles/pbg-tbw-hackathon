import React, { FC, useRef, useEffect, useState, useMemo } from 'react';
import { Box, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import {
	TConfig,
	TLayer,
	TEntity,
	TGameEntityInstance,
	TCoord,
	TVector3,
	TTileset,
	TCover,
	TAnimationType,
} from '@/models';
import { getTileCover } from '@/utils/tileset';
import { updateAnimation, stopAnimation } from '@/utils/animation';
import Tile from '../tile';
import { DEBUG_MODE, NETWORK_SMOOTH_DELAY_MS } from '@/const';

import styles from './index.module.css';

const lerpVec = new Vector3();

interface P {
	globalConfig: TConfig;
	config: TLayer;
	coord: TCoord;
	rot: TVector3;
	entity: TEntity;
	entityInstance: TGameEntityInstance;
	action: TAnimationType;
	flipX?: boolean;
	depth?: number;
	isLocalPlayer?: boolean;
}
const SpriteTile: FC<P> = ({
	globalConfig,
	config,
	coord,
	rot,
	entity,
	entityInstance,
	action,
	flipX,
	depth,
	isLocalPlayer,
}) => {
	const animatePosition = useRef<boolean>(false);
	const previousCoord = useRef<TCoord>({ x: 0, y: 0 });
	const posUpdatedTime = useRef<number>(0);
	const [animationFrame, setAnimationFrame] = useState<number>(-1);

	const meshRef = useRef<Group>(null);
	const targetPosVec = useRef<Vector3>(new Vector3());
	const posVec = useRef<Vector3>(new Vector3());

	useEffect(() => {
		if (
			coord &&
			(coord.x !== previousCoord.current.x ||
				coord.y !== previousCoord.current.y) &&
			meshRef.current
		) {
			const { x, y } = coord;
			const _depth =
				depth ||
				entity.depth ||
				Math.round((0.1 + (y * config.gridSize) / 1000) * 1000) / 1000;
			if (!meshRef.current.position.x && !meshRef.current.position.y) {
				meshRef.current.position.set(
					x * config.gridSize,
					-(y * config.gridSize),
					_depth
				);
			} else {
				posVec.current.set(
					meshRef.current.position.x,
					-meshRef.current.position.y,
					0
				);
				targetPosVec.current.set(x * config.gridSize, y * config.gridSize, 0);
				posUpdatedTime.current = Date.now();
				animatePosition.current = true;

				// UPDATE DEPTH WHEN Y CHANGES
				if (coord.y !== previousCoord.current.y)
					meshRef.current.position.z = _depth;
			}
			previousCoord.current = { x: coord.x, y: coord.y };
		}
	}, [coord, meshRef.current]);

	/* COVER ANIMATION */
	useEffect(() => {
		updateAnimation(entity, entityInstance, action, (nextFrame) => {
			setAnimationFrame(nextFrame);
		});
		return () => {
			stopAnimation(entity, entityInstance, action);
		};
	}, [action]);

	const tilesets = useMemo<TTileset[]>(() => {
		const arr: TTileset[] = [];
		const tilesetId = entityInstance.tilesetId || entity.tile.tilesetId;
		if (tilesetId) {
			const mainTileset = globalConfig.data.tilesets.find(
				(_item) => _item.id === tilesetId
			);
			if (mainTileset) arr.push(mainTileset);
			if (entityInstance.tilesetLayerIds || entity.tile.tilesetLayerIds) {
				const _ids = [
					...(entityInstance.tilesetLayerIds ||
						entity.tile.tilesetLayerIds ||
						[]),
				];
				_ids.forEach((_id) => {
					const _tileset = globalConfig.data.tilesets.find(
						(_item) => _item.id === _id
					);
					if (_tileset) arr.push(_tileset);
				});
			} else if (entityInstance.tilesetLayers || entity.tile.tilesetLayers) {
				const tilesetLayers =
					entityInstance.tilesetLayers || entity.tile.tilesetLayers;
				(tilesetLayers || []).forEach((_layer) => {
					const _tilesetClone = JSON.parse(JSON.stringify(mainTileset));
					_tilesetClone.offsetX = _layer.x;
					_tilesetClone.offsetY = _layer.y;
					_tilesetClone.flipX = !!_layer.flipX;
					_tilesetClone.flipY = !!_layer.flipY;
					arr.push(_tilesetClone);
				});
			}
		}
		return arr;
	}, [
		entity.tile.tilesetId,
		entityInstance.tilesetId,
		entityInstance.tilesetLayerIds,
		entityInstance.tilesetLayers,
	]);

	const covers = useMemo<TCover[]>(() => {
		return tilesets.map((_tileset) => {
			return getTileCover(
				_tileset ? _tileset.path : '',
				entity &&
					entity.animation &&
					entity.animation[action] &&
					animationFrame > -1
					? entity.animation[action]?.frames[animationFrame]
					: entity.tile,
				_tileset
			);
		});
	}, [tilesets, action, animationFrame]);

	useFrame(() => {
		if (meshRef.current) {
			if (animatePosition.current) {
				const progress = Math.min(
					(Date.now() - posUpdatedTime.current) / NETWORK_SMOOTH_DELAY_MS,
					1
				);
				if (progress <= 1) {
					const lerpedPos = lerpVec.lerpVectors(
						posVec.current,
						targetPosVec.current,
						progress
					);
					meshRef.current.position.set(
						lerpedPos.x,
						-lerpedPos.y,
						meshRef.current.position.z
					);
					if (progress === 1) animatePosition.current = false;
				}
			}
		}
	});

	return !entityInstance.hide ? (
		<group ref={meshRef} rotation={[rot.x, rot.y, rot.z]}>
			{covers.map((cover, index) => (
				<Tile
					position={[0, 0, 0]}
					size={[entity.width, entity.height]}
					cover={cover}
					pivot={[entity.tilePivotX, entity.tilePivotY]}
					flipX={flipX || cover.flipX}
					flipY={cover.flipY}
					key={`${entity.id}_${index}`}
				/>
			))}
			{entityInstance.name ? (
				<Html center>
					<div className={styles.labelContainer}>
						<div
							className={`${styles.label} ${
								isLocalPlayer ? styles.localPlayer : ''
							}`}
						>
							{entityInstance.name}
						</div>
					</div>
				</Html>
			) : null}
			{DEBUG_MODE && entity.collision ? (
				<group>
					<Box
						args={[
							entity.width * entity.collision.w,
							entity.width * (entity.collision.h || entity.collision.w),
							0.1,
						]}
						position={[
							0,
							((entity.width * entity.collision.w) / 2) *
								(-1 + 2 * entity.tilePivotY),
							0,
						]}
					>
						<meshBasicMaterial color="blue" opacity={0.5} transparent />
					</Box>
				</group>
			) : null}
		</group>
	) : null;
};

export default React.memo(SpriteTile, (prevProps, nextProps) => {
	return (
		prevProps.entityInstance &&
		nextProps.entityInstance &&
		prevProps.entityInstance.category === nextProps.entityInstance.category &&
		prevProps.entityInstance.tilesetId === nextProps.entityInstance.tilesetId &&
		prevProps.entityInstance.tilesetLayers ===
			nextProps.entityInstance.tilesetLayers &&
		prevProps.coord &&
		nextProps.coord &&
		prevProps.coord.x === nextProps.coord.x &&
		prevProps.coord.y === nextProps.coord.y &&
		prevProps.rot &&
		nextProps.rot &&
		prevProps.rot.x === nextProps.rot.x &&
		prevProps.rot.y === nextProps.rot.y &&
		prevProps.rot.z === nextProps.rot.z &&
		prevProps.action === nextProps.action
	);
});
