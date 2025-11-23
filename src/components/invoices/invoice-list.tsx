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
        <div className="rounded-xl border border-white/5 glass overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-white/5">
                        <TableHead className="text-muted-foreground">Invoice #</TableHead>
                        {!customerId && <TableHead className="text-muted-foreground">Customer</TableHead>}
                        <TableHead className="text-right text-muted-foreground">Total</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground">Due Date</TableHead>
                        <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                        <TableRow key={invoice.id} className="hover:bg-white/5 border-white/5 transition-colors">
                            <TableCell className="font-mono text-sm text-white">{invoice.invoice_number}</TableCell>
                            {!customerId && (
                                <TableCell className="text-white">{invoice.customer?.store_name || 'N/A'}</TableCell>
                            )}
                            <TableCell className="text-right font-medium text-white">
                                {formatCurrency(invoice.total, invoice.currency)}
                            </TableCell>
                            <TableCell>
                                <InvoiceStatusBadge status={invoice.status} />
                            </TableCell>
                            <TableCell className="text-muted-foreground">{formatDate(invoice.due_date)}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" asChild className="hover:bg-white/10 hover:text-white text-muted-foreground transition-colors">
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
