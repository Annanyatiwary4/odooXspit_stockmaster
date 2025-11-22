# StockMaster API - Three Role System

## 🔐 User Roles & Responsibilities

### 1. Admin 👑
**Controls Everything** - Full system access and management capabilities

**Permissions:**
- ✅ Product Management: Create, edit, delete all products
- ✅ Warehouse Management: Create, update, delete warehouses
- ✅ User Management: Create users, assign roles, deactivate users
- ✅ Dashboard & Reports: Complete inventory overview
- ✅ System Settings: Configure system-wide settings
- ✅ All Manager and Staff permissions

### 2. Inventory Manager 📊
**Handles Inventory Operations** - Manages incoming & outgoing stock

**Permissions:**
- ✅ **Receive Goods**: Create and validate receipts
- ✅ **Delivery Orders**: Create deliveries, assign pickers/packers, validate deliveries
- ✅ **Inventory Adjustments**: Adjust stock for damaged/lost/found items
- ✅ **Internal Transfers**: Move stock between warehouses/locations
- ✅ **Alerts Management**: View, acknowledge, and resolve stock alerts
- ✅ **Product Management**: Create and update products
- ✅ **Reports**: View all inventory reports and analytics
- ❌ Cannot manage users or system settings

### 3. Warehouse Staff / Operator 🧑‍🔧
**Handles Day-to-Day Operations** - Performs physical operations

**Permissions:**
- ✅ View available stock
- ✅ Complete assigned picking tasks
- ✅ Complete assigned packing tasks
- ✅ View assigned delivery tasks
- ✅ View inventory levels
- ❌ Cannot create/validate receipts or deliveries
- ❌ Cannot manage products or warehouses
- ❌ Cannot manage users

---

## 📋 API Endpoints by Role

### Authentication Endpoints (Public)

#### Signup
```http
POST /api/auth/signup
{
  "name": "Admin User",
  "email": "admin@stockmaster.com",
  "password": "admin123",
  "role": "admin"  // or "manager" or "staff"
}
```

#### Login
```http
POST /api/auth/login
{
  "email": "admin@stockmaster.com",
  "password": "admin123"
}
```

---

### Product Management

#### Create Product - **ADMIN & MANAGER ONLY**
```http
POST /api/products
Authorization: Bearer {token}
{
  "name": "Product A",
  "sku": "SKU001",
  "category": "Electronics",
  "uom": "pcs",
  "reorderLevel": 10
}
```

#### View Products - **ALL ROLES**
```http
GET /api/products
Authorization: Bearer {token}
```

---

### Receipt Management (Incoming Stock)

#### Create Receipt - **ADMIN & MANAGER ONLY**
```http
POST /api/receipts
Authorization: Bearer {token}
{
  "supplier": "Supplier ABC",
  "location": "WH001",
  "items": [
    { "productId": "xxx", "qty": 100 }
  ],
  "notes": "Monthly stock order"
}
```

#### Validate Receipt - **ADMIN & MANAGER ONLY**
```http
POST /api/receipts/:id/validate
Authorization: Bearer {token}
```
*This increases stock automatically*

---

### Delivery Management (Outgoing Stock)

#### 1. Create Delivery - **ADMIN & MANAGER ONLY**
```http
POST /api/delivery
Authorization: Bearer {token}
{
  "customer": "Customer XYZ",
  "items": [
    { "productId": "xxx", "qty": 50 }
  ],
  "notes": "Rush delivery"
}
```

#### 2. Assign Picker - **ADMIN & MANAGER ONLY**
```http
POST /api/delivery/:id/assign-picker
Authorization: Bearer {token}
{
  "pickerId": "staff_user_id"
}
```

#### 3. Complete Picking - **STAFF (assigned picker)**
```http
POST /api/delivery/:id/complete-picking
Authorization: Bearer {token}
{
  "pickedItems": [
    { "productId": "xxx", "pickedQty": 50 }
  ]
}
```

#### 4. Assign Packer - **ADMIN & MANAGER ONLY**
```http
POST /api/delivery/:id/assign-packer
Authorization: Bearer {token}
{
  "packerId": "staff_user_id"
}
```

#### 5. Complete Packing - **STAFF (assigned packer)**
```http
POST /api/delivery/:id/complete-packing
Authorization: Bearer {token}
{
  "packedItems": [
    { "productId": "xxx", "packedQty": 50 }
  ]
}
```

#### 6. Validate Delivery - **ADMIN & MANAGER ONLY**
```http
POST /api/delivery/:id/validate
Authorization: Bearer {token}
{
  "location": "WH001"
}
```
*This decreases stock automatically*

#### Get My Tasks - **STAFF**
```http
GET /api/delivery/my-tasks
Authorization: Bearer {token}
```
*Returns picking and packing tasks assigned to the logged-in staff*

---

### Transfer Management (Internal Movements)

#### Create Transfer - **ADMIN & MANAGER ONLY**
```http
POST /api/transfers
Authorization: Bearer {token}
{
  "from": "WH001",
  "to": "WH002",
  "items": [
    { "productId": "xxx", "qty": 30 }
  ]
}
```

#### Validate Transfer - **ADMIN & MANAGER ONLY**
```http
POST /api/transfers/:id/validate
Authorization: Bearer {token}
```
*Moves stock between locations (total stock stays same)*

---

### Inventory Adjustments

#### Adjust Stock - **ADMIN & MANAGER ONLY**
```http
POST /api/adjustments
Authorization: Bearer {token}
{
  "productId": "xxx",
  "location": "WH001",
  "systemQty": 100,
  "countedQty": 95,
  "reason": "Damaged items"
}
```

**Adjustment Types:**
- Damaged goods (reduce stock)
- Lost goods (reduce stock)
- Correction after stock count (increase/decrease)
- Found items (increase stock)

---

### Alerts System

#### Generate Alerts - **ADMIN & MANAGER ONLY**
```http
POST /api/alerts/generate
Authorization: Bearer {token}
```
*Automatically scans for low stock products and creates alerts*

#### Get All Alerts - **ALL ROLES**
```http
GET /api/alerts?status=Active&severity=High
Authorization: Bearer {token}
```

#### Get Alert Summary - **ALL ROLES**
```http
GET /api/alerts/summary
Authorization: Bearer {token}
```

#### Acknowledge Alert - **ADMIN & MANAGER ONLY**
```http
POST /api/alerts/:id/acknowledge
Authorization: Bearer {token}
```

#### Resolve Alert - **ADMIN & MANAGER ONLY**
```http
POST /api/alerts/:id/resolve
Authorization: Bearer {token}
```

**Alert Types:**
- Low Stock
- Out of Stock
- Reorder Suggestion
- Critical Stock

**Alert Severity:**
- Low
- Medium
- High
- Critical

---

### User Management

#### Create User - **ADMIN ONLY**
```http
POST /api/users
Authorization: Bearer {admin_token}
{
  "name": "Manager User",
  "email": "manager@stockmaster.com",
  "password": "manager123",
  "role": "manager",
  "assignedWarehouse": "warehouse_id"
}
```

#### Get All Users - **ADMIN ONLY**
```http
GET /api/users
Authorization: Bearer {admin_token}
```

#### Update User - **ADMIN ONLY**
```http
PUT /api/users/:id
Authorization: Bearer {admin_token}
{
  "role": "manager"
}
```

#### Deactivate User - **ADMIN ONLY**
```http
PATCH /api/users/:id/deactivate
Authorization: Bearer {admin_token}
```

---

### Warehouse Management

#### Create Warehouse - **ADMIN ONLY**
```http
POST /api/warehouses
Authorization: Bearer {admin_token}
{
  "name": "Main Warehouse",
  "code": "WH001",
  "address": "123 Storage St"
}
```

#### View Warehouses - **ALL ROLES**
```http
GET /api/warehouses
Authorization: Bearer {token}
```

---

### Dashboard & Reports

#### Get Dashboard Stats - **ALL ROLES**
```http
GET /api/dashboard
Authorization: Bearer {token}
```

**Returns:**
- Total products count
- Total inventory stock
- Low stock products
- Pending receipts
- Pending deliveries
- Pending transfers
- Product category breakdown

#### Get Stock Movement History - **ALL ROLES**
```http
GET /api/dashboard/stock-movement?productId=xxx&startDate=2025-01-01&limit=50
Authorization: Bearer {token}
```

#### Get Warehouse Level Stock - **ALL ROLES**
```http
GET /api/dashboard/warehouse-stock
Authorization: Bearer {token}
```

---

## 🔒 Permission Matrix

| Feature | Admin | Manager | Staff |
|---------|-------|---------|-------|
| **User Management** | ✅ Full | ❌ No | ❌ No |
| **Warehouse Create/Update** | ✅ Full | ❌ No | ❌ No |
| **Warehouse View** | ✅ | ✅ | ✅ |
| **Product Create/Update** | ✅ | ✅ | ❌ |
| **Product View** | ✅ | ✅ | ✅ |
| **Create Receipts** | ✅ | ✅ | ❌ |
| **Validate Receipts** | ✅ | ✅ | ❌ |
| **Create Deliveries** | ✅ | ✅ | ❌ |
| **Assign Pickers/Packers** | ✅ | ✅ | ❌ |
| **Complete Picking** | ✅ | ✅ | ✅ |
| **Complete Packing** | ✅ | ✅ | ✅ |
| **Validate Deliveries** | ✅ | ✅ | ❌ |
| **View My Tasks** | ✅ | ✅ | ✅ |
| **Create Transfers** | ✅ | ✅ | ❌ |
| **Validate Transfers** | ✅ | ✅ | ❌ |
| **Stock Adjustments** | ✅ | ✅ | ❌ |
| **Generate Alerts** | ✅ | ✅ | ❌ |
| **View Alerts** | ✅ | ✅ | ✅ |
| **Acknowledge/Resolve Alerts** | ✅ | ✅ | ❌ |
| **Dashboard & Reports** | ✅ | ✅ | ✅ |

---

## 🎯 Typical Workflows

### Manager Workflow: Receive Goods
1. Create Receipt (`POST /api/receipts`)
2. Review receipt details
3. Validate Receipt (`POST /api/receipts/:id/validate`)
4. Stock increases automatically

### Manager Workflow: Process Delivery
1. Create Delivery (`POST /api/delivery`)
2. Assign Picker (`POST /api/delivery/:id/assign-picker`)
3. **Staff** completes picking (`POST /api/delivery/:id/complete-picking`)
4. Assign Packer (`POST /api/delivery/:id/assign-packer`)
5. **Staff** completes packing (`POST /api/delivery/:id/complete-packing`)
6. Validate Delivery (`POST /api/delivery/:id/validate`)
7. Stock decreases automatically

### Manager Workflow: Internal Transfer
1. Create Transfer (`POST /api/transfers`)
2. Validate Transfer (`POST /api/transfers/:id/validate`)
3. Stock moves between locations

### Staff Workflow: Daily Tasks
1. View My Tasks (`GET /api/delivery/my-tasks`)
2. Complete assigned picking tasks
3. Complete assigned packing tasks
4. View stock levels

---

## 🚨 Error Responses

**401 Unauthorized**
```json
{ "message": "No token provided" }
```

**403 Forbidden**
```json
{ "message": "Access denied. Admin or Manager privileges required." }
```

**400 Bad Request**
```json
{ "message": "Invalid role. Must be 'admin', 'manager', or 'staff'" }
```

---

## 📝 Setup Instructions

1. **Install Dependencies**
```bash
npm install
```

2. **Create `.env` file**
```env
MONGO_URI=mongodb://localhost:27017/stockmaster
JWT_SECRET=your-secret-key
PORT=5000
```

3. **Run Server**
```bash
npm run dev
```

4. **Create Admin User** (First time setup)
```http
POST /api/auth/signup
{
  "name": "System Admin",
  "email": "admin@stockmaster.com",
  "password": "admin123",
  "role": "admin"
}
```

---

## 🔧 Testing Flow

1. **Create Admin** → Login → Get token
2. **Admin creates Manager** → Manager logs in → Get token
3. **Admin creates Staff** → Staff logs in → Get token
4. **Test permissions**: Try staff accessing admin-only routes (should fail)
5. **Test workflow**: Manager creates delivery → Assigns staff → Staff completes tasks
