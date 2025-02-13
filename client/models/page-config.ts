import { KEY } from '@/const';

export type THomePage = {
	playBackground: string;
	showRanking: boolean;
	showShop: boolean;
	showSocial: boolean;
	showAd: boolean;
};

export type TControlButton = {
	key: KEY;
	backgroundImage: string;
	type?: 'default' | 'area';
	style?: any;
	condition?: (player: any) => boolean;
};
export type TKeyMapping = {
	[k: string]: KEY;
};
export type TCameraSettings = {
	height: {
		default: number;
		mobile: number;
		mobileLandscape: number;
	};
};
export type TGamePage = {
	controls: TControlButton[];
	camera: TCameraSettings;
	pressKeyMapping?: TKeyMapping;
	releaseKeyMapping?: TKeyMapping;
	canMove?: boolean;
	uiComponent: () => JSX.Element;
};

export type TViewerConfig = {
	baseSrc: string;
	layerOrder: string[];
	frameWidth: number;
	frameHeight: number;
	animateFrom: number;
	animateTo: number;
	frameDuration: number;
	colOffset?: number;
	rowOffset?: number;
	size?: number;
};
export type TExtraLayer = TViewerConfig & {
	category: string;
};
export type TShopViewer = TViewerConfig & {
	extraLayers: TExtraLayer[];
};
export type TShopPage = {
	viewer: TShopViewer;
};

export type TWebsiteGameConfig = {
	isLocal?: boolean;
	isOnline?: boolean;
	canBet?: boolean;
	info: {
		name: string;
		description: string;
		cover: string;
		background: string;
	};
	home: THomePage;
	game: TGamePage;
	shop: TShopPage;
};
export type TWebsiteConfig = {
	domain: string;
	title: string;
	description: string;
	games: {
		[k: string]: TWebsiteGameConfig;
	};
};
