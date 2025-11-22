import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardRedirect() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      const role = user.role || 'warehouse';
      if (role === 'admin') {
        navigate('/dashboard/admin', { replace: true });
      } else if (role === 'manager') {
        navigate('/dashboard/manager', { replace: true });
      } else {
        navigate('/dashboard/warehouse', { replace: true });
      }
    } else if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

