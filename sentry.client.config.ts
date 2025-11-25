import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring
  tracesSampleRate: 0.1, // Capture 10% of the transactions
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || "unknown",
  
  // Session Replay
  replaysSessionSampleRate: 0.01, // 1% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with an error
  
  // Additional settings
  debug: process.env.NODE_ENV === "development",
  
  // Filter out known noise
  beforeSend(event) {
    // Filter out network errors from browser extensions
    if (event.exception?.values?.[0]?.value?.includes('Extension context invalidated')) {
      return null;
    }
    
    // Filter out AbortError from cancelled requests
    if (event.exception?.values?.[0]?.type === 'AbortError') {
      return null;
    }
    
    return event;
  },
  
  // Set user context
  integrations: [
    Sentry.replayIntegration({
      // Mask all text and input content
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});