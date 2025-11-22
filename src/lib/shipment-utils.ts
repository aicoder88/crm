/**
 * Shipment utility functions
 */

import type { Shipment, ShipmentStatus } from '@/types';

/**
 * Calculate dimensional weight (length x width x height / 166 for lbs/inches)
 */
export function calculateDimensionalWeight(
    length: number,
    width: number,
    height: number
): number {
    return Math.ceil((length * width * height) / 166);
}

/**
 * Calculate shipping cost estimate based on weight and distance
 * This is a basic calculation - actual costs come from NetParcel API
 */
export function estimateShippingCost(
    weight: number,
    province: string,
    serviceLevel: 'ground' | 'express' = 'ground'
): number {
    const baseRate = serviceLevel === 'express' ? 15 : 10;
    const weightRate = weight * 0.5;

    // Provincial multipliers for distance
    const provinceMultipliers: Record<string, number> = {
        ON: 1.0,
        QC: 1.1,
        BC: 1.5,
        AB: 1.4,
        SK: 1.3,
        MB: 1.3,
        NS: 1.2,
        NB: 1.2,
        PE: 1.2,
        NL: 1.6,
        YT: 2.0,
        NT: 2.0,
        NU: 2.0,
    };

    const multiplier = provinceMultipliers[province] || 1.0;

    return Math.round((baseRate + weightRate) * multiplier * 100) / 100;
}

/**
 * Format tracking number for display
 */
export function formatTrackingNumber(trackingNumber: string): string {
    if (!trackingNumber) return '';

    // Remove any spaces or dashes
    const cleaned = trackingNumber.replace(/[\s-]/g, '');

    // Split into groups of 4 for readability
    return cleaned.match(/.{1,4}/g)?.join('-') || cleaned;
}

/**
 * Get estimated delivery date based on service level and origin/destination
 */
export function getEstimatedDelivery(
    serviceLevel: string,
    destinationProvince: string
): Date {
    const now = new Date();
    let businessDays = 0;

    if (serviceLevel.toLowerCase().includes('express')) {
        businessDays = 1;
    } else if (serviceLevel.toLowerCase().includes('priority')) {
        businessDays = 2;
    } else {
        // Ground shipping
        const distantProvinces = ['BC', 'AB', 'SK', 'MB', 'NL', 'YT', 'NT', 'NU'];
        businessDays = distantProvinces.includes(destinationProvince) ? 7 : 5;
    }

    // Add business days (skip weekends)
    let daysAdded = 0;
    while (daysAdded < businessDays) {
        now.setDate(now.getDate() + 1);
        const dayOfWeek = now.getDay();
        // Skip Saturday (6) and Sunday (0)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            daysAdded++;
        }
    }

    return now;
}

/**
 * Validate package dimensions
 */
export function validatePackageDimensions(
    length: number,
    width: number,
    height: number,
    weight: number
): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Maximum dimensions
    const maxLength = 108; // inches
    const maxGirth = 165; // inches (length + 2*(width + height))
    const maxWeight = 150; // lbs

    if (length <= 0 || width <= 0 || height <= 0) {
        errors.push('All dimensions must be greater than 0');
    }

    if (length > maxLength) {
        errors.push(`Length cannot exceed ${maxLength} inches`);
    }

    const girth = length + 2 * (width + height);
    if (girth > maxGirth) {
        errors.push(`Girth (L + 2W + 2H) cannot exceed ${maxGirth} inches`);
    }

    if (weight <= 0) {
        errors.push('Weight must be greater than 0');
    }

    if (weight > maxWeight) {
        errors.push(`Weight cannot exceed ${maxWeight} lbs`);
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Get status badge color for shipment status
 */
export function getStatusColor(status: ShipmentStatus): string {
    const colorMap: Record<ShipmentStatus, string> = {
        pending: 'gray',
        label_created: 'blue',
        picked_up: 'blue',
        in_transit: 'purple',
        out_for_delivery: 'yellow',
        delivered: 'green',
        exception: 'red',
        cancelled: 'gray',
        returned: 'orange',
    };

    return colorMap[status] || 'gray';
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: ShipmentStatus): string {
    const labelMap: Record<ShipmentStatus, string> = {
        pending: 'Pending',
        label_created: 'Label Created',
        picked_up: 'Picked Up',
        in_transit: 'In Transit',
        out_for_delivery: 'Out for Delivery',
        delivered: 'Delivered',
        exception: 'Exception',
        cancelled: 'Cancelled',
        returned: 'Returned',
    };

    return labelMap[status] || status;
}

/**
 * Format shipment for display
 */
export function formatShipment(shipment: Shipment) {
    return {
        ...shipment,
        formattedTracking: formatTrackingNumber(shipment.tracking_number || ''),
        statusLabel: getStatusLabel(shipment.status),
        statusColor: getStatusColor(shipment.status),
    };
}

/**
 * Check if shipment can be cancelled
 */
export function canCancelShipment(status: ShipmentStatus): boolean {
    return ['pending', 'label_created'].includes(status);
}

/**
 * Check if shipment can be edited
 */
export function canEditShipment(status: ShipmentStatus): boolean {
    return status === 'pending';
}

/**
 * Generate packing slip content
 */
export function generatePackingSlipData(shipment: Shipment) {
    return {
        orderNumber: shipment.order_number,
        trackingNumber: shipment.tracking_number,
        carrier: shipment.carrier,
        shipDate: shipment.shipped_date,
        customer: shipment.customer,
        packageCount: shipment.package_count,
        weight: shipment.actual_weight,
    };
}
