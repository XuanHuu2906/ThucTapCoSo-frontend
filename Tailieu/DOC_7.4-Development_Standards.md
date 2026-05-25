# DOC 7.4-A: Coding Standards Document

## 1. Overview

### Tech Stack
| Layer | Language | Framework | Formatter | Linter |
|---|---|---|---|---|
| Frontend | TypeScript 5.9 | React 19, Vite 8 | Prettier | ESLint |
| Backend | TypeScript 5.9 | Express 5 | Prettier | ESLint |
| Database | SQL | PostgreSQL 15+ | - | - |

---

## 2. Naming Conventions

| Element | Convention | Example |
|---|---|---|
| **Classes** | PascalCase | `AuthService`, `JobController` |
| **Functions/Methods** | camelCase | `getJobs()`, `updateApplicationStatus()` |
| **Variables** | camelCase | `user`, `filteredJobs`, `accessToken` |
| **Constants** | UPPER_SNAKE_CASE | `AUTH_TOKEN_KEY`, `HTTP_STATUS` |
| **Files** | kebab-case | `job.service.ts`, `auth.routes.ts` |
| **React Components** | PascalCase (file + component) | `RecruiterJobsPage.tsx` |
| **Types/Interfaces** | PascalCase | `User`, `LoginPayload`, `AuthResponse` |
| **Enums** | PascalCase | `UserRole`, `ApplicationStatus` |
| **Database tables** | PascalCase | `User`, `JobPosting`, `ProbationEvaluation` |
| **Database columns** | PascalCase | `UserID`, `FullName`, `CreatedAt` |
| **Test files** | `{name}.test.ts` | `auth.service.test.ts` |
| **Routes** | kebab-case (URL) | `/api/v1/job-postings` |

### Import Order
```
1. External libraries (react, express, axios)
2. Internal modules (@/components, @/services)
3. Relative imports (./api, ../types)
```

---

## 3. Code Formatting

| Rule | Value |
|---|---|
| **Indentation** | 2 spaces (no tabs) |
| **Line length** | 100 characters max |
| **Quotes** | Single quotes (except JSX) |
| **Semicolons** | Required |
| **Trailing commas** | All (es5 compatible) |
| **Bracket spacing** | `function name() {` (space before `{`) |
| **Arrow parens** | Always: `(x) => x + 1` |

### ESLint Rules (Key)
```json
{
  "no-unused-vars": "error",
  "no-console": "warn",
  "complexity": ["warn", 10],
  "max-lines": ["warn", 300],
  "prefer-const": "error",
  "@typescript-eslint/explicit-function-return-type": "off"
}
```

### Prettier Config
```json
{
  "printWidth": 100,
  "singleQuote": true,
  "trailingComma": "all",
  "semi": true,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

---

## 4. Code Organization

### Frontend Structure
```
src/
├── components/       # Shared UI components (shadcn/ui)
│   ├── layout/       # Header, Sidebar, Footer, DashboardLayout
│   └── ui/           # Button, Table, Dialog, Tabs, Card...
├── pages/            # Page components (grouped by role)
│   ├── recruiter/    # RecruiterDashboard, RecruiterJobs...
│   ├── manager/      # ManagerInterviews, ManagerReviews...
│   ├── director/     # DirectorDashboard, DirectorApprovals...
│   ├── probationer/  # ProbationerDashboard
│   └── candidate/    # OfferResponse
├── services/         # API client layer
├── context/          # React contexts (Auth, Theme, Manager)
├── hooks/            # Custom hooks
├── types/            # TypeScript types/interfaces
├── routes/           # React Router config + ProtectedRoute
├── lib/              # Constants, config
└── utils/            # Date, file helpers
```

### Backend Structure
```
src/
├── controllers/      # Request handlers
├── services/         # Business logic
├── repositories/     # Data access (Prisma)
├── routes/           # Route definitions
│   └── v1/           # API version 1
├── middleware/        # Auth, error handler, upload, validate
├── validators/       # Zod schemas
├── types/            # DTOs, interfaces
├── config/           # Env, CORS
├── constants/        # HTTP status, messages
└── utils/            # Crypto, API response, AppError
```

---

## 5. Documentation Standards

### When to Comment
- **✅ Bắt buộc:** Logic phức tạp, thuật toán, business rules đặc biệt
- **✅ Bắt buộc:** Workaround cho bug của thư viện bên thứ ba
- **✅ Bắt buộc:** Interface/type public
- **❌ Không cần:** Code hiển nhiên (`// increment i`)

### Comment Format
```typescript
// GOOD - giải thích WHY (tại sao)
// Sử dụng refresh token thay vì force logout vì UX mượt hơn

// BAD - giải thích WHAT (code đã thể hiện)
// Tăng i lên 1
i++
```

---

## 6. Code Quality Standards

| Metric | Threshold | Action |
|---|---|---|
| **Cyclomatic complexity** | ≤ 10 per method | Refactor nếu > 10 |
| **Method length** | ≤ 50 lines | Refactor nếu > 50 |
| **File length** | ≤ 300 lines | Split nếu > 300 |
| **Code coverage** | ≥ 80% | Viết thêm test |
| **Duplicate code** | 0% tolerance | Extract helper |

---

## 7. Best Practices

### Error Handling
```typescript
// ✅ ĐÚNG: Specific error handling
if (!user) {
  throw new AppError('User not found', HTTP_STATUS.NOT_FOUND)
}

// ❌ SAI: Generic error
throw new Error('Something went wrong')
```

### Null/Undefined Handling
```typescript
// ✅ ĐÚNG: Optional chaining + nullish coalescing
const name = user?.fullName ?? 'Unknown'
const count = data?.length ?? 0

// ❌ SAI: Non-null assertion bừa bãi
const name = user!.fullName
```

### Async/Await
```typescript
// ✅ ĐÚNG: Async/await với try-catch
async function getData() {
  try {
    return await service.method()
  } catch (error) {
    next(error)
  }
}

// ❌ SAI: Promise.then() lồng nhau
service.method().then(data => {
  process(data).then(result => {
    ...
  })
})
```

### React Components
```typescript
// ✅ ĐÚNG: Named function component
export function RecruiterJobsPage() {
  return <div>...</div>
}

// ❌ SAI: Default export + anonymous
export default function() { ... }
```

### Props Typing
```typescript
// ✅ ĐÚNG: Explicit interface
interface Props {
  userId: string
  onUpdate: (id: string) => void
}

export function UserProfile({ userId, onUpdate }: Props) {
  ...
}
```

---

## 8. Security Standards

| Rule | Implementation |
|---|---|
| **No hardcoded secrets** | Environment variables (`.env`) |
| **Input validation** | Zod schemas cho mọi API endpoint |
| **SQL Injection prevention** | Prisma ORM (parameterized queries) |
| **Password storage** | bcryptjs (salt rounds = 10) |
| **JWT secrets** | ≥ 32 ký tự, không commit lên git |
| **File upload** | Validate type (PDF/DOC/DOCX) + size (<5MB) |
| **CORS** | Whitelist origins theo environment |
| **Security headers** | Helmet.js |
| **Rate limiting** | express-rate-limit (100 req/15 phút) |

---

## 9. Performance Guidelines

| Rule | Reason |
|---|---|
| **Paginate all list endpoints** | Tránh load quá nhiều dữ liệu cùng lúc |
| **Avoid N+1 queries** | Sử dụng Prisma `include` hoặc `select` |
| **Index foreign keys** | Tối ưu JOIN queries |
| **Lazy load routes (FE)** | Code splitting cho mỗi page |
| **Memoize expensive computations** | `useMemo`, `useCallback` |
| **Compress images** | WebP format, Cloudinary optimization |

---

## 10. Code Review Checklist

### Reviewers phải kiểm tra:
- [ ] Có unit test cho business logic không?
- [ ] Có xử lý error cases không?
- [ ] Có security vulnerability không? (SQL injection, XSS)
- [ ] Có hardcoded secrets không?
- [ ] Có tuân thủ naming conventions không?
- [ ] Method có quá phức tạp không? (>10 cyclomatic)
- [ ] Có duplicate code không?
- [ ] TypeScript types có được định nghĩa đúng không?
- [ ] API response format có đúng không? (success/data/message)
- [ ] Có console.log nào cần xóa không?

---

# DOC 7.4-B: Linter/Formatter Configuration

## .prettierrc
```json
{
  "printWidth": 100,
  "singleQuote": true,
  "trailingComma": "all",
  "semi": true,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

## eslint.config.js (Frontend - flat config)
```js
import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2020, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'prefer-const': 'error',
    },
  },
)
```

## tsconfig.json (Strict)
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": false,
    "forceConsistentCasingInFileNames": true
  }
}
```
