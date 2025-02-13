import { Request, Response } from 'express';
import { telegramAuth } from './telegram-auth';
import { clerkAuth } from './clerk-auth';
import { solanaAuth as solanaAuthHelper } from './solana-auth';
import { isTelegramBrowser } from '../../utils';

const authMiddleware = (
	req: Request & any,
	res: Response,
	next: () => void
) => {
	const { body } = req;
	let tgAuthResult = '';
	let solanaAuth = '';
	if (body && body.solanaAuth) solanaAuth = body.solanaAuth;
	else if (req.session && req.session.user && req.session.user.solanaAuth)
		solanaAuth = req.session.user.solanaAuth;
	else if (body && body.tgAuthResult) tgAuthResult = body.tgAuthResult;
	else if (req.session && req.session.user && req.session.user.tgAuthResult)
		tgAuthResult = req.session.user.tgAuthResult;

	if (solanaAuth) {
		solanaAuthHelper(req, res, solanaAuth, () => next());
	} else if (tgAuthResult || isTelegramBrowser(req)) {
		telegramAuth(req, res, tgAuthResult, () => next());
	} else clerkAuth(req, res, () => next());
};

export default authMiddleware;
