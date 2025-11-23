'use client';

import { Badge } from '@/components/ui/badge';
import { Invoice } from '@/types';
import { getInvoiceStatusColor, formatInvoiceStatus } from '@/lib/invoice-utils';

interface InvoiceStatusBadgeProps {
    status: Invoice['status'];
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
    const label = formatInvoiceStatus(status);

    let className = "border-white/10 bg-white/5 text-muted-foreground";

    switch (status) {
        case 'paid':
            className = "border-green-500/30 bg-green-500/10 text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.2)]";
            break;
        case 'sent':
            className = "border-blue-500/30 bg-blue-500/10 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.2)]";
            break;
        case 'overdue':
            className = "border-red-500/30 bg-red-500/10 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
            break;
        case 'draft':
            className = "border-white/20 bg-white/10 text-white/70";
            break;
        case 'cancelled':
            className = "border-white/10 bg-white/5 text-muted-foreground line-through opacity-70";
            break;
    }

    return (
        <Badge variant="outline" className={className}>
            {label}
        </Badge>
    );
}
