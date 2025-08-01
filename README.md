# TopBoy Admin Dashboard

A secure React-based admin dashboard for a Proxy Selling platform built with Next.js, TypeScript, and Tailwind CSS.

## 🌟 Features

- **🔐 Secure Authentication**: JWT-based login system with protected routes
- **📊 Sales Dashboard**: Monitor sales data with filtering and export capabilities
- **📤 Code Upload**: Upload proxy codes from CSV, Excel, or text files
- **💰 Price Management**: Update proxy category prices with inline editing
- **📋 Code Management**: View and manage uploaded proxy codes
- **🌙 Dark Mode**: Automatic theme detection with manual toggle
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **🎨 Modern UI**: Beautiful interface with Tailwind CSS and custom components

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, React 18
- **Styling**: Tailwind CSS, PostCSS
- **HTTP Client**: Axios with interceptors
- **Authentication**: JWT tokens with localStorage
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Spring Boot backend running (see backend setup)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TopBoy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local file
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your API URL:
   ```env
   # Development
   NEXT_PUBLIC_API_URL=http://localhost:8080
   
   # Production (update this for your backend)
   # NEXT_PUBLIC_API_URL=https://your-backend-domain.com
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8080` | Yes |

### Environment Setup Examples

**Development:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**Staging:**
```env
NEXT_PUBLIC_API_URL=https://staging-api.yourdomain.com
```

**Production:**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Sales dashboard
│   ├── codes/            # Code management
│   ├── upload/           # File upload
│   ├── prices/           # Price management
│   └── login/            # Authentication
├── components/           # Reusable UI components
│   ├── CustomDropdown.tsx
│   ├── Layout.tsx
│   └── ProtectedRoute.tsx
├── hooks/               # Custom React hooks
│   ├── useAuth.tsx
│   └── useTheme.tsx
├── lib/                 # Utilities and configurations
│   ├── api.ts           # API client
│   ├── categoryUtils.ts # Category conversion utilities
│   └── types.ts         # TypeScript type definitions
└── types/               # Shared type definitions
```

## 🔌 API Integration

The dashboard integrates with a Spring Boot backend. Required endpoints:

### Authentication
- `POST /admin/login` - Admin login

### Sales Management
- `GET /admin/sales` - Get sales data (optional)

### Code Management
- `GET /admin/codes` - Get uploaded codes
- `POST /admin/upload` - Upload codes file
- `GET /admin/categories` - Get available categories

### Price Management
- `GET /admin/prices` - Get current prices
- `PUT /admin/price` - Update price

## 🎨 Customization

### Styling
- **Colors**: Update `tailwind.config.js` for brand colors
- **Components**: Modify components in `src/components/`
- **Dark Mode**: Customize dark mode styles in `src/app/globals.css`

### Features
- **Authentication**: Modify `src/hooks/useAuth.tsx`
- **API Client**: Update `src/lib/api.ts` for new endpoints
- **Types**: Add new types in `src/types/`

## 🚀 Deployment

### Vercel Deployment

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`: Your production backend URL
3. **Deploy** - Vercel will automatically build and deploy

### Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-production-backend.com`
   - **Environment**: Production (and Preview if needed)

### Other Platforms

For other deployment platforms, set the `NEXT_PUBLIC_API_URL` environment variable to point to your backend API.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Client-side route protection
- **Token Interceptors**: Automatic token inclusion in requests
- **401 Handling**: Automatic logout on authentication failure
- **Input Validation**: Form validation with Zod schemas

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Responsive layouts for tablets
- **Desktop**: Full-featured desktop experience
- **Touch Friendly**: Large touch targets for mobile

## 🌙 Dark Mode

- **Automatic Detection**: Detects system theme preference
- **Manual Toggle**: Moon/sun button for manual switching
- **Persistence**: Remembers user's theme choice
- **Smooth Transitions**: Animated theme switching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for TopBoy Proxy Platform**
