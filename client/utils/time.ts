export function durationAsDays(start: Date, end: Date): number {
	const diffTime = end.getTime() - start.getTime();
	const diffDays = diffTime / (1000 * 3600 * 24);
	return Math.ceil(diffDays);
}

export const formatDateString = (dateString: string) => {
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	return `${year}-${month < 10 ? '0' : ''}${month}-${
		day < 10 ? '0' : ''
	}${day}`;
};
