# Sales Chart API Specification

This document outlines the backend API endpoints and JSON structure required to support the sales chart functionality with daily, weekly, and monthly views.

## Overview

The frontend now includes a sales chart component that displays aggregated sales data in three different time periods:
- **Daily**: Sunday to Saturday (7 data points)
- **Weekly**: Week 1, Week 2, etc. (4 data points for current month)
- **Monthly**: January to December (12 data points)

## Required Backend Endpoints

### 1. Aggregated Sales Endpoint

**Endpoint:** `GET /admin/sales/aggregated`

**Query Parameters:**
- `period` (required): `daily` | `weekly` | `monthly`
- `startDate` (optional): ISO date string (YYYY-MM-DD)
- `endDate` (optional): ISO date string (YYYY-MM-DD)
- `category` (optional): Category filter (FIFTY, HUNDRED, etc.)

**Example Request:**
```
GET /admin/sales/aggregated?period=daily&startDate=2024-01-01&endDate=2024-01-31&category=FIFTY
```

**Expected JSON Response:**
```json
{
  "data": [
    {
      "label": "Sunday",
      "sales": 12,
      "revenue": 1200
    },
    {
      "label": "Monday", 
      "sales": 18,
      "revenue": 1800
    },
    {
      "label": "Tuesday",
      "sales": 15,
      "revenue": 1500
    },
    {
      "label": "Wednesday",
      "sales": 22,
      "revenue": 2200
    },
    {
      "label": "Thursday",
      "sales": 19,
      "revenue": 1900
    },
    {
      "label": "Friday",
      "sales": 25,
      "revenue": 2500
    },
    {
      "label": "Saturday",
      "sales": 30,
      "revenue": 3000
    }
  ]
}
```

## Data Structure Requirements

### For Daily Period (`period=daily`)
- **Labels**: Day names (Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday)
- **Data Points**: 7 entries (one for each day of the week)
- **Time Range**: Current week or specified date range
- **Aggregation**: Group sales by day of week

### For Weekly Period (`period=weekly`)
- **Labels**: "Week 1", "Week 2", "Week 3", "Week 4" (for current month)
- **Data Points**: 4-5 entries (depending on weeks in the month)
- **Time Range**: Current month or specified date range
- **Aggregation**: Group sales by week number within the month

### For Monthly Period (`period=monthly`)
- **Labels**: Month names (January, February, March, etc.)
- **Data Points**: 12 entries (one for each month)
- **Time Range**: Current year or specified date range
- **Aggregation**: Group sales by month

## Field Descriptions

### Response Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | Array | Array of aggregated sales data points |
| `data[].label` | String | Display label for the time period |
| `data[].sales` | Number | Count of sales for the period |
| `data[].revenue` | Number | Total revenue (in Ghana Cedis) for the period |

## Backend Implementation Guidelines

### 1. Database Query Examples

**Daily Aggregation (PostgreSQL):**
```sql
SELECT 
  TO_CHAR(date, 'Day') as label,
  COUNT(*) as sales,
  SUM(amount) as revenue
FROM sales 
WHERE date >= $1 AND date <= $2
GROUP BY TO_CHAR(date, 'Day')
ORDER BY MIN(date);
```

**Weekly Aggregation (PostgreSQL):**
```sql
SELECT 
  'Week ' || EXTRACT(WEEK FROM date) as label,
  COUNT(*) as sales,
  SUM(amount) as revenue
FROM sales 
WHERE date >= $1 AND date <= $2
GROUP BY EXTRACT(WEEK FROM date)
ORDER BY MIN(date);
```

**Monthly Aggregation (PostgreSQL):**
```sql
SELECT 
  TO_CHAR(date, 'Month') as label,
  COUNT(*) as sales,
  SUM(amount) as revenue
FROM sales 
WHERE date >= $1 AND date <= $2
GROUP BY TO_CHAR(date, 'Month')
ORDER BY MIN(date);
```

### 2. Date Range Handling

- If no `startDate` and `endDate` are provided:
  - **Daily**: Use current week (Sunday to Saturday)
  - **Weekly**: Use current month
  - **Monthly**: Use current year

- If date range is provided, aggregate data within that range

### 3. Category Filtering

- If `category` parameter is provided, filter sales by category before aggregation
- If no category is specified, include all categories

### 4. Empty Data Handling

- Return empty data points with 0 values for periods with no sales
- Ensure all expected data points are returned (7 for daily, 4-5 for weekly, 12 for monthly)

## Error Handling

**HTTP Status Codes:**
- `200`: Success
- `400`: Invalid parameters (invalid period, date format, etc.)
- `401`: Unauthorized (missing or invalid JWT token)
- `500`: Server error

**Error Response Format:**
```json
{
  "error": "Invalid period parameter. Must be 'daily', 'weekly', or 'monthly'",
  "status": 400
}
```

## Authentication

- Endpoint requires JWT authentication
- Include `Authorization: Bearer <token>` header
- Return 401 for invalid/missing tokens

## Example Implementation (Node.js/Express)

```javascript
app.get('/admin/sales/aggregated', authenticateToken, async (req, res) => {
  try {
    const { period, startDate, endDate, category } = req.query;
    
    // Validate period parameter
    if (!['daily', 'weekly', 'monthly'].includes(period)) {
      return res.status(400).json({
        error: 'Invalid period parameter. Must be "daily", "weekly", or "monthly"'
      });
    }
    
    // Build query based on period
    let query = '';
    let params = [];
    
    if (period === 'daily') {
      query = `
        SELECT 
          TO_CHAR(date, 'Day') as label,
          COUNT(*) as sales,
          COALESCE(SUM(amount), 0) as revenue
        FROM sales 
        WHERE 1=1
        ${startDate ? 'AND date >= $1' : ''}
        ${endDate ? `AND date <= $${startDate ? '2' : '1'}` : ''}
        ${category ? `AND category = $${startDate && endDate ? '3' : startDate || endDate ? '2' : '1'}` : ''}
        GROUP BY TO_CHAR(date, 'Day')
        ORDER BY MIN(date)
      `;
    }
    // Add similar logic for weekly and monthly
    
    const result = await db.query(query, params);
    
    res.json({
      data: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching aggregated sales:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});
```

## Testing

Test the endpoint with various scenarios:
1. No filters (current period)
2. Date range filters
3. Category filters
4. Combined filters
5. Invalid parameters
6. Authentication errors

## Frontend Integration

The frontend will automatically call this endpoint when:
- The chart period changes (daily/weekly/monthly toggle)
- Date filters are applied
- Category filters are applied
- The component mounts

The chart will display the aggregated data with sales count on the left Y-axis and revenue on the right Y-axis. 