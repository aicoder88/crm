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
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Cat className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">Purrify CRM</span>
                                    <span className="">v1.0.0</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
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
                    <SidebarGroupLabel>Email Marketing</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {emailItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
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
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Settings">
                            <a href="/dashboard/settings">
                                <Settings />
                                <span>Settings</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="text-destructive hover:text-destructive" tooltip="Log out">
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
