import { useState, useEffect } from 'react';
import { useUser as useUserClerk } from '@clerk/clerk-react';
import {
	isTelegramSignedIn,
	getURLhash,
	hasPhantom,
	isSolanaSignedIn,
} from '@/utils';
import { TELEGRAM_AUTH_STORAGE_KEY } from '@/const';
import * as storage from '@/utils/storage';
import * as solanaUtils from '@/utils/web3/solana';
import api from '@/api';

const useUser = () => {
	const [isLoaded, setIsLoaded] = useState<boolean>(false);
	const [user, setUser] = useState<{ id: string } | undefined>(undefined);
	const [canFetchClerk, setCanFetchClerk] = useState<boolean>(false);
	const clerkUser = useUserClerk();

	useEffect(() => {
		const tgAuthResult = getURLhash('tgAuthResult');

		const fetchTelegramUser = async () => {
			const onFetchFail = () => {
				storage.set(TELEGRAM_AUTH_STORAGE_KEY, '');
			};
			try {
				const data = await api.user.verify({ tgAuthResult });
				if (data && data.userId) {
					setUser({ id: data.userId });
					storage.set(TELEGRAM_AUTH_STORAGE_KEY, '1');
				} else onFetchFail();
			} catch (err) {
				onFetchFail();
			} finally {
				setIsLoaded(true);
			}
		};

		const fetchSolanaUser = async () => {
			try {
				const _user = await solanaUtils.signIn();
				if (_user) setUser(_user);
			} catch (err) {
			} finally {
				setIsLoaded(true);
			}
		};

		if (hasPhantom() && isSolanaSignedIn()) fetchSolanaUser();
		else if (isTelegramSignedIn() || tgAuthResult) fetchTelegramUser();
		else setCanFetchClerk(true);
	}, []);

	useEffect(() => {
		if (canFetchClerk && clerkUser.isLoaded) {
			if (clerkUser.user) {
				setUser(clerkUser.user);
			}
			setIsLoaded(true);
		}
	}, [clerkUser.isLoaded, clerkUser.user, canFetchClerk]);

	return { isLoaded, user };
};

export default useUser;
