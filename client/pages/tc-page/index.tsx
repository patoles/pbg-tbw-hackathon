import React from 'react';
import { Helmet } from 'react-helmet';
import config from '@/config';

import styles from './index.module.css';

const TCPage = () => {
	return (
		<div className={styles.tcPage}>
			<Helmet>
				<title>{config.title}</title>
				<meta name="description" content={config.description} />
				<link rel="canonical" href="https://pixelbrawlgames.com/terms" />
			</Helmet>
			<div className={styles.content}>
				<h1 className={styles.title}>Terms & Conditions</h1>
				<p className={styles.text}>
					<u>Account Security:</u>
					{` Players are responsible for maintaining the security of their accounts. They should not share their login credentials with anyone and should choose strong, unique passwords.`}
					<br />
					<br />
					<u>Private Information:</u>
					{` Players must not share personal information about themselves or others, including full names, addresses, phone numbers, email addresses, or any other sensitive data.`}
					<br />
					<br />
					<u>In-game Communication:</u>
					{` Respect the privacy of other players. Do not share personal information or engage in harassment, bullying, or inappropriate behavior through in-game chat, messaging systems, or voice chat.`}
					<br />
					<br />
					<u>Confidentiality of Game Content:</u>
					{` Players must not disclose or distribute confidential information related to the game, including unreleased features, future updates, or proprietary game mechanics.`}
					<br />
					<br />
					<u>Bug Reporting:</u>
					{` If a player discovers a bug or vulnerability in the game, they should report it directly to the game developers or support team instead of sharing it publicly or exploiting it for personal gain.`}
					<br />
					<br />
					<u>Respect for Intellectual Property:</u>
					{` Players must not share or distribute copyrighted material, including but not limited to game assets, music, or artwork, without proper authorization from the copyright holder.`}
					<br />
					<br />
					<u>Data Privacy:</u>
					{` The game must adhere to relevant data protection laws and regulations, ensuring that players' personal information is handled securely and used only for legitimate purposes.`}
					<br />
					<br />
					<u>Reporting Violations:</u>
					{` Players should report any violations of confidentiality rules to the game administrators or support team promptly. This includes instances of hacking, cheating, or unauthorized sharing of confidential information.`}
					<br />
					<br />
					<u>Penalties for Violations:</u>
					{` Violations of confidentiality rules may result in disciplinary action, including warnings, temporary suspensions, or permanent bans from the game, depending on the severity of the offense and the discretion of the game administrators.`}
					<br />
					<br />
					{`These rules aim to create a safe and respectful environment for players while protecting the integrity and confidentiality of the game. It's essential to communicate these rules clearly to all players and enforce them consistently to maintain a positive gaming experience for everyone.`}
				</p>
			</div>
		</div>
	);
};

export default TCPage;
