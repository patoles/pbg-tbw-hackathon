export interface IBlockchain {
	[k: string]: {
		transaction: {
			fetch: () => Promise<any>;
			process: (transaction: any) => Promise<any>;
		};
	};
}
