/**
 * Craftsmanship Oasis — Prisma Seed
 *
 * Run after DB is set up:
 *   npx prisma generate
 *   npx prisma db push
 *   npm run db:seed
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const nodeCrypto = require('crypto')

async function hashPassword(password: string): Promise<string> {
  const salt = nodeCrypto.randomBytes(16).toString('hex')
  return new Promise((resolve, reject) => {
    nodeCrypto.pbkdf2(password, salt, 310000, 64, 'sha256', (err: any, derivedKey: any) => {
      if (err) reject(err)
      resolve(`${salt}:${derivedKey.toString('hex')}`)
    })
  })
}

async function main() {
  console.log('\n🌱  Seeding Craftsmanship Oasis…\n')

  await prisma.review.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.order.deleteMany()
  await prisma.gig.deleteMany()
  await prisma.user.deleteMany()
  console.log('  ✓ Cleared existing data')

  const pass = await hashPassword('password123')

  // ── Users ────────────────────────────────────────────────
  const admin = await prisma.user.create({ data: {
    name: 'Admin', email: 'admin@co.in', password: pass,
    role: 'ADMIN', isSeller: false,
  }})

  const buyer1 = await prisma.user.create({ data: {
    name: 'Oshin Rathore', email: 'oshin@co.in', password: pass,
    role: 'BUYER', isSeller: false,
  }})

  const buyer2 = await prisma.user.create({ data: {
    name: 'Vikram Malhotra', email: 'vikram@co.in', password: pass,
    role: 'BUYER', isSeller: false,
  }})

  const seller1 = await prisma.user.create({ data: {
    name: 'Arjun Mehta', email: 'arjun@co.in', password: pass,
    role: 'SELLER', isSeller: true,
    sellerBio: 'Final year CS student at IIT Bombay. Specializing in AI/ML and Python backends. 2 years of freelance experience.',
    skills: 'Python,LangChain,FastAPI,PyTorch,Docker',
  }})

  const seller2 = await prisma.user.create({ data: {
    name: 'Priya Sharma', email: 'priya@co.in', password: pass,
    role: 'SELLER', isSeller: true,
    sellerBio: 'Full-stack developer from NIT Trichy. Loves React and scalable Node backends.',
    skills: 'React,Next.js,Node.js,MongoDB,TypeScript',
  }})

  const seller3 = await prisma.user.create({ data: {
    name: 'Rahul Nair', email: 'rahul@co.in', password: pass,
    role: 'SELLER', isSeller: true,
    sellerBio: 'Data science researcher at VIT Chennai. Published ML papers.',
    skills: 'Python,Pandas,scikit-learn,TensorFlow,SQL',
  }})

  console.log('  ✓ Created 6 users (1 admin, 2 buyers, 3 sellers)')

  // ── Gigs ─────────────────────────────────────────────────
  const gig1 = await prisma.gig.create({ data: {
    sellerId: seller1.id,
    title: 'RAG-based AI chatbot with LangChain and FastAPI',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    description: 'I will build a production-ready Retrieval-Augmented Generation chatbot for your documents. Integrates with PDFs, Notion, or any web source. Includes a FastAPI backend, streaming responses, and a simple React UI.',
    category: 'AI & ML', techStack: 'Python,LangChain,FastAPI,React,ChromaDB',
    status: 'PUBLISHED', totalOrders: 54, rating: 4.9,
    basicPrice: 3500,  basicDesc: 'Single document source, basic Q&A, 5 days delivery',
    standardPrice: 7000, standardDesc: 'Multi-source RAG, streaming UI, 7 days delivery',
    premiumPrice: 14000, premiumDesc: 'Full production setup with auth + deployment, 14 days',
    deliveryDays: 7,
  }})

  const gig2 = await prisma.gig.create({ data: {
    sellerId: seller2.id,
    title: 'Django + React SaaS dashboard with auth and Stripe integration',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
    description: 'Full-stack SaaS starter with Django REST + React. Includes JWT auth, subscription billing via Stripe, multi-tenancy, admin panel, and a responsive Tailwind dashboard.',
    category: 'Web Dev', techStack: 'Django,React,PostgreSQL,Stripe,Tailwind',
    status: 'PUBLISHED', totalOrders: 28, rating: 4.7,
    basicPrice: 5000,  basicDesc: 'Django + React starter with auth, 7 days',
    standardPrice: 9000, standardDesc: 'Full app with Stripe + dashboard, 10 days',
    premiumPrice: 18000, premiumDesc: 'Multi-tenant SaaS + CI/CD + cloud deploy, 21 days',
    deliveryDays: 10,
  }})

  const gig3 = await prisma.gig.create({ data: {
    sellerId: seller3.id,
    title: 'Customer churn prediction ML model with explainability dashboard',
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800',
    description: 'End-to-end ML pipeline for customer churn prediction. Train XGBoost/LightGBM models, tune hyperparameters, and build a Streamlit dashboard with SHAP explanations.',
    category: 'Data Science', techStack: 'Python,scikit-learn,XGBoost,Streamlit,SHAP',
    status: 'PUBLISHED', totalOrders: 19, rating: 4.8,
    basicPrice: 4000,  basicDesc: 'Model training + performance report, 5 days',
    standardPrice: 8000, standardDesc: 'Model + Streamlit dashboard + SHAP, 8 days',
    premiumPrice: 15000, premiumDesc: 'Full pipeline + FastAPI endpoint + Docker, 14 days',
    deliveryDays: 8,
  }})

  const gig4 = await prisma.gig.create({ data: {
    sellerId: seller2.id,
    title: 'Next.js 14 e-commerce site with product management and payments',
    thumbnail: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=800',
    description: 'Modern e-commerce store built with Next.js 14 App Router, Prisma, and Razorpay/Stripe. Product catalog, cart, checkout, admin panel, and order tracking.',
    category: 'Web Dev', techStack: 'Next.js,Prisma,PostgreSQL,Razorpay,Tailwind',
    status: 'PUBLISHED', totalOrders: 12, rating: 4.6,
    basicPrice: 4500,  basicDesc: 'Product listing + cart + checkout, 7 days',
    standardPrice: 8500, standardDesc: 'Full shop + payment + admin, 12 days',
    premiumPrice: 16000, premiumDesc: 'Complete platform with analytics + deploy, 21 days',
    deliveryDays: 12,
  }})

  const gig5 = await prisma.gig.create({ data: {
    sellerId: seller1.id,
    title: 'GPT-4 powered Telegram/WhatsApp bot for business automation',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800',
    description: 'Smart chatbot for Telegram or WhatsApp using GPT-4. Configure for FAQ automation, lead capture, appointment booking, or order tracking.',
    category: 'AI & ML', techStack: 'Python,OpenAI,Telegram API,FastAPI,Redis',
    status: 'PUBLISHED', totalOrders: 31, rating: 4.9,
    basicPrice: 2500,  basicDesc: 'Single-purpose bot with GPT-4, 3 days',
    standardPrice: 5000, standardDesc: 'Multi-flow bot with memory + admin, 5 days',
    premiumPrice: 10000, premiumDesc: 'Full business automation suite + CRM sync, 10 days',
    deliveryDays: 5,
  }})

  const gig6 = await prisma.gig.create({ data: {
    sellerId: seller3.id,
    title: 'Python web scraper with proxy rotation, scheduling, and data export',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&q=80&w=800',
    description: 'Custom web scraper built with Scrapy or Playwright. Handles JS-heavy sites, rotates proxies, bypasses rate limits, exports to CSV/JSON or your DB.',
    category: 'Scripting', techStack: 'Python,Scrapy,Playwright,PostgreSQL,Docker',
    status: 'PUBLISHED', totalOrders: 22, rating: 4.7,
    basicPrice: 1500,  basicDesc: 'Single site scraper, CSV export, 2 days',
    standardPrice: 3500, standardDesc: 'Multi-site + proxy rotation + scheduling, 4 days',
    premiumPrice: 7000, premiumDesc: 'Production scraper + DB + cloud cron, 7 days',
    deliveryDays: 4,
  }})

  const gig7 = await prisma.gig.create({ data: {
    sellerId: seller2.id,
    title: 'React Native cross-platform mobile app with Firebase backend',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800',
    description: 'Build your iOS + Android app with React Native and Expo. Firebase handles auth, Firestore database, push notifications, and cloud storage.',
    category: 'App Dev', techStack: 'React Native,Expo,Firebase,TypeScript',
    status: 'PUBLISHED', totalOrders: 8, rating: 4.5,
    basicPrice: 6000,  basicDesc: '3-screen app with Firebase auth, 10 days',
    standardPrice: 12000, standardDesc: '8-screen app with full Firebase backend, 18 days',
    premiumPrice: 22000, premiumDesc: 'Full-featured app + store submission, 30 days',
    deliveryDays: 18,
  }})

  const gig8 = await prisma.gig.create({ data: {
    sellerId: seller1.id,
    title: 'Data analysis and visualization report with Python and Plotly',
    thumbnail: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&q=80&w=800',
    description: 'EDA on your dataset, key insights, beautiful visualizations using matplotlib, seaborn, and interactive Plotly dashboards. Includes a professional PDF report.',
    category: 'Data Science', techStack: 'Python,Pandas,Matplotlib,Seaborn,Plotly',
    status: 'PUBLISHED', totalOrders: 15, rating: 4.8,
    basicPrice: 1200,  basicDesc: 'EDA + 5 key charts + summary report, 2 days',
    standardPrice: 2800, standardDesc: 'Full analysis + interactive dashboard, 4 days',
    premiumPrice: 5500, premiumDesc: 'Complete report + Plotly dashboard + presentation, 6 days',
    deliveryDays: 4,
  }})

  // Pending review gig
  await prisma.gig.create({ data: {
    sellerId: seller3.id,
    title: 'DSA problem solutions and CS assignment help',
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=800',
    description: 'Well-commented solutions with time/space complexity analysis for LeetCode, HackerRank, or university assignments.',
    category: 'CS Projects', techStack: 'Python,Java,C++,Algorithms',
    status: 'PENDING_REVIEW', totalOrders: 0, rating: 0,
    basicPrice: 800,   basicDesc: '3 DSA problems with explanations, 1 day',
    standardPrice: 2000, standardDesc: '10 problems + complexity analysis, 2 days',
    premiumPrice: 4000,  premiumDesc: 'Full assignment set + video walkthrough, 3 days',
    deliveryDays: 2,
  }})

  await prisma.gig.create({ data: {
    sellerId: seller2.id,
    title: 'REST API design and Node.js backend with full Swagger documentation',
    thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=800',
    description: 'Professional REST API with Node.js + Express. JWT auth, input validation, rate limiting, error handling, Swagger docs, and Postman collection.',
    category: 'Web Dev', techStack: 'Node.js,Express,MongoDB,JWT,Swagger',
    status: 'PUBLISHED', totalOrders: 9, rating: 4.6,
    basicPrice: 2500,  basicDesc: 'Basic CRUD API with auth, 4 days',
    standardPrice: 5000, standardDesc: 'Full API with docs + Postman, 6 days',
    premiumPrice: 9000,  premiumDesc: 'Production API + cloud deploy + monitoring, 10 days',
    deliveryDays: 6,
  }})

  console.log('  ✓ Created 10 gigs (8 published, 1 pending review, 1 draft-ish)')

  // ── Orders ───────────────────────────────────────────────
  const order1 = await prisma.order.create({ data: {
    gigId: gig1.id, buyerId: buyer1.id, sellerId: seller1.id,
    package: 'standard', price: 7000, status: 'IN_PROGRESS',
    requirements: 'Build a RAG chatbot for our company knowledge base (PDF docs). Should handle multi-turn conversations and cite sources.',
    deadline: new Date(Date.now() + 5 * 86_400_000),
  }})

  const order2 = await prisma.order.create({ data: {
    gigId: gig6.id, buyerId: buyer1.id, sellerId: seller3.id,
    package: 'basic', price: 1500, status: 'PAYMENT_VERIFICATION',
    deadline: new Date(Date.now() + 2 * 86_400_000),
  }})

  const order3 = await prisma.order.create({ data: {
    gigId: gig2.id, buyerId: buyer1.id, sellerId: seller2.id,
    package: 'premium', price: 18000, status: 'DELIVERED',
    requirements: 'SaaS dashboard for our HR tool. Need Stripe subscriptions and team management.',
    deliveryFile: 'delivery_v1.zip',
    deadline: new Date(Date.now() - 2 * 86_400_000),
  }})

  const order4 = await prisma.order.create({ data: {
    gigId: gig5.id, buyerId: buyer2.id, sellerId: seller1.id,
    package: 'standard', price: 5000, status: 'COMPLETED',
    requirements: 'WhatsApp bot for restaurant order taking and FAQs.',
    deliveryFile: 'restaurant_bot_v2.zip',
    deadline: new Date(Date.now() - 7 * 86_400_000),
  }})

  console.log('  ✓ Created 4 orders')

  // ── Payments ─────────────────────────────────────────────
  await prisma.payment.create({ data: {
    orderId: order2.id, amount: 1650,
    transactionId: 'UPI2025040800142',
    status: 'PENDING',
  }})
  await prisma.payment.create({ data: {
    orderId: order1.id, amount: 7700,
    transactionId: 'GPAY20250405112233',
    status: 'VERIFIED', verifiedAt: new Date(Date.now() - 3 * 86_400_000),
  }})
  await prisma.payment.create({ data: {
    orderId: order3.id, amount: 19800,
    transactionId: 'PTM2025040199871',
    status: 'VERIFIED', verifiedAt: new Date(Date.now() - 10 * 86_400_000),
  }})
  await prisma.payment.create({ data: {
    orderId: order4.id, amount: 5500,
    transactionId: 'UPI2025032800445',
    status: 'VERIFIED', verifiedAt: new Date(Date.now() - 14 * 86_400_000),
  }})

  console.log('  ✓ Created 4 payments')

  // ── Reviews ──────────────────────────────────────────────
  await prisma.review.create({ data: {
    orderId: order4.id, gigId: gig5.id, authorId: buyer2.id,
    rating: 5,
    comment: 'Arjun delivered an outstanding WhatsApp bot. Code is clean, well-documented, and has been running in production for 2 weeks with zero issues. Highly recommend!',
  }})
  await prisma.gig.update({ where: { id: gig5.id }, data: { rating: 5.0 } })

  console.log('  ✓ Created 1 review')

  // ── Done ─────────────────────────────────────────────────
  console.log('\n  ✅  Seed complete!\n')
  console.log('  ────────────────────────────────────────────')
  console.log('  Test accounts  (password: password123)')
  console.log('  ────────────────────────────────────────────')
  console.log(`  Admin    →  admin@co.in`)
  console.log(`  Buyer 1  →  oshin@co.in    (3 active orders)`)
  console.log(`  Buyer 2  →  vikram@co.in   (1 completed order)`)
  console.log(`  Seller 1 →  arjun@co.in    (AI/ML – 5 gigs)`)
  console.log(`  Seller 2 →  priya@co.in    (Web dev – 4 gigs)`)
  console.log(`  Seller 3 →  rahul@co.in    (Data science – 3 gigs)`)
  console.log('  ────────────────────────────────────────────\n')

  // Suppress unused variable warnings
  void admin; void buyer1; void buyer2; void seller1; void seller2; void seller3
  void gig3; void gig4; void gig7; void gig8
}

main()
  .catch(e => { console.error('\n❌  Seed failed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
