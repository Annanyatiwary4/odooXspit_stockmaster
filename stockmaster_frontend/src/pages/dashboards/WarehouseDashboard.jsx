import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Truck, Move, Package, FileText, AlertTriangle, Warehouse, CheckCircle2, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { receiptsAPI, deliveriesAPI, transfersAPI, adjustmentsAPI, productsAPI } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

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
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      link: "/receipts",
      description: "Awaiting validation"
    },
    { 
      title: "Pending Deliveries", 
      value: stats.pendingDeliveries.toString(), 
      icon: Truck, 
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-800",
      link: "/deliveries",
      description: "Ready to process"
    },
    { 
      title: "Scheduled Transfers", 
      value: stats.scheduledTransfers.toString(), 
      icon: Move, 
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      link: "/transfers",
      description: "Ready to execute"
    },
    { 
      title: "Pending Adjustments", 
      value: stats.pendingAdjustments.toString(), 
      icon: FileText, 
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      link: "/adjustments",
      description: "Awaiting validation"
    },
    { 
      title: "Low Stock Items", 
      value: stats.lowStockItems.toString(), 
      icon: AlertTriangle, 
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      borderColor: "border-orange-200 dark:border-orange-800",
      link: "/stock",
      description: "Need attention"
    },
  ];

  const getStatusBadge = (status) => {
    const badges = {
      draft: { label: "Draft", variant: "secondary" },
      waiting: { label: "Waiting", variant: "outline" },
      ready: { label: "Ready", variant: "default" },
      picking: { label: "Picking", variant: "default" },
      packed: { label: "Packed", variant: "default" },
      done: { label: "Done", variant: "secondary" },
      canceled: { label: "Canceled", variant: "destructive" },
    };
    const badge = badges[status] || { label: status, variant: "outline" };
    return <Badge variant={badge.variant} className="text-xs">{badge.label}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Warehouse Dashboard</h1>
            <p className="text-muted-foreground mt-1.5">
              Manage daily operations and track pending tasks
            </p>
          </div>
          {user?.assignedWarehouse && (
            <Card className="border-2">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Warehouse className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned Warehouse</p>
                    <p className="font-semibold">{user.assignedWarehouse?.name || 'Warehouse'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Activity className="size-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {kpis.map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <Link key={kpi.title} to={kpi.link}>
                    <Card className={`border-2 ${kpi.borderColor} hover:shadow-lg transition-all cursor-pointer group`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-lg ${kpi.bgColor} group-hover:scale-110 transition-transform`}>
                            <Icon className={`size-5 ${kpi.color}`} />
                          </div>
                          {parseInt(kpi.value) > 0 && (
                            <div className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                              {kpi.value}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">{kpi.title}</p>
                          <p className="text-3xl font-bold mb-1">{kpi.value}</p>
                          <p className="text-xs text-muted-foreground">{kpi.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Tasks */}
              <Card className="lg:col-span-2">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="size-5" />
                      Today's Tasks
                    </CardTitle>
                    {todayTasks.length > 0 && (
                      <Badge variant="secondary">{todayTasks.length} pending</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {todayTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="size-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="text-muted-foreground font-medium">All caught up!</p>
                      <p className="text-sm text-muted-foreground mt-1">No pending tasks for today.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {todayTasks.map((task, index) => {
                        const Icon = task.icon;
                        return (
                          <Link key={index} to={task.link}>
                            <div className={`flex items-center justify-between p-4 ${task.bgColor} rounded-lg border hover:shadow-md transition-all cursor-pointer group`}>
                              <div className="flex items-center gap-4 flex-1">
                                <div className={`p-2 rounded-lg bg-background ${task.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                                  <Icon className="size-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm group-hover:underline">{task.title}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                                    <span className="text-muted-foreground">•</span>
                                    {getStatusBadge(task.status)}
                                  </div>
                                </div>
                              </div>
                              <Icon className={`size-5 ${task.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="size-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-2.5">
                    <Link to="/receipts">
                      <Button variant="outline" className="w-full justify-start h-auto py-3 hover:bg-accent hover:border-primary transition-colors group">
                        <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/20 mr-3 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/40 transition-colors">
                          <Receipt className="size-4 text-blue-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">Create Receipt</p>
                          <p className="text-xs text-muted-foreground">Record incoming stock</p>
                        </div>
                      </Button>
                    </Link>
                    <Link to="/deliveries">
                      <Button variant="outline" className="w-full justify-start h-auto py-3 hover:bg-accent hover:border-primary transition-colors group">
                        <div className="p-2 rounded-md bg-green-50 dark:bg-green-950/20 mr-3 group-hover:bg-green-100 dark:group-hover:bg-green-950/40 transition-colors">
                          <Truck className="size-4 text-green-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">Process Delivery</p>
                          <p className="text-xs text-muted-foreground">Pick and pack orders</p>
                        </div>
                      </Button>
                    </Link>
                    <Link to="/transfers">
                      <Button variant="outline" className="w-full justify-start h-auto py-3 hover:bg-accent hover:border-primary transition-colors group">
                        <div className="p-2 rounded-md bg-purple-50 dark:bg-purple-950/20 mr-3 group-hover:bg-purple-100 dark:group-hover:bg-purple-950/40 transition-colors">
                          <Move className="size-4 text-purple-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">Execute Transfer</p>
                          <p className="text-xs text-muted-foreground">Move stock between locations</p>
                        </div>
                      </Button>
                    </Link>
                    <Link to="/adjustments">
                      <Button variant="outline" className="w-full justify-start h-auto py-3 hover:bg-accent hover:border-primary transition-colors group">
                        <div className="p-2 rounded-md bg-yellow-50 dark:bg-yellow-950/20 mr-3 group-hover:bg-yellow-100 dark:group-hover:bg-yellow-950/40 transition-colors">
                          <FileText className="size-4 text-yellow-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">Create Adjustment</p>
                          <p className="text-xs text-muted-foreground">Fix stock discrepancies</p>
                        </div>
                      </Button>
                    </Link>
                    <Link to="/stock">
                      <Button variant="outline" className="w-full justify-start h-auto py-3 hover:bg-accent hover:border-primary transition-colors group">
                        <div className="p-2 rounded-md bg-primary/10 mr-3 group-hover:bg-primary/20 transition-colors">
                          <Package className="size-4 text-primary" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">View Stock</p>
                          <p className="text-xs text-muted-foreground">Check inventory levels</p>
                        </div>
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