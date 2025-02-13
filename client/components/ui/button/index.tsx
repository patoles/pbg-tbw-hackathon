import React, { FC, ReactNode, useMemo } from 'react';

import styles from './index.module.css';

interface P {
	type: 'disabled' | 'green' | 'red' | 'gold' | 'blue';
	children?: ReactNode;
	onClick?: () => void;
}
const Button: FC<P> = ({ type, children, onClick }) => {
	const typeClass = useMemo<string>(() => {
		let _type = '';
		if (type === 'disabled') _type = styles.disabled;
		else if (type === 'green') _type = styles.green;
		else if (type === 'red') _type = styles.red;
		else if (type === 'gold') _type = styles.gold;
		else if (type === 'blue') _type = styles.blue;
		return _type;
	}, [type]);

	return (
		<button className={`${styles.button} ${typeClass}`} onClick={onClick}>
			{children}
		</button>
	);
};

export default Button;
