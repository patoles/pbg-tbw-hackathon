import { useGameStore } from '@/stores/game';
import InfoMessage from './components/info-message';
import MessageBox from './components/message-box';

import styles from './index.module.css';

const MessageHandler = () => {
	const message = useGameStore((state) => state.message);

	return (
		<div className={styles.messageHandler}>
			{message && message.type === 'info' ? (
				<InfoMessage message={message} />
			) : null}
			<MessageBox message={message} />
		</div>
	);
};

export default MessageHandler;
