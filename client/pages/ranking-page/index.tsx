import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import useFetch from '@/hooks/use-fetch';
import Page from '@/components/ui/page';
import SmallCard from '@/components/ui/small-card';
import Loader from '@/components/ui/loader';
import { IGameRankingWithPublicUser } from '@/models';

import api from '@/api';

import styles from './index.module.css';

const COLUMN_SIZE = 6;

const RankingPage = () => {
	const params = useParams();
	const { gameId = '' } = params;

	const rankingRequest = useFetch<IGameRankingWithPublicUser[]>(
		api.game.findRanking,
		gameId,
		!!gameId,
		[gameId]
	);

	const ranking = useMemo<IGameRankingWithPublicUser[]>(() => {
		return rankingRequest.data || [];
	}, [rankingRequest.data]);

	const rankingCol = useMemo<IGameRankingWithPublicUser[][]>(() => {
		const _columns: any[][] = [];
		let _col: any[] = [];
		(ranking || []).forEach((item, index) => {
			_col.push(item);
			if ((index + 1) % COLUMN_SIZE === 0 || index + 1 === ranking.length) {
				_columns.push(JSON.parse(JSON.stringify(_col)));
				_col = [];
			}
		});
		return _columns;
	}, [ranking]);

	return (
		<Page title={'Ranking'} showBack>
			<Helmet>
				<link
					rel="canonical"
					href={`https://pixelbrawlgames.com/game/${gameId}/ranking`}
				/>
			</Helmet>
			<Loader loading={rankingRequest.loading} />
			<div className={styles.listContainer}>
				<div className={styles.list}>
					{rankingCol.map((col, colIndex) => (
						<div className={styles.column} key={colIndex}>
							{col.map((item, itemIndex) => (
								<SmallCard
									rank={COLUMN_SIZE * colIndex + itemIndex + 1}
									username={item.user.username}
									score={item.score}
									key={itemIndex}
								/>
							))}
						</div>
					))}
					<div className={styles.listSpace} />
				</div>
			</div>
		</Page>
	);
};

export default RankingPage;
