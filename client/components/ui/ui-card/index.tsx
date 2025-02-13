import React, { FC, CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import styles from './index.module.css';

interface P {
	link?: string;
	target?: '_blank' | undefined;
	title?: string;
	largeH?: boolean;
	largeW?: boolean;
	smallW?: boolean;
	bg?: string;
	description?: string;
	fillBg?: boolean;
	style?: CSSProperties;
	onClick?: () => void;
}

export const UICard: FC<P> = ({
	link,
	target,
	title,
	largeH,
	largeW,
	smallW,
	bg,
	description,
	fillBg,
	style,
	onClick,
}) => {
	return (
		<Link
			to={link || ''}
			className={`${styles.uiCard} ${largeH ? styles.lh : ''} ${
				largeW ? styles.lw : ''
			} ${smallW ? styles.sw : ''}`}
			target={target}
			onClick={onClick}
			style={style}
		>
			<div className={`${styles.content} ${!bg ? styles.noBackground : ''}`}>
				{bg ? (
					<div
						className={`${styles.bg} ${fillBg ? styles.fillBackground : ''}`}
						style={{ backgroundImage: `url(${bg})` }}
					/>
				) : null}
				{title ? (
					<div className={styles.titleContainer}>
						<h2 className={styles.title}>{title}</h2>
					</div>
				) : null}
			</div>
			{description ? (
				<div className={styles.description}>{description}</div>
			) : null}
		</Link>
	);
};

interface UICardGroupP {
	children: React.ReactNode;
}
export const UICardGroup: FC<UICardGroupP> = ({ children }) => {
	return <div className={styles.uiCardGroup}>{children}</div>;
};

interface UICardContainerP {
	children: React.ReactNode;
	style?: CSSProperties;
	className?: string;
}
export const UICardContainer: FC<UICardContainerP> = ({
	children,
	style,
	className,
}) => {
	return (
		<div className={`${styles.uiCardContainer} ${className}`} style={style}>
			{children}
		</div>
	);
};
