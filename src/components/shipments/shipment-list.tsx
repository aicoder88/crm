/**
 * Shipment list component with data table
 */

'use client';

import { useState } from 'react';
import type { Shipment } from '@/types';
import { ShipmentStatusBadge } from './shipment-status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Search, ExternalLink, RefreshCw } from 'lucide-react';
import { formatTrackingNumber } from '@/lib/shipment-utils';
import { format } from 'date-fns';
import Link from 'next/link';

interface ShipmentListProps {
    shipments: Shipment[];
    onRefresh?: () => void;
    loading?: boolean;
}

export function ShipmentList({ shipments, onRefresh, loading }: ShipmentListProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredShipments = shipments.filter(shipment => {
        const query = searchQuery.toLowerCase();
        return (
            shipment.tracking_number?.toLowerCase().includes(query) ||
            shipment.order_number?.toLowerCase().includes(query) ||
            shipment.customer?.store_name?.toLowerCase().includes(query) ||
            shipment.carrier?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-4">
            {/* Search and Actions */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by tracking #, order #, or customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                {onRefresh && (
                    <Button
                        onClick={onRefresh}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                )}
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order #</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Tracking Number</TableHead>
                            <TableHead>Carrier</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ship Date</TableHead>
                            <TableHead>Delivery Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredShipments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    {searchQuery ? 'No shipments found matching your search' : 'No shipments yet'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredShipments.map((shipment) => (
                                <TableRow key={shipment.id}>
                                    <TableCell className="font-medium">
                                        {shipment.order_number || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={`/customers/${shipment.customer_id}`}
                                            className="hover:underline"
                                        >
                                            {shipment.customer?.store_name || 'Unknown'}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <code className="text-xs bg-muted px-2 py-1 rounded">
                                            {formatTrackingNumber(shipment.tracking_number || '-')}
                                        </code>
                                    </TableCell>
                                    <TableCell>{shipment.carrier}</TableCell>
                                    <TableCell>
                                        <ShipmentStatusBadge status={shipment.status} />
                                    </TableCell>
                                    <TableCell>
                                        {shipment.shipped_date
                                            ? format(new Date(shipment.shipped_date), 'MMM d, yyyy')
                                            : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {shipment.delivered_date
                                            ? format(new Date(shipment.delivered_date), 'MMM d, yyyy')
                                            : shipment.estimated_delivery_date
                                                ? format(new Date(shipment.estimated_delivery_date), 'MMM d, yyyy')
                                                : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="sm"
                                        >
                                            <Link href={`/shipments/${shipment.id}`}>
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Results count */}
            {filteredShipments.length > 0 && (
                <div className="text-sm text-muted-foreground">
                    Showing {filteredShipments.length} of {shipments.length} shipment{shipments.length !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
}
