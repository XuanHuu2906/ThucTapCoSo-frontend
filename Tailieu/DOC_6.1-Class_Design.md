# DOC 6.1-A: Detailed Class Diagrams

## 1. Class Diagram Overview

### Package Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  thuctapcoso (Recruitment Management System)                                │
│                                                                             │
│  ┌─────────────────────┐    ┌──────────────────────────────────────────┐   │
│  │  frontend/           │    │  backend/                                │   │
│  │  (React + TS)        │    │  (Express + TS)                          │   │
│  │─────────────────────│    │──────────────────────────────────────────│   │
│  │  pages/              │    │  controllers/     (REST endpoints)       │   │
│  │  components/         │    │  services/        (Business logic)       │   │
│  │  services/           │    │  repositories/    (Data access)          │   │
│  │  context/            │    │  middleware/      (Auth, upload, etc)    │   │
│  │  hooks/              │    │  validators/      (Zod schemas)          │   │
│  │  types/              │    │  routes/          (Route definitions)    │   │
│  │  routes/             │    │  types/           (DTOs, interfaces)     │   │
│  │  lib/                │    │  config/          (Env, CORS)            │   │
│  │  utils/              │    │  utils/           (Crypto, helpers)      │   │
│  └─────────────────────┘    └──────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Database (PostgreSQL via Prisma)                                     │  │
│  │  Models: User, Candidate, JobPosting, Application, Interview,         │  │
│  │          Offer, Probation, ProbationEvaluation                        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Class Diagrams by Component

### 2.1 Authentication Component

```
┌──────────────────────────────┐     ┌──────────────────────────────────┐
│  <<component>>               │     │  <<component>>                   │
│  AuthContext                  │     │  LoginPage                       │
│  (React Context)              │     │  (React Page)                    │
│──────────────────────────────│     │──────────────────────────────────│
│  - user: User | null         │────▶│  + render(): ReactNode           │
│  - token: string | null      │     └──────────┬───────────────────────┘
│  - isLoading: boolean        │                │
│──────────────────────────────│                │
│  + login(payload): User      │                ▼
│  + logout(): void            │     ┌──────────────────────────────────┐
│  + refreshMe(): User | null  │     │  <<service>>                     │
│  + isAuthenticated(): boolean│     │  AuthService (FE)                │
│  ──────────────────────────  │     │──────────────────────────────────│
│  This context manages auth   │────▶│  + login(payload): AuthResponse  │
│  state across the app        │     │  + register(payload): AuthResponse│
└──────────────────────────────┘     │  + getMe(): User                 │
                                     │  + logout(): void                │
                                     └──────────┬───────────────────────┘
                                                │ HTTP
                                                ▼
                ┌──────────────────────────────────────────────────────┐
                │  <<controller>>   AuthController (BE)                │
                │──────────────────────────────────────────────────────│
                │  + register(req, res, next): Promise<void>           │
                │  + login(req, res, next): Promise<void>              │
                │  + getMe(req, res, next): Promise<void>              │
                └──────────────────────┬───────────────────────────────┘
                                       │
                ┌──────────────────────▼───────────────────────────────┐
                │  <<service>>   AuthService (BE)                      │
                │──────────────────────────────────────────────────────│
                │  + register(data: RegisterDTO): Promise<User>        │
                │  + login(data: LoginDTO): Promise<AuthResult>        │
                │  + getMe(userId: number): Promise<User>              │
                └──────────────────────┬───────────────────────────────┘
                                       │
                ┌──────────────────────▼───────────────────────────────┐
                │  <<repository>>   UserRepository                     │
                │──────────────────────────────────────────────────────│
                │  + findByEmail(email: string): Promise<User | null>  │
                │  + findById(id: number): Promise<User | null>        │
                │  + create(data: CreateUserDTO): Promise<User>        │
                └──────────────────────────────────────────────────────┘
```

### 2.2 Job Management Component

```
┌──────────────────────────────┐    ┌──────────────────────────────────┐
│  <<page>>                    │    │  <<page>>                        │
│  RecruiterJobsPage           │    │  JobDetailPage (Public)          │
│──────────────────────────────│    │──────────────────────────────────│
│  + render(): ReactNode       │    │  + render(): ReactNode           │
│  ── CRUD quản lý tin tuyển   │    │  ── Hiển thị chi tiết tin + form │
└──────────┬───────────────────┘    └──────────┬───────────────────────┘
           │                                   │
           └──────────────┬────────────────────┘
                          │
              ┌───────────▼───────────────┐
              │  <<service>>  JobService  │
              │  (FE)                     │
              │───────────────────────────│
              │  + getJobs(filters): Job[]│
              │  + getJobById(id): Job    │
              │  + createJob(data): Job   │
              │  + updateJob(id, data): Job│
              │  + updateJobStatus(id): Job│
              │  + deleteJob(id): void    │
              └───────────┬───────────────┘
                          │ HTTP
              ┌───────────▼───────────────┐
              │  <<controller>>           │
              │  JobController (BE)       │
              │───────────────────────────│
              │  + getJobs(req, res, next) │
              │  + getJobById(req, res)    │
              │  + createJob(req, res)     │
              │  + updateJob(req, res)     │
              │  + updateJobStatus(req,res)│
              │  + deleteJob(req, res)     │
              └───────────┬───────────────┘
                          │
              ┌───────────▼───────────────┐
              │  <<service>>  JobService  │
              │  (BE)                     │
              │───────────────────────────│
              │  + getJobs(filters): Job[]│
              │  + getJobById(id): Job    │
              │  + createJob(userId, data)│
              │  + updateJob(id, data)    │
              │  + updateJobStatus(id)    │
              │  + deleteJob(id): void    │
              └───────────┬───────────────┘
                          │
              ┌───────────▼───────────────┐
              │  <<repository>>           │
              │  JobRepository            │
              │───────────────────────────│
              │  + findAll(filters): Job[]│
              │  + findById(id): Job|null │
              │  + create(data): Job      │
              │  + update(id, data): Job  │
              └───────────────────────────┘
```

### 2.3 Application Management Component

```
┌─────────────────────────────────┐
│  <<page>> RecruiterCandidatesPage│
│─────────────────────────────────│
│  + render(): ReactNode          │
│  ── View, filter, shortlist,   │
│     reject candidates           │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│  <<service>> ApplicationService │
│  (FE)                           │
│─────────────────────────────────│
│  + getApplications(filters): App│
│  + getApplicationById(id): App  │
│  + submitApplication(data): App │
│  + updateStatus(id, status): App│
└────────────┬────────────────────┘
             │ HTTP (multipart)
┌────────────▼────────────────────┐
│  <<controller>>                 │
│  ApplicationController (BE)     │
│─────────────────────────────────│
│  + getApplications(req, res)    │
│  + getApplicationById(req, res) │
│  + submitApplication(req, res)  │
│  + updateApplicationStatus(req) │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│  <<service>> ApplicationService │
│  (BE)                           │
│─────────────────────────────────│
│  + getApplications(filters)     │
│  + getApplicationById(id)       │
│  + submitApplication(data)      │
│  + updateStatus(id, status, uid)│
└────────────┬──────────┬─────────┘
             │          │
┌────────────▼──┐  ┌────▼──────────┐
│  <<repo>>     │  │  <<middleware>>│
│  AppRepository│  │  UploadMW     │
│───────────────│  │───────────────│
│  + findAll()  │  │ single('cv')  │
│  + findById() │  │ fileFilter    │
│  + create()   │  │ limits: 5MB  │
│  + update()   │  └──────────────┘
└───────────────┘
```

### 2.4 Interview Management Component

```
┌──────────────────────────┐    ┌──────────────────────────┐
│  <<page>>                │    │  <<page>>                │
│  ManagerInterviewsPage   │    │  ManagerReviewsPage      │
│──────────────────────────│    │──────────────────────────│
│  + render(): ReactNode   │    │  + render(): ReactNode   │
└────────┬─────────────────┘    └────────┬─────────────────┘
         │                               │
         └───────────────┬───────────────┘
                         │
              ┌──────────▼──────────────┐
              │  <<service>>            │
              │  InterviewService (FE)  │
              │─────────────────────────│
              │  + getInterviews(): I[] │
              │  + schedule(data): I    │
              │  + confirm(id, status)  │
              │  + evaluate(id, data)   │
              └──────────┬──────────────┘
                         │ HTTP
              ┌──────────▼──────────────┐
              │  <<controller>>         │
              │  InterviewController    │
              │─────────────────────────│
              │  + getInterviews(req)   │
              │  + getById(req)         │
              │  + schedule(req)        │
              │  + update(req)          │
              │  + confirm(req)         │
              │  + evaluate(req)        │
              │  + delete(req)          │
              └──────────┬──────────────┘
                         │
              ┌──────────▼──────────────┐
              │  <<service>>            │
              │  InterviewService (BE)  │
              │─────────────────────────│
              │  + getInterviews(filt)  │
              │  + getById(id)          │
              │  + schedule(data)       │
              │  + checkConflict(id,dt) │
              │  + confirm(id, uid,...) │
              │  + evaluate(id, uid,...)│
              └──────────┬──────────────┘
                         │
              ┌──────────▼──────────────┐
              │  <<repository>>         │
              │  InterviewRepository    │
              │─────────────────────────│
              │  + findAll(filters)     │
              │  + findById(id)         │
              │  + create(data)         │
              │  + update(id, data)     │
              │  + findByDate(uid,dt)   │
              └─────────────────────────┘
```

### 2.5 Offer Management Component

```
┌────────────────────┐  ┌────────────────────┐  ┌──────────────────────┐
│  <<page>>          │  │  <<page>>          │  │  <<page>>            │
│  RecruiterOffers   │  │  DirectorApprovals │  │  OfferResponsePage   │
│────────────────────│  │────────────────────│  │──────────────────────│
│  + render()        │  │  + render()        │  │  + render() (Public) │
└────────┬───────────┘  └────────┬───────────┘  └────────┬─────────────┘
         │                       │                        │
         │       ┌───────────────┘                        │
         │       │                                        │
┌────────▼───────▼───────┐              ┌─────────────────▼──────────┐
│  <<service>>           │              │  <<service>>               │
│  OfferService (FE)     │              │  OfferResponseService (FE) │
│────────────────────────│              │────────────────────────────│
│  + getOffers(): Offer[]│              │  + getByToken(tk): Offer   │
│  + createOffer(data)   │              │  + accept(token): void     │
│  + approve(id, data)   │              │  + decline(token, reason)  │
│  + updateStatus(id)    │              └─────────────────────────────┘
└────────┬───────────────┘
         │ HTTP
┌────────▼──────────────────────────────────────────────────────────┐
│  <<controller>>  OfferController (BE)                              │
│───────────────────────────────────────────────────────────────────│
│  + getOffers(req, res)        │  + getOfferByToken(req, res)      │
│  + getOfferById(req, res)     │  + acceptOfferByToken(req, res)   │
│  + createOffer(req, res)      │  + declineOfferByToken(req, res)  │
│  + updateOffer(req, res)      │                                    │
│  + approveOffer(req, res)     │  ── Public (UC-10)                │
│  + updateOfferStatus(req)     │                                    │
│  + deleteOffer(req, res)      │                                    │
└───────────────────────────────┬────────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────┐
│  <<service>>  OfferService (BE)                                     │
│───────────────────────────────────────────────────────────────────│
│  + getOffers(filters)         │  + getOfferByToken(token)          │
│  + getOfferById(id)           │  + respondToOffer(token, action)   │
│  + createOffer(userId, data)  │  + generateDecisionToken(): string │
│  + updateOffer(id, data)      │                                    │
│  + approveOffer(id, uid, st)  │                                    │
│  + updateOfferStatus(id, st)  │                                    │
└───────────────────────────────┬────────────────────────────────────┘
                                │
                    ┌───────────▼──────────────┐
                    │  <<repository>>          │
                    │  OfferRepository          │
                    │──────────────────────────│
                    │  + findAll(filters)      │
                    │  + findById(id)          │
                    │  + findByToken(token)    │
                    │  + create(data)          │
                    │  + update(id, data)      │
                    └──────────────────────────┘
```

### 2.6 Probation Management Component

```
┌────────────────────────┐  ┌────────────────────────┐
│  <<page>>              │  │  <<page>>              │
│  RecruiterProbationPage│  │  ProbationerDashboard  │
│────────────────────────│  │────────────────────────│
│  + render(): ReactNode │  │  + render(): ReactNode │
└────────┬───────────────┘  └────────┬───────────────┘
         │                           │
         └───────────┬───────────────┘
                     │
          ┌──────────▼──────────────┐
          │  <<service>>            │
          │  ProbationService (FE)  │
          │─────────────────────────│
          │  + getProbations(): P[] │
          │  + getProbationById(): P│
          │  + exportExcel(): Blob  │
          └──────────┬──────────────┘
                     │ HTTP
          ┌──────────▼──────────────┐
          │  <<controller>>         │
          │  ProbationController    │
          │─────────────────────────│
          │  + getProbations(req)   │
          │  + getEndingSoon(req)   │
          │  + getById(req)         │
          │  + createProbation(req) │
          │  + updateProbation(req) │
          │  + evaluateProbation(req)│
          │  + approveEvaluation(req)│
          └──────────┬──────────────┘
                     │
          ┌──────────▼──────────────┐
          │  <<service>>            │
          │  ProbationService (BE)  │
          │─────────────────────────│
          │  + getProbations(filt)  │
          │  + getEndingSoon()      │
          │  + getById(id)          │
          │  + create(data)         │
          │  + update(id, data)     │
          │  + evaluate(id, uid...) │
          │  + approveEval(id, ...) │
          └──────────┬──────────────┘
                     │
          ┌──────────▼──────────────┐
          │  <<repository>>         │
          │  ProbationRepository    │
          │─────────────────────────│
          │  + findAll(filters)     │
          │  + findById(id)         │
          │  + findEndingSoon()     │
          │  + create(data)         │
          │  + update(id, data)     │
          └─────────────────────────┘
```

### 2.7 Reporting Component

```
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐
│  <<page>>            │  │  <<page>>            │  │  <<page>>        │
│  RecruiterReports    │  │  DirectorReports     │  │  Dashboard (role)│
│──────────────────────│  │──────────────────────│  │──────────────────│
│  + render()          │  │  + render()          │  │  + render()      │
└────────┬─────────────┘  └────────┬─────────────┘  └────────┬─────────┘
         │                         │                         │
         └────────────────┬────────┴─────────────────────────┘
                          │
               ┌──────────▼───────────────┐
               │  <<component>>           │
               │  Recharts (Charts)       │
               │──────────────────────────│
               │  + BarChart, PieChart    │
               │  + LineChart             │
               └──────────────────────────┘

               ┌──────────────────────────┐
               │  <<component>>           │
               │  ReportPDF               │
               │──────────────────────────│
               │  + generateReport(data)  │
               │  ─ Sử dụng @react-pdf    │
               └──────────────────────────┘
```

### 2.8 Shared Infrastructure

```
┌─────────────────────────────────────────────────────────────────────┐
│  <<middleware>> JwtAuthMiddleware (BE)                              │
│─────────────────────────────────────────────────────────────────────│
│  + authenticate(req, res, next): extracts token, verifies, sets user│
│  + authorize(...roles): checks req.user.role against allowed roles  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  <<middleware>> ErrorHandler (BE)                                    │
│─────────────────────────────────────────────────────────────────────│
│  + handleError(err, req, res, next): catches all errors, returns    │
│    standardized { success: false, message } response                │
│  - Handles: AppError, MulterError, default errors                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  <<utility>> CryptoUtils (BE)                                       │
│─────────────────────────────────────────────────────────────────────│
│  + generateAccessToken(payload): string  (JWT sign, 15m TTL)       │
│  + generateRefreshToken(payload): string  (JWT sign, 7d TTL)       │
│  + verifyToken(token, isRefresh?): TokenPayload                     │
│  + hashPassword(password): Promise<string>   (bcrypt, salt 10)     │
│  + comparePassword(password, hash): Promise<boolean>                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  <<component>> ProtectedRoute (FE)                                  │
│─────────────────────────────────────────────────────────────────────│
│  Props: { allowedRoles: UserRole[], children: ReactNode }          │
│  Logic: checks AuthContext.isAuthenticated + role, redirects if not │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  <<component>> Layout Components (FE)                               │
│─────────────────────────────────────────────────────────────────────│
│  Header: logo, user menu, theme toggle                             │
│  Sidebar: navigation links per role (from DASHBOARD_NAV_ITEMS)     │
│  Footer: copyright                                                  │
│  DashboardLayout: Header + Sidebar + Outlet                         │
│  PublicLayout: Header + Outlet (no Sidebar)                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Class Specifications

### 3.1 Entity Classes (Prisma Models)

| Class | Stereotype | Table | Purpose |
|---|---|---|---|
| **User** | <<entity>> | User | Người dùng hệ thống |
| **Candidate** | <<entity>> | Candidate | Ứng viên |
| **JobPosting** | <<entity>> | JobPosting | Tin tuyển dụng |
| **Application** | <<entity>> | Application | Hồ sơ ứng tuyển |
| **Interview** | <<entity>> | Interview | Phỏng vấn |
| **Offer** | <<entity>> | Offer | Đề xuất Offer |
| **Probation** | <<entity>> | Probation | Thử việc |
| **ProbationEvaluation** | <<entity>> | ProbationEvaluation | Đánh giá thử việc |

### 3.2 Frontend TypeScript Types (DTOs)

| Type | Purpose | Key Fields |
|---|---|---|
| **User** | Thông tin người dùng | id, fullName, email, role, status |
| **Candidate** | Thông tin ứng viên | candidateId, fullName, email, phone |
| **Job** | Tin tuyển dụng | jobId, title, deptName, salaryRange, status |
| **Application** | Hồ sơ | appId, status, cvFile, candidate, jobPosting |
| **Interview** | Phỏng vấn | interviewId, interviewDate, type, scores, result |
| **Offer** | Offer | offerId, baseSalary, allowance, status |
| **Probation** | Thử việc | probationId, startDate, endDate, status |
| **ProbationEvaluation** | Đánh giá | kpiScore, recommendation, status |
| **LoginPayload** | DTO (request) | email, password |
| **AuthResponse** | DTO (response) | accessToken, refreshToken, user |

### 3.3 Backend DTOs

| Class | Purpose | Key Fields |
|---|---|---|
| **LoginDTO** | Login request | email, password |
| **RegisterDTO** | Registration request | fullName, email, password, role |
| **CreateJobDTO** | Create job | title, deptName, description, salaryRange... |
| **SubmitAppDTO** | Submit application | jobId, fullName, email, phone, cvFile |
| **ScheduleInterviewDTO** | Schedule interview | appId, interviewerId, interviewDate, type |
| **EvaluateInterviewDTO** | Score interview | technicalScore, softScore, attitudeScore, result |
| **CreateOfferDTO** | Create offer | appId, baseSalary, allowance, startDate |
| **ApproveOfferDTO** | Approve/reject | status, directorNote |
| **CreateProbationDTO** | Start probation | offerId, probationerId, supervisorId, dates |
| **EvaluateProbationDTO** | Evaluate | kpiScore, comment, recommendation, isSubmit |

### 3.4 Controller Classes (Backend)

| Class | Methods | Endpoints |
|---|---|---|
| **AuthController** | login, register, getMe | POST /auth/login, /register, GET /auth/me |
| **JobController** | getJobs, getJobById, createJob, updateJob, updateJobStatus, deleteJob | CRUD /jobs |
| **ApplicationController** | getApplications, getApplicationById, submitApplication, updateApplicationStatus | CRUD /applications |
| **InterviewController** | getInterviews, getInterviewById, scheduleInterview, updateInterview, confirmInterview, evaluateInterview, deleteInterview | CRUD /interviews |
| **OfferController** | getOffers, getOfferById, createOffer, updateOffer, approveOffer, updateOfferStatus, deleteOffer + getOfferByToken, acceptOfferByToken, declineOfferByToken | CRUD /offers + /offer-response/:token |
| **ProbationController** | getProbations, getEndingSoon, getProbationById, createProbation, updateProbation, evaluateProbation, approveEvaluation | CRUD /probations |
| **UserController** | (not detailed) | /users |

### 3.5 Service Classes (Backend)

| Class | Key Methods | Dependencies |
|---|---|---|
| **AuthService** | login, register, getMe | UserRepository, CryptoUtils |
| **JobService** | getJobs, getJobById, createJob, updateJob, updateJobStatus | JobRepository |
| **ApplicationService** | getApplications, getById, submitApplication, updateStatus | ApplicationRepository, Cloudinary, EmailService |
| **InterviewService** | getInterviews, getById, schedule, checkConflict, confirm, evaluate | InterviewRepository, EmailService |
| **OfferService** | getOffers, getById, createOffer, approve, respondToOffer | OfferRepository, UserRepository, EmailService |
| **ProbationService** | getProbations, getEndingSoon, getById, create, evaluate, approveEvaluation | ProbationRepository, EmailService |
| **EmailService** | sendApplicationConfirm, sendInterviewInvite, sendOfferEmail, sendProbationResult | Resend API |

### 3.6 Repository Classes

| Class | Key Methods | Return Type |
|---|---|---|
| **UserRepository** | findByEmail, findById, create | User |
| **JobRepository** | findAll, findById, create, update | JobPosting |
| **ApplicationRepository** | findAll, findById, create, updateStatus | Application |
| **InterviewRepository** | findAll, findById, create, update, findByDate | Interview |
| **OfferRepository** | findAll, findById, findByToken, create, update | Offer |
| **ProbationRepository** | findAll, findById, findEndingSoon, create, update | Probation |

---

## 4. Entity-Table Mapping

| Entity Class | Database Table | ORM |
|---|---|---|
| `User` | `User` | Prisma model `User` |
| `Candidate` | `Candidate` | Prisma model `Candidate` |
| `JobPosting` | `JobPosting` | Prisma model `JobPosting` |
| `Application` | `Application` | Prisma model `Application` |
| `Interview` | `Interview` | Prisma model `Interview` |
| `Offer` | `Offer` | Prisma model `Offer` |
| `Probation` | `Probation` | Prisma model `Probation` |
| `ProbationEvaluation` | `ProbationEvaluation` | Prisma model `ProbationEvaluation` |

---

## 5. DTO-API Mapping

| DTO Class | Direction | API Endpoint |
|---|---|---|
| `LoginDTO` | Request | `POST /api/v1/auth/login` |
| `RegisterDTO` | Request | `POST /api/v1/auth/register` |
| `CreateJobDTO` | Request | `POST /api/v1/jobs` |
| `UpdateJobDTO` | Request | `PUT /api/v1/jobs/:id` |
| `SubmitApplicationDTO` | Request | `POST /api/v1/applications` |
| `UpdateAppStatusDTO` | Request | `PATCH /api/v1/applications/:id/status` |
| `ScheduleInterviewDTO` | Request | `POST /api/v1/interviews` |
| `ConfirmInterviewDTO` | Request | `PATCH /api/v1/interviews/:id/confirm` |
| `EvaluateInterviewDTO` | Request | `PATCH /api/v1/interviews/:id/evaluate` |
| `CreateOfferDTO` | Request | `POST /api/v1/offers` |
| `ApproveOfferDTO` | Request | `PATCH /api/v1/offers/:id/approve` |
| `CreateProbationDTO` | Request | `POST /api/v1/probations` |
| `EvaluateProbationDTO` | Request | `PUT /api/v1/probations/:id/evaluate` |
| `ApproveEvaluationDTO` | Request | `PATCH /api/v1/probations/:id/approve` |

---

## 6. Design Patterns Applied

### 6.1 Repository Pattern

**Problem:** Tách biệt logic truy cập dữ liệu khỏi business logic, cho phép thay đổi ORM mà không ảnh hưởng service.

**Classes involved:**
- `JobRepository`, `ApplicationRepository`, `InterviewRepository`, `OfferRepository`, `ProbationRepository`, `UserRepository`

**Diagram:**
```
┌──────────────┐    uses    ┌──────────────────┐    uses    ┌──────────────┐
│  JobService   │──────────▶│  JobRepository    │──────────▶│  PrismaClient │
│  (business)   │           │  (data access)    │           │  (ORM)        │
└──────────────┘            └──────────────────┘            └──────────────┘
```

### 6.2 MVC Architecture (Backend)

**Problem:** Phân tách Presentation (routes/controllers), Business Logic (services), và Data Access (repositories).

**Classes involved:** All controllers, services, repositories

**Flow:**
```
Routes → Controllers → Services → Repositories → Prisma → DB
                                          ↑
                                    Validators (Zod)
```

### 6.3 Service Layer Pattern

**Problem:** Tập trung business logic vào service layer, tránh controller phình to và cho phép tái sử dụng logic.

**Classes involved:** All service classes

**Dependency Injection:**
```
AuthService(UserRepository)
JobService(JobRepository)
ApplicationService(ApplicationRepository, Cloudinary, EmailService)
InterviewService(InterviewRepository, EmailService)
OfferService(OfferRepository, UserRepository, EmailService)
ProbationService(ProbationRepository, EmailService)
```

### 6.4 Factory Pattern (Prisma)

**Problem:** Tạo đối tượng phức tạp với relationships (nested creates, connects).

**Implementation:** Prisma ORM tự động quản lý việc tạo entity qua Prisma Client.

### 6.5 Middleware Chain Pattern

**Problem:** Xử lý cross-cutting concerns (auth, validation, logging, rate limiting) mà không làm ô nhiễm controller code.

**Classes involved:**
```
Request → RateLimiter → Helmet → CORS → AuthMiddleware → Validator → Controller
```

### 6.6 Observer Pattern (Email Events)

**Problem:** Thông báo email tự động khi có sự kiện (nộp hồ sơ, tạo phỏng vấn, phê duyệt offer).

**Classes involved:** `EmailService` + các service gọi nó (ApplicationService, InterviewService, OfferService, ProbationService)

---

## 7. Dependency Injection Configuration

| Class | Dependencies | Injection Type |
|---|---|---|
| **AuthService** | UserRepository | Constructor |
| **JobService** | JobRepository | Constructor |
| **ApplicationService** | ApplicationRepository, EmailService | Constructor |
| **InterviewService** | InterviewRepository, EmailService | Constructor |
| **OfferService** | OfferRepository, UserRepository, EmailService | Constructor |
| **ProbationService** | ProbationRepository, EmailService | Constructor |
| **EmailService** | Resend API client | Constructor |

**Current implementation:** Manual DI via constructor instantiation (singleton pattern through exported instances).

---

## 8. SOLID Principles Verification

| Principle | Status | Evidence |
|---|---|---|
| **S** Single Responsibility | ✅ | Controller chỉ xử lý request/response; Service chỉ business logic; Repository chỉ data access |
| **O** Open/Closed | ✅ | Service layer có thể mở rộng bằng cách thêm method mới mà không sửa controller |
| **L** Liskov Substitution | ✅ | Không có inheritance hierarchy phức tạp |
| **I** Interface Segregation | ✅ | Mỗi service/repository chỉ expose methods cần thiết |
| **D** Dependency Inversion | ✅ | Service phụ thuộc vào Repository abstraction, không phải implementation cụ thể |

---

*Document based on code analysis of ThucTapCoSo Recruitment Management System.*
*Frontend: React 19 + TypeScript | Backend: Express 5 + TypeScript + Prisma + PostgreSQL*
