import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Truck, Move, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function WarehouseDashboard() {
  // Mock data - replace with actual API calls
  const tasks = [
    { type: "Receipt", count: 5, icon: Receipt, path: "/receipts", color: "text-blue-600" },
    { type: "Delivery", count: 3, icon: Truck, path: "/deliveries", color: "text-green-600" },
    { type: "Transfer", count: 2, icon: Move, path: "/transfers", color: "text-purple-600" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Warehouse Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Perform transfers, picking, shelving, and counting
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tasks.map((task) => {
            const Icon = task.icon;
            return (
              <Card key={task.type}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending {task.type}s
                  </CardTitle>
                  <Icon className={`size-5 ${task.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">{task.count}</div>
                  <Link to={task.path}>
                    <Button variant="outline" className="w-full">
                      View {task.type}s
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                  <div>
                    <p className="font-medium">Receive Steel Rods</p>
                    <p className="text-sm text-muted-foreground">Receipt #R-001</p>
                  </div>
                  <Receipt className="size-5 text-blue-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-md">
                  <div>
                    <p className="font-medium">Pack Delivery Order</p>
                    <p className="text-sm text-muted-foreground">Delivery #D-045</p>
                  </div>
                  <Truck className="size-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-md">
                  <div>
                    <p className="font-medium">Transfer to Production</p>
                    <p className="text-sm text-muted-foreground">Transfer #T-012</p>
                  </div>
                  <Move className="size-5 text-purple-600" />
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
                    Create Transfer
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

