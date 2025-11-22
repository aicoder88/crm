/**
 * Shipments list page
 */

'use client';

import { useShipments } from '@/hooks/use-shipments';
import { ShipmentList } from '@/components/shipments/shipment-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ShipmentsPage() {
    const { shipments, loading, refetch } = useShipments();

    // Calculate metrics
    const inTransit = shipments.filter(s =>
        ['in_transit', 'out_for_delivery', 'picked_up'].includes(s.status)
    ).length;

    const delivered = shipments.filter(s => s.status === 'delivered').length;
    const pending = shipments.filter(s => s.status === 'pending').length;

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Shipments</h2>
                    <p className="text-muted-foreground">
                        Manage and track all shipments
                    </p>
                </div>
                <Button asChild>
                    <Link href="/shipments/create">
                        <Package className="w-4 h-4 mr-2" />
                        Create Shipment
                    </Link>
                </Button>
            </div>

            {/* Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Shipments
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{shipments.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            In Transit
                        </CardTitle>
                        <Truck className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inTransit}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Delivered
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{delivered}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending
                        </CardTitle>
                        <Clock className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pending}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Shipments List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Shipments</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin">
                                <Package className="w-8 h-8 text-muted-foreground" />
                            </div>
                        </div>
                    ) : (
                        <ShipmentList shipments={shipments} onRefresh={refetch} loading={loading} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
