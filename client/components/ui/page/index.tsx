import { FC, ReactNode, CSSProperties } from 'react';
import PageHeader from '../page-header';
import PageContent from '../page-content';

import styles from './index.module.css';

interface P {
	title?: string;
	showBack?: boolean;
	className?: string;
	contentClassName?: string;
	style?: CSSProperties;
	children?: ReactNode;
}
const Page: FC<P> = ({
	title,
	showBack,
	className,
	contentClassName,
	style,
	children,
}) => {
	return (
		<div
			className={`${styles.page} ${className ? className : ''}`}
			style={style || {}}
		>
			<PageHeader title={title} showBack={showBack} />
			<PageContent className={contentClassName}>{children}</PageContent>
		</div>
	);
};

export default Page;
