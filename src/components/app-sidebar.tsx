"use client"

import {
    LayoutDashboard,
    Users,
    Trello,
    MessageSquare,
    CreditCard,
    Truck,
    BarChart3,
    Settings,
    LogOut,
    Cat,
    Package,
    FileText,
    Send
} from "lucide-react"

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
} from "@/components/ui/sidebar"

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Customers",
        url: "/dashboard/customers",
        icon: Users,
    },
    {
        title: "Pipeline",
        url: "/deals",
        icon: Trello,
    },
    {
        title: "Products",
        url: "/products",
        icon: Package,
    },
    {
        title: "Communication",
        url: "/dashboard/communication",
        icon: MessageSquare,
    },
    {
        title: "Invoices",
        url: "/invoices",
        icon: CreditCard,
    },
    {
        title: "Shipments",
        url: "/shipments",
        icon: Truck,
    },
    {
        title: "Reports",
        url: "/dashboard/reports",
        icon: BarChart3,
    },
]

const emailItems = [
    {
        title: "Templates",
        url: "/templates",
        icon: FileText,
    },
    {
        title: "Campaigns",
        url: "/campaigns",
        icon: Send,
    },
]

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" className="border-r border-white/5 bg-background/60 backdrop-blur-xl">
            <SidebarHeader className="border-b border-white/5 pb-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-white/5 active:bg-white/10 transition-colors">
                            <a href="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600 text-primary-foreground shadow-lg shadow-primary/20">
                                    <Cat className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Purrify CRM</span>
                                    <span className="text-xs text-muted-foreground">v1.0.0</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-muted-foreground/70">Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title} className="hover:bg-white/5 hover:text-primary transition-all duration-200">
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-muted-foreground/70">Email Marketing</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {emailItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title} className="hover:bg-white/5 hover:text-primary transition-all duration-200">
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-white/5 pt-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Settings" className="hover:bg-white/5 transition-colors">
                            <a href="/dashboard/settings">
                                <Settings />
                                <span>Settings</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors" tooltip="Log out">
                            <a href="/auth/logout">
                                <LogOut />
                                <span>Log out</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
