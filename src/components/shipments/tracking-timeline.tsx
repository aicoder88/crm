/**
 * Tracking timeline component showing shipment journey
 */

'use client';

import type { ShipmentEvent } from '@/types';
import { CheckCircle, Circle, Package, Truck, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface TrackingTimelineProps {
    events: ShipmentEvent[];
    currentStatus: string;
}

export function TrackingTimeline({ events, currentStatus }: TrackingTimelineProps) {
    if (!events || events.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No tracking events yet</p>
            </div>
        );
    }

    const getEventIcon = (status: string, index: number) => {
        const isCompleted = index < events.length - 1 || currentStatus === 'delivered';

        if (status.toLowerCase().includes('delivered')) {
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        }

        if (status.toLowerCase().includes('transit') || status.toLowerCase().includes('picked')) {
            return isCompleted ?
                <Truck className="w-5 h-5 text-blue-500" /> :
                <Truck className="w-5 h-5 text-purple-500" />;
        }

        if (status.toLowerCase().includes('location')) {
            return <MapPin className="w-5 h-5 text-blue-400" />;
        }

        return isCompleted ?
            <CheckCircle className="w-5 h-5 text-green-500" /> :
            <Circle className="w-5 h-5 text-gray-400" />;
    };

    return (
        <div className="space-y-4">
            {events.map((event, index) => {
                const isLast = index === events.length - 1;
                const timestamp = new Date(event.timestamp);

                return (
                    <div key={event.id} className="relative flex gap-4">
                        {/* Timeline line */}
                        {!isLast && (
                            <div className="absolute left-[10px] top-[28px] w-0.5 h-full bg-border" />
                        )}

                        {/* Icon */}
                        <div className="relative z-10 flex-shrink-0 mt-1">
                            {getEventIcon(event.status, index)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="font-medium text-sm capitalize">
                                        {event.status.replace(/_/g, ' ')}
                                    </p>
                                    {event.message && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {event.message}
                                        </p>
                                    )}
                                    {event.location && (
                                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            {event.location}
                                        </p>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground ml-4 text-right">
                                    <div>{format(timestamp, 'MMM d, yyyy')}</div>
                                    <div>{format(timestamp, 'h:mm a')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
