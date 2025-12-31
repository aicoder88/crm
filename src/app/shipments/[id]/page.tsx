/**
 * Individual shipment detail page
 */

'use client';

import { useShipment } from '@/hooks/use-shipments';
import { ShipmentDetail } from '@/components/shipments/shipment-detail';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ShipmentDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { shipment, events, loading, refreshTracking, cancelShipment } = useShipment(params.id);
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            await refreshTracking();
            toast.success('Tracking updated successfully');
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to refresh tracking');
        } finally {
            setRefreshing(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this shipment?')) {
            return;
        }

        try {
            await cancelShipment();
            toast.success('Shipment cancelled successfully');
            router.push('/shipments');
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to cancel shipment');
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="animate-spin">
                    <Package className="w-8 h-8 text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (!shipment) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <Package className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Shipment not found</h3>
                <Button asChild variant="outline">
                    <Link href="/shipments">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Shipments
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Back Button */}
            <Button asChild variant="ghost" size="sm">
                <Link href="/shipments">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Shipments
                </Link>
            </Button>

            {/* Shipment Detail */}
            <ShipmentDetail
                shipment={shipment}
                events={events}
                onRefreshTracking={handleRefresh}
                onCancel={handleCancel}
                refreshing={refreshing}
            />
        </div>
    );
}
