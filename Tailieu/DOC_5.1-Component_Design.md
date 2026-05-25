# DOC 5.1-A: Component Diagram

## 1. Component Hierarchy

```
Recruitment Management System
│
├── 1. Authentication System
│   ├── LoginPage          (Presentation)
│   ├── AuthContext        (State Management)
│   ├── AuthService        (API Client)
│   ├── AuthController     (Backend API)
│   ├── AuthService        (Business Logic)
│   └── AuthMiddleware     (JWT Verification)
│
├── 2. Job Management
│   ├── JobDetailPage      (Presentation - Public)
│   ├── RecruiterJobsPage  (Presentation - Recruiter)
│   ├── JobService         (API Client)
│   ├── JobController      (Backend API)
│   ├── JobService         (Business Logic)
│   ├── JobValidator       (Input Validation)
│   └── JobRepository      (Data Access)
│
├── 3. Application Management
│   ├── RecruiterCandidatesPage (Presentation)
│   ├── ApplicationService      (API Client)
│   ├── ApplicationService      (Business Logic)
│   ├── ApplicationController   (Backend API)
│   ├── ApplicationValidator    (Input Validation)
│   ├── ApplicationRepository   (Data Access)
│   └── UploadMiddleware        (CV File Upload)
│
├── 4. Interview Management
│   ├── ManagerInterviewsPage   (Presentation)
│   ├── ManagerReviewsPage      (Presentation)
│   ├── InterviewService        (API Client)
│   ├── InterviewController     (Backend API)
│   ├── InterviewService        (Business Logic)
│   ├── InterviewValidator      (Input Validation)
│   ├── InterviewRepository     (Data Access)
│   └── EmailService            (Notification)
│
├── 5. Offer Management
│   ├── RecruiterOffersPage     (Presentation)
│   ├── OfferResponsePage       (Presentation - Public)
│   ├── DirectorApprovalsPage   (Presentation)
│   ├── OfferService            (API Client)
│   ├── OfferResponseService    (API Client)
│   ├── OfferController         (Backend API)
│   ├── OfferService            (Business Logic)
│   ├── OfferValidator          (Input Validation)
│   ├── OfferRepository         (Data Access)
│   └── EmailService            (Notification)
│
├── 6. Probation Management
│   ├── RecruiterProbationPage  (Presentation)
│   ├── ProbationerPage         (Presentation)
│   ├── ProbationService        (API Client)
│   ├── ProbationController     (Backend API)
│   ├── ProbationService        (Business Logic)
│   ├── ProbationValidator      (Input Validation)
│   ├── ProbationRepository     (Data Access)
│   └── EmailService            (Notification)
│
├── 7. Reporting System
│   ├── RecruiterReportsPage    (Presentation)
│   ├── DirectorReportsPage     (Presentation)
│   ├── DashboardPages          (Presentation - Per Role)
│   ├── ReportPDF               (PDF Generation)
│   └── ReportService           (Data Aggregation)
│
├── 8. User Management
│   ├── UserController          (Backend API)
│   ├── UserService             (Business Logic)
│   ├── UserValidator           (Input Validation)
│   └── UserRepository          (Data Access)
│
├── 9. Shared Infrastructure
│   ├── Layout Components       (Header, Sidebar, Footer)
│   ├── UI Components           (Button, Table, Dialog, Tabs...)
│   ├── ProtectedRoute          (Role-based Route Guard)
│   ├── AxiosClient             (Axios Instance + Interceptors)
│   ├── Router Configuration    (React Router)
│   ├── Types & Constants
│   ├── ErrorHandler            (Global Error Middleware)
│   └── RateLimiter             (Rate Limiting Middleware)
│
└── 10. External Dependencies
    ├── PostgreSQL Database     (via Prisma ORM)
    ├── Cloudinary              (CV File Storage)
    └── Resend                  (Email Service)
```

## 2. Component Diagram

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER (Frontend)                          │
│                                                                               │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  Public  │  │  Recruiter   │  │  Manager   │  │  Director  │             │
│  │  Pages   │  │  Pages       │  │  Pages     │  │  Pages     │             │
│  └────┬─────┘  └──────┬───────┘  └─────┬──────┘  └─────┬──────┘             │
│       │               │                │               │                    │
│  ┌────┴───────────────┴────────────────┴───────────────┴──────────────┐     │
│  │                    ProtectedRoute (Role Guard)                       │     │
│  └────┬───────────────────────────────────────────────────────────────┘     │
│       │                                                                      │
│  ┌────┴───────────────────────────────────────────────────────────────┐     │
│  │              Layout Components (Header, Sidebar, Footer)             │     │
│  └────┬───────────────────────────────────────────────────────────────┘     │
│       │                                                                      │
│  ┌────┴───────────────────────────────────────────────────────────────┐     │
│  │              Shared UI Components (shadcn/ui + Radix)                │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │              Frontend Services (API Client Layer)                      │    │
│  │  ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐                   │    │
│  │  │ Auth │ Job  │ App  │ Intv │ Offer│ Prob │User  │                   │    │
│  │  └──────┴──────┴──────┴──────┴──────┴──────┴──────┘                   │    │
│  │  ┌────────────────────────────────────────────────────────────────────┐│    │
│  │  │              Axios Client (Base URL, Interceptors, Token)           ││    │
│  │  └────────────────────────────────────────────────────────────────────┘│    │
│  └──────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────┬────────────────────────────────────────────────┘
                               │ HTTP REST API
┌──────────────────────────────▼────────────────────────────────────────────────┐
│                        APPLICATION LAYER (Backend)                            │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐     │
│  │              Routes + Controllers                                      │     │
│  │  ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐                   │     │
│  │  │ Auth │ Job  │ App  │ Intv │ Offer│ Prob │ User │                   │     │
│  │  └──────┴──────┴──────┴──────┴──────┴──────┴──────┘                   │     │
│  └──────────────────────────────────────────────────────────────────────┘     │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐     │
│  │              Middleware Chain                                           │     │
│  │  ┌──────────┬────────────┬────────────┬──────────────┐                │     │
│  │  │JWT Auth  │Error       │Rate        │Validators    │                │     │
│  │  │Middleware│Handler     │Limiter     │(Zod)         │                │     │
│  │  └──────────┴────────────┴────────────┴──────────────┘                │     │
│  └──────────────────────────────────────────────────────────────────────┘     │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐     │
│  │              Service Layer (Business Logic)                            │     │
│  │  ┌──────┬──────┬──────┬──────┬──────┬──────┬──────────┐              │     │
│  │  │ Auth │ Job  │ App  │ Intv │ Offer│ Prob │  Email   │              │     │
│  │  └──────┴──────┴──────┴──────┴──────┴──────┴──────────┘              │     │
│  └──────────────────────────────────────────────────────────────────────┘     │
└──────────────────────────────┬────────────────────────────────────────────────┘
                               │
┌──────────────────────────────▼────────────────────────────────────────────────┐
│                         DATA ACCESS LAYER                                      │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐     │
│  │              Repositories (Prisma ORM)                                │     │
│  │  ┌──────┬──────┬──────┬──────┬──────┬──────┐                         │     │
│  │  │ User │ Job  │ App  │ Intv │ Offer│ Prob │                         │     │
│  │  └──────┴──────┴──────┴──────┴──────┴──────┘                         │     │
│  └──────────────────────────────────────────────────────────────────────┘     │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐     │
│  │              External Dependencies                                     │     │
│  │     ┌────────────┐    ┌────────────┐    ┌───────────────┐            │     │
│  │     │ PostgreSQL │    │ Cloudinary │    │    Resend     │            │     │
│  │     │ (Database) │    │(File Store)│    │(Email Service)│            │     │
│  │     └────────────┘    └────────────┘    └───────────────┘            │     │
│  └──────────────────────────────────────────────────────────────────────┘     │
└───────────────────────────────────────────────────────────────────────────────┘
```

## 3. Component Catalog

| # | Component Name | Layer | Responsibility | Public Interface | Dependencies |
|---|---|---|---|---|---|
| 1 | **LoginPage** | Presentation | Render login form, handle authentication | `-` | AuthContext, AuthService, react-hook-form, zod |
| 2 | **RecruiterJobsPage** | Presentation | CRUD job postings for Recruiter | `-` | JobService, AuthContext, shadcn/Table |
| 3 | **RecruiterCandidatesPage** | Presentation | View, filter, shortlist/reject candidates | `-` | ApplicationService, CandidateService, shadcn/Table |
| 4 | **RecruiterOffersPage** | Presentation | Create/view offers | `-` | OfferService, ApplicationService |
| 5 | **RecruiterProbationPage** | Presentation | Manage probation list, export Excel | `-` | ProbationService |
| 6 | **RecruiterReportsPage** | Presentation | Recruitment analytics dashboard | `-` | ApplicationService, OfferService, JobService, Recharts |
| 7 | **ManagerInterviewsPage** | Presentation | View interview schedule | `-` | InterviewService |
| 8 | **ManagerReviewsPage** | Presentation | Score and review interviews | `-` | InterviewService, ApplicationService |
| 9 | **DirectorApprovalsPage** | Presentation | Approve/reject offers + probation evaluations | `-` | OfferService, ProbationService |
| 10 | **DirectorReportsPage** | Presentation | Executive reports | `-` | ApplicationService, OfferService, ProbationService, Recharts |
| 11 | **ProbationerPage** | Presentation | View own probation info (read-only) | `-` | ProbationService, AuthContext |
| 12 | **JobDetailPage** | Presentation | Public job detail + application form | `-` | JobService, ApplicationService |
| 13 | **OfferResponsePage** | Presentation | Public offer accept/decline | `-` | OfferResponseService |
| 14 | **AuthContext** | State Mgmt | Manage auth state, token, role | `login(), logout(), isAuthenticated()` | AuthService |
| 15 | **ProtectedRoute** | Routing | Guard routes by user role | `checkAccess(role)` | AuthContext, React Router |
| 16 | **AuthService (FE)** | API Client | Auth API calls | `login(), forgotPassword()` | AxiosClient |
| 17 | **JobService (FE)** | API Client | Job API calls | `getJobs(), createJob(), updateJob(), closeJob()` | AxiosClient |
| 18 | **ApplicationService (FE)** | API Client | Application API calls | `getApplications(), apply(), shortlist(), reject()` | AxiosClient |
| 19 | **InterviewService (FE)** | API Client | Interview API calls | `getInterviews(), schedule(), score()` | AxiosClient |
| 20 | **OfferService (FE)** | API Client | Offer API calls | `getOffers(), createOffer()` | AxiosClient |
| 21 | **OfferResponseService (FE)** | API Client | Public offer response | `getOfferByToken(), respondToOffer()` | AxiosClient |
| 22 | **ProbationService (FE)** | API Client | Probation API calls | `getProbations(), exportExcel()` | AxiosClient |
| 23 | **AxiosClient** | API Client | HTTP client with interceptors | `get(), post(), put(), patch()` | Axios |
| 24 | **Layout Components** | Presentation | Page shell (Header, Sidebar, Footer) | `-` | AuthContext, shadcn/ui |
| 25 | **Shared UI Components** | Presentation | Reusable Button, Table, Dialog, Tabs, Card... | `-` | Radix UI, tailwind-merge |
| 26 | **ReportPDF** | Presentation | Generate PDF reports | `generateReport(data)` | @react-pdf/renderer |
| 27 | **AuthController** | Controller | Auth REST endpoints | `POST /auth/login` | AuthService (BE), AuthValidator |
| 28 | **JobController** | Controller | Job REST endpoints | `GET/POST /jobs, PUT /jobs/:id` | JobService (BE), JobValidator |
| 29 | **ApplicationController** | Controller | Application REST endpoints | `GET/POST /applications, PATCH /applications/:id` | ApplicationService (BE), UploadMiddleware |
| 30 | **InterviewController** | Controller | Interview REST endpoints | `GET/POST /interviews, PATCH /interviews/:id` | InterviewService (BE), InterviewValidator |
| 31 | **OfferController** | Controller | Offer REST endpoints | `GET/POST /offers, PATCH /offers/:id` | OfferService (BE), OfferValidator |
| 32 | **ProbationController** | Controller | Probation REST endpoints | `GET/POST /probations, PATCH /probations/:id` | ProbationService (BE), ProbationValidator |
| 33 | **UserController** | Controller | User REST endpoints | `GET /users` | UserService (BE) |
| 34 | **JwtAuthMiddleware** | Middleware | Verify JWT token from request | `authenticate(req, res, next)` | jsonwebtoken |
| 35 | **ErrorHandler** | Middleware | Global error handling | `handleError(err, req, res, next)` | AppError |
| 36 | **RateLimiter** | Middleware | Rate limit API requests | `rateLimit(req, res, next)` | express-rate-limit |
| 37 | **AuthService (BE)** | Business Logic | Auth business logic | `login(), verifyToken(), forgotPassword()` | UserRepository, CryptoUtils, EmailService |
| 38 | **JobService (BE)** | Business Logic | Job business logic | `createJob(), updateJob(), closeJob()` | JobRepository |
| 39 | **ApplicationService (BE)** | Business Logic | Application business logic | `apply(), shortlist(), reject()` | ApplicationRepository, Cloudinary, EmailService |
| 40 | **InterviewService (BE)** | Business Logic | Interview business logic | `schedule(), checkConflict(), score()` | InterviewRepository, EmailService |
| 41 | **OfferService (BE)** | Business Logic | Offer business logic | `createOffer(), approveOffer(), respond()` | OfferRepository, UserRepository, EmailService |
| 42 | **ProbationService (BE)** | Business Logic | Probation business logic | `evaluate(), approveEvaluation()` | ProbationRepository, EmailService |
| 43 | **EmailService** | Business Logic | Send all email notifications | `sendApplicationConfirm(), sendInterviewInvite()`, `sendOfferEmail(), sendProbationResult()` | Resend |
| 44 | **JobRepository** | Data Access | Job DB operations | `findAll(), findById(), create(), update()` | PrismaClient |
| 45 | **ApplicationRepository** | Data Access | Application DB operations | `findAll(), findById(), create(), updateStatus()` | PrismaClient |
| 46 | **InterviewRepository** | Data Access | Interview DB operations | `findAll(), findById(), create(), update()` | PrismaClient |
| 47 | **OfferRepository** | Data Access | Offer DB operations | `findAll(), findById(), create(), update()` | PrismaClient |
| 48 | **ProbationRepository** | Data Access | Probation DB operations | `findAll(), findById(), create(), update()` | PrismaClient |
| 49 | **UserRepository** | Data Access | User DB operations | `findByEmail(), findById(), create()` | PrismaClient |

## 4. External Dependencies

| External System | Purpose | Used By |
|---|---|---|
| **PostgreSQL** | Primary database | All Repositories (via Prisma ORM) |
| **Cloudinary** | CV file storage | UploadMiddleware, ApplicationService |
| **Resend** | Email delivery | EmailService (notifications, reminders) |

---

# DOC 5.1-B: Component Responsibility Matrix

## 1. Requirements Coverage Matrix

| Component | REQ-001 | REQ-002 | REQ-003 | REQ-004 | REQ-005 | REQ-006 | REQ-007 | REQ-008 | REQ-009 | REQ-010 | REQ-011 | REQ-012 | REQ-013 | REQ-014 | REQ-015 | REQ-016 | REQ-017 | REQ-018 | REQ-019 | REQ-020 | REQ-021 | REQ-022 | REQ-023 | REQ-024 | REQ-025 | REQ-026 | REQ-027 | REQ-028 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Presentation** | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| LoginPage | ✓ | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| RecruiterJobsPage | | | | ✓ | ✓ | | | | | | | | | | | | | | | | | | | | | | | |
| RecruiterCandidatesPage | | | | | | | | ✓ | ✓ | ✓ | | | | | | | | | | | | | | | | | | |
| RecruiterOffersPage | | | | | | | | | | | | | | | ✓ | | | | | | | | | | | | | |
| RecruiterProbationPage | | | | | | | | | | | | | | | | | | | | ✓ | ✓ | | | | | | | |
| RecruiterReportsPage | | | | | | | | | | | | | | | | | | | | | | | | | | | ✓ | |
| ManagerInterviewsPage | | | | | | | | | | | ✓ | | | | | | | | | | | | | | | | | |
| ManagerReviewsPage | | | | | | | | | | | | | | ✓ | | | | | | | | | | | | | | |
| DirectorApprovalsPage | | | | | | | | | | | | | | | | ✓ | | | | | | | | ✓ | | | | |
| DirectorReportsPage | | | | | | | | | | | | | | | | | | | | | | | | | | | | ✓ |
| ProbationerPage | | | | | | | | | | | | | | | | | | | | | | | | | | ✓ | | |
| JobDetailPage | | | | | | ✓ | | | | | | | | | | | | | | | | | | | | | | |
| OfferResponsePage | | | | | | | | | | | | | | | | | | ✓ | | | | | | | | | | |
| **API Client (FE)** | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| AuthService (FE) | ✓ | ✓ | ✓ | | | | | | | | | | | | | | | | | | | | | | | | | |
| JobService (FE) | | | | ✓ | ✓ | ✓ | | | | | | | | | | | | | | | | | | | | | | |
| ApplicationService (FE) | | | | | | ✓ | | ✓ | ✓ | ✓ | | | | | | | | | | | | | | | | | | |
| InterviewService (FE) | | | | | | | | | | | ✓ | ✓ | ✓ | ✓ | | | | | | | | | | | | | | |
| OfferService (FE) | | | | | | | | | | | | | | | ✓ | ✓ | | | | | | | | | | | | |
| ProbationService (FE) | | | | | | | | | | | | | | | | | | | | ✓ | ✓ | | | | | | | |
| **Controller (BE)** | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| AuthController | ✓ | ✓ | ✓ | | | | | | | | | | | | | | | | | | | | | | | | | |
| JobController | | | | ✓ | ✓ | | | | | | | | | | | | | | | | | | | | | | | |
| ApplicationController | | | | | | ✓ | | ✓ | ✓ | ✓ | | | | | | | | | | | | | | | | | | |
| InterviewController | | | | | | | | | | | ✓ | ✓ | ✓ | ✓ | | | | | | | | | | | | | | |
| OfferController | | | | | | | | | | | | | | | ✓ | ✓ | ✓ | ✓ | | | | | | | | | | |
| ProbationController | | | | | | | | | | | | | | | | | | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | |
| **Service (BE)** | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| AuthService (BE) | ✓ | ✓ | ✓ | | | | | | | | | | | | | | | | | | | | | | | | | |
| JobService (BE) | | | | ✓ | ✓ | | | | | | | | | | | | | | | | | | | | | | | |
| ApplicationService (BE) | | | | | | ✓ | ✓ | | ✓ | ✓ | | | | | | | | | | | | | | | | | | |
| InterviewService (BE) | | | | | | | | | | | ✓ | ✓ | | | | | | | | | | | | | | | | |
| OfferService (BE) | | | | | | | | | | | | | | | ✓ | ✓ | ✓ | ✓ | ✓ | | | | | | | | | |
| ProbationService (BE) | | | | | | | | | | | | | | | | | | | | ✓ | | ✓ | ✓ | ✓ | ✓ | | | |
| EmailService | | | | | | | ✓ | | | ✓ | | ✓ | | | | ✓ | ✓ | | ✓ | | | ✓ | | | ✓ | | | |
| **Repository** | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
| JobRepository | | | | ✓ | ✓ | | | | | | | | | | | | | | | | | | | | | | | |
| ApplicationRepository | | | | | | ✓ | | ✓ | ✓ | ✓ | | | | | | | | | | | | | | | | | | |
| InterviewRepository | | | | | | | | | | | ✓ | ✓ | | ✓ | | | | | | | | | | | | | | |
| OfferRepository | | | | | | | | | | | | | | | ✓ | ✓ | | ✓ | | | | | | | | | | |
| ProbationRepository | | | | | | | | | | | | | | | | | | | | ✓ | | | ✓ | ✓ | | ✓ | | |
| UserRepository | ✓ | | | | | | | | | | | | | | | | | | ✓ | | | | | | | | | |

## 2. Coverage Summary

| Metric | Result |
|---|---|
| Total functional requirements | 28 (REQ-001 to REQ-028) |
| Requirements covered | 28/28 (100%) |
| Total components | 49 |
| Architecture layers | Presentation → API Client → Controller → Service → Repository |

## 3. High-Complexity Components (Flagged)

| Component | Requirements | Risk Reason |
|---|---|---|
| **ApplicationService (BE)** | 4 (006, 007, 009, 010) | File upload + email + status transitions |
| **OfferService (BE)** | 5 (015, 016, 017, 018, 019) | Multi-step workflow, public token response |
| **ProbationService (BE)** | 5 (020, 022, 023, 024, 025) | Reminder scheduling + evaluation approval chain |
| **EmailService** | 7 (007, 010, 012, 017, 018, 022, 025) | Cross-cutting integration with 5 modules |
