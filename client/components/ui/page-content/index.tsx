import React, { FC, ReactNode } from 'react';

import styles from './index.module.css';

interface P {
	className?: string;
	children?: ReactNode;
}
const PageContent: FC<P> = ({ className, children }) => {
	return (
		<div className={`${styles.pageContent} ${className ? className : ''}`}>
			{children}
		</div>
	);
};

export default PageContent;
