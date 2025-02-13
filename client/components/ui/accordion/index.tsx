import {
	FC,
	ReactNode,
	useState,
	useEffect,
	useRef,
	ReactElement,
	CSSProperties,
} from 'react';

import styles from './index.module.css';

interface P {
	title: string;
	icon?: ReactElement;
	opened?: boolean;
	titleClass?: string;
	titleOpenClass?: string;
	titleStyle?: CSSProperties;
	contentClass?: string;
	children?: ReactNode;
}

const Accordion: FC<P> = ({
	title,
	icon,
	opened,
	titleClass,
	titleOpenClass,
	titleStyle,
	contentClass,
	children,
}) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [animate, setAnimate] = useState<boolean>(false);
	const [contentHeight, setContentHeight] = useState<number>(0);
	const contentRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		setIsOpen(!!opened);
		updateHeight();
	}, []);

	useEffect(() => {
		if (isOpen && !animate) {
			updateHeight();
			setTimeout(() => {
				setAnimate(true);
			}, 50);
		}
	}, [isOpen]);

	useEffect(() => {
		if (!animate && isOpen) {
			setTimeout(() => {
				setIsOpen(false);
			}, 250);
		}
	}, [animate]);

	const updateHeight = () => {
		if (contentRef.current) {
			setContentHeight(contentRef.current.clientHeight);
		}
	};

	const handleClick = () => {
		if (!isOpen) {
			setIsOpen(true);
		} else {
			setAnimate(false);
		}
	};

	return (
		<div className={styles.accordion}>
			<div
				className={`${styles.titleContainer} ${titleClass ? titleClass : ''} ${
					animate && titleOpenClass ? titleOpenClass : ''
				}`}
				style={titleStyle || {}}
				onClick={handleClick}
			>
				{icon ? <div className={styles.titleIcon}>{icon}</div> : null}
				<div className={styles.title}>{title}</div>
			</div>

			{children && isOpen ? (
				<div
					className={styles.contentWrapper}
					style={{ height: `${animate ? contentHeight : 0}px` }}
				>
					<div ref={contentRef} className={contentClass ? contentClass : ''}>
						{children}
					</div>
				</div>
			) : null}
		</div>
	);
};

export default Accordion;
