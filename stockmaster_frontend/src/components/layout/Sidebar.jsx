import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
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

import { Users as UsersIcon } from "lucide-react";

const menuItems = {
  admin: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/admin" },
    { icon: Package, label: "Products", path: "/products" },
    { icon: Warehouse, label: "Warehouses", path: "/warehouses" },
    { icon: UsersIcon, label: "Users", path: "/admin/users" },
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

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, isManager, isWarehouse } = useAuth();

  const getMenuItems = () => {
    if (isAdmin()) return menuItems.admin;
    if (isManager()) return menuItems.manager;
    return menuItems.warehouse;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">StockMaster</h1>
        <p className="text-sm text-sidebar-foreground/70 mt-1">Inventory Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {getMenuItems().map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-1">
        <div className="px-4 py-2">
          <ThemeToggle />
        </div>
        <Link
          to="/profile"
          className="flex items-center gap-3 px-4 py-2 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
        >
          <User className="size-5" />
          <span>My Profile</span>
        </Link>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        >
          <LogOut className="size-5 mr-3" />
          Logout
        </Button>
        <div className="px-4 py-2 text-sm text-sidebar-foreground/50">
          <p className="font-medium">{user?.name}</p>
          <p className="text-xs capitalize">{user?.role}</p>
        </div>
      </div>
    </div>
  );
}

