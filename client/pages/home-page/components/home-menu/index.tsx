import { FC } from 'react';
import { Link } from 'react-router-dom';
import styles from './index.module.css';

export interface HomeMenuElement {
	icon: string;
	label: string;
	link: string;
}
interface P {
	elements: HomeMenuElement[];
}
const HomeMenu: FC<P> = ({ elements = [] }) => {
	return (
		<div className={styles.homeMenu}>
			{elements.map(({ icon, label, link }, index) =>
				link ? (
					<Link to={link} className={styles.homeBtn} key={index}>
						<div className={styles.homeBtnIconContainer}>
							<div
								className={styles.homeBtnIcon}
								style={{ backgroundImage: icon ? `url('${icon}')` : '' }}
							/>
						</div>
						<div className={styles.homeBtnLabel}>{label}</div>
					</Link>
				) : (
					<div className={styles.homeBtn} key={index}>
						<div className={styles.homeBtnIconContainer}>
							<div
								className={styles.homeBtnIcon}
								style={{ backgroundImage: icon ? `url('${icon}')` : '' }}
							/>
						</div>
						<div className={styles.homeBtnLabel}>{label}</div>
					</div>
				)
			)}
		</div>
	);
};

export default HomeMenu;
