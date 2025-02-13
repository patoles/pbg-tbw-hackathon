import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { UserButton } from '@/components/ui/session';
import useUser from '@/hooks/use-user';
import Logo from '@/components/ui/logo';
import config from '@/config';
import { THomePage, TWebsiteGameConfig } from '@/models';
import { createAudioContext } from '@/utils/audio';
import CreateRoomModal from './components/create-room-modal';
import HomeMenu, { HomeMenuElement } from './components/home-menu';
import { getSigninPath } from '@/utils';
import Loader from '@/components/ui/loader';

import styles from './index.module.css';

const PAGE_ID = 'home';

const HomePage = () => {
	const params = useParams();
	const { user, isLoaded } = useUser();
	const [showPopup, setShowPopup] = useState<boolean>(false);

	const { gameId = '' } = params;

	const globalConfig = useMemo<TWebsiteGameConfig | null>(() => {
		let _config: any = null;
		if (gameId && config.games[gameId]) {
			_config = config.games[gameId];
		}
		return _config;
	}, [gameId]);

	const pageConfig = useMemo<THomePage | null>(() => {
		let _config: any = null;
		if (gameId && config.games[gameId] && config.games[gameId][PAGE_ID]) {
			_config = config.games[gameId][PAGE_ID];
		}
		return _config;
	}, [gameId]);

	const gameInfo = useMemo<any>(() => {
		return gameId && config.games[gameId] ? config.games[gameId].info : {};
	}, [gameId]);

	const menuElements = useMemo<HomeMenuElement[]>(() => {
		const _elements: HomeMenuElement[] = [];
		if (pageConfig?.showRanking) {
			_elements.push({
				icon: 'https://res.cloudinary.com/dxlvclh9c/image/upload/v1730097330/pixelbrawlgames/icon/rank_white_icon.png',
				label: 'Ranks',
				link: `ranking`,
			});
		}
		if (pageConfig?.showShop && isLoaded) {
			_elements.push({
				icon: 'https://res.cloudinary.com/dxlvclh9c/image/upload/v1730096867/pixelbrawlgames/icon/hanger_white_icon.png',
				label: 'Shop',
				link: user ? `shop` : getSigninPath(gameId),
			});
		}
		return _elements;
	}, [pageConfig, isLoaded]);

	return (
		<div
			className={`${styles.homePage} rolling-bg`}
			style={
				gameInfo && gameInfo.background
					? { backgroundImage: `url("${gameInfo.background}")` }
					: {}
			}
		>
			<Helmet>
				<title>{gameInfo.name}</title>
				<meta name="description" content={gameInfo.description} />
				<link
					rel="canonical"
					href={`https://pixelbrawlgames.com/game/${gameId}`}
				/>
			</Helmet>
			<Loader loading={!isLoaded} style={{ backgroundColor: '#000' }} />
			<CreateRoomModal
				gameId={gameId || ''}
				show={showPopup}
				canBet={globalConfig?.canBet}
				onClose={() => setShowPopup(false)}
			/>
			<UserButton gameId={gameId} userId={user ? user.id : ''} />
			<Logo
				label={gameInfo.name}
				className="balance"
				style={{ margin: '6rem 0 0' }}
			/>
			{isLoaded && globalConfig ? (
				<div className={styles.btnGroup}>
					{globalConfig?.isLocal ? (
						<div className={styles.btnWrapper}>
							<Link
								to={`r/play`}
								className={styles.btn}
								style={{
									backgroundImage: `url('${
										pageConfig && pageConfig.playBackground
											? pageConfig.playBackground
											: ''
									}')`,
								}}
								onClick={() => {
									createAudioContext();
								}}
							>
								{user ? 'Play' : 'Play as Guest'}
							</Link>
						</div>
					) : null}
					{globalConfig?.isOnline ? (
						<div className={styles.btnWrapper}>
							<Link
								to={`r`}
								className={styles.btn}
								style={{
									backgroundImage: `url('${
										pageConfig && pageConfig.playBackground
											? pageConfig.playBackground
											: ''
									}')`,
								}}
								onClick={() => {
									createAudioContext();
								}}
							>
								Multiplayer
							</Link>
							{/*<div
								className={styles.btnTool}
								onClick={() => {
									setShowPopup(true);
									createAudioContext();
								}}
							>
								<div className={styles.btnToolIcon} />
							</div>*/}
						</div>
					) : null}
					{globalConfig?.canBet ? (
						<div className={styles.btnWrapper}>
							<div
								className={styles.btn}
								onClick={() => {
									setShowPopup(true);
									createAudioContext();
								}}
								style={{
									backgroundImage: `url('https://res.cloudinary.com/dxlvclh9c/image/upload/v1716816926/pixelbrawlgames/img/ui_button_green_bg.png')`,
								}}
							>
								Bet Solana Token
							</div>
						</div>
					) : null}
				</div>
			) : null}
			<HomeMenu elements={menuElements} />
		</div>
	);
};

export default HomePage;
