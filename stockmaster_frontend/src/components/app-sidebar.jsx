import { Link, useNavigate } from "react-router-dom";
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
// ThemeToggle intentionally omitted from footer per design
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { User2, ChevronUp } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  Receipt,
  Truck,
  Move,
  FileText,
  Settings,
  User,
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
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        <div className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <User2 />
                    <div className="font-medium">{user?.name}</div>
                  </div>
                  <div className="capitalize text-muted-foreground text-xs">{user?.role}</div>
                </div>
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton>
                        
                        <ChevronUp className="ml-2" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                      <DropdownMenuItem>
                        <Link to="/profile" className="w-full block">My Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { handleLogout(); }}>
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
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
