"use client"

import { useState, useMemo } from "react"
import { Customer, CustomerFilters, FilterOperator } from "@/types"
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { X, Filter, ChevronDown } from "lucide-react"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface CustomerFiltersProps {
    customers: Customer[]
    filters: CustomerFilters
    onFiltersChange: (filters: CustomerFilters) => void
}

export function CustomerFiltersComponent({
    customers,
    filters,
    onFiltersChange,
}: CustomerFiltersProps) {
    const [isOpen, setIsOpen] = useState(false)

    // Extract unique values from customers for filter options
    const filterOptions = useMemo(() => {
        const statuses = Array.from(new Set(customers.map((c) => c.status).filter(Boolean)))
        const tags = Array.from(
            new Set(
                customers.flatMap((c) => c.tags || []).map((t) => ({ id: t.id, name: t.name }))
            )
        ).filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i)
        const cities = Array.from(new Set(customers.map((c) => c.city).filter(Boolean)))
        const provinces = Array.from(new Set(customers.map((c) => c.province).filter(Boolean)))

        return {
            statuses: statuses.map((s) => ({ label: s, value: s })),
            tags: tags.map((t) => ({ label: t.name, value: t.id })),
            cities: cities.map((c) => ({ label: c!, value: c! })),
            provinces: provinces.map((p) => ({ label: p!, value: p! })),
            socialMedia: [
                { label: "Facebook", value: "facebook" },
                { label: "Instagram", value: "instagram" },
                { label: "TikTok", value: "tiktok" },
                { label: "YouTube", value: "youtube" },
                { label: "LinkedIn", value: "linkedin" },
            ] as MultiSelectOption[],
        }
    }, [customers])

    const activeFilterCount = useMemo(() => {
        let count = 0
        if (filters.status && filters.status.length > 0) count++
        if (filters.email) count++
        if (filters.tags && filters.tags.length > 0) count++
        if (filters.city && filters.city.length > 0) count++
        if (filters.province && filters.province.length > 0) count++
        if (filters.phone) count++
        if (filters.contactsMin !== undefined || filters.contactsMax !== undefined) count++
        if (filters.socialMedia && filters.socialMedia.length > 0) count++
        return count
    }, [filters])

    const clearAllFilters = () => {
        onFiltersChange({})
    }

    const updateFilter = (key: keyof CustomerFilters, value: CustomerFilters[keyof CustomerFilters]) => {
        onFiltersChange({ ...filters, [key]: value })
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex-1">
                    <CollapsibleTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full justify-between bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                <span>Advanced Filters</span>
                                {activeFilterCount > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="bg-primary/20 text-primary-foreground border-primary/30"
                                    >
                                        {activeFilterCount}
                                    </Badge>
                                )}
                            </div>
                            <ChevronDown
                                className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""
                                    }`}
                            />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3 space-y-3 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {/* Status Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Status</label>
                                <MultiSelect
                                    options={filterOptions.statuses}
                                    selected={filters.status || []}
                                    onChange={(value) => updateFilter("status", value)}
                                    placeholder="All statuses"
                                />
                                <Select
                                    value={filters.statusOperator || "include"}
                                    onValueChange={(value: FilterOperator) =>
                                        updateFilter("statusOperator", value)
                                    }
                                >
                                    <SelectTrigger className="h-8 bg-white/5 border-white/10 text-white text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card border-white/10 bg-black/90">
                                        <SelectItem value="include" className="text-white">
                                            Include
                                        </SelectItem>
                                        <SelectItem value="exclude" className="text-white">
                                            Exclude
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Tags Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Tags</label>
                                <MultiSelect
                                    options={filterOptions.tags}
                                    selected={filters.tags || []}
                                    onChange={(value) => updateFilter("tags", value)}
                                    placeholder="All tags"
                                />
                                <Select
                                    value={filters.tagsOperator || "include"}
                                    onValueChange={(value: FilterOperator) =>
                                        updateFilter("tagsOperator", value)
                                    }
                                >
                                    <SelectTrigger className="h-8 bg-white/5 border-white/10 text-white text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card border-white/10 bg-black/90">
                                        <SelectItem value="include" className="text-white">
                                            Has any of
                                        </SelectItem>
                                        <SelectItem value="exclude" className="text-white">
                                            Has none of
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* City Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">City</label>
                                <MultiSelect
                                    options={filterOptions.cities}
                                    selected={filters.city || []}
                                    onChange={(value) => updateFilter("city", value)}
                                    placeholder="All cities"
                                />
                                <Select
                                    value={filters.cityOperator || "include"}
                                    onValueChange={(value: FilterOperator) =>
                                        updateFilter("cityOperator", value)
                                    }
                                >
                                    <SelectTrigger className="h-8 bg-white/5 border-white/10 text-white text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card border-white/10 bg-black/90">
                                        <SelectItem value="include" className="text-white">
                                            Include
                                        </SelectItem>
                                        <SelectItem value="exclude" className="text-white">
                                            Exclude
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Province Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Province</label>
                                <MultiSelect
                                    options={filterOptions.provinces}
                                    selected={filters.province || []}
                                    onChange={(value) => updateFilter("province", value)}
                                    placeholder="All provinces"
                                />
                                <Select
                                    value={filters.provinceOperator || "include"}
                                    onValueChange={(value: FilterOperator) =>
                                        updateFilter("provinceOperator", value)
                                    }
                                >
                                    <SelectTrigger className="h-8 bg-white/5 border-white/10 text-white text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card border-white/10 bg-black/90">
                                        <SelectItem value="include" className="text-white">
                                            Include
                                        </SelectItem>
                                        <SelectItem value="exclude" className="text-white">
                                            Exclude
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Email Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Email</label>
                                <Input
                                    placeholder="Search email..."
                                    value={filters.email || ""}
                                    onChange={(e) => updateFilter("email", e.target.value)}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                                />
                            </div>

                            {/* Phone Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">Phone</label>
                                <Input
                                    placeholder="Search phone..."
                                    value={filters.phone || ""}
                                    onChange={(e) => updateFilter("phone", e.target.value)}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                                />
                            </div>

                            {/* Contacts Count Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">
                                    Contacts Count
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.contactsMin || ""}
                                        onChange={(e) =>
                                            updateFilter(
                                                "contactsMin",
                                                e.target.value ? parseInt(e.target.value) : undefined
                                            )
                                        }
                                        className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.contactsMax || ""}
                                        onChange={(e) =>
                                            updateFilter(
                                                "contactsMax",
                                                e.target.value ? parseInt(e.target.value) : undefined
                                            )
                                        }
                                        className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                                    />
                                </div>
                            </div>

                            {/* Social Media Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white">
                                    Social Media
                                </label>
                                <MultiSelect
                                    options={filterOptions.socialMedia}
                                    selected={filters.socialMedia || []}
                                    onChange={(value) => updateFilter("socialMedia", value as Array<'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'linkedin'>)}
                                    placeholder="All platforms"
                                />
                                <Select
                                    value={filters.socialMediaOperator || "include"}
                                    onValueChange={(value: FilterOperator) =>
                                        updateFilter("socialMediaOperator", value)
                                    }
                                >
                                    <SelectTrigger className="h-8 bg-white/5 border-white/10 text-white text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card border-white/10 bg-black/90">
                                        <SelectItem value="include" className="text-white">
                                            Has any of
                                        </SelectItem>
                                        <SelectItem value="exclude" className="text-white">
                                            Has none of
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {activeFilterCount > 0 && (
                    <Button
                        variant="ghost"
                        onClick={clearAllFilters}
                        className="text-muted-foreground hover:text-white hover:bg-white/10"
                    >
                        Clear All
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
