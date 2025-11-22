# StockMaster API - Complete Postman Testing Guide

## 🚀 Quick Start Testing Flow

### Step 1: Signup Users

#### 1.1 Create Admin User
```
Method: POST
URL: http://localhost:5000/api/auth/signup

Headers:
Content-Type: application/json

Body (raw JSON):
{
  "name": "Admin User",
  "email": "admin@stockmaster.com",
  "password": "admin123",
  "role": "admin"
}

Expected Response:
{
  "message": "User created successfully",
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@stockmaster.com",
    "role": "admin"
  }
}
```

#### 1.2 Create Manager User
```
Method: POST
URL: http://localhost:5000/api/auth/signup

Headers:
Content-Type: application/json

Body (raw JSON):
{
  "name": "Manager User",
  "email": "manager@stockmaster.com",
  "password": "manager123",
  "role": "manager"
}
```

#### 1.3 Create Staff User
```
Method: POST
URL: http://localhost:5000/api/auth/signup

Headers:
Content-Type: application/json

Body (raw JSON):
{
  "name": "Staff User",
  "email": "staff@stockmaster.com",
  "password": "staff123",
  "role": "staff"
}
```

---

### Step 2: Login & Get Tokens

#### 2.1 Login as Admin
```
Method: POST
URL: http://localhost:5000/api/auth/login

Headers:
Content-Type: application/json

Body (raw JSON):
{
  "email": "admin@stockmaster.com",
  "password": "admin123"
}

Expected Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@stockmaster.com",
    "role": "admin"
  }
}

⚠️ COPY THE TOKEN! You'll need it for subsequent requests.
```

#### 2.2 Login as Manager
```
Method: POST
URL: http://localhost:5000/api/auth/login

Body (raw JSON):
{
  "email": "manager@stockmaster.com",
  "password": "manager123"
}

⚠️ SAVE THIS TOKEN for Manager operations
```

#### 2.3 Login as Staff
```
Method: POST
URL: http://localhost:5000/api/auth/login

Body (raw JSON):
{
  "email": "staff@stockmaster.com",
  "password": "staff123"
}

⚠️ SAVE THIS TOKEN for Staff operations
```

---

### Step 3: Test Password Reset Flow

#### 3.1 Send OTP
```
Method: POST
URL: http://localhost:5000/api/auth/send-otp

Headers:
Content-Type: application/json

Body (raw JSON):
{
  "email": "admin@stockmaster.com"
}

Expected Response:
{
  "message": "OTP sent successfully",
  "otp": "1234"
}

Note: OTP is hardcoded as "1234" for development
```

#### 3.2 Reset Password
```
Method: POST
URL: http://localhost:5000/api/auth/reset-password

Headers:
Content-Type: application/json

Body (raw JSON):
{
  "email": "admin@stockmaster.com",
  "otp": "1234",
  "newPassword": "newpassword123"
}

Expected Response:
{
  "message": "Password reset successfully"
}
```

---

## 📦 Testing CRUD Operations (Use Admin Token)

### Warehouse Management

#### 4.1 Create Warehouse (Admin Only)
```
Method: POST
URL: http://localhost:5000/api/warehouses

Headers:
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json

Body (raw JSON):
{
  "name": "Main Warehouse",
  "code": "WH001",
  "address": "123 Storage Street, City"
}

Expected Response:
{
  "message": "Warehouse created successfully",
  "warehouse": {
    "_id": "...",
    "name": "Main Warehouse",
    "code": "WH001",
    "address": "123 Storage Street, City"
  }
}

⚠️ COPY THE WAREHOUSE ID!
```

#### 4.2 Get All Warehouses (All Roles)
```
Method: GET
URL: http://localhost:5000/api/warehouses

Headers:
Authorization: Bearer {ANY_TOKEN}
```

#### 4.3 Update Warehouse (Admin Only)
```
Method: PUT
URL: http://localhost:5000/api/warehouses/{warehouse_id}

Headers:
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json

Body (raw JSON):
{
  "name": "Updated Main Warehouse",
  "address": "456 New Address"
}
```

---

### Product Management

#### 5.1 Create Product (Admin or Manager)
```
Method: POST
URL: http://localhost:5000/api/products

Headers:
Authorization: Bearer {ADMIN_OR_MANAGER_TOKEN}
Content-Type: application/json

Body (raw JSON):
{
  "name": "Laptop Dell XPS 15",
  "sku": "LAP001",
  "category": "Electronics",
  "uom": "pcs",
  "reorderLevel": 10
}

Expected Response:
{
  "message": "Product created successfully",
  "product": {
    "_id": "...",
    "name": "Laptop Dell XPS 15",
    "sku": "LAP001",
    "category": "Electronics",
    "uom": "pcs",
    "totalStock": 0,
    "stockByLocation": {},
    "reorderLevel": 10
  }
}

⚠️ COPY THE PRODUCT ID!
```

#### 5.2 Create More Products
```
Product 2:
{
  "name": "Mouse Logitech MX",
  "sku": "MOU001",
  "category": "Electronics",
  "uom": "pcs",
  "reorderLevel": 20
}

Product 3:
{
  "name": "Keyboard Mechanical",
  "sku": "KEY001",
  "category": "Electronics",
  "uom": "pcs",
  "reorderLevel": 15
}
```

#### 5.3 Get All Products (All Roles)
```
Method: GET
URL: http://localhost:5000/api/products

Headers:
Authorization: Bearer {ANY_TOKEN}
```

#### 5.4 Get Stock by Location (All Roles)
```
Method: GET
URL: http://localhost:5000/api/products/{product_id}/stock

Headers:
Authorization: Bearer {ANY_TOKEN}
```
output:
```
{
    "message": "Products retrieved successfully",
    "count": 3,
    "products": [
        {
            "_id": "692166c82c82f1211c5c3ba8",
            "name": "Laptop Dell XPS 15",
            "sku": "LAP001",
            "category": "Electronics",
            "uom": "pcs",
            "totalStock": 0,
            "stockByLocation": {},
            "reorderLevel": 10,
            "createdAt": "2025-11-22T07:31:20.879Z",
            "updatedAt": "2025-11-22T07:31:20.879Z",
            "__v": 0
        },
        {
            "_id": "6921671e2c82f1211c5c3bab",
            "name": "Mouse Logitech MX",
            "sku": "MOU001",
            "category": "Electronics",
            "uom": "pcs",
            "totalStock": 0,
            "stockByLocation": {},
            "reorderLevel": 20,
            "createdAt": "2025-11-22T07:32:46.289Z",
            "updatedAt": "2025-11-22T07:32:46.289Z",
            "__v": 0
        },
        {
            "_id": "6921672d2c82f1211c5c3bae",
            "name": "Keyboard Mechanical",
            "sku": "KEY001",
            "category": "Electronics",
            "uom": "pcs",
            "totalStock": 0,
            "stockByLocation": {},
            "reorderLevel": 15,
            "createdAt": "2025-11-22T07:33:01.481Z",
            "updatedAt": "2025-11-22T07:33:01.481Z",
            "__v": 0
        }
    ]
}
```

#### 5.5 Update Product (Admin or Manager)
```
Method: PUT
URL: http://localhost:5000/api/products/{product_id}

Headers:
Authorization: Bearer {ADMIN_OR_MANAGER_TOKEN}
Content-Type: application/json

Body (raw JSON):
{
  "name": "Updated Laptop Name",
  "reorderLevel": 15
}
```

---

### User Management (Admin Only)

#### 6.1 Create User (Admin Only)
```
Method: POST
URL: http://localhost:5000/api/users

Headers:
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json

Body (raw JSON):
{
  "name": "New Manager",
  "email": "newmanager@stockmaster.com",
  "password": "password123",
  "role": "manager"
}
```

#### 6.2 Get All Users (Admin Only)
```
Method: GET
URL: http://localhost:5000/api/users

Headers:
Authorization: Bearer {ADMIN_TOKEN}
```

#### 6.3 Update User (Admin Only)
```
Method: PUT
URL: http://localhost:5000/api/users/{user_id}

Headers:
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json

Body (raw JSON):
{
  "name": "Updated Name",
  "role": "staff"
}
```

#### 6.4 Deactivate User (Admin Only)
```
Method: PATCH
URL: http://localhost:5000/api/users/{user_id}/deactivate

Headers:
Authorization: Bearer {ADMIN_TOKEN}
```

#### 6.5 Activate User (Admin Only)
```
Method: PATCH
URL: http://localhost:5000/api/users/{user_id}/activate

Headers:
Authorization: Bearer {ADMIN_TOKEN}
```

---

## 📥 Receipt Operations (Incoming Stock)

#### 7.1 Create Receipt (Admin or Manager)
```
Method: POST
URL: http://localhost:5000/api/receipts

Headers:
Authorization: Bearer {MANAGER_TOKEN}
Content-Type: application/json

Body (raw JSON):
{
  "supplier": "Tech Supplier Inc",
  "location": "WH001",
  "items": [
    {
      "productId": "{PRODUCT_ID_1}",
      "qty": 100
    },
    {
      "productId": "{PRODUCT_ID_2}",
      "qty": 50
    }
  ],
  "notes": "Monthly inventory replenishment"
}

Expected Response:
{
  "message": "Receipt created successfully",
  "receipt": {
    "_id": "...",
    "supplier": "Tech Supplier Inc",
    "location": "WH001",
    "status": "Draft",
    "items": [...]
  }
}

⚠️ COPY THE RECEIPT ID!
```

#### 7.2 Validate Receipt (Admin or Manager)
```
Method: POST
URL: http://localhost:5000/api/receipts/{receipt_id}/validate

Headers:
Authorization: Bearer {MANAGER_TOKEN}

Expected Response:
{
  "message": "Receipt validated successfully",
  "receipt": {
    "status": "Validated",
    ...
  }
}

✅ Stock will automatically increase!
```

#### 7.3 Check Stock Increased
```
Method: GET
URL: http://localhost:5000/api/products/{product_id}/stock

Headers:
Authorization: Bearer {ANY_TOKEN}

You should see stock increased in WH001 location
```

---

## 📤 Delivery Operations (Outgoing Stock with Workflow)

#### 8.1 Create Delivery (Admin or Manager)
```
Method: POST
URL: http://localhost:5000/api/delivery

Headers:
Authorization: Bearer {MANAGER_TOKEN}
Content-Type: application/json

Body (raw JSON):
{
  "customer": "ABC Corporation",
  "items": [
    {
      "productId": "{PRODUCT_ID_1}",
      "qty": 30
    }
  ],
  "notes": "Urgent delivery"
}

Expected Response:
{
  "message": "Delivery created successfully",
  "delivery": {
    "_id": "...",
    "deliveryNumber": "DEL-00001",
    "customer": "ABC Corporation",
    "status": "Draft",
    "pickingStatus": "Pending",
    "packingStatus": "Pending"
  }
}

⚠️ COPY THE DELIVERY ID!
```

#### 8.2 Get All Deliveries
```
Method: GET
URL: http://localhost:5000/api/delivery

Headers:
Authorization: Bearer {ANY_TOKEN}
```

#### 8.3 Assign Picker (Manager)
```
Method: POST
URL: http://localhost:5000/api/delivery/{delivery_id}/assign-picker

Headers:
Authorization: Bearer {MANAGER_TOKEN}
Content-Type: application/json

Body (raw JSON):
{
  "pickerId": "{STAFF_USER_ID}"
}

Expected Response:
{
  "message": "Picker assigned successfully",
  "delivery": {
    "status": "Picking",
    "pickingStatus": "In Progress",
    "assignedPicker": "{STAFF_USER_ID}"
  }
}
```

#### 8.4 Get My Tasks (Staff)
```
Method: GET
URL: http://localhost:5000/api/delivery/my-tasks

Headers:
Authorization: Bearer {STAFF_TOKEN}

Expected Response:
{
  "message": "Tasks retrieved successfully",
  "pickingTasks": [...],
  "packingTasks": [...]
}
```

#### 8.5 Complete Picking (Staff)
```
Method: POST
URL: http://localhost:5000/api/delivery/{delivery_id}/complete-picking

Headers:
Authorization: Bearer {STAFF_TOKEN}
Content-Type: application/json

Body (raw JSON):
{
  "pickedItems": [
    {
      "productId": "{PRODUCT_ID_1}",
      "pickedQty": 30
    }
  ]
}

Expected Response:
{
  "message": "Picking completed successfully",
  "delivery": {
    "pickingStatus": "Completed",
    "status": "Packing"
  }
}
```

#### 8.6 Assign Packer (Manager)
```
Method: POST
URL: http://localhost:5000/api/delivery/{delivery_id}/assign-packer

Headers:
Authorization: Bearer {MANAGER_TOKEN}
Content-Type: application/json

Body (raw JSON):
{
  "packerId": "{STAFF_USER_ID}"
}
```

#### 8.7 Complete Packing (Staff)
```
Method: POST
URL: http://localhost:5000/api/delivery/{delivery_id}/complete-packing

Headers:
Authorization: Bearer {STAFF_TOKEN}
Content-Type: application/json

Body (raw JSON):
{
  "packedItems": [
    {
      "productId": "{PRODUCT_ID_1}",
      "packedQty": 30
    }
  ]
}

Expected Response:
{
  "message": "Packing completed successfully",
  "delivery": {
    "packingStatus": "Completed",
    "status": "Ready"
  }
}
```

#### 8.8 Validate Delivery (Manager)
```
Method: POST
URL: http://localhost:5000/api/delivery/{delivery_id}/validate

Headers:
Authorization: Bearer {MANAGER_TOKEN}
Content-Type: application/json

Body (raw JSON):
{
  "location": "WH001"
}

Expected Response:
{
  "message": "Delivery validated successfully",
  "delivery": {
    "status": "Validated"
  }
}

✅ Stock will automatically decrease!
```

---

## 🔄 Transfer Operations (Internal Movement)

#### 9.1 Create Another Warehouse
```
Method: POST
URL: http://localhost:5000/api/warehouses

Headers:
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json

Body (raw JSON):
{
  "name": "Secondary Warehouse",
  "code": "WH002",
  "address": "456 Storage Ave"
}
```

#### 9.2 Create Transfer (Manager)
```
Method: POST
URL: http://localhost:5000/api/transfers

Headers:
Authorization: Bearer {MANAGER_TOKEN}
Content-Type: application/json

Body (raw JSON):
{
  "from": "WH001",
  "to": "WH002",
  "items": [
    {
      "productId": "{PRODUCT_ID_1}",
      "qty": 20
    }
  ]
}

⚠️ COPY THE TRANSFER ID!
```

#### 9.3 Validate Transfer (Manager)
```
Method: POST
URL: http://localhost:5000/api/transfers/{transfer_id}/validate

Headers:
Authorization: Bearer {MANAGER_TOKEN}

Expected Response:
{
  "message": "Transfer validated successfully"
}

✅ Stock moves from WH001 to WH002 (total stays same)
```

---

## ⚙️ Inventory Adjustments

#### 10.1 Adjust Stock (Manager)
```
Method: POST
URL: http://localhost:5000/api/adjustments

Headers:
Authorization: Bearer {MANAGER_TOKEN}
Content-Type: application/json

Body (raw JSON):
{
  "productId": "{PRODUCT_ID_1}",
  "location": "WH001",
  "systemQty": 50,
  "countedQty": 48,
  "reason": "2 units damaged during storage"
}

Expected Response:
{
  "message": "Stock adjusted successfully",
  "adjustment": {...},
  "difference": -2,
  "updatedProduct": {
    "totalStock": 48
  }
}

✅ Stock adjusted by difference (countedQty - systemQty)
```

---

## 🚨 Alert System

#### 11.1 Generate Alerts (Manager)
```
Method: POST
URL: http://localhost:5000/api/alerts/generate

Headers:
Authorization: Bearer {MANAGER_TOKEN}

Expected Response:
{
  "message": "Generated X new alerts",
  "alerts": [...]
}

Note: Automatically detects products below reorder level
```

#### 11.2 Get All Alerts (All Roles)
```
Method: GET
URL: http://localhost:5000/api/alerts

Headers:
Authorization: Bearer {ANY_TOKEN}

Query Parameters (optional):
?status=Active
?severity=High
```

#### 11.3 Get Alert Summary (All Roles)
```
Method: GET
URL: http://localhost:5000/api/alerts/summary

Headers:
Authorization: Bearer {ANY_TOKEN}

Expected Response:
{
  "message": "Alert summary retrieved successfully",
  "summary": {
    "activeAlerts": 5,
    "criticalAlerts": 2,
    "highAlerts": 1,
    "recentAlerts": [...]
  }
}
```

#### 11.4 Acknowledge Alert (Manager)
```
Method: POST
URL: http://localhost:5000/api/alerts/{alert_id}/acknowledge

Headers:
Authorization: Bearer {MANAGER_TOKEN}

Expected Response:
{
  "message": "Alert acknowledged successfully"
}
```

#### 11.5 Resolve Alert (Manager)
```
Method: POST
URL: http://localhost:5000/api/alerts/{alert_id}/resolve

Headers:
Authorization: Bearer {MANAGER_TOKEN}

Expected Response:
{
  "message": "Alert resolved successfully"
}
```

---

## 📊 Dashboard & Reports

#### 12.1 Get Dashboard Stats (All Roles)
```
Method: GET
URL: http://localhost:5000/api/dashboard

Headers:
Authorization: Bearer {ANY_TOKEN}

Expected Response:
{
  "message": "Dashboard stats retrieved successfully",
  "stats": {
    "totalProducts": 3,
    "totalInventoryStock": 200,
    "lowStock": {
      "count": 2,
      "products": [...]
    },
    "pendingReceipts": {...},
    "pendingDeliveries": {...},
    "pendingTransfers": {...},
    "categoryBreakdown": [...]
  }
}
```

#### 12.2 Get Stock Movement History (All Roles)
```
Method: GET
URL: http://localhost:5000/api/dashboard/stock-movement

Headers:
Authorization: Bearer {ANY_TOKEN}

Query Parameters (optional):
?productId={PRODUCT_ID}
?startDate=2025-01-01
?endDate=2025-12-31
?limit=50

Expected Response:
{
  "message": "Stock movement history retrieved successfully",
  "history": {
    "adjustments": [...],
    "receipts": [...],
    "deliveries": [...],
    "transfers": [...]
  }
}
```

#### 12.3 Get Warehouse Level Stock (All Roles)
```
Method: GET
URL: http://localhost:5000/api/dashboard/warehouse-stock

Headers:
Authorization: Bearer {ANY_TOKEN}

Expected Response:
{
  "message": "Warehouse level stock retrieved successfully",
  "warehouseStock": [
    {
      "location": "WH001",
      "products": [...],
      "totalItems": 150
    },
    {
      "location": "WH002",
      "products": [...],
      "totalItems": 50
    }
  ]
}
```

---

## 🔒 Test Permission Denials

#### 13.1 Staff Tries to Create Product (Should Fail)
```
Method: POST
URL: http://localhost:5000/api/products

Headers:
Authorization: Bearer {STAFF_TOKEN}
Content-Type: application/json

Body (raw JSON):
{
  "name": "Test Product",
  "sku": "TEST001",
  "category": "Test",
  "uom": "pcs"
}

Expected Response: 403 Forbidden
{
  "message": "Access denied. Admin or Manager privileges required."
}
```

#### 13.2 Manager Tries to Create User (Should Fail)
```
Method: POST
URL: http://localhost:5000/api/users

Headers:
Authorization: Bearer {MANAGER_TOKEN}
Content-Type: application/json

Body (raw JSON):
{
  "name": "Test User",
  "email": "test@test.com",
  "password": "test123",
  "role": "staff"
}

Expected Response: 403 Forbidden
{
  "message": "Access denied. Admin privileges required."
}
```

#### 13.3 Staff Tries to Validate Delivery (Should Fail)
```
Method: POST
URL: http://localhost:5000/api/delivery/{delivery_id}/validate

Headers:
Authorization: Bearer {STAFF_TOKEN}
Content-Type: application/json

Body (raw JSON):
{
  "location": "WH001"
}

Expected Response: 403 Forbidden
```

---

## 📝 Testing Checklist

- [ ] ✅ Signup Admin, Manager, Staff
- [ ] ✅ Login all three users and save tokens
- [ ] ✅ Test password reset flow
- [ ] ✅ Admin creates warehouses
- [ ] ✅ Manager creates products
- [ ] ✅ Manager creates receipt and validates (stock increases)
- [ ] ✅ Manager creates delivery
- [ ] ✅ Manager assigns picker to staff
- [ ] ✅ Staff completes picking
- [ ] ✅ Manager assigns packer to staff
- [ ] ✅ Staff completes packing
- [ ] ✅ Manager validates delivery (stock decreases)
- [ ] ✅ Manager creates and validates transfer
- [ ] ✅ Manager performs stock adjustment
- [ ] ✅ Generate and view alerts
- [ ] ✅ View dashboard stats
- [ ] ✅ Test permission denials (staff/manager accessing admin routes)

---

## 🎯 Complete Test Scenario

1. **Setup Phase**
   - Signup 3 users (admin, manager, staff)
   - Login all 3 and save tokens
   - Admin creates 2 warehouses
   - Manager creates 3 products

2. **Incoming Stock**
   - Manager creates receipt for all products
   - Manager validates receipt (check stock increased)

3. **Outgoing Stock Workflow**
   - Manager creates delivery order
   - Manager assigns staff as picker
   - Staff completes picking
   - Manager assigns staff as packer
   - Staff completes packing
   - Manager validates delivery (check stock decreased)

4. **Internal Movement**
   - Manager creates transfer between warehouses
   - Manager validates transfer
   - Check stock moved between locations

5. **Adjustments & Alerts**
   - Manager adjusts stock (simulate damage)
   - Generate alerts for low stock
   - Manager acknowledges and resolves alerts

6. **Reports**
   - View dashboard
   - View stock movement history
   - View warehouse-level stock

---

## 💡 Pro Tips

1. **Save all IDs**: Copy product IDs, warehouse IDs, user IDs, etc. as you create them
2. **Use Postman Collections**: Save all requests in a collection for easy reuse
3. **Environment Variables**: Set up Postman environment variables for:
   - `base_url`: http://localhost:5000
   - `admin_token`: {paste token}
   - `manager_token`: {paste token}
   - `staff_token`: {paste token}
   - `product_id_1`, `product_id_2`, etc.

4. **Check Responses**: Always verify the response status code and data
5. **Test Permissions**: Try accessing admin routes with staff token to verify security

---

## 🆘 Common Errors

**401 Unauthorized**
- Missing or invalid token
- Solution: Re-login and get fresh token

**403 Forbidden**
- User doesn't have required permissions
- Solution: Use correct role token (admin/manager/staff)

**400 Bad Request**
- Missing required fields
- Invalid data format
- Solution: Check request body matches examples

**500 Server Error**
- Check if MongoDB is running
- Check server logs for detailed error

---

Happy Testing! 🎉
