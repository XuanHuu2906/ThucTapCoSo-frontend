# DOC 7.3-A: Test Plan Document

## 1. Testing Overview

### Objectives
- Xác nhận tất cả functional requirements (REQ-001 đến REQ-028) hoạt động đúng
- Đảm bảo API endpoints theo đúng spec (DOC 5.2-A)
- Phát hiện lỗi sớm trước khi deploy
- Đạt coverage tối thiểu 80%

### Testing Pyramid
```
        ╱╲
       ╱  ╲        E2E / System Tests: 10%
      ╱    ╲       (Cypress, manual UAT)
     ╱──────╲
    ╱        ╲     Integration Tests: 20%
   ╱          ╲    (API tests, DB tests)
  ╱────────────╲
 ╱              ╲  Unit Tests: 70%
╱                ╲ (Services, Validators, Algorithms)
```

---

## 2. Test Strategy

| Level | Scope | Target | Tool | Who |
|---|---|---|---|---|
| **Unit** | Services, Validators, Algorithms | 80% coverage | Vitest (FE), Jest (BE) | Developer |
| **Integration** | API endpoints (DOC 5.2-A), Database repositories | 100% endpoint coverage | Supertest + Vitest | Developer |
| **System/E2E** | Critical use cases (UC-01 to UC-17) | All Must-Have flows | Cypress / Playwright | QA |
| **UAT** | Business acceptance criteria | 28 REQs verified | Manual + scripts | PO/BA |
| **Performance** | API response time, concurrent users | N/A | k6 / autocannon | Developer |
| **Security** | OWASP Top 10, Auth, RBAC | N/A | Manual + ZAP | Developer |

---

## 3. Unit Testing

### Scope
- **Services (BE):** AuthService, JobService, ApplicationService, InterviewService, OfferService, ProbationService
- **Services (FE):** auth.service, job.service, application.service, interview.service, offer.service, probation.service
- **Validators:** Tất cả Zod schemas
- **Algorithms:** CheckInterviewConflict, CalculateInterviewResult, ApplicationStatusTransition

### Target: 80% code coverage

### Test File Naming
```
src/services/__tests__/job.service.test.ts
src/validators/__tests__/job.validator.test.ts
```

### Sample Test Cases (Unit)

| ID | Module | Test | Input | Expected |
|---|---|---|---|---|
| UT-01 | AuthService | Login thành công | email + password đúng | Token + User |
| UT-02 | AuthService | Login sai mật khẩu | email đúng + pass sai | Throw AppError(401) |
| UT-03 | AuthService | Login không tìm thấy email | email không tồn tại | Throw AppError(404) |
| UT-04 | JobValidator | Tạo job hợp lệ | Đủ các trường bắt buộc | Pass validation |
| UT-05 | JobValidator | Tạo job thiếu title | Thiếu title | ZodError |
| UT-06 | InterviewService | CheckConflict có conflict | Cùng interviewer, cùng giờ | hasConflict=true |
| UT-07 | InterviewService | CheckConflict không conflict | Cùng interviewer, khác giờ | hasConflict=false |
| UT-08 | ApplicationService | Transition New→Shortlisted | status="Shortlisted" | Thành công |
| UT-09 | ApplicationService | Transition Rejected→Shortlisted | status="Shortlisted" (từ Rejected) | Throw AppError |
| UT-10 | OfferService | Tạo Offer khi chưa Pass Interview | app status=Shortlisted | Throw AppError |

---

## 4. Integration Testing

### Scope
- Tất cả API endpoints từ DOC 5.2-A (30 endpoints)
- Database repositories (CRUD operations)
- Authentication middleware (JWT)
- File upload flow (multipart)

### Target: 100% endpoint coverage

### Sample Test Cases (Integration)

| ID | Method | Endpoint | Auth | Expected Status |
|---|---|---|---|---|
| IT-01 | POST | /auth/login | Public | 200 |
| IT-02 | POST | /auth/login (sai pass) | Public | 401 |
| IT-03 | GET | /auth/me | JWT | 200 |
| IT-04 | GET | /auth/me (no token) | None | 401 |
| IT-05 | GET | /jobs | Public | 200 |
| IT-06 | POST | /jobs | JWT + Recruiter | 201 |
| IT-07 | POST | /jobs | JWT + Probationer | 403 |
| IT-08 | GET | /applications | JWT + Recruiter | 200 |
| IT-09 | POST | /applications | Public + multipart | 201 |
| IT-10 | PATCH | /applications/:id/status | JWT + Recruiter | 200 |
| IT-11 | POST | /interviews | JWT + Recruiter | 201 |
| IT-12 | PATCH | /interviews/:id/evaluate | JWT + HM | 200 |
| IT-13 | POST | /offers | JWT + Recruiter | 201 |
| IT-14 | PATCH | /offers/:id/approve | JWT + Director | 200 |
| IT-15 | GET | /offer-response/:token | Public | 200 |
| IT-16 | POST | /offer-response/:token/accept | Public | 200 |
| IT-17 | POST | /probations | JWT + Recruiter | 201 |
| IT-18 | PATCH | /probations/:id/approve | JWT + Director | 200 |

---

## 5. System / E2E Testing

### Critical Use Cases

| UC | Flow | Steps |
|---|---|---|
| UC-01 | Login → Dashboard | Nhập email+pass → redirect đúng role |
| UC-02 | CRUD Job | Tạo → Sửa → Đóng → Xóa |
| UC-03 | Apply Job | Xem job → nộp hồ sơ → nhận email |
| UC-04 | Screen Candidates | Xem hồ sơ → Shortlist/Reject |
| UC-05 | Schedule Interview | Tạo lịch → conflict check → email |
| UC-07 | Evaluate Interview | Nhập điểm → pass/fail → update status |
| UC-08+09 | Create + Approve Offer | Tạo Offer → Director duyệt → email |
| UC-10 | Respond Offer | Token → Accept → auto-create account |
| UC-12+14 | Evaluate Probation | HM đánh giá → Director duyệt → email |

---

## 6. Test Environment

| Environment | URL | Database | Notes |
|---|---|---|---|
| **Development** | localhost:5173 | Local PostgreSQL | Dev testing |
| **Test** | (CI) | Test DB (isolated) | Automated tests |
| **Staging** | (deployed) | Staging DB | Pre-production |
| **Production** | huunguyen.xyz | Production DB | Live |

---

## 7. Tools and Automation

| Tool | Purpose |
|---|---|
| **Vitest** | Unit tests (FE + BE) |
| **Supertest** | HTTP integration tests |
| **Cypress** | E2E tests |
| **k6** | Performance / Load tests |
| **ESLint** | Code quality |
| **Prettier** | Code formatting |

---

## 8. Defect Management

### Severity Levels
| Severity | Definition | Response Time |
|---|---|---|
| **Blocker (P0)** | Không thể login, mất dữ liệu | Fix ngay lập tức |
| **Critical (P1)** | Core feature không hoạt động | Trong 24h |
| **Major (P2)** | Feature hoạt động nhưng sai logic | Trong 3 ngày |
| **Minor (P3)** | Lỗi UI, sai text, cosmetic | Trong 1 sprint |

---

# DOC 7.3-C: Test Coverage Matrix

## Requirements → Test Cases

| REQ | Mô tả | UT | IT | E2E | Status |
|---|---|---|---|---|---|
| REQ-001 | Xác thực người dùng | UT-01,02,03 | IT-01,02 | UC-01 | ✅ |
| REQ-002 | Chuyển hướng theo role | - | - | UC-01 | ✅ |
| REQ-003 | Quên mật khẩu | (future) | (future) | (future) | ⏳ |
| REQ-004 | Tạo tin tuyển dụng | UT-04,05 | IT-06 | UC-02 | ✅ |
| REQ-005 | Sửa/Đóng tin tuyển dụng | - | IT-06 | UC-02 | ✅ |
| REQ-006 | Nộp hồ sơ + upload CV | - | IT-09 | UC-03 | ✅ |
| REQ-007 | Email xác nhận hồ sơ | - | - | UC-03 | ✅ |
| REQ-008 | Xem CV + chi tiết hồ sơ | - | IT-08 | UC-04 | ✅ |
| REQ-009 | Shortlist hồ sơ | UT-08 | IT-10 | UC-04 | ✅ |
| REQ-010 | Loại hồ sơ + email từ chối | UT-09 | IT-10 | UC-04 | ✅ |
| REQ-011 | Kiểm tra xung đột lịch PV | UT-06,07 | IT-11 | UC-05 | ✅ |
| REQ-012 | Email mời PV | - | - | UC-05 | ✅ |
| REQ-013 | Xác nhận PV qua link | - | - | UC-06 | ⏳ |
| REQ-014 | Nhập điểm + kết quả PV | - | IT-12 | UC-07 | ✅ |
| REQ-015 | Tạo Offer (Interview Passed) | UT-10 | IT-13 | UC-08 | ✅ |
| REQ-016 | Director phê duyệt Offer | - | IT-14 | UC-09 | ✅ |
| REQ-017 | Email thư mời nhận việc | - | - | UC-09 | ✅ |
| REQ-018 | Ứng viên phản hồi Offer | - | IT-15,16 | UC-10 | ✅ |
| REQ-019 | Tự động tạo tài khoản | - | - | UC-10 | ✅ |
| REQ-020 | Danh sách thử việc | - | IT-17 | UC-11 | ✅ |
| REQ-021 | Xuất Excel thử việc | - | - | - | ✅ |
| REQ-022 | Email nhắc đánh giá | - | - | - | ⏳ |
| REQ-023 | Nhập đánh giá thử việc | - | - | UC-12 | ✅ |
| REQ-024 | Director duyệt đánh giá | - | IT-18 | UC-14 | ✅ |
| REQ-025 | Email kết quả thử việc | - | - | UC-14 | ✅ |
| REQ-026 | Probationer xem thông tin | - | - | - | ✅ |
| REQ-027 | Báo cáo tuyển dụng | - | - | - | ✅ |
| REQ-028 | Báo cáo điều hành | - | - | - | ✅ |

## Coverage Summary

| Metric | Target | Current |
|---|---|---|
| Requirements covered | 28/28 (100%) | 25/28 (89%) |
| Unit test cases | 20+ | 10 planned |
| Integration test cases | 18 | 18 planned |
| E2E test cases | 8 | 8 planned |
| Code coverage target | 80% | - |
