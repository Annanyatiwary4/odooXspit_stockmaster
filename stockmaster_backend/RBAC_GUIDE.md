# StockMaster RBAC (Role-Based Access Control) Guide

## 🔐 User Roles

### 1. **Admin**
- Full system access
- Can manage users, warehouses, products
- Can create, update, and delete all resources
- Access to all reports and analytics

### 2. **Staff**
- View products and inventory
- Create and validate receipts, deliveries, transfers
- Create stock adjustments
- View dashboard and reports
- Cannot manage users or warehouses

---

## 🚀 Authentication Flow

### 1. Signup/Login
Both admin and staff use the same authentication endpoints:

```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Admin",
  "email": "admin@stockmaster.com",
  "password": "admin123",
  "role": "admin"  // or "staff"
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@stockmaster.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "John Admin",
    "email": "admin@stockmaster.com",
    "role": "admin"
  }
}
```

### 2. Using the Token
Include the token in all authenticated requests:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 Admin Permissions

### User Management (`/api/users`) - **ADMIN ONLY**

#### Create User
```http
POST /api/users
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Jane Staff",
  "email": "jane@stockmaster.com",
  "password": "staff123",
  "role": "staff"
}
```

#### Get All Users
```http
GET /api/users
Authorization: Bearer {admin_token}
```

#### Update User
```http
PUT /api/users/:id
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Jane Updated",
  "role": "admin"
}
```

#### Deactivate User
```http
PATCH /api/users/:id/deactivate
Authorization: Bearer {admin_token}
```

#### Activate User
```http
PATCH /api/users/:id/activate
Authorization: Bearer {admin_token}
```

#### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer {admin_token}
```

---

### Warehouse Management (`/api/warehouses`)

#### Create Warehouse - **ADMIN ONLY**
```http
POST /api/warehouses
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Main Warehouse",
  "code": "WH001",
  "address": "123 Storage St, City"
}
```

#### Update Warehouse - **ADMIN ONLY**
```http
PUT /api/warehouses/:id
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Updated Warehouse",
  "address": "456 New Address"
}
```

#### Delete Warehouse - **ADMIN ONLY**
```http
DELETE /api/warehouses/:id
Authorization: Bearer {admin_token}
```

#### Get All Warehouses - **ADMIN & STAFF**
```http
GET /api/warehouses
Authorization: Bearer {token}
```

#### Get Single Warehouse - **ADMIN & STAFF**
```http
GET /api/warehouses/:id
Authorization: Bearer {token}
```

---

### Product Management (`/api/products`)

#### Create Product - **ADMIN ONLY**
```http
POST /api/products
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Product A",
  "sku": "SKU001",
  "category": "Electronics",
  "uom": "pcs",
  "reorderLevel": 10
}
```

#### Update Product - **ADMIN ONLY**
```http
PUT /api/products/:id
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Updated Product",
  "reorderLevel": 15
}
```

#### Get All Products - **ADMIN & STAFF**
```http
GET /api/products
Authorization: Bearer {token}
```

#### Get Stock by Location - **ADMIN & STAFF**
```http
GET /api/products/:id/stock
Authorization: Bearer {token}
```

---

## 📦 Staff Permissions

Staff can perform all inventory operations but cannot manage users, warehouses, or products.

### Receipt Management - **ADMIN & STAFF**

```http
POST /api/receipts
Authorization: Bearer {token}
Content-Type: application/json

{
  "supplier": "Supplier ABC",
  "location": "WH001",
  "items": [
    {
      "productId": "product_id_here",
      "qty": 100
    }
  ]
}
```

```http
POST /api/receipts/:id/validate
Authorization: Bearer {token}
```

### Delivery Management - **ADMIN & STAFF**

```http
POST /api/delivery
Authorization: Bearer {token}
Content-Type: application/json

{
  "customer": "Customer XYZ",
  "items": [
    {
      "productId": "product_id_here",
      "qty": 50
    }
  ]
}
```

```http
POST /api/delivery/:id/validate
Authorization: Bearer {token}
Content-Type: application/json

{
  "location": "WH001"
}
```

### Transfer Management - **ADMIN & STAFF**

```http
POST /api/transfers
Authorization: Bearer {token}
Content-Type: application/json

{
  "from": "WH001",
  "to": "WH002",
  "items": [
    {
      "productId": "product_id_here",
      "qty": 30
    }
  ]
}
```

```http
POST /api/transfers/:id/validate
Authorization: Bearer {token}
```

### Stock Adjustment - **ADMIN & STAFF**

```http
POST /api/adjustments
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product_id_here",
  "location": "WH001",
  "systemQty": 100,
  "countedQty": 95,
  "reason": "Damaged items"
}
```

---

## 📊 Dashboard & Reports - **ADMIN & STAFF**

### Get Dashboard Stats
```http
GET /api/dashboard
Authorization: Bearer {token}
```

**Response includes:**
- Total products count
- Total inventory stock
- Low stock products (below reorder level)
- Pending receipts
- Pending deliveries
- Pending transfers
- Product category breakdown

### Get Stock Movement History
```http
GET /api/dashboard/stock-movement?productId=xxx&startDate=2025-01-01&endDate=2025-12-31&limit=50
Authorization: Bearer {token}
```

**Query Parameters:**
- `productId` (optional) - Filter by specific product
- `startDate` (optional) - Start date for filtering
- `endDate` (optional) - End date for filtering
- `limit` (optional) - Number of records (default: 50)

**Response includes:**
- Adjustments history
- Validated receipts
- Validated deliveries
- Validated transfers

### Get Warehouse Level Stock
```http
GET /api/dashboard/warehouse-stock
Authorization: Bearer {token}
```

**Response includes:**
- Stock breakdown by warehouse/location
- Products in each location
- Total items per warehouse

---

## 🔒 Access Control Matrix

| Feature | Admin | Staff |
|---------|-------|-------|
| **User Management** | ✅ Full Access | ❌ No Access |
| **Warehouse Management** | ✅ Create/Update/Delete | 👁️ View Only |
| **Product Management** | ✅ Create/Update | 👁️ View Only |
| **Receipt Operations** | ✅ Full Access | ✅ Full Access |
| **Delivery Operations** | ✅ Full Access | ✅ Full Access |
| **Transfer Operations** | ✅ Full Access | ✅ Full Access |
| **Stock Adjustments** | ✅ Full Access | ✅ Full Access |
| **Dashboard & Reports** | ✅ Full Access | ✅ Full Access |

---

## 🛡️ Security Features

1. **JWT Authentication** - Token-based authentication for all protected routes
2. **Role-Based Authorization** - Middleware checks user role before allowing access
3. **Password Hashing** - bcryptjs with salt rounds for secure password storage
4. **User Deactivation** - Admins can deactivate users without deleting them
5. **Token Expiration** - JWT tokens expire after 7 days

---

## 🚨 Error Responses

### 401 Unauthorized
```json
{
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied. Admin privileges required."
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 400 Bad Request
```json
{
  "message": "Invalid role. Must be 'admin' or 'staff'"
}
```

---

## 📝 Notes

- Default role is "staff" if not specified during signup
- Only users with `isActive: true` can log in
- Admins can assign roles when creating users
- Password cannot be updated through the user update endpoint (use password reset flow)
- All timestamps are managed automatically by MongoDB

---

## 🔧 Testing with Postman/Thunder Client

1. **Create Admin User** - Use signup with role: "admin"
2. **Login as Admin** - Get the JWT token
3. **Create Staff User** - Use admin token to create staff
4. **Login as Staff** - Get staff JWT token
5. **Test Permissions** - Try accessing admin-only routes with staff token (should fail)
6. **Test Operations** - Staff can perform inventory operations

---

## 🎯 Complete Admin Workflow

1. ✅ Signup/Login as Admin
2. ✅ Create Warehouses
3. ✅ Create Products with SKU, category, UOM
4. ✅ Set reorder levels for products
5. ✅ Create Staff users
6. ✅ View all users and manage roles
7. ✅ Monitor dashboard for:
   - Total inventory
   - Low stock alerts
   - Warehouse-level stock
   - Product categories
   - Stock movement history
8. ✅ Deactivate/Activate users as needed
