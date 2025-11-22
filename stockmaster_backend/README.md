# StockMaster Backend API

Complete modular backend for StockMaster inventory management system built with Node.js, Express.js, and MongoDB.

## 📁 Project Structure

```
stockmaster_backend/
├── config/
│   └── db.js                 # MongoDB connection
├── models/
│   ├── user.js              # User model
│   ├── product.js           # Product model
│   ├── warehouse.js         # Warehouse model
│   ├── receipt.js           # Receipt model
│   ├── delivery.js          # Delivery model
│   ├── transfer.js          # Transfer model
│   └── adjustment.js        # Adjustment model
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── productController.js # Product management
│   ├── receiptController.js # Receipt operations
│   ├── deliveryController.js# Delivery operations
│   ├── transferController.js# Transfer operations
│   ├── adjustmentController.js # Stock adjustments
│   └── dashboardController.js  # Dashboard stats
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── productRoutes.js     # Product endpoints
│   ├── receiptRoutes.js     # Receipt endpoints
│   ├── deliveryRoutes.js    # Delivery endpoints
│   ├── transferRoutes.js    # Transfer endpoints
│   ├── adjustmentRoutes.js  # Adjustment endpoints
│   └── dashboardRoutes.js   # Dashboard endpoints
├── .env.example             # Environment variables template
├── server.js                # Express app setup
└── package.json
```

## 🚀 Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Update the MongoDB connection string and JWT secret
   ```bash
   cp .env.example .env
   ```

3. **Start MongoDB**
   - Make sure MongoDB is running locally or update `MONGO_URI` in `.env`

4. **Run the Server**
   ```bash
   npm run dev
   ```

   Server will start on `http://localhost:5000`

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)

#### 1. Signup
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "manager"
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### 3. Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "john@example.com"
}
```
**Note:** Mock OTP is `1234`

#### 4. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "1234",
  "newPassword": "newpassword123"
}
```

### Product Routes (`/api/products`)

#### 1. Create Product
```http
POST /api/products
Content-Type: application/json

{
  "name": "Product A",
  "sku": "SKU001",
  "category": "Electronics",
  "uom": "pcs",
  "reorderLevel": 10
}
```

#### 2. Update Product
```http
PUT /api/products/:id
Content-Type: application/json

{
  "name": "Updated Product Name",
  "reorderLevel": 15
}
```

#### 3. Get All Products
```http
GET /api/products
```

#### 4. Get Stock by Location
```http
GET /api/products/:id/stock
```

### Receipt Routes (`/api/receipts`)

#### 1. Create Receipt
```http
POST /api/receipts
Content-Type: application/json

{
  "supplier": "Supplier ABC",
  "location": "Warehouse A",
  "items": [
    {
      "productId": "product_id_here",
      "qty": 100
    }
  ]
}
```

#### 2. Validate Receipt (Increase Stock)
```http
POST /api/receipts/:id/validate
```

### Delivery Routes (`/api/delivery`)

#### 1. Create Delivery
```http
POST /api/delivery
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

#### 2. Validate Delivery (Decrease Stock)
```http
POST /api/delivery/:id/validate
Content-Type: application/json

{
  "location": "Warehouse A"
}
```

### Transfer Routes (`/api/transfers`)

#### 1. Create Transfer
```http
POST /api/transfers
Content-Type: application/json

{
  "from": "Warehouse A",
  "to": "Warehouse B",
  "items": [
    {
      "productId": "product_id_here",
      "qty": 30
    }
  ]
}
```

#### 2. Validate Transfer (Update Stock by Location)
```http
POST /api/transfers/:id/validate
```

### Adjustment Routes (`/api/adjustments`)

#### 1. Adjust Stock
```http
POST /api/adjustments
Content-Type: application/json

{
  "productId": "product_id_here",
  "location": "Warehouse A",
  "systemQty": 100,
  "countedQty": 95,
  "reason": "Damaged items"
}
```

### Dashboard Routes (`/api/dashboard`)

#### 1. Get Dashboard Stats
```http
GET /api/dashboard
```

**Response includes:**
- Total products count
- Low stock products (below reorder level)
- Pending receipts
- Pending deliveries
- Pending transfers

## 🔧 Models Schema

### User
- name: String
- email: String (unique)
- password: String (hashed)
- role: String (default: "manager")

### Product
- name: String
- sku: String
- category: String
- uom: String
- totalStock: Number (default: 0)
- stockByLocation: Map<String, Number>
- reorderLevel: Number (default: 5)

### Warehouse
- name: String
- code: String
- address: String

### Receipt
- supplier: String
- location: String
- status: String (default: "Draft")
- items: Array of { productId, qty }

### Delivery
- customer: String
- status: String (default: "Draft")
- items: Array of { productId, qty }

### Transfer
- from: String
- to: String
- status: String (default: "Draft")
- items: Array of { productId, qty }

### Adjustment
- productId: ObjectId
- location: String
- systemQty: Number
- countedQty: Number
- reason: String

## 🎯 Key Features

✅ **Modular Architecture** - All controllers and routes are exportable
✅ **Authentication** - Signup, login, OTP verification, password reset
✅ **Stock Management** - Create, update, track products
✅ **Receipt Processing** - Validate receipts to increase stock
✅ **Delivery Processing** - Validate deliveries to decrease stock
✅ **Transfer Management** - Move stock between locations
✅ **Stock Adjustments** - Handle discrepancies
✅ **Dashboard Analytics** - Real-time inventory insights
✅ **Location Tracking** - Track stock across multiple locations

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **nodemon** - Development auto-restart

## 🔐 Security

- Passwords are hashed using bcryptjs
- JWT tokens for authenticated sessions
- Environment variables for sensitive data
- Input validation in controllers

## 🤝 Team Integration

All controllers export individual functions that can be imported by teammates:

```javascript
// Import specific functions
import { createProduct, updateProduct } from './controllers/productController.js';
import { validateReceipt } from './controllers/receiptController.js';
import { getDashboardStats } from './controllers/dashboardController.js';
```

## 📝 Notes

- Mock OTP is hardcoded as "1234" for development
- Update JWT_SECRET in production
- Configure proper MongoDB connection string
- All timestamps are automatically managed by Mongoose

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

## 📄 License

ISC
