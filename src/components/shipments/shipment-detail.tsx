/**
 * Shipment detail component
 */

'use client';

import type { Shipment, ShipmentEvent } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShipmentStatusBadge } from './shipment-status-badge';
import { TrackingTimeline } from './tracking-timeline';
import { Package, Truck, MapPin, Calendar, DollarSign, RefreshCw, XCircle, ExternalLink, Printer } from 'lucide-react';
import { formatTrackingNumber } from '@/lib/shipment-utils';
import { format } from 'date-fns';
import Link from 'next/link';

interface ShipmentDetailProps {
    shipment: Shipment;
    events?: ShipmentEvent[];
    onRefreshTracking?: () => Promise<void>;
    onCancel?: () => Promise<void>;
    refreshing?: boolean;
}

export function ShipmentDetail({
    shipment,
    events = [],
    onRefreshTracking,
    onCancel,
    refreshing
}: ShipmentDetailProps) {
    const canCancel = ['pending', 'label_created'].includes(shipment.status);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold">
                            {shipment.order_number || 'Shipment'}
                        </h2>
                        <ShipmentStatusBadge status={shipment.status} />
                    </div>
                    {shipment.tracking_number && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Truck className="w-4 h-4" />
                            <span className="text-sm">Tracking:</span>
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                                {formatTrackingNumber(shipment.tracking_number)}
                            </code>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {onRefreshTracking && shipment.tracking_number && (
                        <Button
                            onClick={onRefreshTracking}
                            variant="outline"
                            size="sm"
                            disabled={refreshing}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh Tracking
                        </Button>
                    )}
                    {shipment.label_url && (
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                        >
                            <a href={shipment.label_url} target="_blank" rel="noopener noreferrer">
                                <Printer className="w-4 h-4 mr-2" />
                                Print Label
                            </a>
                        </Button>
                    )}
                    {canCancel && onCancel && (
                        <Button
                            onClick={onCancel}
                            variant="destructive"
                            size="sm"
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Shipment Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Shipment Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-muted-foreground mb-1">Carrier</div>
                                <div className="font-medium">{shipment.carrier}</div>
                            </div>
                            {shipment.service_level && (
                                <div>
                                    <div className="text-muted-foreground mb-1">Service Level</div>
                                    <div className="font-medium">{shipment.service_level}</div>
                                </div>
                            )}
                            {shipment.shipped_date && (
                                <div>
                                    <div className="text-muted-foreground mb-1 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Shipped Date
                                    </div>
                                    <div className="font-medium">
                                        {format(new Date(shipment.shipped_date), 'MMM d, yyyy')}
                                    </div>
                                </div>
                            )}
                            {(shipment.estimated_delivery_date || shipment.delivered_date) && (
                                <div>
                                    <div className="text-muted-foreground mb-1 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {shipment.delivered_date ? 'Delivered' : 'Est. Delivery'}
                                    </div>
                                    <div className="font-medium">
                                        {format(
                                            new Date(shipment.delivered_date || shipment.estimated_delivery_date!),
                                            'MMM d, yyyy'
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Package Details */}
                        <div className="pt-4 border-t">
                            <div className="text-sm font-medium mb-2">Package Details</div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-muted-foreground mb-1">Packages</div>
                                    <div className="font-medium">{shipment.package_count} package{shipment.package_count !== 1 ? 's' : ''}</div>
                                </div>
                                {shipment.actual_weight && (
                                    <div>
                                        <div className="text-muted-foreground mb-1">Weight</div>
                                        <div className="font-medium">{shipment.actual_weight} lbs</div>
                                    </div>
                                )}
                                {(shipment.dimensions_length && shipment.dimensions_width && shipment.dimensions_height) && (
                                    <div className="col-span-2">
                                        <div className="text-muted-foreground mb-1">Dimensions</div>
                                        <div className="font-medium">
                                            {shipment.dimensions_length} × {shipment.dimensions_width} × {shipment.dimensions_height} in
                                        </div>
                                    </div>
                                )}
                                {shipment.shipping_cost && (
                                    <div>
                                        <div className="text-muted-foreground mb-1 flex items-center gap-1">
                                            <DollarSign className="w-3 h-3" />
                                            Shipping Cost
                                        </div>
                                        <div className="font-medium">${shipment.shipping_cost.toFixed(2)}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Customer & Destination */}
                <Card>
                    <CardHeader>
                        <CardTitle>Destination</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {shipment.customer && (
                            <div>
                                <div className="text-sm text-muted-foreground mb-2">Customer</div>
                                <Link
                                    href={`/customers/${shipment.customer_id}`}
                                    className="font-medium hover:underline flex items-center gap-2"
                                >
                                    {shipment.customer.store_name}
                                    <ExternalLink className="w-3 h-3" />
                                </Link>
                            </div>
                        )}

                        {shipment.customer && (shipment.customer.city || shipment.customer.province) && (
                            <div>
                                <div className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    Address
                                </div>
                                <div className="text-sm space-y-1">
                                    <div>{shipment.customer.city}, {shipment.customer.province}</div>
                                </div>
                            </div>
                        )}

                        {shipment.invoice && (
                            <div className="pt-4 border-t">
                                <div className="text-sm text-muted-foreground mb-2">Related Invoice</div>
                                <Link
                                    href={`/invoices`}
                                    className="font-medium hover:underline flex items-center gap-2"
                                >
                                    {shipment.invoice.invoice_number}
                                    <ExternalLink className="w-3 h-3" />
                                </Link>
                            </div>
                        )}

                        {shipment.notes && (
                            <div className="pt-4 border-t">
                                <div className="text-sm text-muted-foreground mb-2">Notes</div>
                                <p className="text-sm">{shipment.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Tracking Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle>Tracking History</CardTitle>
                    <CardDescription>
                        {events.length > 0
                            ? `${events.length} tracking event${events.length !== 1 ? 's' : ''}`
                            : 'No tracking events yet'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TrackingTimeline events={events} currentStatus={shipment.status} />
                </CardContent>
            </Card>
        </div>
    );
}
