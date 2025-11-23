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
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/5 bg-white/5 backdrop-blur-xl px-6 animate-fade-in-down transition-all duration-300">
            <SidebarTrigger className="text-muted-foreground hover:text-white transition-colors" />
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
                            className="rounded-full hover:bg-white/10 hover:text-white transition-all duration-200"
                        >
                            <User className="h-5 w-5" />
                            <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-card border-white/10 bg-black/80 backdrop-blur-2xl">
                        <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">
                            <Link href="/dashboard/settings/profile" className="w-full">
                                Profile Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">
                            <Link href="/dashboard/settings" className="w-full">
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">Support</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="focus:bg-red-500/20 focus:text-red-400 cursor-pointer">
                            <Link href="/auth/logout" className="w-full text-red-400">
                                Logout
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
