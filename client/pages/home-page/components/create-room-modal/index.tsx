import { FC, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicKey } from '@solana/web3.js';
import Popup from '@/components/ui/popup';
import Input from '@/components/ui/input';
import Loader from '@/components/ui/loader';
import * as SolanaSnakeContract from '@shared/smart-contract/solana/wrappers';
import * as SolanaUtils from '@/utils/web3/solana';
import gameMonitor from '@shared/smart-contract/solana/game-monitor';
import { MINT_OPTIONS } from '@shared/smart-contract/solana/const';

//import api from '@/api';

import styles from './index.module.css';

interface P {
	show: boolean;
	gameId: string;
	canBet?: boolean;
	onClose: () => void;
}

const CreateRoomModal: FC<P> = ({
	show,
	//gameId,
	canBet,
	onClose,
}) => {
	const navigate = useNavigate();
	//	const [privateOption, setPrivateOption] = useState<boolean>(false);
	const [fee, setFee] = useState<string>('');
	const [mintAddress, setMintAddress] = useState<string>(MINT_OPTIONS[0].mint);
	//	const [minPlayer, setMinPlayer] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const getLink = () => {
		let path = `r?`;
		let params = 'new=1';
		//		if (privateOption) params += '&private=1';
		if (fee && parseInt(fee)) params += `&fee=${fee}`;
		//		if (minPlayer) params += `&minPlayer=${minPlayer}`;
		path += params;
		return path;
	};

	const onClick = async () => {
		if (fee && parseFloat(fee)) {
			setIsLoading(true);
			const userWallet = await SolanaUtils.connectWallet();
			if (userWallet) {
				let _user = await SolanaUtils.signIn();
				if (!_user) {
					_user = await SolanaUtils.signIn(true);
				}
				if (_user) {
					const joinRoom = async () => {
						//						const _res = await api.game.joinRoom(gameId, userWallet);
						//						if (_res && _res.roomId) {
						//							navigate(`r/${_res.roomId}`);
						//						}

						// TO REMOVE LATER:
						navigate(`r`);
					};
					const games = await gameMonitor.getPlayerGames(
						new PublicKey(userWallet)
					);
					if (!games.length) {
						const res = await SolanaSnakeContract.createGame(
							parseFloat(fee),
							mintAddress
						);
						if (res) {
							console.log(`Game created: ${res}`);
							await joinRoom();
						} else {
							setIsLoading(false);
						}
					} else await joinRoom();
				}
			}
			setIsLoading(false);
		}
	};

	return (
		<Popup show={show} className={styles.createRoomModal} onClose={onClose}>
			<Loader loading={isLoading} />
			<div className={styles.title}>Create a Room</div>
			<div className={styles.content}>
				{canBet ? (
					<>
						<>
							<div className={`${styles.row} ${styles.align}`}>
								<div className={styles.label}>Participation Fee</div>
							</div>
							<div className={styles.tips}>{`(Tips:Winner earn the fees)`}</div>
						</>
						<div className={styles.row}>
							<Input
								defaultValue={0.1}
								className={styles.input}
								onChange={(value) => setFee(value)}
							/>
							{/*<div className={styles.label}>{`SOL`}</div>*/}
							<div className={styles.label}>
								<select
									name="mint"
									onChange={(e) => setMintAddress(e.target.value)}
								>
									{MINT_OPTIONS.map((item, key) => (
										<option value={item.mint} key={key}>
											{item.label}
										</option>
									))}
								</select>
							</div>
						</div>
					</>
				) : null}
				{/*<div className={styles.row}>
					<Input
						defaultValue={process.env.NODE_ENV === 'production' ? 2 : 1}
						min={process.env.NODE_ENV === 'production' ? 2 : 1}
						max={100}
						className={styles.input}
						onChange={(value) => setMinPlayer(value)}
					/>
					<div className={styles.label}>{`Min Players`}</div>
				</div>
				<div
					className={`${styles.row} ${styles.clickable} ${styles.align}`}
					onClick={() => setPrivateOption(!privateOption)}
				>
					<div
						className={`${styles.check} ${privateOption ? styles.checked : ''}`}
					/>
					<div className={styles.label}>Private</div>
				</div>*/}
				{fee && parseFloat(fee) ? (
					<div className={styles.button} onClick={onClick}>
						Create
					</div>
				) : (
					<Link to={getLink()}>
						<div className={styles.button}>Create</div>
					</Link>
				)}
			</div>
		</Popup>
	);
};

export default CreateRoomModal;
