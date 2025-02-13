import { MINT_OPTIONS } from '../const';

export const decimalToUnit = (value: number, mint: string) => {
	const mult = MINT_OPTIONS.find((item) => item.mint === mint)?.decimals || 0;
	return mult && value ? value / Math.pow(10, mult) : 0;
};

export const unitToDecimal = (value: number, mint: string) => {
	const mult = MINT_OPTIONS.find((item) => item.mint === mint)?.decimals || 0;
	return value * (mult ? Math.pow(10, mult) : 1);
};

export const findMintLabel = (mint: string) => {
	return MINT_OPTIONS.find((item) => item.mint === mint)?.label || '';
};
