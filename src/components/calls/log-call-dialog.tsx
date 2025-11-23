'use client';

import { useState, useEffect } from "react"
import { useCalls } from "@/hooks/useCalls"
import { createClient } from "@/lib/supabase/client"
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
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Phone } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface LogCallDialogProps {
    customerId: string
    onCallLogged?: () => void
}

export function LogCallDialog({ customerId, onCallLogged }: LogCallDialogProps) {
    const [open, setOpen] = useState(false)
    const { logCall, loading } = useCalls(customerId)
    const supabase = createClient()

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        duration_minutes: 5,
        outcome: "Connected",
        notes: "",
        follow_up_date: "",
        email: "",
        owner_manager_name: "",
        scheduleFollowUp: false
    })

    // Fetch customer data when dialog opens
    useEffect(() => {
        if (open) {
            fetchCustomerData()
        }
    }, [open])

    async function fetchCustomerData() {
        try {
            const { data, error } = await supabase
                .from("customers")
                .select("email, owner_manager_name")
                .eq("id", customerId)
                .single()

            if (error) throw error

            if (data) {
                setFormData(prev => ({
                    ...prev,
                    email: data.email || "",
                    owner_manager_name: data.owner_manager_name || ""
                }))
            }
        } catch (error) {
            console.error("Error fetching customer data:", error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await logCall({
                date: new Date(formData.date).toISOString(),
                duration_minutes: Number(formData.duration_minutes),
                outcome: formData.outcome,
                notes: formData.notes,
                follow_up_date: formData.scheduleFollowUp && formData.follow_up_date ? new Date(formData.follow_up_date).toISOString() : undefined,
                email: formData.email,
                owner_manager_name: formData.owner_manager_name
            })
            setOpen(false)
            setFormData({
                date: new Date().toISOString().split('T')[0],
                duration_minutes: 5,
                outcome: "Connected",
                notes: "",
                follow_up_date: "",
                email: "",
                owner_manager_name: "",
                scheduleFollowUp: false
            })
            onCallLogged?.()
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Phone className="h-4 w-4 mr-2" /> Log Call
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Log Call</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration (mins)</Label>
                            <Input
                                id="duration"
                                type="number"
                                min="1"
                                value={formData.duration_minutes}
                                onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="outcome">Outcome</Label>
                        <Select
                            value={formData.outcome}
                            onValueChange={(value) => setFormData({ ...formData, outcome: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Connected">Connected</SelectItem>
                                <SelectItem value="No Answer">No Answer</SelectItem>
                                <SelectItem value="Left Voicemail">Left Voicemail</SelectItem>
                                <SelectItem value="Wrong Number">Wrong Number</SelectItem>
                                <SelectItem value="Busy">Busy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="customer@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="owner_name">Owner/Manager Name</Label>
                            <Input
                                id="owner_name"
                                type="text"
                                value={formData.owner_manager_name}
                                onChange={(e) => setFormData({ ...formData, owner_manager_name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Call summary..."
                            rows={3}
                        />
                    </div>
                    <div className="space-y-3 pt-2 border-t">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="schedule_follow_up"
                                checked={formData.scheduleFollowUp}
                                onCheckedChange={(checked) => setFormData({ ...formData, scheduleFollowUp: checked as boolean })}
                            />
                            <Label htmlFor="schedule_follow_up" className="text-sm font-medium cursor-pointer">
                                Schedule a follow-up call
                            </Label>
                        </div>
                        {formData.scheduleFollowUp && (
                            <div className="space-y-2 pl-6">
                                <Label htmlFor="follow_up">Follow-up Date</Label>
                                <Input
                                    id="follow_up"
                                    type="date"
                                    value={formData.follow_up_date}
                                    onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    required={formData.scheduleFollowUp}
                                />
                                <p className="text-xs text-muted-foreground">
                                    A task will be automatically created for this follow-up call
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Logging..." : "Log Call"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
