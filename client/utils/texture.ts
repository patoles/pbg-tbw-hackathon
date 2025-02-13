import { Texture, TextureLoader } from 'three';
import { TGameData } from '@/models';

const textureCache: any = {};
const textureLoading: any = {};
export const loadTexture = (src: string) => {
	return new Promise<Texture>((resolve) => {
		const onTextureLoaded = (_text: Texture) => {
			if (textureLoading[src]) delete textureLoading[src];
			resolve(_text.clone());
		};

		const _load = () => {
			if (textureCache[src]) onTextureLoaded(textureCache[src]);
			else {
				if (textureLoading[src]) setTimeout(_load, 200);
				else {
					textureLoading[src] = true;
					new TextureLoader().load(src, (_texture) => {
						textureCache[src] = _texture;
						onTextureLoaded(_texture);
					});
				}
			}
		};
		_load();
	});
};

export const loadTextureArray = (srcArr: string[]) => {
	return Promise.all((srcArr || []).map((src) => loadTexture(src)));
};

export const preloadTextures = (data: TGameData) => {
	const textureArray = data.config.data.tilesets.map((tileset) => tileset.path);
	loadTextureArray(textureArray);
};
