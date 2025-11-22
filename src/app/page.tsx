import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { Users, DollarSign, Package, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch total customers
  const { count: customerCount, error: countError } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true });

  // Fetch recent customers
  const { data: recentCustomers, error: recentError } = await supabase
    .from("customers")
    .select("id, store_name, city, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8 p-2">
      {/* Hero Section */}
      <div className="flex flex-col gap-2 animate-fade-in-down">
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/70">
            Good evening,
          </span>{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-pink-400">
            Team
          </span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Here's what's happening with your CRM today.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in-up delay-100">
        <Card className="relative overflow-hidden border-l-4 border-l-purple-500">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users className="h-24 w-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{customerCount || 0}</div>
            <p className="text-xs text-purple-300/80 mt-1">
              Active B2B relationships
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-teal-500">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign className="h-24 w-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Deals</CardTitle>
            <DollarSign className="h-4 w-4 text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">0</div>
            <p className="text-xs text-teal-300/80 mt-1">
              Pipeline value: $0.00
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-pink-500">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Package className="h-24 w-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
            <Package className="h-4 w-4 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">0</div>
            <p className="text-xs text-pink-300/80 mt-1">
              SKUs in catalog
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-orange-500">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="h-24 w-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">0</div>
            <p className="text-xs text-orange-300/80 mt-1">
              Actions this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 animate-fade-in-up delay-200">
        {/* Recent Customers */}
        <Card className="col-span-4 border-t-4 border-t-purple-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              Recent Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentCustomers?.map((customer, index) => (
                <div key={customer.id} className="flex items-center group p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10">
                    <span className="font-bold text-purple-300">{customer.store_name.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="ml-4 space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none text-white group-hover:text-purple-300 transition-colors">{customer.store_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {customer.city} • <span className={customer.status === 'active' ? 'text-green-400' : 'text-gray-400'}>{customer.status}</span>
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    <Button variant="ghost" size="sm" asChild className="hover:bg-purple-500/20 hover:text-purple-300">
                      <Link href={`/customers/${customer.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              {(!recentCustomers || recentCustomers.length === 0) && (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <Users className="h-12 w-12 opacity-20 mb-2" />
                  <p>No customers found.</p>
                  <Button variant="link" asChild className="mt-2 text-purple-400">
                    <Link href="/customers/new">Add your first customer</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3 border-t-4 border-t-teal-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start h-12 text-base border-white/10 hover:bg-purple-500/20 hover:text-purple-300 hover:border-purple-500/50 transition-all group"
              asChild
            >
              <Link href="/customers/new">
                <div className="bg-purple-500/20 p-1 rounded mr-3 group-hover:bg-purple-500/40 transition-colors">
                  <Users className="h-5 w-5" />
                </div>
                Add New Customer
              </Link>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-12 text-base border-white/10 hover:bg-blue-500/20 hover:text-blue-300 hover:border-blue-500/50 transition-all group"
              asChild
            >
              <Link href="/customers/import">
                <div className="bg-blue-500/20 p-1 rounded mr-3 group-hover:bg-blue-500/40 transition-colors">
                  <Package className="h-5 w-5" />
                </div>
                Import Customers via CSV
              </Link>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Coming Soon</span>
              </div>
            </div>

            <Button variant="outline" className="w-full justify-start h-12 opacity-50 cursor-not-allowed border-dashed border-white/10" disabled>
              <div className="bg-white/5 p-1 rounded mr-3">
                <DollarSign className="h-5 w-5" />
              </div>
              Create New Deal
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
