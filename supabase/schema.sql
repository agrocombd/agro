-- ============================================================
-- AGRO.COM.BD — Unified Supabase Schema
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================
do $$ begin
  -- role is stored as text (no enum) for GoTrue compatibility
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_type as enum ('retail','b2b');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('pending','confirmed','processing','shipped','delivered','cancelled','returned','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_type as enum ('prepaid','cod');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending','paid','failed','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('bkash','nagad','cod','bank_transfer');
exception when duplicate_object then null; end $$;

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table if not exists profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text,
  phone               text,
  full_name           text,
  avatar_url          text,
  role                user_role not null default 'customer',
  forum_category      text,
  is_active           boolean not null default true,
  preferred_language  text not null default 'bn',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table profiles enable row level security;
create policy "Users can view own profile"          on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"        on profiles for update using (auth.uid() = id);
create policy "Admin can view all profiles"         on profiles for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
);
create policy "Admin can update all profiles"       on profiles for update using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
);
create policy "Public can view basic profile info"  on profiles for select using (true);

-- Auto-create profile on new user
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role text := 'customer';
begin
  if new.raw_user_meta_data->>'role' is not null then
    v_role := new.raw_user_meta_data->>'role';
  end if;
  insert into profiles (id, email, phone, full_name, role, preferred_language)
  values (
    new.id,
    new.email,
    new.phone,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    v_role,
    coalesce(new.raw_user_meta_data->>'preferred_language', 'bn')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- VENDOR PROFILES
-- ============================================================
create table if not exists vendor_profiles (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid unique not null references profiles(id) on delete cascade,
  shop_name         text not null,
  shop_slug         text unique,
  description       text,
  logo_url          text,
  banner_url        text,
  vendor_type       product_type not null default 'retail',
  is_approved       boolean not null default false,
  commission_rate   numeric(5,2) not null default 10,
  total_earnings    numeric(12,2) not null default 0,
  created_at        timestamptz not null default now()
);

alter table vendor_profiles enable row level security;
create policy "Vendor can view own profile"   on vendor_profiles for select using (user_id = auth.uid());
create policy "Vendor can update own profile" on vendor_profiles for update using (user_id = auth.uid());
create policy "Admin can manage vendors"      on vendor_profiles for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
);
create policy "Public can view approved vendors" on vendor_profiles for select using (is_approved = true);

-- ============================================================
-- AFFILIATE PROFILES
-- ============================================================
create table if not exists affiliate_profiles (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid unique not null references profiles(id) on delete cascade,
  referral_code     text unique not null,
  commission_rate   numeric(5,2) not null default 5,
  total_earnings    numeric(12,2) not null default 0,
  is_approved       boolean not null default false,
  created_at        timestamptz not null default now()
);

alter table affiliate_profiles enable row level security;
create policy "Affiliate can view own"   on affiliate_profiles for select using (user_id = auth.uid());
create policy "Admin can manage affiliates" on affiliate_profiles for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
);

-- ============================================================
-- PRODUCT CATEGORIES
-- ============================================================
create table if not exists categories (
  id          uuid primary key default uuid_generate_v4(),
  name_bn     text not null,
  name_en     text,
  slug        text unique not null,
  icon        text default '🌱',
  is_perishable boolean not null default false,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table categories enable row level security;
create policy "Anyone can view active categories" on categories for select using (is_active = true);
create policy "Admin can manage categories"       on categories for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
);

-- Seed default categories
insert into categories (name_bn, name_en, slug, icon, is_perishable, sort_order) values
  ('শাকসবজি',       'Vegetables',     'vegetables',     '🥦', true,  1),
  ('ফলমূল',         'Fruits',         'fruits',         '🍎', true,  2),
  ('বীজ ও চারা',   'Seeds & Seedlings','seeds',         '🌱', false, 3),
  ('সার ও কীটনাশক','Fertilizer',     'fertilizer',     '🧪', false, 4),
  ('কৃষি যন্ত্রপাতি','Farm Tools',   'farm-tools',     '🚜', false, 5),
  ('মাছ',           'Fish',           'fish',           '🐟', true,  6),
  ('মুরগি ও পাখি', 'Poultry',        'poultry',        '🐓', true,  7),
  ('গরু ও ছাগল',   'Livestock',      'livestock',      '🐄', true,  8),
  ('জৈব পণ্য',     'Organic Products','organic',       '🌿', false, 9),
  ('প্যাকেজড খাদ্য','Packaged Food', 'packaged-food',  '📦', false, 10),
  ('সেচ ও পানি',   'Irrigation',     'irrigation',     '💧', false, 11),
  ('রোগ ব্যবস্থাপনা','Pest Control', 'pest-control',   '🔬', false, 12)
on conflict (slug) do nothing;

-- ============================================================
-- PRODUCTS
-- ============================================================
create table if not exists products (
  id              uuid primary key default uuid_generate_v4(),
  name_bn         text not null,
  name_en         text,
  description_bn  text,
  description_en  text,
  price           numeric(12,2) not null,
  sale_price      numeric(12,2),
  stock           integer not null default 0,
  unit            text not null default 'kg',
  images          text[] not null default '{}',
  product_type    product_type not null default 'retail',
  is_perishable   boolean not null default false,
  moq             integer,
  category_id     uuid references categories(id) on delete set null,
  vendor_id       uuid references profiles(id) on delete cascade,
  is_active       boolean not null default true,
  is_approved     boolean not null default false,
  is_featured     boolean not null default false,
  tags            text[] not null default '{}',
  slug            text,
  views           integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_products_category     on products(category_id);
create index if not exists idx_products_vendor       on products(vendor_id);
create index if not exists idx_products_type         on products(product_type);
create index if not exists idx_products_active       on products(is_active, is_approved);
create index if not exists idx_products_featured     on products(is_featured) where is_featured = true;
create index if not exists idx_products_name_trgm    on products using gin (name_bn gin_trgm_ops);

alter table products enable row level security;
create policy "Anyone can view active approved products" on products for select
  using (is_active = true and is_approved = true);
create policy "Vendor can view own products"             on products for select
  using (vendor_id = auth.uid());
create policy "Vendor can manage own products"           on products for all
  using (vendor_id = auth.uid());
create policy "Admin can manage all products"            on products for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager')));

-- ============================================================
-- ORDERS
-- ============================================================
create table if not exists orders (
  id                  uuid primary key default uuid_generate_v4(),
  order_number        text unique not null,
  user_id             uuid references profiles(id) on delete set null,
  guest_name          text,
  guest_email         text,
  guest_phone         text,
  status              order_status not null default 'pending',
  payment_type        payment_type not null default 'cod',
  payment_method      payment_method,
  payment_status      payment_status not null default 'pending',
  subtotal            numeric(12,2) not null default 0,
  discount            numeric(12,2) not null default 0,
  delivery_fee        numeric(12,2) not null default 0,
  total               numeric(12,2) not null default 0,
  coupon_code         text,
  courier_name        text,
  tracking_id         text,
  shipping_name       text,
  shipping_phone      text,
  shipping_address    text,
  shipping_division   text,
  shipping_district   text,
  shipping_upazila    text,
  shipping_postal     text,
  notes               text,
  delivered_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_orders_user    on orders(user_id);
create index if not exists idx_orders_status  on orders(status);
create index if not exists idx_orders_created on orders(created_at desc);

alter table orders enable row level security;
create policy "User can view own orders"     on orders for select using (user_id = auth.uid());
create policy "Guest order by email"         on orders for select using (guest_email is not null);
create policy "Admin can manage all orders"  on orders for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
);

-- Auto-generate order number
create or replace function generate_order_number()
returns trigger language plpgsql as $$
begin
  new.order_number := 'AGR-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random()*90000+10000)::text, 5, '0');
  return new;
end;
$$;

drop trigger if exists set_order_number on orders;
create trigger set_order_number before insert on orders
  for each row when (new.order_number is null or new.order_number = '')
  execute function generate_order_number();

-- ============================================================
-- ORDER ITEMS
-- ============================================================
create table if not exists order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references orders(id) on delete cascade,
  product_id  uuid references products(id) on delete set null,
  vendor_id   uuid references profiles(id) on delete set null,
  name_bn     text not null,
  name_en     text,
  image_url   text,
  unit_price  numeric(12,2) not null,
  qty         integer not null default 1,
  subtotal    numeric(12,2) not null
);

alter table order_items enable row level security;
create policy "User sees own order items"   on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "Vendor sees own items"       on order_items for select
  using (vendor_id = auth.uid());
create policy "Admin sees all order items"  on order_items for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager')));

-- ============================================================
-- DELIVERY ZONES
-- ============================================================
create table if not exists zones (
  id                  uuid primary key default uuid_generate_v4(),
  vendor_id           uuid references profiles(id) on delete cascade,
  zone_name           text not null,
  region              text,
  districts           text[] default '{}',
  is_free_delivery    boolean not null default true,
  delivery_fee        numeric(8,2) default 0,
  created_at          timestamptz not null default now()
);

alter table zones enable row level security;
create policy "Vendor can manage own zones" on zones for all using (vendor_id = auth.uid());
create policy "Admin can manage all zones"  on zones for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
);
create policy "Public can view zones"       on zones for select using (true);

-- ============================================================
-- REVIEWS
-- ============================================================
create table if not exists reviews (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references products(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  rating      smallint not null check (rating between 1 and 5),
  comment     text,
  images      text[] default '{}',
  created_at  timestamptz not null default now(),
  unique(product_id, user_id)
);

alter table reviews enable row level security;
create policy "Anyone can view reviews"  on reviews for select using (true);
create policy "User can create review"   on reviews for insert with check (auth.uid() = user_id);
create policy "User can update own"      on reviews for update using (auth.uid() = user_id);
create policy "Admin can delete reviews" on reviews for delete using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
);

-- ============================================================
-- WISHLIST
-- ============================================================
create table if not exists wishlist (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  product_id  uuid not null references products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(user_id, product_id)
);

alter table wishlist enable row level security;
create policy "User manages own wishlist" on wishlist for all using (auth.uid() = user_id);

-- ============================================================
-- ADDRESSES
-- ============================================================
create table if not exists addresses (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  label       text default 'Home',
  full_name   text not null,
  phone       text not null,
  division    text,
  district    text,
  upazila     text,
  address     text not null,
  postal_code text,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table addresses enable row level security;
create policy "User manages own addresses" on addresses for all using (auth.uid() = user_id);

-- ============================================================
-- COUPONS
-- ============================================================
create table if not exists coupons (
  id              uuid primary key default uuid_generate_v4(),
  code            text unique not null,
  description     text,
  discount_type   text not null default 'percentage' check (discount_type in ('percentage','fixed')),
  discount_value  numeric(10,2) not null,
  min_order_value numeric(10,2) default 0,
  max_discount    numeric(10,2),
  usage_limit     integer,
  usage_count     integer not null default 0,
  expires_at      timestamptz,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

alter table coupons enable row level security;
create policy "Anyone can view active coupons" on coupons for select using (is_active = true);
create policy "Admin manages coupons"          on coupons for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
);

-- ============================================================
-- BANNERS
-- ============================================================
create table if not exists banners (
  id          uuid primary key default uuid_generate_v4(),
  title_bn    text,
  title_en    text,
  subtitle_bn text,
  subtitle_en text,
  image_url   text not null,
  link_url    text,
  placement   text default 'hero',
  sort_order  integer default 0,
  is_active   boolean not null default true,
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);

alter table banners enable row level security;
create policy "Anyone can view active banners" on banners for select using (is_active = true);
create policy "Admin manages banners"          on banners for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
);

-- ============================================================
-- FORUM CATEGORIES
-- ============================================================
create table if not exists forum_categories (
  id          uuid primary key default uuid_generate_v4(),
  name_bn     text not null,
  name_en     text,
  slug        text unique not null,
  icon        text default '🌱',
  description text,
  sort_order  integer default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table forum_categories enable row level security;
create policy "Anyone can view forum categories"  on forum_categories for select using (is_active = true);
create policy "Admin manages forum categories"    on forum_categories for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
);

insert into forum_categories (name_bn, name_en, slug, icon, sort_order) values
  ('ফসল চাষ',       'Crop Farming',    'crop-farming', '🌾', 1),
  ('মৎস্য চাষ',    'Fishery',          'fishery',      '🐟', 2),
  ('হাঁস-মুরগি',   'Poultry',          'poultry',      '🐓', 3),
  ('পশু পালন',      'Animal Farming',   'animal-farming','🐄', 4),
  ('জৈব কৃষি',     'Organic Farming',  'organic',      '🌿', 5),
  ('কীটনাশক',       'Pest Management',  'pest-management','🔬',6)
on conflict (slug) do nothing;

-- ============================================================
-- FORUM POSTS
-- ============================================================
create table if not exists forum_posts (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references profiles(id) on delete set null,
  category_id uuid references forum_categories(id) on delete set null,
  title       text not null,
  content     text not null,
  images      text[] default '{}',
  likes       integer not null default 0,
  replies     integer not null default 0,
  is_pinned   boolean not null default false,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_forum_posts_category on forum_posts(category_id);
create index if not exists idx_forum_posts_created  on forum_posts(created_at desc);

alter table forum_posts enable row level security;
create policy "Anyone can view active posts"    on forum_posts for select using (is_active = true);
create policy "Auth users can create posts"     on forum_posts for insert with check (auth.uid() = user_id);
create policy "User can edit own posts"         on forum_posts for update using (auth.uid() = user_id);
create policy "Admin can manage all posts"      on forum_posts for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
);

-- ============================================================
-- ADMIN NOTICES
-- ============================================================
create table if not exists admin_notices (
  id          uuid primary key default uuid_generate_v4(),
  title_bn    text not null,
  title_en    text,
  content_bn  text not null,
  content_en  text,
  is_active   boolean not null default true,
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);

alter table admin_notices enable row level security;
create policy "Anyone can view active notices" on admin_notices for select using (is_active = true);
create policy "Admin manages notices"          on admin_notices for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
);

-- ============================================================
-- CMS PAGES
-- ============================================================
create table if not exists pages (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  title_bn    text not null,
  title_en    text,
  content_bn  text,
  content_en  text,
  meta_title  text,
  meta_desc   text,
  is_active   boolean not null default true,
  updated_at  timestamptz not null default now()
);

alter table pages enable row level security;
create policy "Anyone can view active pages" on pages for select using (is_active = true);
create policy "Admin manages pages"          on pages for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
);

insert into pages (slug, title_bn, title_en, content_bn, content_en) values
  ('about',         'আমাদের সম্পর্কে',      'About Us',          'আমাদের সম্পর্কে বিস্তারিত...', 'About us details...'),
  ('contact',       'যোগাযোগ',              'Contact Us',        'যোগাযোগ করুন...', 'Contact us...'),
  ('faq',           'সচরাচর প্রশ্ন',        'FAQ',               'প্রশ্ন ও উত্তর...', 'Questions and answers...'),
  ('privacy',       'গোপনীয়তা নীতি',       'Privacy Policy',    'গোপনীয়তা নীতি...', 'Privacy policy...'),
  ('terms',         'শর্তাবলী',             'Terms & Conditions','শর্তাবলী...', 'Terms and conditions...'),
  ('return-refund', 'ফেরত ও ফেরৎ নীতি',    'Return & Refund',   'ফেরত নীতি...', 'Return policy...')
on conflict (slug) do nothing;

-- ============================================================
-- BLOG POSTS
-- ============================================================
create table if not exists blog_posts (
  id              uuid primary key default uuid_generate_v4(),
  title_bn        text not null,
  title_en        text,
  slug            text unique not null,
  content_bn      text,
  content_en      text,
  excerpt_bn      text,
  excerpt_en      text,
  cover_image     text,
  author_id       uuid references profiles(id) on delete set null,
  category        text default 'general',
  is_published    boolean not null default false,
  views           integer not null default 0,
  published_at    timestamptz,
  created_at      timestamptz not null default now()
);

alter table blog_posts enable row level security;
create policy "Anyone can view published posts" on blog_posts for select using (is_published = true);
create policy "Admin manages blog"              on blog_posts for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
);

-- ============================================================
-- SITE SETTINGS
-- ============================================================
create table if not exists site_settings (
  key         text primary key,
  value       text,
  updated_at  timestamptz not null default now()
);

alter table site_settings enable row level security;
create policy "Anyone can view settings"  on site_settings for select using (true);
create policy "Admin manages settings"    on site_settings for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
);

insert into site_settings (key, value) values
  ('site_name',                   'agro.com.bd'),
  ('site_tagline_bn',             'বাংলাদেশের সেরা কৃষি মার্কেটপ্লেস'),
  ('site_tagline_en',             'Bangladesh''s Best Agricultural Marketplace'),
  ('site_email',                  'info@agro.com.bd'),
  ('site_phone',                  '+880 1700-000000'),
  ('site_address',                'Dhaka, Bangladesh'),
  ('social_facebook',             ''),
  ('social_instagram',            ''),
  ('social_youtube',              ''),
  ('social_whatsapp',             ''),
  ('seo_title',                   'agro.com.bd — Bangladesh Agricultural Marketplace'),
  ('seo_description',             'Buy and sell agricultural products online in Bangladesh'),
  ('default_vendor_commission',   '10'),
  ('default_affiliate_commission','5'),
  ('b2b_enabled',                 'true'),
  ('forum_enabled',               'true'),
  ('ai_enabled',                  'true'),
  ('announcement_bn',             ''),
  ('announcement_en',             ''),
  ('dhaka_delivery_fee',          '60'),
  ('outside_delivery_fee',        '120')
on conflict (key) do nothing;

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  title       text not null,
  body        text,
  type        text default 'info',
  is_read     boolean not null default false,
  link        text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_notifications_user on notifications(user_id, is_read);

alter table notifications enable row level security;
create policy "User manages own notifications" on notifications for all using (auth.uid() = user_id);
create policy "Admin can create notifications" on notifications for insert using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
);

-- ============================================================
-- AI ASSISTANTS
-- ============================================================
create table if not exists ai_assistants (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references profiles(id) on delete cascade,
  assistant_number  integer not null default 1,
  display_name      text not null,
  persona           text default 'agro',
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  unique(user_id, assistant_number)
);

alter table ai_assistants enable row level security;
create policy "User manages own assistants" on ai_assistants for all using (auth.uid() = user_id);

-- Auto-create assistant on new user
create or replace function create_default_assistant()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into ai_assistants (user_id, assistant_number, display_name)
  values (new.id, 1, 'Agro Assistant 001')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_profile_created on profiles;
create trigger on_profile_created
  after insert on profiles
  for each row execute function create_default_assistant();

-- ============================================================
-- AI CACHE
-- ============================================================
create table if not exists ai_cache (
  id          uuid primary key default uuid_generate_v4(),
  query_hash  text unique not null,
  query_text  text,
  response    jsonb not null,
  chat_type   text default 'agro',
  hit_count   integer not null default 0,
  expires_at  timestamptz not null default (now() + interval '30 days'),
  created_at  timestamptz not null default now()
);

create index if not exists idx_ai_cache_hash    on ai_cache(query_hash);
create index if not exists idx_ai_cache_expires on ai_cache(expires_at);

alter table ai_cache enable row level security;
create policy "Service role manages cache" on ai_cache for all using (true);

-- ============================================================
-- RATE LIMITS (AI)
-- ============================================================
create table if not exists rate_limits (
  id                  uuid primary key default uuid_generate_v4(),
  identifier          text not null,
  identifier_type     text not null default 'user',
  chat_type           text not null default 'agro',
  platform            text not null default 'web',
  question_count_hour integer not null default 0,
  question_count_day  integer not null default 0,
  bonus_granted       boolean not null default false,
  hour_reset_at       timestamptz not null default (now() + interval '1 hour'),
  day_reset_at        timestamptz not null default (now() + interval '24 hours'),
  created_at          timestamptz not null default now(),
  unique(identifier, chat_type, platform)
);

alter table rate_limits enable row level security;
create policy "Service role manages rate limits" on rate_limits for all using (true);

-- ============================================================
-- USAGE STATS (AI)
-- ============================================================
create table if not exists usage_stats (
  id              uuid primary key default uuid_generate_v4(),
  date            date unique not null default current_date,
  total_questions integer not null default 0,
  ai_calls        integer not null default 0,
  cache_hits      integer not null default 0,
  blocked         integer not null default 0
);

alter table usage_stats enable row level security;
create policy "Admin views usage stats" on usage_stats for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
);
create policy "Service role manages stats" on usage_stats for all using (true);

-- ============================================================
-- INTEGRATIONS (stored in site_settings, this is just a view)
-- ============================================================
-- Integrations config is stored as key-value in site_settings
-- Keys prefixed with 'integration_' e.g. 'integration_gtm_id'

-- ============================================================
-- CLEANUP: auto-delete expired ai_cache rows (via cron or manual)
-- ============================================================
create or replace function cleanup_expired_cache()
returns void language plpgsql as $$
begin
  delete from ai_cache where expires_at < now();
end;
$$;
