import { Request, Response } from 'express';
import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';
import { SolanaUser } from './models';

const decodeAuth = (auth) => {
	const parsedAuth = JSON.parse(auth);
	return {
		publicKey: new PublicKey(parsedAuth.publicKey),
		message: Buffer.from(parsedAuth.signedMessage, 'base64'),
		signature: Buffer.from(parsedAuth.signature, 'base64'),
		//		nonce: parsedAuth.nonce,
	};
};

export const checkAuthValid = (solanaAuth: string) => {
	const { publicKey, message, signature } = decodeAuth(solanaAuth);
	// Verify the signature
	const isValid = nacl.sign.detached.verify(
		message,
		signature,
		publicKey.toBytes()
	);
	return {
		publicKey,
		isValid,
	};
};

const solanaAuth = (
	req: Request & any,
	res: Response,
	solanaAuth: string,
	next: () => void
) => {
	let user: SolanaUser | undefined = undefined;

	if (solanaAuth) {
		// Verify the signature
		const { publicKey, isValid } = checkAuthValid(solanaAuth);
		if (isValid) {
			if (!req.session.user) {
				req.session.user = {};
			}
			req.session.user.solanaAuth = solanaAuth;
			user = {
				id: publicKey.toString(),
				username: publicKey.toString().slice(0, 5),
				walletSolana: publicKey.toString(),
			};
		} else {
			res.status(401).send('Invalid signature');
			return;
		}
	}
	if (user) {
		req.auth = {
			user,
			userId: `${user.id}`,
		};
	}
	next();
};

export { solanaAuth };
