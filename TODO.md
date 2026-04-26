# Agro Platform — Master TODO List

> Legend: ✅ Done | 🔄 In Progress | ⬜ Pending | ❌ Blocked

---

## PHASE 1 — Foundation

| Status | Task |
|--------|------|
| ✅ | Read & analyze both codebases |
| ✅ | Gather all requirements from user |
| ✅ | Collect all credentials (Supabase, Git, Vercel, Gemini) |
| ✅ | Create IMPLEMENTATION.md |
| ✅ | Create TODO.md |
| ✅ | Create SITEMAP.md |
| 🔄 | Initialize Next.js 15 project structure |
| ⬜ | Create package.json with all dependencies |
| ⬜ | Create next.config.mjs |
| ⬜ | Create tailwind.config.mjs (design system) |
| ⬜ | Create postcss.config.mjs |
| ⬜ | Create jsconfig.json (path aliases) |
| ⬜ | Create .env.local (credentials) |
| ⬜ | Create .gitignore |
| ⬜ | Create app/globals.css (CSS variables, fonts, base styles) |
| ⬜ | Create root app/layout.jsx |
| ⬜ | Run npm install |

---

## PHASE 2 — Database (Supabase)

| Status | Task |
|--------|------|
| ⬜ | Create supabase/schema.sql (complete unified schema) |
| ⬜ | Run schema migrations on live Supabase project |
| ⬜ | Verify RLS policies on all tables |
| ⬜ | Create lib/supabase.js (browser client) |
| ⬜ | Create lib/supabase-server.js (server + admin client) |
| ⬜ | Seed default admin account |
| ⬜ | Seed default site_settings |
| ⬜ | Seed sample forum categories |

---

## PHASE 3 — Design System & Providers

| Status | Task |
|--------|------|
| ⬜ | Create ThemeProvider (dark/light mode, system detect) |
| ⬜ | Create LanguageProvider (Bengali default, English toggle) |
| ⬜ | Create locales/bn.json (Bengali translations) |
| ⬜ | Create locales/en.json (English translations) |
| ⬜ | UI: Button component (variants: primary, secondary, ghost, danger) |
| ⬜ | UI: Card component |
| ⬜ | UI: Input component |
| ⬜ | UI: Select component |
| ⬜ | UI: Badge component |
| ⬜ | UI: Spinner/Loading component |
| ⬜ | UI: Toast/Notification component |
| ⬜ | UI: Modal component |
| ⬜ | UI: Avatar component |
| ⬜ | UI: Skeleton loader component |

---

## PHASE 4 — Layout Components

| Status | Task |
|--------|------|
| ⬜ | Header (logo, nav, search, cart icon, language toggle, dark mode) |
| ⬜ | Mobile Header (hamburger, drawer menu) |
| ⬜ | Footer (links, social, newsletter) |
| ⬜ | Bottom Navigation (mobile sticky: Home, Shop, AI, Forum, Account) |
| ⬜ | Public layout (header + footer wrapper) |
| ⬜ | Dashboard sidebar layout |
| ⬜ | Admin sidebar layout |
| ⬜ | AnnouncementBar (from site_settings) |
| ⬜ | BreadcrumbNav component |

---

## PHASE 5 — Home Page

| Status | Task |
|--------|------|
| ⬜ | Hero section (CMS-managed headline, CTA buttons) |
| ⬜ | Category grid (dynamic from DB) |
| ⬜ | Featured products section (no hardcoded data, DB-driven) |
| ⬜ | B2B teaser banner |
| ⬜ | AI Assistant teaser section |
| ⬜ | Forum teaser (recent posts) |
| ⬜ | Stats bar (animated counters) |
| ⬜ | Testimonials section |
| ⬜ | Newsletter signup |

---

## PHASE 6 — Shop & Products

| Status | Task |
|--------|------|
| ⬜ | ProductCard component (image, name, price, sale badge) |
| ⬜ | ProductGrid component (responsive) |
| ⬜ | CategoryFilter sidebar |
| ⬜ | Price range filter |
| ⬜ | Search bar (instant, debounced) |
| ⬜ | Sort options (price, newest, popular) |
| ⬜ | /shop page (retail products) |
| ⬜ | /b2b page (B2B products with MOQ) |
| ⬜ | /shop/[slug] product detail page |
| ⬜ | /b2b/[slug] B2B product detail page |
| ⬜ | Related products section |
| ⬜ | Product image gallery |
| ⬜ | Add to cart functionality |
| ⬜ | Wishlist toggle |
| ⬜ | Stock indicator |

---

## PHASE 7 — Cart & Checkout

| Status | Task |
|--------|------|
| ⬜ | Cart state (Zustand or React Context) |
| ⬜ | Cart drawer/page |
| ⬜ | Checkout page |
| ⬜ | Delivery address form |
| ⬜ | Delivery zone check (free zone logic) |
| ⬜ | Payment method selector (perishable = prepaid only) |
| ⬜ | Backend payment validation (API route) |
| ⬜ | Guest checkout → auto account creation (magic link) |
| ⬜ | Coupon/discount code input |
| ⬜ | Order summary component |
| ⬜ | Order confirmation page |
| ⬜ | Order confirmation email (via SMTP integration) |

---

## PHASE 8 — Auth

| Status | Task |
|--------|------|
| ⬜ | /auth/login page (email/phone) |
| ⬜ | /auth/signup page (customer) |
| ⬜ | /auth/signup/vendor (retail vendor) |
| ⬜ | /auth/signup/b2b-vendor (B2B vendor) |
| ⬜ | /auth/forgot page |
| ⬜ | /auth/callback route (OAuth) |
| ⬜ | Google OAuth integration |
| ⬜ | Facebook OAuth integration |
| ⬜ | Auth middleware (protect routes) |
| ⬜ | Bot detection middleware (/auth/* block bots) |
| ⬜ | Auto-create vendor_profile on vendor signup |
| ⬜ | Auto-create ai_assistants row on any signup |

---

## PHASE 9 — AI Assistant

| Status | Task |
|--------|------|
| ⬜ | /ai-assistant page (chat UI, mobile-optimized) |
| ⬜ | AssistantSelector component (001, 002...) |
| ⬜ | ChatInterface component |
| ⬜ | lib/gemini.js (Gemini API, caching, fallback) |
| ⬜ | /api/ai-chat route |
| ⬜ | IP-based rate limiting for guests |
| ⬜ | Per-user rate limiting for logged-in |
| ⬜ | AI response caching (Supabase ai_cache table) |
| ⬜ | Weather widget (Open-Meteo) |
| ⬜ | Product recommendations in AI response |
| ⬜ | Government services finder |
| ⬜ | Chat history (localStorage) |
| ⬜ | Gemini community guidelines compliance check |

---

## PHASE 10 — Forum

| Status | Task |
|--------|------|
| ⬜ | /forum page (category-based feed) |
| ⬜ | Forum category tabs |
| ⬜ | Admin notices (pinned, visible to all) |
| ⬜ | PostCard component |
| ⬜ | PostEditor (create/edit post) |
| ⬜ | /forum/[category] page |
| ⬜ | /forum/post/[id] detail page |
| ⬜ | Create post form |
| ⬜ | Forum registration category (during signup) |
| ⬜ | Like / reply (basic) |

---

## PHASE 11 — Customer Dashboard

| Status | Task |
|--------|------|
| ⬜ | /dashboard overview |
| ⬜ | /dashboard/orders (order history + tracking) |
| ⬜ | /dashboard/orders/[id] (order detail) |
| ⬜ | /dashboard/wishlist |
| ⬜ | /dashboard/addresses |
| ⬜ | /dashboard/profile |
| ⬜ | /dashboard/notifications |
| ⬜ | /dashboard/ai-assistants (manage assistants) |

---

## PHASE 12 — Vendor Dashboard

| Status | Task |
|--------|------|
| ⬜ | /vendor/dashboard overview |
| ⬜ | /vendor/products (list, add, edit, delete) |
| ⬜ | /vendor/products/new (product creation form) |
| ⬜ | /vendor/orders (vendor-specific orders) |
| ⬜ | /vendor/earnings |
| ⬜ | /vendor/zones (delivery zone management) |
| ⬜ | /vendor/profile (shop profile) |
| ⬜ | Role check: retail_vendor sees retail only, b2b_vendor sees B2B only |

---

## PHASE 13 — Admin Dashboard

| Status | Task |
|--------|------|
| ⬜ | /admin/dashboard overview (stats, pending alerts) |
| ⬜ | /admin/dashboard/users |
| ⬜ | /admin/dashboard/vendors (retail + B2B) |
| ⬜ | /admin/dashboard/affiliates |
| ⬜ | /admin/dashboard/products |
| ⬜ | /admin/dashboard/categories |
| ⬜ | /admin/dashboard/orders |
| ⬜ | /admin/dashboard/banners |
| ⬜ | /admin/dashboard/coupons |
| ⬜ | /admin/dashboard/blog |
| ⬜ | /admin/dashboard/pages (full CMS page builder) |
| ⬜ | /admin/dashboard/forum (posts + admin notices) |
| ⬜ | /admin/dashboard/forum-categories (CRUD) |
| ⬜ | /admin/dashboard/zones |
| ⬜ | /admin/dashboard/ai-assistant (usage stats + config) |
| ⬜ | /admin/dashboard/settings |
| ⬜ | /admin/dashboard/integrations (+ OAuth guide) |
| ⬜ | Admin mobile sticky footer nav |

---

## PHASE 14 — API Routes

| Status | Task |
|--------|------|
| ⬜ | POST /api/auth/register |
| ⬜ | POST /api/auth/login |
| ⬜ | GET  /api/auth/me |
| ⬜ | GET  /api/products |
| ⬜ | GET  /api/products/[id] |
| ⬜ | POST /api/orders |
| ⬜ | POST /api/checkout/validate |
| ⬜ | POST /api/ai-chat |
| ⬜ | GET  /api/ai-status |
| ⬜ | GET  /api/weather |
| ⬜ | GET  /api/forum/posts |
| ⬜ | POST /api/forum/posts |
| ⬜ | GET  /api/admin/* (products, vendors, users, etc.) |
| ⬜ | POST /api/webhook/meta (Facebook Messenger) |

---

## PHASE 15 — SEO & Performance

| Status | Task |
|--------|------|
| ⬜ | app/robots.js (allow AI bots, block auth) |
| ⬜ | app/sitemap.js (dynamic sitemap) |
| ⬜ | generateMetadata() on all public pages |
| ⬜ | JSON-LD structured data on product pages |
| ⬜ | Open Graph images |
| ⬜ | Bengali language hreflang tags |
| ⬜ | Verify Lighthouse score > 90 |

---

## PHASE 16 — Deployment

| Status | Task |
|--------|------|
| ⬜ | Initialize git in project folder |
| ⬜ | First commit + push to GitHub |
| ⬜ | Connect Vercel to GitHub repo |
| ⬜ | Set all environment variables on Vercel |
| ⬜ | Trigger first production deployment |
| ⬜ | Verify deployment is live |
| ⬜ | Domain setup guide (for user) |

---

## KNOWN ISSUES / WATCH LIST
- Gemini API key format starts with `AQ.Ab8RN...` (non-standard) — verify during AI module build
- File-based storage from old repos (users.json, integrations.json) — replaced with Supabase
- Old dual-database (Supabase + MongoDB) — removed, Supabase only
- Hardcoded admin credentials in old code — removed, environment-based
