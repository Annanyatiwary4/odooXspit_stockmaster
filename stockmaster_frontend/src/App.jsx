import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./components/auth/login";
import { Signup } from "./components/auth/Signup";
import { ForgotPassword } from "./components/auth/ForgotPassword";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { Products } from "./pages/Products";
import { Deliveries } from "./pages/Deliveries";
import { MyTasks } from "./pages/MyTasks";
import { Alerts } from "./pages/Alerts";
import { Warehouses } from "./pages/Warehouses";
import { Receipts } from "./pages/Receipts";
import { Transfers } from "./pages/Transfers";
import { Adjustments } from "./pages/Adjustments";
import { Users } from "./pages/Users";
import { Reports } from "./pages/Reports";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-tasks"
        element={
          <ProtectedRoute requiredRole="staff">
            <DashboardLayout>
              <MyTasks />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Products />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/warehouses"
        element={
          <ProtectedRoute requiredRole={["admin", "manager"]}>
            <DashboardLayout>
              <Warehouses />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/receipts"
        element={
          <ProtectedRoute requiredRole={["admin", "manager"]}>
            <DashboardLayout>
              <Receipts />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/deliveries"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Deliveries />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transfers"
        element={
          <ProtectedRoute requiredRole={["admin", "manager"]}>
            <DashboardLayout>
              <Transfers />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/adjustments"
        element={
          <ProtectedRoute requiredRole={["admin", "manager"]}>
            <DashboardLayout>
              <Adjustments />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/alerts"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Alerts />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute requiredRole={["admin", "manager"]}>
            <DashboardLayout>
              <Reports />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardLayout>
              <Users />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
