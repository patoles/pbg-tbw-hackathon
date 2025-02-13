import { FC, useEffect, useState, useRef } from 'react';
import { TMessage } from '@/models';
import { UI_MESSAGE_DURATION } from '@/const';

import styles from './index.module.css';

interface P {
	message: TMessage;
}
const InfoMessage: FC<P> = ({ message }) => {
	const [show, setShow] = useState<boolean>(true);
	const [msg, setMsg] = useState<TMessage | null>(null);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (
			message &&
			message.type === 'info' &&
			message.id !== msg?.id &&
			Date.now() - message.created < UI_MESSAGE_DURATION
		) {
			setMsg(message);
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
			if (message.duration !== -1) {
				timeoutRef.current = setTimeout(() => {
					setShow(false);
				}, message.duration || UI_MESSAGE_DURATION);
			}
		}
	}, [message]);

	useEffect(() => {
		if (!show) {
			setTimeout(() => {
				setMsg(null);
				setTimeout(() => {
					setShow(true);
				}, 50);
			}, 200);
		}
	}, [show]);

	return msg && msg.text ? (
		<div className={`${styles.infoMessage} ${show ? styles.show : ''}`}>
			{msg.text}
		</div>
	) : null;
};

export default InfoMessage;
