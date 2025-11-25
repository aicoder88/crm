import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring
  tracesSampleRate: 0.1, // Capture 10% of the transactions
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || "unknown",
  
  // Additional settings
  debug: process.env.NODE_ENV === "development",
  
  // Server-specific configuration
  beforeSend(event) {
    // Don't send events if no DSN is configured
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return null;
    }
    
    // Filter out database connection errors in development
    if (process.env.NODE_ENV === "development" && 
        event.exception?.values?.[0]?.value?.includes('database')) {
      return null;
    }
    
    return event;
  },
  
  // Set default tags
  initialScope: {
    tags: {
      component: "server",
    },
  },
});