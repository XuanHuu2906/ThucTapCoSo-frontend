# DOC 5.2-A: API Specification Document

## 1. API Overview

- **Base URL:** `/api/v1`
- **Protocol:** HTTPS (production), HTTP (development)
- **Format:** JSON
- **Authentication:** JWT Bearer Token
- **Versioning:** URL-based (`/api/v1/`)

---

## 2. Authentication & Security

| Item | Specification |
|---|---|
| **Mechanism** | JWT (JSON Web Token) via Bearer scheme |
| **Token Header** | `Authorization: Bearer {token}` |
| **Token Payload** | `{ userId, email, role }` |
| **Password Hashing** | bcryptjs |
| **Session** | Stateless (no session store) |
| **CORS** | Whitelist origins per environment (dev: localhost:5173, prod: render.com) |
| **Rate Limiting** | 100 requests per 15 minutes per IP |
| **Security Headers** | Helmet.js (CSP, HSTS, X-Frame-Options, etc.) |

### Required Headers

| Header | Required | Description |
|---|---|---|
| `Content-Type` | Yes | `application/json` (for requests with body) |
| `Authorization` | For protected routes | `Bearer {jwt_token}` |

---

## 3. Endpoint Specifications

### 3.1 Authentication APIs

---

#### POST /api/v1/auth/register

Tạo tài khoản người dùng mới (Admin only).

**Request:**
```json
{
  "fullName": "Nguyen Van A",
  "email": "nguyenvana@example.com",
  "password": "string",
  "role": "Recruiter"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": 1,
    "fullName": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "role": "Recruiter"
  }
}
```

**Response 400:** `{ "success": false, "message": "Validation error" }`
**Response 409:** `{ "success": false, "message": "Email already exists" }`

---

#### POST /api/v1/auth/login

Xác thực người dùng và trả về JWT token.

**Request:**
```json
{
  "email": "recruiter@example.com",
  "password": "string"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "userId": 1,
      "fullName": "Recruiter User",
      "email": "recruiter@example.com",
      "role": "Recruiter"
    }
  }
}
```

**Response 401:** `{ "success": false, "message": "Email or password is incorrect" }`

---

#### GET /api/v1/auth/me

Lấy thông tin người dùng hiện tại.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "message": "User info retrieved successfully",
  "data": {
    "userId": 1,
    "fullName": "Recruiter User",
    "email": "recruiter@example.com",
    "role": "Recruiter"
  }
}
```

**Response 401:** `{ "success": false, "message": "Unauthorized" }`

---

### 3.2 Job APIs

---

#### GET /api/v1/jobs

Lấy danh sách tin tuyển dụng (Public).

**Query Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `search` | string | No | Tìm kiếm theo tiêu đề |
| `deptName` | string | No | Lọc theo phòng ban |
| `status` | string | No | Lọc theo trạng thái (Draft, Open, Closed) |

**Response 200:**
```json
{
  "success": true,
  "message": "Jobs retrieved successfully",
  "data": [
    {
      "jobId": 1,
      "title": "Frontend Developer",
      "deptName": "IT",
      "description": "...",
      "requirements": "...",
      "salaryRange": "15-20M",
      "startDate": "2026-06-01",
      "endDate": "2026-07-01",
      "type": "full-time",
      "experienceLevel": "fresher",
      "location": "Ha Noi",
      "headcount": 2,
      "status": "Open",
      "postedByUser": { "fullName": "Recruiter A" },
      "_count": { "applications": 5 }
    }
  ]
}
```

---

#### GET /api/v1/jobs/:id

Lấy chi tiết tin tuyển dụng (Public).

**Response 200:**
```json
{
  "success": true,
  "message": "Job retrieved successfully",
  "data": {
    "jobId": 1,
    "title": "Frontend Developer",
    "deptName": "IT",
    "description": "...",
    "requirements": "...",
    "salaryRange": "15-20M",
    "startDate": "2026-06-01",
    "endDate": "2026-07-01",
    "type": "full-time",
    "experienceLevel": "fresher",
    "location": "Ha Noi",
    "headcount": 2,
    "status": "Open",
    "postedByUser": { "fullName": "Recruiter A" }
  }
}
```

**Response 404:** `{ "success": false, "message": "Resource not found" }`

---

#### POST /api/v1/jobs

Tạo tin tuyển dụng mới (Recruiter, Admin).

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "title": "Frontend Developer",
  "deptName": "IT",
  "description": "Mo ta cong viec",
  "requirements": "Yeu cau",
  "salaryRange": "15-20M",
  "startDate": "2026-06-01",
  "endDate": "2026-07-01",
  "type": "full-time",
  "experienceLevel": "fresher",
  "location": "Ha Noi",
  "headcount": 2
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Job created successfully",
  "data": { "jobId": 1, "title": "...", "status": "Draft", ... }
}
```

---

#### PUT /api/v1/jobs/:id

Cập nhật tin tuyển dụng (Recruiter, Admin).

**Headers:** `Authorization: Bearer {token}`

**Response 200:** `{ "success": true, "message": "Job updated successfully", "data": {...} }`

---

#### PATCH /api/v1/jobs/:id/status

Cập nhật trạng thái tin tuyển dụng (Recruiter, Admin).

**Request:**
```json
{ "status": "Closed" }
```

**Response 200:** `{ "success": true, "message": "Job status updated successfully", "data": {...} }`

---

#### DELETE /api/v1/jobs/:id

Xóa tin tuyển dụng (Recruiter, Admin).

**Response 200:** `{ "success": true, "message": "Resource deleted successfully", "data": null }`

---

### 3.3 Application APIs

---

#### POST /api/v1/applications

Ứng viên nộp hồ sơ (Public, multipart/form-data).

**Request (multipart/form-data):**

| Field | Type | Required | Description |
|---|---|---|---|
| `jobId` | number | Yes | ID của tin tuyển dụng |
| `fullName` | string | Yes | Họ tên ứng viên |
| `email` | string | Yes | Email ứng viên |
| `phone` | string | No | Số điện thoại |
| `cvFile` | file | Yes | File CV (PDF/DOC/DOCX, <5MB) |

**Response 201:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "appId": 1,
    "jobId": 1,
    "candidateId": 1,
    "status": "New",
    "cvFile": "https://res.cloudinary.com/..."
  }
}
```

**Response 400:** `{ "success": false, "message": "File upload error: ..." }`

---

#### GET /api/v1/applications

Lấy danh sách hồ sơ (Recruiter, Admin).

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `jobId` | number | Lọc theo tin tuyển dụng |
| `status` | string | Lọc theo trạng thái (New, Screening, Shortlisted, Interviewing, Offered, Hired, Rejected) |

**Response 200:**
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "data": [
    {
      "appId": 1,
      "jobId": 1,
      "status": "New",
      "appliedDate": "2026-05-20T...",
      "cvFile": "https://...",
      "candidate": { "candidateId": 1, "fullName": "...", "email": "...", "phone": "..." },
      "jobPosting": { "jobId": 1, "title": "..." }
    }
  ]
}
```

---

#### GET /api/v1/applications/:id

Lấy chi tiết hồ sơ (Recruiter, Admin).

---

#### PATCH /api/v1/applications/:id/status

Cập nhật trạng thái hồ sơ (Shortlist/Reject) (Recruiter, Admin).

**Request:**
```json
{ "status": "Shortlisted" }
```

**Response 200:** `{ "success": true, "message": "Application status updated successfully", "data": {...} }`

---

### 3.4 Interview APIs

---

#### GET /api/v1/interviews

Lấy danh sách phỏng vấn (Authenticated).

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `appId` | number | Lọc theo hồ sơ |
| `interviewerId` | number | Lọc theo người phỏng vấn (tự động filter cho HiringManager) |
| `type` | string | Lọc theo loại (HR, Technical, Final) |
| `confirmStatus` | string | Lọc theo trạng thái xác nhận |
| `result` | string | Lọc theo kết quả |

---

#### GET /api/v1/interviews/:id

Lấy chi tiết phỏng vấn.

---

#### POST /api/v1/interviews

Tạo lịch phỏng vấn (Recruiter, Admin).

**Request:**
```json
{
  "appId": 1,
  "interviewerId": 3,
  "interviewDate": "2026-06-15T09:00:00Z",
  "location": "Office - Room 301",
  "type": "Technical"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Interview scheduled successfully",
  "data": { "interviewId": 1, "confirmStatus": "Pending", ... }
}
```

**Response 409:** `{ "success": false, "message": "Conflict: Interviewer already has an interview at this time" }`

---

#### PUT /api/v1/interviews/:id

Cập nhật lịch phỏng vấn (Recruiter, Admin).

---

#### PATCH /api/v1/interviews/:id/confirm

Xác nhận/từ chối tham gia phỏng vấn (Interviewer).

**Request:**
```json
{ "confirmStatus": "Confirmed" }
```

---

#### PATCH /api/v1/interviews/:id/evaluate

Đánh giá sau phỏng vấn (Interviewer).

**Request:**
```json
{
  "technicalScore": 8,
  "softScore": 7,
  "attitudeScore": 9,
  "feedback": "Tot",
  "result": "Pass"
}
```

---

#### DELETE /api/v1/interviews/:id

Xóa lịch phỏng vấn (Recruiter, Admin).

---

### 3.5 Offer APIs

---

#### GET /api/v1/offers

Lấy danh sách Offer (Authenticated).

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `appId` | number | Lọc theo hồ sơ |
| `status` | string | Lọc theo trạng thái (Pending, Approved, Accepted, Rejected, Declined) |

---

#### GET /api/v1/offers/:id

Lấy chi tiết Offer.

---

#### POST /api/v1/offers

Tạo Offer mới (Recruiter, Admin) - chỉ khi ứng viên "Interview Passed".

**Request:**
```json
{
  "appId": 1,
  "baseSalary": 15000000,
  "allowance": 2000000,
  "startDate": "2026-07-01"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Offer created successfully",
  "data": { "offerId": 1, "status": "Pending", ... }
}
```

---

#### PUT /api/v1/offers/:id

Cập nhật Offer (Recruiter, Admin).

---

#### PATCH /api/v1/offers/:id/status

Cập nhật trạng thái Offer (Recruiter, Admin).

**Request:**
```json
{ "status": "Accepted" }
```

---

#### PATCH /api/v1/offers/:id/approve

Phê duyệt/từ chối Offer (Director, Admin).

**Request:**
```json
{ "status": "Approved", "directorNote": "Dong y" }
```

---

#### DELETE /api/v1/offers/:id

Xóa Offer (Recruiter, Admin).

---

### 3.6 Offer Response APIs (Public - UC-10)

---

#### GET /api/v1/offer-response/:token

Lấy thông tin Offer qua token (Public - không cần auth).

**Response 200:**
```json
{
  "success": true,
  "message": "Offer info retrieved",
  "data": {
    "candidateName": "Nguyen Van A",
    "jobTitle": "Frontend Developer",
    "baseSalary": 15000000,
    "allowance": 2000000,
    "startDate": "2026-07-01",
    "status": "Approved"
  }
}
```

---

#### POST /api/v1/offer-response/:token/accept

Chấp nhận Offer (Public - không cần auth).

**Response 200:**
```json
{
  "success": true,
  "message": "Offer accepted successfully",
  "data": { ... }
}
```

---

#### POST /api/v1/offer-response/:token/decline

Từ chối Offer (Public - không cần auth).

**Request:**
```json
{ "reason": "Da nhan viec khac" }
```

**Response 200:**
```json
{
  "success": true,
  "message": "Offer declined successfully",
  "data": { ... }
}
```

---

### 3.7 Probation APIs

---

#### GET /api/v1/probations

Lấy danh sách thử việc (Authenticated).

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `status` | string | Lọc theo trạng thái |

**Role-based filtering:**
- **Probationer:** Chỉ xem bản ghi của mình
- **HiringManager:** Chỉ xem bản ghi mình làm supervisor
- **Recruiter/Director/Admin:** Xem tất cả

---

#### GET /api/v1/probations/ending-soon

Lấy danh sách thử việc sắp kết thúc (7 ngày).

---

#### GET /api/v1/probations/:id

Lấy chi tiết thử việc.

---

#### POST /api/v1/probations

Tạo hồ sơ thử việc (Recruiter, Admin). Tự động tạo tài khoản Probationer.

**Request:**
```json
{
  "offerId": 1,
  "probationerId": 5,
  "supervisorId": 3,
  "startDate": "2026-07-01",
  "endDate": "2026-09-30"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Probation created successfully and Probationer account generated",
  "data": { ... }
}
```

---

#### PUT /api/v1/probations/:id

Cập nhật thông tin thử việc (Recruiter, Admin).

---

#### PUT /api/v1/probations/:id/evaluate

Đánh giá thử việc (HiringManager, Director, Recruiter, Admin).

**Request:**
```json
{
  "kpiScore": 85,
  "comment": "Hoan thanh tot",
  "recommendation": "Pass",
  "isSubmit": true
}
```

Khi `isSubmit = true` → gửi lên duyệt (PendingApproval). Khi `false` → lưu nháp (Draft).

---

#### PATCH /api/v1/probations/:id/approve

Phê duyệt/từ chối đánh giá thử việc (Director, Admin).

**Request:**
```json
{ "status": "Approved", "directorNote": "Dong y" }
```

---

### 3.8 User APIs

---

#### GET /api/v1/users

Lấy danh sách người dùng (Authenticated).

---

## 4. Common Data Models

### Standard Success Response
```json
{
  "success": true,
  "message": "Action performed successfully",
  "data": { ... }
}
```

### Standard Paginated Response
```json
{
  "success": true,
  "message": "Resources retrieved successfully",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 5. Error Handling

### HTTP Status Codes Usage

| Code | Usage | When |
|---|---|---|
| **200** | OK | GET, PUT, PATCH, DELETE thành công |
| **201** | Created | POST tạo resource thành công |
| **204** | No Content | Xóa thành công (không dùng) |
| **400** | Bad Request | Validation lỗi, file upload lỗi |
| **401** | Unauthorized | Thiếu hoặc sai token |
| **403** | Forbidden | Không có quyền truy cập |
| **404** | Not Found | Resource không tồn tại |
| **409** | Conflict | Xung đột (email đã tồn tại, trùng lịch PV) |
| **429** | Too Many Requests | Vượt quá rate limit |
| **500** | Internal Server Error | Lỗi server |

### Error Codes Catalog

| Code | Message | HTTP Status |
|---|---|---|
| `UNAUTHORIZED` | Unauthorized | 401 |
| `FORBIDDEN` | Forbidden | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Validation error | 400 |
| `EMAIL_ALREADY_EXISTS` | Email already exists | 409 |
| `INVALID_CREDENTIALS` | Email or password is incorrect | 401 |
| `FILE_UPLOAD_ERROR` | File upload error: ... | 400 |

---

## 6. Versioning & Evolution

| Item | Policy |
|---|---|
| **Versioning strategy** | URL-based (`/api/v1/`, `/api/v2/`) |
| **Backward compatibility** | New fields optional in request, no breaking changes within major version |
| **Deprecation** | Endpoints annotated with `Deprecated` header 1 version before removal |
| **Current version** | `v1` |

---

## 7. Rate Limiting & Quotas

| Item | Value |
|---|---|
| **Window** | 15 minutes |
| **Limit** | 100 requests per window per IP |
| **Headers** | `RateLimit` (standard draft-7) |
| **Exceeded response** | 429 Too Many Requests |
| **Exceeded message** | `{ "success": false, "message": "Too many requests from this IP, please try again after 15 minutes" }` |

---

## API Endpoint Summary

| Module | Method | Endpoint | Auth | Roles |
|---|---|---|---|---|
| **Auth** | POST | `/auth/register` | JWT | Admin |
| | POST | `/auth/login` | Public | - |
| | GET | `/auth/me` | JWT | All |
| **Jobs** | GET | `/jobs` | Public | - |
| | GET | `/jobs/:id` | Public | - |
| | POST | `/jobs` | JWT | Recruiter, Admin |
| | PUT | `/jobs/:id` | JWT | Recruiter, Admin |
| | PATCH | `/jobs/:id/status` | JWT | Recruiter, Admin |
| | DELETE | `/jobs/:id` | JWT | Recruiter, Admin |
| **Applications** | POST | `/applications` | Public | - (multipart) |
| | GET | `/applications` | JWT | Recruiter, Admin |
| | GET | `/applications/:id` | JWT | Recruiter, Admin |
| | PATCH | `/applications/:id/status` | JWT | Recruiter, Admin |
| **Interviews** | GET | `/interviews` | JWT | All authenticated |
| | GET | `/interviews/:id` | JWT | All authenticated |
| | POST | `/interviews` | JWT | Recruiter, Admin |
| | PUT | `/interviews/:id` | JWT | Recruiter, Admin |
| | PATCH | `/interviews/:id/confirm` | JWT | Interviewer |
| | PATCH | `/interviews/:id/evaluate` | JWT | Interviewer |
| | DELETE | `/interviews/:id` | JWT | Recruiter, Admin |
| **Offers** | GET | `/offers` | JWT | All authenticated |
| | GET | `/offers/:id` | JWT | All authenticated |
| | POST | `/offers` | JWT | Recruiter, Admin |
| | PUT | `/offers/:id` | JWT | Recruiter, Admin |
| | PATCH | `/offers/:id/status` | JWT | Recruiter, Admin |
| | PATCH | `/offers/:id/approve` | JWT | Director, Admin |
| | DELETE | `/offers/:id` | JWT | Recruiter, Admin |
| **Offer Response** | GET | `/offer-response/:token` | Public | - |
| | POST | `/offer-response/:token/accept` | Public | - |
| | POST | `/offer-response/:token/decline` | Public | - |
| **Probations** | GET | `/probations` | JWT | All authenticated |
| | GET | `/probations/ending-soon` | JWT | All authenticated |
| | GET | `/probations/:id` | JWT | All authenticated |
| | POST | `/probations` | JWT | Recruiter, Admin |
| | PUT | `/probations/:id` | JWT | Recruiter, Admin |
| | PUT | `/probations/:id/evaluate` | JWT | HM, Dir, Rec, Admin |
| | PATCH | `/probations/:id/approve` | JWT | Director, Admin |
| **Users** | GET | `/users` | JWT | All authenticated |
