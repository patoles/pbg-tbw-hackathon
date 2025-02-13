import { KEY } from '@/const';
import {
	CAMERA_HEIGHT,
	CAMERA_HEIGHT_MOBILE,
	CAMERA_HEIGHT_MOBILE_LANDSCAPE,
} from '@shared/games/snake/const';
import { TWebsiteGameConfig } from '@/models';
import GameUI from '@/components/games/snake/game-ui';

export const snake: TWebsiteGameConfig = {
	isLocal: true,
	isOnline: true,
	canBet: true,
	info: {
		name: 'Snake',
		description: '',
		cover:
			'https://res.cloudinary.com/dxlvclh9c/image/upload/v1733841306/pixelbrawlgames/snake/img/banner.jpg',
		background:
			'https://res.cloudinary.com/dxlvclh9c/image/upload/v1733039818/pixelbrawlgames/snake/img/game-bg.png',
	},
	home: {
		playBackground:
			'https://res.cloudinary.com/dxlvclh9c/image/upload/v1716816924/pixelbrawlgames/img/ui_button_bg.png',
		showRanking: true,
		showShop: true,
		showSocial: false,
		showAd: false,
	},
	game: {
		canMove: false,
		camera: {
			height: {
				default: CAMERA_HEIGHT,
				mobile: CAMERA_HEIGHT_MOBILE,
				mobileLandscape: CAMERA_HEIGHT_MOBILE_LANDSCAPE,
			},
		},
		pressKeyMapping: {
			a: KEY.A,
			d: KEY.D,
			' ': KEY.SPACE,
			arrowleft: KEY.A,
			arrowright: KEY.D,
		},
		releaseKeyMapping: {
			a: KEY.A,
			d: KEY.D,
			' ': KEY.SPACE,
			arrowleft: KEY.A,
			arrowright: KEY.D,
		},
		controls: [
			{
				key: KEY.A,
				backgroundImage: '',
				type: 'area',
				style: { top: 0, left: 0, width: '50%', height: '100%' },
			},
			{
				key: KEY.D,
				backgroundImage: '',
				type: 'area',
				style: { top: 0, right: 0, width: '50%', height: '100%' },
			},
			{
				key: KEY.SPACE,
				backgroundImage:
					'https://res.cloudinary.com/dxlvclh9c/image/upload/v1731915806/pixelbrawlgames/snake/img/mobile_btn_run.png',
				condition: (player) => {
					return player && player.alive;
				},
			},
			{
				key: KEY.SPACE,
				backgroundImage:
					'https://res.cloudinary.com/dxlvclh9c/image/upload/v1718626448/pixelbrawlgames/blast/img/mobile_btn_camera.png',
				condition: (player) => {
					return player && !player.alive;
				},
			},
		],
		uiComponent: GameUI,
	},
	shop: {
		viewer: {
			baseSrc:
				'https://res.cloudinary.com/dxlvclh9c/image/upload/v1731916261/pixelbrawlgames/snake/tileset/head_default.png',
			layerOrder: ['head'],
			frameWidth: 32,
			frameHeight: 32,
			animateFrom: 0,
			animateTo: 0,
			frameDuration: 0,
			extraLayers: [],
		},
	},
};
