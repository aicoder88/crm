'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useNotifications } from './useNotifications';
import { Task } from '@/types';
import { logger } from '@/lib/logger';

export function useTaskReminders() {
    const { showNotification, permission } = useNotifications();
    const supabase = createClient();
    const checkedTasksRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (permission !== 'granted') {
            return;
        }

        // Check for reminders every 30 seconds
        const checkReminders = async () => {
            try {
                const now = new Date().toISOString();

                // Query tasks with reminders that are due and not yet sent
                const { data: tasks, error } = await supabase
                    .from('tasks')
                    .select('*')
                    .eq('status', 'pending')
                    .eq('reminder_sent', false)
                    .not('reminder_time', 'is', null)
                    .lte('reminder_time', now);

                if (error) {
                    logger.error('Error fetching task reminders', error instanceof Error ? error : new Error(String(error)));
                    return;
                }

                if (!tasks || tasks.length === 0) {
                    return;
                }

                // Process each task with a due reminder
                for (const task of tasks as Task[]) {
                    // Skip if we've already shown notification for this task in this session
                    if (checkedTasksRef.current.has(task.id)) {
                        continue;
                    }

                    // Mark as checked in this session
                    checkedTasksRef.current.add(task.id);

                    // Show notification
                    const notification = showNotification(`Task Reminder: ${task.title}`, {
                        body: `Priority: ${task.priority.toUpperCase()}\nDue: ${new Date(task.due_date).toLocaleDateString()}`,
                        tag: `task-${task.id}`,
                        requireInteraction: false,
                        data: { taskId: task.id },
                    });

                    // Focus window when notification is clicked
                    if (notification) {
                        notification.onclick = () => {
                            window.focus();
                            notification.close();
                        };
                    }

                    // Mark reminder as sent in database
                    await supabase
                        .from('tasks')
                        .update({ reminder_sent: true })
                        .eq('id', task.id);
                }
            } catch (error) {
                logger.error('Error checking task reminders', error instanceof Error ? error : new Error(String(error)));
            }
        };

        // Check immediately on mount
        checkReminders();

        // Then check every 30 seconds
        const interval = setInterval(checkReminders, 30000);

        return () => {
            clearInterval(interval);
        };
    }, [permission, showNotification, supabase]);

    return null;
}
