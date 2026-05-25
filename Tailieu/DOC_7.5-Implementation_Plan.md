# DOC 7.5-A: Work Breakdown Structure (WBS)

## Summary

| Hạng mục | Tổng effort | Frontend | Backend | Database |
|---|---|---|---|---|
| 1. Project Setup | 3 ngày | 1 | 1 | 1 |
| 2. Authentication | 5 ngày | 2 | 2 | 1 |
| 3. Job Management | 6 ngày | 3 | 2 | 1 |
| 4. Application Management | 7 ngày | 3 | 3 | 1 |
| 5. Interview Management | 6 ngày | 2 | 3 | 1 |
| 6. Offer Management | 8 ngày | 3 | 4 | 1 |
| 7. Probation Management | 7 ngày | 3 | 3 | 1 |
| 8. Reporting & Dashboard | 5 ngày | 3 | 2 | - |
| 9. Testing & QA | 5 ngày | 2 | 2 | 1 |
| **Total** | **52 ngày** | **22** | **22** | **8** |

---

## Work Breakdown Detail

### 1. Project Setup (3 ngày)
| ID | Task | Effort | Skill | Dependency |
|---|---|---|---|---|
| 1.1 | Khởi tạo frontend React + Vite + TypeScript | 0.5 ngày | FE | - |
| 1.2 | Cấu hình TailwindCSS + shadcn/ui | 0.5 ngày | FE | 1.1 |
| 1.3 | Cấu hình ESLint + Prettier | 0.5 ngày | FE | 1.1 |
| 1.4 | Khởi tạo backend Express + TypeScript | 0.5 ngày | BE | - |
| 1.5 | Cấu hình Prisma + PostgreSQL | 1 ngày | DB | 1.4 |
| 1.6 | Cấu hình CI/CD + deploy | 0.5 ngày | BE | 1.1, 1.4 |

### 2. Authentication (5 ngày) — REQ-001, REQ-002
| ID | Task | Effort | Skill | Dependency |
|---|---|---|---|---|
| 2.1 | User model + migration (Prisma) | 0.5 ngày | DB | 1.5 |
| 2.2 | AuthService + AuthController (BE) | 1.5 ngày | BE | 2.1 |
| 2.3 | JWT middleware + role middleware | 1 ngày | BE | 2.2 |
| 2.4 | LoginPage + AuthContext (FE) | 1.5 ngày | FE | 2.3 |
| 2.5 | ProtectedRoute + role-based routing | 1 ngày | FE | 2.4 |

### 3. Job Management (6 ngày) — REQ-004, REQ-005, REQ-006
| ID | Task | Effort | Skill | Dependency |
|---|---|---|---|---|
| 3.1 | JobPosting model + migration | 0.5 ngày | DB | 1.5 |
| 3.2 | JobRepository + JobService (BE) | 1.5 ngày | BE | 3.1 |
| 3.3 | JobController + routes + validators | 1 ngày | BE | 3.2 |
| 3.4 | JobDetailPage (Public - xem + apply) | 1.5 ngày | FE | 3.3 |
| 3.5 | RecruiterJobsPage (CRUD jobs) | 2 ngày | FE | 3.3 |

### 4. Application Management (7 ngày) — REQ-006, REQ-007, REQ-008, REQ-009, REQ-010
| ID | Task | Effort | Skill | Dependency |
|---|---|---|---|---|
| 4.1 | Candidate + Application model + migration | 0.5 ngày | DB | 1.5 |
| 4.2 | Cấu hình Cloudinary + Upload middleware | 1 ngày | BE | 1.4 |
| 4.3 | ApplicationRepository + ApplicationService | 2 ngày | BE | 4.1, 4.2 |
| 4.4 | ApplicationController + routes + validators | 1 ngày | BE | 4.3 |
| 4.5 | EmailService (xác nhận + từ chối) | 1 ngày | BE | 1.4 |
| 4.6 | RecruiterCandidatesPage (list + filter + action) | 2.5 ngày | FE | 4.4 |

### 5. Interview Management (6 ngày) — REQ-011, REQ-012, REQ-013, REQ-014
| ID | Task | Effort | Skill | Dependency |
|---|---|---|---|---|
| 5.1 | Interview model + migration | 0.5 ngày | DB | 1.5 |
| 5.2 | InterviewRepository | 0.5 ngày | BE | 5.1 |
| 5.3 | InterviewService (schedule + conflict check) | 2 ngày | BE | 5.2 |
| 5.4 | InterviewController + routes + validators | 1 ngày | BE | 5.3 |
| 5.5 | ManagerInterviewsPage (lịch PV) | 1.5 ngày | FE | 5.4 |
| 5.6 | ManagerReviewsPage (đánh giá PV) | 1.5 ngày | FE | 5.4 |

### 6. Offer Management (8 ngày) — REQ-015, REQ-016, REQ-017, REQ-018, REQ-019
| ID | Task | Effort | Skill | Dependency |
|---|---|---|---|---|
| 6.1 | Offer model + migration | 0.5 ngày | DB | 1.5 |
| 6.2 | OfferRepository | 0.5 ngày | BE | 6.1 |
| 6.3 | OfferService (create + approve + respond) | 2.5 ngày | BE | 6.2, 2.2 |
| 6.4 | OfferController + routes (include public token endpoints) | 1.5 ngày | BE | 6.3 |
| 6.5 | RecruiterOffersPage (tạo + list Offer) | 2 ngày | FE | 6.4 |
| 6.6 | DirectorApprovalsPage (duyệt Offer) | 1.5 ngày | FE | 6.4 |
| 6.7 | OfferResponsePage (public - accept/decline) | 1 ngày | FE | 6.4 |

### 7. Probation Management (7 ngày) — REQ-020, REQ-021, REQ-022, REQ-023, REQ-024, REQ-025, REQ-026
| ID | Task | Effort | Skill | Dependency |
|---|---|---|---|---|
| 7.1 | Probation + ProbationEvaluation model + migration | 0.5 ngày | DB | 1.5 |
| 7.2 | ProbationRepository | 0.5 ngày | BE | 7.1 |
| 7.3 | ProbationService (evaluate + approve) | 2 ngày | BE | 7.2 |
| 7.4 | ProbationController + routes + validators | 1 ngày | BE | 7.3 |
| 7.5 | RecruiterProbationPage (list + export) | 2 ngày | FE | 7.4 |
| 7.6 | ProbationerDashboard (read-only) | 1 ngày | FE | 7.4 |

### 8. Reporting & Dashboard (5 ngày) — REQ-027, REQ-028
| ID | Task | Effort | Skill | Dependency |
|---|---|---|---|---|
| 8.1 | Dashboard components (Recharts) | 2 ngày | FE | 3.3, 4.4, 5.4, 6.4, 7.4 |
| 8.2 | RecruiterReportsPage | 1.5 ngày | FE | 8.1 |
| 8.3 | DirectorReportsPage | 1 ngày | FE | 8.1 |
| 8.4 | ReportPDF component | 0.5 ngày | FE | 8.1 |

### 9. Testing & QA (5 ngày)
| ID | Task | Effort | Skill | Dependency |
|---|---|---|---|---|
| 9.1 | Unit tests (services + validators) | 2 ngày | BE + FE | All |
| 9.2 | Integration tests (API endpoints) | 1.5 ngày | BE | All |
| 9.3 | E2E tests (critical flows) | 1 ngày | FE | All |
| 9.4 | Bug fixes + regression | 0.5 ngày | All | 9.1-9.3 |

---

# DOC 7.5-B: Implementation Schedule

## Sprint Plan (2-week sprints)

### Sprint 1: Foundation (Week 1-2)
| Task | Priority | Status |
|---|---|---|
| Project setup + tooling | P0 | ✅ |
| Database schema (all models) | P0 | ✅ |
| Auth (login, JWT, roles) | P0 | ✅ |
| Layout (Header, Sidebar, Router) | P0 | ✅ |

### Sprint 2: Core Features (Week 3-4)
| Task | Priority | Status |
|---|---|---|
| Job CRUD (FE + BE) | P0 | ✅ |
| Job detail public page | P0 | ✅ |
| Application submit (public) | P0 | ✅ |
| Candidate screening (list + shortlist/reject) | P0 | ✅ |
| Email service (confirm + reject) | P0 | ✅ |

### Sprint 3: Interview + Offer (Week 5-6)
| Task | Priority | Status |
|---|---|---|
| Interview schedule + conflict check | P0 | ✅ |
| Interview evaluation + scoring | P0 | ✅ |
| Offer creation + approval flow | P0 | ✅ |
| Offer response (public token) | P0 | ✅ |
| Auto-create Probationer account | P0 | ✅ |

### Sprint 4: Probation + Reports (Week 7-8)
| Task | Priority | Status |
|---|---|---|
| Probation management (list + evaluate) | P0 | ✅ |
| Probation evaluation approval | P0 | ✅ |
| Dashboard (per role) | P1 | ✅ |
| Reports + charts | P1 | ✅ |
| PDF/Excel export | P2 | ✅ |

### Sprint 5: Polish + Testing (Week 9-10)
| Task | Priority | Status |
|---|---|---|
| Unit tests | P0 | ✅ |
| Integration tests | P0 | ✅ |
| Bug fixes | P0 | ✅ |
| UI polish + responsive | P2 | ✅ |

## Dependency Diagram

```
Sprint 1: Database ──→ Auth ──→ Layout
              │
Sprint 2:     ├── Job CRUD ──→ Application ──→ Candidate Screening
              │                    │
Sprint 3:     │              Interview ──→ Offer ──→ Offer Response
              │                              │
Sprint 4:     │                         Probation ──→ Dashboard/Reports
              │
Sprint 5: Tests ──→ Bug Fixes ──→ Deploy
```

### Critical Path
```
Database Setup → Auth → Job CRUD → Application → Interview → Offer → Probation
(8 weeks - Sprint 1 to Sprint 4)
```

---

# DOC 7.5-C: Risk Register

| ID | Risk | Likelihood | Impact | Score | Mitigation | Contingency | Owner |
|---|---|---|---|---|---|---|---|
| R01 | Cloudinary config phức tạp (file upload) | Medium | High | 9 | Spike test upload flow ngay Sprint 2 | Fallback: lưu file local tạm thời | BE Dev |
| R02 | JWT secret/security lỗ hổng | Low | High | 5 | Dùng env validation (Zod), secret ≥32 ký tự | Reset secrets, force logout all users | BE Dev |
| R03 | Rate limit chặn request chính đáng | Medium | Medium | 6 | Config rate limit phù hợp, test trước | Tăng limit hoặc whitelist IP | BE Dev |
| R04 | Conflict check interview sai logic | Medium | High | 9 | Unit test kỹ thuật toán check conflict (Edge cases) | Fix + patch ngay | BE Dev |
| R05 | Email service (Resend) không gửi được | Medium | High | 9 | Retry 3 lần + log error | Thông báo manual qua UI | BE Dev |
| R06 | Token Offer bị lộ | Low | High | 5 | Token 256-bit, không log | Revoke token, tạo lại Offer | All |
| R07 | Performance khi nhiều ứng viên cùng nộp hồ sơ | Low | Medium | 3 | Index database, pagination | Scale database | DB Dev |
| R08 | UI không responsive trên mobile | Medium | Low | 3 | Dùng Tailwind responsive classes | Fix từng page | FE Dev |

### Risk Score Matrix
```
High Impact + High Likelihood = Critical (cần mitigation ngay)
High Impact + Low Likelihood = Monitor (theo dõi định kỳ)
Low Impact + Any = Accept (chấp nhận rủi ro)
```

### Risk Review
- **Frequency:** Mỗi sprint review
- **Owner:** Tech Lead
- **Update:** Status được cập nhật sau mỗi sprint
