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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/customers/new">Add Customer</Link>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active B2B relationships
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Pipeline value: $0.00
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              SKUs in catalog
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Actions this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Customers */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentCustomers?.map((customer) => (
                <div key={customer.id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{customer.store_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.city} • {customer.status}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    <Link href={`/customers/${customer.id}`} className="text-sm text-primary hover:underline">
                      View
                    </Link>
                  </div>
                </div>
              ))}
              {(!recentCustomers || recentCustomers.length === 0) && (
                <p className="text-sm text-muted-foreground">No customers found.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Placeholder for future widgets */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/customers/import">
                Import Customers via CSV
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              Create New Deal (Coming Soon)
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              Generate Invoice (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
