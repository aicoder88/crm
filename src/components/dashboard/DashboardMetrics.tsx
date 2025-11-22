import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, Package, Activity } from "lucide-react"

interface DashboardMetricsProps {
    customerCount: number | null
}

export function DashboardMetrics({ customerCount }: DashboardMetricsProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in-up delay-100">
            <Card className="glass border-none relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -right-4 -top-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <Users className="h-32 w-32 text-purple-500" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
                    <Users className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-bold text-white drop-shadow-lg">{customerCount || 0}</div>
                    <p className="text-xs text-purple-300/80 mt-1 font-medium">
                        Active B2B relationships
                    </p>
                </CardContent>
            </Card>

            <Card className="glass border-none relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -right-4 -top-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <DollarSign className="h-32 w-32 text-teal-500" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Deals</CardTitle>
                    <DollarSign className="h-4 w-4 text-teal-400" />
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-bold text-white drop-shadow-lg">0</div>
                    <p className="text-xs text-teal-300/80 mt-1 font-medium">
                        Pipeline value: $0.00
                    </p>
                </CardContent>
            </Card>

            <Card className="glass border-none relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -right-4 -top-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <Package className="h-32 w-32 text-pink-500" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
                    <Package className="h-4 w-4 text-pink-400" />
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-bold text-white drop-shadow-lg">0</div>
                    <p className="text-xs text-pink-300/80 mt-1 font-medium">
                        SKUs in catalog
                    </p>
                </CardContent>
            </Card>

            <Card className="glass border-none relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -right-4 -top-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <Activity className="h-32 w-32 text-orange-500" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Recent Activity</CardTitle>
                    <Activity className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-bold text-white drop-shadow-lg">0</div>
                    <p className="text-xs text-orange-300/80 mt-1 font-medium">
                        Actions this week
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
