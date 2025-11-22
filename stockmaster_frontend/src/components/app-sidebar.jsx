import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  LayoutDashboard,
  Package,
  Receipt,
  Truck,
  Move,
  FileText,
  Settings,
  User,
  LogOut,
  Warehouse,
} from "lucide-react";

const items = {
  admin: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/admin" },
    { icon: Package, label: "Products", path: "/products" },
    { icon: Warehouse, label: "Warehouses", path: "/warehouses" },
    { icon: Package, label: "Stock Management", path: "/admin/stock" },
    { icon: User, label: "Users", path: "/admin/users" },
    { icon: Receipt, label: "Receipts", path: "/receipts" },
    { icon: Truck, label: "Deliveries", path: "/deliveries" },
    { icon: Move, label: "Transfers", path: "/transfers" },
    { icon: FileText, label: "Adjustments", path: "/adjustments" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ],
  manager: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/manager" },
    { icon: Package, label: "Products", path: "/products" },
    { icon: Receipt, label: "Receipts", path: "/receipts" },
    { icon: Truck, label: "Deliveries", path: "/deliveries" },
    { icon: Move, label: "Transfers", path: "/transfers" },
    { icon: FileText, label: "Adjustments", path: "/adjustments" },
  ],
  warehouse: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/warehouse" },
    { icon: Receipt, label: "Receipts", path: "/receipts" },
    { icon: Truck, label: "Deliveries", path: "/deliveries" },
    { icon: Move, label: "Transfers", path: "/transfers" },
  ],
};

export function AppSidebarContent() {
  const { user, logout, isAdmin, isManager } = useAuth();

  const getMenuItems = () => {
    if (isAdmin()) return items.admin;
    if (isManager()) return items.manager;
    return items.warehouse;
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-4">
          <h1 className="text-lg font-bold">StockMaster</h1>
          <p className="text-sm text-muted-foreground">Inventory</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {getMenuItems().map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <Link to={item.path} className="flex items-center gap-3">
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 space-y-2">
          <ThemeToggle />
          <div className="text-sm">
            <div className="font-medium">{user?.name}</div>
            <div className="capitalize text-muted-foreground text-xs">{user?.role}</div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppSidebar({ defaultOpen }) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebarContent />
    </SidebarProvider>
  );
}

export default AppSidebar;
