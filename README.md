# Craftsmanship Oasis — Student Tech Marketplace

> The boutique tech forge where vetted student engineers build AI automation, web apps, and CS projects for brands.

## Tech Stack

| Layer        | Tech                                          |
|-------------|-----------------------------------------------|
| Framework   | Next.js 14 (App Router)                       |
| Styling     | Tailwind CSS + CSS Variables (Zen-Tech theme) |
| Icons       | Lucide React                                  |
| Animations  | Framer Motion + CSS animations                |
| Database    | TiDB (MySQL-compatible) via Prisma ORM        |
| Auth        | Custom JWT (jose) + httpOnly cookie session   |
| Validation  | Zod                                           |
| Fonts       | Cormorant Garamond + Jost + JetBrains Mono    |

## Project Structure

```
co-marketplace/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts   # POST — register user
│   │   │   ├── login/route.ts      # POST — login + set cookie
│   │   │   ├── logout/route.ts     # POST — clear cookie
│   │   │   └── me/route.ts         # GET  — current session
│   │   ├── gigs/
│   │   │   ├── route.ts            # GET (list+filter) / POST (create)
│   │   │   └── [id]/route.ts       # GET / PATCH / DELETE
│   │   ├── orders/
│   │   │   ├── route.ts            # GET (my orders) / POST (create)
│   │   │   └── [id]/route.ts       # GET / PATCH (status actions)
│   │   ├── payments/
│   │   │   ├── route.ts            # POST (submit UPI proof) / GET (admin list)
│   │   │   └── [id]/verify/route.ts # PATCH (admin approve/reject)
│   │   └── admin/
│   │       └── gigs/[id]/review/route.ts # PATCH (approve/reject gig)
│   ├── auth/
│   │   ├── login/page.tsx          # Login with demo credentials
│   │   └── register/page.tsx       # Register (buyer/seller toggle)
│   ├── browse/page.tsx             # Marketplace with filters
│   ├── gig/[id]/page.tsx           # Gig detail + 3-tier pricing
│   ├── checkout/page.tsx           # UPI QR payment flow
│   ├── dashboard/
│   │   ├── buyer/page.tsx          # Order tracker + progress steps
│   │   └── seller/
│   │       ├── page.tsx            # Earnings + orders + deliver modal
│   │       └── create-gig/page.tsx # Multi-step gig creation
│   ├── admin/page.tsx              # Payment + gig verification panel
│   └── page.tsx                    # Landing page (Zen-Tech hero)
├── components/
│   ├── ui/
│   │   ├── Button.tsx              # 4 variants, loading state
│   │   ├── Toast.tsx               # Success / error / info
│   │   ├── Modal.tsx               # Backdrop blur modal
│   │   ├── Badge.tsx               # 6 color variants
│   │   └── StarRating.tsx          # Filled star rating
│   ├── layout/
│   │   ├── Navbar.tsx              # Sticky nav + seller toggle
│   │   └── Footer.tsx              # Categorized links
│   ├── gig/
│   │   ├── GigCard.tsx             # Marketplace card component
│   │   └── FilterSidebar.tsx       # Category + tech + budget filters
│   └── order/
│       └── OrderProgress.tsx       # Step progress bar
├── lib/
│   ├── prisma.ts                   # Prisma singleton
│   ├── auth.ts                     # Password hashing + JWT helpers
│   ├── apiHelpers.ts               # ok() / err() response utils
│   └── mockData.ts                 # UI mock data (pre-DB)
├── prisma/
│   ├── schema.prisma               # Full TiDB/MySQL schema
│   └── seed.ts                     # Seed with 6 users, 10 gigs, orders
├── types/index.ts                  # All TypeScript interfaces
└── middleware.ts                   # Route protection by role
```

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo>
cd co-marketplace
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
# TiDB Cloud connection string
DATABASE_URL="mysql://USER:PASSWORD@HOST:4000/craftsmanship_oasis?ssl={"rejectUnauthorized":true}"

NEXTAUTH_SECRET="generate-a-long-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

> **TiDB Free Tier**: Sign up at https://tidbcloud.com — free cluster, MySQL-compatible.

### 3. Set Up Database

```bash
# Push schema to TiDB
npm run db:push

# Or run migrations
npx prisma migrate dev --name init

# Seed with demo data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Demo Accounts

After seeding (password for all: `password123`):

| Role     | Email           | Notes                          |
|---------|----------------|-------------------------------|
| Admin   | admin@co.in    | Full access, payment/gig review |
| Buyer   | oshin@co.in    | 3 active orders                |
| Buyer   | vikram@co.in   | 1 completed order              |
| Seller  | arjun@co.in    | AI/ML specialist, 5 gigs       |
| Seller  | priya@co.in    | Web dev specialist             |
| Seller  | rahul@co.in    | Data science specialist        |

## Page Routes

| Route                         | Description                         |
|------------------------------|-------------------------------------|
| `/`                           | Landing page — Zen-Tech hero        |
| `/browse`                     | Marketplace with sidebar filters    |
| `/gig/[id]`                   | Gig detail + 3-tier pricing table   |
| `/checkout`                   | UPI QR payment → pending state      |
| `/auth/login`                 | Login with demo credential panel    |
| `/auth/register`              | Buyer/Seller registration           |
| `/dashboard/buyer`            | Order tracker + progress steps      |
| `/dashboard/seller`           | Earnings + active orders            |
| `/dashboard/seller/create-gig`| Multi-step gig creation             |
| `/admin`                      | Payment verification + gig approval |

## API Endpoints

### Auth
- `POST /api/auth/register` — Create account (buyer or seller)
- `POST /api/auth/login`    — Login, sets `co_session` cookie
- `POST /api/auth/logout`   — Clears session cookie
- `GET  /api/auth/me`       — Returns current user from JWT

### Gigs
- `GET  /api/gigs`          — List published gigs (filter: category, techStack, budgetMin/Max, deliveryDays, sort, page)
- `POST /api/gigs`          — Create gig (seller only) → status: PENDING_REVIEW
- `GET  /api/gigs/[id]`     — Single gig + reviews
- `PATCH /api/gigs/[id]`    — Update gig (owner or admin)
- `DELETE /api/gigs/[id]`   — Delete gig (owner or admin)

### Orders
- `GET  /api/orders`           — My orders (buyer/seller/admin view)
- `POST /api/orders`           — Create order → status: PENDING_PAYMENT
- `GET  /api/orders/[id]`      — Single order
- `PATCH /api/orders/[id]`     — Actions: submit_requirements / deliver / request_revision / complete

### Payments
- `POST /api/payments`              — Submit UPI transaction ID + screenshot → PAYMENT_VERIFICATION
- `GET  /api/payments`              — Admin: list pending payments
- `PATCH /api/payments/[id]/verify` — Admin: approve or reject

### Admin
- `PATCH /api/admin/gigs/[id]/review` — Approve → PUBLISHED or reject gig

## Payment Flow

```
Buyer places order
       ↓
  PENDING_PAYMENT  ←─ buyer pays via UPI QR
       ↓
PAYMENT_VERIFICATION ←─ buyer submits txn ID + screenshot
       ↓
  Admin reviews payment
       ↓
REQUIREMENTS_PENDING ←─ approved  |  PENDING_PAYMENT ←─ rejected
       ↓
   IN_PROGRESS ←─ buyer submits requirements
       ↓
    DELIVERED ←─ seller delivers work
       ↓
   COMPLETED ←─ buyer approves
```

## Gig Publishing Flow

```
Seller creates gig → PENDING_REVIEW
          ↓
     Admin reviews
          ↓
  PUBLISHED ← approved  |  REJECTED ← rejected with feedback
```

## Design System

Colors defined as CSS variables in `globals.css`:

```css
--forest:      #1B3D2F   /* Primary accent */
--forest-mid:  #245240   /* Hover state */
--teal:        #4a9e7a   /* Secondary accent */
--teal-pale:   #c8e6d8   /* On dark background */
--paper:       #F2F0EA   /* Page background */
--paper-dark:  #E8E5DC   /* Section alternates */
--charcoal:    #1a1916   /* Headings */
--grey:        #7a7870   /* Body text */
--grey-light:  #b8b5ac   /* Labels, placeholders */
```

Fonts: **Cormorant Garamond** (display) + **Jost** (body) + **JetBrains Mono** (code tags)
