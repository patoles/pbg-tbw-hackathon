import { useState, useEffect, useMemo } from 'react';

function useFetch<ResponseData>(
	call: any,
	params: any,
	condition: boolean,
	refreshDeps?: any[]
) {
	const [data, setData] = useState<ResponseData | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);

	const _refreshDeps = useMemo<string>(() => {
		return JSON.stringify(refreshDeps || '');
	}, [refreshDeps]);

	useEffect(() => {
		setLoading(true);
		setData(null);
		setError(null);
		request();
	}, [_refreshDeps]);

	const request = async () => {
		const fetchFct = async () => {
			setLoading(true);
			try {
				const res = await call(params);
				onSuccess(res);
			} catch (err) {
				onError(err);
			}
		};

		return new Promise<void>(async (resolve) => {
			if (condition === undefined || condition) await fetchFct();
			resolve();
		});
	};

	const onSuccess = (_data: ResponseData) => {
		setData(_data);
		setLoading(false);
	};
	const onError = (err: Error) => {
		setLoading(false);
		setError(err);
	};

	return { data, loading, error, refresh: request };
}

export default useFetch;
