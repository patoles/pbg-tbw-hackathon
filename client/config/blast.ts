import { KEY } from '@/const';
import {
	CAMERA_HEIGHT,
	CAMERA_HEIGHT_MOBILE,
	CAMERA_HEIGHT_MOBILE_LANDSCAPE,
} from '@shared/games/blast/const';
import { TWebsiteGameConfig } from '@/models';
import GameUI from '@/components/games/blast/game-ui';

export const blast: TWebsiteGameConfig = {
	isLocal: true,
	isOnline: true,
	info: {
		name: 'BlastFury',
		description:
			'Enjoy explosive fun in a free, web-based multiplayer game inspired by Bomberman. Strategize, and dominate up to 99 opponents online!',
		cover:
			'https://res.cloudinary.com/dxlvclh9c/image/upload/v1716816906/pixelbrawlgames/blast/img/banner.jpg',
		background:
			'https://res.cloudinary.com/dxlvclh9c/image/upload/v1716816907/pixelbrawlgames/blast/img/game-bg.png',
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
		canMove: true,
		camera: {
			height: {
				default: CAMERA_HEIGHT,
				mobile: CAMERA_HEIGHT_MOBILE,
				mobileLandscape: CAMERA_HEIGHT_MOBILE_LANDSCAPE,
			},
		},
		pressKeyMapping: {
			' ': KEY.SPACE,
			shift: KEY.SHIFT,
		},
		controls: [
			{
				key: KEY.SPACE,
				backgroundImage:
					'https://res.cloudinary.com/dxlvclh9c/image/upload/v1716816907/pixelbrawlgames/blast/img/mobile_btn_bomb.png',
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
			{
				key: KEY.SHIFT,
				backgroundImage:
					'https://res.cloudinary.com/dxlvclh9c/image/upload/v1716816908/pixelbrawlgames/blast/img/mobile_btn_special.png',
				condition: (player) => {
					return player && player.properties && player.properties.powerUp;
				},
			},
		],
		uiComponent: GameUI,
	},
	shop: {
		viewer: {
			baseSrc:
				'https://res.cloudinary.com/dxlvclh9c/image/upload/v1716816913/pixelbrawlgames/blast/tileset/player_tileset.png',
			layerOrder: ['body', 'face', 'head', 'chest', 'leg', 'shoe'],
			frameWidth: 32,
			frameHeight: 32,
			animateFrom: 0,
			animateTo: 3,
			frameDuration: 200,
			extraLayers: [
				{
					category: 'bomb',
					baseSrc:
						'https://res.cloudinary.com/dxlvclh9c/image/upload/v1716816909/pixelbrawlgames/blast/tileset/bomb_tileset.png',
					layerOrder: ['bomb'],
					frameWidth: 32,
					frameHeight: 32,
					animateFrom: 0,
					animateTo: 3,
					frameDuration: 200,
					rowOffset: 1,
					size: 0.5,
				},
				{
					category: 'explosion',
					baseSrc:
						'https://res.cloudinary.com/dxlvclh9c/image/upload/v1721132200/pixelbrawlgames/blast/tileset/explosion_tileset.png',
					layerOrder: ['explosion'],
					frameWidth: 16,
					frameHeight: 16,
					animateFrom: 0,
					animateTo: 3,
					frameDuration: 200,
					size: 0.5,
				},
			],
		},
	},
};
