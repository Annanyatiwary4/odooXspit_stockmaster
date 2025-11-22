# StockMaster Frontend 📦

Modern, responsive inventory management system built with React, Vite, and Tailwind CSS.

## 🚀 Features

### Authentication
- ✅ Login with email/password
- ✅ Signup with role selection (Admin/Manager/Staff)
- ✅ Forgot password with OTP verification
- ✅ JWT token-based authentication
- ✅ Protected routes with role-based access control

### Dashboard
- 📊 Real-time inventory statistics
- 📈 Low stock alerts
- 📉 Category-wise breakdown
- 🔔 Pending operations tracking
- 💹 Trend indicators

### Inventory Management
- **Products**: Full CRUD operations, SKU tracking, reorder levels
- **Warehouses**: Multi-location management
- **Receipts**: Incoming stock with validation workflow
- **Deliveries**: Outgoing shipments with picking/packing workflow
- **Transfers**: Inter-warehouse stock movement
- **Adjustments**: Stock correction and reconciliation

### User Roles & Permissions
- **Admin** 👑: Full system access, user management
- **Manager** 📊: Inventory operations, approvals, reports
- **Staff** 🧑‍🔧: Task execution (picking, packing)

### Advanced Features
- 🚨 Automated stock alerts
- 📋 Staff task management
- 📊 Warehouse-level reports
- 🔍 Real-time search and filtering
- 📱 Fully responsive design

## 🛠️ Tech Stack

- **React 19** - UI Framework
- **Vite** - Build tool
- **React Router v7** - Navigation
- **Tailwind CSS v4** - Styling
- **Radix UI** - Accessible components
- **Lucide React** - Icons
- **Fetch API** - HTTP client

## 📁 Project Structure

```
stockmaster_frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, fonts
│   ├── components/
│   │   ├── auth/          # Login, Signup, ForgotPassword
│   │   ├── layout/        # DashboardLayout, Sidebar
│   │   ├── ui/            # Reusable UI components
│   │   └── ProtectedRoute.jsx
│   ├── lib/
│   │   ├── api.js         # API client & endpoints
│   │   ├── auth.js        # Auth utilities
│   │   └── utils.js       # Helper functions
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Products.jsx
│   │   ├── Warehouses.jsx
│   │   ├── Receipts.jsx
│   │   ├── Deliveries.jsx
│   │   ├── Transfers.jsx
│   │   ├── Adjustments.jsx
│   │   ├── MyTasks.jsx
│   │   ├── Alerts.jsx
│   │   ├── Users.jsx
│   │   └── Reports.jsx
│   ├── App.jsx            # Route configuration
│   ├── main.jsx           # App entry point
│   └── index.css          # Global styles
├── .env                   # Environment variables
├── package.json
└── vite.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Backend server running on http://localhost:5000

### Installation

1. **Navigate to frontend directory**
```bash
cd stockmaster_frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
The `.env` file is already created with:
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Start development server**
```bash
npm run dev
```

The app will open at `http://localhost:5173`

## 🔑 Demo Credentials

After running backend signup, use these credentials:

### Admin
- Email: `admin@stockmaster.com`
- Password: `admin123`
- Access: Full system control

### Manager
- Email: `manager@stockmaster.com`
- Password: `manager123`
- Access: Inventory operations, reports

### Staff
- Email: `staff@stockmaster.com`
- Password: `staff123`
- Access: Task execution only

## 📖 Usage Guide

### 1. Login
- Navigate to `/login`
- Enter credentials
- Auto-redirect based on role:
  - Admin/Manager → Dashboard
  - Staff → My Tasks

### 2. Products Management
- **Admin/Manager**: Create, edit, delete products
- **Staff**: View products only
- Features:
  - Real-time search
  - Stock level indicators
  - Reorder level tracking

### 3. Receipts (Incoming Stock)
- Create receipt with supplier info
- Add multiple items
- Validate to increase stock

### 4. Deliveries (Outgoing Stock)
- Create delivery order
- Manager assigns picker
- Staff completes picking
- Manager assigns packer
- Staff completes packing
- Manager validates (stock decreases)

### 5. Staff Tasks
- View assigned picking tasks
- View assigned packing tasks
- Complete tasks with quantities

### 6. Alerts
- Auto-generated low stock alerts
- Severity levels: Low, Medium, High, Critical
- Acknowledge and resolve workflow

### 7. Reports
- Warehouse-level stock view
- Category breakdown
- Movement trends (coming soon)

## 🎨 UI Components

### Reusable Components
- `Button` - Multiple variants (default, outline, link)
- `Card` - Content containers
- `Input` - Form inputs
- `Label` - Form labels

### Layout Components
- `DashboardLayout` - Sidebar + header + content
- `ProtectedRoute` - Auth guard wrapper

## 🔐 Authentication Flow

```
1. User enters credentials
2. API call to /auth/login
3. Receive JWT token + user data
4. Store in localStorage
5. Auto-include token in all requests
6. Navigate to role-based home page
```

## 🚦 Routing

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | Login page |
| `/signup` | Public | Registration |
| `/forgot-password` | Public | Password reset |
| `/dashboard` | All roles | Main dashboard |
| `/my-tasks` | Staff only | Task list |
| `/products` | All roles | Product catalog |
| `/warehouses` | Admin/Manager | Warehouse management |
| `/receipts` | Admin/Manager | Incoming stock |
| `/deliveries` | All roles | Outgoing shipments |
| `/transfers` | Admin/Manager | Inter-warehouse moves |
| `/adjustments` | Admin/Manager | Stock corrections |
| `/alerts` | All roles | Stock alerts |
| `/reports` | Admin/Manager | Analytics |
| `/users` | Admin only | User management |

## 🎯 Key Features by Page

### Dashboard
- Total products, stock count
- Low stock alerts (top 5)
- Category breakdown
- Pending operations

### Products
- Grid view with cards
- Search by name/SKU
- Stock level colors (red = low, green = good)
- CRUD modal forms

### Deliveries
- Workflow status badges
- Picking/packing status
- Customer information
- Multi-item support

### My Tasks (Staff)
- Separate picking/packing sections
- One-click task completion
- Product details in task cards

### Alerts
- Severity-based color coding
- Active/Acknowledged/Resolved status
- Generate alerts button
- Summary statistics

## 🧪 Testing the Application

1. **Start Backend**
```bash
cd stockmaster_backend
npm run dev
```

2. **Start Frontend**
```bash
cd stockmaster_frontend
npm run dev
```

3. **Test Flow**
- Signup as admin
- Create warehouse (WH001)
- Create products
- Create receipt → validate (stock increases)
- Create delivery → assign staff → complete workflow
- Check alerts for low stock
- View reports

## 📦 Build for Production

```bash
npm run build
```

Built files will be in `dist/` folder.

Preview production build:
```bash
npm run preview
```

## 🐛 Troubleshooting

### API Connection Issues
- Check backend is running on port 5000
- Verify VITE_API_URL in .env
- Check browser console for CORS errors

### Authentication Issues
- Clear localStorage: `localStorage.clear()`
- Check token in Application tab
- Verify backend JWT_SECRET matches

### Styling Issues
- Ensure Tailwind CSS is configured
- Check index.css imports
- Verify component class names

## 🔄 State Management

Currently using React hooks (useState, useEffect) for local state.

**Future considerations:**
- Context API for global state
- React Query for server state
- Zustand for complex state

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints:
  - `sm`: 640px
  - `md`: 768px (tablet)
  - `lg`: 1024px (desktop)
- Hamburger menu on mobile
- Grid layouts adapt to screen size

## 🎨 Design System

### Colors
- Primary: Blue (#2563eb)
- Success: Green (#16a34a)
- Warning: Orange (#ea580c)
- Error: Red (#dc2626)
- Purple: Admin (#9333ea)

### Typography
- Font: System fonts (sans-serif)
- Headings: Bold, larger sizes
- Body: Regular weight

## 🚀 Performance

- Code splitting with React Router
- Lazy loading (can be implemented)
- Optimized re-renders with keys
- Vite's fast HMR

## 🔮 Future Enhancements

- [ ] Real-time updates with WebSockets
- [ ] Advanced filtering and sorting
- [ ] Export reports to PDF/Excel
- [ ] Barcode scanning integration
- [ ] Charts and visualizations (Chart.js)
- [ ] Bulk operations
- [ ] Activity logs
- [ ] Mobile app (React Native)

## 📄 License

This project is part of the StockMaster inventory management system.

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📞 Support

For issues or questions, check the backend README or contact the development team.

---

**Built with ❤️ using React + Vite + Tailwind CSS**
