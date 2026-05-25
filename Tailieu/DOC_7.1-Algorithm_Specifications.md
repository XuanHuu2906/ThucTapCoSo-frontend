# DOC 7.1-A: Algorithm Specifications

## 1. Algorithm Catalog

| # | Algorithm | Purpose | REQ | Class/Method | Complexity | Priority |
|---|---|---|---|---|---|---|
| 1 | **CheckInterviewConflict** | Kiểm tra xung đột lịch phỏng vấn | REQ-011 | InterviewService.checkConflict | O(n) | Cao |
| 2 | **CalculateInterviewResult** | Tính kết quả phỏng vấn dựa trên điểm số | REQ-014 | InterviewService.evaluateInterview | O(1) | Cao |
| 3 | **ProcessOfferApproval** | Xử lý luồng phê duyệt Offer | REQ-015, REQ-016 | OfferService.approveOffer | O(1) | Cao |
| 4 | **GenerateDecisionToken** | Sinh token bảo mật cho phản hồi Offer | REQ-017 | OfferService.generateDecisionToken | O(1) | Cao |
| 5 | **AutoCreateProbationerAccount** | Tự động tạo tài khoản Probationer | REQ-019 | OfferService.respondToOffer | O(1) | Cao |
| 6 | **CalculateRemainingDays** | Tính số ngày còn lại của thử việc | REQ-020 | ProbationService.getProbations | O(1) | Trung bình |
| 7 | **CheckEndingSoonProbation** | Kiểm tra thử việc sắp kết thúc (7 ngày) | REQ-022 | ProbationService.getEndingSoon | O(n) | Cao |
| 8 | **ApplicationStatusTransition** | Kiểm tra trạng thái chuyển đổi hợp lệ | REQ-009, REQ-010 | ApplicationService.updateStatus | O(1) | Cao |

---

## 2. Detailed Algorithm Specifications

### 2.1 CheckInterviewConflict

**Purpose:** Kiểm tra xem Hiring Manager đã có lịch phỏng vấn trùng giờ hay chưa trước khi tạo lịch mới.

**Related Requirements:** REQ-011

**Implementing Class/Method:** `InterviewService.checkConflict(interviewerId, interviewDate)`

**Signature:**
```
Input:  interviewerId (number), interviewDate (DateTime)
Output: { hasConflict: boolean, conflictingInterviews: Interview[] }
```

**Preconditions:**
- `interviewerId` phải tồn tại trong database
- `interviewDate` phải là thời gian trong tương lai

**Pseudocode:**
```
ALGORITHM: CheckInterviewConflict
INPUT:  interviewerId (Int), newInterviewDate (DateTime)
OUTPUT: ConflictCheckResult { hasConflict, conflictingInterviews }

BEGIN
    // Bước 1: Lấy tất cả interviews của interviewer trong cùng ngày
    SET startOfDay = newInterviewDate.startOfDay()
    SET endOfDay = newInterviewDate.endOfDay()
    
    SET existingInterviews = InterviewRepository.findByDateRange(
        interviewerId, startOfDay, endOfDay
    )
    
    // Bước 2: Nếu không có lịch nào → không conflict
    IF existingInterviews.isEmpty() THEN
        RETURN { hasConflict: false, conflictingInterviews: [] }
    END IF
    
    // Bước 3: Kiểm tra từng lịch hiện có
    SET conflictingList = []
    
    FOR EACH interview IN existingInterviews DO
        // Xác định khoảng thời gian của lịch mới (mặc định 60 phút)
        SET newStart = newInterviewDate
        SET newEnd = newInterviewDate + 60 minutes
        
        // Xác định khoảng thời gian của lịch cũ
        SET existingStart = interview.interviewDate
        SET existingEnd = interview.interviewDate + 60 minutes
        
        // Kiểm tra overlap
        IF (newStart < existingEnd) AND (newEnd > existingStart) THEN
            ADD interview TO conflictingList
        END IF
    END FOR
    
    // Bước 4: Trả về kết quả
    IF conflictingList.isEmpty() THEN
        RETURN { hasConflict: false, conflictingInterviews: [] }
    ELSE
        RETURN { hasConflict: true, conflictingInterviews: conflictingList }
    END IF
END
```

**Postconditions:**
- Trả về danh sách các interviews bị conflict (nếu có)
- Không tạo interview mới khi có conflict

**Complexity Analysis:**
- **Time:** O(n) với n là số interviews trong ngày của interviewer đó
- **Space:** O(n) cho mảng conflictingList
- **Justification:** Trong thực tế, một interviewer có tối đa 5-10 interviews/ngày, nên O(n) là chấp nhận được

**Edge Cases:**
| Case | Input | Expected |
|---|---|---|
| Không có lịch nào trong ngày | interviewerId=1, date=15/06 | hasConflict=false |
| Trùng giờ chính xác | Cùng interviewer, cùng giờ | hasConflict=true |
| Lịch cũ trước, lịch mới sau nhưng overlap | Cũ: 9h-10h, Mới: 9h30-10h30 | hasConflict=true |
| Lịch cũ trước, lịch mới sau không overlap | Cũ: 9h-10h, Mới: 10h-11h | hasConflict=false |
| Nhiều lịch conflict cùng lúc | 3 lịch trùng trong cùng khung giờ | hasConflict=true, 3 conflicts |

**Example:**
```
Input:  interviewerId = 5, interviewDate = "2026-06-15T09:00:00Z"
Existing: [{ id=10, date="2026-06-15T09:00:00Z" }, { id=12, date="2026-06-15T10:30:00Z" }]
Output: { hasConflict: true, conflictingInterviews: [{ id=10, ... }] }
// Giải thích: Lịch id=10 trùng 9h, lịch id=12 lúc 10h30 không trùng
```

---

### 2.2 CalculateInterviewResult

**Purpose:** Tính toán và xác định kết quả phỏng vấn dựa trên điểm số từ Hiring Manager.

**Related Requirements:** REQ-014

**Implementing Class/Method:** `InterviewService.evaluateInterview()`

**Signature:**
```
Input:  technicalScore (number 0-10),
        softScore (number 0-10),
        attitudeScore (number 0-10),
        result (string: "Pass" | "Fail")
Output: EvaluationResult { finalResult, averageScore, applicationStatus }
```

**Preconditions:**
- Tất cả điểm số phải trong khoảng 0-10
- Interview phải có status != "Pending"

**Pseudocode:**
```
ALGORITHM: CalculateInterviewResult
INPUT:  technicalScore (Int), softScore (Int), attitudeScore (Int), result (String)
OUTPUT: EvaluationResult

BEGIN
    // Bước 1: Validate điểm số
    IF technicalScore < 0 OR technicalScore > 10
        OR softScore < 0 OR softScore > 10
        OR attitudeScore < 0 OR attitudeScore > 10 THEN
        THROW ValidationException("Scores must be between 0 and 10")
    END IF
    
    // Bước 2: Tính điểm trung bình
    SET averageScore = (technicalScore + softScore + attitudeScore) / 3
    
    // Bước 3: Xác định kết quả
    // Nếu HM chọn "Pass" → Interview Passed
    // Nếu HM chọn "Fail" → Interview Failed
    IF result == "Pass" THEN
        SET finalResult = "Pass"
        SET applicationStatus = "InterviewPassed"   // Cho phép tạo Offer
    ELSE
        SET finalResult = "Fail"
        SET applicationStatus = "InterviewFailed"   // Không thể tạo Offer
    END IF
    
    // Bước 4: Lưu điểm số vào database
    CALL InterviewRepository.update(interviewId, {
        technicalScore, softScore, attitudeScore,
        result: finalResult, feedback
    })
    
    // Bước 5: Cập nhật trạng thái Application
    CALL ApplicationRepository.updateStatus(appId, applicationStatus)
    
    RETURN {
        finalResult: finalResult,
        averageScore: averageScore,
        applicationStatus: applicationStatus
    }
END
```

**Postconditions:**
- Điểm số được lưu vào Interview table
- Application.status được cập nhật tương ứng
- Nếu "InterviewPassed" → Recruiter có thể tạo Offer

**Complexity Analysis:** O(1) - chỉ tính toán đơn giản

**Edge Cases:**
| Case | Input | Expected |
|---|---|---|
| Điểm tối đa | 10, 10, 10, "Pass" | avg=10, status=InterviewPassed |
| Điểm tối thiểu | 0, 0, 0, "Fail" | avg=0, status=InterviewFailed |
| Điểm cao nhưng HM chọn Fail | 9, 8, 9, "Fail" | status=InterviewFailed |
| Điểm thấp nhưng HM chọn Pass | 4, 5, 3, "Pass" | status=InterviewPassed |

---

### 2.3 ProcessOfferApproval

**Purpose:** Xử lý luồng phê duyệt Offer từ Director, kèm theo gửi email thư mời.

**Related Requirements:** REQ-015, REQ-016, REQ-017

**Implementing Class/Method:** `OfferService.approveOffer()`

**Signature:**
```
Input:  offerId (number), userId (number), status (string), directorNote (string?)
Output: UpdatedOffer
```

**Preconditions:**
- Offer phải ở trạng thái "Pending"
- User phải có role "Director" hoặc "Admin"
- Application của Offer phải có status "InterviewPassed"

**Pseudocode:**
```
ALGORITHM: ProcessOfferApproval
INPUT:  offerId (Int), directorId (Int), decisionStatus (String), directorNote (String?)
OUTPUT: Offer

BEGIN
    // Bước 1: Kiểm tra Offer tồn tại
    SET offer = OfferRepository.findById(offerId)
    IF offer == null THEN
        THROW NotFoundException("Offer not found")
    END IF
    
    // Bước 2: Kiểm tra trạng thái hiện tại
    IF offer.status != "Pending" THEN
        THROW BusinessRuleException(
            "Cannot approve offer with status: " + offer.status
        )
    END IF
    
    // Bước 3: Xử lý theo decision
    IF decisionStatus == "Approved" THEN
        // 3a. Cập nhật Offer status
        SET token = GenerateDecisionToken()   // Algorithm 2.4
        SET offer = OfferRepository.update(offerId, {
            status: "Approved",
            approvedBy: directorId,
            directorNote: directorNote,
            decisionToken: token
        })
        
        // 3b. Gửi email thư mời cho ứng viên
        CALL EmailService.sendOfferEmail(
            candidateEmail: offer.application.candidate.email,
            candidateName: offer.application.candidate.fullName,
            jobTitle: offer.application.jobPosting.title,
            baseSalary: offer.baseSalary,
            startDate: offer.startDate,
            decisionToken: token
        )
        
    ELSE IF decisionStatus == "Rejected" THEN
        // 3c. Từ chối Offer
        SET offer = OfferRepository.update(offerId, {
            status: "Rejected",
            approvedBy: directorId,
            directorNote: directorNote
        })
        
        // 3d. Thông báo cho Recruiter
        CALL EmailService.sendRejectionNotification(
            recruiterEmail: offer.createdByUser.email,
            offerId: offer.offerId,
            directorNote: directorNote
        )
    END IF
    
    RETURN offer
END
```

**Postconditions:**
- Nếu Approved: Offer.status = "Approved", có decisionToken, email gửi ứng viên
- Nếu Rejected: Offer.status = "Rejected", email thông báo Recruiter

**Complexity Analysis:** O(1)

**Edge Cases:**
| Case | Expected |
|---|---|
| Offer không tồn tại | Throw NotFoundException |
| Offer đã được duyệt trước đó | Throw BusinessRuleException |
| Offer bị từ chối + ghi chú | Lưu directorNote, gửi email Recruiter |
| Offer được duyệt + không ghi chú | directorNote = null, vẫn OK |

---

### 2.4 GenerateDecisionToken

**Purpose:** Sinh token ngẫu nhiên an toàn cho ứng viên phản hồi Offer qua email.

**Related Requirements:** REQ-017

**Implementing Class/Method:** `OfferService.generateDecisionToken()`

**Signature:**
```
Input:  none (uses crypto library)
Output: token (string, 64 ký tự hex)
```

**Pseudocode:**
```
ALGORITHM: GenerateDecisionToken
INPUT:  None
OUTPUT: String (64-character hex token)

BEGIN
    // Sử dụng crypto.randomBytes để sinh token an toàn
    SET randomBytes = crypto.randomBytes(32)   // 32 bytes = 256 bits
    
    // Chuyển sang hex string (64 ký tự)
    SET token = randomBytes.toString("hex")
    
    RETURN token
END
```

**Complexity Analysis:** O(1)

**Security Note:** Sử dụng `crypto.randomBytes()` (không phải `Math.random()`) vì đây là token bảo mật. Token 256-bit (32 bytes) đáp ứng tiêu chuẩn bảo mật.

---

### 2.5 AutoCreateProbationerAccount

**Purpose:** Tự động tạo tài khoản cho nhân viên thử việc khi ứng viên chấp nhận Offer.

**Related Requirements:** REQ-019

**Implementing Class/Method:** `OfferService.respondToOffer(token, "accept")`

**Signature:**
```
Input:  token (string), action ("accept")
Output: { message, user }
```

**Pseudocode:**
```
ALGORITHM: AutoCreateProbationerAccount
INPUT:  token (String)
OUTPUT: { message, user }

BEGIN
    // Bước 1: Xác thực token
    SET offer = OfferRepository.findByToken(token)
    IF offer == null OR offer.status != "Approved" THEN
        THROW BusinessRuleException("Invalid or expired token")
    END IF
    
    // Bước 2: Cập nhật Offer status
    SET offer = OfferRepository.update(offer.offerId, {
        status: "Accepted"
    })
    
    // Bước 3: Cập nhật Application status
    CALL ApplicationRepository.updateStatus(offer.appId, "Hired")
    
    // Bước 4: Sinh mật khẩu ngẫu nhiên
    SET randomPassword = crypto.randomBytes(12).toString("base64")
    // Đảm bảo password >= 12 ký tự, hỗn hợp ký tự
    
    // Bước 5: Hash password
    SET hashedPassword = hashPassword(randomPassword)
    
    // Bước 6: Tạo User mới với role Probationer
    SET newUser = UserRepository.create({
        fullName: offer.application.candidate.fullName,
        email: offer.application.candidate.email,
        password: hashedPassword,
        role: "Probationer",
        status: "Active"
    })
    
    // Bước 7: Gửi email thông tin đăng nhập
    CALL EmailService.sendWelcomeEmail(
        email: newUser.email,
        fullName: newUser.fullName,
        password: randomPassword
    )
    
    RETURN { message: "Account created successfully", user: newUser }
END
```

**Postconditions:**
- Offer.status = "Accepted"
- Application.status = "Hired"
- User mới được tạo với role Probationer
- Email thông tin đăng nhập gửi đến ứng viên

**Complexity Analysis:** O(1)

**Edge Cases:**
| Case | Expected |
|---|---|
| Token không hợp lệ | Throw BusinessRuleException |
| Offer đã hết hạn (quá 30 ngày) | Có thể thêm validation |
| Email đã tồn tại (candidate trùng) | Throw exception (unique constraint) |

---

### 2.6 CalculateRemainingDays

**Purpose:** Tính số ngày còn lại trong thời gian thử việc để hiển thị trên danh sách.

**Related Requirements:** REQ-020

**Implementing Class/Method:** `ProbationService (trong getProbations)`

**Signature:**
```
Input:  endDate (Date)
Output: remainingDays (number)
```

**Pseudocode:**
```
ALGORITHM: CalculateRemainingDays
INPUT:  endDate (Date)
OUTPUT: Int (số ngày còn lại, có thể âm nếu đã hết hạn)

BEGIN
    SET today = NOW().startOfDay()
    SET end = endDate.startOfDay()
    
    // Tính số ngày chênh lệch
    SET remainingDays = (end - today) / (24 * 60 * 60 * 1000)
    
    RETURN remainingDays
END
```

**Complexity Analysis:** O(1)

---

### 2.7 CheckEndingSoonProbation

**Purpose:** Tìm danh sách probation viên còn 7 ngày hoặc ít hơn để gửi email nhắc nhở.

**Related Requirements:** REQ-022

**Implementing Class/Method:** `ProbationService.getEndingSoon()`

**Signature:**
```
Input:  none
Output: Probation[] (danh sách probation sắp kết thúc)
```

**Pseudocode:**
```
ALGORITHM: CheckEndingSoonProbation
INPUT:  None (dựa vào database query)
OUTPUT: List<Probation> (probations ending within 7 days)

BEGIN
    SET today = NOW().startOfDay()
    SET sevenDaysFromNow = today + 7 days
    
    // Query: tìm tất cả probations có endDate trong 7 ngày tới
    // và status = "Ongoing" (chưa được đánh giá)
    SET endingSoonList = ProbationRepository.findEndingSoon({
        startDate: today,
        endDate: sevenDaysFromNow,
        status: "Ongoing"
    })
    
    // Với mỗi probation sắp kết thúc, gửi email nhắc nhở
    FOR EACH probation IN endingSoonList DO
        IF probation.supervisorId != null THEN
            CALL EmailService.sendEvaluationReminder(
                supervisorEmail: probation.supervisor.email,
                probationerName: probation.probationer.fullName,
                endDate: probation.endDate
            )
        END IF
    END FOR
    
    RETURN endingSoonList
END
```

**Postconditions:**
- Email nhắc nhở gửi đến tất cả supervisor của probation sắp kết thúc

**Complexity Analysis:**
- **Time:** O(n) với n là số probation sắp kết thúc
- **DB Query:** O(log n) với index trên endDate

---

### 2.8 ApplicationStatusTransition

**Purpose:** Kiểm tra và xác thực chuyển đổi trạng thái hồ sơ ứng viên.

**Related Requirements:** REQ-009, REQ-010

**Implementing Class/Method:** `ApplicationService.updateApplicationStatus()`

**Signature:**
```
Input:  appId (number), newStatus (string), userId (number)
Output: UpdatedApplication
```

**Pseudocode:**
```
ALGORITHM: ApplicationStatusTransition
INPUT:  appId (Int), newStatus (String), userId (Int)
OUTPUT: Application

// Định nghĩa state machine hợp lệ
CONST ValidTransitions = {
    "New":          ["Screening", "Rejected"],
    "Screening":    ["Shortlisted", "Rejected"],
    "Shortlisted":  ["Interviewing", "Rejected"],
    "Interviewing": ["InterviewPassed", "InterviewFailed"],
    "InterviewPassed": ["Offered"],        // Chỉ khi tạo Offer
    "Offered":      ["Hired"],
    "Rejected":     [],                     // Final state
    "Hired":        []                      // Final state
}

BEGIN
    // Bước 1: Kiểm tra Application tồn tại
    SET application = ApplicationRepository.findById(appId)
    IF application == null THEN
        THROW NotFoundException("Application not found")
    END IF
    
    SET currentStatus = application.status
    
    // Bước 2: Kiểm tra transition hợp lệ
    SET allowedNextStatuses = ValidTransitions[currentStatus]
    
    IF newStatus NOT IN allowedNextStatuses THEN
        THROW BusinessRuleException(
            "Cannot transition from " + currentStatus + 
            " to " + newStatus
        )
    END IF
    
    // Bước 3: Xử lý logic đặc biệt cho từng transition
    IF newStatus == "Shortlisted" THEN
        // REQ-009: Set ManagedBy = userId (Recruiter phụ trách)
        SET application = ApplicationRepository.update(appId, {
            status: newStatus,
            managedBy: userId
        })
    ELSE IF newStatus == "Rejected" THEN
        // REQ-010: Gửi email từ chối tự động
        SET application = ApplicationRepository.update(appId, {
            status: newStatus,
            managedBy: userId
        })
        CALL EmailService.sendRejectionEmail(
            candidateEmail: application.candidate.email,
            candidateName: application.candidate.fullName,
            jobTitle: application.jobPosting.title
        )
    ELSE
        SET application = ApplicationRepository.update(appId, {
            status: newStatus
        })
    END IF
    
    RETURN application
END
```

**Postconditions:**
- Status được cập nhật theo state machine
- Nếu Rejected: tự động gửi email từ chối
- Nếu Shortlisted: gán Recruiter phụ trách

**Complexity Analysis:** O(1)

**Edge Cases:**
| Current Status | Requested Status | Expected |
|---|---|---|
| New | Shortlisted | ✅ Hợp lệ |
| Shortlisted | Rejected | ✅ Hợp lệ + email từ chối |
| Rejected | Shortlisted | ❌ Không hợp lệ (final state) |
| Hired | New | ❌ Không hợp lệ (final state) |

---

## 3. Algorithm Dependencies

```
CheckInterviewConflict
    └── InterviewRepository.findByDateRange()

CalculateInterviewResult
    └── InterviewRepository.update()
    └── ApplicationRepository.updateStatus()

ProcessOfferApproval
    ├── OfferRepository.findById()
    ├── OfferRepository.update()
    ├── GenerateDecisionToken()
    └── EmailService.sendOfferEmail()

GenerateDecisionToken
    └── crypto.randomBytes()

AutoCreateProbationerAccount
    ├── OfferRepository.findByToken()
    ├── OfferRepository.update()
    ├── ApplicationRepository.updateStatus()
    ├── hashPassword()
    ├── UserRepository.create()
    └── EmailService.sendWelcomeEmail()

CheckEndingSoonProbation
    ├── ProbationRepository.findEndingSoon()
    └── EmailService.sendEvaluationReminder()

ApplicationStatusTransition
    ├── ApplicationRepository.findById()
    ├── ApplicationRepository.update()
    └── EmailService.sendRejectionEmail() (chỉ khi Rejected)
```
