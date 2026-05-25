# DOC 6.4-A: Complete Data Dictionary

## 1. Database Overview

| Item | Value |
|---|---|
| **Database** | PostgreSQL 15+ |
| **ORM** | Prisma 6.x |
| **Encoding** | UTF-8 |
| **Collation** | en_US.UTF-8 |
| **Schema** | public |

---

## 2. Complete Table Specifications

### 2.1 Table: User

**Purpose:** Lưu thông tin người dùng hệ thống (tất cả roles)
**Estimated rows:** < 100
**Owning component:** Authentication & User Management

#### Columns

| # | Column | Type | Len | Null | Default | Description | Valid Values | Example | Sensitivity | Index |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | UserID | Int | - | PK | auto | ID người dùng (auto-increment) | 1 - 99999 | 1 | Public | PK |
| 2 | FullName | VarChar | 100 | NOT NULL | - | Họ tên đầy đủ | - | "Nguyen Van A" | PII | - |
| 3 | Email | VarChar | 150 | NOT NULL | - | Email (dùng để đăng nhập) | Valid email | "a@company.com" | PII | UQ |
| 4 | Password | VarChar | 255 | NOT NULL | - | Mật khẩu (bcrypt hash) | bcrypt hash (60 chars) | "$2a$10$..." | Critical | - |
| 5 | Role | VarChar | - | NOT NULL | - | Vai trò người dùng | Admin, Recruiter, HiringManager, Director, Probationer | "Recruiter" | Internal | - |
| 6 | Status | VarChar | - | NOT NULL | 'Active' | Trạng thái tài khoản | Active, Inactive | "Active" | Internal | - |
| 7 | CreatedAt | DateTime | - | NOT NULL | now() | Ngày tạo | - | "2026-01-15T..." | Public | - |

#### Constraints
- **PK:** `UserID`
- **UQ:** `Email`
- **Check:** `Role IN ('Admin','Recruiter','HiringManager','Director','Probationer')`
- **Check:** `Status IN ('Active','Inactive')`

#### Enumerated Values

| Field | Value | Meaning |
|---|---|---|
| Role | Admin | Quản trị hệ thống |
| Role | Recruiter | Chuyên viên tuyển dụng |
| Role | HiringManager | Quản lý phỏng vấn |
| Role | Director | Giám đốc |
| Role | Probationer | Nhân viên thử việc |
| Status | Active | Đang hoạt động |
| Status | Inactive | Đã khóa/Vô hiệu |

---

### 2.2 Table: Candidate

**Purpose:** Lưu thông tin ứng viên từ bên ngoài
**Estimated rows:** 1,000 - 10,000
**Owning component:** Application Management

#### Columns

| # | Column | Type | Len | Null | Default | Description | Valid Values | Example | Sensitivity | Index |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | CandidateID | Int | - | PK | auto | ID ứng viên | 1 - 999999 | 1 | Public | PK |
| 2 | FullName | VarChar | 100 | NOT NULL | - | Họ tên ứng viên | - | "Tran Thi B" | PII | - |
| 3 | Email | VarChar | 150 | NOT NULL | - | Email ứng viên | Valid email | "b@email.com" | PII | UQ |
| 4 | Phone | VarChar | 20 | NULL | - | Số điện thoại | Valid phone | "0901234567" | PII | - |
| 5 | CreatedAt | DateTime | - | NOT NULL | now() | Ngày tạo | - | "2026-03-20T..." | Public | - |

#### Constraints
- **PK:** `CandidateID`
- **UQ:** `Email`

---

### 2.3 Table: JobPosting

**Purpose:** Lưu tin tuyển dụng
**Estimated rows:** 100 - 1,000
**Owning component:** Job Management

#### Columns

| # | Column | Type | Len | Null | Default | Description | Valid Values | Example | Sensitivity | Index |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | JobID | Int | - | PK | auto | ID tin tuyển dụng | 1 - 99999 | 1 | Public | PK |
| 2 | PostedBy | Int | - | NOT NULL | - | Người đăng tin (FK → User) | - | 1 | Internal | FK |
| 3 | DeptName | VarChar | 100 | NOT NULL | - | Tên phòng ban | - | "IT" | Public | - |
| 4 | Title | VarChar | 200 | NOT NULL | - | Tiêu đề tin tuyển dụng | - | "Frontend Developer" | Public | - |
| 5 | Description | Text | - | NULL | - | Mô tả công việc | - | "<HTML>" | Public | - |
| 6 | Requirements | Text | - | NULL | - | Yêu cầu công việc | - | "<HTML>" | Public | - |
| 7 | SalaryRange | VarChar | 100 | NULL | - | Mức lương | - | "15-20M" | Internal | - |
| 8 | StartDate | Date | - | NOT NULL | - | Ngày bắt đầu nhận hồ sơ | - | "2026-06-01" | Public | - |
| 9 | EndDate | Date | - | NOT NULL | - | Ngày kết thúc | - | "2026-07-01" | Public | - |
| 10 | JobType | VarChar | 50 | NOT NULL | 'full-time' | Loại công việc | full-time, part-time, contract | "full-time" | Public | - |
| 11 | ExperienceLevel | VarChar | 50 | NOT NULL | 'fresher' | Cấp độ kinh nghiệm | fresher, junior, mid, senior | "fresher" | Public | - |
| 12 | Location | VarChar | 200 | NOT NULL | 'Hà Nội' | Địa điểm làm việc | - | "Ha Noi" | Public | - |
| 13 | Headcount | Int | - | NOT NULL | 1 | Số lượng cần tuyển | >= 1 | 2 | Public | - |
| 14 | Status | VarChar | - | NOT NULL | 'Draft' | Trạng thái | Draft, Open, Closed | "Open" | Public | - |
| 15 | CreatedAt | DateTime | - | NOT NULL | now() | Ngày tạo | - | "2026-05-01T..." | Public | - |

#### Constraints
- **PK:** `JobID`
- **FK:** `PostedBy` → `User(UserID)` ON DELETE NO ACTION
- **Check:** `JobType IN ('full-time','part-time','contract')`
- **Check:** `ExperienceLevel IN ('fresher','junior','mid','senior')`
- **Check:** `Status IN ('Draft','Open','Closed')`
- **Check:** `Headcount >= 1`
- **Check:** `EndDate >= StartDate`

---

### 2.4 Table: Application

**Purpose:** Lưu hồ sơ ứng tuyển
**Estimated rows:** 1,000 - 50,000
**Owning component:** Application Management

#### Columns

| # | Column | Type | Len | Null | Default | Description | Valid Values | Example | Sensitivity | Index |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | AppID | Int | - | PK | auto | ID hồ sơ | 1 - 999999 | 1 | Public | PK |
| 2 | JobID | Int | - | NOT NULL | - | Tin tuyển dụng (FK → JobPosting) | - | 1 | Public | FK,UQ |
| 3 | CandidateID | Int | - | NOT NULL | - | Ứng viên (FK → Candidate) | - | 1 | PII | FK,UQ |
| 4 | ManagedBy | Int | - | NULL | - | Recruiter phụ trách (FK → User) | - | 3 | Internal | FK |
| 5 | AppliedDate | DateTime | - | NOT NULL | now() | Ngày nộp | - | "2026-05-20T..." | Public | - |
| 6 | CV_File | VarChar | 500 | NULL | - | URL file CV (Cloudinary) | URL | "https://res.cloudinary.com/..." | PII | - |
| 7 | Status | VarChar | - | NOT NULL | 'New' | Trạng thái hồ sơ | New, Screening, Shortlisted, Interviewing, Offered, Hired, Rejected, Withdrawn | "New" | Internal | - |

#### Constraints
- **PK:** `AppID`
- **UQ:** `(JobID, CandidateID)` — một candidate chỉ nộp 1 hồ sơ cho 1 job
- **FK:** `JobID` → `JobPosting(JobID)` ON DELETE NO ACTION
- **FK:** `CandidateID` → `Candidate(CandidateID)` ON DELETE NO ACTION
- **FK:** `ManagedBy` → `User(UserID)` ON DELETE NO ACTION
- **Check:** `Status IN ('New','Screening','Shortlisted','Interviewing','Offered','Hired','Rejected','Withdrawn')`

#### Status Machine (REQ-009, REQ-010)

```
New → Screening → Shortlisted → Interviewing → Offered → Hired
  ↓        ↓           ↓                                     ↑
Rejected Rejected   Rejected                              (Offer Accepted)

New → Rejected (REQ-010)
Interviewing → Interview Passed → Offered (REQ-015)
Interviewing → Interview Failed → Rejected (REQ-014)
Offered → Hired (REQ-018 - Offer Accepted)
```

---

### 2.5 Table: Interview

**Purpose:** Lưu lịch phỏng vấn và kết quả
**Estimated rows:** 1,000 - 10,000
**Owning component:** Interview Management

#### Columns

| # | Column | Type | Len | Null | Default | Description | Valid Values | Example | Sensitivity | Index |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | InterviewID | Int | - | PK | auto | ID phỏng vấn | 1 - 999999 | 1 | Public | PK |
| 2 | AppID | Int | - | NOT NULL | - | Hồ sơ (FK → Application) | - | 1 | Internal | FK |
| 3 | InterviewerID | Int | - | NOT NULL | - | Người phỏng vấn (FK → User) | - | 5 | Internal | FK |
| 4 | InterviewDate | DateTime | - | NOT NULL | - | Thời gian PV | - | "2026-06-15T09:00Z" | Internal | - |
| 5 | Location | VarChar | 200 | NULL | - | Địa điểm/Phòng | - | "Room 301" | Internal | - |
| 6 | Type | VarChar | - | NOT NULL | - | Loại PV | HR, Technical, Final | "Technical" | Internal | - |
| 7 | ConfirmStatus | VarChar | - | NOT NULL | 'Pending' | Xác nhận tham gia | Pending, Confirmed, Declined | "Confirmed" | Internal | - |
| 8 | TechnicalScore | Int | - | NULL | - | Điểm chuyên môn (0-10) | 0-10 | 8 | Internal | - |
| 9 | SoftScore | Int | - | NULL | - | Điểm kỹ năng mềm (0-10) | 0-10 | 7 | Internal | - |
| 10 | AttitudeScore | Int | - | NULL | - | Điểm thái độ (0-10) | 0-10 | 9 | Internal | - |
| 11 | Result | VarChar | - | NOT NULL | 'Pending' | Kết quả | Pass, Fail, Pending | "Pass" | Internal | - |
| 12 | Feedback | Text | - | NULL | - | Nhận xét | - | "Tot" | Internal | - |
| 13 | CreatedAt | DateTime | - | NOT NULL | now() | Ngày tạo | - | "2026-06-10T..." | Public | - |

#### Constraints
- **PK:** `InterviewID`
- **FK:** `AppID` → `Application(AppID)` ON DELETE NO ACTION
- **FK:** `InterviewerID` → `User(UserID)` ON DELETE NO ACTION
- **Check:** `Type IN ('HR','Technical','Final')`
- **Check:** `ConfirmStatus IN ('Pending','Confirmed','Declined')`
- **Check:** `Result IN ('Pass','Fail','Pending')`
- **Check:** `TechnicalScore >= 0 AND TechnicalScore <= 10`
- **Check:** `SoftScore >= 0 AND SoftScore <= 10`
- **Check:** `AttitudeScore >= 0 AND AttitudeScore <= 10`

---

### 2.6 Table: Offer

**Purpose:** Lưu đề xuất Offer cho ứng viên
**Estimated rows:** 100 - 5,000
**Owning component:** Offer Management

#### Columns

| # | Column | Type | Len | Null | Default | Description | Valid Values | Example | Sensitivity | Index |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | OfferID | Int | - | PK | auto | ID Offer | 1 - 99999 | 1 | Public | PK |
| 2 | AppID | Int | - | NOT NULL | - | Hồ sơ (FK → Application) | - | 1 | Internal | UQ,FK |
| 3 | CreatedBy | Int | - | NOT NULL | - | Người tạo (FK → User) | - | 3 | Internal | FK |
| 4 | ApprovedBy | Int | - | NULL | - | Người duyệt (FK → User) | - | 10 | Internal | FK |
| 5 | BaseSalary | Decimal | 15,2 | NOT NULL | - | Lương cơ bản | >= 0 | 15000000.00 | Confidential | - |
| 6 | Allowance | Decimal | 15,2 | NOT NULL | 0 | Phụ cấp | >= 0 | 2000000.00 | Confidential | - |
| 7 | StartDate | Date | - | NOT NULL | - | Ngày bắt đầu làm việc | - | "2026-07-01" | Confidential | - |
| 8 | Status | VarChar | - | NOT NULL | 'Pending' | Trạng thái | Pending, Approved, Accepted, Rejected, Declined | "Approved" | Internal | - |
| 9 | DirectorNote | Text | - | NULL | - | Ghi chú Director | - | "Dong y" | Internal | - |
| 10 | DecisionToken | VarChar | 128 | NULL | - | Token cho ứng viên phản hồi | - | "a1b2c3..." | Internal | - |
| 11 | DeclineReason | Text | - | NULL | - | Lý do ứng viên từ chối | - | "Da nhan viec khac" | Internal | - |
| 12 | CreatedAt | DateTime | - | NOT NULL | now() | Ngày tạo | - | "2026-06-20T..." | Public | - |

#### Constraints
- **PK:** `OfferID`
- **UQ:** `AppID` — một application chỉ có 1 Offer
- **FK:** `AppID` → `Application(AppID)` ON DELETE NO ACTION
- **FK:** `CreatedBy` → `User(UserID)` ON DELETE NO ACTION
- **FK:** `ApprovedBy` → `User(UserID)` ON DELETE NO ACTION
- **Check:** `Status IN ('Pending','Approved','Accepted','Rejected','Declined')`
- **Check:** `BaseSalary >= 0`
- **Check:** `Allowance >= 0`

#### Status Machine (REQ-015 → REQ-018)

```
Pending → Approved → Accepted (Candidate accepts) → Khởi tạo Probation
                        ↓
                   Declined (Candidate declines)
Pending → Rejected (Director rejects)
```

---

### 2.7 Table: Probation

**Purpose:** Lưu hồ sơ thử việc
**Estimated rows:** 100 - 1,000
**Owning component:** Probation Management

#### Columns

| # | Column | Type | Len | Null | Default | Description | Valid Values | Example | Sensitivity | Index |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | ProbationID | Int | - | PK | auto | ID thử việc | 1 - 99999 | 1 | Public | PK |
| 2 | OfferID | Int | - | NOT NULL | - | Offer (FK → Offer) | - | 1 | Internal | UQ,FK |
| 3 | ProbationerID | Int | - | NOT NULL | - | NV thử việc (FK → User) | - | 15 | Internal | FK |
| 4 | SupervisorID | Int | - | NULL | - | Người hướng dẫn (FK → User) | - | 5 | Internal | FK |
| 5 | StartDate | Date | - | NOT NULL | - | Ngày bắt đầu | - | "2026-07-01" | Internal | - |
| 6 | EndDate | Date | - | NOT NULL | - | Ngày kết thúc | - | "2026-09-30" | Internal | - |
| 7 | Status | VarChar | - | NOT NULL | 'Ongoing' | Trạng thái | Ongoing, PendingEvaluation, PendingApproval, Pass, Fail | "Ongoing" | Internal | - |
| 8 | CreatedAt | DateTime | - | NOT NULL | now() | Ngày tạo | - | "2026-07-01T..." | Public | - |

#### Constraints
- **PK:** `ProbationID`
- **UQ:** `OfferID` — một Offer chỉ có 1 Probation
- **FK:** `OfferID` → `Offer(OfferID)` ON DELETE NO ACTION
- **FK:** `ProbationerID` → `User(UserID)` ON DELETE NO ACTION
- **FK:** `SupervisorID` → `User(UserID)` ON DELETE NO ACTION
- **Check:** `Status IN ('Ongoing','PendingEvaluation','PendingApproval','Pass','Fail')`
- **Check:** `EndDate > StartDate`

#### Status Machine (REQ-020 → REQ-025)

```
Ongoing → PendingEvaluation → PendingApproval → Pass (Ký HĐ chính thức)
                                       ↓
                                     Fail (Chấm dứt)
```

---

### 2.8 Table: ProbationEvaluation

**Purpose:** Lưu đánh giá thử việc
**Estimated rows:** 100 - 1,000
**Owning component:** Probation Management

#### Columns

| # | Column | Type | Len | Null | Default | Description | Valid Values | Example | Sensitivity | Index |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | EvalID | Int | - | PK | auto | ID đánh giá | 1 - 99999 | 1 | Public | PK |
| 2 | ProbationID | Int | - | NOT NULL | - | Thử việc (FK → Probation) | - | 1 | Internal | UQ,FK |
| 3 | SubmittedBy | Int | - | NOT NULL | - | Người đánh giá (FK → User) | - | 5 | Internal | FK |
| 4 | ApprovedBy | Int | - | NULL | - | Người duyệt (FK → User) | - | 10 | Internal | FK |
| 5 | KPIScore | Int | - | NULL | - | Điểm KPI | 0-100 | 85 | Internal | - |
| 6 | Comment | Text | - | NULL | - | Nhận xét | - | "Hoàn thành tốt" | Internal | - |
| 7 | Recommendation | String | - | NULL | - | Đề xuất | Pass, Fail | "Pass" | Internal | - |
| 8 | DirectorNote | Text | - | NULL | - | Ghi chú Director | - | "Dong y" | Internal | - |
| 9 | Status | VarChar | - | NOT NULL | 'Draft' | Trạng thái | Draft, Submitted, PendingApproval, Approved, Rejected | "Approved" | Internal | - |
| 10 | SubmittedAt | DateTime | - | NULL | - | Ngày nộp | - | "2026-09-25T..." | Public | - |
| 11 | ApprovedAt | DateTime | - | NULL | - | Ngày duyệt | - | "2026-09-28T..." | Public | - |

#### Constraints
- **PK:** `EvalID`
- **UQ:** `ProbationID` — một Probation chỉ có 1 evaluation
- **FK:** `ProbationID` → `Probation(ProbationID)` ON DELETE NO ACTION
- **FK:** `SubmittedBy` → `User(UserID)` ON DELETE NO ACTION
- **FK:** `ApprovedBy` → `User(UserID)` ON DELETE NO ACTION
- **Check:** `Status IN ('Draft','Submitted','PendingApproval','Approved','Rejected')`
- **Check:** `Recommendation IN ('Pass','Fail')`
- **Check:** `KPIScore >= 0 AND KPIScore <= 100`

---

## 3. Sensitive Data Catalog

| Field | Classification | Encryption | Masking in Logs |
|---|---|---|---|
| User.Password | Critical | bcrypt hash | Never logged |
| User.Email | PII | None | Full (non-sensitive) |
| Candidate.Email | PII | None | Full (non-sensitive) |
| Candidate.Phone | PII | None | Partial (show last 4 digits) |
| Application.CV_File | PII | Cloudinary-managed | Truncate URL |
| Offer.BaseSalary | Confidential | None | Full |
| Offer.Allowance | Confidential | None | Full |

---

# DOC 6.4-B: DDL Scripts

## 1. Prisma Schema (DDL Equivalent)

> **Ghi chú:** Dự án sử dụng **Prisma ORM** để quản lý database schema.
> Các lệnh DDL dưới đây được Prisma tự động sinh ra khi chạy `prisma migrate dev`.
> File `schema.prisma` là single source of truth cho database schema.

### 1.1 Schema Prisma (schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// 1. USER
model User {
  userId    Int      @id @default(autoincrement()) @map("UserID")
  fullName  String   @map("FullName") @db.VarChar(100)
  email     String   @unique @map("Email") @db.VarChar(150)
  password  String   @map("Password") @db.VarChar(255)
  role      String   @map("Role")
  status    String   @default("Active") @map("Status")
  createdAt DateTime @default(now()) @map("CreatedAt")

  jobPostings          JobPosting[]          @relation("PostedJobs")
  managedApplications  Application[]         @relation("ManagedApplications")
  interviews           Interview[]           @relation("Interviewers")
  createdOffers        Offer[]               @relation("CreatedOffers")
  approvedOffers       Offer[]               @relation("ApprovedOffers")
  probationersInfo     Probation[]           @relation("Probationers")
  supervisedProbations Probation[]           @relation("Supervisors")
  submittedEvaluations ProbationEvaluation[] @relation("SubmittedEvaluations")
  approvedEvaluations  ProbationEvaluation[] @relation("ApprovedEvaluations")

  @@map("User")
}

// 2. CANDIDATE
model Candidate {
  candidateId Int      @id @default(autoincrement()) @map("CandidateID")
  fullName    String   @map("FullName") @db.VarChar(100)
  email       String   @unique @map("Email") @db.VarChar(150)
  phone       String?  @map("Phone") @db.VarChar(20)
  createdAt   DateTime @default(now()) @map("CreatedAt")

  applications Application[]

  @@map("Candidate")
}

// 3. JOB POSTING
model JobPosting {
  jobId        Int      @id @default(autoincrement()) @map("JobID")
  postedBy     Int      @map("PostedBy")
  deptName     String   @map("DeptName") @db.VarChar(100)
  title        String   @map("Title") @db.VarChar(200)
  description  String?  @map("Description") @db.Text
  requirements String?  @map("Requirements") @db.Text
  salaryRange  String?  @map("SalaryRange") @db.VarChar(100)
  startDate    DateTime @map("StartDate") @db.Date
  endDate      DateTime @map("EndDate") @db.Date
  type         String   @default("full-time") @map("JobType") @db.VarChar(50)
  experienceLevel String @default("fresher") @map("ExperienceLevel") @db.VarChar(50)
  location     String   @default("Hà Nội") @map("Location") @db.VarChar(200)
  headcount    Int      @default(1) @map("Headcount")
  status       String   @default("Draft") @map("Status")
  createdAt    DateTime @default(now()) @map("CreatedAt")

  postedByUser User          @relation("PostedJobs", fields: [postedBy], references: [userId])
  applications Application[]

  @@map("JobPosting")
}

// 4. APPLICATION
model Application {
  appId       Int      @id @default(autoincrement()) @map("AppID")
  jobId       Int      @map("JobID")
  candidateId Int      @map("CandidateID")
  managedBy   Int?     @map("ManagedBy")
  appliedDate DateTime @default(now()) @map("AppliedDate")
  cvFile      String?  @map("CV_File") @db.VarChar(500)
  status      String   @default("New") @map("Status")

  jobPosting    JobPosting @relation(fields: [jobId], references: [jobId])
  candidate     Candidate  @relation(fields: [candidateId], references: [candidateId])
  managedByUser User?      @relation("ManagedApplications", fields: [managedBy], references: [userId])

  interviews Interview[]
  offer      Offer?

  @@unique([jobId, candidateId], map: "uq_application")
  @@map("Application")
}

// 5. INTERVIEW
model Interview {
  interviewId    Int      @id @default(autoincrement()) @map("InterviewID")
  appId          Int      @map("AppID")
  interviewerId  Int      @map("InterviewerID")
  interviewDate  DateTime @map("InterviewDate")
  location       String?  @map("Location") @db.VarChar(200)
  type           String   @map("Type")
  confirmStatus  String   @default("Pending") @map("ConfirmStatus")
  technicalScore Int?     @map("TechnicalScore")
  softScore      Int?     @map("SoftScore")
  attitudeScore  Int?     @map("AttitudeScore")
  result         String   @default("Pending") @map("Result")
  feedback       String?  @map("Feedback") @db.Text
  createdAt      DateTime @default(now()) @map("CreatedAt")

  application Application @relation(fields: [appId], references: [appId])
  interviewer User        @relation("Interviewers", fields: [interviewerId], references: [userId])

  @@map("Interview")
}

// 6. OFFER
model Offer {
  offerId      Int      @id @default(autoincrement()) @map("OfferID")
  appId        Int      @unique @map("AppID")
  createdBy    Int      @map("CreatedBy")
  approvedBy   Int?     @map("ApprovedBy")
  baseSalary   Decimal  @map("BaseSalary") @db.Decimal(15, 2)
  allowance    Decimal  @default(0) @map("Allowance") @db.Decimal(15, 2)
  startDate    DateTime @map("StartDate") @db.Date
  status        String   @default("Pending") @map("Status")
  directorNote  String?  @map("DirectorNote") @db.Text
  decisionToken String?  @map("DecisionToken") @db.VarChar(128)
  declineReason String?  @map("DeclineReason") @db.Text
  createdAt     DateTime @default(now()) @map("CreatedAt")

  application    Application @relation(fields: [appId], references: [appId])
  createdByUser  User        @relation("CreatedOffers", fields: [createdBy], references: [userId])
  approvedByUser User?       @relation("ApprovedOffers", fields: [approvedBy], references: [userId])

  probation Probation?

  @@map("Offer")
}

// 7. PROBATION
model Probation {
  probationId   Int      @id @default(autoincrement()) @map("ProbationID")
  offerId       Int      @unique @map("OfferID")
  probationerId Int      @map("ProbationerID")
  supervisorId  Int?     @map("SupervisorID")
  startDate     DateTime @map("StartDate") @db.Date
  endDate       DateTime @map("EndDate") @db.Date
  status        String   @default("Ongoing") @map("Status")
  createdAt     DateTime @default(now()) @map("CreatedAt")

  offer       Offer @relation(fields: [offerId], references: [offerId])
  probationer User  @relation("Probationers", fields: [probationerId], references: [userId])
  supervisor  User? @relation("Supervisors", fields: [supervisorId], references: [userId])

  evaluation ProbationEvaluation?

  @@map("Probation")
}

// 8. PROBATION EVALUATION
model ProbationEvaluation {
  evalId         Int       @id @default(autoincrement()) @map("EvalID")
  probationId    Int       @unique @map("ProbationID")
  submittedBy    Int       @map("SubmittedBy")
  approvedBy     Int?      @map("ApprovedBy")
  kpiScore       Int?      @map("KPIScore")
  comment        String?   @map("Comment") @db.Text
  recommendation String?   @map("Recommendation")
  directorNote   String?   @map("DirectorNote") @db.Text
  status         String    @default("Draft") @map("Status")
  submittedAt    DateTime? @map("SubmittedAt")
  approvedAt     DateTime? @map("ApprovedAt")

  probation       Probation @relation(fields: [probationId], references: [probationId])
  submittedByUser User      @relation("SubmittedEvaluations", fields: [submittedBy], references: [userId])
  approvedByUser  User?     @relation("ApprovedEvaluations", fields: [approvedBy], references: [userId])

  @@map("ProbationEvaluation")
}
```

## 2. Index Strategy

| Index Name | Table | Columns | Type | Justification |
|---|---|---|---|---|
| `User_email_key` | User | Email | Unique | Login query (REQ-001) |
| `Candidate_email_key` | Candidate | Email | Unique | Ngăn duplicate candidate |
| `uq_application` | Application | JobID + CandidateID | Unique | Mỗi ứng viên chỉ nộp 1 hồ sơ/job |
| `Offer_appId_key` | Offer | AppID | Unique | 1 application chỉ có 1 offer |
| `Probation_offerId_key` | Probation | OfferID | Unique | 1 offer chỉ có 1 probation |
| `ProbationEvaluation_probationId_key` | ProbationEvaluation | ProbationID | Unique | 1 probation chỉ có 1 evaluation |

**Foreign key indexes** (Prisma tự động tạo index cho FK):
- JobPosting.PostedBy
- Application.JobID, CandidateID, ManagedBy
- Interview.AppID, InterviewerID
- Offer.AppID, CreatedBy, ApprovedBy
- Probation.OfferID, ProbationerID, SupervisorID
- ProbationEvaluation.ProbationID, SubmittedBy, ApprovedBy

## 3. Migration Commands

```bash
# Tạo migration mới
npx prisma migrate dev --name init

# Áp dụng migration lên database
npx prisma migrate deploy

# Reset database (xóa toàn bộ dữ liệu + chạy lại migration)
npx prisma migrate reset

# Mở Prisma Studio (GUI xem dữ liệu)
npx prisma studio

# Seed dữ liệu mẫu
npx tsx prisma/seed.ts
```

## 4. Seed Data (Reference)

Các dữ liệu seed cần thiết cho development:

### Users (Admin mặc định)

| FullName | Email | Password | Role |
|---|---|---|---|
| Admin | admin@company.com | admin123 | Admin |
| Recruiter A | recruiter@company.com | rec123 | Recruiter |
| HM A | hm@company.com | hm123 | HiringManager |
| Director A | director@company.com | dir123 | Director |

> **Security note:** Các mật khẩu trên chỉ dùng cho development. Production cần set mật khẩu mạnh.

### Departments

```
IT, HR, Finance, Marketing, Sales, Operations
```

### Job Types

```
full-time, part-time, contract
```

### Experience Levels

```
fresher, junior, mid, senior
```
