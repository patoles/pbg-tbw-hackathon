import { useFrame } from '@react-three/fiber';
import useKeyboard from '@/hooks/use-keyboard';
import { KEY } from '@/const';
import { TKeyMapping } from '@/models';
import { createAudioContext } from '@/utils/audio';

const down: any = {};
let zSpeed = 0;
let xSpeed = 0;

let lastZSpeed = zSpeed;
let lastXSpeed = xSpeed;

let lastDown: any = {};

interface ControllerDesktopProps {
	pressKeyMapping?: TKeyMapping;
	releaseKeyMapping?: TKeyMapping;
	onMove?: ({ xSpeed, zSpeed }: { xSpeed: number; zSpeed: number }) => void;
	onPressKey: (key: KEY) => void;
	onReleaseKey: (key: KEY) => void;
}
function ControllerDesktop({
	pressKeyMapping,
	releaseKeyMapping,
	onMove,
	onPressKey,
	onReleaseKey,
}: ControllerDesktopProps) {
	useKeyboard(({ key, event }) => {
		createAudioContext();
		if (event === 'keydown') down[key] = true;
		else if (event === 'keyup') down[key] = false;
	});

	useFrame(() => {
		if (onMove) {
			if (down['w'] || down['arrowup']) zSpeed = 1;
			else if (down['s'] || down['arrowdown']) zSpeed = -1;
			else zSpeed = 0;
			if (down['d'] || down['arrowright']) xSpeed = 1;
			else if (down['a'] || down['arrowleft']) xSpeed = -1;
			else xSpeed = 0;
			if (xSpeed !== lastXSpeed || zSpeed !== lastZSpeed) {
				lastXSpeed = xSpeed;
				lastZSpeed = zSpeed;
				onMove({ xSpeed, zSpeed });
			}
		}
		if (pressKeyMapping && Object.keys(pressKeyMapping).length) {
			Object.keys(pressKeyMapping).forEach((key) => {
				if (down[key] && !lastDown[key]) {
					onPressKey(pressKeyMapping[key]);
				}
			});
		}
		if (releaseKeyMapping && Object.keys(releaseKeyMapping).length) {
			Object.keys(releaseKeyMapping).forEach((key) => {
				if (!down[key] && lastDown[key]) {
					onReleaseKey(releaseKeyMapping[key]);
				}
			});
		}
		lastDown = JSON.parse(JSON.stringify(down));
	});
	return null;
}

export default ControllerDesktop;
