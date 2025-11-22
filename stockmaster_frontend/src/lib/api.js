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

export default apiRequest;

