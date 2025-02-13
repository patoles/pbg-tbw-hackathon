import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import router from '@/router';
import { useGameStore } from '@/stores/game';

if (!process.env.REACT_APP_CLERK_PUBLISHABLE_KEY) {
	throw new Error('Missing Publishable Key');
}
const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

const App = () => {
	const init = useGameStore((state) => state.init);

	useEffect(() => {
		init();
	}, []);

	return (
		<ClerkProvider
			publishableKey={clerkPubKey}
			navigate={(to) => (window.location.href = to)}
		>
			<TonConnectUIProvider manifestUrl="https://pixelbrawlgames.com/tonconnect-manifest.json">
				<RouterProvider router={router} />
			</TonConnectUIProvider>
		</ClerkProvider>
	);
};

export default App;
