"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export interface MultiSelectOption {
    label: string
    value: string
}

interface MultiSelectProps {
    options: MultiSelectOption[]
    selected: string[]
    onChange: (selected: string[]) => void
    placeholder?: string
    className?: string
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select items...",
    className,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false)

    const handleSelect = (value: string) => {
        const newSelected = selected.includes(value)
            ? selected.filter((item) => item !== value)
            : [...selected, value]
        onChange(newSelected)
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange([])
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white",
                        className
                    )}
                >
                    <span className="truncate">
                        {selected.length > 0 ? (
                            <div className="flex gap-1 flex-wrap">
                                {selected.slice(0, 2).map((value) => {
                                    const option = options.find((opt) => opt.value === value)
                                    return (
                                        <Badge
                                            key={value}
                                            variant="secondary"
                                            className="bg-primary/20 text-primary-foreground border-primary/30"
                                        >
                                            {option?.label}
                                        </Badge>
                                    )
                                })}
                                {selected.length > 2 && (
                                    <Badge
                                        variant="secondary"
                                        className="bg-primary/20 text-primary-foreground border-primary/30"
                                    >
                                        +{selected.length - 2} more
                                    </Badge>
                                )}
                            </div>
                        ) : (
                            placeholder
                        )}
                    </span>
                    <div className="flex items-center gap-1 ml-2">
                        {selected.length > 0 && (
                            <X
                                className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                                onClick={handleClear}
                            />
                        )}
                        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 glass-card border-white/10 bg-black/90 backdrop-blur-xl">
                <Command className="bg-transparent">
                    <CommandInput
                        placeholder="Search..."
                        className="border-none focus:ring-0 text-white placeholder:text-muted-foreground"
                    />
                    <CommandList>
                        <CommandEmpty className="text-muted-foreground py-6 text-center">
                            No results found.
                        </CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => handleSelect(option.value)}
                                    className="cursor-pointer text-white hover:bg-white/10 aria-selected:bg-white/10"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selected.includes(option.value)
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
