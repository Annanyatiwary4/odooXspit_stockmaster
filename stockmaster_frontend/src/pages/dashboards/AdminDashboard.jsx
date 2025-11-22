import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, Clock, Truck, Move } from "lucide-react";

export function AdminDashboard() {
  // Mock data - replace with actual API calls
  const kpis = [
    { title: "Total Products", value: "1,234", icon: Package, color: "text-blue-600" },
    { title: "Low Stock Items", value: "23", icon: AlertTriangle, color: "text-orange-600" },
    { title: "Pending Receipts", value: "12", icon: Clock, color: "text-yellow-600" },
    { title: "Pending Deliveries", value: "8", icon: Truck, color: "text-purple-600" },
    { title: "Scheduled Transfers", value: "5", icon: Move, color: "text-green-600" },
  ];

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
          {kpis.map((kpi) => {
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
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New receipt created</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Delivery order validated</p>
                    <p className="text-sm text-muted-foreground">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Stock adjustment completed</p>
                    <p className="text-sm text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 rounded-md hover:bg-accent transition-colors">
                  Create New Receipt
                </button>
                <button className="w-full text-left px-4 py-2 rounded-md hover:bg-accent transition-colors">
                  Create Delivery Order
                </button>
                <button className="w-full text-left px-4 py-2 rounded-md hover:bg-accent transition-colors">
                  Schedule Transfer
                </button>
                <button className="w-full text-left px-4 py-2 rounded-md hover:bg-accent transition-colors">
                  Add New Product
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

