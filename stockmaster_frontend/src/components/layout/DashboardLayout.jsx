import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authUtils } from "@/lib/auth";
import {
  Package,
  LayoutDashboard,
  ShoppingCart,
  Warehouse,
  TruckIcon,
  ArrowLeftRight,
  Settings,
  Users,
  Bell,
  ClipboardList,
  LogOut,
  Menu,
  X,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authUtils.getCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    authUtils.logout();
    navigate('/login');
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "manager", "staff"],
    },
    {
      name: "My Tasks",
      href: "/my-tasks",
      icon: ClipboardList,
      roles: ["staff"],
    },
    {
      name: "Products",
      href: "/products",
      icon: Package,
      roles: ["admin", "manager", "staff"],
    },
    {
      name: "Warehouses",
      href: "/warehouses",
      icon: Warehouse,
      roles: ["admin", "manager"],
    },
    {
      name: "Receipts",
      href: "/receipts",
      icon: ShoppingCart,
      roles: ["admin", "manager"],
    },
    {
      name: "Deliveries",
      href: "/deliveries",
      icon: TruckIcon,
      roles: ["admin", "manager", "staff"],
    },
    {
      name: "Transfers",
      href: "/transfers",
      icon: ArrowLeftRight,
      roles: ["admin", "manager"],
    },
    {
      name: "Adjustments",
      href: "/adjustments",
      icon: Settings,
      roles: ["admin", "manager"],
    },
    {
      name: "Alerts",
      href: "/alerts",
      icon: AlertTriangle,
      roles: ["admin", "manager", "staff"],
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart3,
      roles: ["admin", "manager"],
    },
    {
      name: "Users",
      href: "/users",
      icon: Users,
      roles: ["admin"],
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">StockMaster</span>
            </div>
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* User info */}
          <div className="px-6 py-4 border-b bg-gray-50">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800'
                  : user?.role === 'manager'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6 text-gray-500" />
            </button>

            <div className="flex-1 lg:flex-none">
              <h1 className="text-xl font-semibold text-gray-900">
                {filteredNavigation.find((item) => item.href === location.pathname)?.name || "Dashboard"}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/alerts">
                <button className="relative p-2 text-gray-500 hover:text-gray-700">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
