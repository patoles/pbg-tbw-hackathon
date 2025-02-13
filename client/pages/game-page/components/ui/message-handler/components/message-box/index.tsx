import { FC, useEffect, useState, useMemo } from 'react';
import { TMessage } from '@/models';
import {
	MESSAGE_BOX_MAX_ELEMENT,
	MESSAGE_BOX_MESSAGE_DURATION,
	SERVER_ID,
} from '@/const';

import styles from './index.module.css';

interface P {
	message: TMessage | null;
}
const MessageBox: FC<P> = ({ message }) => {
	const [msgs, setMsgs] = useState<TMessage[]>([]);

	useEffect(() => {
		if (message && message.type === 'message') {
			if (!msgs.find((item) => item.id === message.id)) {
				const updatedMsg = JSON.parse(JSON.stringify(msgs));
				if (updatedMsg.length >= MESSAGE_BOX_MAX_ELEMENT)
					updatedMsg.splice(0, 1);
				updatedMsg.push(message);
				setMsgs(updatedMsg);
			}
		}
	}, [message]);

	const clearMessage = (messageId: string) => {
		setMsgs((msgs) => {
			return msgs.filter((item) => item.id !== messageId);
		});
	};

	return msgs.length ? (
		<div className={styles.messageBox}>
			{(msgs || []).map((msg) => (
				<MessageBoxEntry
					message={msg}
					key={msg.id}
					onClear={() => clearMessage(msg.id)}
				/>
			))}
		</div>
	) : null;
};

const MessageBoxEntry: FC<
	P & {
		onClear: () => void;
	}
> = ({ message, onClear }) => {
	useEffect(() => {
		const timeout = setTimeout(() => {
			onClear();
		}, MESSAGE_BOX_MESSAGE_DURATION);
		return () => {
			clearTimeout(timeout);
		};
	}, []);

	const formatedMsg = useMemo<string>(() => {
		if (!message) return '';
		else
			return `${message.owner !== SERVER_ID ? `${message.owner}: ` : ''}${
				message.text
			}`;
	}, [message]);

	return formatedMsg ? (
		<div className={styles.messageEntry}>{formatedMsg}</div>
	) : null;
};

export default MessageBox;
