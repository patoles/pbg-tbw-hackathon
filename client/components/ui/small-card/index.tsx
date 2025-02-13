import React, { FC } from 'react';

import styles from './index.module.css';

interface P {
	rank?: number;
	username?: string;
	score?: number | string;
	onClick?: () => void;
}
const SmallCard: FC<P> = ({ rank, username, score, onClick }) => {
	return (
		<div className={styles.smallCard} onClick={onClick}>
			{rank ? <div className={styles.rank}>{rank}</div> : null}
			{username ? <div className={styles.username}>{username}</div> : null}
			{score || score === 0 ? (
				<div className={styles.score}>{score}</div>
			) : null}
		</div>
	);
};

export default SmallCard;
