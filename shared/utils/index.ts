export const print = (text: string, isError?: boolean) => {
	const formatNbr = (n: number) => {
		return n < 10 ? `0${n}` : `${n}`;
	};

	const now = new Date();
	const day = now.getDate();
	const month = now.getMonth() + 1;
	const year = now.getFullYear();

	const hours = now.getHours();
	const minutes = now.getMinutes();
	const seconds = now.getSeconds();
	const stringDate = `${formatNbr(month)}-${formatNbr(day)}-${year} ${formatNbr(
		hours
	)}:${formatNbr(minutes)}:${formatNbr(seconds)}`;
	const str = `${stringDate}> ${text}`;
	if (isError) console.error(str);
	else console.log(str);
};
