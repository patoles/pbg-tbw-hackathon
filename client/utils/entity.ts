import { TGameData } from '@/models';

const preloadedEntities: {
	[k: string]: any;
} = {};
export const preloadEntities = (data: TGameData) => {
	data.config.data.entities.forEach((entity) => {
		preloadedEntities[entity.id] = JSON.parse(JSON.stringify(entity));
	});
};
export const findEntity = (id: string) => {
	return preloadedEntities[id] || null;
};
