// API configuration and utilities
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to handle API requests
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  // Build headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Build request config
  const config = {
    method: options.method || 'GET',
    headers,
    ...options,
  };

  // Stringify body if it's an object and not already a string/FormData
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Check if response has content
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        // If JSON parsing fails, use the response text
        const text = await response.text();
        throw new Error(text || 'Invalid JSON response');
      }
    } else {
      // For non-JSON responses, get text
      const text = await response.text();
      data = text ? { message: text } : {};
    }

    if (!response.ok) {
      // Extract error message from response
      const errorMessage = data.message || data.error || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server');
    }
    // Re-throw if it's already our custom error
    throw error;
  }
}

// Auth API
export const authAPI = {
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  signup: async (name, email, password, role = 'warehouse') => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: { name, email, password, role },
    });
  },

  requestPasswordReset: async (email) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },

  verifyOTP: async (email, otp) => {
    return apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: { email, otp },
    });
  },

  resetPassword: async (email, otp, newPassword) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: { email, otp, newPassword },
    });
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },
};

// Products API
export const productsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products?${queryString}`);
  },
  getById: async (id) => {
    return apiRequest(`/products/${id}`);
  },
  create: async (data) => {
    return apiRequest('/products', {
      method: 'POST',
      body: data,
    });
  },
  update: async (id, data) => {
    return apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: data,
    });
  },
  delete: async (id) => {
    return apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },
  updateStock: async (id, locationId, quantity) => {
    return apiRequest(`/products/${id}/stock`, {
      method: 'PUT',
      body: { locationId, quantity },
    });
  },
  getCategories: async () => {
    return apiRequest('/products/categories');
  },
};

// Warehouses API
export const warehousesAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/warehouses?${queryString}`);
  },
  getById: async (id) => {
    return apiRequest(`/warehouses/${id}`);
  },
  create: async (data) => {
    return apiRequest('/warehouses', {
      method: 'POST',
      body: data,
    });
  },
  update: async (id, data) => {
    return apiRequest(`/warehouses/${id}`, {
      method: 'PUT',
      body: data,
    });
  },
  delete: async (id) => {
    return apiRequest(`/warehouses/${id}`, {
      method: 'DELETE',
    });
  },
  addLocation: async (warehouseId, data) => {
    return apiRequest(`/warehouses/${warehouseId}/locations`, {
      method: 'POST',
      body: data,
    });
  },
  updateLocation: async (warehouseId, locationId, data) => {
    return apiRequest(`/warehouses/${warehouseId}/locations/${locationId}`, {
      method: 'PUT',
      body: data,
    });
  },
  deleteLocation: async (warehouseId, locationId) => {
    return apiRequest(`/warehouses/${warehouseId}/locations/${locationId}`, {
      method: 'DELETE',
    });
  },
};

// Admin API
export const adminAPI = {
  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users?${queryString}`);
  },
  createUser: async (data) => {
    return apiRequest('/admin/users', {
      method: 'POST',
      body: data,
    });
  },
  updateUser: async (id, data) => {
    return apiRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: data,
    });
  },
  deactivateUser: async (id) => {
    return apiRequest(`/admin/users/${id}/deactivate`, {
      method: 'PUT',
    });
  },
  getDashboardStats: async () => {
    return apiRequest('/admin/dashboard');
  },
};

export default apiRequest;

