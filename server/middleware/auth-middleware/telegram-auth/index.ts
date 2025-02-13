import { Request, Response } from 'express';
import { TelegramUser } from './models';
import { verifyTgAuthResult, verifyTgQuery } from './helpers';

const telegramAuth = (
	req: Request & any,
	res: Response,
	tgAuthResult: string,
	next: () => void
) => {
	const { query } = req;

	let user: TelegramUser | undefined = undefined;
	if (tgAuthResult) {
		user = verifyTgAuthResult(tgAuthResult, req, res);
	} else if (query) {
		user = verifyTgQuery(query, res);
	}
	if (user) {
		req.auth = {
			user,
			userId: `${user.id}`,
		};
	}
	next();
};

export { telegramAuth };
