const MAX_TITLE_SIZE = 100;

export const formatTitle = (title: string) => {
	if (title[0] === `"` && title[title.length - 1] === `"`)
		title = title.slice(1);
	title = title.slice(0, title.length - 1);
	return title;
};

export const ellipseTitle = (title: string, max?: number) => {
	const _max = max || MAX_TITLE_SIZE;
	if (title.length > _max) title = `${title.slice(0, _max)}...`;
	return title;
};
