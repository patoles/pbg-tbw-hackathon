import { Express } from 'express';
import bodyParser from 'body-parser';
import { Webhook } from 'svix';
import type { WebhookEvent } from '@clerk/clerk-sdk-node';
import db from '../db';

import { print } from '../../shared/utils';

const clerkAPI = (app: Express) => {
	app.post(
		'/api/webhook',
		bodyParser.raw({ type: 'application/json' }),
		async (req: any, res: any) => {
			try {
				const payload = req.body.toString();
				const headers = req.headers;

				const wh = new Webhook(String(process.env.CLERK_WEBHOOK_SECRET_KEY));
				const evt = wh.verify(payload, headers) as WebhookEvent;
				const { id = '' } = evt.data;
				// Handle the webhook
				const eventType = evt.type;
				print(`User ${id} was ${eventType}`);
				if (eventType === 'user.created') {
					await db.user.createUser(evt.data);
				} else if (eventType === 'user.updated') {
					await db.user.updateUser(id, evt.data);
				} else if (eventType === 'user.deleted') {
					await db.user.deleteUser(id);
				}
				res.status(200).json({
					success: true,
					message: 'Webhook received',
				});
			} catch (err) {
				res.status(400).json({
					success: false,
					message: err.message,
				});
			}
		}
	);
};

export default clerkAPI;
