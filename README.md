# 🥛 Digital Milk Book

A complete, production-ready MERN stack web application for milk vendors to manage customers, track daily milk deliveries, and automatically calculate monthly billing.

## 🎯 Features

### ✨ Core Features
- **Customer Management**: Add, edit, delete, and view customers
- **Daily Delivery Tracking**: Record milk deliveries with duplicate prevention
- **Automatic Billing**: Calculate monthly bills based on quantity and price
- **Dashboard**: Real-time stats for customers, deliveries, and revenue
- **Monthly Reports**: View customer-wise billing summaries
- **PDF Invoices**: Generate downloadable bills for individual customers
- **CSV Export**: Export monthly reports for analysis

### 🔐 Security
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes and API endpoints
- Input validation on client and server
- CORS and helmet protection

## 🛠️ Tech Stack

**Frontend:**
- React.js (Functional components + Hooks)
- React Router v7 for routing
- Tailwind CSS for styling
- Axios for API calls
- React Hot Toast for notifications
- date-fns for date handling
- jsPDF for PDF generation

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation

**Database:**
- MongoDB (local or cloud)

## 📁 Project Structure

```
DigitalMilkBook/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express app setup
│   │   ├── server.js              # Server bootstrap
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── models/
│   │   │   ├── Admin.js
│   │   │   ├── Customer.js
│   │   │   └── Delivery.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── customerController.js
│   │   │   ├── deliveryController.js
│   │   │   ├── dashboardController.js
│   │   │   └── reportController.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── customers.js
│   │   │   ├── deliveries.js
│   │   │   ├── dashboard.js
│   │   │   └── reports.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── validateRequest.js
│   │   ├── utils/
│   │   │   ├── billing.js         # Billing calculations
│   │   │   ├── date.js            # Date utilities
│   │   │   └── pdf.js             # PDF generation
│   │   └── seed/
│   │       └── seedDatabase.js    # Sample data
│   ├── .env
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── main.jsx               # Entry point
    │   ├── App.jsx                # Main routing
    │   ├── index.css              # Tailwind setup
    │   ├── api/
    │   │   └── client.js          # Axios instance & API calls
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── components/
    │   │   ├── UI.jsx             # Reusable UI components
    │   │   └── ProtectedRoute.jsx # Route protection
    │   ├── layouts/
    │   │   └── MainLayout.jsx     # Header & Layout
    │   └── pages/
    │       ├── LoginPage.jsx
    │       ├── DashboardPage.jsx
    │       ├── CustomersPage.jsx
    │       ├── DeliveriesPage.jsx
    │       └── ReportsPage.jsx
    ├── .env
    ├── .env.example
    ├── vite.config.js
    └── package.json
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas connection string)
- npm or yarn

### 1. Clone & Install Dependencies

```bash
# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend (.env):**
```bash
cd backend
cp .env.example .env
# Edit .env and add your MongoDB URI and JWT secret
```

**Frontend (.env):**
```bash
cd frontend
cp .env.example .env
# Update VITE_API_URL if backend runs on different port
```

### 3. Start MongoDB

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (update MONGO_URI in .env)
```

### 4. Seed Sample Data (Optional)

```bash
cd backend
npm run seed
```

This creates:
- Admin account: `admin@milkbook.com` / `admin123`
- 5 sample customers
- Sample deliveries for the current month

### 5. Start the Application

**Terminal 1: Backend**
```bash
cd backend
npm run dev
```
Server runs on `http://localhost:5000`

**Terminal 2: Frontend**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

### 6. Access the Application

Open your browser and go to: `http://localhost:5173`

**Demo Credentials:**
- Email: `admin@milkbook.com`
- Password: `admin123`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new admin
- `POST /api/auth/login` - Login admin

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Deliveries
- `GET /api/deliveries` - Get deliveries (with filters)
- `GET /api/deliveries/:id` - Get delivery by ID
- `POST /api/deliveries` - Create delivery
- `PUT /api/deliveries/:id` - Update delivery
- `PATCH /api/deliveries/:id/toggle` - Toggle delivery status
- `DELETE /api/deliveries/:id` - Delete delivery

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/today` - Get today's deliveries

### Reports
- `GET /api/reports/summary` - Get monthly summary
- `GET /api/reports/bill/:customerId/:month` - Generate PDF bill
- `GET /api/reports/export/:month` - Export CSV report

## 🔑 Key Features Explained

### Duplicate Delivery Prevention
- Prevents recording multiple deliveries for the same customer on the same date
- Handled at database level with unique compound index

### Monthly Billing Calculation
- Automatically calculates:
  - Total litres delivered
  - Number of delivery days
  - Number of non-delivery days
  - Total amount (litres × price per litre)

### PDF Invoice Generation
- Professional PDF bills with:
  - Customer details
  - Billing summary
  - Delivery and payment information
- Can be downloaded individually

### CSV Export
- Monthly reports with all customer data
- Includes totals row
- Ready for Excel or data analysis

## 💾 Database Schema

### Admin Collection
```javascript
{
  email: String (unique),
  password: String (hashed),
  name: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Customer Collection
```javascript
{
  name: String,
  phone: String,
  address: String,
  pricePerLitre: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Delivery Collection
```javascript
{
  customerId: ObjectId (ref Customer),
  date: Date,
  quantity: Number,
  delivered: Boolean,
  createdAt: Date,
  updatedAt: Date
}
// Index: {customerId, date} - unique
```

## 🎨 UI Components

### Reusable Components
- `Card` - Container component
- `Button` - Various variants (primary, secondary, danger, success)
- `Input` - Form input with error handling
- `Modal` - Dialog component for forms
- `Table` - Data table with actions
- `ProtectedRoute` - Route protection wrapper

### Pages
- **Login** - Authentication page
- **Dashboard** - Overview and today's stats
- **Customers** - CRUD operations
- **Deliveries** - Record and manage deliveries
- **Reports** - Monthly summaries and exports

## 📊 Available Queries

### Get Today's Deliveries
```javascript
GET /api/dashboard/today
```

### Get Monthly Report
```javascript
GET /api/reports/summary?month=2026-04&customerId=optional
```

### Download Customer Bill
```javascript
GET /api/reports/bill/{customerId}/{month}
// Returns PDF file
```

### Export Monthly CSV
```javascript
GET /api/reports/export/{month}
// Returns CSV file
```

## 🔧 Development

### Backend Development
- Uses `nodemon` for auto-restart on file changes
- Run with `npm run dev`
- Express with middleware for security (helmet, cors)
- Global error handling middleware

### Frontend Development
- Vite for fast development
- Hot module replacement (HMR)
- React Query for API calls (via Axios)
- Context API for state management

## 🏗️ Production Deployment

### Backend
1. Set `NODE_ENV=production` in .env
2. Use a process manager like PM2
3. Set strong JWT_SECRET
4. Use MongoDB Atlas or managed service
5. Configure CORS for frontend domain
6. Deploy to Heroku, Railway, or your server

### Frontend
1. Build with `npm run build`
2. Outputs optimized files in `dist/`
3. Deploy to Vercel, Netlify, or static hosting
4. Set correct VITE_API_URL for production API

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check MONGO_URI in .env
- Ensure MongoDB is running locally
- Or verify MongoDB Atlas credentials

### CORS Error
- Check backend CORS configuration in app.js
- Verify frontend API URL in .env
- Ensure both are running on expected ports

### API 404 Errors
- Verify backend is running on port 5000
- Check if routes are registered correctly
- Use API client (Postman) to test endpoints

### Token Expired
- Tokens expire after 7 days
- User needs to login again
- Clear browser localStorage and retry

## 📄 License

This project is provided as-is for educational and commercial use.

## 👨‍💻 Built with ❤️

A complete production-ready MERN stack application with modern best practices and scalable architecture.

---

**Need Help?** Check the API documentation or test endpoints with Postman.
