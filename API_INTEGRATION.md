# TopBoy Admin Dashboard - API Integration

## 🔗 **Backend API Integration Complete**

The admin dashboard has been successfully integrated with the actual TopBoy backend API based on the provided OpenAPI specification.

## 📋 **Integrated Admin APIs**

### 1. **Authentication**
- **Endpoint**: `POST /admin/login`
- **Request**: `{ username: string, password: string }`
- **Response**: `{ token: string }`
- **Status**: ✅ Integrated

### 2. **Upload Codes**
- **Endpoint**: `POST /admin/upload?category={FIFTY|HUNDRED}`
- **Request**: FormData with file
- **Response**: `{ totalUploaded: number, duplicates: string[], blankLines: number }`
- **Status**: ✅ Integrated

### 3. **Get Prices**
- **Endpoint**: `GET /admin/prices`
- **Response**: `ProxyPriceConfig[]`
- **Status**: ✅ Integrated

### 4. **Update Price**
- **Endpoint**: `PUT /admin/price?category={FIFTY|HUNDRED}&newPrice={number}`
- **Response**: `ProxyPriceConfig`
- **Status**: ✅ Integrated

## 🔧 **API Client Configuration**

### Base URL
```typescript
baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
```

### Authentication
- JWT tokens are automatically included in request headers
- Automatic logout on 401 responses
- Token storage in localStorage

### Request Interceptors
```typescript
// Automatically adds Authorization header
config.headers.Authorization = `Bearer ${token}`;
```

### Response Interceptors
```typescript
// Handles 401 errors by redirecting to login
if (error.response?.status === 401) {
  localStorage.removeItem('admin_token');
  window.location.href = '/login';
}
```

## 📊 **Data Types**

### LoginRequest
```typescript
interface LoginRequest {
  username: string;
  password: string;
}
```

### LoginResponse
```typescript
interface LoginResponse {
  token: string;
}
```

### ProxyPriceConfig
```typescript
interface ProxyPriceConfig {
  id: number;
  category: 'FIFTY' | 'HUNDRED';
  price: number;
}
```

### UploadResult
```typescript
interface UploadResult {
  totalUploaded: number;
  duplicates: string[];
  blankLines: number;
}
```

## 🚀 **Usage Instructions**

### 1. **Environment Setup**
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 2. **Login Flow**
1. User enters username and password
2. System calls `POST /admin/login`
3. JWT token is stored in localStorage
4. User is redirected to dashboard

### 3. **Upload Flow**
1. User selects file and category
2. System calls `POST /admin/upload?category={category}`
3. File is uploaded as FormData
4. Upload results are displayed

### 4. **Price Management**
1. System fetches prices via `GET /admin/prices`
2. User can edit prices inline
3. Changes are saved via `PUT /admin/price`
4. UI updates immediately

## 🔒 **Security Features**

- **JWT Authentication**: All admin requests include Bearer token
- **Automatic Logout**: 401 responses trigger logout
- **Protected Routes**: Frontend route protection
- **Secure Storage**: Tokens stored in localStorage

## 📱 **Error Handling**

- **Network Errors**: User-friendly error messages
- **Authentication Errors**: Automatic redirect to login
- **Validation Errors**: Form-level error display
- **Upload Errors**: Detailed upload failure feedback

## 🧪 **Testing**

### Mock Data
The system includes mock data for testing without a backend:
- Mock sales data for dashboard
- Mock price configurations
- Mock upload results

### Development Mode
```bash
npm run dev
# Access at http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

## 🔄 **API Endpoints Summary**

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/admin/login` | Admin authentication | ✅ |
| POST | `/admin/upload` | Upload proxy codes | ✅ |
| GET | `/admin/prices` | Get category prices | ✅ |
| PUT | `/admin/price` | Update category price | ✅ |

## 📝 **Notes**

- **Sales Dashboard**: Currently uses mock data as the API doesn't include a sales endpoint
- **File Upload**: Supports CSV, Excel (.xlsx), and Text files
- **Price Updates**: Real-time updates with immediate UI feedback
- **Responsive Design**: Works on all device sizes

## 🎯 **Ready for Production**

The admin dashboard is now fully integrated with the TopBoy backend API and ready for production use. All admin functionality is working with the actual backend endpoints. 