"use client"

import {
    LayoutDashboard,
    Users,
    DollarSign,
    Settings,
    Package,
    FileText,
    LogOut,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Customers",
        url: "/customers",
        icon: Users,
    },
    {
        title: "Deals",
        url: "/deals",
        icon: DollarSign,
    },
    {
        title: "Products",
        url: "/products",
        icon: Package,
    },
    {
        title: "Invoices",
        url: "/invoices",
        icon: FileText,
    },
]

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <Sidebar collapsible="icon" className="border-r border-white/5 bg-black/20 backdrop-blur-xl">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600 text-primary-foreground font-bold shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                        P
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-bold text-white">Purrify CRM</span>
                        <span className="truncate text-xs text-muted-foreground">Phase 1</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarSeparator className="bg-white/5" />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-muted-foreground/70">Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                const isActive = pathname === item.url || (item.url !== "/" && pathname.startsWith(`${item.url}/`));
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            className={`transition-all duration-200 ${isActive
                                                    ? "bg-primary/20 text-primary hover:bg-primary/30 hover:text-primary shadow-[0_0_10px_rgba(168,85,247,0.2)] border-l-2 border-primary"
                                                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                                                }`}
                                        >
                                            <Link href={item.url}>
                                                <item.icon className={isActive ? "text-primary" : ""} />
                                                <span className="font-medium">{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-muted-foreground/70">Settings</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild className="text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
                                    <Link href="/settings">
                                        <Settings />
                                        <span>Settings</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <LogOut />
                            <span>Sign Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
