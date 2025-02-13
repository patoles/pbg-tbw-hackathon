import { FC, CSSProperties } from 'react';
import ModalContainer from '../modal-container';

import styles from './index.module.css';

interface P {
	loading?: boolean;
	style?: CSSProperties;
}
const Loader: FC<P> = ({ loading, style }) => {
	return (
		<ModalContainer show={loading} className={styles.loader} style={style}>
			<div className={styles.loaderRipple}>
				<div></div>
				<div></div>
			</div>
		</ModalContainer>
	);
};

export default Loader;
