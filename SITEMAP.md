# Agro Platform — Full Site Map

---

## PUBLIC ROUTES (No auth required)

```
/                          → Home page
/shop                      → Retail product catalog
/shop/[slug]               → Retail product detail
/b2b                       → B2B wholesale marketplace
/b2b/[slug]                → B2B product detail
/cart                      → Shopping cart
/checkout                  → Checkout (guest or logged-in)
/checkout/success          → Order confirmation
/ai-assistant              → Agro AI chat interface
/forum                     → Forum (category feed)
/forum/[category]          → Forum by category
/forum/post/[id]           → Single forum post
/blog                      → Blog listing
/blog/[slug]               → Blog post detail
/about                     → About page (CMS)
/contact                   → Contact page (CMS)
/faq                       → FAQ page (CMS)
/privacy                   → Privacy policy (CMS)
/terms                     → Terms & conditions (CMS)
/return-refund             → Return & refund policy (CMS)
/[slug]                    → Any other CMS page (dynamic)
```

---

## AUTH ROUTES

```
/auth/login                → Universal login (email/phone + OAuth)
/auth/signup               → Customer registration
/auth/signup/vendor        → Retail vendor registration
/auth/signup/b2b-vendor    → B2B vendor registration
/auth/forgot               → Forgot password
/auth/reset                → Reset password (from email link)
/auth/callback             → OAuth callback (Google, Facebook)
```

---

## CUSTOMER DASHBOARD (auth: customer+)

```
/dashboard                 → Overview (recent orders, wishlist count)
/dashboard/orders          → Order history
/dashboard/orders/[id]     → Order detail + tracking
/dashboard/wishlist        → Saved products
/dashboard/addresses       → Saved delivery addresses
/dashboard/profile         → Edit profile
/dashboard/notifications   → Notification center
/dashboard/ai-assistants   → Manage AI assistants (001, 002...)
```

---

## VENDOR DASHBOARD (auth: retail_vendor / b2b_vendor)

```
/vendor                    → Redirect to /vendor/dashboard
/vendor/dashboard          → Overview (sales, orders, earnings)
/vendor/products           → My products list
/vendor/products/new       → Add new product
/vendor/products/[id]/edit → Edit product
/vendor/orders             → Orders containing my products
/vendor/earnings           → Earnings + commission breakdown
/vendor/zones              → Delivery zone management
/vendor/profile            → Shop profile (name, logo, banner, description)
```

---

## ADMIN DASHBOARD (auth: admin / manager)

```
/admin                     → Redirect to /admin/dashboard
/admin/dashboard                      → Overview (stats, pending alerts, revenue chart)
/admin/dashboard/users                → All users (manage roles, activate/deactivate)
/admin/dashboard/vendors              → All vendors (retail + B2B, approve/reject)
/admin/dashboard/affiliates           → Affiliate management
/admin/dashboard/products             → All products (approve/reject/feature)
/admin/dashboard/products/new         → Admin product creation
/admin/dashboard/categories           → Product category management (CRUD)
/admin/dashboard/orders               → All orders (status management, courier)
/admin/dashboard/banners              → Homepage banner management
/admin/dashboard/coupons              → Discount code management
/admin/dashboard/blog                 → Blog post management
/admin/dashboard/pages                → CMS page editor (ALL pages editable here)
/admin/dashboard/forum                → Forum posts + admin notices
/admin/dashboard/forum-categories     → Forum category management (CRUD)
/admin/dashboard/zones                → Delivery zone management (all vendors)
/admin/dashboard/ai-assistant         → AI usage stats + Gemini config
/admin/dashboard/settings             → Site settings (general, social, SEO, commission)
/admin/dashboard/integrations         → Third-party integrations:
                                          Analytics: GTM, GA4, Facebook Pixel
                                          Payments: bKash, Nagad
                                          Couriers: Steadfast, RedX, Pathao
                                          Communication: SMTP, WhatsApp
                                          OAuth: Google, Facebook (with setup guide)
                                          AI: Gemini API key management
```

---

## API ROUTES

```
# Auth
POST   /api/auth/register           → Customer/vendor registration
POST   /api/auth/login              → Email/phone login
GET    /api/auth/me                 → Current user profile
POST   /api/auth/change-password    → Change password
POST   /api/auth/forgot             → Trigger password reset

# Products
GET    /api/products                → List products (filters, pagination)
GET    /api/products/[id]          → Single product
GET    /api/products/[id]/related  → Related products

# Orders
POST   /api/orders                 → Create order
GET    /api/orders/[id]            → Order detail
PATCH  /api/orders/[id]            → Update order status

# Checkout
POST   /api/checkout/validate      → Validate cart + enforce payment rules
POST   /api/checkout/guest         → Guest checkout → auto account creation

# AI
POST   /api/ai-chat                → Main chat endpoint (Gemini)
GET    /api/ai-status              → Quota check (no question consumed)
GET    /api/weather                → Weather + farming advice

# Forum
GET    /api/forum/posts            → List posts (by category)
POST   /api/forum/posts            → Create post
GET    /api/forum/posts/[id]       → Single post
DELETE /api/forum/posts/[id]       → Delete post (owner or admin)

# Admin
GET    /api/admin/products         → Admin product list (bypass RLS)
POST   /api/admin/products         → Create product (admin)
PATCH  /api/admin/products         → Update product
DELETE /api/admin/products         → Delete product
GET    /api/admin/vendors          → Vendor list
PATCH  /api/admin/vendors          → Approve/reject/commission
GET    /api/admin/users            → All users
POST   /api/admin/create-user      → Create manager/admin
DELETE /api/admin/delete-user      → Delete user
GET    /api/admin/integrations     → Get integration config
POST   /api/admin/integrations     → Save integration config
GET    /api/admin/orders           → All orders

# Vendor
GET    /api/vendor/products        → My products
POST   /api/vendor/products        → Create my product
PATCH  /api/vendor/products        → Update my product
DELETE /api/vendor/products        → Delete my product
GET    /api/vendor/orders          → My orders
GET    /api/vendor/zones           → My delivery zones
POST   /api/vendor/zones           → Create zone
DELETE /api/vendor/zones/[id]      → Delete zone

# Site
GET    /api/site-settings          → Public site settings
GET    /api/categories             → Product categories
GET    /api/forum/categories       → Forum categories

# Webhooks
POST   /api/webhook/meta           → Facebook Messenger webhook
GET    /api/webhook/meta           → Facebook webhook verification
```

---

## SPECIAL ROUTES

```
/robots.txt                → Generated by app/robots.js
/sitemap.xml               → Generated by app/sitemap.js
/api/og                    → Open Graph image generation
```

---

## NAVIGATION STRUCTURE

### Desktop Header Nav
```
Logo | Shop | B2B | AI Assistant | Forum | Blog
                                    [Search] [Cart] [Lang] [Dark] [Login/Avatar]
```

### Mobile Bottom Nav (sticky)
```
🏠 Home | 🛒 Shop | 🤖 AI | 💬 Forum | 👤 Account
```

### Admin Sidebar Groups
```
Overview:  Dashboard
People:    Users · Vendors · Affiliates
Catalogue: Products · Categories · Coupons
Commerce:  Orders · Banners
Content:   Blog · Pages · Forum · Forum Categories
AI:        AI Assistant
System:    Zones · Settings · Integrations
```

### Vendor Sidebar
```
Overview:  Dashboard
Products:  My Products
Orders:    My Orders
Earnings:  Earnings
Delivery:  Zones
Profile:   Shop Profile
```

---

## PAGE ACCESS MATRIX

| Page | Guest | Customer | Vendor | Admin |
|------|-------|----------|--------|-------|
| / (Home) | ✅ | ✅ | ✅ | ✅ |
| /shop | ✅ | ✅ | ✅ | ✅ |
| /b2b | ✅ | ✅ | ✅ | ✅ |
| /checkout | ✅ | ✅ | ✅ | ✅ |
| /ai-assistant | ✅ (5 Qs) | ✅ | ✅ | ✅ |
| /forum | ✅ | ✅ | ✅ | ✅ |
| /dashboard | ❌ | ✅ | ❌ | ✅ |
| /vendor/* | ❌ | ❌ | ✅ | ✅ |
| /admin/* | ❌ | ❌ | ❌ | ✅ |
