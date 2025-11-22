/**
 * Shipment status badge component
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { getStatusColor, getStatusLabel } from '@/lib/shipment-utils';
import type { ShipmentStatus } from '@/types';
import { Package, Truck, CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';

interface ShipmentStatusBadgeProps {
    status: ShipmentStatus;
    showIcon?: boolean;
    className?: string;
}

const statusIcons: Record<ShipmentStatus, any> = {
    pending: Clock,
    label_created: Package,
    picked_up: Truck,
    in_transit: Truck,
    out_for_delivery: Truck,
    delivered: CheckCircle,
    exception: AlertCircle,
    cancelled: XCircle,
    returned: Package,
};

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    gray: 'secondary',
    blue: 'default',
    purple: 'default',
    yellow: 'outline',
    green: 'default',
    red: 'destructive',
    orange: 'outline',
};

export function ShipmentStatusBadge({ status, showIcon = true, className }: ShipmentStatusBadgeProps) {
    const color = getStatusColor(status);
    const label = getStatusLabel(status);
    const Icon = statusIcons[status];
    const variant = statusVariants[color] || 'default';

    return (
        <Badge
            variant={variant}
            className={className}
            style={
                variant === 'default' && color !== 'gray'
                    ? {
                        backgroundColor:
                            color === 'blue' ? 'hsl(var(--blue-500))' :
                                color === 'purple' ? 'hsl(var(--purple-500))' :
                                    color === 'green' ? 'hsl(var(--green-500))' :
                                        undefined
                    }
                    : undefined
            }
        >
            {showIcon && Icon && <Icon className="w-3 h-3 mr-1" />}
            {label}
        </Badge>
    );
}
