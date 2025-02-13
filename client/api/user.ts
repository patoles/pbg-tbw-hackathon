import request from '@/utils/request';
import { TUser, ICryptoTransactionInfo } from '@/models';

export const get = async (): Promise<TUser | null> => {
	const res = await request.get('/api/user');
	const { data } = await res.json();
	return data;
};

export const getWithInventory = async () => {
	const response = await request.get('/api/user-inventory');
	const { data } = await response.json();
	return data;
};

export const verify = async (options?: {
	tgAuthResult?: string;
	solanaAuth?: string;
}): Promise<{ userId: string } | undefined> => {
	const res = await request.post('/api/user/verify', {}, options || {});
	const { data } = await res.json();
	return data;
};

export const signOut = async (): Promise<any> => {
	const res = await request.get('/api/user/sign-out');
	const { data } = await res.json();
	return data;
};

export const equip = async (itemId: string): Promise<TUser | null> => {
	const res = await request.put('/api/user/inventory/equip', {}, { itemId });
	const { data } = await res.json();
	return data;
};

export const unequip = async (itemId: string): Promise<TUser | null> => {
	const res = await request.delete(
		'/api/user/inventory/unequip',
		{},
		{ itemId }
	);
	const { data } = await res.json();
	return data;
};

export const updated = async (timestamp: number): Promise<boolean> => {
	const res = await request.post('/api/user/updated', {}, { timestamp });
	const { data } = await res.json();
	return !!data.updated;
};

export const connectWalletTON = async (walletAddress: string): Promise<any> => {
	const res = await request.post(
		'/api/user/connect-wallet',
		{},
		{ walletAddress }
	);
	const { data } = await res.json();
	return data;
};

export const buyCoin = async (
	amount: number
): Promise<ICryptoTransactionInfo> => {
	const res = await request.post('/api/user/buy-coin', {}, { amount });
	const { data } = await res.json();
	return data;
};
