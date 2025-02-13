import React, { FC, useRef, useMemo, useEffect, useState } from 'react';
import { extend } from '@react-three/fiber';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import { NearestFilter, Vector3 } from 'three';
import { SPRITE_DEFAULT_WIDTH } from '@/const';
import { loadTexture } from '@/utils/texture';
import { TCover } from '@/models';

extend({ MeshLineGeometry, MeshLineMaterial });

interface P {
	position: [number, number, number];
	color?: string;
	size: [number, number];
	cover?: TCover;
	pivot?: [number, number];
	flipX?: boolean;
	flipY?: boolean;
}
const Tile: FC<P> = (props) => {
	const ref = useRef<THREE.Object3D>(null);
	const [texture, setTexture] = useState<any>();
	const { position, color, cover, pivot, flipX, flipY } = props;
	const currentCoverTimestamp = useRef<number>(0);

	useEffect(() => {
		if (cover && cover.path) {
			loadTexture(cover.path).then((_texture) => {
				// CHECK IF THE CURRENT FRAME SHOULD BE DISPLAYED AFTER THE LAST ONE OR IF IT'S JUST LAGGING
				if (cover.timestamp > currentCoverTimestamp.current) {
					if (!currentCoverTimestamp.current)
						currentCoverTimestamp.current = Date.now();
					if (cover.gridSize) {
						const imgW = _texture?.source?.data?.naturalWidth || cover.fullW;
						const imgH = _texture?.source?.data?.naturalHeight || cover.fullH;
						const sizedColumns = imgW / cover.w;
						const sizedRows = imgH / cover.h;
						const col = cover.x / cover.gridSize;
						const row =
							((cover.y / cover.gridSize) % cover.rows) +
							(cover.h / cover.gridSize - 1);

						_texture.repeat.x = 1 / sizedColumns;
						_texture.repeat.y = 1 / sizedRows;
						_texture.offset.x = col / cover.columns;
						_texture.offset.y = 1 - (1 + row) / cover.rows;
					}
					_texture.magFilter = NearestFilter;
					setTexture(_texture);
				}
			});
		}
	}, [cover, cover?.path]);

	const size = useMemo<[number, number]>(() => {
		if (props.size && props.size.length) {
			return props.size;
		}
		return [SPRITE_DEFAULT_WIDTH, SPRITE_DEFAULT_WIDTH];
	}, props.size);

	const alignPosition = useMemo<[number, number, number]>(() => {
		const pivotX = pivot && pivot[0] ? pivot[0] : 0;
		const pivotY = pivot && pivot[1] ? pivot[1] : 0;
		const _originalPos: [number, number, number] = [
			size[0] / 2,
			-(size[1] / 2),
			0,
		];
		const alignX = _originalPos[0] - pivotX * size[0];
		const alignY = _originalPos[1] + pivotY * size[1];
		return [alignX, alignY, _originalPos[2]];
	}, [pivot, size]);

	const scale = useMemo<Vector3>(() => {
		return new Vector3(flipX ? -1 : 1, flipY ? -1 : 1, 1);
	}, [flipX, flipY]);

	return (
		<group position={position}>
			<mesh
				ref={ref as any}
				{...props}
				position={alignPosition}
				rotation={[0, 0, 0]}
				name="tile"
				scale={scale}
			>
				<planeGeometry args={[size[0], size[1]]} />
				{texture ? <meshBasicMaterial map={texture} transparent /> : null}
				{((cover && !cover.path) || !cover) && color ? (
					<meshBasicMaterial color={color} transparent />
				) : (
					<meshBasicMaterial color="#ffffff" transparent opacity={0} />
				)}
			</mesh>
		</group>
	);
};

export default Tile;
