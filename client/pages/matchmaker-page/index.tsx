import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { PublicKey } from '@solana/web3.js';
import Page from '@/components/ui/page';
import SmallCard from '@/components/ui/small-card';
import Loader from '@/components/ui/loader';
import gameMonitor from '@shared/smart-contract/solana/game-monitor';
import * as SolanaSnakeContract from '@shared/smart-contract/solana/wrappers';
import * as SolanaUtils from '@/utils/web3/solana';
import {
	decimalToUnit,
	findMintLabel,
} from '@shared/smart-contract/solana/utils';
import api from '@/api';

import styles from './index.module.css';

const COLUMN_SIZE = 6;

const MatchmakerPage = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState<boolean>(true);
	const [games, setGames] = useState<any[]>([]);
	const [solanaWallet, setSolanaWallet] = useState<string>('');
	const params = useParams();
	const { gameId = '' } = params;

	useEffect(() => {
		setLoading(true);
		const updateGames = async () => {
			try {
				const activeGames = await gameMonitor.getAllGames();
				setGames(activeGames || []);
			} catch (err) {
				console.log('Fetching Games error.');
			} finally {
				setLoading(false);
			}
		};
		(async () => {
			await updateGames();
		})();
		const interval = setInterval(updateGames, 10000);
		return () => {
			if (interval) clearInterval(interval);
		};
	}, []);

	useEffect(() => {
		(async () => {
			const userWallet = await SolanaUtils.connectWallet();
			setSolanaWallet(userWallet || '');
		})();
	}, []);

	const gamesCol = useMemo<any[][]>(() => {
		const _columns: any[][] = [];
		let _col: any[] = [];
		const filteredGames = (games || []).filter((_game) => {
			const isExpired = new Date(_game.expiresAt) < new Date();
			if (!solanaWallet) {
				return _game.state === 'Created' && !isExpired;
			} else {
				return (
					(!isExpired || (isExpired && _game.player1 === solanaWallet)) &&
					(_game.state === 'Created' ||
						(_game.state === 'InProgress' &&
							(_game.player1 === solanaWallet ||
								_game.player2 === solanaWallet)))
				);
			}
		});
		filteredGames.forEach((item, index) => {
			_col.push(item);
			if (
				(index + 1) % COLUMN_SIZE === 0 ||
				index + 1 === filteredGames.length
			) {
				_columns.push(JSON.parse(JSON.stringify(_col)));
				_col = [];
			}
		});
		return _columns;
	}, [games, solanaWallet]);

	const handleJoinGame = async (item: any) => {
		if (solanaWallet) {
			setLoading(true);
			let _user = await SolanaUtils.signIn();
			if (!_user) {
				_user = await SolanaUtils.signIn(true);
			}
			if (_user) {
				try {
					const _res = await api.game.joinRoom(
						gameId,
						solanaWallet,
						item.player1
					);
					if (_res && _res.roomId) {
						navigate(`/game/${gameId}/r/${_res.roomId}`);
					}
				} catch (err) {}
			}
			setLoading(false);
		}
	};
	const handleWithdrawGame = async (item: any) => {
		const res = await SolanaSnakeContract.withdrawTimeout(
			new PublicKey(item.mint)
		);
		console.log(res, 'withdraw success');
	};

	return (
		<Page title={'Matchmaker'} showBack>
			<Helmet>
				<link
					rel="canonical"
					href={`https://pixelbrawlgames.com/game/${gameId}/matchmaker`}
				/>
			</Helmet>
			<Loader loading={loading} />
			{solanaWallet ? (
				<div className={styles.listContainer}>
					<div className={styles.list}>
						{gamesCol.map((col, colIndex) => (
							<div className={styles.column} key={colIndex}>
								{col.map((item, itemIndex) => (
									<div key={itemIndex}>
										<SmallCard
											rank={COLUMN_SIZE * colIndex + itemIndex + 1}
											username={`${
												(item.player1 ? 1 : 0) + (item.player2 ? 1 : 0)
											}/2 Players`}
											score={`${decimalToUnit(
												item.betAmount,
												item.mint
											)} ${findMintLabel(item.mint)}`}
											onClick={() => handleJoinGame(item)}
										/>
										{solanaWallet === item.player1 &&
										new Date(item.expiresAt) < new Date() ? (
											<div onClick={() => handleWithdrawGame(item)}>
												WITHDRAW
											</div>
										) : null}
									</div>
								))}
							</div>
						))}
						<div className={styles.listSpace} />
					</div>
				</div>
			) : null}
		</Page>
	);
};

export default MatchmakerPage;
