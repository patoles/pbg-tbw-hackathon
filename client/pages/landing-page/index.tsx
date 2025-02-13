import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { UserButton } from '@/components/ui/session';
import Container from '@/components/ui/container';
import Card from './components/card';
import { TUser } from '@/models';
import config from '@/config';
import useUser from '@/hooks/use-user';
import useFetch from '@/hooks/use-fetch';
import api from '@/api';

import styles from './index.module.css';

const LandingPage = () => {
	const { user } = useUser();
	const [userInfo, setUserInfo] = useState<TUser | null>(null);

	const userRequest = useFetch<TUser>(api.user.get, null, !!(user && user.id), [
		user,
	]);

	useEffect(() => {
		if (userRequest.data) setUserInfo(userRequest.data);
	}, [userRequest.data]);

	return (
		<div className={styles.landingPage}>
			<Helmet>
				<title>{config.title}</title>
				<meta name="description" content={config.description} />
				<link rel="canonical" href="https://pixelbrawlgames.com" />
			</Helmet>
			<div className={styles.head}>
				<UserButton userId={user ? user.id : ''} />
			</div>
			<Container className={styles.content}>
				{userInfo ? (
					<>
						<Card>
							<div className={styles.leftColumn}>
								<div className={styles.cardTitle}>
									{userInfo.firstName || userInfo.clerkUserId.slice(0, 5)}
								</div>
								<div className={`${styles.cardText} ${styles.specialA}`}>
									{userInfo.coins} coins
								</div>
							</div>
							<div className={styles.rightColumn}>
								{/*<div className={styles.cardText}>Lv 0</div>*/}
							</div>
						</Card>
						{/*<Card className={styles.specialA}>
							<div className={styles.cardTitle}>Global Ranking</div>
							<div className={`${styles.cardText} ${styles.specialA}`}>
								You are currently #1234 !
							</div>
						</Card>*/}
					</>
				) : null}
				<div className={styles.sectionTitle}>Games</div>
				{Object.keys(config.games).map((gameId, index) => {
					//if (gameId === 'snake') return null;
					const game = config.games[gameId];
					return (
						<Card
							link={`/game/${gameId}`}
							style={{
								backgroundImage: `url('${game.info.cover}')`,
								height: '10rem',
							}}
							key={index}
						>
							<div className={styles.cardTitleCover}>{game.info.name}</div>
						</Card>
					);
				})}
				<div className={styles.foot}>
					{/*<a
						href={'https://pixelbrawlgames.com/blog'}
						className={styles.footItem}
					>
						BLOG
					</a>*/}
				</div>
			</Container>
		</div>
	);
};

export default LandingPage;
