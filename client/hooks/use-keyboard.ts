import { useEffect, useRef } from 'react';
import { getRandomID } from '@/utils';

type ICallback = ({ key, event }: { key: string; event: string }) => void;

const cbList: any = {};
export default function useKeyboard(callback: ICallback) {
	const eventId = useRef<string>(getRandomID());
	useEffect(() => {
		if (callback) cbList[eventId.current] = callback;
		else if (cbList[eventId.current]) delete cbList[eventId.current];
	}, [callback]);
	useEffect(() => {
		const handleKeyDown = (e: any) => {
			for (const property in cbList) {
				const cb = cbList[property];
				cb && cb({ key: e.key.toLowerCase(), event: 'keydown' });
			}
		};
		const handleKeyUp = (e: any) => {
			for (const property in cbList) {
				const cb = cbList[property];
				cb && cb({ key: e.key.toLowerCase(), event: 'keyup' });
			}
		};
		if (!window.onkeydown || !window.onkeyup) {
			window.onkeydown = handleKeyDown;
			window.onkeyup = handleKeyUp;
		}
		return () => {
			window.onkeydown = null;
			window.onkeyup = null;
		};
	}, []);
	return null;
}
