'use client';

import { useState } from "react"
import { useCalls } from "@/hooks/useCalls"
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

interface LogCallDialogProps {
    customerId: string
    onCallLogged?: () => void
}

export function LogCallDialog({ customerId, onCallLogged }: LogCallDialogProps) {
    const [open, setOpen] = useState(false)
    const { logCall, loading } = useCalls(customerId)

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        duration_minutes: 5,
        outcome: "Connected",
        notes: "",
        follow_up_date: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await logCall({
                date: new Date(formData.date).toISOString(),
                duration_minutes: Number(formData.duration_minutes),
                outcome: formData.outcome,
                notes: formData.notes,
                follow_up_date: formData.follow_up_date ? new Date(formData.follow_up_date).toISOString() : undefined
            })
            setOpen(false)
            setFormData({
                date: new Date().toISOString().split('T')[0],
                duration_minutes: 5,
                outcome: "Connected",
                notes: "",
                follow_up_date: ""
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
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Call summary..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="follow_up">Follow-up Date (Optional)</Label>
                        <Input
                            id="follow_up"
                            type="date"
                            value={formData.follow_up_date}
                            onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                        />
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
