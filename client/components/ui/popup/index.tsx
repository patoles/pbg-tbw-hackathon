import React, { FC } from 'react';
import ModalContainer from '../modal-container';
import styles from './index.module.css';

interface P {
	show?: boolean;
	className?: string;
	style?: React.CSSProperties;
	children?: React.ReactNode;
	noOverlay?: boolean;
	onClose?: () => void;
}
const Popup: FC<P> = ({
	show,
	children,
	noOverlay,
	className,
	style,
	onClose,
}) => {
	const handleClose = () => {
		onClose && onClose();
	};

	return (
		<ModalContainer show={show} className={styles.popup} style={style}>
			{!noOverlay ? (
				<div className={styles.overlay} onClick={handleClose} />
			) : null}
			<div
				className={`${styles.popupModal} ${
					className ? className : styles.defaultModal
				}`}
			>
				{children}
			</div>
		</ModalContainer>
	);
};

export default Popup;
