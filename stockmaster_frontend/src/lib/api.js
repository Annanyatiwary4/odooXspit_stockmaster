// API Configuration and HTTP Client
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async signup(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async sendOTP(email) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(data) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Products
  async getProducts() {
    return this.request('/products');
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async getProductStock(id) {
    return this.request(`/products/${id}/stock`);
  }

  // Warehouses
  async getWarehouses() {
    return this.request('/warehouses');
  }

  async createWarehouse(warehouseData) {
    return this.request('/warehouses', {
      method: 'POST',
      body: JSON.stringify(warehouseData),
    });
  }

  async updateWarehouse(id, warehouseData) {
    return this.request(`/warehouses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(warehouseData),
    });
  }

  async deleteWarehouse(id) {
    return this.request(`/warehouses/${id}`, {
      method: 'DELETE',
    });
  }

  // Receipts
  async getReceipts() {
    return this.request('/receipts');
  }

  async createReceipt(receiptData) {
    return this.request('/receipts', {
      method: 'POST',
      body: JSON.stringify(receiptData),
    });
  }

  async validateReceipt(id) {
    return this.request(`/receipts/${id}/validate`, {
      method: 'POST',
    });
  }

  // Deliveries
  async getDeliveries() {
    return this.request('/delivery');
  }

  async createDelivery(deliveryData) {
    return this.request('/delivery', {
      method: 'POST',
      body: JSON.stringify(deliveryData),
    });
  }

  async assignPicker(id, pickerId) {
    return this.request(`/delivery/${id}/assign-picker`, {
      method: 'POST',
      body: JSON.stringify({ pickerId }),
    });
  }

  async completePicking(id, pickedItems) {
    return this.request(`/delivery/${id}/complete-picking`, {
      method: 'POST',
      body: JSON.stringify({ pickedItems }),
    });
  }

  async assignPacker(id, packerId) {
    return this.request(`/delivery/${id}/assign-packer`, {
      method: 'POST',
      body: JSON.stringify({ packerId }),
    });
  }

  async completePacking(id, packedItems) {
    return this.request(`/delivery/${id}/complete-packing`, {
      method: 'POST',
      body: JSON.stringify({ packedItems }),
    });
  }

  async validateDelivery(id, location) {
    return this.request(`/delivery/${id}/validate`, {
      method: 'POST',
      body: JSON.stringify({ location }),
    });
  }

  async getMyTasks() {
    return this.request('/delivery/my-tasks');
  }

  // Transfers
  async getTransfers() {
    return this.request('/transfers');
  }

  async createTransfer(transferData) {
    return this.request('/transfers', {
      method: 'POST',
      body: JSON.stringify(transferData),
    });
  }

  async validateTransfer(id) {
    return this.request(`/transfers/${id}/validate`, {
      method: 'POST',
    });
  }

  // Adjustments
  async getAdjustments() {
    return this.request('/adjustments');
  }

  async createAdjustment(adjustmentData) {
    return this.request('/adjustments', {
      method: 'POST',
      body: JSON.stringify(adjustmentData),
    });
  }

  // Alerts
  async getAlerts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/alerts${query ? `?${query}` : ''}`);
  }

  async generateAlerts() {
    return this.request('/alerts/generate', {
      method: 'POST',
    });
  }

  async acknowledgeAlert(id) {
    return this.request(`/alerts/${id}/acknowledge`, {
      method: 'POST',
    });
  }

  async resolveAlert(id) {
    return this.request(`/alerts/${id}/resolve`, {
      method: 'POST',
    });
  }

  async getAlertSummary() {
    return this.request('/alerts/summary');
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/dashboard');
  }

  async getStockMovement(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/dashboard/stock-movement${query ? `?${query}` : ''}`);
  }

  async getWarehouseStock() {
    return this.request('/dashboard/warehouse-stock');
  }

  // Users (Admin only)
  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deactivateUser(id) {
    return this.request(`/users/${id}/deactivate`, {
      method: 'PATCH',
    });
  }

  async activateUser(id) {
    return this.request(`/users/${id}/activate`, {
      method: 'PATCH',
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
