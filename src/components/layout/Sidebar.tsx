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
        <Sidebar collapsible="icon" variant="floating" className="border-none bg-transparent">
            <SidebarHeader className="pb-4 pt-4">
                <div className="flex items-center gap-3 px-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white font-bold shadow-[0_0_20px_rgba(120,50,255,0.5)] ring-1 ring-white/20">
                        P
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-bold text-white text-lg tracking-tight">Purrify</span>
                        <span className="truncate text-xs text-primary font-medium tracking-wider uppercase">CRM v2.0</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="px-2">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-widest mb-2 px-2">Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {items.map((item) => {
                                const isActive = pathname === item.url || (item.url !== "/" && pathname.startsWith(`${item.url}/`));
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            className={`h-10 transition-all duration-300 rounded-lg group ${isActive
                                                ? "bg-primary/10 text-white shadow-[0_0_15px_rgba(120,50,255,0.3)] border border-primary/20"
                                                : "text-muted-foreground hover:text-white hover:bg-white/5 hover:translate-x-1"
                                                }`}
                                        >
                                            <Link href={item.url} className="flex items-center gap-3">
                                                <item.icon className={`h-4 w-4 transition-colors ${isActive ? "text-primary drop-shadow-[0_0_8px_rgba(120,50,255,0.8)]" : "group-hover:text-white"}`} />
                                                <span className="font-medium">{item.title}</span>
                                                {isActive && (
                                                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(120,50,255,1)]" />
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-4">
                    <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-widest mb-2 px-2">System</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild className="h-10 text-muted-foreground hover:text-white hover:bg-white/5 hover:translate-x-1 transition-all duration-300 rounded-lg group">
                                    <Link href="/settings" className="flex items-center gap-3">
                                        <Settings className="h-4 w-4 group-hover:text-white" />
                                        <span className="font-medium">Settings</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="h-10 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all duration-300 rounded-lg group justify-center">
                            <LogOut className="h-4 w-4" />
                            <span className="font-medium">Sign Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
