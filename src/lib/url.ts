/**
 * Get the base URL for the application
 * Works in both server and client contexts
 * Supports localhost, Vercel, and custom domains
 */

export function getBaseUrl(): string {
    // Browser
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }

    // Server-side
    // 1. Check for NEXTAUTH_URL (most reliable for production)
    if (process.env.NEXTAUTH_URL) {
        return process.env.NEXTAUTH_URL;
    }

    // 2. Check for Vercel URL
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // 3. Fallback to localhost
    return 'http://localhost:3000';
}

/**
 * Get the base URL from request headers (for server actions)
 * This is the most reliable method for server actions
 */
export function getBaseUrlFromHeaders(headers?: Headers): string {
    if (!headers) {
        return getBaseUrl();
    }

    const host = headers.get('host');
    const protocol = headers.get('x-forwarded-proto') || 'http';

    if (host) {
        return `${protocol}://${host}`;
    }

    return getBaseUrl();
}
