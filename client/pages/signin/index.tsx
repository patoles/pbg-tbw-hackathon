import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Helmet } from 'react-helmet';
import { getUrlParam, getSignupPath } from '@/utils';

import styles from './index.module.css';

const SignInPage = () => {
	const gameId = getUrlParam('game');

	return (
		<div className={styles.signInPage}>
			<Helmet>
				<link rel="canonical" href={`https://pixelbrawlgames.com/sign-in`} />
			</Helmet>
			<SignIn
				routing="path"
				path={'/sign-in'}
				redirectUrl={`/game${gameId ? `/${gameId}` : ''}`}
				signUpUrl={getSignupPath(gameId)}
			/>
		</div>
	);
};

export default SignInPage;
