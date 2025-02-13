import React, { CSSProperties, FC } from 'react';

import styles from './index.module.css';

interface P {
	label?: string;
	className?: string;
	style?: CSSProperties;
}
const Logo: FC<P> = ({ label, className, style }) => {
	return (
		<div
			className={`${styles.logoContainer} ${className ? className : ''}`}
			style={style}
		>
			<div className={styles.logo}>
				<h1 className={styles.logoText}>{label ? label : ''}</h1>
			</div>
		</div>
	);
};

export default Logo;
