import { Request } from 'express';

export const isTelegramBrowser = (req: Request): boolean => {
	const userAgent = req.headers['user-agent'] || '';
	const authDate = req.query['auth_date'];
	const isTelegramUserAgent = userAgent.includes('Telegram');
	const isAuthDatePresent = typeof authDate !== 'undefined';
	return isTelegramUserAgent || isAuthDatePresent;
};
