# DOC 5.4-A: Security Design Document

## 1. Security Overview

### Security Goals
- **Confidentiality:** Bảo vệ dữ liệu tuyển dụng, thông tin ứng viên và offer khỏi truy cập trái phép
- **Integrity:** Đảm bảo dữ liệu không bị sửa đổi trái phép (điểm phỏng vấn, kết quả đánh giá)
- **Availability:** Ngăn chặn tấn công DoS, đảm bảo hệ thống hoạt động liên tục

### Threat Model Summary
| Threat | Impact | Mitigation |
|---|---|---|
| Truy cập API trái phép | Cao | JWT authentication + Role-based middleware |
| Lộ thông tin ứng viên | Cao | Encryption in transit + at rest, file upload validation |
| Brute force login | Cao | Rate limiting, bcrypt password hashing |
| SQL Injection | Cao | Prisma ORM (parameterized queries) |
| XSS | Trung bình | Helmet headers, output encoding, CSP |
| CSRF | Trung bình | SameSite cookies, token-based auth (stateless) |
| File upload tấn công | Trung bình | File type validation, size limit, Cloudinary |

---

## 2. Authentication Design

### 2.1 Authentication Mechanism

```
┌───────────┐          ┌─────────────────┐          ┌──────────────┐
│  Frontend  │  POST    │  AuthController  │  verify  │  Database    │
│  (React)   │────────▶│  (Express)       │────────▶│  (PostgreSQL)│
│            │◀────────│                  │          │              │
│            │  JWT     │  JWT Sign(user)  │          │              │
│  Store in  │  Token   │                  │          │              │
│  localStorage         └─────────────────┘          └──────────────┘
│            │
│  Attach    │
│  Bearer    │  ┌─────────────────────────────────────────────┐
│  Token to  │  │  JwtAuthMiddleware:                          │
│  headers   │  │  1. Extract Authorization: Bearer {token}   │
│            │  │  2. jwt.verify(token, JWT_SECRET)           │
│            │  │  3. Attach { userId, email, role } to req   │
│            │  └─────────────────────────────────────────────┘
└───────────┘
```

### 2.2 Token Specification

| Item | Access Token | Refresh Token |
|---|---|---|
| **Format** | JWT (HS256) | JWT (HS256) |
| **TTL** | 15 phút | 7 ngày |
| **Secret** | `JWT_SECRET` (≥32 ký tự) | `JWT_REFRESH_SECRET` (≥32 ký tự) |
| **Payload** | `{ userId, email, role }` | `{ userId, email, role }` |
| **Storage (FE)** | `localStorage` key: `rms_access_token` | `localStorage` key: `rms_refresh_token` |

### 2.3 Token Flow

```
1. Login:  POST /auth/login → nhận { token, user }
2. Lưu:    localStorage.setItem('rms_access_token', token)
3. Gọi API: Authorization: Bearer {token}
4. Hết hạn: 401 → gọi refresh token → nhận token mới
           (hoặc logout → redirect login)
```

### 2.4 Password Policy

| Item | Requirement |
|---|---|
| **Hash algorithm** | bcryptjs (salt rounds: 10) |
| **Validation** | Backend: Zod schema validation |
| **Min length** | ≥ 6 ký tự (configurable via Zod) |
| **Auto-generate** | Random 12+ ký tự when creating Probationer account (REQ-019) |

### 2.5 Session Management

| Item | Policy |
|---|---|
| **Type** | Stateless (JWT, no server-side session) |
| **Logout** | Clear localStorage, no server-side invalidation |
| **Token refresh** | On 401 response → `refreshMe()` → redirect login if fail |
| **Hydrate** | On app load → `GET /auth/me` với token từ localStorage |

---

## 3. Authorization Design

### 3.1 Model: Role-Based Access Control (RBAC)

Hệ thống sử dụng RBAC với 5 roles:

| Role | Mô tả |
|---|---|
| **Recruiter** | Chuyên viên tuyển dụng - quản lý tin tuyển dụng, hồ sơ, offer, thử việc |
| **HiringManager** | Quản lý phỏng vấn, đánh giá thử việc |
| **Director** | Giám đốc - phê duyệt offer, đánh giá thử việc, xem báo cáo |
| **Probationer** | Nhân viên thử việc - xem thông tin thử việc (read-only) |
| **Admin** | Quản trị hệ thống - tạo tài khoản, toàn quyền |

### 3.2 Permission-to-API Mapping

| API Endpoint | Recruiter | HiringManager | Director | Probationer | Admin | Public |
|---|---|---|---|---|---|---|
| **Auth** | | | | | | |
| `POST /auth/login` | - | - | - | - | - | ✓ |
| `GET /auth/me` | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| `POST /auth/register` | - | - | - | - | ✓ | - |
| **Jobs** | | | | | | |
| `GET /jobs` | - | - | - | - | - | ✓ |
| `GET /jobs/:id` | - | - | - | - | - | ✓ |
| `POST /jobs` | ✓ | - | - | - | ✓ | - |
| `PUT /jobs/:id` | ✓ | - | - | - | ✓ | - |
| `DELETE /jobs/:id` | ✓ | - | - | - | ✓ | - |
| `PATCH /jobs/:id/status` | ✓ | - | - | - | ✓ | - |
| **Applications** | | | | | | |
| `POST /applications` | - | - | - | - | - | ✓ |
| `GET /applications` | ✓ | - | - | - | ✓ | - |
| `GET /applications/:id` | ✓ | - | - | - | ✓ | - |
| `PATCH /applications/:id/status` | ✓ | - | - | - | ✓ | - |
| **Interviews** | | | | | | |
| `GET /interviews` | ✓ | ✓(own) | - | - | ✓ | - |
| `GET /interviews/:id` | ✓ | ✓ | - | - | ✓ | - |
| `POST /interviews` | ✓ | - | - | - | ✓ | - |
| `PUT /interviews/:id` | ✓ | - | - | - | ✓ | - |
| `DELETE /interviews/:id` | ✓ | - | - | - | ✓ | - |
| `PATCH /interviews/:id/confirm` | ✓ | ✓ | ✓ | - | ✓ | - |
| `PATCH /interviews/:id/evaluate` | - | ✓ | - | - | ✓ | - |
| **Offers** | | | | | | |
| `GET /offers` | ✓ | ✓ | ✓ | - | ✓ | - |
| `GET /offers/:id` | ✓ | ✓ | ✓ | - | ✓ | - |
| `POST /offers` | ✓ | - | - | - | ✓ | - |
| `PUT /offers/:id` | ✓ | - | - | - | ✓ | - |
| `DELETE /offers/:id` | ✓ | - | - | - | ✓ | - |
| `PATCH /offers/:id/status` | ✓ | - | - | - | ✓ | - |
| `PATCH /offers/:id/approve` | - | - | ✓ | - | ✓ | - |
| **Offer Response** | | | | | | |
| `GET /offer-response/:token` | - | - | - | - | - | ✓ |
| `POST /offer-response/:token/accept` | - | - | - | - | - | ✓ |
| `POST /offer-response/:token/decline` | - | - | - | - | - | ✓ |
| **Probations** | | | | | | |
| `GET /probations` | ✓ | ✓(own) | ✓ | ✓(own) | ✓ | - |
| `GET /probations/:id` | ✓ | ✓ | ✓ | ✓(own) | ✓ | - |
| `POST /probations` | ✓ | - | - | - | ✓ | - |
| `PUT /probations/:id` | ✓ | - | - | - | ✓ | - |
| `PUT /probations/:id/evaluate` | ✓ | ✓ | ✓ | - | ✓ | - |
| `PATCH /probations/:id/approve` | - | - | ✓ | - | ✓ | - |

### 3.3 Enforcement Points

| Layer | Mechanism | Implementation |
|---|---|---|
| **Route** | `authMiddleware` | JWT verification, attach user to `req.user` |
| **Route** | `roleMiddleware(roles)` | Check `req.user.role` against allowed roles array |
| **Service** | Business logic checks | Ví dụ: chỉ HiringManager mới được đánh giá interview của mình |
| **Controller** | Data filtering | Ví dụ: Probationer chỉ thấy probation của chính mình (controller filter) |
| **Frontend** | `ProtectedRoute` | Route guard component, redirect nếu sai role |
| **Frontend** | Conditional rendering | Ẩn menu items không thuộc role |

---

## 4. Data Protection

### 4.1 Encryption In Transit

| Layer | Protocol | Scope |
|---|---|---|
| **HTTP → HTTPS** | TLS 1.3 | Production (Render.com) |
| **Development** | HTTP | Localhost (localhost:5173 ↔ localhost:5000) |

### 4.2 Encryption At Rest

| Component | Method | Details |
|---|---|---|
| **Database** | PostgreSQL built-in | AES-256 encryption (configurable) |
| **Passwords** | bcryptjs (hash, not encrypt) | Salt rounds: 10, one-way hash |
| **CV Files** | Cloudinary (managed) | Cloudinary handles storage encryption |

### 4.3 Sensitive Data Classification

| Data Type | Classification | Handling |
|---|---|---|
| **Password** | Critical | bcrypt hash, never logged |
| **JWT Secret** | Critical | Environment variable, ≥32 ký tự |
| **Email** | PII | Lưu trong database không mã hóa |
| **Phone** | PII | Lưu trong database (optional field) |
| **CV File** | PII | Upload lên Cloudinary, URL lưu trong DB |
| **Salary/Offer** | Confidential | Lưu trong Offer table |
| **Interview Scores** | Internal | Lưu trong Interview table |

### 4.4 Key Management

| Secret | Storage | Rotation |
|---|---|---|
| `JWT_SECRET` | Environment variable (`.env`) | Manual rotation via env change |
| `JWT_REFRESH_SECRET` | Environment variable (`.env`) | Manual rotation via env change |
| `DATABASE_URL` | Environment variable (`.env`) | Manual rotation |
| `CLOUDINARY_URL` | Environment variable (`.env`) | Cloudinary-managed |

### 4.5 Data Masking in Logs

| Data Type | Logging Rule |
|---|---|
| **Password** | Never log (even hashed) |
| **JWT Token** | Never log |
| **Email** | Can log (non-sensitive in context) |
| **CV File URL** | Can log with truncation |

---

## 5. Security Controls

### 5.1 Input Validation and Sanitization

| Layer | Tool | Details |
|---|---|---|
| **API (Backend)** | Zod schemas | Validate request body, query params, params type |
| **File Upload** | Multer + Cloudinary | Validate file type (PDF/DOC/DOCX), size (<5MB) |
| **Prisma ORM** | Parameterized queries | Ngăn SQL injection |

Ví dụ validation flow:
```
Request → Multer (file type/size) → Zod (body fields) → Controller → Service → DB
```

### 5.2 Security Headers (Helmet.js)

| Header | Value | Purpose |
|---|---|---|
| `Content-Security-Policy` | Default (Helmet) | Ngăn XSS |
| `X-Frame-Options` | `SAMEORIGIN` | Ngăn clickjacking |
| `Strict-Transport-Security` | Default (Helmet) | Force HTTPS |
| `X-Content-Type-Options` | `nosniff` | Ngăn MIME sniffing |
| `X-XSS-Protection` | Default | XSS filter (legacy browsers) |

### 5.3 CORS Policy

| Item | Value |
|---|---|
| **Allowed Origins** | Dev: `localhost:5173, 3000, 5174` |
| | Prod: `thuctapcoso-frontend.onrender.com, huunguyen.xyz` |
| **Credentials** | `true` |
| **Allowed Methods** | `GET, POST, PUT, PATCH, DELETE, OPTIONS` |
| **Allowed Headers** | `Content-Type, Authorization` |

### 5.4 CSRF Protection

Hệ thống sử dụng **stateless JWT authentication** (không dùng cookie-based session), do đó không yêu cầu CSRF token. Token được gửi qua header `Authorization: Bearer` và không bị ảnh hưởng bởi CSRF tấn công qua cookie.

### 5.5 Rate Limiting

| Item | Value |
|---|---|
| **Library** | `express-rate-limit` |
| **Window** | 15 phút |
| **Limit** | 100 requests per IP |
| **Response** | HTTP 429 + JSON error message |
| **Headers** | `RateLimit` (draft-7 standard) |
| **Scope** | Global (all routes) |

---

## 6. Audit Logging

### 6.1 Events to Log

| Event | Level | Details |
|---|---|---|
| Login thành công | Info | Email, role, timestamp |
| Login thất bại | Warn | Email, reason, IP |
| Tạo/Cập nhật job | Info | User, jobId, action |
| Nộp hồ sơ | Info | Candidate email, jobId |
| Shortlist/Reject hồ sơ | Info | Recruiter, appId, new status |
| Tạo/Cập nhật phỏng vấn | Info | User, interviewId |
| Đánh giá phỏng vấn | Info | Interviewer, interviewId, result |
| Tạo/Phê duyệt/Từ chối Offer | Info | User, offerId, action, reason |
| Đánh giá thử việc | Info | Evaluator, probationId |
| Lỗi server | Error | Stack trace, request info |

### 6.2 Log Format
```
[Timestamp] [Level] [Module] Message { metadata }
```

Hiện tại sử dụng `console.log`/`console.error` (sẽ ghi vào stdout/stderr của server).

### 6.3 Log Retention
- **Application logs:** Theo chính sách deployment platform (Render.com)
- **Error logs:** Tối thiểu 30 ngày

---

## 7. Security Monitoring

### 7.1 Alerts (Recommended)

| Event | Threshold | Action |
|---|---|---|
| Failed login attempts | >5 in 15 phút | Log warning, rate limit đã active |
| Unauthorized API access | >10 in 15 phút | Log warning, investigate |
| File upload failures | >3 in 15 phút | Log warning |
| 500 errors | >5 in 15 phút | Log error, notify admin |

### 7.2 Current Monitoring
- **Error tracking:** Global error handler middleware ghi log `console.error`
- **Rate limit:** Tự động chặn khi vượt ngưỡng
- **Request validation:** Zod validation errors trả 400 với message chi tiết

---

## 8. Network Security

### 8.1 Security Zones

```
[Internet] → [CORS Filter] → [Rate Limiter] → [Helmet Headers]
                                                 │
                                    ┌────────────┴────────────┐
                                    │  API Server (Express)    │
                                    │  - JWT Auth Middleware   │
                                    │  - Role Middleware       │
                                    │  - Zod Validation        │
                                    └────────────┬────────────┘
                                                 │
                                    ┌────────────┴────────────┐
                                    │  PostgreSQL Database     │
                                    │  (Internal Network)      │
                                    └─────────────────────────┘
```

### 8.2 Firewall Rules (Recommended)

| Source | Destination | Port | Protocol |
|---|---|---|---|
| Internet | API Server | 443 (HTTPS) | TCP |
| API Server | PostgreSQL | 5432 | TCP |
| API Server | Cloudinary | 443 | TCP |
| API Server | Resend | 443 | TCP |

---

## 9. Secrets Management

| Secret | Location | Access Control |
|---|---|---|
| `JWT_SECRET` | `.env` / Environment variable | Server only |
| `JWT_REFRESH_SECRET` | `.env` / Environment variable | Server only |
| `DATABASE_URL` | `.env` / Environment variable | Server only |
| `CLOUDINARY_URL` | `.env` / Environment variable | Server only |
| `JWT tokens` | Client `localStorage` | User's browser |

**Rules:**
- Secrets không được commit lên git (`.env` trong `.gitignore`)
- Production secrets được set qua environment variables trên deployment platform

---

## 10. Incident Response

### 10.1 Detection
- **401 Unauthorized:** Token hết hạn → Frontend tự động refresh hoặc redirect login
- **403 Forbidden:** Sai role → Hiển thị "Bạn không có quyền truy cập"
- **429 Too Many Requests:** Rate limit → Hiển thị "Vui lòng thử lại sau"

### 10.2 Escalation Paths

| Incident | Response |
|---|---|
| Token bị lộ | Đổi JWT_SECRET → tất cả user logout |
| Tài khoản bị compromise | Admin khóa tài khoản (status = Inactive) |
| DDoS/ Brute force | Rate limiter tự động chặn |
| Lỗi bảo mật | Fix + redeploy |

---

## 11. Compliance Mapping

| Requirement | Security Control | Status |
|---|---|---|
| Bảo vệ mật khẩu (REQ-001) | bcrypt hash, không lưu plaintext | ✅ Implemented |
| Phân quyền theo role (REQ-002) | RBAC: roleMiddleware | ✅ Implemented |
| Bảo vệ API | JWT authentication | ✅ Implemented |
| Bảo vệ upload file | Multer type/size validation → Cloudinary | ✅ Implemented |
| Xác thực đầu vào | Zod validation schemas | ✅ Implemented |
| Bảo vệ CSRF | Stateless JWT (không cookie) | ✅ Implemented |
| Rate limiting | express-rate-limit | ✅ Implemented |
| Security headers | Helmet.js | ✅ Implemented |
| Database encryption | PostgreSQL AES-256 (configurable) | ⚙️ Platform config |
| Audit logging | console.log/error (enhancement needed) | ⚠️ Basic |

---

*Document based on security analysis of ThucTapCoSo Recruitment Management System.*
*Frontend: React + TypeScript | Backend: Express + TypeScript + Prisma + PostgreSQL*
