"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

import { Customer, Tag } from "@/types"

// Use the shared Customer type


export const columns: ColumnDef<Customer>[] = [
    {
        accessorKey: "store_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Store Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            return (
                <Link href={`/customers/${row.original.id}`} className="font-medium hover:underline">
                    {row.getValue("store_name")}
                </Link>
            )
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            let variant: "default" | "secondary" | "destructive" | "outline" = "default"

            switch (status) {
                case "Qualified":
                    variant = "default" // Primary color (purple)
                    break
                case "Interested":
                    variant = "secondary" // Teal/Secondary
                    break
                case "Not Qualified":
                case "Not Interested":
                    variant = "destructive"
                    break
                case "Dog Store":
                    variant = "outline"
                    break
                default:
                    variant = "outline"
            }

            return <Badge variant={variant}>{status}</Badge>
        },
    },
    {
        accessorKey: "tags",
        header: "Tags",
        cell: ({ row }) => {
            const tags = row.original.tags || []
            return (
                <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                        <Badge key={tag.id} variant="outline" style={{ borderColor: tag.color, color: tag.color }}>
                            {tag.name}
                        </Badge>
                    ))}
                </div>
            )
        },
    },
    {
        accessorKey: "contacts",
        header: "Contacts",
        cell: ({ row }) => {
            const contacts = row.original.contacts || []
            return <div className="text-center">{contacts.length}</div>
        }
    },
    {
        accessorKey: "social_media",
        header: "Social",
        cell: ({ row }) => {
            const social = row.original.social_media || []
            return (
                <div className="flex flex-wrap gap-1">
                    {social.map(s => (
                        <Badge key={s.id} variant="secondary" className="text-[10px] px-1 h-5">
                            {s.platform.charAt(0).toUpperCase() + s.platform.slice(1)}
                        </Badge>
                    ))}
                </div>
            )
        }
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "phone",
        header: "Phone",
    },
    {
        accessorKey: "city",
        header: "City",
    },
    {
        accessorKey: "province",
        header: "Province",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const customer = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(customer.id)}
                        >
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Link href={`/customers/${customer.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit Customer</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
