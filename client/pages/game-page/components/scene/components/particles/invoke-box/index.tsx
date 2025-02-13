import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Color, MeshBasicMaterial } from 'three';

export default function InvokeBox({
	size,
	...props
}: {
	size: [number, number, number];
}) {
	const mesh = useRef<Mesh | null>(null);
	const opacity = useRef<number>(0);
	const [animate, setAnimate] = useState<boolean>(false);
	const [show, setShow] = useState<boolean>(false);

	useEffect(() => {
		opacity.current = 1;
		setAnimate(true);
	}, []);

	useEffect(() => {
		if (!show && animate) {
			setShow(true);
		} else if (show && !animate) {
			setTimeout(() => {
				setShow(false);
			}, 500);
		}
	}, [animate]);

	useFrame((state, delta) => {
		if (animate && mesh.current) {
			let _updatedOpacity =
				(mesh.current.material as MeshBasicMaterial).opacity - 1.5 * delta;
			if (_updatedOpacity < 0) _updatedOpacity = 0;
			(mesh.current.material as MeshBasicMaterial).opacity = _updatedOpacity;
			if (_updatedOpacity === 0) setAnimate(false);
		}
	});

	return animate || show ? (
		<mesh ref={mesh} {...props} position={[0, size[1] / 2, 0]}>
			<boxGeometry args={size} />
			<meshBasicMaterial
				color={new Color(0, 0.5, 20)}
				toneMapped={false}
				opacity={1}
				transparent
			/>
		</mesh>
	) : null;
}
