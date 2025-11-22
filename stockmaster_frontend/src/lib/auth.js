// Authentication utilities
export const authUtils = {
  // Save user data and token
  login(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Remove user data and token
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get token
  getToken() {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  },

  // Check user role
  hasRole(role) {
    const user = this.getCurrentUser();
    return user?.role === role;
  },

  // Check if user is admin
  isAdmin() {
    return this.hasRole('admin');
  },

  // Check if user is manager
  isManager() {
    return this.hasRole('manager');
  },

  // Check if user is staff
  isStaff() {
    return this.hasRole('staff');
  },

  // Check if user is admin or manager
  isAdminOrManager() {
    const user = this.getCurrentUser();
    return user?.role === 'admin' || user?.role === 'manager';
  },

  // Check if user has permission for action
  canPerform(action) {
    const user = this.getCurrentUser();
    if (!user) return false;

    const permissions = {
      admin: [
        'manage_users',
        'manage_warehouses',
        'manage_products',
        'manage_receipts',
        'manage_deliveries',
        'manage_transfers',
        'manage_adjustments',
        'view_reports',
        'manage_alerts',
      ],
      manager: [
        'manage_products',
        'manage_receipts',
        'manage_deliveries',
        'manage_transfers',
        'manage_adjustments',
        'view_reports',
        'manage_alerts',
      ],
      staff: ['view_products', 'perform_picking', 'perform_packing', 'view_tasks'],
    };

    return permissions[user.role]?.includes(action) || false;
  },
};
