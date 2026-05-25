# DOC 6.2-A: Sequence Diagrams

## 1. Overview

### Purpose
Mô tả chi tiết interactions giữa các objects theo thời gian cho các use case chính, xác định method calls, parameters, return values, và control flow.

### Notation Guide
| Symbol | Meaning |
|---|---|
| `→` | Method call (solid arrow) |
| `⇢` | Return value (dashed arrow) |
| `[alt]` | Conditional fragment (if-else) |
| `[loop]` | Loop fragment |
| `[opt]` | Optional fragment |
| `X` | Exception/Error |
| `Participant` | Object/Class instance |

### Use Cases Selected
| # | Use Case | Priority | Complexity |
|---|---|---|---|
| 1 | UC-01: Login (Main flow + Error) | Cao | Trung bình |
| 2 | UC-03: Submit Application (Main flow + Validation) | Cao | Cao |
| 3 | UC-05: Schedule Interview (Main flow + Conflict check) | Cao | Cao |
| 4 | UC-07: Evaluate Interview (Main flow) | Cao | Trung bình |
| 5 | UC-08 → UC-09: Create & Approve Offer (Main flow) | Cao | Cao |
| 6 | UC-10: Respond to Offer via Token (Main flow + Alt) | Cao | Trung bình |
| 7 | UC-12 → UC-14: Evaluate & Approve Probation (Main flow) | Cao | Cao |

---

## 2. Sequence Diagrams

### 2.1 UC-01: Login

**Scenario:** Người dùng đăng nhập thành công và được chuyển hướng theo role.

```
Actor: Người dùng
Participants: LoginPage, AuthContext, AuthService(FE), AuthController(BE),
              AuthService(BE), UserRepository, CryptoUtils

Người dùng     LoginPage       AuthContext     AuthService(FE)    AuthController    AuthService(BE)    UserRepository    CryptoUtils
    │              │               │                │                   │                 │                    │               │
    │─(1)─Nhập────▶│               │                │                   │                 │                    │               │
    │   email+pass │               │                │                   │                 │                    │               │
    │              │─(2)─login()──▶│                │                   │                 │                    │               │
    │              │               │─(3)─login()───▶│                   │                 │                    │               │
    │              │               │                │─POST /auth/login─▶│                 │                    │               │
    │              │               │                │                   │─(4)─login()─────▶│                    │               │
    │              │               │                │                   │                 │─(5)─findByEmail()─▶│               │
    │              │               │                │                   │                 │◅─────────────────────│               │
    │              │               │                │                   │                 │   User | null       │               │
    │              │               │                │                   │                 │                    │               │
    │              │               │                │                   │                 │──[alt]──user found──│               │
    │              │               │                │                   │                 │─(6)─comparePass()──▶│               │
    │              │               │                │                   │                 │◅─────────────────────│               │
    │              │               │                │                   │                 │  true | false       │               │
    │              │               │                │                   │                 │                    │               │
    │              │               │                │                   │──[alt]──pass────│─(7)─genAccessToken▶│               │
    │              │               │                │                   │   match         │  (user payload)    │               │
    │              │               │                │                   │                 │◅─────────────────────│               │
    │              │               │                │◅─── 200 OK ───────│                 │  token:string       │               │
    │              │               │                │   {token, user}   │                 │                    │               │
    │              │               │◅───AuthResp───│                   │                 │                    │               │
    │              │◅───User──────│                │                   │                 │                    │               │
    │              │               │                │                   │                 │                    │               │
    │              │──[opt] Lưu──▶│                │                   │                 │                    │               │
    │              │   token vào   │                │                   │                 │                    │               │
    │              │   localStorage│                │                   │                 │                    │               │
    │              │               │                │                   │                 │                    │               │
    │              │──redirect─────│                │                   │                 │                    │               │
    │              │   /recruiter/ │                │                   │                 │                    │               │
    │              │   dashboard   │                │                   │                 │                    │               │
    │              │               │                │                   │                 │                    │               │
```

**Alternative - Sai mật khẩu:**
```
    │              │               │                │                   │                 │                    │               │
    │              │               │                │                   │                 │──[alt]──wrong──────│               │
    │              │               │                │                   │                 │  pass              │               │
    │              │               │                │◅─── 401 ──────────│◅──throw───────│                    │               │
    │              │               │                │  "Email or        │   AppError      │                    │               │
    │              │               │                │  password inc."   │  (401)          │                    │               │
    │              │               │◅───error─────│                   │                 │                    │               │
    │              │◅───error─────│                │                   │                 │                    │               │
    │◅───hiển thị──│               │                │                   │                 │                    │               │
    │   "Email hoặc               │                │                   │                 │                    │               │
    │   mật khẩu                   │                │                   │                 │                    │               │
    │   không đúng"               │                │                   │                 │                    │               │
```

---

### 2.2 UC-03: Submit Application

**Scenario:** Ứng viên nộp hồ sơ thành công.

```
Actor: Ứng viên
Participants: JobDetailPage, UploadMiddleware(Cloudinary),
              ApplicationController, ApplicationService(BE),
              ApplicationRepository, CandidateRepository, EmailService

Ứng viên         JobDetailPage         UploadMW         AppController      AppService         AppRepo        CandidateRepo    EmailService
    │                  │                  │                  │                  │                 │                │                │
    │─(1)─Điền form──▶│                  │                  │                  │                 │                │                │
    │   + upload CV    │                  │                  │                  │                 │                │                │
    │                  │──(2)─POST──────▶│                  │                  │                 │                │                │
    │                  │   /applications  │                  │                  │                 │                │                │
    │                  │   multipart/form │                  │                  │                 │                │                │
    │                  │                  │──[validate]─────│                  │                 │                │                │
    │                  │                  │  file type + size│                  │                 │                │                │
    │                  │                  │                  │                  │                 │                │                │
    │                  │──[alt]──invalid─│  X MulterError   │                  │                 │                │                │
    │                  │   file           │  (400)           │                  │                 │                │                │
    │                  │                  │                  │                  │                 │                │                │
    │                  │──[alt]──valid────│─upload▶Cloudinary│                  │                 │                │                │
    │                  │   file           │  ⇢ cloudinaryUrl │                  │                 │                │                │
    │                  │                  │─(3)─submit()───▶│                  │                 │                │                │
    │                  │                  │                  │─(4)─submit()───▶│                 │                │                │
    │                  │                  │                  │                 │─(5)─findByEmail▶│                │                │
    │                  │                  │                  │                 │◅─────────────────│                │                │
    │                  │                  │                  │                 │   Candidate|null │                │                │
    │                  │                  │                  │                 │                  │                │                │
    │                  │                  │                  │                 │──[alt]──not──────│─(6)─create()──▶│                │
    │                  │                  │                  │                 │   found          │◅────────────────│                │
    │                  │                  │                  │                 │                  │  newCandidate   │                │
    │                  │                  │                  │                 │                              │                │
    │                  │                  │                  │                 │─(7)─create(app)────────────▶│                │
    │                  │                  │                  │                 │◅─────────────────────────────│                │
    │                  │                  │                  │                 │  newApplication              │                │
    │                  │                  │                  │                 │                              │                │
    │                  │                  │                  │                 │─(8)─sendConfirmEmail()───────│───────────────▶│
    │                  │                  │                  │                 │                              │                │
    │                  │                  │◅─── 201 ────────│◅──────────────│                              │                │
    │                  │◅───success─────│                  │                  │                 │                │                │
    │◅───"Nộp hồ sơ────│                  │                  │                  │                 │                │                │
    │   thành công!"    │                  │                  │                  │                 │                │                │
```

---

### 2.3 UC-05: Schedule Interview

**Scenario:** Recruiter tạo lịch phỏng vấn, hệ thống kiểm tra xung đột.

```
Actor: Recruiter
Participants: ManagerInterviewsPage, InterviewController, InterviewService(BE),
              InterviewRepository, UserRepository, EmailService

Recruiter        ManagerInterviewsPage      InterviewController    InterviewService       InterviewRepo      UserRepo      EmailService
    │                      │                        │                    │                     │                │              │
    │─(1)─Chọn app +──────▶│                        │                    │                     │                │              │
    │   interviewer + date │                        │                    │                     │                │              │
    │                      │─(2)─POST /interviews─▶│                    │                     │                │              │
    │                      │   {appId,interviewer, │                    │                     │                │              │
    │                      │    interviewDate,type} │─(3)─schedule()───▶│                     │                │              │
    │                      │                        │                    │                     │                │              │
    │                      │                        │                    │─(4)─findByDate()───▶│                │              │
    │                      │                        │                    │  (interviewerId,date)│                │              │
    │                      │                        │                    │◅─────────────────────│                │              │
    │                      │                        │                    │  existingInterviews  │                │              │
    │                      │                        │                    │                     │                │              │
    │                      │                        │                    │──[alt]──has────────│                │              │
    │                      │                        │                    │  conflict           │                │              │
    │                      │◅─── 409 ──────────────│◅───throw──────────│                     │                │              │
    │◅───"Trùng lịch!"────│                        │    AppError(409)   │                     │                │              │
    │                      │                        │                    │                     │                │              │
    │                      │                        │                    │──[alt]──no─────────│─(5)─create()──▶│              │
    │                      │                        │                    │  conflict           │◅───────────────│              │
    │                      │                        │                    │                     │  newInterview  │              │
    │                      │                        │                    │                     │                │              │
    │                      │                        │                    │─(6)─getInterviewer▶│                │              │
    │                      │                        │                    │◅────────────────────│                │              │
    │                      │                        │                    │                     │                │              │
    │                      │                        │                    │─(7)─sendInvite()───│────────────────│─────────────▶│
    │                      │                        │                    │  (interviewer,      │                │              │
    │                      │                        │                    │   candidate)        │                │              │
    │                      │                        │                    │                     │                │              │
    │                      │◅─── 201 ──────────────│◅──────────────────│                     │                │              │
    │◅───"Đặt lịch PV─────│                        │                    │                     │                │              │
    │   thành công!"       │                        │                    │                     │                │              │
```

---

### 2.4 UC-07: Evaluate Interview

**Scenario:** Hiring Manager nhập điểm và đánh giá sau phỏng vấn.

```
Actor: Hiring Manager
Participants: ManagerReviewsPage, InterviewController, InterviewService(BE),
              InterviewRepository, ApplicationRepository

HM              ManagerReviewsPage       InterviewController     InterviewService      InterviewRepo      AppRepo
│                      │                        │                    │                     │                │
│─(1)─Xem danh sách──▶│                        │                    │                     │                │
│   PV cần đánh giá    │──GET /interviews─────▶│                    │                     │                │
│                      │                        │─getInterviews()──▶│─findAll(filters)──▶│                │
│                      │                        │◅──────────────────│◅────────────────────│                │
│                      │◅───list──────────────│                    │                     │                │
│◅───hiển thị─────────│                        │                    │                     │                │
│                      │                        │                    │                     │                │
│─(2)─Nhập điểm──────▶│                        │                    │                     │                │
│   (tech, soft,       │──PATCH /interviews/──▶│                    │                     │                │
│    attitude, result) │   :id/evaluate         │                    │                     │                │
│                      │                        │─evaluate()───────▶│                     │                │
│                      │                        │  (id, userId,     │                     │                │
│                      │                        │   role, body)     │                     │                │
│                      │                        │                    │                     │                │
│                      │                        │                    │──[auth]─check──────│                │
│                      │                        │                    │  interviewer match │                │
│                      │                        │                    │                     │                │
│                      │                        │                    │─(3)─update()──────▶│                │
│                      │                        │                    │  {scores, result,  │                │
│                      │                        │                    │   feedback}        │                │
│                      │                        │                    │◅────────────────────│                │
│                      │                        │                    │                     │                │
│                      │                        │                    │──[alt]──result─────│─updateStatus()▶│
│                      │                        │                    │  = "Pass"          │  →"Interview-  │
│                      │                        │                    │                     │  ingPassed"    │
│                      │                        │                    │──[alt]──result─────│─updateStatus()▶│
│                      │                        │                    │  = "Fail"          │  →"Interview-  │
│                      │                        │                    │                     │  ingFailed"    │
│                      │                        │                    │                     │                │
│                      │◅─── 200 ──────────────│◅──────────────────│                     │                │
│◅───"Đã lưu đánh giá"│                        │                    │                     │                │
```

---

### 2.5 UC-08 → UC-09: Create & Approve Offer

**Scenario:** Recruiter tạo Offer → Director phê duyệt → Email gửi ứng viên.

```
Actor: Recruiter, Director
Participants: RecruiterOffersPage, DirectorApprovalsPage,
              OfferController, OfferService(BE), OfferRepository,
              ApplicationRepository, UserRepository, EmailService

─── Phase 1: Recruiter tạo Offer ───

Recruiter       RecruiterOffersPage      OfferController        OfferService          OfferRepo       AppRepo      EmailService
    │                      │                    │                    │                     │              │              │
    │─(1)─Select app─────▶│                    │                    │                     │              │              │
    │   Interview Passed   │                    │                    │                     │              │              │
    │                      │                    │                    │                     │              │              │
    │─(2)─Nhập salary────▶│                    │                    │                     │              │              │
    │   allowance,         │──POST /offers────▶│                    │                     │              │              │
    │   startDate          │  {appId, baseSal, │                    │                     │              │              │
    │                      │   allowance, ...} │─createOffer()────▶│                     │              │              │
    │                      │                    │  (userId, data)   │                     │              │              │
    │                      │                    │                    │                     │              │              │
    │                      │                    │                    │──[validate]─check──▶│─findById()──▶│              │
    │                      │                    │                    │  app status =       │◅─────────────│              │
    │                      │                    │                    │  "Interview Passed" │              │              │
    │                      │                    │                    │                     │              │              │
    │                      │                    │                    │──[alt]──not────────│              │              │
    │                      │                    │                    │  passed             │  X AppError  │              │
    │                      │                    │                    │                     │  (400)        │              │
    │                      │                    │                    │                     │              │              │
    │                      │                    │                    │──[alt]──passed─────│─create()────▶│              │
    │                      │                    │                    │                     │◅─────────────│              │
    │                      │                    │                    │                     │  newOffer    │              │
    │                      │◅─── 201 ──────────│◅──────────────────│                     │              │              │
    │◅───"Offer đã tạo,───│                    │                    │                     │              │              │
    │   chờ duyệt"         │                    │                    │                     │              │              │

─── Phase 2: Director phê duyệt ───

Director        DirectorApprovalsPage      OfferController        OfferService          OfferRepo      UserRepo     EmailService
    │                      │                    │                    │                     │              │              │
    │─(3)─Xem Offer──────▶│                    │                    │                     │              │              │
    │   Pending Approval   │──GET /offers─────▶│                    │                     │              │              │
    │                      │◅───list──────────│                    │                     │              │              │
    │                      │                    │                    │                     │              │              │
    │─(4)─Duyệt Offer────▶│                    │                    │                     │              │              │
    │   + note             │──PATCH /offers/──▶│                    │                     │              │              │
    │                      │   :id/approve      │                    │                     │              │              │
    │                      │  {status:"Approv", │─approveOffer()───▶│                     │              │              │
    │                      │   directorNote}    │  (id, userId, st)  │                     │              │              │
    │                      │                    │                    │                     │              │              │
    │                      │                    │                    │──[alt]──Approve────│─update()────▶│              │
    │                      │                    │                    │                     │  status=     │              │
    │                      │                    │                    │                     │  "Approved"  │              │
    │                      │                    │                    │                     │  + token     │              │
    │                      │                    │                    │─sendOfferEmail()───│──────────────│─────────────▶│
    │                      │                    │                    │  (candidate, job,  │              │  Email với  │
    │                      │                    │                    │   salary, token)    │              │  link phản  │
    │                      │                    │                    │                     │              │  hồi        │
    │                      │                    │                    │                     │              │              │
    │                      │                    │                    │──[alt]──Reject─────│─update()────▶│              │
    │                      │                    │                    │                     │  status=     │              │
    │                      │                    │                    │                     │  "Rejected"  │              │
    │                      │                    │                    │                     │  + note      │              │
    │                      │                    │                    │                     │              │              │
    │                      │◅─── 200 ──────────│◅──────────────────│                     │              │              │
    │◅───"Offer Approved!"│                    │                    │                     │              │              │
```

---

### 2.6 UC-10: Respond to Offer via Token

**Scenario:** Ứng viên nhận email, click link, chấp nhận hoặc từ chối Offer.

```
Actor: Ứng viên (không cần đăng nhập)
Participants: OfferResponsePage, OfferController, OfferService(BE),
              OfferRepository, UserRepository, EmailService

Ứng viên         OfferResponsePage        OfferController        OfferService         OfferRepo       UserRepo      EmailService
    │                      │                    │                    │                     │              │              │
    │─(1)─Click link──────▶│                    │                    │                     │              │              │
    │   /offer-response/   │                    │                    │                     │              │              │
    │   :token             │─GET /offer-resp──▶│                    │                     │              │              │
    │                      │   /:token          │─getOfferByToken──▶│─findByToken()─────▶│              │              │
    │                      │                    │                    │◅────────────────────│              │              │
    │                      │◅───{candidateName,│◅──────────────────│  offer + candidate  │              │              │
    │                      │    jobTitle,       │                    │  + job info         │              │              │
    │                      │    salary, status} │                    │                     │              │              │
    │◅───Hiển thị thông───│                    │                    │                     │              │              │
    │   tin Offer & nút    │                    │                    │                     │              │              │
    │   "Chấp nhận/Từ chối"│                    │                    │                     │              │              │
    │                      │                    │                    │                     │              │              │
    │──[alt]──Accept──────▶│                    │                    │                     │              │              │
    │                      │──POST /offer-────▶│                    │                     │              │              │
    │                      │   response/:token  │                    │                     │              │              │
    │                      │   /accept          │─acceptOffer()────▶│                     │              │              │
    │                      │                    │  (token)           │                     │              │              │
    │                      │                    │                    │──[validate]─verify──▶│              │              │
    │                      │                    │                    │  token hợp lệ       │◅─────────────│              │
    │                      │                    │                    │                     │              │              │
    │                      │                    │                    │─(1)─updateOffer───▶│              │              │
    │                      │                    │                    │  status="Accepted"  │◅─────────────│              │
    │                      │                    │                    │                     │              │              │
    │                      │                    │                    │─(2)─createUser─────│──────────────│─create()───▶│
    │                      │                    │                    │  (random password,  │              │  role=Prob- │
    │                      │                    │                    │   role=Probationer) │              │  ationer    │
    │                      │                    │                    │                     │              │◅────────────│
    │                      │                    │                    │                     │              │  newUser    │
    │                      │                    │                    │─(3)─updateAppStatus│              │             │
    │                      │                    │                    │  → "Hired"         │              │             │
    │                      │                    │                    │                     │              │             │
    │                      │                    │                    │─(4)─sendWelcome───│──────────────│────────────▶│
    │                      │                    │                    │  Email(password)    │              │             │
    │                      │                    │                    │                     │              │             │
    │                      │◅─── 200 ──────────│◅──────────────────│                     │              │             │
    │◅───"Chúc mừng! Bạn───│                    │                    │                     │              │             │
    │   đã trở thành nhân                    │                    │                     │              │             │
    │   viên của công ty!"                   │                    │                     │              │             │
    │                      │                    │                    │                     │              │             │
    │──[alt]──Decline─────▶│                    │                    │                     │              │             │
    │   + lý do            │──POST /offer-────▶│                    │                     │              │             │
    │                      │   response/:token  │                    │                     │              │             │
    │                      │   /decline         │─declineOffer()───▶│                     │              │             │
    │                      │   {reason}         │                    │                     │              │             │
    │                      │                    │                    │─updateOffer───────▶│              │             │
    │                      │                    │                    │  status="Declined"  │◅─────────────│             │
    │                      │                    │                    │  declineReason=...  │              │             │
    │                      │                    │                    │                     │              │             │
    │                      │                    │                    │─sendDeclineNotice──│──────────────│────────────▶│
    │                      │                    │                    │  (Recruiter)        │              │             │
    │                      │                    │                    │                     │              │             │
    │                      │◅─── 200 ──────────│◅──────────────────│                     │              │             │
    │◅───"Bạn đã từ chối───│                    │                    │                     │              │             │
    │   Offer. Cảm ơn!"    │                    │                    │                     │              │             │
```

---

### 2.7 UC-12 → UC-14: Evaluate & Approve Probation

**Scenario:** Hiring Manager đánh giá thử việc → Director phê duyệt → Email kết quả.

```
Actor: Hiring Manager, Director
Participants: RecruiterProbationPage, ProbationController, ProbationService(BE),
              ProbationRepository, EmailService

─── Phase 1: HM đánh giá ───

HM              RecruiterProbationPage     ProbationController    ProbationService      ProbationRepo      EmailService
│                      │                        │                    │                     │                  │
│─(1)─Xem danh sách──▶│                        │                    │                     │                  │
│   thử việc + nhấn    │──PUT /probations/───▶│                    │                     │                  │
│   "Đánh giá"         │   :id/evaluate         │                    │                     │                  │
│                      │  {kpiScore, comment,  │─evaluateProb()───▶│                     │                  │
│                      │   recommendation,     │  (id, userId,     │                     │                  │
│                      │   isSubmit: true}      │   role, data)     │                     │                  │
│                      │                        │                    │                     │                  │
│                      │                        │                    │──[alt]──isSubmit───│─upsertEval()───▶│
│                      │                        │                    │  = true             │  status =       │
│                      │                        │                    │                     │  "Pending-      │
│                      │                        │                    │                     │  Approval"      │
│                      │                        │                    │─updateProbStatus──▶│  "Pending-      │
│                      │                        │                    │                     │  Approval"      │
│                      │                        │                    │                     │                  │
│                      │                        │                    │──[alt]──isSubmit───│─upsertEval()───▶│
│                      │                        │                    │  = false (draft)   │  status =       │
│                      │                        │                    │                     │  "Draft"        │
│                      │                        │                    │                     │                  │
│                      │◅─── 200 ──────────────│◅──────────────────│                     │                  │
│◅───"Đã gửi duyệt"───│                        │                    │                     │                  │
│                      │                        │                    │                     │                  │
│                      │                        │                    │                     │                  │
│─── Phase 2: Director phê duyệt ───           │                    │                     │                  │
│                      │                        │                    │                     │                  │
Director        DirectorApprovalsPage     ProbationController    ProbationService      ProbationRepo      EmailService
│                      │                        │                    │                     │                  │
│─(3)─Xem đánh giá────▶│                        │                    │                     │                  │
│   Pending Approval    │──PATCH /probations/─▶│                    │                     │                  │
│                      │   :id/approve          │                    │                     │                  │
│                      │  {status:"Approved",  │─approveEval()────▶│                     │                  │
│                      │   directorNote}        │  (id, userId,     │                     │                  │
│                      │                        │   status, note)   │                     │                  │
│                      │                        │                    │                     │                  │
│                      │                        │                    │──[alt]──Approved───│─updateEval()───▶│
│                      │                        │                    │                     │  status=        │
│                      │                        │                    │                     │  "Approved"     │
│                      │                        │                    │─updateProbStatus──▶│  "Pass"/"Fail"  │
│                      │                        │                    │  (dựa theo recomm.)│                  │
│                      │                        │                    │                     │                  │
│                      │                        │                    │─sendResultEmail───│─────────────────│────────────────▶│
│                      │                        │                    │  (Probationer,     │                  │  Email kết     │
│                      │                        │                    │   kết quả, next)   │                  │  quả thử việc  │
│                      │                        │                    │                     │                  │                  │
│                      │                        │                    │──[alt]──Rejected───│─updateEval()───▶│                  │
│                      │                        │                    │                     │  status=        │                  │
│                      │                        │                    │                     │  "Rejected"     │                  │
│                      │                        │                    │  + directorNote    │                  │                  │
│                      │                        │                    │  (trả về HM)       │                  │                  │
│                      │                        │                    │                     │                  │                  │
│                      │◅─── 200 ──────────────│◅──────────────────│                     │                  │
│◅───"Đã phê duyệt"───│                        │                    │                     │                  │
```

---

## 3. Cross-Reference Matrix

| Use Case | Classes Involved | Key Methods Called |
|---|---|---|
| **UC-01 Login** | LoginPage, AuthContext, AuthService(FE), AuthController, AuthService(BE), UserRepository, CryptoUtils | login(), findByEmail(), comparePassword(), generateAccessToken() |
| **UC-03 Submit App** | JobDetailPage, UploadMiddleware, ApplicationController, ApplicationService(BE), ApplicationRepository, CandidateRepository, EmailService | submitApplication(), findByEmail(), create(), sendConfirmEmail() |
| **UC-05 Schedule Interview** | ManagerInterviewsPage, InterviewController, InterviewService(BE), InterviewRepository, EmailService | scheduleInterview(), findByDate() (conflict), create(), sendInvite() |
| **UC-07 Evaluate Interview** | ManagerReviewsPage, InterviewController, InterviewService(BE), InterviewRepository, ApplicationRepository | evaluateInterview(), update(), updateApplicationStatus() |
| **UC-08 → UC-09 Create & Approve Offer** | RecruiterOffersPage, DirectorApprovalsPage, OfferController, OfferService(BE), OfferRepository, ApplicationRepository, EmailService | createOffer(), approveOffer(), update(), sendOfferEmail() |
| **UC-10 Respond Offer** | OfferResponsePage, OfferController, OfferService(BE), OfferRepository, UserRepository, EmailService | getOfferByToken(), respondToOffer(), createUser(), sendWelcomeEmail() |
| **UC-12 → UC-14 Evaluate Probation** | RecruiterProbationPage, ProbationController, ProbationService(BE), ProbationRepository, EmailService | evaluateProbation(), approveEvaluation(), upsertEval(), sendResultEmail() |

---

## 4. Design Notes

### Patterns Observed
1. **Controller-Service-Repository** pattern xuyên suốt tất cả use cases
2. **Error handling** luôn qua `AppError` + global `ErrorHandler` middleware
3. **Email notifications** được gọi từ Service layer sau khi business logic thành công
4. **Status machine** được quản lý trong Service layer (không ở Controller)

### Consistency Check
| Check | Status |
|---|---|
| Methods in sequence diagrams exist in class diagrams | ✅ Consistent |
| API endpoints match DOC 5.2-A | ✅ 30 endpoints mapped |
| Entity attributes match DOC 5.3-A schema | ✅ 8 entities consistent |
| Layering respected (Controller → Service → Repository) | ✅ No violations |
| Error handling present for alternative flows | ✅ All alts handled |

### Updates Identified to Class Diagrams
- Không có (sequence diagrams xác nhận class diagram đã đầy đủ)

---

*Document based on code analysis of ThucTapCoSo Recruitment Management System.*
*Use cases selected cover 100% of critical business flows (Login, Application, Interview, Offer, Probation).*
