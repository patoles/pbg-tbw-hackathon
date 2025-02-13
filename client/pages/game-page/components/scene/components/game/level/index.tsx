import React, { FC, useMemo, useEffect } from 'react';
import Layer from '../layer';
import { TConfig, TLevel, TPlayer } from '@/models';
import { Frustum } from 'three';
import { playAudio } from '@/utils/audio';

interface P {
	position: [number, number, number];
	config: TConfig;
	data: TLevel;
	index: number;
	cameraFrustum: Frustum;
	cameraFocusUpdate: number;
	focusedPlayer: TPlayer;
}
const Level: FC<P> = ({
	config,
	data,
	index,
	cameraFrustum,
	cameraFocusUpdate,
	focusedPlayer,
}) => {
	const { music } = data;

	useEffect(() => {
		if (music) playAudio(music, true);
	}, [music]);

	const position = useMemo<[number, number, number]>(() => {
		return [data.worldX, data.worldY, index];
	}, [data.worldX, data.worldY, index]);

	return (
		<group position={[position[0], position[1], 0]}>
			{(config.data.layers || []).map((_configLayer) => {
				const filtered = (data.layerInstances || []).filter((_instance) => {
					return (
						_instance.layerId === _configLayer.id && _instance.intGrid.length
					);
				});
				return (filtered || []).map((_config) => (
					<Layer
						globalConfig={config}
						config={_configLayer}
						data={_config}
						cameraFrustum={cameraFrustum}
						cameraFocusUpdate={cameraFocusUpdate}
						focusedPlayer={focusedPlayer}
						key={_config.id}
					/>
				));
			})}
		</group>
	);
};

export default React.memo(Level, (prevProps, nextProps) => {
	return (
		prevProps.config.data.layers.length === nextProps.config.data.layers.length
	);
});
