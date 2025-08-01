# TopBoy Admin Dashboard

A secure React-based admin dashboard for a Proxy Selling platform built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

### 🔐 Authentication
- JWT-based login system
- Protected routes with automatic redirect
- Secure token storage in localStorage
- Automatic token refresh and error handling

### 📈 Sales Dashboard
- Real-time sales data visualization
- Filterable sales table with date range and category filters
- Export functionality (CSV format)
- Statistics cards showing total sales and category breakdowns

### 📤 Code Upload
- Drag & drop file upload support
- Multiple file format support (CSV, Excel, Text)
- File validation (type, size limits)
- Upload progress tracking
- Detailed upload results (uploaded, duplicates, blank lines)

### 💰 Price Management
- Inline price editing for categories
- Real-time price updates
- Keyboard shortcuts (Enter to save, Escape to cancel)
- Success/error feedback

### 🎨 UI/UX
- Modern, responsive design with Tailwind CSS
- Mobile-friendly sidebar navigation
- Loading states and error handling
- Beautiful icons with Lucide React
- Form validation with React Hook Form + Zod

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **State Management**: React Context + Hooks

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Sales dashboard page
│   ├── login/            # Login page
│   ├── prices/           # Price management page
│   ├── upload/           # Code upload page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page (redirects)
├── components/           # Reusable components
│   ├── Layout.tsx        # Main layout with sidebar
│   ├── ProtectedRoute.tsx # Auth protection wrapper
│   └── Sidebar.tsx       # Navigation sidebar
├── hooks/                # Custom React hooks
│   └── useAuth.ts        # Authentication context
├── lib/                  # Utility libraries
│   └── api.ts           # API client with axios
└── types/               # TypeScript type definitions
    └── index.ts         # Application types
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd TopBoy
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:8080
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### API Endpoints

The application expects the following Spring Boot backend endpoints:

#### Authentication
- `POST /api/auth/login` - Admin login

#### Sales
- `GET /api/admin/sales` - Get sales data with optional filters

#### Upload
- `POST /api/admin/upload` - Upload proxy codes

#### Prices
- `GET /api/admin/prices` - Get category prices
- `PUT /api/admin/prices` - Update category price

## 🔐 Security Features

- JWT token authentication
- Automatic token inclusion in API requests
- Route protection on frontend
- Automatic logout on 401 responses
- Secure token storage

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🎯 Key Features

### Dashboard
- Sales statistics with visual indicators
- Filterable data table
- Export functionality
- Real-time data updates

### Upload System
- Drag & drop interface
- File type validation
- Progress tracking
- Detailed upload results

### Price Management
- Inline editing
- Keyboard shortcuts
- Real-time updates
- Validation feedback

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Setup
Ensure your production environment has:
- `NEXT_PUBLIC_API_URL` pointing to your Spring Boot backend
- HTTPS enabled for security
- Proper CORS configuration on backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS # topboyproxy-admin
