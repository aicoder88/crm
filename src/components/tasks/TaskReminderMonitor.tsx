'use client';

import { useTaskReminders } from '@/hooks/useTaskReminders';

export function TaskReminderMonitor() {
    useTaskReminders();
    return null;
}
