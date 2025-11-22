'use client';

import { useTasks } from "@/hooks/useTasks"
import { TaskCard } from "./task-card"
import { Loader2 } from "lucide-react"
import { CreateTaskDialog } from "./create-task-dialog"

interface TaskListProps {
    customerId: string
}

export function TaskList({ customerId }: TaskListProps) {
    const { tasks, loading, error, updateTask, fetchTasks } = useTasks(customerId)

    const handleToggle = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
        await updateTask(id, { status: newStatus })
    }

    if (loading) {
        return (
            <div className="flex justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return <div className="text-red-500 text-sm p-2">Error: {error}</div>
    }

    const pendingTasks = tasks.filter(t => t.status !== 'completed')
    const completedTasks = tasks.filter(t => t.status === 'completed')

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">Tasks</h3>
                <CreateTaskDialog customerId={customerId} onTaskCreated={fetchTasks} />
            </div>

            <div className="space-y-2">
                {pendingTasks.length === 0 && completedTasks.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No tasks yet.</p>
                )}

                {pendingTasks.map(task => (
                    <TaskCard key={task.id} task={task} onToggle={handleToggle} />
                ))}

                {completedTasks.length > 0 && (
                    <div className="pt-2">
                        <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Completed</h4>
                        {completedTasks.map(task => (
                            <TaskCard key={task.id} task={task} onToggle={handleToggle} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
