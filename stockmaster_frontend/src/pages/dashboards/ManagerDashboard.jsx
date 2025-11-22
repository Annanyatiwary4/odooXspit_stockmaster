import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, Clock, Truck, Receipt, Move, FileText } from "lucide-react";
import { receiptsAPI, deliveriesAPI, transfersAPI, adjustmentsAPI, productsAPI } from "@/lib/api";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function ManagerDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    pendingReceipts: 0,
    pendingDeliveries: 0,
    scheduledTransfers: 0,
    pendingAdjustments: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [pendingOperations, setPendingOperations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load products
      const productsRes = await productsAPI.getAll({ limit: 1000 });
      const products = productsRes.data || [];
      const totalProducts = products.length;
      
      // Calculate low stock items
      const lowStock = products.filter(p => {
        return p.totalStock <= p.reorderLevel && p.status === 'active';
      });
      const lowStockItems = lowStock.length;
      setLowStockProducts(lowStock.slice(0, 5));

      // Load receipts
      const receiptsRes = await receiptsAPI.getAll({ status: 'ready', limit: 100 });
      const pendingReceipts = receiptsRes.pagination?.total || receiptsRes.data?.length || 0;

      // Load deliveries
      const deliveriesRes = await deliveriesAPI.getAll({ status: 'ready', limit: 100 });
      const pendingDeliveries = deliveriesRes.pagination?.total || deliveriesRes.data?.length || 0;

      // Load transfers
      const transfersRes = await transfersAPI.getAll({ status: 'ready', limit: 100 });
      const scheduledTransfers = transfersRes.pagination?.total || transfersRes.data?.length || 0;

      // Load adjustments
      const adjustmentsRes = await adjustmentsAPI.getAll({ status: 'draft', limit: 100 });
      const pendingAdjustments = adjustmentsRes.pagination?.total || adjustmentsRes.data?.length || 0;

      // Get pending operations for display
      const operations = [];
      if (receiptsRes.data && receiptsRes.data.length > 0) {
        receiptsRes.data.slice(0, 3).forEach(r => {
          operations.push({
            type: 'receipt',
            id: r._id,
            number: r.receiptNumber,
            title: `Receipt ${r.receiptNumber}`,
            description: `Supplier: ${r.supplier}`,
            status: r.status,
            icon: Receipt,
            color: "text-yellow-600",
          });
        });
      }
      if (deliveriesRes.data && deliveriesRes.data.length > 0) {
        deliveriesRes.data.slice(0, 3).forEach(d => {
          operations.push({
            type: 'delivery',
            id: d._id,
            number: d.deliveryNumber,
            title: `Delivery ${d.deliveryNumber}`,
            description: `Customer: ${d.customer}`,
            status: d.status,
            icon: Truck,
            color: "text-purple-600",
          });
        });
      }
      if (transfersRes.data && transfersRes.data.length > 0) {
        transfersRes.data.slice(0, 2).forEach(t => {
          operations.push({
            type: 'transfer',
            id: t._id,
            number: t.transferNumber,
            title: `Transfer ${t.transferNumber}`,
            description: `${t.sourceWarehouseId?.name || 'Source'} → ${t.destinationWarehouseId?.name || 'Dest'}`,
            status: t.status,
            icon: Move,
            color: "text-blue-600",
          });
        });
      }
      setPendingOperations(operations.slice(0, 5));

      setStats({
        totalProducts,
        lowStockItems,
        pendingReceipts,
        pendingDeliveries,
        scheduledTransfers,
        pendingAdjustments,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const kpis = [
    { 
      title: "Total Products", 
      value: stats.totalProducts.toLocaleString(), 
      icon: Package, 
      color: "text-blue-600",
      link: "/products"
    },
    { 
      title: "Low Stock Items", 
      value: stats.lowStockItems.toString(), 
      icon: AlertTriangle, 
      color: "text-orange-600",
      link: "/products"
    },
    { 
      title: "Pending Receipts", 
      value: stats.pendingReceipts.toString(), 
      icon: Clock, 
      color: "text-yellow-600",
      link: "/receipts"
    },
    { 
      title: "Pending Deliveries", 
      value: stats.pendingDeliveries.toString(), 
      icon: Truck, 
      color: "text-purple-600",
      link: "/deliveries"
    },
    { 
      title: "Scheduled Transfers", 
      value: stats.scheduledTransfers.toString(), 
      icon: Move, 
      color: "text-blue-600",
      link: "/transfers"
    },
    { 
      title: "Pending Adjustments", 
      value: stats.pendingAdjustments.toString(), 
      icon: FileText, 
      color: "text-green-600",
      link: "/adjustments"
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage incoming & outgoing stock
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kpis.map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <Link key={kpi.title} to={kpi.link}>
                    <Card className="hover:bg-accent transition-colors cursor-pointer">
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
                  </Link>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Low Stock Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  {lowStockProducts.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <AlertTriangle className="size-8 mx-auto mb-2 opacity-50" />
                      <p>No low stock items</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {lowStockProducts.map((product) => (
                        <div key={product._id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-md">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.totalStock} {product.uom} remaining (Reorder: {product.reorderLevel} {product.uom})
                            </p>
                          </div>
                          <AlertTriangle className="size-5 text-orange-600" />
                        </div>
                      ))}
                      {stats.lowStockItems > 5 && (
                        <div className="text-center pt-2">
                          <Link to="/products">
                            <Button variant="outline" size="sm">
                              View All ({stats.lowStockItems})
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Operations</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingOperations.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <Clock className="size-8 mx-auto mb-2 opacity-50" />
                      <p>No pending operations</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingOperations.map((op) => {
                        const Icon = op.icon;
                        return (
                          <Link key={op.id} to={`/${op.type === 'receipt' ? 'receipts' : op.type === 'delivery' ? 'deliveries' : op.type === 'transfer' ? 'transfers' : 'adjustments'}`}>
                            <div className="flex items-center justify-between p-3 bg-muted rounded-md hover:bg-accent transition-colors cursor-pointer">
                              <div className="flex items-center gap-3">
                                <Icon className={`size-5 ${op.color}`} />
                                <div>
                                  <p className="font-medium">{op.title}</p>
                                  <p className="text-sm text-muted-foreground">{op.description}</p>
                                </div>
                              </div>
                              <Clock className="size-5 text-yellow-600" />
                            </div>
                          </Link>
                        );
                      })}
                      <div className="text-center pt-2">
                        <Link to="/receipts">
                          <Button variant="outline" size="sm" className="mr-2">
                            View Receipts
                          </Button>
                        </Link>
                        <Link to="/deliveries">
                          <Button variant="outline" size="sm">
                            View Deliveries
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
