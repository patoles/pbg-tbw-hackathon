import React, { useEffect, useState } from 'react';
import Modal from '@/components/ui/modal';
import Page from '@/components/ui/page';
import SmallCard from '@/components/ui/small-card';

import styles from './index.module.css';

const SocialPage = () => {
	const [showPopup, setShowPopup] = useState<boolean>(false);
	const [isSent, setIsSent] = useState<boolean>(false);

	useEffect(() => {
		setShowPopup(false);
		setIsSent(false);
	}, []);

	const closePopup = () => {
		setShowPopup(false);
		setIsSent(false);
	};
	const sendInvitation = (value?: string) => {
		console.log(`Send invite to ${value}`);
		setIsSent(true);
	};

	return (
		<Page
			className={styles.socialPage}
			contentClassName={styles.content}
			title={'Friends'}
			showBack
		>
			<ul className={styles.nav}>
				<li
					className={`${styles.navItem} ${styles.btn}`}
					onClick={() => setShowPopup(true)}
				>
					Add Friend
				</li>
			</ul>
			<div className={styles.list}>
				<SmallCard username={'Username'} />
				<SmallCard username={'Username'} />
				<SmallCard username={'Username'} />
				<SmallCard username={'Username'} />
				<SmallCard username={'Username'} />
			</div>
			<Modal
				show={showPopup}
				content={!isSent ? 'Invite your friend:' : 'Invitation sent!'}
				inputPlaceholder="Friend's #ID"
				showInput={!isSent}
				cancelText="Cancel"
				confirmText="Send"
				showCancel={!isSent}
				showConfirm={!isSent}
				onCancel={closePopup}
				onConfirm={sendInvitation}
			/>
		</Page>
	);
};

export default SocialPage;
