# DOC 5.3-A: Physical ERD

## 1. Physical ERD Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ┌──────────────────────────────┐                                               │
│  │           User               │                                               │
│  ├──────────────────────────────┤                                               │
│  │ PK  UserID         Int      │──┐                                             │
│  │     FullName       VarChar  │  │                                             │
│  │     Email          VarChar  │  │  (PostedBy)                                 │
│  │     Password       VarChar  │  │                                             │
│  │     Role           VarChar  │  │  ┌──────────────────────────────┐          │
│  │     Status         VarChar  │  │  │        JobPosting            │          │
│  │     CreatedAt      DateTime│  ├──│                              │          │
│  └──────────────────────────────┘  │  ├──────────────────────────────┤          │
│                                     │  │ PK  JobID          Int      │          │
│  ┌──────────────────────────────┐  │  │ FK  PostedBy       Int      │          │
│  │         Candidate            │  │  │     DeptName       VarChar  │          │
│  ├──────────────────────────────┤  │  │     Title          VarChar  │          │
│  │ PK  CandidateID      Int      │  │  │     Description   Text     │          │
│  │     FullName         VarChar │  │  │     Requirements  Text     │          │
│  │     Email            VarChar │  │  │     SalaryRange   VarChar  │          │
│  │     Phone            VarChar │  │  │     StartDate     Date     │          │
│  │     CreatedAt        DateTime│  │  │     EndDate       Date     │          │
│  └──────────┬───────────────────┘  │  │     JobType       VarChar  │          │
│             │                      │  │     ExperLevel    VarChar  │          │
│             │ (CandidateID)       │  │     Location      VarChar  │          │
│             │                      │  │     Headcount     Int      │          │
│             │                      │  │     Status        VarChar  │          │
│             │                      │  │     CreatedAt     DateTime │          │
│  ┌──────────┴───────────────────┐  │  └────────────────┬─────────────┘          │
│  │        Application           │  │                   │                        │
│  ├──────────────────────────────┤  │                   │ (JobID)                │
│  │ PK  AppID            Int      │  │                   │                        │
│  │ FK  JobID            Int      │──┘                   │                        │
│  │ FK  CandidateID      Int      │──┘                   │                        │
│  │ FK  ManagedBy        Int?     │──┐ (ManagedBy)       │                        │
│  │     AppliedDate      DateTime │  │                   │                        │
│  │     CV_File          VarChar  │  │                   │                        │
│  │     Status           VarChar  │  │                   │                        │
│  │ UNIQUE(JobID, CandidateID)   │  │                   │                        │
│  └──────────┬───────────────────┘  │                   │                        │
│             │                      │                   │                        │
│             │ (AppID)             │                   │                        │
│       ┌─────┼─────────────────────┼───────────────────┘                        │
│       │     │                     │                                              │
│  ┌────┴──────────────┐  ┌────────┴───────────┐                                  │
│  │    Interview       │  │      Offer         │                                  │
│  ├───────────────────┤  ├────────────────────┤                                  │
│  │ PK  InterviewID   │  │ PK  OfferID   Int  │                                  │
│  │ FK  AppID      Int│──┘ FK  AppID     Int  │──(Unique)                        │
│  │ FK  InterviewerID │──┐ FK  CreatedBy Int  │──┐                               │
│  │     InterviewDate │  │ FK  ApprovedBy Int? │──┤ (ApprovedBy)                  │
│  │     Location      │  │     BaseSalary Decimal│ │                               │
│  │     Type          │  │     Allowance  Decimal│ │                               │
│  │     ConfirmStatus │  │     StartDate  Date   │ │                               │
│  │     TechnicalScore│  │     Status     VarChar│ │                               │
│  │     SoftScore     │  │     DirectorNote Text │ │                               │
│  │     AttitudeScore │  │     DecisionToken     │ │                               │
│  │     Result        │  │     DeclineReason     │ │                               │
│  │     Feedback      │  │     CreatedAt  DateTime│ │                               │
│  │     CreatedAt     │  └──────────┬────────────┘ │                               │
│  └───────────────────┘             │              │                               │
│                                    │ (OfferID)    │                               │
│                                    │              │                               │
│  ┌─────────────────────────────┐   │              │                               │
│  │         Probation           │   │              │                               │
│  ├─────────────────────────────┤   │              │                               │
│  │ PK  ProbationID       Int    │   │              │                               │
│  │ FK  OfferID            Int   │───┘              │                               │
│  │ FK  ProbationerID      Int   │──────────────────┘ (ProbationerID)              │
│  │ FK  SupervisorID       Int?  │──────────────────┐ (SupervisorID)               │
│  │     StartDate          Date  │                  │                               │
│  │     EndDate            Date  │                  │                               │
│  │     Status            VarChar│                  │                               │
│  │     CreatedAt      DateTime  │                  │                               │
│  └──────────┬───────────────────┘                  │                               │
│             │ (ProbationID)                       │                               │
│             │                                      │                               │
│  ┌──────────┴───────────────────┐                  │                               │
│  │    ProbationEvaluation       │                  │                               │
│  ├──────────────────────────────┤                  │                               │
│  │ PK  EvalID            Int    │                  │                               │
│  │ FK  ProbationID       Int    │──(Unique)        │                               │
│  │ FK  SubmittedBy       Int    │──────────────────┘ (SubmittedBy)                │
│  │ FK  ApprovedBy        Int?   │──────────────────┐ (ApprovedBy)                 │
│  │     KPIScore          Int?   │                  │                               │
│  │     Comment           Text?  │                  │                               │
│  │     Recommendation    String?│                  │                               │
│  │     DirectorNote      Text?  │                  │                               │
│  │     Status           VarChar│                  │                               │
│  │     SubmittedAt    DateTime?│                  │                               │
│  │     ApprovedAt     DateTime?│                  │                               │
│  └──────────────────────────────┘                  │                               │
│                                                    │                               │
│  ┌──────────────────────────────────────────────┐  │                               │
│  │              User (self-referencing)          │  │                               │
│  │  (PostedBy ─ JobPosting)                      │  │                               │
│  │  (ManagedBy ─ Application)                    │◄─┘                               │
│  │  (Interviewer ─ Interview)                    │                                   │
│  │  (CreatedBy ─ Offer)                          │                                   │
│  │  (ApprovedBy ─ Offer)                         │                                   │
│  │  (Probationer ─ Probation)                    │                                   │
│  │  (Supervisor ─ Probation)                     │                                   │
│  │  (SubmittedBy ─ ProbationEvaluation)          │                                   │
│  │  (ApprovedBy ─ ProbationEvaluation)           │                                   │
│  └──────────────────────────────────────────────┘                                   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 2. Notation Legend

| Symbol | Meaning |
|---|---|
| PK | Primary Key |
| FK | Foreign Key |
| (Unique) | Unique Constraint |
| ? | Nullable column |
| Int | Auto-increment integer |
| Decimal(15,2) | Decimal with precision |

## 3. Schema Organization

Hệ thống sử dụng **single schema** (public schema) vì đây là monolithic backend. Tất cả tables thuộc về một database, phân tách logic theo component ownership.

| Component Owner | Tables |
|---|---|
| **Auth & User Mgmt** | User |
| **Job Management** | JobPosting |
| **Application Mgmt** | Candidate, Application |
| **Interview Mgmt** | Interview |
| **Offer Mgmt** | Offer |
| **Probation Mgmt** | Probation, ProbationEvaluation |

---

# DOC 5.3-B: Database Schema Specification

## 1. Database Platform

| Item | Value |
|---|---|
| **Database** | PostgreSQL |
| **ORM** | Prisma 6.x |
| **Version** | PostgreSQL 15+ |
| **Hosting** | (configurable via DATABASE_URL) |
| **Encoding** | UTF-8 |

## 2. Naming Conventions

| Element | Convention | Example |
|---|---|---|
| **Table names** | PascalCase (via `@@map`) | `User`, `JobPosting`, `ProbationEvaluation` |
| **Physical table** | PascalCase | `User`, `JobPosting` |
| **Column names** | PascalCase with prefix (via `@map`) | `UserID`, `FullName`, `JobType` |
| **Primary keys** | `{Table}ID` | `UserID`, `JobID` |
| **Foreign keys** | `{RelatedTable}ID` | `PostedBy`, `CandidateID` |
| **Unique constraints** | `uq_{table}` | `uq_application` |

## 3. Table Specifications

### 3.1 User

Bảng lưu thông tin người dùng hệ thống.

| Column | Data Type | Length | Nullable | Default | Description |
|---|---|---|---|---|---|
| `UserID` | `Int` (auto-increment) | - | NOT NULL | - | Primary key |
| `FullName` | `VarChar` | 100 | NOT NULL | - | Họ tên |
| `Email` | `VarChar` | 150 | NOT NULL | - | Email (unique) |
| `Password` | `VarChar` | 255 | NOT NULL | - | Mật khẩu (bcrypt hash) |
| `Role` | `VarChar` | - | NOT NULL | - | Admin, Recruiter, HiringManager, Director, Probationer |
| `Status` | `VarChar` | - | NOT NULL | `'Active'` | Active, Inactive |
| `CreatedAt` | `DateTime` | - | NOT NULL | `now()` | Ngày tạo |

**Primary Key:** `UserID`
**Unique Constraints:** `Email`
**Owned by:** Authentication & User Management
**Estimated volume:** < 100 rows

### 3.2 Candidate

Bảng lưu thông tin ứng viên từ bên ngoài.

| Column | Data Type | Length | Nullable | Default | Description |
|---|---|---|---|---|---|
| `CandidateID` | `Int` (auto-increment) | - | NOT NULL | - | Primary key |
| `FullName` | `VarChar` | 100 | NOT NULL | - | Họ tên ứng viên |
| `Email` | `VarChar` | 150 | NOT NULL | - | Email (unique) |
| `Phone` | `VarChar` | 20 | YES | - | Số điện thoại |
| `CreatedAt` | `DateTime` | - | NOT NULL | `now()` | Ngày tạo |

**Primary Key:** `CandidateID`
**Unique Constraints:** `Email`
**Owned by:** Application Management
**Estimated volume:** 1,000 - 10,000 rows

### 3.3 JobPosting

Bảng lưu tin tuyển dụng.

| Column | Data Type | Length | Nullable | Default | Description |
|---|---|---|---|---|---|
| `JobID` | `Int` (auto-increment) | - | NOT NULL | - | Primary key |
| `PostedBy` | `Int` | - | NOT NULL | - | FK → User.UserID |
| `DeptName` | `VarChar` | 100 | NOT NULL | - | Tên phòng ban |
| `Title` | `VarChar` | 200 | NOT NULL | - | Tiêu đề tin tuyển dụng |
| `Description` | `Text` | - | YES | - | Mô tả công việc |
| `Requirements` | `Text` | - | YES | - | Yêu cầu công việc |
| `SalaryRange` | `VarChar` | 100 | YES | - | Mức lương |
| `StartDate` | `Date` | - | NOT NULL | - | Ngày bắt đầu |
| `EndDate` | `Date` | - | NOT NULL | - | Ngày kết thúc |
| `JobType` | `VarChar` | 50 | NOT NULL | `'full-time'` | full-time, part-time, contract |
| `ExperienceLevel` | `VarChar` | 50 | NOT NULL | `'fresher'` | fresher, junior, mid, senior |
| `Location` | `VarChar` | 200 | NOT NULL | `'Hà Nội'` | Địa điểm |
| `Headcount` | `Int` | - | NOT NULL | `1` | Số lượng cần tuyển |
| `Status` | `VarChar` | - | NOT NULL | `'Draft'` | Draft, Open, Closed |
| `CreatedAt` | `DateTime` | - | NOT NULL | `now()` | Ngày tạo |

**Primary Key:** `JobID`
**Foreign Keys:**
- `PostedBy` → `User(UserID)` ON DELETE No Action ON UPDATE No Action

**Owned by:** Job Management
**Estimated volume:** 100 - 1,000 rows

### 3.4 Application

Bảng lưu hồ sơ ứng tuyển.

| Column | Data Type | Length | Nullable | Default | Description |
|---|---|---|---|---|---|
| `AppID` | `Int` (auto-increment) | - | NOT NULL | - | Primary key |
| `JobID` | `Int` | - | NOT NULL | - | FK → JobPosting.JobID |
| `CandidateID` | `Int` | - | NOT NULL | - | FK → Candidate.CandidateID |
| `ManagedBy` | `Int` | - | YES | - | FK → User.UserID (Recruiter phụ trách) |
| `AppliedDate` | `DateTime` | - | NOT NULL | `now()` | Ngày nộp |
| `CV_File` | `VarChar` | 500 | YES | - | URL file CV trên Cloudinary |
| `Status` | `VarChar` | - | NOT NULL | `'New'` | New, Screening, Shortlisted, Interviewing, Offered, Hired, Rejected, Withdrawn |

**Primary Key:** `AppID`
**Foreign Keys:**
- `JobID` → `JobPosting(JobID)` ON DELETE No Action ON UPDATE No Action
- `CandidateID` → `Candidate(CandidateID)` ON DELETE No Action ON UPDATE No Action
- `ManagedBy` → `User(UserID)` ON DELETE No Action ON UPDATE No Action

**Unique Constraints:** `uq_application` (`JobID`, `CandidateID`)
**Owned by:** Application Management
**Estimated volume:** 1,000 - 50,000 rows

### 3.5 Interview

Bảng lưu lịch phỏng vấn và kết quả.

| Column | Data Type | Length | Nullable | Default | Description |
|---|---|---|---|---|---|
| `InterviewID` | `Int` (auto-increment) | - | NOT NULL | - | Primary key |
| `AppID` | `Int` | - | NOT NULL | - | FK → Application.AppID |
| `InterviewerID` | `Int` | - | NOT NULL | - | FK → User.UserID (HiringManager) |
| `InterviewDate` | `DateTime` | - | NOT NULL | - | Thời gian phỏng vấn |
| `Location` | `VarChar` | 200 | YES | - | Địa điểm |
| `Type` | `VarChar` | - | NOT NULL | - | HR, Technical, Final |
| `ConfirmStatus` | `VarChar` | - | NOT NULL | `'Pending'` | Pending, Confirmed, Declined |
| `TechnicalScore` | `Int` | - | YES | - | Điểm chuyên môn (0-10) |
| `SoftScore` | `Int` | - | YES | - | Điểm kỹ năng mềm (0-10) |
| `AttitudeScore` | `Int` | - | YES | - | Điểm thái độ (0-10) |
| `Result` | `VarChar` | - | NOT NULL | `'Pending'` | Pass, Fail, Pending |
| `Feedback` | `Text` | - | YES | - | Nhận xét |
| `CreatedAt` | `DateTime` | - | NOT NULL | `now()` | Ngày tạo |

**Primary Key:** `InterviewID`
**Foreign Keys:**
- `AppID` → `Application(AppID)` ON DELETE No Action ON UPDATE No Action
- `InterviewerID` → `User(UserID)` ON DELETE No Action ON UPDATE No Action

**Owned by:** Interview Management
**Estimated volume:** 1,000 - 10,000 rows

### 3.6 Offer

Bảng lưu đề xuất Offer.

| Column | Data Type | Length | Nullable | Default | Description |
|---|---|---|---|---|---|
| `OfferID` | `Int` (auto-increment) | - | NOT NULL | - | Primary key |
| `AppID` | `Int` | - | NOT NULL | - | FK → Application.AppID (Unique) |
| `CreatedBy` | `Int` | - | NOT NULL | - | FK → User.UserID (Recruiter) |
| `ApprovedBy` | `Int` | - | YES | - | FK → User.UserID (Director) |
| `BaseSalary` | `Decimal` | 15,2 | NOT NULL | - | Lương cơ bản |
| `Allowance` | `Decimal` | 15,2 | NOT NULL | `0` | Phụ cấp |
| `StartDate` | `Date` | - | NOT NULL | - | Ngày bắt đầu làm việc |
| `Status` | `VarChar` | - | NOT NULL | `'Pending'` | Pending, Approved, Accepted, Rejected, Declined |
| `DirectorNote` | `Text` | - | YES | - | Ghi chú Director |
| `DecisionToken` | `VarChar` | 128 | YES | - | Token cho ứng viên phản hồi |
| `DeclineReason` | `Text` | - | YES | - | Lý do ứng viên từ chối |
| `CreatedAt` | `DateTime` | - | NOT NULL | `now()` | Ngày tạo |

**Primary Key:** `OfferID`
**Foreign Keys:**
- `AppID` → `Application(AppID)` ON DELETE No Action ON UPDATE No Action (Unique)
- `CreatedBy` → `User(UserID)` ON DELETE No Action ON UPDATE No Action
- `ApprovedBy` → `User(UserID)` ON DELETE No Action ON UPDATE No Action

**Owned by:** Offer Management
**Estimated volume:** 100 - 5,000 rows

### 3.7 Probation

Bảng lưu hồ sơ thử việc.

| Column | Data Type | Length | Nullable | Default | Description |
|---|---|---|---|---|---|
| `ProbationID` | `Int` (auto-increment) | - | NOT NULL | - | Primary key |
| `OfferID` | `Int` | - | NOT NULL | - | FK → Offer.OfferID (Unique) |
| `ProbationerID` | `Int` | - | NOT NULL | - | FK → User.UserID |
| `SupervisorID` | `Int` | - | YES | - | FK → User.UserID |
| `StartDate` | `Date` | - | NOT NULL | - | Ngày bắt đầu thử việc |
| `EndDate` | `Date` | - | NOT NULL | - | Ngày kết thúc thử việc |
| `Status` | `VarChar` | - | NOT NULL | `'Ongoing'` | Ongoing, PendingEvaluation, PendingApproval, Pass, Fail |
| `CreatedAt` | `DateTime` | - | NOT NULL | `now()` | Ngày tạo |

**Primary Key:** `ProbationID`
**Foreign Keys:**
- `OfferID` → `Offer(OfferID)` ON DELETE No Action ON UPDATE No Action (Unique)
- `ProbationerID` → `User(UserID)` ON DELETE No Action ON UPDATE No Action
- `SupervisorID` → `User(UserID)` ON DELETE No Action ON UPDATE No Action

**Owned by:** Probation Management
**Estimated volume:** 100 - 1,000 rows

### 3.8 ProbationEvaluation

Bảng lưu đánh giá thử việc.

| Column | Data Type | Length | Nullable | Default | Description |
|---|---|---|---|---|---|
| `EvalID` | `Int` (auto-increment) | - | NOT NULL | - | Primary key |
| `ProbationID` | `Int` | - | NOT NULL | - | FK → Probation.ProbationID (Unique) |
| `SubmittedBy` | `Int` | - | NOT NULL | - | FK → User.UserID |
| `ApprovedBy` | `Int` | - | YES | - | FK → User.UserID |
| `KPIScore` | `Int` | - | YES | - | Điểm KPI (0-100) |
| `Comment` | `Text` | - | YES | - | Nhận xét |
| `Recommendation` | `String` | - | YES | - | Pass, Fail |
| `DirectorNote` | `Text` | - | YES | - | Ghi chú Director |
| `Status` | `VarChar` | - | NOT NULL | `'Draft'` | Draft, Submitted, PendingApproval, Approved, Rejected |
| `SubmittedAt` | `DateTime` | - | YES | - | Ngày nộp đánh giá |
| `ApprovedAt` | `DateTime` | - | YES | - | Ngày duyệt |

**Primary Key:** `EvalID`
**Foreign Keys:**
- `ProbationID` → `Probation(ProbationID)` ON DELETE No Action ON UPDATE No Action (Unique)
- `SubmittedBy` → `User(UserID)` ON DELETE No Action ON UPDATE No Action
- `ApprovedBy` → `User(UserID)` ON DELETE No Action ON UPDATE No Action

**Owned by:** Probation Management
**Estimated volume:** 100 - 1,000 rows

## 4. Entity Relationship Summary

| Table | FK Column | Referenced Table | Referenced Column |
|---|---|---|---|
| JobPosting | PostedBy | User | UserID |
| Application | JobID | JobPosting | JobID |
| Application | CandidateID | Candidate | CandidateID |
| Application | ManagedBy | User | UserID |
| Interview | AppID | Application | AppID |
| Interview | InterviewerID | User | UserID |
| Offer | AppID | Application | AppID |
| Offer | CreatedBy | User | UserID |
| Offer | ApprovedBy | User | UserID |
| Probation | OfferID | Offer | OfferID |
| Probation | ProbationerID | User | UserID |
| Probation | SupervisorID | User | UserID |
| ProbationEvaluation | ProbationID | Probation | ProbationID |
| ProbationEvaluation | SubmittedBy | User | UserID |
| ProbationEvaluation | ApprovedBy | User | UserID |

## 5. Referential Integrity

All foreign keys use: **ON DELETE No Action, ON UPDATE No Action**

Lý do: Các quan hệ nghiệp vụ không cho phép xóa dữ liệu gốc khi đã có dữ liệu con (ví dụ: không thể xóa User đã tạo Offer, không thể xóa Application đã có Interview).

## 6. Partitioning Strategy

| Table | Volume Estimate | Partitioning Needed |
|---|---|---|
| User | < 100 | Không |
| Candidate | < 10,000 | Không |
| JobPosting | < 1,000 | Không |
| Application | < 50,000 | Không (có thể xem xét sau) |
| Interview | < 10,000 | Không |
| Offer | < 5,000 | Không |
| Probation | < 1,000 | Không |
| ProbationEvaluation | < 1,000 | Không |

Hiện tại không cần partitioning do volume dữ liệu còn thấp. Khi số lượng Application vượt 100,000 rows có thể xét partition theo tháng.

## 7. Data Ownership Mapping

| Table | Owning Component | Access Pattern |
|---|---|---|
| User | Auth & User Management | Read/Write: Auth service, Read: All services |
| Candidate | Application Management | Read/Write: Application service |
| JobPosting | Job Management | Read/Write: Job service, Read: Public |
| Application | Application Management | Read/Write: Application service |
| Interview | Interview Management | Read/Write: Interview service |
| Offer | Offer Management | Read/Write: Offer service |
| Probation | Probation Management | Read/Write: Probation service |
| ProbationEvaluation | Probation Management | Read/Write: Probation service |

**Ghi chú:** Đây là monolithic backend nên tất cả service đều truy cập chung database. Ownership ở đây mang tính logic (service nào chịu trách nhiệm chính), không phải physical schema separation.

---

*Lưu ý: Chi tiết indexes, constraints, DDL scripts hoàn chỉnh sẽ được thực hiện ở bước 6.4 Database Detail Design.*
