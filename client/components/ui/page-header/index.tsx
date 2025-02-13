import React, { FC } from 'react';
import { Link } from 'react-router-dom';

import styles from './index.module.css';

interface P {
	title?: string;
	showBack?: boolean;
}
const PageHeader: FC<P> = ({ title, showBack }) => {
	return (
		<div className={styles.pageHeader}>
			{showBack ? (
				<Link to=".." relative="path" className={styles.backBtn} />
			) : null}
			<span className={styles.title}>{title}</span>
		</div>
	);
};

export default PageHeader;
