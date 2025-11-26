/**
 * NetParcel API Client for Purrify CRM
 * Handles shipping operations with NetParcel API
 */

import { logger } from './logger';

export interface NetParcelConfig {
    apiKey: string;
    accountId: string;
    baseUrl: string;
}

export interface NetParcelShipmentRequest {
    customerId: string;
    invoiceId?: string;
    weight: number; // in lbs
    length: number; // in inches
    width: number; // in inches
    height: number; // in inches
    serviceLevel: string;
    packageCount?: number;
}

export interface NetParcelShipmentResponse {
    tracking_number: string;
    label_url: string;
    cost: number;
    estimated_delivery_date: string;
    carrier: string;
}

export interface NetParcelTrackingEvent {
    status: string;
    message: string;
    location?: string;
    timestamp: string;
}

export interface NetParcelTrackingResponse {
    tracking_number: string;
    status: string;
    events: NetParcelTrackingEvent[];
    estimated_delivery?: string;
    delivered_date?: string;
}

/**
 * Get NetParcel configuration from environment variables
 */
function getConfig(): NetParcelConfig {
    const apiKey = process.env.NETPARCEL_API_KEY;
    const accountId = process.env.NETPARCEL_ACCOUNT_ID;
    const baseUrl = process.env.NETPARCEL_API_URL || 'https://api.netparcel.com/v1';

    if (!apiKey || !accountId) {
        throw new Error('NetParcel API credentials not configured. Please set NETPARCEL_API_KEY and NETPARCEL_ACCOUNT_ID in .env.local');
    }

    return { apiKey, accountId, baseUrl };
}

/**
 * Make authenticated request to NetParcel API
 */
async function makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const config = getConfig();
    const url = `${config.baseUrl}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
            'X-Account-ID': config.accountId,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`NetParcel API Error: ${error.message || response.statusText}`);
    }

    return response.json();
}

/**
 * Create a shipment with NetParcel
 */
export async function createShipment(
    request: NetParcelShipmentRequest
): Promise<NetParcelShipmentResponse> {
    // Note: This is a placeholder implementation
    // Replace with actual NetParcel API structure when credentials are available

    try {
        const response = await makeRequest<NetParcelShipmentResponse>('/shipments', {
            method: 'POST',
            body: JSON.stringify({
                weight: request.weight,
                dimensions: {
                    length: request.length,
                    width: request.width,
                    height: request.height,
                },
                service_level: request.serviceLevel,
                package_count: request.packageCount || 1,
                customer_reference: request.customerId,
                invoice_reference: request.invoiceId,
            }),
        });

        return response;
    } catch (error) {
        logger.error('NetParcel createShipment error', error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

/**
 * Get tracking information for a shipment
 */
export async function getTrackingInfo(
    trackingNumber: string
): Promise<NetParcelTrackingResponse> {
    try {
        const response = await makeRequest<NetParcelTrackingResponse>(
            `/tracking/${encodeURIComponent(trackingNumber)}`
        );

        return response;
    } catch (error) {
        logger.error('NetParcel getTrackingInfo error', error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

/**
 * Get shipping rate quotes
 */
export async function getRates(params: {
    weight: number;
    length: number;
    width: number;
    height: number;
    destinationPostalCode: string;
    originPostalCode?: string;
}): Promise<{ rates: Array<{ service: string; cost: number; days: number }> }> {
    try {
        const response = await makeRequest<{ rates: Array<{ service: string; cost: number; days: number }> }>(
            '/rates',
            {
                method: 'POST',
                body: JSON.stringify({
                    weight: params.weight,
                    dimensions: {
                        length: params.length,
                        width: params.width,
                        height: params.height,
                    },
                    destination_postal_code: params.destinationPostalCode,
                    origin_postal_code: params.originPostalCode || 'M5H2N2', // Default Toronto
                }),
            }
        );

        return response;
    } catch (error) {
        logger.error('NetParcel getRates error', error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

/**
 * Cancel a shipment
 */
export async function cancelShipment(trackingNumber: string): Promise<void> {
    try {
        await makeRequest(`/shipments/${encodeURIComponent(trackingNumber)}`, {
            method: 'DELETE',
        });
    } catch (error) {
        logger.error('NetParcel cancelShipment error', error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

/**
 * Verify webhook signature from NetParcel
 */
export function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
): boolean {
    // Note: Implement based on NetParcel's webhook signature algorithm
    // This is a placeholder
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const digest = hmac.digest('hex');

    return digest === signature;
}
