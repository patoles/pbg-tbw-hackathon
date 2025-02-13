import React, { FC, useState, useEffect, ReactNode } from 'react';
import Popup from '@/components/ui/popup';

import styles from './index.module.css';

interface P {
	show?: boolean;
	content: ReactNode;
	showInput?: boolean;
	inputPlaceholder?: string;
	cancelText?: string;
	confirmText?: string;
	showCancel?: boolean;
	showConfirm?: boolean;
	onCancel?: () => void;
	onConfirm?: (inputValue?: string) => void;
}
const Modal: FC<P> = ({
	show,
	content,
	showInput,
	inputPlaceholder,
	cancelText,
	confirmText,
	showCancel = true,
	showConfirm = true,
	onCancel,
	onConfirm,
}) => {
	const [inputValue, setInputValue] = useState<string>('');

	useEffect(() => {
		setInputValue('');
	}, []);

	const handleConfirm = () => {
		onConfirm && onConfirm(inputValue);
		setInputValue('');
	};

	return (
		<Popup show={show} className={styles.modal} onClose={onCancel}>
			<div className={styles.content}>{content}</div>
			{showInput ? (
				<input
					type="text"
					className={styles.input}
					placeholder={inputPlaceholder}
					onChange={(e) => setInputValue(e.target.value)}
				/>
			) : null}
			<div className={styles.actions}>
				{onCancel && showCancel ? (
					<button
						className={`${styles.actionBtn} ${styles.cancel}`}
						onClick={onCancel}
					>
						{cancelText || 'Cancel'}
					</button>
				) : null}
				{onConfirm && showConfirm ? (
					<button
						className={`${styles.actionBtn} ${styles.confirm}`}
						onClick={handleConfirm}
					>
						{confirmText || 'OK'}
					</button>
				) : null}
			</div>
		</Popup>
	);
};

export default Modal;
