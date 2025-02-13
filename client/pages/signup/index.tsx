import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { Helmet } from 'react-helmet';
import { getUrlParam, getSigninPath } from '@/utils';

import styles from './index.module.css';

const SignUpPage = () => {
	const gameId = getUrlParam('game');

	return (
		<div className={styles.signUpPage}>
			<Helmet>
				<link rel="canonical" href={`https://pixelbrawlgames.com/sign-up`} />
			</Helmet>
			<SignUp
				routing="path"
				path={'/sign-up'}
				redirectUrl={`/game${gameId ? `/${gameId}` : ''}`}
				signInUrl={getSigninPath(gameId)}
			/>
		</div>
	);
};

export default SignUpPage;
