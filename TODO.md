# Agro Platform — Master TODO List

> Legend: ✅ Done | 🔄 In Progress | ⬜ Pending | ❌ Blocked
> Last updated: 2026-04-26

---

## PHASE 1 — Foundation ✅ COMPLETE

| Status | Task |
|--------|------|
| ✅ | Read & analyze both codebases |
| ✅ | Gather all requirements from user |
| ✅ | Collect all credentials (Supabase, Git, Vercel, Gemini) |
| ✅ | Create IMPLEMENTATION.md |
| ✅ | Create TODO.md |
| ✅ | Create SITEMAP.md |
| ✅ | Initialize Next.js 15 project structure |
| ✅ | Create package.json with all dependencies |
| ✅ | Create next.config.mjs |
| ✅ | Create tailwind.config.mjs (design system) |
| ✅ | Create .env.local (credentials) |
| ✅ | Create .gitignore |
| ✅ | Create app/globals.css (CSS variables, fonts, base styles) |
| ✅ | Create root app/layout.jsx |
| ✅ | Add Supabase MCP (.mcp.json) + agent skills |

---

## PHASE 2 — Database (Supabase) ✅ COMPLETE

| Status | Task |
|--------|------|
| ✅ | Create supabase/schema.sql (complete unified schema) |
| ⬜ | **USER ACTION NEEDED**: Run schema in Supabase SQL Editor |
| ✅ | RLS policies defined in schema.sql |
| ✅ | Create lib/supabase.js (browser client) |
| ✅ | Create lib/supabase-server.js (server + admin client) |
| ⬜ | **USER ACTION NEEDED**: Create admin account via Supabase Auth |

---

## PHASE 3 — Design System & Providers ✅ COMPLETE

| Status | Task |
|--------|------|
| ✅ | ThemeProvider (dark/light mode, system detect, FOUC prevention) |
| ✅ | LanguageProvider (Bengali default, English toggle) |
| ✅ | locales/bn.json + locales/en.json |
| ✅ | Button, Input, Badge, Spinner, Toast, Modal, ThemeToggle |

---

## PHASE 4 — Layout Components ✅ COMPLETE

| Status | Task |
|--------|------|
| ✅ | Header (desktop + mobile drawer, dark mode, language, cart badge) |
| ✅ | Footer (4-column, payment badges) |
| ✅ | BottomNav (sticky mobile 5-item, cart count, AI special button) |
| ✅ | DashboardSidebar (role-based: customer / vendor / admin) |
| ✅ | Public layout, Dashboard layout, Admin layout, Vendor layout |

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
