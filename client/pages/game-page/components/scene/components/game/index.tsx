import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Level from './level';
import SpriteTile from './sprite-tile';
import { useGameStore } from '@/stores/game';
import { TLayer, TGameEntityInstance, TPlayer } from '@/models';
import { findEntity } from '@/utils/entity';
import { checkFrustum } from '@/utils/camera';
import { useThree } from '@react-three/fiber';
import { Frustum, Matrix4 } from 'three';
import { FRUSTUM_UPDATE_INTERVAL_MS } from '@/const';

const GAME_LAYER_ID = 'background';

const _matrix = new Matrix4();
const _previousCameraMatrix = new Matrix4();

const Game = () => {
	const players = useGameStore((state) => state.players);
	const localPlayer = useGameStore((state) => state.localPlayer);
	const config = useGameStore((state) => state.config);
	const entityInstances = useGameStore((state) => state.entityInstances);
	const cameraPlayerFocus = useGameStore((state) => state.cameraPlayerFocus);
	const cameraFocusUpdate = useGameStore((state) => state.cameraFocusUpdate);
	const interval = useRef<NodeJS.Timer>();

	const [frustum, setFrustum] = useState<Frustum>(new Frustum());

	const { camera } = useThree();

	const gameLayer = useMemo<TLayer | null>(() => {
		return (
			(config.data.layers || []).find((item) => item.id === GAME_LAYER_ID) ||
			null
		);
	}, [config, config.data.layers]);

	const _entities = useMemo<TGameEntityInstance[]>(() => {
		const _arr: TGameEntityInstance[] = [];
		for (const group in entityInstances) {
			for (const property in entityInstances[group]) {
				_arr.push(entityInstances[group][property]);
			}
		}
		return _arr;
	}, [entityInstances]);

	const focusedPlayer = useMemo<TPlayer>(() => {
		return players[cameraPlayerFocus];
	}, [players, cameraPlayerFocus]);

	/* UPDATE CAMERA FRUSTUM ON INTERVAL OR ON PLAYER MOVE */
	useEffect(() => {
		interval.current = setInterval(updateFrustum, FRUSTUM_UPDATE_INTERVAL_MS);
		return () => {
			clearInterval(interval.current);
		};
	}, []);
	useEffect(() => {
		updateFrustum();
	}, [focusedPlayer]);
	/* *** */

	const updateFrustum = () => {
		const cameraMatrix = _matrix.multiplyMatrices(
			camera.projectionMatrix,
			camera.matrixWorldInverse
		);
		if (!cameraMatrix.equals(_previousCameraMatrix)) {
			_previousCameraMatrix.copy(cameraMatrix);
			const _frustum = frustum.clone();
			_frustum.setFromProjectionMatrix(cameraMatrix);
			setFrustum(_frustum);
		}
	};

	const renderEntity = (entity: TGameEntityInstance) => {
		if (
			!gameLayer ||
			!checkFrustum(
				frustum,
				cameraFocusUpdate,
				gameLayer,
				entity,
				focusedPlayer
			)
		) {
			return null;
		}
		return (
			<Suspense fallback={null} key={`${entity.entity_id}_${entity.id}`}>
				<SpriteTile
					coord={entity.coord}
					rot={entity.rot || { x: 0, y: 0, z: 0 }}
					config={gameLayer}
					globalConfig={config}
					entity={findEntity(entity.entity_id)}
					entityInstance={entity}
					action={entity.action}
					depth={entity.depth}
					flipX={entity.flipX}
					isLocalPlayer={entity.id === localPlayer}
				/>
			</Suspense>
		);
	};

	if (!gameLayer) return null;

	return (
		<group>
			{config.data.levels.map((level: any, index: number) => {
				if (index) return null;
				return (
					<Level
						position={[level.worldX, level.worldY, index]}
						config={config}
						data={level}
						index={index}
						cameraFrustum={frustum}
						cameraFocusUpdate={cameraFocusUpdate}
						focusedPlayer={focusedPlayer}
						key={level.id}
					/>
				);
			})}
			{Object.values(players).map((player) => {
				// Hide player's name if solo
				if (Object.keys(players).length === 1) player.name = '';
				return renderEntity(player);
			})}
			{(_entities || []).map((entity) => {
				return renderEntity(entity);
			})}
		</group>
	);
};

export default Game;
