import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, Clock, Truck } from "lucide-react";

export function ManagerDashboard() {
  // Mock data - replace with actual API calls
  const kpis = [
    { title: "Total Products", value: "1,234", icon: Package, color: "text-blue-600" },
    { title: "Low Stock Items", value: "23", icon: AlertTriangle, color: "text-orange-600" },
    { title: "Pending Receipts", value: "12", icon: Clock, color: "text-yellow-600" },
    { title: "Pending Deliveries", value: "8", icon: Truck, color: "text-purple-600" },
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <CardTitle>Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-md">
                  <div>
                    <p className="font-medium">Steel Rods</p>
                    <p className="text-sm text-muted-foreground">15 units remaining</p>
                  </div>
                  <AlertTriangle className="size-5 text-orange-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-md">
                  <div>
                    <p className="font-medium">Wooden Planks</p>
                    <p className="text-sm text-muted-foreground">8 units remaining</p>
                  </div>
                  <AlertTriangle className="size-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Receipt #R-001</p>
                    <p className="text-sm text-muted-foreground">Waiting for validation</p>
                  </div>
                  <Clock className="size-5 text-yellow-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Delivery #D-045</p>
                    <p className="text-sm text-muted-foreground">Ready for packing</p>
                  </div>
                  <Truck className="size-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

