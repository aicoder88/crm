"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
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
import { useTags } from "@/hooks/useTags"
import { TagManager } from "./tag-manager"

interface TagSelectorProps {
    value: string[]
    onChange: (tags: string[]) => void
}

export function TagSelector({ value, onChange }: TagSelectorProps) {
    const { tags, loading } = useTags()
    const [open, setOpen] = React.useState(false)

    const selectedTags = tags.filter(tag => value.includes(tag.id))

    const toggleTag = (tagId: string) => {
        if (value.includes(tagId)) {
            onChange(value.filter(id => id !== tagId))
        } else {
            onChange([...value, tagId])
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map(tag => (
                    <Badge key={tag.id} variant="secondary" style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color }} className="border">
                        {tag.name}
                        <button
                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    toggleTag(tag.id)
                                }
                            }}
                            onMouseDown={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                            }}
                            onClick={() => toggleTag(tag.id)}
                        >
                            <span className="sr-only">Remove {tag.name} tag</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-3 w-3 hover:text-destructive"
                            >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </svg>
                        </button>
                    </Badge>
                ))}
            </div>
            <div className="flex gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                        >
                            Select tags...
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                        <Command>
                            <CommandInput placeholder="Search tags..." />
                            <CommandList>
                                <CommandEmpty>No tags found.</CommandEmpty>
                                <CommandGroup>
                                    {tags.map((tag) => (
                                        <CommandItem
                                            key={tag.id}
                                            value={tag.name}
                                            onSelect={() => {
                                                toggleTag(tag.id)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value.includes(tag.id) ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                                                {tag.name}
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                <TagManager />
            </div>
        </div>
    )
}
