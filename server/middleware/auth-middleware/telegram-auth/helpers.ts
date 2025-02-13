import crypto from 'crypto';
import { Request, Response } from 'express';
import { TelegramUser } from './models';

export const verifyTgAuthResult = (
	tgAuthResult,
	req: Request & any,
	res: Response
) => {
	const botToken = String(process.env.TELEGRAM_BOT_TOKEN);
	const decodedPayload = Buffer.from(tgAuthResult, 'base64').toString('utf8');
	const userData = JSON.parse(decodedPayload);
	const { hash, ...dataToVerify } = userData;
	const {
		id,
		auth_date,
		first_name = '',
		last_name = '',
		username = '',
		photo_url = '',
	} = dataToVerify;

	if (!hash || !auth_date || !id) {
		res.status(401).send('Missing parameters');
		return;
	}

	const dataString = Object.keys(dataToVerify)
		.sort()
		.filter((key) => dataToVerify[key])
		.map((key) => `${key}=${dataToVerify[key]}`)
		.join('\n');

	const secret = crypto.createHash('sha256').update(botToken).digest();
	const generatedHash = crypto
		.createHmac('sha256', secret)
		.update(dataString)
		.digest('hex');

	if (generatedHash !== hash) {
		res.status(401).send('Invalid hash');
		return;
	}

	if (!req.session.user) {
		req.session.user = {};
	}
	req.session.user.tgAuthResult = tgAuthResult;

	return {
		id,
		first_name,
		last_name,
		username,
		photo_url,
	} as TelegramUser;
};

export const verifyTgQuery = (query: any, res: Response) => {
	const botToken = String(process.env.TELEGRAM_BOT_TOKEN);
	const { query_id, user, auth_date, hash, signature } = query;

	if (!user) {
		res.status(401).send('Missing parameters');
		return;
	}
	const {
		id,
		first_name = '',
		last_name = '',
		username = '',
		photo_url = '',
	} = JSON.parse(user);

	if (!auth_date || !hash || !id || !signature) {
		res.status(401).send('Missing parameters');
		return;
	}

	const data = [
		`auth_date=${auth_date}`,
		`query_id=${query_id}`,
		`signature=${signature}`,
		`user=${user}`,
	]
		.sort()
		.join('\n');

	const secret_key = crypto
		.createHmac('sha256', Buffer.from('WebAppData'))
		.update(botToken)
		.digest();
	const generatedHash = crypto
		.createHmac('sha256', secret_key)
		.update(data)
		.digest('hex');

	if (generatedHash !== hash) {
		res.status(401).send('Invalid hash');
		return;
	}

	return {
		id,
		first_name,
		last_name,
		username,
		photo_url,
	} as TelegramUser;
};
