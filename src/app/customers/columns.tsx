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
                    className="text-muted-foreground hover:text-white hover:bg-white/5"
                >
                    Store Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            return (
                <Link href={`/customers/${row.original.id}`} className="font-medium text-white hover:text-primary transition-colors hover:underline decoration-primary/50 underline-offset-4">
                    {row.getValue("store_name")}
                </Link>
            )
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <div className="text-muted-foreground">Status</div>
        ),
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            let className = "border-white/10 bg-white/5 text-muted-foreground"

            switch (status) {
                case "Qualified":
                    className = "border-purple-500/30 bg-purple-500/10 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                    break
                case "Interested":
                    className = "border-teal-500/30 bg-teal-500/10 text-teal-300 shadow-[0_0_10px_rgba(20,184,166,0.2)]"
                    break
                case "Not Qualified":
                case "Not Interested":
                    className = "border-red-500/30 bg-red-500/10 text-red-300"
                    break
                case "Dog Store":
                    className = "border-blue-500/30 bg-blue-500/10 text-blue-300"
                    break
            }

            return <Badge variant="outline" className={className}>{status}</Badge>
        },
    },
    {
        accessorKey: "tags",
        header: ({ column }) => (
            <div className="text-muted-foreground">Tags</div>
        ),
        cell: ({ row }) => {
            const tags = row.original.tags || []
            return (
                <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                        <Badge key={tag.id} variant="outline" style={{ borderColor: `${tag.color}40`, color: tag.color, backgroundColor: `${tag.color}10` }}>
                            {tag.name}
                        </Badge>
                    ))}
                </div>
            )
        },
    },
    {
        accessorKey: "contacts",
        header: ({ column }) => (
            <div className="text-muted-foreground text-center">Contacts</div>
        ),
        cell: ({ row }) => {
            const contacts = row.original.contacts || []
            return <div className="text-center text-muted-foreground">{contacts.length}</div>
        }
    },
    {
        accessorKey: "social_media",
        header: ({ column }) => (
            <div className="text-muted-foreground">Social</div>
        ),
        cell: ({ row }) => {
            const social = row.original.social_media || []
            return (
                <div className="flex flex-wrap gap-1">
                    {social.map(s => (
                        <Badge key={s.id} variant="secondary" className="text-[10px] px-1 h-5 bg-white/5 text-muted-foreground hover:bg-white/10 border-none">
                            {s.platform.charAt(0).toUpperCase() + s.platform.slice(1)}
                        </Badge>
                    ))}
                </div>
            )
        }
    },
    {
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="text-muted-foreground hover:text-white hover:bg-white/5"
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("email")}</div>
    },
    {
        accessorKey: "phone",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="text-muted-foreground hover:text-white hover:bg-white/5"
                >
                    Phone
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("phone")}</div>
    },
    {
        accessorKey: "city",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="text-muted-foreground hover:text-white hover:bg-white/5"
                >
                    City
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("city")}</div>
    },
    {
        accessorKey: "province",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="text-muted-foreground hover:text-white hover:bg-white/5"
                >
                    Province
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("province")}</div>
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const customer = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 hover:text-white text-muted-foreground">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-card border-white/10 bg-black/90 backdrop-blur-xl">
                        <DropdownMenuLabel className="text-white">Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(customer.id)}
                            className="focus:bg-white/10 focus:text-white cursor-pointer text-muted-foreground"
                        >
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer text-muted-foreground">
                            <Link href={`/customers/${customer.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer text-muted-foreground">
                            <Link href={`/customers/${customer.id}/edit`}>Edit Customer</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
