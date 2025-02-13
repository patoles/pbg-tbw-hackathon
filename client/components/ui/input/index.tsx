import { FC, useState, useEffect } from 'react';

import styles from './index.module.css';

interface P {
	min?: number;
	max?: number;
	defaultValue?: number;
	className?: string;
	onChange: (value: string) => void;
}

const Input: FC<P> = ({ min, max, defaultValue, className, onChange }) => {
	const [value, setValue] = useState<string>(
		`${defaultValue || defaultValue === 0 ? defaultValue : ''}`
	);

	useEffect(() => {
		onChange(value);
	}, [value]);

	const validateInput = (e: any, isFloat?: boolean) => {
		let newVal: string = e.target.value;
		if (!isFloat) {
			newVal = newVal.replace(/[^0-9]/g, '');
			e.target.value = newVal;
		}
		setValue(newVal);
	};

	return (
		<input
			type={'number'}
			step={1}
			min={min || 0}
			max={max || ''}
			className={`${styles.input} ${className || ''}`}
			value={value}
			onInput={(e) => validateInput(e, true)}
		/>
	);
};

export default Input;
