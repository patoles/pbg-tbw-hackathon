import { FC, useState, useEffect } from 'react';
import { useClerk } from '@clerk/clerk-react';
import {
	isTelegramSignedIn,
	isTelegram,
	signOutTelegram,
	signOutSolana,
	isSolanaSignedIn,
	hasPhantom,
} from '@/utils';
import { getTelegramAuthPath, getSigninPath } from '@/utils';
import { SignedIn } from '../signed-in';
import { SignedOut } from '../signed-out';
import api from '@/api';
import useFetch from '@/hooks/use-fetch';
import { TUser } from '@/models';
import * as solanaUtils from '@/utils/web3/solana';

import styles from './index.module.css';

interface P {
	gameId?: string;
	userId?: string;
}
export const UserButton: FC<P> = ({ gameId, userId }) => {
	const handleClickHome = () => {
		if (!isTelegram() && window.location.href !== `${window.location.origin}/`)
			window.location.href = window.location.origin;
	};

	return (
		<div className={styles.userBtnContainer}>
			<div className={styles.homeBtn} onClick={handleClickHome} />
			<UserInfoButton gameId={gameId} userId={userId} />
		</div>
	);
};

const UserInfoButton: FC<P> = ({ gameId, userId }) => {
	const [showDropdown, setShowDropdown] = useState<boolean>(false);
	const [userInfo, setUserInfo] = useState<TUser | null>(null);
	const { openUserProfile, signOut } = useClerk();

	const userRequest = useFetch<TUser>(api.user.get, null, !!userId, [userId]);

	useEffect(() => {
		if (userRequest.data) setUserInfo(userRequest.data);
	}, [userRequest.data]);

	const handleManageAccount = () => {
		openUserProfile();
	};
	const handleSignOut = async () => {
		if (isTelegramSignedIn()) {
			signOutTelegram();
		} else if (isSolanaSignedIn()) {
			signOutSolana();
		} else {
			signOut();
			window.location.reload();
		}
		await api.user.signOut();
	};
	const handleSignInWithTelegram = () => {
		window.location.href = getTelegramAuthPath(gameId);
	};
	const handleSignIn = () => {
		window.location.href = getSigninPath(gameId);
	};
	const handleSignInWithPhantom = async () => {
		await solanaUtils.signIn(true);
		window.location.reload();
	};

	return (
		<div className={styles.userInfoBtn}>
			{userInfo ? (
				<SignedIn>
					<button
						className={styles.username}
						onClick={() => setShowDropdown(!showDropdown)}
						onBlur={() => setShowDropdown(false)}
					>
						{isTelegramSignedIn() ? userInfo.firstName : userInfo.username}
						{showDropdown ? (
							<div className={styles.dropdown}>
								{isTelegramSignedIn() ||
								isTelegram() ||
								isSolanaSignedIn() ? null : (
									<div
										className={styles.dropdownOption}
										onClick={handleManageAccount}
									>
										Manage account
									</div>
								)}
								{!isTelegram() ? (
									<div
										className={styles.dropdownOption}
										onClick={handleSignOut}
									>
										Sign out
									</div>
								) : null}
							</div>
						) : null}
					</button>
					{/*gameId ? (
						<Link to={`/game/${gameId}/shop`}>
							<div className={styles.coins}>{userInfo.coins}</div>
						</Link>
					) : (
						<div className={styles.coins}>{userInfo.coins}</div>
					)*/}
				</SignedIn>
			) : null}
			<SignedOut>
				<button
					className={styles.username}
					onClick={() => setShowDropdown(!showDropdown)}
					onBlur={() => setShowDropdown(false)}
				>
					Sign In
					{showDropdown ? (
						<div className={styles.dropdown}>
							<div
								className={styles.dropdownOption}
								onClick={handleSignInWithTelegram}
							>
								Sign In with Telegram
							</div>
							<div className={styles.dropdownOption} onClick={handleSignIn}>
								Sign In / Sign Up
							</div>
							{hasPhantom() ? (
								<div
									className={styles.dropdownOption}
									onClick={handleSignInWithPhantom}
								>
									Sign In with Phantom
								</div>
							) : null}
						</div>
					) : null}
				</button>
			</SignedOut>
		</div>
	);
};
