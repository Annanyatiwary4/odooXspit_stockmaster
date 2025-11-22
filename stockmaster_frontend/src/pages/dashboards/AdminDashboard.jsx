import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, Users, Warehouse, TrendingUp } from "lucide-react";
import { adminAPI } from "@/lib/api";

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const kpis = stats ? [
    { title: "Total Products", value: stats.totalProducts?.toLocaleString() || "0", icon: Package, color: "text-blue-600" },
    { title: "Low Stock Items", value: stats.lowStockProducts?.toLocaleString() || "0", icon: AlertTriangle, color: "text-orange-600" },
    { title: "Out of Stock", value: stats.outOfStockProducts?.toLocaleString() || "0", icon: AlertTriangle, color: "text-red-600" },
    { title: "Total Warehouses", value: stats.totalWarehouses?.toLocaleString() || "0", icon: Warehouse, color: "text-purple-600" },
    { title: "Total Users", value: stats.totalUsers?.toLocaleString() || "0", icon: Users, color: "text-green-600" },
  ] : [];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of all inventory operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {loading ? (
            <div className="col-span-5 text-center py-8">Loading dashboard data...</div>
          ) : (
            kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <Card key={kpi.title}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </CardTitle>
                    <Icon className={`size-4 ${kpi.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{kpi.value}</div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Products by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.productsByCategory && stats.productsByCategory.length > 0 ? (
                  <div className="space-y-3">
                    {stats.productsByCategory.slice(0, 5).map((cat) => (
                      <div key={cat._id} className="flex items-center justify-between">
                        <span className="text-sm">{cat._id || "Uncategorized"}</span>
                        <span className="font-semibold">{cat.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No categories yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Stock Quantity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-8 text-blue-600" />
                  <div>
                    <div className="text-3xl font-bold">
                      {stats.totalStockQuantity?.toLocaleString() || "0"}
                    </div>
                    <p className="text-sm text-muted-foreground">Total units in stock</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

