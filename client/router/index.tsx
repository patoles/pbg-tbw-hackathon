import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import LandingPage from '@/pages/landing-page';
import HomePage from '@/pages/home-page';
import GamePage from '@/pages/game-page';
import SignInPage from '@/pages/signin';
import SignUpPage from '@/pages/signup';
import RankingPage from '@/pages/ranking-page';
import MatchmakerPage from '@/pages/matchmaker-page';
import ShopPage from '@/pages/shop-page';
import SocialPage from '@/pages/social-page';
import TCPage from '@/pages/tc-page';

const config = [
	{
		path: '/',
		element: <LandingPage />,
	},
	{
		path: '/game/:gameId',
		element: <HomePage />,
	},
	{
		path: '/game/:gameId/ranking',
		element: <RankingPage />,
	},
	{
		path: '/game/:gameId/matchmaker',
		element: <MatchmakerPage />,
	},
	{
		path: '/game/:gameId/shop',
		element: <ShopPage />,
	},
	{
		path: '/game/:gameId/r/:roomId',
		element: <GamePage />,
	},
	{
		path: '/game/:gameId/r',
		element: <GamePage />,
	},
	{
		path: '/social',
		element: <SocialPage />,
	},
	{
		path: '/sign-in/*',
		element: <SignInPage />,
	},
	{
		path: '/sign-up/*',
		element: <SignUpPage />,
	},
	{
		path: '/terms',
		element: <TCPage />,
	},
	{
		path: '/*',
		element: <Navigate to="/" replace />,
	},
];

const router = createBrowserRouter(config);

export default router;
