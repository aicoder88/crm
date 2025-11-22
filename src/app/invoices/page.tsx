'use client';

import { InvoiceList } from '@/components/invoices/invoice-list';
import { InvoiceDialog } from '@/components/invoices/invoice-dialog';
import { useState } from 'react';

export default function InvoicesPage() {
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground">Manage customer invoices and payments</p>
                </div>
                <InvoiceDialog onSuccess={() => setRefreshKey(prev => prev + 1)} />
            </div>

            <InvoiceList key={refreshKey} />
        </div>
    );
}
