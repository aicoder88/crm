'use client';

import { useInvoices } from '@/hooks/use-invoices';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/invoice-utils';
import { InvoiceStatusBadge } from './invoice-status-badge';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InvoiceListProps {
    customerId?: string;
}

export function InvoiceList({ customerId }: InvoiceListProps) {
    const { invoices, loading } = useInvoices(customerId ? { customer_id: customerId } : undefined);

    if (loading) {
        return <div className="py-8 text-center text-muted-foreground">Loading invoices...</div>;
    }

    if (invoices.length === 0) {
        return (
            <div className="py-8 text-center text-muted-foreground">
                No invoices found.
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Invoice #</TableHead>
                        {!customerId && <TableHead>Customer</TableHead>}
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                            <TableCell className="font-mono text-sm">{invoice.invoice_number}</TableCell>
                            {!customerId && (
                                <TableCell>{invoice.customer?.store_name || 'N/A'}</TableCell>
                            )}
                            <TableCell className="text-right font-medium">
                                {formatCurrency(invoice.total, invoice.currency)}
                            </TableCell>
                            <TableCell>
                                <InvoiceStatusBadge status={invoice.status} />
                            </TableCell>
                            <TableCell>{formatDate(invoice.due_date)}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/invoices/${invoice.id}`}>
                                        <Eye className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
