import {
	FC,
	useState,
	useEffect,
	CSSProperties,
	ReactNode,
	useRef,
} from 'react';

import styles from './index.module.css';

interface P {
	show?: boolean;
	className?: string;
	style?: CSSProperties;
	children?: ReactNode;
}
const ModalContainer: FC<P> = ({ show, className, style, children }) => {
	const [canShow, setCanShow] = useState<boolean>(!!show);
	const [animate, setAnimate] = useState<boolean>(!!show);
	const showTimeout = useRef<NodeJS.Timeout | null>(null);
	const animateTimeout = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		setCanShow(!!show);
		setAnimate(!!show);

		return () => {
			if (showTimeout.current) clearTimeout(showTimeout.current);
			if (animateTimeout.current) clearTimeout(animateTimeout.current);
		};
	}, []);

	useEffect(() => {
		if (show !== canShow) {
			if (showTimeout.current) clearTimeout(showTimeout.current);
			if (animateTimeout.current) clearTimeout(animateTimeout.current);
			if (show) {
				setCanShow(true);
			} else {
				setAnimate(false);
			}
		}
	}, [show]);

	useEffect(() => {
		if (canShow && !animate) {
			showTimeout.current = setTimeout(() => {
				setAnimate(true);
			}, 50);
		}
	}, [canShow]);

	useEffect(() => {
		if (!animate && canShow) {
			animateTimeout.current = setTimeout(() => {
				setCanShow(false);
			}, 250);
		}
	}, [animate]);

	return canShow ? (
		<div
			className={`${styles.modalContainer} ${className} ${
				animate ? styles.animate : ''
			}`}
			style={style}
		>
			{children}
		</div>
	) : null;
};

export default ModalContainer;
