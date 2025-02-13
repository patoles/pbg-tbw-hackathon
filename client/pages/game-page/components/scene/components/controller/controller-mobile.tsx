import { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { createAudioContext } from '@/utils/audio';
import { useGameStore } from '@/stores/game';
import { Vector2 } from 'three';
import { isAppleDevice, isTelegram } from '@/utils';

const vecCenter = new Vector2(0, 0);
const vecPoint = new Vector2(0, 0);
const vecDir = new Vector2(0, 0);

const down: any = {
	LX: 0,
	LY: 0,
	RX: 0,
	RY: 0,
};
let xSpeed = 0;
let zSpeed = 0;

let lastXSpeed = xSpeed;
let lastZSpeed = zSpeed;

const MAX_PERCENT_AMPLITUDE = 100;
const MIN_MOVEMENT = 0.3;
const JOYSTICK_RADIUS_PERCENT = 10;

const touch: any = {
	start: [
		{ x: -1, y: -1, id: -1 },
		{ x: -1, y: -1, id: -1 },
	],
	pos: [
		{ x: -1, y: -1 },
		{ x: -1, y: -1 },
	],
	startTime: 0,
};

const getScreenWidth = () => {
	return document.documentElement.clientWidth;
};
const getScreenTouchArea = () => {
	return getScreenWidth();
};
const getJoystickRadius = () => {
	const { clientWidth, clientHeight } = document.documentElement;
	const w = clientWidth <= clientHeight ? clientWidth : clientHeight;
	return w * ((1 / 100) * JOYSTICK_RADIUS_PERCENT);
};

const getTouchID = (e: any) => {
	const { pointerId, touches } = e;
	return touches && touches[0] ? touches[0].identifier : pointerId;
};

const getPos = (e: any) => {
	let pos = { x: -1, y: -1, id: -1 };
	if (isAppleDevice() && !isTelegram()) {
		pos = {
			x: e.clientX,
			y: e.clientY,
			id: e.pointerId,
		};
	} else {
		const { touches } = e;
		pos = {
			x: touches[0].clientX,
			y: touches[0].clientY,
			id: touches[0].identifier,
		};
	}
	return pos;
};

interface ControllerMobileProps {
	onMove: ({ xSpeed, zSpeed }: { xSpeed: number; zSpeed: number }) => void;
}
function ControllerMobile({ onMove }: ControllerMobileProps) {
	const setVirtualJoystick = useGameStore((state) => state.setVirtualJoystick);

	const onTouchStart = (e: any) => {
		if (
			touch.start[0].id === -1 &&
			!e.target.classList.contains('ui-clickable')
		) {
			const screenW = getScreenTouchArea();
			const { x, y, id } = getPos(e);
			let canUpdate = false;

			if (x <= screenW) {
				e.preventDefault();
				e.stopImmediatePropagation();
				touch.start[0] = {
					x,
					y,
					id,
				};
				canUpdate = true;
			}

			if (canUpdate) {
				touch.startTime = Date.now();
				const joystickRadius = getJoystickRadius();
				setVirtualJoystick(touch.start[0], touch.start[0], joystickRadius * 2);
			}
			return false;
		}
	};
	const onTouchMove = (e: any) => {
		const touchId = getTouchID(e);
		if (touchId === touch.start[0].id && touch.startTime) {
			e.preventDefault();
			e.stopImmediatePropagation();
			const { x, y } = getPos(e);
			const { start, pos } = touch;
			pos[0] = {
				x,
				y,
			};
			touch.pos = pos;
			start.forEach((startPos: any, touchIndex: number) => {
				if (touchIndex === 0) {
					const movePos = pos[touchIndex];
					if (
						startPos.x > -1 &&
						startPos.y > -1 &&
						movePos.x > -1 &&
						movePos.y > -1
					) {
						const screenW = getScreenTouchArea();
						const joystickRadius = getJoystickRadius();
						// CLAMP POSITION WITHIN A CIRCLE
						vecCenter.set(startPos.x, startPos.y);
						vecPoint.set(movePos.x, movePos.y);
						const distance = vecPoint.distanceTo(vecCenter);
						if (distance > joystickRadius) {
							const direction = vecDir
								.subVectors(vecPoint, vecCenter)
								.normalize();
							direction.multiplyScalar(joystickRadius);
							vecPoint.copy(vecCenter).add(direction);
							movePos.x = vecPoint.x;
							movePos.y = vecPoint.y;
						}

						const diffX = movePos.x - startPos.x;
						const diffY = movePos.y - startPos.y;

						let diffXPercent = (diffX / joystickRadius) * 100;
						let diffYPercent = (diffY / joystickRadius) * 100;

						if (diffXPercent > MAX_PERCENT_AMPLITUDE)
							diffXPercent = MAX_PERCENT_AMPLITUDE;
						else if (diffXPercent < -MAX_PERCENT_AMPLITUDE)
							diffXPercent = -MAX_PERCENT_AMPLITUDE;
						if (diffYPercent > MAX_PERCENT_AMPLITUDE)
							diffYPercent = MAX_PERCENT_AMPLITUDE;
						else if (diffYPercent < -MAX_PERCENT_AMPLITUDE)
							diffYPercent = -MAX_PERCENT_AMPLITUDE;
						if (startPos.x <= screenW) {
							setVirtualJoystick(startPos, movePos, joystickRadius * 2);
							down.LX = diffXPercent / MAX_PERCENT_AMPLITUDE;
							down.LY = -(diffYPercent / MAX_PERCENT_AMPLITUDE);
						} else {
							down.RX = -(diffXPercent / MAX_PERCENT_AMPLITUDE);
							down.RY = diffYPercent / MAX_PERCENT_AMPLITUDE;
						}
					}
				}
			});
			return false;
		}
	};
	const onTouchEnd = (e) => {
		const { pointerId, touches, target } = e;
		if (
			((pointerId || pointerId === 0) && pointerId === touch.start[0].id) ||
			(touches &&
				!Object.values(touches).filter(
					(_touch: any) => _touch.identifier === touch.start[0].id
				).length) ||
			(touches && !touches.length)
		) {
			createAudioContext();
			if (touch.startTime) {
				touch.startTime = 0;
				setVirtualJoystick({ x: -1, y: -1 }, { x: -1, y: -1 }, 0);
				for (let count = 0; count < 1; count++) {
					const screenW = getScreenTouchArea();
					if (touch.start[0].x <= screenW) {
						down.LX = 0;
						down.LY = 0;
					} else {
						down.RX = 0;
						down.RY = 0;
					}
					touch.start[0] = { x: -1, y: -1, id: -1 };
					touch.pos[0] = { x: -1, y: -1 };
				}
			}
			return false;
		} else if (target && target.classList.contains('ui-clickable')) {
			target.click();
		}
	};
	useEffect(() => {
		document.addEventListener('contextmenu', (e) => {
			e.preventDefault();
		});
		if (isAppleDevice() && !isTelegram()) {
			document.body.addEventListener('pointerdown', onTouchStart, {
				passive: false,
			});
			document.body.addEventListener('pointermove', onTouchMove, {
				passive: false,
			});
			document.body.addEventListener('pointerup', onTouchEnd);
		} else {
			document.body.addEventListener('touchstart', onTouchStart, {
				passive: false,
			});
			document.body.addEventListener('touchmove', onTouchMove, {
				passive: false,
			});
			document.body.addEventListener('touchend', onTouchEnd);
		}

		return () => {
			if (isAppleDevice() && !isTelegram()) {
				document.body.removeEventListener('pointerdown', onTouchStart);
				document.body.removeEventListener('pointermove', onTouchMove);
				document.body.removeEventListener('pointerup', onTouchEnd);
			} else {
				document.body.removeEventListener('touchstart', onTouchStart);
				document.body.removeEventListener('touchmove', onTouchMove);
				document.body.removeEventListener('touchend', onTouchEnd);
			}
		};
	}, []);

	useFrame(() => {
		xSpeed = Math.abs(down.LX) > 1 ? (down.LX > 0 ? 1 : -1) : down.LX;
		zSpeed = Math.abs(down.LY) > 1 ? (down.LY > 0 ? 1 : -1) : down.LY;
		if (Math.abs(xSpeed) < MIN_MOVEMENT) xSpeed = 0;
		if (Math.abs(zSpeed) < MIN_MOVEMENT) zSpeed = 0;

		if (xSpeed !== lastXSpeed || zSpeed !== lastZSpeed) {
			lastXSpeed = xSpeed;
			lastZSpeed = zSpeed;
			onMove({ xSpeed, zSpeed });
		}
	});
	return null;
}

export default ControllerMobile;
