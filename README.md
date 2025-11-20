# Jumbo Commercial Frontend

## 📁 โครงสร้างโปรเจค

```
jumbo-commercial-front-end/
├── .next/
├── app/
│   ├── (main)/
│   │   ├── customers/
│   │   │   ├── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   ├── pos/
│   │   │   └── page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Navigation.tsx
│   ├── providers/
│   │   └── QueryProvider.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── Modal.tsx
├── libs/
│   ├── api/
│   │   ├── analytics.ts
│   │   ├── axios.ts
│   │   ├── category.ts
│   │   ├── customer.ts
│   │   ├── orders.ts
│   │   ├── products.ts
│   │   └── units.ts
│   ├── hooks/
│   │   ├── useAnalytics.ts
│   │   ├── useCategory.ts
│   │   ├── useCustomer.ts
│   │   ├── useOrders.ts
│   │   ├── useProducts.ts
│   │   └── useUnits.ts
│   ├── store/
│   │   ├── alertStore.ts
│   │   └── cartStore.ts
│   └── types
├── node_modules/
├── public/
│   └── assets/
├── utils/
│   ├── formatters.ts
│   └── validators.ts
├── .env
├── .env.local
├── .gitignore
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

## 🛠 เทคโนโลยีที่ใช้

### Core Technologies

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework

### State Management & Data Fetching

- **Zustand 5** - Lightweight state management
- **TanStack Query (React Query) 5** - Server state management
- **Axios** - HTTP client

### UI & Visualization

- **Lucide React** - Icon library
- **Recharts 3** - Charts and data visualization

### Validation

- **Zod 4** - Schema validation

## 📦 การติดตั้ง

### ความต้องการของระบบ

- Node.js (version 18.17 หรือสูงกว่า)
- npm หรือ yarn หรือ pnpm
- Backend API (ควรรันอยู่ที่ `http://localhost:8080`)

### ขั้นตอนการติดตั้ง

1. Clone repository

```bash
git clone <repository-url>
cd jumbo-commercial-front-end
```

2. ติดตั้ง dependencies

```bash
npm install
```

3. ตั้งค่า environment variables

สร้างไฟล์ `.env.local` ในโฟลเดอร์ root และเพิ่มค่าต่อไปนี้:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# App Configuration
NEXT_PUBLIC_APP_NAME=Jumbo Commercial
NEXT_PUBLIC_APP_VERSION=1.0.0

```

4. รัน development server

```bash
npm run dev
```

Application จะรันที่ `http://localhost:3000`

## 🚀 การใช้งาน

### Development Mode

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

**หมายเหตุ:** ตรวจสอบว่า Backend API รันอยู่ที่ `http://localhost:8080`

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

Production server จะรันที่ `http://localhost:3000`

### Linting

```bash
npm run lint
```

### Scripts ที่มีให้ใช้งาน

- `npm run dev` - รัน development server พร้อม hot reload (port 3000)
- `npm run build` - Build production version
- `npm start` - รัน production server (port 3000)
- `npm run lint` - ตรวจสอบ code quality ด้วย ESLint

## 🔄 Git Workflow

### Branch Strategy

โปรเจคนี้ใช้ 2 main branches:

- `main` - Production branch (stable code)
- `dev` - Development branch (สำหรับพัฒนา)

### Workflow การทำงาน

#### 1. เริ่มต้นทำงาน

```bash
# ดึง code ล่าสุดจาก dev branch
git checkout dev
git pull origin dev
```

#### 2. สร้าง Feature Branch (แนะนำ)

```bash
# สร้าง branch ใหม่จาก dev
git checkout -b feature/your-feature-name

# ตัวอย่าง
git checkout -b feature/add-customer-filter
git checkout -b feature/improve-dashboard-ui
git checkout -b fix/order-calculation-bug
```

#### 3. ทำงานและ Commit Changes

```bash
# ตรวจสอบไฟล์ที่แก้ไข
git status

# ดูการเปลี่ยนแปลง
git diff

# เพิ่มไฟล์ที่แก้ไข
git add .

# หรือเลือกเฉพาะไฟล์
git add app/(main)/products/page.tsx
git add components/ui/ProductCard.tsx

# Commit พร้อม message ที่ชัดเจน
git commit -m "feat: add product filtering functionality"
```

#### 4. Sync กับ Dev Branch (Rebase)

```bash
# ดึง code ล่าสุดจาก remote dev
git fetch origin dev

# Rebase branch ของคุณกับ dev
git rebase origin/dev

# หากมี conflict
# 1. แก้ไข conflicts ในไฟล์ที่ขัดแย้ง
# 2. เพิ่มไฟล์ที่แก้แล้ว
git add .

# 3. Continue rebase
git rebase --continue

# หากต้องการยกเลิก rebase
git rebase --abort
```

#### 5. Push Code

```bash
# Push feature branch ครั้งแรก
git push origin feature/your-feature-name

# หาก rebase แล้วต้อง force push (ระวังใช้)
git push origin feature/your-feature-name --force-with-lease
```

#### 6. Create Pull Request

1. ไปที่ GitHub/GitLab/Bitbucket
2. สร้าง Pull Request (PR) จาก `feature/your-feature-name` → `dev`
3. เขียน description อธิบายการเปลี่ยนแปลง
4. รอการ review และ approve
5. Merge เข้า dev branch

#### 7. Deploy to Production

```bash
# เมื่อ dev branch พร้อม deploy
git checkout main
git pull origin main

# Merge dev เข้า main
git merge dev

# หรือ rebase (ถ้าต้องการ history เป็นเส้นตรง)
git rebase dev

# Push to main
git push origin main
```

### Commit Message Convention

ใช้ [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body> (optional)

<footer> (optional)
```

#### Types:

- `feat` - Feature ใหม่
- `fix` - แก้ bug
- `docs` - แก้ไข documentation
- `style` - แก้ไข formatting, styling
- `refactor` - Refactor code
- `perf` - ปรับปรุง performance
- `test` - เพิ่ม tests
- `chore` - งานอื่นๆ (dependencies, config)
- `ui` - แก้ไข UI/UX

#### ตัวอย่าง Commit Messages:

```bash
# Feature ใหม่
git commit -m "feat(products): add product search and filter"
git commit -m "feat(dashboard): implement sales analytics chart"

# Bug fixes
git commit -m "fix(orders): resolve total calculation error"
git commit -m "fix(ui): correct button alignment on mobile"

# UI/UX improvements
git commit -m "ui(customers): redesign customer list layout"
git commit -m "style(dashboard): update color scheme"

# Refactoring
git commit -m "refactor(api): extract axios config to separate file"
git commit -m "refactor(hooks): optimize useProducts hook"

# Documentation
git commit -m "docs: update README with setup instructions"

# Other changes
git commit -m "chore: upgrade next.js to version 16.0.3"
git commit -m "chore(deps): update all dependencies"
```



