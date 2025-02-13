import {
	Connection,
	Transaction,
	clusterApiUrl,
	PublicKey,
} from '@solana/web3.js';
import * as storage from '@/utils/storage';
import api from '@/api';
import { SOLANA_AUTH_STORAGE_KEY } from '@/const';

export const connectWallet = async () => {
	// Check if the wallet is installed
	if (window.solana && window.solana.isPhantom) {
		try {
			// Request a connection to the wallet
			const response = await window.solana.connect();

			// The user's public key is now accessible
			const userPublicKey = response.publicKey.toString();
			console.log('Connected to wallet:', userPublicKey);

			return userPublicKey;
		} catch (error) {
			console.error('Wallet connection failed:', error);
		}
	} else {
		console.log('Phantom wallet not found. Please install it.');
	}
};

export const getWalletConnection = async () => {
	const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

	// Check if the wallet is connected
	if (!window.solana || !window.solana.isConnected) {
		await connectWallet();
	}
	return connection;
};

export const sendTransaction = async (
	connection: Connection,
	transaction: Transaction,
	targetPublicKey: PublicKey
) => {
	const { blockhash } = await connection.getLatestBlockhash();
	transaction.recentBlockhash = blockhash;
	transaction.feePayer = targetPublicKey;

	const signedTransaction = await window.solana.signTransaction(transaction);
	const signature = await connection.sendRawTransaction(
		signedTransaction.serialize(),
		{
			skipPreflight: false,
			preflightCommitment: 'confirmed',
		}
	);
	await connection.confirmTransaction(signature, 'confirmed');
	return signature;
};

export const verifyWallet = async () => {
	await connectWallet();
	const message = `Please verify this wallet belongs to you.`; // Include nonce
	const encodedMessage = new TextEncoder().encode(message);

	try {
		const { signature, publicKey } = await window.solana.signMessage(
			encodedMessage
		);
		return JSON.stringify({
			publicKey: publicKey.toBase58(),
			signedMessage: Buffer.from(encodedMessage).toString('base64'),
			signature: Buffer.from(signature).toString('base64'),
		});
	} catch (err) {
		console.log('Failed to sign message', err);
		return '';
	}
};

export const signIn = async (newSession?: boolean) => {
	const onFetchFail = () => {
		storage.set(SOLANA_AUTH_STORAGE_KEY, '');
		return null;
	};
	try {
		let solanaAuth = '';
		if (newSession) solanaAuth = await verifyWallet();
		const data = await api.user.verify({
			solanaAuth,
		});
		if (data && data.userId) {
			storage.set(SOLANA_AUTH_STORAGE_KEY, '1');
			return { id: data.userId };
		} else onFetchFail();
	} catch (err) {
		onFetchFail();
	}
};
