import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { authUtils } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Package,
  Warehouse,
  TruckIcon,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = authUtils.getCurrentUser();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "bg-blue-500",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Total Stock",
      value: stats?.totalInventoryStock || 0,
      icon: Warehouse,
      color: "bg-green-500",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Low Stock Items",
      value: stats?.lowStock?.count || 0,
      icon: AlertTriangle,
      color: "bg-orange-500",
      trend: "-3%",
      trendUp: false,
    },
    {
      title: "Pending Deliveries",
      value: stats?.pendingDeliveries?.count || 0,
      icon: TruckIcon,
      color: "bg-purple-500",
      trend: "+5%",
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your inventory today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    {stat.trendUp ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        stat.trendUp ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.trend}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low stock products */}
        {authUtils.isAdminOrManager() && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Low Stock Alert</CardTitle>
              <Link to="/alerts">
                <button className="text-sm text-blue-600 hover:underline flex items-center">
                  View all
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </button>
              </Link>
            </CardHeader>
            <CardContent>
              {stats?.lowStock?.products?.length > 0 ? (
                <div className="space-y-3">
                  {stats.lowStock.products.slice(0, 5).map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          SKU: {product.sku}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-orange-600">
                          {product.totalStock} units
                        </p>
                        <p className="text-xs text-gray-500">
                          Reorder: {product.reorderLevel}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  All products are well stocked
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Category breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.categoryBreakdown?.length > 0 ? (
              <div className="space-y-3">
                {stats.categoryBreakdown.map((category) => (
                  <div key={category._id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {category._id || "Uncategorized"}
                      </span>
                      <span className="text-sm text-gray-600">
                        {category.count} items ({category.totalStock} units)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (category.totalStock /
                              stats.totalInventoryStock) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No category data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending operations */}
      {authUtils.isAdminOrManager() && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pending Receipts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">
                  {stats?.pendingReceipts?.count || 0}
                </p>
                <Link to="/receipts">
                  <button className="mt-2 text-sm text-blue-600 hover:underline">
                    View receipts →
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pending Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-600">
                  {stats?.pendingDeliveries?.count || 0}
                </p>
                <Link to="/deliveries">
                  <button className="mt-2 text-sm text-purple-600 hover:underline">
                    View deliveries →
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pending Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600">
                  {stats?.pendingTransfers?.count || 0}
                </p>
                <Link to="/transfers">
                  <button className="mt-2 text-sm text-green-600 hover:underline">
                    View transfers →
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
