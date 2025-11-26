'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

export type NotificationPermission = 'granted' | 'denied' | 'default';

export function useNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        // Check if notifications are supported
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async (): Promise<NotificationPermission> => {
        if (!isSupported) {
            console.warn('Notifications are not supported in this browser');
            return 'denied';
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result;
        } catch (error) {
            logger.error('Error requesting notification permission', error instanceof Error ? error : new Error(String(error)));
            return 'denied';
        }
    };

    const showNotification = (title: string, options?: NotificationOptions) => {
        if (!isSupported) {
            console.warn('Notifications are not supported');
            return null;
        }

        if (permission !== 'granted') {
            console.warn('Notification permission not granted');
            return null;
        }

        try {
            const notification = new Notification(title, {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                ...options,
            });

            // Auto-close after 10 seconds
            setTimeout(() => notification.close(), 10000);

            return notification;
        } catch (error) {
            logger.error('Error showing notification', error instanceof Error ? error : new Error(String(error)));
            return null;
        }
    };

    return {
        permission,
        isSupported,
        requestPermission,
        showNotification,
    };
}
