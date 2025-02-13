import React, { FC, useState, Suspense } from 'react';
import { Camera, Object3D, Vector3, Cache, SRGBColorSpace } from 'three';
import { Canvas } from '@react-three/fiber';
import CameraController from './components/camera-controller';
import Controller from './components/controller';
import Game from './components/game';

import styles from './index.module.css';

Cache.enabled = true;

interface P {
	gameId: string;
}
const RenderScene: FC<P> = ({ gameId }) => {
	const [camera, setCamera] = useState<Camera | null>(null);
	const [cameraRoot, setCameraRoot] = useState<Object3D | null>(null);

	return (
		<Canvas
			gl={{ antialias: true }}
			id="game-canvas"
			className={styles.scene}
			shadows={false}
			camera={{ position: [0, 0, 0], fov: 42, near: 1, far: 1000 }}
			onCreated={(props) => {
				const pixelRatio = Math.max(Math.max(window.devicePixelRatio, 1), 2);
				props.gl.setPixelRatio(pixelRatio);
				const mapCenter = new Vector3(
					props.camera.position.x,
					props.camera.position.y,
					0
				);

				const _cameraRoot = new Object3D();
				_cameraRoot.name = 'camera-root';
				_cameraRoot.position.set(mapCenter.x, mapCenter.y, mapCenter.z);
				_cameraRoot.attach(props.camera);
				props.scene.attach(_cameraRoot);
				setCameraRoot(_cameraRoot);

				props.camera.lookAt(mapCenter);
				setCamera(props.camera);

				props.gl.shadowMap.autoUpdate = true;
				props.gl.shadowMap.needsUpdate = true;
				props.gl.outputColorSpace = SRGBColorSpace;
			}}
		>
			<color attach="background" args={['#202030']} />
			{gameId ? (
				<>
					{camera && cameraRoot ? (
						<CameraController
							gameId={gameId}
							camera={camera}
							cameraRoot={cameraRoot}
						/>
					) : null}
					<Controller gameId={gameId} />
				</>
			) : null}
			<ambientLight intensity={0} />
			<pointLight
				color={'#FFFFFF'}
				position={[400, 400, 400]}
				intensity={0.5}
				castShadow={true}
				distance={10000}
			/>
			<Suspense fallback={null}>
				<Game />
			</Suspense>
			{/*<Effects />*/}
		</Canvas>
	);
};

export default RenderScene;
