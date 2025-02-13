import { ClerkExpressWithAuth as ClerkAuthMiddleware } from '@clerk/clerk-sdk-node';

const clerkAuth = ClerkAuthMiddleware({});

export { clerkAuth };
