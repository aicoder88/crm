/**
 * Environment Variable Validation and Type-Safe Access
 * 
 * This module provides validation for environment variables on application startup
 * and type-safe access throughout the application.
 */

// Core required environment variables
const REQUIRED_ENV_VARS = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_APP_URL',
] as const;

// Feature-specific optional environment variables
const STRIPE_ENV_VARS = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
] as const;

const RESEND_ENV_VARS = [
    'RESEND_API_KEY',
    'RESEND_WEBHOOK_SECRET',
] as const;

const NETPARCEL_ENV_VARS = [
    'NETPARCEL_API_KEY',
    'NETPARCEL_ACCOUNT_ID',
] as const;

/**
 * Validates that all required environment variables are set
 * Throws an error if any are missing
 */
export function validateRequiredEnv(): void {
    const missing: string[] = [];

    for (const envVar of REQUIRED_ENV_VARS) {
        if (!process.env[envVar]) {
            missing.push(envVar);
        }
    }

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
            `Please copy .env.example to .env.local and fill in the required values.`
        );
    }
}

/**
 * Validates Stripe environment variables
 * @returns true if all Stripe env vars are set, false otherwise
 */
export function validateStripeEnv(): boolean {
    return STRIPE_ENV_VARS.every(envVar => !!process.env[envVar]);
}

/**
 * Validates Resend environment variables
 * @returns true if all Resend env vars are set, false otherwise
 */
export function validateResendEnv(): boolean {
    return RESEND_ENV_VARS.every(envVar => !!process.env[envVar]);
}

/**
 * Validates NetParcel environment variables
 * @returns true if all NetParcel env vars are set, false otherwise
 */
export function validateNetParcelEnv(): boolean {
    return NETPARCEL_ENV_VARS.every(envVar => !!process.env[envVar]);
}

/**
 * Type-safe environment variable access
 */
export const env = {
    // Core
    supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
    app: {
        url: process.env.NEXT_PUBLIC_APP_URL!,
    },

    // Stripe (optional)
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },

    // Resend (optional)
    resend: {
        apiKey: process.env.RESEND_API_KEY,
        webhookSecret: process.env.RESEND_WEBHOOK_SECRET,
    },

    // NetParcel (optional)
    netparcel: {
        apiKey: process.env.NETPARCEL_API_KEY,
        accountId: process.env.NETPARCEL_ACCOUNT_ID,
        apiUrl: process.env.NETPARCEL_API_URL || 'https://api.netparcel.com/v1',
    },
} as const;

/**
 * Ensures Stripe is configured, throws error if not
 */
export function requireStripe(): void {
    if (!validateStripeEnv()) {
        throw new Error(
            'Stripe is not configured. Please set STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, and STRIPE_WEBHOOK_SECRET in your .env.local file.'
        );
    }
}

/**
 * Ensures Resend is configured, throws error if not
 */
export function requireResend(): void {
    if (!validateResendEnv()) {
        throw new Error(
            'Resend is not configured. Please set RESEND_API_KEY and RESEND_WEBHOOK_SECRET in your .env.local file.'
        );
    }
}

/**
 * Ensures NetParcel is configured, throws error if not
 */
export function requireNetParcel(): void {
    if (!validateNetParcelEnv()) {
        throw new Error(
            'NetParcel is not configured. Please set NETPARCEL_API_KEY and NETPARCEL_ACCOUNT_ID in your .env.local file.'
        );
    }
}
