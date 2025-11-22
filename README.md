# StockMaster - Inventory Management System

A real-time, easy-to-use inventory management application for managing stock operations across multiple warehouses.

## 📋 Table of Contents

- [Overview](#overview)
- [Target Users & Roles](#target-users--roles)
- [Features by Role](#features-by-role)
- [Core Features](#core-features)
- [Technical Stack](#technical-stack)
- [Project Structure](#project-structure)
- [Development Roadmap](#development-roadmap)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)

## 🎯 Overview

StockMaster is a comprehensive inventory management system that enables:
- Real-time stock tracking
- Multi-warehouse support
- Role-based access control
- Automated stock movements
- Inventory adjustments
- Low stock alerts

## 👥 Target Users & Roles

### 1. **Admin** 👑
**Controls Everything** - Full system access and management capabilities

#### Key Responsibilities
- Complete system oversight
- Manage all warehouses and locations
- User management and role assignment
- System settings and configuration
- View all operations across all warehouses
- Access to all reports and analytics

#### Admin Features
- **Product Management**: Create, edit, delete all products
- **Warehouse Management**: Create, update, delete warehouses
- **User Management**: Create users, assign roles, deactivate users
- **Dashboard & Reports**: Complete inventory overview, low stock alerts, warehouse-level stock, product categories, stock movement history
- **System Settings**: Configure system-wide settings

### 2. **Inventory Manager** 📊
**Handles Inventory Operations** - Manages incoming & outgoing stock

#### Key Responsibilities
- Manage incoming & outgoing stock
- Create and validate receipts
- Create and validate delivery orders
- Schedule and execute internal transfers
- Perform inventory adjustments
- View inventory reports and alerts
- Manage products and categories

#### Manager Workflow

##### 3.1 Receive Goods (Incoming Stock)
- [ ] **Create Receipt**
  - Add vendor/supplier information
  - Select warehouse/location
  - Add products and quantities received
  - Enter receipt details

- [ ] **Validate Receipt**
  - Review receipt details
  - Validate receipt
  - **Stock increases automatically**
  - Generate receipt document

##### 3.2 Delivery Orders (Outgoing Stock)
- [ ] **Pick Items**
  - Generate picking list
  - Assign picking to staff
  - Track picking progress
  - Validate picking completion

- [ ] **Pack Items**
  - Pack picked items
  - Add packing details
  - Generate packing slip
  - Track packing status

- [ ] **Validate Delivery**
  - Review delivery details
  - Validate delivery
  - **Stock decreases automatically**
  - Generate delivery note

##### 3.3 Inventory Adjustment
- [ ] **Adjustment Types**
  - Damaged goods (reduce stock)
  - Lost goods (reduce stock)
  - Correction after stock count (increase/decrease)
  - Found items (increase stock)

- [ ] **Stock Changes**
  - Stock changes accordingly
  - Automatic stock update
  - Adjustment logging

##### 3.4 Move History (Internal Transfer)
- [ ] **Transfer Types**
  - Warehouse A → Warehouse B
  - Main Store → Production Rack
  - Rack A → Rack B
  - Any location to any location

- [ ] **Stock Movement**
  - Stock stays the same overall
  - Location changes
  - Complete movement tracking

##### 3.5 Alerts
- [ ] **Alert Types**
  - Low stock alerts
  - Out-of-stock alerts
  - Reorder suggestions
  - Critical stock warnings

- [ ] **Alert Management**
  - View all alerts
  - Acknowledge alerts
  - Create reorder from alerts

### 3. **Warehouse Staff / Operator** 🧑‍🔧
**Handles Day-to-Day Operations** - Performs physical operations

#### Key Responsibilities
- View available stock
- Process receipts (receiving goods)
- Process delivery orders (picking, packing)
- Execute internal transfers
- Perform stock counting
- Create inventory adjustments
- Track assigned tasks

#### Staff Features
- **View Available Stock**: Check stock by product, check stock by warehouse
- **Create Delivery Requests**: Select product, enter quantity, submit to manager
- **Track Outgoing Orders**: See packing status, track delivery status
- **Basic Reports**: View assigned tasks, view own movement logs
- **Operations**: Picking, packing, shelving, counting

## 🔐 Authentication System

### ✅ Completed
- [x] User signup with role selection
- [x] User login
- [x] OTP-based password reset
- [x] JWT token authentication
- [x] Role-based access control (RBAC)
- [x] Protected routes
- [x] Session management

### Features
- Email/password authentication
- Role-based redirects after login
- Secure password hashing (bcrypt)
- Token-based session management
- OTP verification for password reset

## 📊 Dashboard Features

### Dashboard KPIs (All Roles)
- [ ] **Total Products in Stock** - Count of all products across warehouses
- [ ] **Low Stock / Out of Stock Items** - Products below reorder level
- [ ] **Pending Receipts** - Incoming stock awaiting validation
- [ ] **Pending Deliveries** - Outgoing stock awaiting processing
- [ ] **Internal Transfers Scheduled** - Transfers pending execution

### Dynamic Filters
- [ ] **By Document Type**: Receipts / Delivery / Internal / Adjustments
- [ ] **By Status**: Draft, Waiting, Ready, Done, Canceled
- [ ] **By Warehouse or Location**: Filter by specific warehouse
- [ ] **By Product Category**: Filter by product category
- [ ] **Date Range Filter**: Filter operations by date range

### Dashboard Views

#### Admin Dashboard
- [ ] **Total Inventory**
  - Total products count
  - Total stock value
  - Stock across all warehouses
  - Inventory valuation

- [ ] **Low Stock Alerts**
  - Products below reorder level
  - Out-of-stock items
  - Critical stock items
  - Reorder suggestions

- [ ] **Warehouse-Level Stock**
  - Stock summary per warehouse
  - Warehouse comparison
  - Stock distribution
  - Warehouse capacity

- [ ] **Product Categories**
  - Stock by category
  - Category-wise valuation
  - Category performance

- [ ] **Stock Movement History**
  - Recent movements
  - Movement trends
  - Activity logs
  - Audit trail

#### Manager Dashboard
- [ ] **Inventory Operations Overview**
  - Pending receipts
  - Pending deliveries
  - Scheduled transfers
  - Pending adjustments

- [ ] **Low Stock Alerts**
  - Products needing reorder
  - Out-of-stock items
  - Critical alerts

- [ ] **Operations Summary**
  - Today's operations
  - Weekly summary
  - Monthly trends

#### Warehouse Dashboard
- [ ] **Task-Focused View**
  - Assigned tasks
  - Pending operations
  - Today's work
  - Quick actions

## 🏗️ Core Features

### 1. Product Management

#### 1.1 Create Product
- [ ] **Product Details**
  - Product Name
  - SKU / Code (unique identifier, required)
  - Category (select from existing or create new)
  - Unit of Measure (UOM) - e.g., kg, pieces, boxes, liters
  - Description (optional)
  - Product images (optional)

- [ ] **Initial Stock Setup**
  - Initial stock quantity (optional)
  - Initial stock location/warehouse
  - Set stock per location

- [ ] **Reordering Rules**
  - Minimum stock level (reorder point)
  - Maximum stock level
  - Reorder quantity
  - Automatic low stock alerts

#### 1.2 Add/Update Stock per Location
- [ ] **Stock Management**
  - View current stock by location/warehouse
  - Add stock to specific location
  - Update stock in specific location
  - Transfer stock between locations
  - Real-time stock levels

#### 1.3 Set Reorder Levels
- [ ] **Reorder Configuration**
  - Set minimum stock level per product
  - Set maximum stock level per product
  - Configure reorder quantity
  - Enable/disable automatic alerts

#### 1.4 Product List & Search
- [ ] **Product List View**
  - Search by SKU, name, category
  - Filter by category, warehouse, stock status
  - Sort by name, SKU, stock level, category
  - Pagination
  - Quick actions (edit, view stock, adjust)

- [ ] **Stock Availability View**
  - View stock per location/warehouse
  - Real-time stock levels
  - Stock history per product
  - Low stock indicators

#### 1.5 Product Categories
- [ ] **Category Management**
  - Create/edit/delete categories
  - Category hierarchy (parent/child)
  - Category-based filtering
  - Category-wise stock reports

#### Access Control
- **Admin**: Full access (create, edit, delete, manage stock)
- **Manager**: Full access (create, edit, delete, manage stock)
- **Warehouse Staff**: View only (cannot create/edit products)

### 2. Receipts (Incoming Stock) - Receive Goods

#### Process Flow
1. **Create Receipt**
   - Create a new receipt document
   - Add supplier/vendor information
   - Select warehouse/location

2. **Add Products**
   - Select products to receive
   - Enter quantities received
   - Add expected vs received quantities
   - Add product details

3. **Validate Receipt**
   - Review receipt details
   - Validate receipt
   - **Stock increases automatically** in specified location
   - Generate receipt document

#### Example Flow
```
Vendor → Warehouse
Receive 100 kg Steel
Stock: +100 (automatically updated)
```

#### Features to Implement
- [ ] **Create Receipt**
  - Supplier selection/entry
  - Product selection
  - Quantity input
  - Expected vs received quantities
  - Receipt date
  - Reference number

- [ ] **Receipt Status Management**
  - Draft: Being created
  - Waiting: Awaiting goods arrival
  - Ready: Goods received, ready to validate
  - Done: Validated, stock updated
  - Canceled: Cancelled receipt

- [ ] **Receipt Validation**
  - Validate receipt → auto-update stock
  - Stock increases in specified location
  - Generate receipt document
  - Update inventory ledger

- [ ] **Receipt List View**
  - Filter by status, supplier, date
  - Search by reference number
  - View receipt details
  - Print receipt

#### Access Control
- **Admin**: Full access
- **Manager**: Full access (create, validate)
- **Warehouse Staff**: Create receipts, view assigned receipts

### 3. Delivery Orders (Outgoing Stock)

#### Process Flow
1. **Create Delivery Order**
   - Create delivery order (from sales order or manual)
   - Add customer information
   - Select products and quantities
   - Select source warehouse/location

2. **Pick Items**
   - Generate picking list
   - Pick items from warehouse
   - Mark items as picked
   - Validate picking

3. **Pack Items**
   - Pack picked items
   - Add packing details
   - Generate packing slip

4. **Validate Delivery**
   - Review delivery details
   - Validate delivery
   - **Stock decreases automatically** from specified location
   - Generate delivery note

#### Example Flow
```
Customer Order → Delivery Order
Deliver 20 kg Steel
Stock: -20 (automatically updated)
```

#### Features to Implement
- [ ] **Create Delivery Order**
  - Customer information
  - Product selection
  - Quantity to deliver
  - Delivery address
  - Expected delivery date
  - Reference number

- [ ] **Picking Process**
  - Generate picking list
  - Mark items as picked
  - Location-based picking
  - Picking validation

- [ ] **Packing Process**
  - Pack items
  - Add packing details
  - Generate packing slip

- [ ] **Delivery Status Management**
  - Draft: Being created
  - Waiting: Awaiting picking
  - Ready: Picked and packed, ready to validate
  - Done: Validated, stock decreased
  - Canceled: Cancelled delivery

- [ ] **Delivery Validation**
  - Validate delivery → auto-update stock
  - Stock decreases from specified location
  - Generate delivery note
  - Update inventory ledger

- [ ] **Delivery List View**
  - Filter by status, customer, date
  - Search by reference number
  - View delivery details
  - Print delivery note

#### Access Control
- **Admin**: Full access
- **Manager**: Full access (create, validate)
- **Warehouse Staff**: Process picking, packing, view assigned deliveries

### 4. Internal Transfers - Move History

#### Process Flow
1. **Create Transfer**
   - Create transfer request
   - Select source warehouse/location
   - Select destination warehouse/location
   - Select products and quantities
   - Add transfer reason

2. **Execute Transfer**
   - Review transfer details
   - Execute transfer
   - **Stock moves between locations**
   - Source location: stock decreases
   - Destination location: stock increases
   - **Total stock unchanged, location updated**

#### Use Cases
- **Warehouse A → Warehouse B**: Move stock between warehouses
- **Main Store → Production Rack**: Move stock to production area
- **Rack A → Rack B**: Reorganize stock within warehouse

#### Example Flow
```
Internal Movement: Warehouse A → Rack B
Move 50 kg Steel
Stock unchanged in total
Location updated: -50 from Warehouse A, +50 to Rack B
```

#### Features to Implement
- [ ] **Create Transfer**
  - Source warehouse/location
  - Destination warehouse/location
  - Product selection
  - Quantity to transfer
  - Transfer reason
  - Scheduled date

- [ ] **Transfer Status Management**
  - Draft: Being created
  - Waiting: Scheduled, awaiting execution
  - Ready: Ready to execute
  - Done: Completed, stock moved
  - Canceled: Cancelled transfer

- [ ] **Transfer Execution**
  - Execute transfer → update stock in both locations
  - Source location: stock decreases
  - Destination location: stock increases
  - Total stock unchanged
  - Update inventory ledger

- [ ] **Transfer List View**
  - Filter by status, source, destination, date
  - Search by reference number
  - View transfer details
  - Print transfer document

#### Access Control
- **Admin**: Full access
- **Manager**: Create and validate transfers
- **Warehouse Staff**: Execute transfers, view assigned transfers

### 5. Inventory Adjustments

#### Process Flow
1. **Select Product and Location**
   - Select product to adjust
   - Select warehouse/location
   - View current recorded stock

2. **Enter Counted Quantity**
   - Enter physical counted quantity
   - System calculates difference automatically
   - Add adjustment reason

3. **Validate Adjustment**
   - Review adjustment details
   - Validate adjustment
   - **Stock adjusted automatically**
   - Generate adjustment document

#### Use Cases
- **Damaged Goods**: Reduce stock for damaged items
- **Lost Goods**: Reduce stock for lost items
- **Correction After Stock Count**: Fix discrepancies found during physical count
- **Found Items**: Increase stock for found items

#### Example Flow
```
Adjustment: 3 kg Steel damaged
Physical count: 97 kg (recorded: 100 kg)
Stock: -3 (automatically updated)
```

#### Features to Implement
- [ ] **Create Adjustment**
  - Product selection
  - Location/warehouse selection
  - Current recorded stock (system)
  - Physical counted quantity
  - Difference calculation (auto)
  - Adjustment reason
  - Adjustment date

- [ ] **Adjustment Types**
  - Positive adjustment: Stock increase
  - Negative adjustment: Stock decrease
  - Zero adjustment: No change (for documentation)

- [ ] **Adjustment Status**
  - Draft: Being created
  - Done: Validated, stock adjusted
  - Canceled: Cancelled adjustment

- [ ] **Adjustment Validation**
  - Validate adjustment → update stock
  - Log adjustment in ledger
  - Generate adjustment document

- [ ] **Adjustment List View**
  - Filter by status, product, location, date
  - Search by reference number
  - View adjustment details
  - Print adjustment document

#### Access Control
- **Admin**: Full access
- **Manager**: Create and validate adjustments
- **Warehouse Staff**: Create adjustments (limited), view assigned adjustments

### 6. Move History / Stock Ledger

#### Features to Implement
- [ ] **Stock Ledger View**
  - Complete history of all stock movements
  - Filter by product, location, date range
  - Movement types: Receipt, Delivery, Transfer, Adjustment
  - Before/after quantities
  - User who performed the action
  - Timestamp

- [ ] **Movement Details**
  - Document reference
  - Movement type
  - Product details
  - Quantity change
  - Location/warehouse
  - User information
  - Date and time

- [ ] **Export Options**
  - Export to CSV
  - Export to PDF
  - Print ledger

#### Access Control
- **Admin**: View all movements
- **Manager**: View all movements
- **Warehouse Staff**: View movements for assigned warehouses

### 7. Warehouse Management

#### 7.1 Create Warehouses
- [ ] **Warehouse Details**
  - Warehouse name
  - Warehouse code (unique identifier)
  - Address (full address)
  - Contact information (phone, email)
  - Manager assignment (optional)
  - Status (active/inactive)

#### 7.2 Update Warehouse Details
- [ ] **Warehouse Management**
  - Edit warehouse information
  - Update contact details
  - Change warehouse status
  - Assign/change warehouse manager
  - View warehouse statistics

#### 7.3 Create Locations
- [ ] **Location Setup**
  - Location name
  - Location code (unique within warehouse)
  - Parent warehouse (required)
  - Location type (rack, shelf, bin, zone, etc.)
  - Capacity (optional)
  - Location hierarchy (parent/child locations)

#### 7.4 Warehouse List View
- [ ] **Warehouse Overview**
  - View all warehouses
  - Warehouse details and statistics
  - Stock summary per warehouse
  - Active/inactive status
  - Edit/delete warehouses (Admin only)

#### 7.5 Location Management
- [ ] **Location Operations**
  - View locations per warehouse
  - Create/edit/delete locations
  - Location hierarchy management
  - Location-based stock view

#### Access Control
- **Admin**: Full access (create, edit, delete warehouses and locations)
- **Manager**: View only (cannot create/edit warehouses)
- **Warehouse Staff**: View assigned warehouses only

### 8. User Management (Admin Only)

#### Features to Implement
- [ ] **Create Users**
  - User name
  - Email (unique)
  - Password
  - Role assignment (admin, manager, warehouse)
  - Warehouse assignment (for warehouse staff)
  - Status (active/inactive)

- [ ] **Assign Roles to Users**
  - Assign admin role
  - Assign manager role
  - Assign warehouse staff role
  - Change user roles
  - View role permissions

- [ ] **Update Users**
  - Edit user details (name, email)
  - Change user password
  - Update role assignments
  - Update warehouse assignments
  - Activate/deactivate users

- [ ] **Deactivate Users**
  - Deactivate user accounts
  - Reactivate deactivated users
  - View deactivated users list

- [ ] **User List View**
  - View all users
  - Filter by role, warehouse, status
  - Search users
  - User activity logs

#### Access Control
- **Admin**: Full access (create, edit, delete, assign roles, deactivate users)
- **Manager**: No access
- **Warehouse Staff**: No access

### 9. Settings

#### Features to Implement
- [ ] **Warehouse Settings**
  - Default warehouse selection
  - Warehouse preferences

- [ ] **System Settings (Admin Only)**
  - General settings
  - Email configuration
  - Notification settings
  - System preferences
  - Backup settings

- [ ] **User Preferences**
  - Theme preference (light/dark) ✅
  - Language settings
  - Notification preferences
  - Dashboard preferences

### 9. Profile Management

#### Features to Implement
- [ ] **My Profile**
  - View profile information
  - Edit name, email
  - Change password
  - View role and permissions

- [ ] **Profile Menu (Sidebar)**
  - My Profile link
  - Logout button
  - User information display

## 🔔 Additional Features

### Alerts & Notifications
- [ ] **Low Stock Alerts**
  - Automatic alerts when stock falls below reorder level
  - Email notifications (optional)
  - Dashboard notifications

- [ ] **Out of Stock Alerts**
  - Immediate alerts for zero stock items
  - Priority notifications

### Search & Filters
- [ ] **SKU Search**
  - Quick search by SKU
  - Autocomplete suggestions
  - Barcode scanning support (future)

- [ ] **Smart Filters**
  - Multi-criteria filtering
  - Saved filter presets
  - Quick filter buttons

### Reporting
- [ ] **Inventory Reports**
  - Stock valuation report
  - Movement summary report
  - Low stock report
  - Product performance report

- [ ] **Export Functionality**
  - Export to Excel/CSV
  - PDF generation
  - Print reports

## 🛠️ Technical Stack

### Frontend
- **Framework**: React 19.2.0
- **Routing**: React Router DOM 7.9.6
- **UI Library**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS 4.1.17
- **Icons**: Lucide React
- **Build Tool**: Vite 7.2.4

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5.1.0
- **Database**: MongoDB (Mongoose 9.0.0)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs

## 📁 Project Structure

```
stockmaster/
├── stockmaster_frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/          # Authentication components
│   │   │   ├── layout/         # Layout components (Sidebar, etc.)
│   │   │   └── ui/            # shadcn UI components
│   │   ├── contexts/          # React contexts (Auth, Theme)
│   │   ├── lib/               # Utilities and API
│   │   ├── pages/             # Page components
│   │   │   ├── dashboards/    # Role-specific dashboards
│   │   │   └── ...
│   │   └── App.jsx
│   └── package.json
│
└── stockmaster_backend/
    ├── config/                # Configuration files
    ├── controllers/           # Route controllers
    ├── middleware/            # Express middleware
    ├── models/                # Mongoose models
    ├── routes/                # API routes
    └── server.js
```

## 🗺️ Development Roadmap

### Phase 1: Foundation ✅
- [x] Authentication system
- [x] Role-based access control
- [x] Dashboard layouts
- [x] Theme system (dark/light mode)
- [x] Basic UI components

### Phase 2: Product Management
- [ ] Product CRUD operations
- [ ] Product categories
- [ ] Stock availability views
- [ ] Reordering rules
- [ ] Product search and filters

### Phase 3: Receipts Management
- [ ] Create receipt form
- [ ] Receipt status workflow
- [ ] Receipt validation
- [ ] Receipt list and filters
- [ ] Stock update on validation

### Phase 4: Delivery Orders
- [ ] Create delivery order form
- [ ] Picking process
- [ ] Packing process
- [ ] Delivery validation
- [ ] Delivery list and filters
- [ ] Stock update on validation

### Phase 5: Internal Transfers
- [ ] Create transfer form
- [ ] Transfer execution
- [ ] Transfer list and filters
- [ ] Stock movement between locations

### Phase 6: Inventory Adjustments
- [ ] Create adjustment form
- [ ] Physical count entry
- [ ] Adjustment validation
- [ ] Adjustment list and filters

### Phase 7: Warehouse Management
- [ ] Warehouse CRUD
- [ ] Location management
- [ ] Warehouse settings

### Phase 8: Stock Ledger & Reports
- [ ] Move history view
- [ ] Stock ledger
- [ ] Reporting features
- [ ] Export functionality

### Phase 9: Advanced Features
- [ ] Low stock alerts
- [ ] Notifications system
- [ ] Advanced search
- [ ] Barcode scanning (future)

## 📡 API Endpoints

### Authentication (✅ Completed)
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request OTP for password reset
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/reset-password` - Reset password with OTP
- `GET /api/auth/me` - Get current user (protected)

### Products (To Implement)
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/:id/stock` - Get stock availability

### Receipts (To Implement)
- `GET /api/receipts` - Get all receipts
- `GET /api/receipts/:id` - Get receipt by ID
- `POST /api/receipts` - Create receipt
- `PUT /api/receipts/:id` - Update receipt
- `POST /api/receipts/:id/validate` - Validate receipt
- `DELETE /api/receipts/:id` - Cancel receipt

### Deliveries (To Implement)
- `GET /api/deliveries` - Get all deliveries
- `GET /api/deliveries/:id` - Get delivery by ID
- `POST /api/deliveries` - Create delivery order
- `PUT /api/deliveries/:id` - Update delivery
- `POST /api/deliveries/:id/pick` - Mark items as picked
- `POST /api/deliveries/:id/validate` - Validate delivery
- `DELETE /api/deliveries/:id` - Cancel delivery

### Transfers (To Implement)
- `GET /api/transfers` - Get all transfers
- `GET /api/transfers/:id` - Get transfer by ID
- `POST /api/transfers` - Create transfer
- `PUT /api/transfers/:id` - Update transfer
- `POST /api/transfers/:id/execute` - Execute transfer
- `DELETE /api/transfers/:id` - Cancel transfer

### Adjustments (To Implement)
- `GET /api/adjustments` - Get all adjustments
- `GET /api/adjustments/:id` - Get adjustment by ID
- `POST /api/adjustments` - Create adjustment
- `POST /api/adjustments/:id/validate` - Validate adjustment
- `DELETE /api/adjustments/:id` - Cancel adjustment

### Warehouses (To Implement)
- `GET /api/warehouses` - Get all warehouses
- `GET /api/warehouses/:id` - Get warehouse by ID
- `POST /api/warehouses` - Create warehouse
- `PUT /api/warehouses/:id` - Update warehouse
- `DELETE /api/warehouses/:id` - Delete warehouse

### Stock Ledger (To Implement)
- `GET /api/ledger` - Get stock movement history
- `GET /api/ledger/product/:id` - Get movements for a product
- `GET /api/ledger/warehouse/:id` - Get movements for a warehouse

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup
```bash
cd stockmaster_backend
npm install
# Create .env file with:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key
# PORT=5000
npm run dev
```

### Frontend Setup
```bash
cd stockmaster_frontend
npm install
# Install shadcn select dependency
npm install @radix-ui/react-select
npm run dev
```

### Environment Variables

#### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/stockmaster
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d
```

#### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 📝 Notes

- All stock movements are automatically logged in the inventory ledger
- Stock levels update in real-time when operations are validated
- Role-based access ensures users only see and perform actions they're authorized for
- The system supports multiple warehouses and locations within warehouses
- All operations maintain a complete audit trail

## 🔄 Complete Inventory Flow Example

### Step-by-Step Inventory Operations

#### Step 1: Receive Goods (Incoming Stock)
```
Vendor → Warehouse
Action: Receive 100 kg Steel
Result: Stock: +100
Location: Main Warehouse
Status: Stock increased automatically
```

#### Step 2: Internal Movement (Transfer)
```
Warehouse A → Rack B (Production Rack)
Action: Move 50 kg Steel to production
Result: Stock unchanged in total
Location Updated: 
  - Main Warehouse: -50
  - Production Rack: +50
Status: Stock moved, total remains same
```

#### Step 3: Deliver Goods (Outgoing Stock)
```
Customer Order → Delivery
Action: Deliver 20 kg Steel to customer
Result: Stock: -20
Location: Main Warehouse
Status: Stock decreased automatically
```

#### Step 4: Adjustments (Stock Correction)
```
Physical Count → Adjustment
Action: 3 kg Steel damaged (found during count)
Recorded: 100 kg → Counted: 97 kg
Result: Stock: -3
Location: Main Warehouse
Status: Stock adjusted automatically
```

#### Final Result
- **All movements logged** in Stock Ledger
- Complete audit trail maintained
- Real-time stock levels updated
- Location tracking accurate

---

**Status**: Foundation complete ✅ | Core features in development 🚧

