import { SignedIn as SignedInClerk } from '@clerk/clerk-react';
import { isTelegramSignedIn, isSolanaSignedIn } from '@/utils';

export const SignedIn = ({ children }) => {
	if (isTelegramSignedIn() || isSolanaSignedIn()) return children;
	else return <SignedInClerk>{children}</SignedInClerk>;
};
