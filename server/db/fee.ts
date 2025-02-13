import Fee, { IFee } from './models/fee';
import User from './models/user';

/* ITEM WRITE */

export const createFee = async (feeData: IFee) => {
	return new Promise<void>(async (resolve) => {
		const fee = new Fee(feeData);
		await fee.save();
		resolve();
	});
};

export const updateFee = async (id: string, feeData?: IFee, metadata?: any) => {
	return new Promise<void>(async (resolve) => {
		await Fee.updateOne(
			{ _id: id },
			Object.assign({}, feeData || {}, metadata || {})
		);
		resolve();
	});
};
export const deleteFee = async (id: string) => {
	return new Promise<void>(async (resolve) => {
		await Fee.deleteOne({ _id: id });
		resolve();
	});
};
export const deleteRoomFees = async (room_id: string) => {
	return new Promise<void>(async (resolve) => {
		await Fee.deleteMany({ room_id: room_id });
		resolve();
	});
};

/* *** */

/* ITEM READ */

export const findFee = async (id: string) => {
	return new Promise<IFee | null>(async (resolve) => {
		const fee = await Fee.findOne({ _id: id });
		resolve(fee);
	});
};

export const findFees = async (ids: string[]) => {
	return new Promise<IFee[]>(async (resolve) => {
		const items = await Fee.find({ _id: { $in: ids } });
		resolve(items);
	});
};

export const findRoomFees = async (room_id: string) => {
	return new Promise<IFee[]>(async (resolve) => {
		const items = await Fee.find({ room_id });
		resolve(items);
	});
};

/* *** */

export const payReadyFee = async (
	user_id: string,
	room_id: string,
	fee: number
) => {
	return new Promise<void>(async (resolve, reject) => {
		try {
			const user = await User.findOne({ clerkUserId: user_id });
			if (!user) console.error('User not found.');
			const fees = await Fee.find({ clerkUserId: user_id });
			const alreadyPaid = !!fees.find((element) => element.room_id === room_id);
			if (alreadyPaid) resolve();
			else if (user) {
				if (user.coins >= fee) {
					user.coins -= fee;
					await Promise.all([
						createFee({
							clerkUserId: user_id,
							amount: fee,
							currency: 'coin',
							tx_id: '',
							room_id,
						}),
						user.save(),
					]);
					resolve();
				}
			}
		} catch (err) {}
		reject();
	});
};

export const returnAllFees = async () => {
	return new Promise<void>(async (resolve) => {
		try {
			const fees = await Fee.find();
			if (fees.length) {
				const userIds: string[] = [];
				fees.forEach((fee) => {
					if (userIds.indexOf(fee.clerkUserId) === -1)
						userIds.push(fee.clerkUserId);
				});
				const users = await User.find({
					clerkUserId: {
						$in: userIds,
					},
				});
				if (users.length) {
					const savePromises: Promise<any>[] = [];
					users.forEach((user) => {
						fees.forEach((fee) => {
							if (fee.clerkUserId === user.clerkUserId) {
								if (fee.currency === 'coin') user.coins += fee.amount;
								savePromises.push(fee.deleteOne());
							}
						});
						savePromises.push(user.save());
					});
					await Promise.all(savePromises);
				}
			}
			resolve();
		} catch (err) {}
	});
};
