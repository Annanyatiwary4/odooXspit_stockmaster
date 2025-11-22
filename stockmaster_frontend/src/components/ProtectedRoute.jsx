import { Navigate } from 'react-router-dom';
import { authUtils } from '@/lib/auth';

export function ProtectedRoute({ children, requiredRole }) {
  const isAuthenticated = authUtils.isAuthenticated();
  const user = authUtils.getCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!allowedRoles.includes(user?.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
            <p className="text-xl text-gray-600 mb-8">Access Denied</p>
            <p className="text-gray-500">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }
  }

  return children;
}
