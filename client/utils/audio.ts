import { TSound } from '@/models';
import { getRandomID } from '.';

interface ILoadedAudio {
	[k: string]: {
		buffer: AudioBuffer;
		loop: boolean;
	};
}

let audioCtx: AudioContext | null = null;
let savedUrlList: TSound[] = [];

export const createAudioContext = () => {
	if (!audioCtx) {
		audioCtx = new AudioContext();
		if (audioCtx.state !== 'running') audioCtx = null;
		else {
			if (savedUrlList.length) {
				const _urlList = JSON.parse(JSON.stringify(savedUrlList));
				savedUrlList = [];
				preloadAudio(_urlList);
			}
		}
	}
};

const loadedAudioList: ILoadedAudio[] = [];
let isAudioPreloaded = false;
export const preloadAudio = (urlList: TSound[]) => {
	if (!audioCtx) {
		savedUrlList = JSON.parse(JSON.stringify(urlList));
	} else {
		const finishedLoading = (bufferList: AudioBuffer[]) => {
			bufferList.forEach((buffer, index) => {
				const { id, loop, type } = urlList[index];
				loadedAudioList[id] = {
					loop,
					type,
					buffer,
				};
			});
			isAudioPreloaded = true;
		};
		const bufferLoader = new BufferLoader(audioCtx, urlList, finishedLoading);
		bufferLoader.load();
	}
};

let sources: {
	[k: string]: AudioBufferSourceNode;
} = {};
const lastPlayedSources: {
	[k: string]: number;
} = {};
const MINIMUM_SAME_SOUND_INTERVAL = 50;
export const playAudio = (id: string, playOnReady?: boolean, tryCount = 0) => {
	return new Promise<string>((resolve, reject) => {
		const action = () => {
			if (loadedAudioList[id] && audioCtx) {
				if (
					((tryCount === 0 ||
						(tryCount > 0 && loadedAudioList[id].type === 'music')) &&
						!lastPlayedSources[id]) ||
					(lastPlayedSources[id] &&
						Date.now() - lastPlayedSources[id] > MINIMUM_SAME_SOUND_INTERVAL)
				) {
					const { buffer, loop } = loadedAudioList[id];
					const source = audioCtx.createBufferSource();
					source.buffer = buffer;
					source.loop = loop;
					source.connect(audioCtx.destination);
					source.start(0);
					const sourceId = getRandomID(6);
					sources[sourceId] = source;
					lastPlayedSources[id] = Date.now();
					if (!loop) {
						source.onended = () => {
							delete sources[sourceId];
						};
					}
					resolve(sourceId);
				} else resolve('');
			} else reject("Sound ID doesn't exist");
		};
		if (isAudioPreloaded) {
			action();
		} else {
			if (playOnReady)
				setTimeout(() => playAudio(id, playOnReady, tryCount++), 100);
			else resolve('');
		}
	});
};

export const stopAudio = (sourceIds: string[]) => {
	sourceIds.forEach((sourceId) => {
		if (sources[sourceId]) {
			sources[sourceId].stop(0);
			sources[sourceId].disconnect();
			delete sources[sourceId];
		}
	});
};

export const stopAllAudio = () => {
	for (const sourceId in sources) {
		sources[sourceId].stop(0);
		sources[sourceId].disconnect();
	}
	sources = {};
};

class BufferLoader {
	context: AudioContext;
	urlList: TSound[];
	onload: (bufferList: AudioBuffer[]) => void;
	bufferList: AudioBuffer[];
	loadCount: number;

	constructor(context: AudioContext, urlList: TSound[], callback) {
		this.context = context;
		this.urlList = urlList;
		this.onload = callback;
		this.bufferList = [];
		this.loadCount = 0;
	}
	loadBuffer(audioListItem: TSound, index) {
		// Load buffer asynchronously
		const { url } = audioListItem;
		const request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';

		request.onload = () => {
			// Asynchronously decode the audio file data in request.response
			this.context.decodeAudioData(
				request.response,
				(buffer) => {
					if (!buffer) {
						alert('error decoding file data: ' + url);
						return;
					}
					this.bufferList[index] = buffer;
					if (++this.loadCount == this.urlList.length)
						this.onload(this.bufferList);
				},
				(error) => {
					console.error('decodeAudioData error', error);
				}
			);
		};

		request.onerror = function () {
			alert('BufferLoader: XHR error');
		};

		request.send();
	}
	load() {
		for (let i = 0; i < this.urlList.length; ++i)
			this.loadBuffer(this.urlList[i], i);
	}
}
