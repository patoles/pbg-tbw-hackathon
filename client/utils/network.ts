import { NETWORK_SMOOTH_DELAY_MS } from '@/const';

const mult = 4;
const errorMargin = 0.2;
let networkDelaySmoothing = NETWORK_SMOOTH_DELAY_MS;

export const setDelaySmoothing = (newValue: number) => {
	if (newValue) {
		console.log(newValue, 'new Value');
		const doubledValue = newValue * (mult + errorMargin);
		if (!networkDelaySmoothing) networkDelaySmoothing = doubledValue;
		else networkDelaySmoothing = (networkDelaySmoothing + doubledValue) / 2;
		console.log(networkDelaySmoothing, 'new delay');
	}
};

export const getDelaySmoothing = () => {
	return networkDelaySmoothing;
};
