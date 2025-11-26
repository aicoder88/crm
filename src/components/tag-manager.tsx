"use client"

import { useState } from "react"
import { useTags } from "@/hooks/useTags"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { logger } from '@/lib/logger';
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, X, Edit2, Trash2 } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const PRESET_COLORS = [
    "#EF4444", // Red
    "#F97316", // Orange
    "#F59E0B", // Amber
    "#84CC16", // Lime
    "#10B981", // Emerald
    "#06B6D4", // Cyan
    "#3B82F6", // Blue
    "#6366F1", // Indigo
    "#8B5CF6", // Purple
    "#D946EF", // Fuchsia
    "#EC4899", // Pink
    "#64748B", // Slate
]

export function TagManager() {
    const { tags, loading, createTag, updateTag, deleteTag } = useTags()
    const [newTagName, setNewTagName] = useState("")
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[8])
    const [editingTag, setEditingTag] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
    const [editColor, setEditColor] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleCreate() {
        if (!newTagName.trim()) return
        setIsSubmitting(true)
        try {
            await createTag(newTagName, selectedColor)
            setNewTagName("")
            setSelectedColor(PRESET_COLORS[8])
        } catch (error) {
            logger.error("Failed to create tag", error instanceof Error ? error : new Error(String(error)));
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleUpdate(id: string) {
        if (!editName.trim()) return
        setIsSubmitting(true)
        try {
            await updateTag(id, { name: editName, color: editColor })
            setEditingTag(null)
        } catch (error) {
            logger.error("Failed to update tag", error instanceof Error ? error : new Error(String(error)));
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleDelete(id: string) {
        try {
            await deleteTag(id)
        } catch (error) {
            logger.error("Failed to delete tag", error instanceof Error ? error : new Error(String(error)));
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Manage Tags</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Manage Tags</DialogTitle>
                    <DialogDescription>
                        Create, edit, and delete tags for categorizing customers.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <Label>Create New Tag</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Tag name"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                            />
                            <Button onClick={handleCreate} disabled={!newTagName.trim() || isSubmitting}>
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            </Button>
                        </div>
                        <div className="flex gap-1 flex-wrap mt-2">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color}
                                    className={`w-6 h-6 rounded-full border-2 ${selectedColor === color ? 'border-black dark:border-white' : 'border-transparent'}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setSelectedColor(color)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        <Label>Existing Tags</Label>
                        {loading ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                        ) : (
                            <div className="space-y-2">
                                {tags.map((tag) => (
                                    <div key={tag.id} className="flex items-center justify-between p-2 border rounded-md">
                                        {editingTag === tag.id ? (
                                            <div className="flex items-center gap-2 flex-1">
                                                <Input
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="h-8"
                                                />
                                                <div className="flex gap-1">
                                                    {PRESET_COLORS.slice(0, 5).map((color) => (
                                                        <button
                                                            key={color}
                                                            className={`w-4 h-4 rounded-full border ${editColor === color ? 'border-black' : 'border-transparent'}`}
                                                            style={{ backgroundColor: color }}
                                                            onClick={() => setEditColor(color)}
                                                        />
                                                    ))}
                                                </div>
                                                <Button size="icon" variant="ghost" onClick={() => handleUpdate(tag.id)} disabled={isSubmitting}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => setEditingTag(null)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <Badge variant="outline" style={{ borderColor: tag.color, color: tag.color }}>
                                                    {tag.name}
                                                </Badge>
                                                <div className="flex gap-1">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => {
                                                        setEditingTag(tag.id)
                                                        setEditName(tag.name)
                                                        setEditColor(tag.color)
                                                    }}>
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Tag?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will remove the tag "{tag.name}" from all customers. This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(tag.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
