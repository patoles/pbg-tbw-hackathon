import { useState, useEffect } from 'react';
import {
	TonClient,
	Address,
	OpenedContract,
	Contract,
	Sender,
	SenderArguments,
} from '@ton/ton';
import { useTonConnectUI } from '@tonconnect/ui-react';
import {
	CONTRACT_ADDRESS,
	POLL_DOMAIN,
} from '../../shared/smart-contract/ton/const';
import { PixelBrawlGames } from '../../shared/smart-contract/ton/wrappers/PixelBrawlGames';

export const useSmartContract = () => {
	const [contract, setContract] = useState<any | null>(null);
	const [sender, setSender] = useState<Sender | null>(null);
	const [connected, setConnected] = useState<boolean>(false);
	const [tonConnectUI] = useTonConnectUI();

	useEffect(() => {
		const client = new TonClient({
			endpoint: `https://${POLL_DOMAIN}/api/v2/jsonRPC`,
		});
		const contract = new PixelBrawlGames(Address.parse(CONTRACT_ADDRESS));
		const _contract = client.open(
			contract as Contract
		) as OpenedContract<PixelBrawlGames>;
		setContract(_contract);
		setSender({
			send: async (args: SenderArguments) => {
				await tonConnectUI.sendTransaction({
					messages: [
						{
							address: args.to.toString(),
							amount: args.value.toString(),
							payload: args.body?.toBoc().toString('base64'),
						},
					],
					validUntil: Date.now() + 6 * 60 * 1000,
				});
			},
		});
	}, []);

	useEffect(() => {
		setConnected(tonConnectUI.connected);
	}, [tonConnectUI.connected]);

	return { contract, sender, connected };
};
