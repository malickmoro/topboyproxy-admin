# Backend Aggregated Sales Endpoint Implementation

Based on your existing sales endpoint, here's how to add the aggregated chart functionality:

## 1. Add New Endpoint

Add this new endpoint to your controller:

```java
@GetMapping("/sales/aggregated")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<AggregatedSalesResponse> getAggregatedSales(
        @RequestParam(required = false) String startDate,
        @RequestParam(required = false) String endDate,
        @RequestParam(required = false) String category,
        @RequestParam String period
) {
    try {
        log.info("Received aggregated sales request - period: {}, startDate: {}, endDate: {}, category: {}",
                period, startDate, endDate, category);

        // Validate period parameter
        if (!Arrays.asList("daily", "weekly", "monthly").contains(period)) {
            return ResponseEntity.badRequest()
                    .body(new AggregatedSalesResponse("Invalid period parameter. Must be 'daily', 'weekly', or 'monthly'"));
        }

        AggregatedSalesResponse response = salesService.getAggregatedSales(startDate, endDate, category, period);
        return ResponseEntity.ok(response);

    } catch (Exception e) {
        log.error("Error retrieving aggregated sales data", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
```

## 2. Create Response DTOs

Add these new DTOs to your project:

```java
// AggregatedSalesResponse.java
public class AggregatedSalesResponse {
    private List<AggregatedSalesData> data;
    private String error;

    public AggregatedSalesResponse(List<AggregatedSalesData> data) {
        this.data = data;
    }

    public AggregatedSalesResponse(String error) {
        this.error = error;
    }

    // Getters and setters
    public List<AggregatedSalesData> getData() { return data; }
    public void setData(List<AggregatedSalesData> data) { this.data = data; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}

// AggregatedSalesData.java
public class AggregatedSalesData {
    private String label;
    private int sales;
    private double revenue;

    public AggregatedSalesData(String label, int sales, double revenue) {
        this.label = label;
        this.sales = sales;
        this.revenue = revenue;
    }

    // Getters and setters
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public int getSales() { return sales; }
    public void setSales(int sales) { this.sales = sales; }
    public double getRevenue() { return revenue; }
    public void setRevenue(double revenue) { this.revenue = revenue; }
}
```

## 3. Add Service Method

Add this method to your `SalesService`:

```java
public AggregatedSalesResponse getAggregatedSales(String startDate, String endDate, String category, String period) {
    try {
        List<SaleLog> saleLogs = getFilteredSales(startDate, endDate, category);
        List<AggregatedSalesData> aggregatedData = new ArrayList<>();

        switch (period) {
            case "daily":
                aggregatedData = aggregateByDay(saleLogs);
                break;
            case "weekly":
                aggregatedData = aggregateByWeek(saleLogs);
                break;
            case "monthly":
                aggregatedData = aggregateByMonth(saleLogs);
                break;
        }

        return new AggregatedSalesResponse(aggregatedData);
    } catch (Exception e) {
        log.error("Error generating aggregated sales data", e);
        throw new RuntimeException("Failed to generate aggregated sales data", e);
    }
}

private List<AggregatedSalesData> aggregateByDay(List<SaleLog> saleLogs) {
    Map<String, AggregatedSalesData> dayMap = new LinkedHashMap<>();
    
    // Initialize all days of the week
    String[] days = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
    for (String day : days) {
        dayMap.put(day, new AggregatedSalesData(day, 0, 0.0));
    }

    // Aggregate sales by day of week
    for (SaleLog sale : saleLogs) {
        LocalDate saleDate = sale.getDate().toLocalDate();
        String dayOfWeek = saleDate.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        
        AggregatedSalesData existing = dayMap.get(dayOfWeek);
        existing.setSales(existing.getSales() + 1);
        existing.setRevenue(existing.getRevenue() + sale.getAmount());
    }

    return new ArrayList<>(dayMap.values());
}

private List<AggregatedSalesData> aggregateByWeek(List<SaleLog> saleLogs) {
    Map<Integer, AggregatedSalesData> weekMap = new TreeMap<>();

    for (SaleLog sale : saleLogs) {
        LocalDate saleDate = sale.getDate().toLocalDate();
        int weekOfMonth = (saleDate.getDayOfMonth() - 1) / 7 + 1;
        
        weekMap.computeIfAbsent(weekOfMonth, week -> 
            new AggregatedSalesData("Week " + week, 0, 0.0));
        
        AggregatedSalesData existing = weekMap.get(weekOfMonth);
        existing.setSales(existing.getSales() + 1);
        existing.setRevenue(existing.getRevenue() + sale.getAmount());
    }

    return new ArrayList<>(weekMap.values());
}

private List<AggregatedSalesData> aggregateByMonth(List<SaleLog> saleLogs) {
    Map<String, AggregatedSalesData> monthMap = new LinkedHashMap<>();
    
    // Initialize all months
    String[] months = {"January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"};
    for (String month : months) {
        monthMap.put(month, new AggregatedSalesData(month, 0, 0.0));
    }

    // Aggregate sales by month
    for (SaleLog sale : saleLogs) {
        LocalDate saleDate = sale.getDate().toLocalDate();
        String month = saleDate.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        
        AggregatedSalesData existing = monthMap.get(month);
        existing.setSales(existing.getSales() + 1);
        existing.setRevenue(existing.getRevenue() + sale.getAmount());
    }

    return new ArrayList<>(monthMap.values());
}
```

## 4. Required Imports

Add these imports to your service class:

```java
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;
```

## 5. Alternative: If Amount Can Be Null

If your `SaleLog` entity has `amount` as an `Integer` (object type) that can be null, use this version instead:

```java
private List<AggregatedSalesData> aggregateByDay(List<SaleLog> saleLogs) {
    Map<String, AggregatedSalesData> dayMap = new LinkedHashMap<>();
    
    // Initialize all days of the week
    String[] days = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
    for (String day : days) {
        dayMap.put(day, new AggregatedSalesData(day, 0, 0.0));
    }

    // Aggregate sales by day of week
    for (SaleLog sale : saleLogs) {
        LocalDate saleDate = sale.getDate().toLocalDate();
        String dayOfWeek = saleDate.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        
        AggregatedSalesData existing = dayMap.get(dayOfWeek);
        existing.setSales(existing.getSales() + 1);
        existing.setRevenue(existing.getRevenue() + (sale.getAmount() != null ? sale.getAmount() : 0));
    }

    return new ArrayList<>(dayMap.values());
}

private List<AggregatedSalesData> aggregateByWeek(List<SaleLog> saleLogs) {
    Map<Integer, AggregatedSalesData> weekMap = new TreeMap<>();

    for (SaleLog sale : saleLogs) {
        LocalDate saleDate = sale.getDate().toLocalDate();
        int weekOfMonth = (saleDate.getDayOfMonth() - 1) / 7 + 1;
        
        weekMap.computeIfAbsent(weekOfMonth, week -> 
            new AggregatedSalesData("Week " + week, 0, 0.0));
        
        AggregatedSalesData existing = weekMap.get(weekOfMonth);
        existing.setSales(existing.getSales() + 1);
        existing.setRevenue(existing.getRevenue() + (sale.getAmount() != null ? sale.getAmount() : 0));
    }

    return new ArrayList<>(weekMap.values());
}

private List<AggregatedSalesData> aggregateByMonth(List<SaleLog> saleLogs) {
    Map<String, AggregatedSalesData> monthMap = new LinkedHashMap<>();
    
    // Initialize all months
    String[] months = {"January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"};
    for (String month : months) {
        monthMap.put(month, new AggregatedSalesData(month, 0, 0.0));
    }

    // Aggregate sales by month
    for (SaleLog sale : saleLogs) {
        LocalDate saleDate = sale.getDate().toLocalDate();
        String month = saleDate.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        
        AggregatedSalesData existing = monthMap.get(month);
        existing.setSales(existing.getSales() + 1);
        existing.setRevenue(existing.getRevenue() + (sale.getAmount() != null ? sale.getAmount() : 0));
    }

    return new ArrayList<>(monthMap.values());
}
```

## 6. Database Query Optimization (Optional)

If you want to optimize the database queries, you can add these methods to your repository:

```java
// For daily aggregation
@Query("SELECT DAYOFWEEK(s.date) as dayOfWeek, COUNT(s) as sales, SUM(s.amount) as revenue " +
       "FROM SaleLog s " +
       "WHERE (:startDate IS NULL OR s.date >= :startDate) " +
       "AND (:endDate IS NULL OR s.date <= :endDate) " +
       "AND (:category IS NULL OR s.category = :category) " +
       "GROUP BY DAYOFWEEK(s.date) " +
       "ORDER BY dayOfWeek")
List<Object[]> getDailyAggregatedSales(@Param("startDate") LocalDateTime startDate,
                                      @Param("endDate") LocalDateTime endDate,
                                      @Param("category") String category);

// Similar queries for weekly and monthly aggregation
```

## 7. Complete Implementation Example

Here's how your complete service method would look:

```java
@Service
public class SalesService {
    
    // Your existing methods...
    
    public AggregatedSalesResponse getAggregatedSales(String startDate, String endDate, String category, String period) {
        try {
            // Parse dates if provided
            LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate + "T00:00:00") : null;
            LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate + "T23:59:59") : null;
            
            // Get filtered sales
            List<SaleLog> saleLogs = getFilteredSales(startDate, endDate, category);
            
            List<AggregatedSalesData> aggregatedData;
            
            switch (period) {
                case "daily":
                    aggregatedData = aggregateByDay(saleLogs);
                    break;
                case "weekly":
                    aggregatedData = aggregateByWeek(saleLogs);
                    break;
                case "monthly":
                    aggregatedData = aggregateByMonth(saleLogs);
                    break;
                default:
                    throw new IllegalArgumentException("Invalid period: " + period);
            }
            
            return new AggregatedSalesResponse(aggregatedData);
            
        } catch (Exception e) {
            log.error("Error generating aggregated sales data", e);
            throw new RuntimeException("Failed to generate aggregated sales data", e);
        }
    }
    
    // Helper methods as shown above...
}
```

## 8. Testing

Test your endpoint with these URLs:

```
GET /admin/sales/aggregated?period=daily
GET /admin/sales/aggregated?period=weekly&startDate=2024-01-01&endDate=2024-01-31
GET /admin/sales/aggregated?period=monthly&category=FIFTY
```

## 9. Expected Response Format

The endpoint should return:

```json
{
  "data": [
    {
      "label": "Sunday",
      "sales": 12,
      "revenue": 1200.0
    },
    {
      "label": "Monday",
      "sales": 18,
      "revenue": 1800.0
    }
  ]
}
```

This implementation will work seamlessly with your existing frontend chart component! 