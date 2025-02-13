import { CSSProperties, FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './index.module.css';

interface P {
	className?: string;
	style?: CSSProperties;
	link?: string;
	children?: ReactNode;
}
const Card: FC<P> = ({ className, style, link, children }) => {
	return link ? (
		<Link
			to={link || ''}
			className={`${styles.card} ${className ? className : ''}`}
			style={style}
		>
			{children}
		</Link>
	) : (
		<div
			className={`${styles.card} ${className ? className : ''}`}
			style={style}
		>
			{children}
		</div>
	);
};

export default Card;
