# Agro Platform — Implementation Document

## Project Overview
A unified full-stack agricultural e-commerce + AI platform for the Bangladeshi market.
Two existing codebases merged into one: `agro.com.bd` (marketplace) + `agro-ai` (AI assistant).

- **Live URL**: agro.com.bd (Vercel deployment)
- **Git Repo**: https://github.com/agrocombd/agro.git
- **Working Directory**: F:\final agro.com.bd

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, React Server Components) |
| Language | JavaScript (JSX) |
| Styling | Tailwind CSS 3.4 + CSS Variables |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email, Google OAuth, Facebook OAuth) |
| Storage | Supabase Storage |
| AI | Google Gemini 2.5 Flash (via REST API) |
| Deployment | Vercel |
| Fonts | Hind Siliguri (Bengali), Inter (English/UI) |

---

## Architecture Decisions

### 1. React Server Components First
- Default: every component is a Server Component (no `"use client"`)
- Add `"use client"` ONLY where interactivity is needed (forms, toggles, real-time)
- Result: minimal JavaScript sent to browser = fastest possible load

### 2. Single Supabase Project
- Both the marketplace and AI assistant share one Supabase project
- Schema separation via table prefixes where needed
- RLS policies on all tables

### 3. Performance Strategy
- **Images**: `next/image` with WebP format, proper `sizes` prop, `priority` on above-fold
- **Fonts**: `next/font/google` with `preload: true`, `display: swap`
- **CSS**: Tailwind's JIT — only used classes included in bundle
- **Caching**: Next.js `fetch` cache for product/category data (60s revalidate)
- **No heavy libs**: No Redux, no animation lib, no carousel lib — CSS scroll-snap instead
- **Code splitting**: Automatic via App Router dynamic routes
- **Lazy loading**: `next/dynamic` for non-critical heavy components (modals, charts)

### 4. Mobile-First Design
- All layouts start from 320px mobile width
- Tailwind breakpoints: default (mobile) → sm:640 → md:768 → lg:1024 → xl:1280
- Bottom navigation bar on mobile (sticky, 5 items)
- Desktop sidebar navigation for admin/dashboard

### 5. Bilingual Support (Bengali Default)
- Default language: Bengali (বাংলা)
- Toggle button: switches to English
- Preference stored in: localStorage + profiles.preferred_language (DB)
- All content: dual-field in DB (name_bn, name_en, description_bn, description_en)

### 6. Payment Logic (Backend Enforced)
```
PERISHABLE (is_perishable = true):
  - Categories: vegetables, fruits, live animals (chicken, fish, cow, goat)
  - Payment: PREPAID ONLY (bKash / Nagad)
  - COD: blocked at UI + API validation layer

NON-PERISHABLE (is_perishable = false):
  - Categories: tools, fertilizer, packaged food, seeds, equipment
  - Payment: COD allowed OR prepaid
```

### 7. RBAC (Role-Based Access Control)
```
admin         → full access to everything
manager       → admin but no user/settings/delete access
retail_vendor → /vendor dashboard, retail products only
b2b_vendor    → /vendor dashboard, B2B products only
customer      → /dashboard, shopping, AI, forum
affiliate     → /affiliate dashboard + referral system
guest         → browse, AI (5 questions), guest checkout
```

### 8. Guest Checkout → Auto Account
- Guest checks out → enters email + phone
- Order placed immediately
- Supabase Auth: createUser() called server-side
- Magic link email sent to guest
- Guest clicks link → account activated, sees their order history

### 9. AI Assistant Per-User
- On register: auto-create ai_assistants row (assistant_number = 1)
- Display: "Agro Assistant 001"
- Users can add more assistants (002, 003...)
- Chat history: localStorage (no server storage for privacy)
- IP-based rate limit for guests: 5 questions max, then force signup
- Logged-in users: 15/hour, 100/day (configurable from admin)
- Gemini API key: stored in .env.local, configurable from admin integrations panel

### 10. SEO Strategy
- `generateMetadata()` on all pages (dynamic)
- `generateStaticParams()` for product/blog/forum pages
- `robots.txt`: allow all AI bots to crawl content
- `sitemap.xml`: auto-generated via Next.js sitemap
- Bot detection: block AI bots from /auth/* endpoints (server middleware)
- Structured data (JSON-LD) on product pages

---

## Phases

### Phase 1 — Foundation ✅
- [x] Documentation
- [ ] Next.js project init
- [ ] Supabase schema
- [ ] Design system (Tailwind, fonts, CSS vars)
- [ ] Providers (Theme, Language, Supabase)
- [ ] Root layout
- [ ] Base UI components

### Phase 2 — Layout & Navigation
- [ ] Header (desktop + mobile)
- [ ] Footer
- [ ] Bottom navigation (mobile)
- [ ] Home page

### Phase 3 — Shop & Products
- [ ] Shop page (/shop)
- [ ] B2B page (/b2b)
- [ ] Product detail page
- [ ] Cart
- [ ] Search + filters

### Phase 4 — Auth
- [ ] Login page
- [ ] Signup (customer)
- [ ] Signup (retail vendor)
- [ ] Signup (B2B vendor)
- [ ] Forgot password
- [ ] OAuth callback
- [ ] Guest checkout auto-account

### Phase 5 — Checkout
- [ ] Checkout page
- [ ] Payment method selector (perishable logic)
- [ ] Order confirmation
- [ ] Delivery zone check

### Phase 6 — AI Assistant
- [ ] /ai-assistant page
- [ ] Gemini API integration
- [ ] Per-user assistant creation
- [ ] Chat UI (mobile-optimized)
- [ ] IP-based guest rate limiting

### Phase 7 — Forum
- [ ] /forum page (category feed)
- [ ] Post creation
- [ ] Admin notices
- [ ] Category-based filtering

### Phase 8 — Dashboards
- [ ] Customer dashboard (/dashboard)
- [ ] Vendor dashboard (/vendor)
- [ ] Admin dashboard (/admin/dashboard) with all panels

### Phase 9 — Admin CMS
- [ ] Full page builder (all CMS pages editable)
- [ ] Forum management
- [ ] Zone management
- [ ] Integrations (+ OAuth guides)
- [ ] AI assistant management

### Phase 10 — API Routes
- [ ] Auth routes
- [ ] Product routes
- [ ] Order routes
- [ ] AI chat route
- [ ] Forum routes
- [ ] Admin routes
- [ ] Webhook routes

### Phase 11 — SEO & Deployment
- [ ] robots.txt
- [ ] sitemap.xml
- [ ] Open Graph images
- [ ] Vercel deployment
- [ ] Environment variables on Vercel
- [ ] Domain setup guide

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ejdloezkivgvgsfdqpwc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>

# Gemini AI
GEMINI_API_KEY=<gemini key>
GEMINI_MODEL=gemini-2.5-flash-latest

# AI Rate Limits
RATE_LIMIT_GUEST=5
RATE_LIMIT_HOURLY=15
RATE_LIMIT_DAILY=100
DAILY_TOTAL_LIMIT=500

# App
NEXT_PUBLIC_SITE_URL=https://agro.com.bd
NEXT_PUBLIC_SITE_NAME=agro.com.bd
```

---

## File Structure

```
/
├── app/
│   ├── (public)/              # Public routes group
│   │   ├── layout.jsx         # Public layout (header + footer)
│   │   ├── page.jsx           # Home
│   │   ├── shop/page.jsx
│   │   ├── shop/[slug]/page.jsx
│   │   ├── b2b/page.jsx
│   │   ├── b2b/[slug]/page.jsx
│   │   ├── cart/page.jsx
│   │   ├── checkout/page.jsx
│   │   ├── checkout/success/page.jsx
│   │   ├── ai-assistant/page.jsx
│   │   ├── forum/page.jsx
│   │   ├── forum/[category]/page.jsx
│   │   ├── forum/post/[id]/page.jsx
│   │   ├── blog/page.jsx
│   │   ├── blog/[slug]/page.jsx
│   │   └── [slug]/page.jsx    # Dynamic CMS pages
│   ├── auth/
│   │   ├── login/page.jsx
│   │   ├── signup/page.jsx
│   │   ├── signup/vendor/page.jsx
│   │   ├── signup/b2b-vendor/page.jsx
│   │   ├── forgot/page.jsx
│   │   └── callback/route.js
│   ├── dashboard/             # Customer dashboard
│   ├── vendor/                # Vendor portal
│   ├── admin/dashboard/       # Admin panel
│   ├── api/                   # API routes
│   ├── layout.jsx             # Root layout
│   ├── globals.css
│   ├── not-found.jsx
│   └── robots.js
├── components/
│   ├── ui/                    # Design system primitives
│   ├── layout/                # Header, Footer, BottomNav
│   ├── shop/                  # ProductCard, ProductGrid, Filters
│   ├── checkout/
│   ├── ai/
│   ├── forum/
│   └── admin/
├── lib/
│   ├── supabase.js            # Browser client
│   ├── supabase-server.js     # Server client + admin
│   ├── gemini.js              # AI engine
│   ├── payment.js             # Payment + perishable rules
│   ├── delivery.js            # Zone logic
│   ├── rate-limiter.js        # AI rate limiting
│   ├── site-settings.js       # Cached settings helper
│   └── utils.js               # Shared utilities
├── locales/
│   ├── bn.json                # Bengali translations
│   └── en.json                # English translations
├── public/
│   ├── logo.png
│   └── agro-assistant.png
├── supabase/
│   └── schema.sql
├── .env.local
├── .env.example
├── next.config.mjs
├── tailwind.config.mjs
├── postcss.config.mjs
├── jsconfig.json
├── IMPLEMENTATION.md          ← this file
├── TODO.md
└── SITEMAP.md
```

---

## Security Checklist
- [ ] RLS on all Supabase tables
- [ ] Server-side payment validation (never trust frontend)
- [ ] Auth middleware for protected routes
- [ ] Bot detection on /auth/* endpoints
- [ ] CORS config on API routes
- [ ] Rate limiting on AI + auth endpoints
- [ ] No secrets in client-side code
- [ ] SQL injection: impossible (Supabase parameterized queries)
- [ ] XSS: React escapes by default, dangerouslySetInnerHTML avoided
- [ ] CSRF: SameSite cookies via Supabase SSR

---

## Design System

### Colors
```
--green-primary: #16a34a      (brand green)
--green-light:   #22c55e      (lighter green)
--green-dark:    #15803d      (darker green)
--amber:         #f59e0b      (accent/CTA)
--bg:            #ffffff / #09090b
--surface:       #f8fafc / #111827
--border:        #e2e8f0 / #1f2937
--text:          #0f172a / #f9fafb
--text-muted:    #64748b / #9ca3af
```

### Typography
```
Bengali: Hind Siliguri (400, 600, 700)
English/UI: Inter (400, 500, 600, 700)
```

### Spacing Scale (container)
```
Mobile:  px-4
Tablet:  sm:px-6
Desktop: lg:px-8
Max-width: max-w-7xl
```
