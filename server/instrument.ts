import * as Sentry from '@sentry/node';

// Ensure to call this before importing any other modules!
Sentry.init({
	dsn: 'https://ed00294f5ba2efdad048a30b6e88f3e7@o4508380433088512.ingest.us.sentry.io/4508380434726912',

	// Add Tracing by setting tracesSampleRate
	// We recommend adjusting this value in production
	tracesSampleRate: 1.0,
});
