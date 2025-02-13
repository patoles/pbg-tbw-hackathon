import { TLayer, TPlayer } from '@/models';
import { CAMERA_FOCUS_DELAY_MS, TILE_SIZE } from '@/const';
import { Frustum, Vector3, Camera, PerspectiveCamera } from 'three';

const _vec3 = new Vector3();
export const checkFrustum = (
	cameraFrustum: Frustum,
	cameraFocusUpdate: number,
	config: TLayer,
	item: any,
	player: TPlayer
) => {
	if (Date.now() - cameraFocusUpdate >= CAMERA_FOCUS_DELAY_MS) {
		const { coord } = item;
		const { gridSize } = config;
		let x = coord.x * gridSize;
		let y = -(coord.y * gridSize);
		if (coord.x < player.coord.x) x = x + gridSize / 1.5;
		else if (coord.x > player.coord.x) x = x - gridSize / 1.5;
		if (coord.y > player.coord.y) y = y + gridSize * 1.5;
		else if (coord.y < player.coord.y) y = y - gridSize;
		_vec3.set(x, y, 0);
		if (!cameraFrustum.containsPoint(_vec3)) {
			return false;
		}
	}
	return true;
};

export const setCameraBoundaries = (
	camera: Camera,
	pos: Vector3,
	map: number[][]
) => {
	if (map && map.length) {
		// TO CLEAN UP AND UPDATE ONLY ONCE
		const fovRadians = ((camera as PerspectiveCamera).fov * Math.PI) / 180;
		const frustumHeight = 2 * camera.position.z * Math.tan(fovRadians / 2);
		const frustumWidth = frustumHeight * (camera as PerspectiveCamera).aspect;

		const mapHeight = map.length * TILE_SIZE;
		const mapWidth = map[0].length * TILE_SIZE;

		const minXPos = frustumWidth / 2;
		const maxXPos = mapWidth - frustumWidth / 2;
		const minYPos = -(frustumHeight / 2);
		const maxYPos = -mapHeight + frustumHeight / 2;

		if (mapWidth < frustumWidth) {
			// SET TO CENTER
			pos.x = mapWidth / 2;
		} else {
			if (pos.x < minXPos) pos.x = minXPos;
			else if (pos.x > maxXPos) pos.x = maxXPos;
		}
		if (mapHeight < frustumHeight) {
			// SET TO CENTER
			pos.y = -(mapHeight / 2);
		} else {
			if (pos.y > minYPos) pos.y = minYPos;
			else if (pos.y < maxYPos) pos.y = maxYPos;
		}
	}
};
