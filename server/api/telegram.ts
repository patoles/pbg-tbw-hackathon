import TelegramBot from 'node-telegram-bot-api';

const telegramAPI = () => {
	const token = String(process.env.TELEGRAM_BOT_TOKEN);
	const webAppDomain = 'https://pixelbrawlgames.com';

	if (token) {
		const bot = new TelegramBot(token, {
			polling: true,
		});

		bot.onText(/\/start$/, (msg) => {
			const chatId = msg.chat.id;
			const blastWebAppUrl = `${webAppDomain}/game/blast`;
			const snakeWebAppUrl = `${webAppDomain}/game/snake`;

			const options = {
				reply_markup: {
					inline_keyboard: [
						[{ text: '💣 Play Blast Fury', web_app: { url: blastWebAppUrl } }],
						[{ text: '🐍 Play Sneki', web_app: { url: snakeWebAppUrl } }],
					],
				},
			};
			bot.sendMessage(
				chatId,
				'💥 Welcome to PixelBrawlGames! 💥 Click the button below to start playing!',
				options
			);
		});

		bot.onText(/\/start (.+)/, (msg, match) => {
			const chatId = msg.chat.id;
			const payload = match[1] || '';
			const formatPayload = payload.split('__');

			if (formatPayload.length === 2) {
				const [gameId, roomId] = formatPayload;
				const webAppUrl = `${webAppDomain}/game/${gameId}/r/${roomId}`;
				const options = {
					reply_markup: {
						inline_keyboard: [
							[{ text: '💣 Join your friend', web_app: { url: webAppUrl } }],
						],
					},
				};
				bot.sendMessage(
					chatId,
					'💥 Click the button to join your friend!',
					options
				);
			}
		});
	}
};

export default telegramAPI;
