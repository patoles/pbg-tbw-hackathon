import { FC, PropsWithChildren, CSSProperties } from 'react';

import styles from './index.module.css';

interface P extends PropsWithChildren {
	className?: string;
	style?: CSSProperties;
}
const Container: FC<P> = ({ children, className, style }) => {
	return (
		<div className={`${styles.container} ${className}`} style={style}>
			{children}
		</div>
	);
};

export default Container;
