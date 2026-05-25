# DOC 7.2-A: Error Handling Specification

## 1. Error Handling Overview

### Philosophy
- **Fail fast, fail loud:** Lỗi được phát hiện sớm nhất có thể và thông báo rõ ràng
- **User-friendly:** Người dùng thấy message dễ hiểu, không technical jargon
- **Secure:** Không expose stack traces, internal details cho client
- **Traceable:** Mỗi lỗi có code + context để debug

### Error Categories
| Category | Description | HTTP Status |
|---|---|---|
| Validation | Input không hợp lệ | 400 |
| Authentication | Chưa đăng nhập | 401 |
| Authorization | Không có quyền | 403 |
| Not Found | Resource không tồn tại | 404 |
| Conflict | Xung đột dữ liệu | 409 |
| Rate Limit | Quá số request | 429 |
| Business Rule | Logic nghiệp vụ | 400/409 |
| System | Lỗi server internal | 500 |

---

## 2. Exception Class Hierarchy

```
Error
└── AppError (base exception)
    ├── ValidationError        → 400 BAD_REQUEST
    │   ├── InvalidEmailError
    │   ├── InvalidFileTypeError
    │   └── MissingFieldError
    ├── AuthError              → 401 UNAUTHORIZED
    │   ├── InvalidCredentialsError
    │   └── TokenExpiredError
    ├── ForbiddenError         → 403 FORBIDDEN
    ├── NotFoundError          → 404 NOT_FOUND
    │   ├── UserNotFoundError
    │   ├── JobNotFoundError
    │   └── OfferNotFoundError
    ├── ConflictError          → 409 CONFLICT
    │   ├── EmailAlreadyExistsError
    │   ├── InterviewConflictError
    │   └── DuplicateApplicationError
    └── BusinessRuleError      → 400/409
        ├── InvalidStatusTransitionError
        ├── OfferNotEligibleError
        └── InvalidTokenError
```

### AppError Class Structure (Implemented)
```
class AppError extends Error {
    statusCode: number     // HTTP status code
    isOperational: boolean  // true = expected error, false = bug
    constructor(message, statusCode, isOperational = true)
}
```

---

## 3. Error Code Catalog

| Code | HTTP | User Message | Developer Message | Suggested Action | Exception Class |
|---|---|---|---|---|---|
| **VALIDATION_ERROR** | 400 | Dữ liệu nhập không hợp lệ. Vui lòng kiểm tra lại. | Validation failed: {field} {reason} | Kiểm tra lại các trường nhập liệu | ValidationError |
| **INVALID_CREDENTIALS** | 401 | Email hoặc mật khẩu không đúng. | Login failed for email: {email} | Thử lại hoặc nhấn "Quên mật khẩu" | InvalidCredentialsError |
| **UNAUTHORIZED** | 401 | Vui lòng đăng nhập để tiếp tục. | Missing or invalid token | Đăng nhập lại | AuthError |
| **FORBIDDEN** | 403 | Bạn không có quyền thực hiện thao tác này. | User {userId} role {role} not allowed for {action} | Liên hệ admin để được cấp quyền | ForbiddenError |
| **NOT_FOUND** | 404 | Không tìm thấy dữ liệu yêu cầu. | Resource {type}:{id} not found | Kiểm tra lại ID hoặc liên hệ hỗ trợ | NotFoundError |
| **EMAIL_ALREADY_EXISTS** | 409 | Email đã được đăng ký. Vui lòng sử dụng email khác. | Duplicate email: {email} | Sử dụng email khác hoặc đăng nhập | EmailAlreadyExistsError |
| **INTERVIEW_CONFLICT** | 409 | Người phỏng vấn đã có lịch vào khung giờ này. | Interviewer {id} has {count} conflicting schedule(s) | Chọn thời gian khác | InterviewConflictError |
| **DUPLICATE_APPLICATION** | 409 | Bạn đã nộp hồ sơ cho vị trí này rồi. | Duplicate application: candidate {id} + job {id} | Kiểm tra trạng thái hồ sơ cũ | DuplicateApplicationError |
| **INVALID_STATUS_TRANSITION** | 400 | Không thể chuyển trạng thái từ {current} sang {requested}. | Invalid status transition: {current} → {new} | Kiểm tra state machine hợp lệ | InvalidStatusTransitionError |
| **OFFER_NOT_ELIGIBLE** | 400 | Ứng viên chưa đạt phỏng vấn. Không thể tạo Offer. | Application {appId} status is {status}, expected InterviewPassed | Đợi kết quả phỏng vấn | OfferNotEligibleError |
| **INVALID_TOKEN** | 400 | Link phản hồi không hợp lệ hoặc đã hết hạn. | Offer token {token} invalid or expired | Kiểm tra lại email hoặc liên hệ Recruiter | InvalidTokenError |
| **FILE_TYPE_INVALID** | 400 | File không hợp lệ. Chỉ chấp nhận PDF, DOC, DOCX dưới 5MB. | File type {mime} rejected | Upload file đúng định dạng | InvalidFileTypeError |
| **FILE_TOO_LARGE** | 400 | File quá lớn. Upload file dưới 5MB. | File size {size} exceeds 5MB limit | Nén file trước khi upload | InvalidFileTypeError |
| **INTERNAL_ERROR** | 500 | Hệ thống đang gặp sự cố. Vui lòng thử lại sau. | {full error with stack trace in dev} | Thử lại hoặc liên hệ admin | SystemError |
| **RATE_LIMITED** | 429 | Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút. | IP {ip} rate limited | Đợi 15 phút rồi thử lại | RateLimitError |

---

## 4. Error Response Format

### Standard Error Response (Implemented)
```json
{
  "success": false,
  "message": "Email hoặc mật khẩu không đúng."
}
```

### Extended Format (Future Enhancement)
```json
{
  "success": false,
  "message": "Dữ liệu nhập không hợp lệ.",
  "errors": [
    { "field": "email", "message": "Email không đúng định dạng" },
    { "field": "password", "message": "Mật khẩu phải có ít nhất 6 ký tự" }
  ]
}
```

### Error Response Examples by Category

**Validation Error (400):**
```json
{
  "success": false,
  "message": "File không hợp lệ. Chỉ chấp nhận PDF, DOC, DOCX dưới 5MB."
}
```

**Authentication Error (401):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Authorization Error (403):**
```json
{
  "success": false,
  "message": "Forbidden"
}
```

**Not Found (404):**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**Conflict (409):**
```json
{
  "success": false,
  "message": "Conflict: Interviewer already has an interview at this time"
}
```

---

## 5. Layer-Specific Handling

### Presentation Layer (Controllers)
```
Vào: Request từ client
Xu:  Response JSON

Controller {
    try {
        // Gọi service
        const result = await service.method(data)
        sendSuccess(res, result)
    } catch (error) {
        // Bắt tất cả lỗi, chuyển cho global handler
        next(error)
    }
}
```

### Business Logic Layer (Services)
```
Service {
    method(data) {
        // Validate business rules
        if (!isValid) {
            throw new AppError("message", HTTP_STATUS.BAD_REQUEST)
        }
        
        // Gọi repository
        const result = await repository.method(data)
        
        if (!result) {
            throw new AppError("Resource not found", HTTP_STATUS.NOT_FOUND)
        }
        
        return result
    }
}
```

### Data Access Layer (Repositories)
```
Repository {
    method(data) {
        try {
            return await prisma.model.method(data)
        } catch (error) {
            // Prisma errors tự động propagate
            throw error
        }
    }
}
```

### Global Error Handler (Implemented)
```
Global Error Handler {
    catch(error, req, res, next) {
        IF error instanceof AppError THEN
            // Operational error - trả message gốc
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            })
        
        IF error instanceof MulterError THEN
            // File upload error
            return res.status(400).json({
                success: false,
                message: "File upload error: " + error.message
            })
        
        // Unexpected error - log + return generic message
        console.error("[Error]:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
            // Chỉ dev mới có stack trace
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        })
    }
}
```

---

## 6. Logging Strategy

| Error Type | Log Level | Context to Log | Sensitive Data to Exclude |
|---|---|---|---|
| Validation Error | INFO | Field, value, reason | None |
| Auth Error (login fail) | WARN | Email, IP, timestamp | Password |
| Auth Error (invalid token) | INFO | Token prefix (first 10 chars) | Full token |
| Forbidden | WARN | UserId, role, attempted action | None |
| Not Found | INFO | Resource type, ID | None |
| Conflict (duplicate) | INFO | Duplicate fields | None |
| Business Rule Violation | WARN | Business context, current state | None |
| System Error (unexpected) | ERROR | Full stack trace, request context | Password, token, secrets |
| Rate Limited | WARN | IP, request count | None |

---

## 7. Retry and Error Recovery

| Error Type | Retry? | Strategy | When to Give Up |
|---|---|---|---|
| Validation Error | ❌ Không | N/A | N/A |
| Auth Error | ❌ Không | N/A | N/A |
| Not Found | ❌ Không | N/A | N/A |
| Conflict | ❌ Không | N/A | N/A |
| Business Rule | ❌ Không | N/A | N/A |
| Database Error (connection) | ✅ Có | Retry 3 lần, backoff 1s-2s-4s | Sau 3 lần → 500 |
| Email Service Error | ✅ Có | Retry 3 lần trong 30 phút | Sau 3 lần → log + bỏ qua |
| File Upload Error | ❌ Không | Trả lỗi ngay | Yêu cầu client upload lại |

---

## 8. Error Handling Patterns

### Try-Catch Guidelines
```
// ✅ ĐÚNG: Catch và xử lý cụ thể
try {
    await service.method()
} catch (error) {
    next(error)  // Chuyển cho global handler
}

// ❌ SAI: Catch và nuốt lỗi
try {
    await service.method()
} catch (error) {
    // Không làm gì - silent failure!
}

// ❌ SAI: Log rồi nuốt lỗi
try {
    await service.method()
} catch (error) {
    console.log(error)  // Log xong không throw lại
}
```

### Exception Chaining
```
Repository: throw PrismaError
    ↓
Service: catch → wrap with business context → throw AppError
    ↓
Controller: catch → next(error)
    ↓
Global Handler: format → return JSON response
```

### Fail-Fast Principle
- Validation được thực hiện **đầu tiên** trong mỗi method
- Không xử lý business logic nếu input không hợp lệ
- Database operations chỉ được thực hiện sau khi mọi validation passed
