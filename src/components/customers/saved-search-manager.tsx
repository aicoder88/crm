"use client"

import { useState } from "react"
import { CustomerFilters, SavedSearch } from "@/types"
import { useSavedSearches } from "@/hooks/use-saved-searches"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bookmark, Save, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SavedSearchManagerProps {
    currentFilters: CustomerFilters
    onLoadSearch: (filters: CustomerFilters) => void
}

export function SavedSearchManager({
    currentFilters,
    onLoadSearch,
}: SavedSearchManagerProps) {
    const { savedSearches, loading, createSavedSearch, deleteSavedSearch } = useSavedSearches()
    const { toast } = useToast()
    const [saveDialogOpen, setSaveDialogOpen] = useState(false)
    const [searchName, setSearchName] = useState("")
    const [saving, setSaving] = useState(false)

    const hasActiveFilters = Object.keys(currentFilters).length > 0

    const handleSaveSearch = async () => {
        if (!searchName.trim()) {
            toast({
                title: "Error",
                description: "Please enter a name for this search",
                variant: "destructive",
            })
            return
        }

        try {
            setSaving(true)
            await createSavedSearch(searchName, currentFilters)
            toast({
                title: "Success",
                description: "Search saved successfully",
            })
            setSaveDialogOpen(false)
            setSearchName("")
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save search",
                variant: "destructive",
            })
        } finally {
            setSaving(false)
        }
    }

    const handleLoadSearch = (search: SavedSearch) => {
        onLoadSearch(search.filters)
        toast({
            title: "Search loaded",
            description: `Loaded "${search.name}"`,
        })
    }

    const handleDeleteSearch = async (id: string, name: string) => {
        try {
            await deleteSavedSearch(id)
            toast({
                title: "Success",
                description: `Deleted "${name}"`,
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete search",
                variant: "destructive",
            })
        }
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                            <Bookmark className="mr-2 h-4 w-4" />
                            Saved Searches
                            {savedSearches.length > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="ml-2 bg-primary/20 text-primary-foreground border-primary/30"
                                >
                                    {savedSearches.length}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-80 glass-card border-white/10 bg-black/90 backdrop-blur-xl"
                    >
                        <DropdownMenuLabel className="text-white">
                            Saved Searches
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        {loading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : savedSearches.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                No saved searches yet
                            </div>
                        ) : (
                            savedSearches.map((search) => (
                                <div
                                    key={search.id}
                                    className="flex items-center justify-between px-2 py-2 hover:bg-white/5 rounded"
                                >
                                    <button
                                        onClick={() => handleLoadSearch(search)}
                                        className="flex-1 text-left text-sm text-white hover:text-primary transition-colors"
                                    >
                                        {search.name}
                                    </button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteSearch(search.id, search.name)}
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    variant="outline"
                    onClick={() => setSaveDialogOpen(true)}
                    disabled={!hasActiveFilters}
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
                >
                    <Save className="mr-2 h-4 w-4" />
                    Save Current
                </Button>
            </div>

            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogContent className="glass-card border-white/10 bg-black/90 backdrop-blur-xl text-white">
                    <DialogHeader>
                        <DialogTitle>Save Search</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Give this search a name to save it for later use.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="search-name" className="text-white">
                                Search Name
                            </Label>
                            <Input
                                id="search-name"
                                placeholder="e.g., Toronto Qualified Customers"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleSaveSearch()
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setSaveDialogOpen(false)}
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveSearch}
                            disabled={saving || !searchName.trim()}
                            className="bg-primary hover:bg-primary/90 text-white"
                        >
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Search
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
