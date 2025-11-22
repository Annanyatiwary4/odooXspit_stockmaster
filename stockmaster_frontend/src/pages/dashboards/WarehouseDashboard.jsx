import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Truck, Move, Package, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { receiptsAPI, deliveriesAPI, transfersAPI, adjustmentsAPI, productsAPI } from "@/lib/api";

function WarehouseDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingReceipts: 0,
    pendingDeliveries: 0,
    scheduledTransfers: 0,
    pendingAdjustments: 0,
    lowStockItems: 0,
  });
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load pending receipts (ready status)
      const receiptsRes = await receiptsAPI.getAll({ status: 'ready', limit: 100 });
      const pendingReceipts = receiptsRes.pagination?.total || receiptsRes.data?.length || 0;

      // Load pending deliveries (ready or picking status)
      const deliveriesRes = await deliveriesAPI.getAll({ status: 'ready', limit: 100 });
      const pendingDeliveries = deliveriesRes.pagination?.total || deliveriesRes.data?.length || 0;

      // Load scheduled transfers (ready status)
      const transfersRes = await transfersAPI.getAll({ status: 'ready', limit: 100 });
      const scheduledTransfers = transfersRes.pagination?.total || transfersRes.data?.length || 0;

      // Load pending adjustments (draft status)
      const adjustmentsRes = await adjustmentsAPI.getAll({ status: 'draft', limit: 100 });
      const pendingAdjustments = adjustmentsRes.pagination?.total || adjustmentsRes.data?.length || 0;

      // Load products to check for low stock
      const productsRes = await productsAPI.getAll({ limit: 1000 });
      const products = productsRes.data || [];
      const lowStock = products.filter(p => {
        return p.totalStock <= p.reorderLevel && p.status === 'active';
      });
      const lowStockItems = lowStock.length;

      // Get today's tasks (pending operations)
      const tasks = [];
      if (receiptsRes.data && receiptsRes.data.length > 0) {
        receiptsRes.data.slice(0, 3).forEach(r => {
          tasks.push({
            type: 'receipt',
            id: r._id,
            number: r.receiptNumber,
            title: `Receive ${r.supplier}`,
            description: `Receipt ${r.receiptNumber}`,
            status: r.status,
            icon: Receipt,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950/20",
            link: "/receipts"
          });
        });
      }
      if (deliveriesRes.data && deliveriesRes.data.length > 0) {
        deliveriesRes.data.slice(0, 3).forEach(d => {
          tasks.push({
            type: 'delivery',
            id: d._id,
            number: d.deliveryNumber,
            title: `Pack Delivery ${d.deliveryNumber}`,
            description: `Customer: ${d.customer}`,
            status: d.status,
            icon: Truck,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950/20",
            link: "/deliveries"
          });
        });
      }
      if (transfersRes.data && transfersRes.data.length > 0) {
        transfersRes.data.slice(0, 2).forEach(t => {
          tasks.push({
            type: 'transfer',
            id: t._id,
            number: t.transferNumber,
            title: `Execute Transfer ${t.transferNumber}`,
            description: `${t.sourceWarehouseId?.name || 'Source'} → ${t.destinationWarehouseId?.name || 'Dest'}`,
            status: t.status,
            icon: Move,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950/20",
            link: "/transfers"
          });
        });
      }
      setTodayTasks(tasks.slice(0, 5));

      setStats({
        pendingReceipts,
        pendingDeliveries,
        scheduledTransfers,
        pendingAdjustments,
        lowStockItems,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const kpis = [
    { 
      title: "Pending Receipts", 
      value: stats.pendingReceipts.toString(), 
      icon: Receipt, 
      color: "text-blue-600",
      link: "/receipts"
    },
    { 
      title: "Pending Deliveries", 
      value: stats.pendingDeliveries.toString(), 
      icon: Truck, 
      color: "text-green-600",
      link: "/deliveries"
    },
    { 
      title: "Scheduled Transfers", 
      value: stats.scheduledTransfers.toString(), 
      icon: Move, 
      color: "text-purple-600",
      link: "/transfers"
    },
    { 
      title: "Pending Adjustments", 
      value: stats.pendingAdjustments.toString(), 
      icon: FileText, 
      color: "text-yellow-600",
      link: "/adjustments"
    },
    { 
      title: "Low Stock Items", 
      value: stats.lowStockItems.toString(), 
      icon: AlertTriangle, 
      color: "text-orange-600",
      link: "/products"
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Warehouse Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Perform transfers, picking, shelving, and counting
            {user?.assignedWarehouse && (
              <span className="ml-2 text-sm">
                • Assigned to: {user.assignedWarehouse?.name || 'Warehouse'}
              </span>
            )}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  <CardTitle>Today's Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  {todayTasks.length === 0 ? (
                    <p className="text-muted-foreground">No pending tasks for today.</p>
                  ) : (
                    <div className="space-y-4">
                      {todayTasks.map((task, index) => {
                        const Icon = task.icon;
                        return (
                          <Link key={index} to={task.link}>
                            <div className={`flex items-center justify-between p-3 ${task.bgColor} rounded-md hover:opacity-80 transition-opacity cursor-pointer`}>
                              <div>
                                <p className="font-medium">{task.title}</p>
                                <p className="text-sm text-muted-foreground">{task.description} | Status: {task.status}</p>
                              </div>
                              <Icon className={`size-5 ${task.color}`} />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link to="/receipts">
                      <Button variant="outline" className="w-full justify-start">
                        <Receipt className="size-4 mr-2" />
                        Create Receipt
                      </Button>
                    </Link>
                    <Link to="/deliveries">
                      <Button variant="outline" className="w-full justify-start">
                        <Truck className="size-4 mr-2" />
                        Process Delivery
                      </Button>
                    </Link>
                    <Link to="/transfers">
                      <Button variant="outline" className="w-full justify-start">
                        <Move className="size-4 mr-2" />
                        Execute Transfer
                      </Button>
                    </Link>
                    <Link to="/adjustments">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="size-4 mr-2" />
                        Create Adjustment
                      </Button>
                    </Link>
                    <Link to="/stock">
                      <Button variant="outline" className="w-full justify-start">
                        <Package className="size-4 mr-2" />
                        View Stock
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export { WarehouseDashboard };