export const get = (key: string) => {
	let _value: string | null = null;
	try {
		_value = JSON.parse(localStorage.getItem(key) || '');
	} catch (err) {
		_value = getCookie(key);
	}
	return _value;
};

export const set = (key: string, value: any) => {
	const valueStr = JSON.stringify(value || '');
	try {
		localStorage.setItem(key, valueStr);
	} catch (err) {
		setCookie(key, valueStr);
	}
};

const getCookie = (cname) => {
	const name = cname + '=';
	const decodedCookie = decodeURIComponent(document.cookie);
	const ca = decodedCookie.split(';');

	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return JSON.parse(c.substring(name.length, c.length));
		}
	}
	return '';
};

const setCookie = (cname, cvalue, exdays = 1) => {
	const d = new Date();
	d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
	const expires = `expires=${d.toUTCString()}`;
	document.cookie = `${cname}=${cvalue};${expires};path=/`;
};
