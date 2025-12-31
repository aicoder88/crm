'use client';

import { useState } from "react"
import { useTasks } from "@/hooks/useTasks"
import { useNotifications } from "@/hooks/useNotifications"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Bell } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { logger } from "@/lib/logger"

interface CreateTaskDialogProps {
    customerId: string
    onTaskCreated?: () => void
}

export function CreateTaskDialog({ customerId, onTaskCreated }: CreateTaskDialogProps) {
    const [open, setOpen] = useState(false)
    const { createTask } = useTasks(customerId)
    const { requestPermission, permission } = useNotifications()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        title: "",
        type: "other",
        priority: "medium",
        due_date: new Date().toISOString().split('T')[0],
        enableReminder: false,
        reminder_date: new Date().toISOString().split('T')[0],
        reminder_time: "09:00"
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            // Request notification permission if reminder is enabled and not already granted
            if (formData.enableReminder && permission !== 'granted') {
                const result = await requestPermission()
                if (result !== 'granted') {
                    alert('Notification permission is required for reminders. The task will be created without a reminder.')
                    setFormData({ ...formData, enableReminder: false })
                }
            }

            // Combine date and time for reminder
            let reminderTime = null
            if (formData.enableReminder) {
                reminderTime = new Date(`${formData.reminder_date}T${formData.reminder_time}`).toISOString()
            }

            await createTask({
                title: formData.title,
                type: formData.type as 'call' | 'email' | 'follow_up' | 'other',
                priority: formData.priority as 'low' | 'medium' | 'high',
                due_date: new Date(formData.due_date).toISOString(),
                status: 'pending',
                notes: null,
                reminder_time: reminderTime,
                reminder_sent: false
            })
            setOpen(false)
            setFormData({
                title: "",
                type: "other",
                priority: "medium",
                due_date: new Date().toISOString().split('T')[0],
                enableReminder: false,
                reminder_date: new Date().toISOString().split('T')[0],
                reminder_time: "09:00"
            })
            onTaskCreated?.()
        } catch (error) {
            logger.error('Failed to create task', error instanceof Error ? error : new Error(String(error)), {
                customerId
            });
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" /> Add Task
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Task Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="call">Call</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="follow_up">Follow-up</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) => setFormData({ ...formData, priority: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="due_date">Due Date</Label>
                        <Input
                            id="due_date"
                            type="date"
                            value={formData.due_date}
                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-3 p-4 rounded-lg border border-border/50 bg-card/30">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="enableReminder"
                                checked={formData.enableReminder}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, enableReminder: checked as boolean })
                                }
                            />
                            <Label
                                htmlFor="enableReminder"
                                className="flex items-center gap-2 cursor-pointer font-medium"
                            >
                                <Bell className="h-4 w-4" />
                                Set Reminder
                            </Label>
                        </div>
                        {formData.enableReminder && (
                            <div className="grid grid-cols-2 gap-3 pl-6">
                                <div className="space-y-2">
                                    <Label htmlFor="reminder_date" className="text-sm">Date</Label>
                                    <Input
                                        id="reminder_date"
                                        type="date"
                                        value={formData.reminder_date}
                                        onChange={(e) => setFormData({ ...formData, reminder_date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reminder_time" className="text-sm">Time</Label>
                                    <Input
                                        id="reminder_time"
                                        type="time"
                                        value={formData.reminder_time}
                                        onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Task"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
