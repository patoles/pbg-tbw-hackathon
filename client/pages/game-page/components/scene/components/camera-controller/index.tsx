import { useRef, useEffect, useMemo } from 'react';
import { Vector3, Object3D, Camera, PerspectiveCamera } from 'three';
import { useFrame } from '@react-three/fiber';
import { degToRad } from '@/utils';
import { setCameraBoundaries } from '@/utils/camera';
import { useGameStore } from '@/stores/game';
import { CAMERA_NEAR_INTERVAL, CAMERA_FAR_INTERVAL, TILE_SIZE } from '@/const';
import config from '@/config';

interface CameraControllerProps {
	camera: Camera;
	cameraRoot: Object3D;
	gameId: string;
}
function CameraController({
	gameId,
	camera,
	cameraRoot,
}: CameraControllerProps) {
	const rotVec = useRef<Vector3>(new Vector3());
	const posVec = useRef<Vector3>(new Vector3());

	const cameraTarget = useRef<Vector3>(new Vector3());

	const gameConfig = useMemo(() => {
		return config.games[gameId].game;
	}, [gameId]);

	const cameraRot = useGameStore((state) => state.cameraRot);
	const map = useGameStore((state) => state.map);
	const players = useGameStore((state) => state.players);
	const cameraPlayerFocus = useGameStore((state) => state.cameraPlayerFocus);
	const isMobile = useGameStore((state) => state.isMobile);
	const isPortrait = useGameStore((state) => state.isPortrait);

	useEffect(() => {
		posVec.current.set(0, 0, 0);
	}, [cameraPlayerFocus]);

	useEffect(() => {
		camera.position.z = isMobile
			? isPortrait
				? gameConfig.camera.height.mobile
				: gameConfig.camera.height.mobileLandscape
			: gameConfig.camera.height.default;
		(camera as PerspectiveCamera).near =
			camera.position.z - CAMERA_NEAR_INTERVAL;
		(camera as PerspectiveCamera).far = camera.position.z + CAMERA_FAR_INTERVAL;
		(camera as any).updateProjectionMatrix();
	}, [isMobile, isPortrait, gameId]);

	useFrame(() => {
		if (camera && cameraRoot && camera.position.z) {
			const focusedPlayer = players[cameraPlayerFocus];
			if (focusedPlayer) {
				cameraTarget.current.x = focusedPlayer.coord.x * TILE_SIZE;
				cameraTarget.current.y = -focusedPlayer.coord.y * TILE_SIZE;
				cameraTarget.current.z = 0;

				setCameraBoundaries(camera, cameraTarget.current, map);

				cameraRoot.rotation.y = rotVec.current.lerp(
					new Vector3(degToRad(90 * cameraRot), 0, 0),
					0.1
				).x;
				const _target = new Vector3(
					cameraTarget.current.x,
					cameraTarget.current.y,
					cameraTarget.current.z
				);
				if (!!(posVec.current.x || posVec.current.y || posVec.current.z)) {
					const lerpedPos = posVec.current.lerp(_target, 0.1);
					cameraRoot.position.set(lerpedPos.x, lerpedPos.y, lerpedPos.z);
				} else {
					cameraRoot.position.set(_target.x, _target.y, _target.z);
					posVec.current.set(_target.x, _target.y, _target.z);
				}
				(camera as any).updateProjectionMatrix();
			}
		}
	});

	return null;
}

export default CameraController;
