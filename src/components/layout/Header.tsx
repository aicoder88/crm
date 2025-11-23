"use client";

import Link from "next/link"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CommandPalette } from "@/components/command-palette"
import { NotificationCenter } from "@/components/ui/notification-center"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { SidebarTrigger } from "@/components/ui/sidebar"

export function Header() {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b glass backdrop-blur-2xl px-6 animate-slide-in-top">
            <SidebarTrigger />
            <div className="flex flex-1 items-center gap-4">
                <CommandPalette />
            </div>
            <div className="flex items-center gap-3">
                <NotificationCenter />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:scale-110 transition-transform duration-200"
                        >
                            <User className="h-5 w-5" />
                            <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-card">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Link href="/dashboard/settings/profile" className="w-full">
                                Profile Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href="/dashboard/settings" className="w-full">
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Support</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Link href="/auth/logout" className="w-full text-destructive">
                                Logout
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
