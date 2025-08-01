# Backend API Endpoints

This document lists all the required backend endpoints for the TopBoy Admin Dashboard.

## ✅ Implemented Endpoints

### 1. Authentication
- **POST** `/admin/login`
  - **Purpose**: Admin login
  - **Request Body**: `{ "username": "string", "password": "string" }`
  - **Response**: `{ "token": "string" }`

### 2. File Upload
- **POST** `/admin/upload`
  - **Purpose**: Upload proxy codes file
  - **Parameters**: 
    - `category` (query): `FIFTY` or `HUNDRED`
    - `file` (multipart): CSV, XLSX, or TXT file
  - **Response**: `{ "totalUploaded": number, "duplicates": string[], "blankLines": number }`

### 3. Price Management
- **GET** `/admin/prices`
  - **Purpose**: Get all price configurations
  - **Response**: `ProxyPriceConfig[]`
- **PUT** `/admin/price`
  - **Purpose**: Update price for a category
  - **Parameters**:
    - `category` (query): `FIFTY` or `HUNDRED`
    - `newPrice` (query): integer
  - **Response**: Updated `ProxyPriceConfig`

### 4. Admin User Management
- **POST** `/admin/create-user`
  - **Purpose**: Create new admin user
  - **Request Body**: `{ "username": "string", "password": "string" }`
  - **Response**: Success message

## ❌ Missing Endpoints

### 1. Sales Data
- **GET** `/admin/sales`
  - **Purpose**: Get sales/customer data
  - **Parameters** (optional):
    - `startDate` (query): ISO date string
    - `endDate` (query): ISO date string
    - `category` (query): `FIFTY` or `HUNDRED`
  - **Response**: `Sale[]`
  - **Implementation Example**:
```java
@GetMapping("/sales")
public ResponseEntity<List<Sale>> getSales(
    @RequestParam(required = false) String startDate,
    @RequestParam(required = false) String endDate,
    @RequestParam(required = false) CodeCategory category
) {
    // Implement filtering logic
    List<Sale> sales = saleService.getSales(startDate, endDate, category);
    return ResponseEntity.ok(sales);
}
```

### 2. Uploaded Codes Management
- **GET** `/admin/codes`
  - **Purpose**: Get all uploaded proxy codes
  - **Parameters** (optional):
    - `category` (query): `FIFTY` or `HUNDRED`
    - `isUsed` (query): boolean
  - **Response**: `UploadedCode[]`
  - **Implementation Example**:
```java
@GetMapping("/codes")
public ResponseEntity<List<UploadedCode>> getUploadedCodes(
    @RequestParam(required = false) CodeCategory category,
    @RequestParam(required = false) Boolean isUsed
) {
    List<UploadedCode> codes = codeService.getCodes(category, isUsed);
    return ResponseEntity.ok(codes);
}
```

## 📋 Required Entity Classes

### Sale Entity
```java
@Entity
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String date;
    private String phoneNumber;
    private String proxyCode;
    
    @Enumerated(EnumType.STRING)
    private CodeCategory category;
    
    // getters, setters, constructors
}
```

### UploadedCode Entity
```java
@Entity
public class UploadedCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String code;
    
    @Enumerated(EnumType.STRING)
    private CodeCategory category;
    
    private LocalDateTime uploadedAt;
    private boolean isUsed;
    private LocalDateTime usedAt;
    
    // getters, setters, constructors
}
```

## 🔧 Additional Configuration

### CORS Configuration
Add this to your Spring Boot application:
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:3001")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### Database Initialization
Add this to initialize default prices:
```java
@PostConstruct
public void initializePrices() {
    if (proxyPriceConfigRepository.count() == 0) {
        ProxyPriceConfig fifty = new ProxyPriceConfig();
        fifty.setCategory(CodeCategory.FIFTY);
        fifty.setPrice(50);
        proxyPriceConfigRepository.save(fifty);
        
        ProxyPriceConfig hundred = new ProxyPriceConfig();
        hundred.setCategory(CodeCategory.HUNDRED);
        hundred.setPrice(100);
        proxyPriceConfigRepository.save(hundred);
    }
}
``` 