# 🚀 StockMaster - Quick Start Guide

## Complete Setup Instructions

### Backend Setup

1. **Navigate to backend folder**
```bash
cd stockmaster_backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
Create a file named `.env` in `stockmaster_backend` folder with:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
```

4. **Start backend server**
```bash
npm run dev
```
Server will run on http://localhost:5000

### Frontend Setup

1. **Open new terminal and navigate to frontend**
```bash
cd stockmaster_frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start frontend server**
```bash
npm run dev
```
App will open at http://localhost:5173

## 🎯 First Time Usage

1. **Open browser** → http://localhost:5173

2. **Click "Create Account"**
   - Name: Admin User
   - Email: admin@stockmaster.com
   - Password: admin123
   - Role: Admin
   - Click "Create Account"

3. **You'll be auto-logged in** and redirected to dashboard

4. **Complete Setup:**
   - Go to "Warehouses" → Add warehouse (e.g., WH001)
   - Go to "Products" → Add products
   - Go to "Users" → Add manager and staff users

5. **Test Workflow:**
   - Receipts → Create receipt → Validate (stock increases)
   - Deliveries → Create delivery → Assign picker → Complete picking → Assign packer → Complete packing → Validate
   - Check Alerts for low stock notifications

## 📚 Full Documentation

- **Backend API**: See `stockmaster_backend/POSTMAN_TESTING_GUIDE.md`
- **Frontend Guide**: See `stockmaster_frontend/FRONTEND_README.md`
- **Three-Role System**: See `stockmaster_backend/THREE_ROLE_SYSTEM.md`

## 🔑 Demo Credentials

After initial setup, you can login with:
- **Admin**: admin@stockmaster.com / admin123
- **Manager**: (create via Users page)
- **Staff**: (create via Users page)

## 🎉 You're All Set!

The complete StockMaster inventory management system is now running with:
- ✅ Full authentication system
- ✅ Three-role RBAC (Admin, Manager, Staff)
- ✅ Complete CRUD operations
- ✅ Delivery workflow (picking/packing)
- ✅ Stock alerts system
- ✅ Reports and analytics
- ✅ Beautiful, responsive UI

Happy inventory management! 📦
