'use client';

import { Badge } from '@/components/ui/badge';
import { Invoice } from '@/types';
import { getInvoiceStatusColor, formatInvoiceStatus } from '@/lib/invoice-utils';

interface InvoiceStatusBadgeProps {
    status: Invoice['status'];
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
    const colorClass = getInvoiceStatusColor(status);
    const label = formatInvoiceStatus(status);

    return (
        <Badge className={`${colorClass} text-white hover:${colorClass}`}>
            {label}
        </Badge>
    );
}
