import fetch from 'cross-fetch';
import config from '@/config';
import { isTelegram } from '.';

const custom = (url: string, options: any = {}) => {
	if (isTelegram()) {
		url += `${url.indexOf('?') > -1 ? '&' : '?'}${
			window['Telegram'].WebApp.initData
		}`;
	}
	options.credentials = 'include';
	return fetch(url, options);
};

const get = (url: string, options: any = {}) => {
	return custom(
		`${config.domain}${url}`,
		Object.assign({}, { method: 'GET' }, options)
	);
};

const post = (url: string, options: any = {}, data: any = {}) => {
	return custom(
		`${config.domain}${url}`,
		Object.assign(
			{},
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			},
			options
		)
	);
};

const request = {
	get,
	post,
	put: (url: string, options: any = {}, data: any = {}) => {
		return post(url, Object.assign({}, { method: 'PUT' }, options), data);
	},
	delete: (url: string, options: any = {}, data: any = {}) => {
		return post(url, Object.assign({}, { method: 'DELETE' }, options), data);
	},
	custom,
};

export default request;
