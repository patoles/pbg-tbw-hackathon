import fetch from 'cross-fetch';

const custom = (url: string, options: any = {}) => {
	options.credentials = 'include';
	return fetch(
		`${
			typeof window === 'undefined'
				? `http://localhost:3000`
				: window.location.origin
		}${url}`,
		options
	);
};

const post = (url: string, data: any = {}) => {
	return custom(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});
};

export const getStore = async (gameId: string) => {
	const response = await post('/api/game/store', { gameId });
	const { data } = await response.json();
	return data;
};
