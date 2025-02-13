import { FC, useEffect, useState, useRef, useMemo } from 'react';
import { TViewerConfig, TStoreItemCollection } from '@/models';

import styles from './index.module.css';

interface P {
	config: TViewerConfig;
	collections: TStoreItemCollection[];
}
const PlayerViewer: FC<P> = ({ config, collections }) => {
	const [frame, setFrame] = useState<number>(0);
	const [col, setCol] = useState<number>(0);
	const [row, setRow] = useState<number>(0);

	const interval = useRef<NodeJS.Timer | null>(null);

	const {
		baseSrc,
		layerOrder,
		frameWidth,
		frameHeight,
		animateFrom,
		animateTo,
		frameDuration,
		colOffset,
		rowOffset,
		size,
	} = config;

	const viewerCollections = useMemo<TStoreItemCollection[]>(() => {
		const _collections: TStoreItemCollection[] = [];
		(collections || []).forEach((element) => {
			if (layerOrder.indexOf(element.category) > -1) _collections.push(element);
		});
		return _collections;
	}, [layerOrder, collections]);

	useEffect(() => {
		if (viewerCollections.length && layerOrder.length) {
			const img = new Image();
			img.onload = (loadedImg: any) => {
				setCol(loadedImg.target.width / frameWidth);
				setRow(loadedImg.target.height / frameHeight);
			};
			img.src = baseSrc;
			interval.current = setInterval(() => {
				setFrame((frame) => {
					if (frame + 1 <= animateTo) return frame + 1;
					else return animateFrom || 0;
				});
			}, frameDuration || 200);
		}

		return () => {
			if (interval.current) clearInterval(interval.current);
		};
	}, [viewerCollections, layerOrder]);

	const layers = useMemo<string[]>(() => {
		const _layers: string[] = [];
		let _baseSrc = baseSrc;
		viewerCollections.forEach((collectionItem) => {
			if (collectionItem.selected) {
				if (collectionItem.category === layerOrder[0]) _baseSrc = '';
				_layers.push(collectionItem.tileset_path);
			}
		});
		if (_baseSrc) _layers.unshift(_baseSrc);
		return _layers;
	}, [viewerCollections, layerOrder]);

	if (!viewerCollections.length) return null;

	return (
		<div className={styles.playerViewer}>
			{(layers || []).map((layer, index) => (
				<ViewerLayer
					key={`${viewerCollections[0].category}_${index}`}
					src={layer}
					col={col}
					row={row}
					colOffset={colOffset}
					rowOffset={rowOffset}
					frame={frame}
					size={size}
				/>
			))}
		</div>
	);
};

interface ViewerLayerP {
	src: string;
	col: number;
	row: number;
	colOffset?: number;
	rowOffset?: number;
	frame: number;
	size?: number;
}
const ViewerLayer: FC<ViewerLayerP> = ({
	src,
	col,
	row,
	frame,
	colOffset = 0,
	rowOffset = 0,
	size = 1,
}) => {
	return (
		<div
			className={styles.viewerLayer}
			style={{
				backgroundImage: `url("${src}")`,
				backgroundSize: `${100 * col}% ${100 * row}%`,
				backgroundPosition: `${(100 / (col - 1)) * (frame + colOffset)}% ${
					(100 / (row - 1)) * rowOffset
				}%`,
				width: `${size * 100}%`,
				height: `${size * 100}%`,
			}}
		/>
	);
};

export default PlayerViewer;
