# Delete Code API Documentation

## Endpoint: DELETE /admin/codes/{codeId}

### Description
Deletes a specific proxy code from the system. This endpoint allows administrators to remove incorrect or invalid proxy codes.

### URL Parameters
- `codeId` (path parameter, required): The unique identifier of the code to delete

### Request Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Request Body
No request body required.

### Response

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Code deleted successfully"
}
```

#### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "message": "Code not found",
  "error": "Code with ID {codeId} does not exist"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "Invalid or missing authentication token"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Forbidden",
  "error": "Insufficient permissions to delete codes"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Failed to delete code due to database error"
}
```

## Spring Boot Implementation

### Controller Method
```java
@DeleteMapping("/codes/{codeId}")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> deleteCode(@PathVariable Long codeId) {
    try {
        // Check if code exists
        Optional<ProxyCode> code = proxyCodeRepository.findById(codeId);
        if (code.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse(false, null, "Code not found", 
                    "Code with ID " + codeId + " does not exist"));
        }

        // Delete the code
        proxyCodeRepository.deleteById(codeId);
        
        return ResponseEntity.ok(new ApiResponse(true, null, "Code deleted successfully", null));
        
    } catch (Exception e) {
        log.error("Error deleting code with ID: " + codeId, e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ApiResponse(false, null, "Internal server error", 
                "Failed to delete code due to database error"));
    }
}
```

### Required Dependencies

#### Entity Class (if not already exists)
```java
@Entity
@Data
@Table(name = "proxy_codes")
public class ProxyCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String code;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CodeCategory category;
    
    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;
    
    @Column(name = "used_at")
    private LocalDateTime usedAt;
    
    @Column(nullable = false)
    private boolean used = false;
}
```

#### Repository Interface
```java
@Repository
public interface ProxyCodeRepository extends JpaRepository<ProxyCode, Long> {
    // Existing methods...
}
```

#### Response DTO (if not already exists)
```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse {
    private boolean success;
    private Object data;
    private String message;
    private String error;
}
```

### Security Configuration
Ensure your Spring Security configuration includes the delete endpoint:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/admin/codes/**").hasRole("ADMIN")
                // ... other configurations
            )
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
        
        return http.build();
    }
}
```

### Database Considerations

1. **Foreign Key Constraints**: If the code is referenced by other tables (e.g., sales records), consider:
   - Using `CASCADE DELETE` if you want to delete related records
   - Using `SET NULL` if you want to keep sales records but remove the code reference
   - Preventing deletion if there are active references

2. **Audit Trail**: Consider adding audit logging:
```java
@DeleteMapping("/codes/{codeId}")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> deleteCode(@PathVariable Long codeId, Authentication authentication) {
    // ... delete logic ...
    
    // Log the deletion
    log.info("Code {} deleted by user: {}", codeId, authentication.getName());
    
    return ResponseEntity.ok(new ApiResponse(true, null, "Code deleted successfully", null));
}
```

### Testing

#### Unit Test Example
```java
@Test
@WithMockUser(roles = "ADMIN")
void testDeleteCode_Success() {
    // Given
    Long codeId = 1L;
    ProxyCode code = new ProxyCode();
    code.setId(codeId);
    code.setCode("12345");
    
    when(proxyCodeRepository.findById(codeId)).thenReturn(Optional.of(code));
    
    // When
    ResponseEntity<?> response = adminController.deleteCode(codeId);
    
    // Then
    assertEquals(HttpStatus.OK, response.getStatusCode());
    verify(proxyCodeRepository).deleteById(codeId);
}
```

#### Integration Test Example
```java
@Test
@WithMockUser(roles = "ADMIN")
void testDeleteCode_NotFound() {
    // Given
    Long codeId = 999L;
    when(proxyCodeRepository.findById(codeId)).thenReturn(Optional.empty());
    
    // When
    ResponseEntity<?> response = adminController.deleteCode(codeId);
    
    // Then
    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    verify(proxyCodeRepository, never()).deleteById(any());
}
```

## Frontend Integration

The frontend is already configured to call this endpoint:

```typescript
// In src/lib/api.ts
async deleteCode(codeId: number): Promise<{ success: boolean; message: string }> {
  const response = await this.client.delete(`/admin/codes/${codeId}`);
  return response.data;
}
```

## Usage Examples

### cURL Example
```bash
curl -X DELETE \
  http://localhost:8080/admin/codes/123 \
  -H "Authorization: Bearer your_jwt_token_here" \
  -H "Content-Type: application/json"
```

### JavaScript Example
```javascript
const response = await fetch('/admin/codes/123', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
console.log(result);
```

## Error Handling

The frontend handles various error scenarios:

1. **Network Errors**: Displayed as "Failed to delete code: Network error"
2. **404 Errors**: Displayed as "Code not found"
3. **401 Errors**: Automatically redirects to login
4. **500 Errors**: Displayed as "Internal server error"

## Security Notes

1. **Authentication Required**: All delete operations require valid JWT token
2. **Authorization Required**: Only users with ADMIN role can delete codes
3. **Input Validation**: Validate codeId parameter
4. **Audit Logging**: Consider logging all delete operations for security
5. **Rate Limiting**: Consider implementing rate limiting to prevent abuse 