import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { Users, Activity, Package, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch total customers
  const { count: customerCount } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true });

  // Fetch recent customers
  const { data: recentCustomers } = await supabase
    .from("customers")
    .select("id, store_name, city, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8 p-2">
      {/* Hero Section */}
      <div className="flex flex-col gap-2 animate-fade-in-down">
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-gradient">
            Good evening,
          </span>{" "}
          <span className="text-gradient-primary">
            Team
          </span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Here's what's happening with your CRM today.
        </p>
      </div>

      {/* Metrics Cards */}
      <DashboardMetrics customerCount={customerCount} />

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 animate-fade-in-up delay-200">

        {/* Charts Section */}
        <DashboardCharts />

        {/* Recent Customers */}
        <Card className="col-span-4 lg:col-span-4 glass border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              <span className="text-white">Recent Customers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCustomers?.map((customer) => (
                <div key={customer.id} className="flex items-center group p-3 rounded-xl glass-hover cursor-pointer">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 shadow-inner">
                    <span className="font-bold text-purple-300">{customer.store_name.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="ml-4 space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none text-white group-hover:text-purple-300 transition-colors">{customer.store_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {customer.city} • <span className={customer.status === 'active' ? 'text-green-400' : 'text-gray-400'}>{customer.status}</span>
                    </p>
                  </div>
                  <div className="ml-auto font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                    <Button variant="ghost" size="icon" asChild className="hover:bg-purple-500/20 hover:text-purple-300 rounded-full">
                      <Link href={`/customers/${customer.id}`}>
                        <ArrowRight className="h-4 w-4" />
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
        <Card className="col-span-3 glass border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Activity className="h-48 w-48 text-teal-500" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-400" />
              <span className="text-white">Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <Button
              variant="outline"
              className="w-full justify-start h-14 text-base border-white/5 bg-white/5 hover:bg-purple-500/20 hover:text-purple-300 hover:border-purple-500/30 transition-all group backdrop-blur-sm"
              asChild
            >
              <Link href="/customers/new">
                <div className="bg-purple-500/20 p-2 rounded-lg mr-3 group-hover:bg-purple-500/40 transition-colors shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                  <Users className="h-5 w-5" />
                </div>
                Add New Customer
              </Link>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-14 text-base border-white/5 bg-white/5 hover:bg-blue-500/20 hover:text-blue-300 hover:border-blue-500/30 transition-all group backdrop-blur-sm"
              asChild
            >
              <Link href="/customers/import">
                <div className="bg-blue-500/20 p-2 rounded-lg mr-3 group-hover:bg-blue-500/40 transition-colors shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                  <Package className="h-5 w-5" />
                </div>
                Import Customers via CSV
              </Link>
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black/20 backdrop-blur-md px-2 text-muted-foreground rounded-full">Coming Soon</span>
              </div>
            </div>

            <Button variant="outline" className="w-full justify-start h-14 opacity-50 cursor-not-allowed border-dashed border-white/10 bg-transparent hover:bg-transparent" disabled>
              <div className="bg-white/5 p-2 rounded-lg mr-3">
                <Activity className="h-5 w-5" />
              </div>
              Create New Deal
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

