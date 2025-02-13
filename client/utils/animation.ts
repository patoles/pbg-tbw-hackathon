import { TEntity, TGameEntityInstance } from '@/models';
import { SOUND_CREATION_INTERVAL } from '@/const';
import { playAudio, stopAudio } from './audio';

const animationData: any = {};
const audioData: any = {};

const getAnimationId = (
	entity: TEntity,
	entityInstance: TGameEntityInstance,
	action: string
) => {
	const animation =
		entity.animation && entity.animation[action]
			? entity.animation[action]
			: null;
	return animation && animation.sync
		? `${entity.id}_${action}`
		: `${entity.id}_${entityInstance.id}`;
};

const getAudioId = (entityInstance: TGameEntityInstance) => {
	return `${entityInstance.entity_id}_${entityInstance.id}`;
};

export const updateAnimation = (
	entity: TEntity,
	entityInstance: TGameEntityInstance,
	action: string,
	onFrameUpdate: (nextFrame: number) => void
) => {
	const id = getAnimationId(entity, entityInstance, action);
	const audioId = getAudioId(entityInstance);

	const update = (_frame: number) => {
		if (animationData[id]) {
			const _action = animationData[id].action;
			if (
				entity.animation &&
				entity.animation[_action] &&
				entity.animation[_action]?.frames.length
			) {
				// ANIMATION SOUND
				const sound = entity.animation[_action]?.sound;
				if (animationData[id].previousAction !== _action) {
					//STOP AUDIO OF PREVIOUS ANIM IF NEEDED
					if (audioData[audioId].length) {
						stopAudio(audioData[audioId]);
						audioData[audioId] = [];
					}
					if (sound) {
						const onPlaySuccess = (_audioId: string) => {
							if (audioId) {
								if (sound.stopOn === 'animation')
									audioData[audioId].push(_audioId);
							}
						};

						if (
							sound.playOn === 'create' &&
							Date.now() - entityInstance.created <= SOUND_CREATION_INTERVAL
						) {
							playAudio(sound.id).then(onPlaySuccess);
						} else if (sound.playOn === 'show') {
							playAudio(sound.id).then(onPlaySuccess);
						}
					}
				}

				const animation = entity.animation[_action];
				let nextFrame = 0;
				if (animation) {
					nextFrame =
						_frame < animation.frames.length - 1
							? _frame + 1
							: animation.loop
							? animation.loopFrom
								? animation.loopFrom
								: 0
							: _frame;
					if (nextFrame !== _frame) {
						Object.values(animationData[id].updates).forEach(
							(_onUpdate: any) => {
								_onUpdate(nextFrame);
							}
						);
						animationData[id].timeout = setTimeout(() => {
							update(nextFrame);
						}, animation.frames[nextFrame].duration || animation.duration);
					}
				}
				animationData[id].previousAction = _action;
			}
		}
	};
	if (!animationData[id]) {
		animationData[id] = {
			count: 0,
			action,
			previousAction: '',
			timeout: null,
			updates: {},
		};
	} else if (
		(!entity.animation || !entity.animation[action]) &&
		animationData[id].timeout
	) {
		clearTimeout(animationData[id].timeout);
	}
	if (!audioData[audioId]) audioData[audioId] = [];
	animationData[id].count++;
	animationData[id].updates[entityInstance.id] = onFrameUpdate;
	if (animationData[id].count === 1) update(-1);
};

export const stopAnimation = (
	entity: TEntity,
	entityInstance: TGameEntityInstance,
	action: string
) => {
	stopAnimationAudio(entityInstance);
	const id = getAnimationId(entity, entityInstance, action);
	if (animationData[id]) {
		animationData[id].count = Math.max(animationData[id].count - 1, 0);
		delete animationData[id].updates[entityInstance.id];
		if (animationData[id].count === 0) {
			if (animationData[id].timeout) {
				clearTimeout(animationData[id].timeout);
			}
			delete animationData[id];
		}
	}
};

export const stopAnimationAudio = (entityInstance: TGameEntityInstance) => {
	const audioId = getAudioId(entityInstance);
	if (audioData[audioId]) {
		stopAudio(audioData[audioId]);
		delete audioData[audioId];
	}
};
