import { Express, Response } from 'express';
import bodyParser from 'body-parser';
import { WithAuthProp } from '@clerk/clerk-sdk-node';
import authMiddleware from '../middleware/auth-middleware';
import { CRYPTO_TRANSACTION_EVENT, TRANSACTION_COST } from '../crypto/const';
import { ICryptoTransactionInfo } from '../../shared/models';
import db from '../db';
import { handleNewTransaction } from '../crypto/transactions';

const userAPI = (app: Express) => {
	app.get(
		'/api/user',
		authMiddleware,
		async (req: WithAuthProp<any>, res: Response) => {
			if (req.auth && req.auth.userId) {
				const { userId } = req.auth;
				const user = await db.user.findUser(userId);
				res.status(200).json({
					success: true,
					data: user,
				});
			} else {
				res.status(401).send(`Couldn't verify`);
			}
		}
	);
	app.get(
		'/api/user-inventory',
		authMiddleware,
		async (req: WithAuthProp<any>, res: Response) => {
			if (req.auth && req.auth.userId) {
				const { userId } = req.auth;
				const user = await db.user.findUserWithInventory(userId);
				res.status(200).json({
					success: true,
					data: user,
				});
			} else {
				res.status(401).send(`Couldn't verify`);
			}
		}
	);
	app.post(
		'/api/user/verify',
		bodyParser.json(),
		authMiddleware,
		async (req: WithAuthProp<any>, res: Response) => {
			if (req.auth && req.auth.userId) {
				const { userId, user } = req.auth;
				const userExists = await db.user.checkUserExists(userId);
				if (!userExists) {
					await db.user.createUser(user);
				}
				res.status(200).json({
					success: true,
					data: {
						userId,
					},
				});
			} else {
				if (res.statusCode !== 401) {
					res.status(200).json({
						success: false,
					});
				}
			}
		}
	);
	app.get(
		'/api/user/sign-out',
		authMiddleware,
		async (req: WithAuthProp<any>, res: Response) => {
			if (req.auth && req.auth.userId) {
				if (req.session.user) req.session.user = {};
				res.status(200).json({
					success: true,
				});
			} else {
				res.status(401).send(`Couldn't verify`);
			}
		}
	);

	app.put(
		'/api/user/inventory/equip',
		authMiddleware,
		bodyParser.json(),
		async (req: WithAuthProp<any>, res: Response) => {
			if (req.auth && req.auth.userId) {
				const { userId } = req.auth;
				const { itemId = '' } = req.body || {};
				await db.user.equipItem(userId, itemId, true);
				res.status(200).json({
					success: true,
				});
			} else {
				res.status(401).send(`Couldn't verify`);
			}
		}
	);
	app.delete(
		'/api/user/inventory/unequip',
		authMiddleware,
		bodyParser.json(),
		async (req: WithAuthProp<any>, res: Response) => {
			if (req.auth && req.auth.userId) {
				const { userId } = req.auth;
				const { itemId = '' } = req.body || {};
				await db.user.equipItem(userId, itemId, false);
				res.status(200).json({
					success: true,
				});
			} else {
				res.status(401).send(`Couldn't verify`);
			}
		}
	);
	app.post(
		'/api/user/updated',
		authMiddleware,
		bodyParser.json(),
		async (req: WithAuthProp<any>, res: Response) => {
			if (req.auth && req.auth.userId) {
				const { userId } = req.auth;
				const { timestamp = 0 } = req.body || {};
				const updated = await db.user.isUserUpdated(userId, timestamp);
				res.status(200).json({
					success: true,
					data: {
						updated,
					},
				});
			} else {
				res.status(401).send(`Couldn't verify`);
			}
		}
	);

	app.post(
		'/api/user/connect-wallet',
		authMiddleware,
		bodyParser.json(),
		async (req: WithAuthProp<any>, res: Response) => {
			if (req.auth && req.auth.userId) {
				const { userId } = req.auth;
				const { walletAddress = '' } = req.body || {};
				await db.user.connectWalletTON(userId, walletAddress);
				res.status(200).json({
					success: true,
				});
			} else {
				res.status(401).send(`Couldn't verify`);
			}
		}
	);
	app.post(
		'/api/user/buy-coin',
		authMiddleware,
		bodyParser.json(),
		async (req: WithAuthProp<any>, res: Response) => {
			if (req.auth && req.auth.userId) {
				const { userId } = req.auth;
				const { amount = '' } = req.body || {};
				const value =
					TRANSACTION_COST[CRYPTO_TRANSACTION_EVENT.BUY_COIN][amount];
				if (value) {
					const metadata = { userId };
					const paymentRequest: ICryptoTransactionInfo = {
						quantity: amount,
						value,
						metadata,
					};
					handleNewTransaction('ton');
					res.status(200).json({
						success: true,
						data: paymentRequest,
					});
				} else {
					res.status(400).json({ error: 'Invalid amount.' });
				}
			} else {
				res.status(401).send(`Couldn't verify`);
			}
		}
	);
};

export default userAPI;
