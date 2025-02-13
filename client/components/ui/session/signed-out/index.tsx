import { SignedOut as SignedOutClerk } from '@clerk/clerk-react';
import { isTelegramSignedIn, isSolanaSignedIn } from '@/utils';

export const SignedOut = ({ children }) => {
	if (isTelegramSignedIn() || isSolanaSignedIn()) return null;
	else return <SignedOutClerk>{children}</SignedOutClerk>;
};
