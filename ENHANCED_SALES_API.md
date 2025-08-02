# Enhanced Sales API Documentation

## Endpoint: GET /admin/sales

### Description
Enhanced sales endpoint that returns sales data with optional filtering and period-based statistics. Supports daily, monthly, and total sales views.

### Request Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Query Parameters (Optional)
- `startDate` (string, optional): Filter sales from this date (format: YYYY-MM-DD)
- `endDate` (string, optional): Filter sales until this date (format: YYYY-MM-DD)
- `category` (string, optional): Filter by category (FIFTY, HUNDRED, TWO_HUNDRED, etc.)
- `period` (string, optional): Get statistics for specific period (daily, monthly, total)

### Example Requests

**Get all sales:**
```
GET /admin/sales
```

**Get daily sales:**
```
GET /admin/sales?period=daily
```

**Get monthly sales:**
```
GET /admin/sales?period=monthly
```

**Get sales with filters:**
```
GET /admin/sales?startDate=2024-01-01&endDate=2024-01-31&category=FIFTY
```

**Get daily sales for specific category:**
```
GET /admin/sales?period=daily&category=HUNDRED
```

### Response Format

#### Success Response (200 OK)
```json
{
  "sales": [
    {
      "id": "1",
      "date": "2024-01-15T10:30:00Z",
      "phoneNumber": "+233123456789",
      "proxyCode": "ABC123XYZ",
      "category": "FIFTY",
      "amount": 50.00
    },
    {
      "id": "2",
      "date": "2024-01-16T14:45:00Z",
      "phoneNumber": "+233987654321",
      "proxyCode": "DEF456UVW",
      "category": "HUNDRED",
      "amount": 100.00
    }
  ],
  "statistics": {
    "total": 2,
    "daily": 1,
    "monthly": 2,
    "revenue": {
      "total": 150.00,
      "daily": 50.00,
      "monthly": 150.00
    },
    "byCategory": {
      "FIFTY": 1,
      "HUNDRED": 1,
      "TWO_HUNDRED": 0,
      "THREE_HUNDRED": 0,
      "FOUR_HUNDRED": 0,
      "SIX_HUNDRED": 0,
      "EIGHT_HUNDRED": 0,
      "THOUSAND": 0
    }
  }
}
```

## Spring Boot Implementation

### Enhanced Controller Method
```java
@GetMapping("/sales")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<SalesResponse> getSales(
    @RequestParam(required = false) String startDate,
    @RequestParam(required = false) String endDate,
    @RequestParam(required = false) String category,
    @RequestParam(required = false) String period) {
    
    try {
        log.info("Received filters - startDate: {}, endDate: {}, category: {}, period: {}", 
            startDate, endDate, category, period);
        
        SalesResponse response = salesService.getSalesWithStatistics(startDate, endDate, category, period);
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        log.error("Error retrieving sales data", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
```

### Response DTOs
```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SalesResponse {
    private List<SaleDTO> sales;
    private SalesStatistics statistics;
}

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SalesStatistics {
    private int total;
    private int daily;
    private int monthly;
    private RevenueStatistics revenue;
    private Map<String, Integer> byCategory;
}

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RevenueStatistics {
    private BigDecimal total;
    private BigDecimal daily;
    private BigDecimal monthly;
}
```

### Enhanced Service Implementation
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class SalesService {
    
    private final SaleLogRepository saleLogRepository;
    
    public SalesResponse getSalesWithStatistics(String startDate, String endDate, String category, String period) {
        try {
            // Get filtered sales
            List<SaleLog> saleLogs = getFilteredSales(startDate, endDate, category);
            
            // Convert to DTOs
            List<SaleDTO> sales = saleLogs.stream()
                .map(SaleDTO::fromSaleLog)
                .collect(Collectors.toList());
            
            // Calculate statistics
            SalesStatistics statistics = calculateStatistics(saleLogs, period);
            
            return new SalesResponse(sales, statistics);
            
        } catch (Exception e) {
            log.error("Error retrieving sales with statistics", e);
            throw new RuntimeException("Failed to retrieve sales data", e);
        }
    }
    
    private List<SaleLog> getFilteredSales(String startDate, String endDate, String category) {
        // Build dynamic query based on filters
        Specification<SaleLog> spec = Specification.where(null);
        
        if (startDate != null && !startDate.isEmpty()) {
            LocalDate start = LocalDate.parse(startDate);
            spec = spec.and((root, query, cb) -> 
                cb.greaterThanOrEqualTo(root.get("timestamp"), start.atStartOfDay()));
        }
        
        if (endDate != null && !endDate.isEmpty()) {
            LocalDate end = LocalDate.parse(endDate);
            spec = spec.and((root, query, cb) -> 
                cb.lessThanOrEqualTo(root.get("timestamp"), end.atTime(23, 59, 59)));
        }
        
        if (category != null && !category.isEmpty()) {
            CodeCategory codeCategory = CodeCategory.valueOf(category);
            spec = spec.and((root, query, cb) -> 
                cb.equal(root.get("category"), codeCategory));
        }
        
        return saleLogRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "timestamp"));
    }
    
    private SalesStatistics calculateStatistics(List<SaleLog> saleLogs, String period) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).toLocalDate().atStartOfDay();
        
        // Filter by period if specified
        List<SaleLog> periodFilteredLogs = saleLogs;
        if ("daily".equals(period)) {
            periodFilteredLogs = saleLogs.stream()
                .filter(sale -> sale.getTimestamp().isAfter(startOfDay))
                .collect(Collectors.toList());
        } else if ("monthly".equals(period)) {
            periodFilteredLogs = saleLogs.stream()
                .filter(sale -> sale.getTimestamp().isAfter(startOfMonth))
                .collect(Collectors.toList());
        }
        
        // Calculate daily and monthly counts
        long dailyCount = saleLogs.stream()
            .filter(sale -> sale.getTimestamp().isAfter(startOfDay))
            .count();
            
        long monthlyCount = saleLogs.stream()
            .filter(sale -> sale.getTimestamp().isAfter(startOfMonth))
            .count();
        
        // Calculate revenue (assuming you have amount field)
        BigDecimal totalRevenue = saleLogs.stream()
            .map(sale -> sale.getAmount() != null ? sale.getAmount() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        BigDecimal dailyRevenue = saleLogs.stream()
            .filter(sale -> sale.getTimestamp().isAfter(startOfDay))
            .map(sale -> sale.getAmount() != null ? sale.getAmount() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        BigDecimal monthlyRevenue = saleLogs.stream()
            .filter(sale -> sale.getTimestamp().isAfter(startOfMonth))
            .map(sale -> sale.getAmount() != null ? sale.getAmount() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calculate by category
        Map<String, Integer> byCategory = new HashMap<>();
        for (CodeCategory cat : CodeCategory.values()) {
            long count = periodFilteredLogs.stream()
                .filter(sale -> sale.getCategory() == cat)
                .count();
            byCategory.put(cat.name(), (int) count);
        }
        
        return new SalesStatistics(
            (int) periodFilteredLogs.size(),
            (int) dailyCount,
            (int) monthlyCount,
            new RevenueStatistics(totalRevenue, dailyRevenue, monthlyRevenue),
            byCategory
        );
    }
}
```

### Updated Entity (if needed)
```java
@Entity
@AllArgsConstructor
@Data
@NoArgsConstructor
public class SaleLog {
    @Id @GeneratedValue
    private Long id;

    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    private CodeCategory category;

    private LocalDateTime timestamp;

    @OneToOne
    private ProxyCode code;
    
    // Add amount field for revenue calculation
    private BigDecimal amount;
}
```

### Repository Interface
```java
public interface SaleLogRepository extends JpaRepository<SaleLog, Long>, JpaSpecificationExecutor<SaleLog> {
    // Existing methods...
    
    // Optional: Add these convenience methods for better performance
    @Query("SELECT COUNT(s) FROM SaleLog s WHERE s.timestamp >= :startDate")
    long countByTimestampAfter(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT s.category, COUNT(s) FROM SaleLog s WHERE s.timestamp >= :startDate GROUP BY s.category")
    List<Object[]> countByCategoryAndTimestampAfter(@Param("startDate") LocalDateTime startDate);
}
```

## Frontend Integration

The frontend will automatically use the enhanced API response:

```typescript
// The existing API call will work with the new response format
const response = await apiClient.getSales(filters);
// response.sales - array of sales
// response.statistics - statistics object
```

## Usage Examples

### cURL Examples

**Get all sales with statistics:**
```bash
curl -X GET \
  http://localhost:8080/admin/sales \
  -H "Authorization: Bearer your_jwt_token_here"
```

**Get daily sales:**
```bash
curl -X GET \
  "http://localhost:8080/admin/sales?period=daily" \
  -H "Authorization: Bearer your_jwt_token_here"
```

**Get monthly sales for specific category:**
```bash
curl -X GET \
  "http://localhost:8080/admin/sales?period=monthly&category=FIFTY" \
  -H "Authorization: Bearer your_jwt_token_here"
```

## Key Features

1. **Period-based Statistics**: Daily, monthly, and total sales counts
2. **Revenue Tracking**: Calculate revenue for each period
3. **Category Breakdown**: Sales count by category
4. **Flexible Filtering**: Combine period, date range, and category filters
5. **Performance Optimized**: Efficient database queries with proper indexing

## Database Considerations

```sql
-- Add amount column if not exists
ALTER TABLE sale_log ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sale_log_timestamp ON sale_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_sale_log_category ON sale_log(category);
CREATE INDEX IF NOT EXISTS idx_sale_log_amount ON sale_log(amount);
```

## Testing

```java
@Test
void testGetSalesWithStatistics_Daily() {
    // Given
    String period = "daily";
    
    // When
    SalesResponse response = salesService.getSalesWithStatistics(null, null, null, period);
    
    // Then
    assertNotNull(response);
    assertNotNull(response.getStatistics());
    assertEquals(period, response.getStatistics().getDaily());
}
```

**This enhanced API will provide all the statistics needed for the dashboard tabs!** 🎉 