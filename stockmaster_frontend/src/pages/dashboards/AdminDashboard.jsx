import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, Users, Warehouse, TrendingUp, ArrowRight, Activity } from "lucide-react";
import { adminAPI, productsAPI, warehousesAPI } from "@/lib/api";

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
    loadWarehouseStock();
    loadLowStockProducts();
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

  const loadWarehouseStock = async () => {
    try {
      const warehousesResponse = await warehousesAPI.getAll();
      const productsResponse = await productsAPI.getAll({ limit: 1000 });
      
      const warehouses = warehousesResponse.data || [];
      const products = productsResponse.data || [];
      
      const warehouseData = warehouses.map(warehouse => {
        let totalStock = 0;
        let productCount = 0;
        
        products.forEach(product => {
          if (product.stockByLocation && warehouse.locations) {
            warehouse.locations.forEach(location => {
              const stock = product.stockByLocation.get(location._id.toString()) || 0;
              if (stock > 0) {
                totalStock += stock;
                productCount++;
              }
            });
          }
        });
        
        return {
          ...warehouse,
          totalStock,
          productCount
        };
      });
      
      setWarehouseStock(warehouseData);
    } catch (error) {
      console.error("Error loading warehouse stock:", error);
    }
  };

  const loadLowStockProducts = async () => {
    try {
      const response = await productsAPI.getAll({ limit: 100 });
      const products = response.data || [];
      
      const lowStock = products.filter(product => 
        product.totalStock < product.reorderLevel && product.status === 'active'
      ).slice(0, 5);
      
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error("Error loading low stock products:", error);
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
          <>
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

            {/* Warehouse-Level Stock */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Warehouse-Level Stock</CardTitle>
                  <Link to="/warehouses">
                    <Button variant="outline" size="sm">
                      View All <ArrowRight className="size-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {warehouseStock.length > 0 ? (
                  <div className="space-y-3">
                    {warehouseStock.map((warehouse) => (
                      <div
                        key={warehouse._id}
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div>
                          <p className="font-medium">{warehouse.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {warehouse.locations?.length || 0} locations
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{warehouse.totalStock.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {warehouse.productCount} products
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No warehouse data available</p>
                )}
              </CardContent>
            </Card>

            {/* Low Stock Alerts */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="size-5 text-orange-600" />
                    Low Stock Alerts
                  </CardTitle>
                  <Link to="/products">
                    <Button variant="outline" size="sm">
                      View All <ArrowRight className="size-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {lowStockProducts.length > 0 ? (
                  <div className="space-y-3">
                    {lowStockProducts.map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-md"
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            SKU: {product.sku} | Current: {product.totalStock} | Reorder: {product.reorderLevel}
                          </p>
                        </div>
                        <AlertTriangle className="size-5 text-orange-600" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No low stock items</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="size-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">System initialized</p>
                      <p className="text-sm text-muted-foreground">Just now</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Activity logs will appear here as operations are performed
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

