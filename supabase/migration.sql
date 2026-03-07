-- ============================================
-- A-Note Academy Database Migration (Complete)
-- ============================================

-- 1. profiles テーブル
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  is_approved boolean not null default false,
  display_name text,
  created_at timestamptz not null default now()
);

-- 2. courses テーブル
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  price integer not null default 0,
  thumbnail_url text,
  created_at timestamptz not null default now()
);

-- 3. lessons テーブル
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  content text not null default '',
  video_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 4. articles テーブル
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null default '',
  price integer not null default 0,
  is_free boolean not null default false,
  published boolean not null default false,
  thumbnail_url text,
  status text not null default 'draft'
    check (status in ('draft', 'pending_review', 'published', 'rejected')),
  rejection_reason text,
  rating numeric(2,1) not null default 0,
  author_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. purchases テーブル
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade,
  article_id uuid references public.articles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  created_at timestamptz not null default now(),
  constraint purchases_one_target_check check (
    (course_id is not null and article_id is null) or
    (course_id is null and article_id is not null)
  )
);

-- purchases ユニーク制約
create unique index if not exists purchases_user_course_unique
  on public.purchases (user_id, course_id) where course_id is not null;
create unique index if not exists purchases_user_article_unique
  on public.purchases (user_id, article_id) where article_id is not null;

-- 6. reviews テーブル
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, article_id)
);

create index if not exists idx_reviews_article_id on public.reviews(article_id);
create index if not exists idx_reviews_user_id on public.reviews(user_id);

-- 7. seller_profiles テーブル
create table if not exists public.seller_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  full_name text not null,
  address text not null default '',
  phone text not null default '',
  date_of_birth text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  bank_name text,
  branch_name text,
  account_number text,
  account_holder_name text,
  id_document_url text,
  verified_address text,
  bank_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. withdrawal_requests テーブル
create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount integer not null check (amount > 0),
  bank_name text not null,
  branch_name text not null,
  account_number text not null,
  account_holder_name text not null,
  id_document_url text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'completed', 'rejected')),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- RLS (Row Level Security) 有効化
-- ============================================

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.articles enable row level security;
alter table public.purchases enable row level security;
alter table public.reviews enable row level security;
alter table public.seller_profiles enable row level security;
alter table public.withdrawal_requests enable row level security;

-- ============================================
-- ヘルパー関数
-- ============================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================
-- RLS ポリシー
-- ============================================

-- profiles
create policy "Anyone can view public profile fields"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can update all profiles"
  on public.profiles for update
  using (public.is_admin());

-- courses
create policy "Anyone can view courses"
  on public.courses for select
  using (true);

create policy "Admins can manage courses"
  on public.courses for all
  using (public.is_admin());

-- lessons
create policy "Purchased users can view lessons"
  on public.lessons for select
  using (
    exists (
      select 1 from public.purchases
      where purchases.user_id = auth.uid()
        and purchases.course_id = lessons.course_id
        and purchases.status = 'completed'
    )
  );

create policy "Admins can view all lessons"
  on public.lessons for select
  using (public.is_admin());

create policy "Admins can manage lessons"
  on public.lessons for all
  using (public.is_admin());

-- articles
create policy "Anyone can view published articles"
  on public.articles for select
  using (published = true);

create policy "Users can view own articles"
  on public.articles for select
  using (auth.uid() = author_id);

create policy "Users can insert own articles"
  on public.articles for insert
  with check (auth.uid() = author_id);

create policy "Users can update own articles"
  on public.articles for update
  using (auth.uid() = author_id);

create policy "Admins can manage all articles"
  on public.articles for all
  using (public.is_admin());

-- purchases
create policy "Users can view own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

create policy "Users can create purchases"
  on public.purchases for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all purchases"
  on public.purchases for select
  using (public.is_admin());

create policy "Admins can update purchases"
  on public.purchases for update
  using (public.is_admin());

-- reviews
create policy "Anyone can view reviews"
  on public.reviews for select
  using (true);

create policy "Users can insert own reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reviews"
  on public.reviews for update
  using (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);

create policy "Admins can manage all reviews"
  on public.reviews for all
  using (public.is_admin());

-- seller_profiles
create policy "Users can view own seller profile"
  on public.seller_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own seller profile"
  on public.seller_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own seller profile"
  on public.seller_profiles for update
  using (auth.uid() = user_id);

create policy "Admins can manage all seller profiles"
  on public.seller_profiles for all
  using (public.is_admin());

-- withdrawal_requests
create policy "Users can view own withdrawals"
  on public.withdrawal_requests for select
  using (auth.uid() = user_id);

create policy "Users can insert own withdrawals"
  on public.withdrawal_requests for insert
  with check (auth.uid() = user_id);

create policy "Admins can manage all withdrawals"
  on public.withdrawal_requests for all
  using (public.is_admin());

-- ============================================
-- トリガー・関数
-- ============================================

-- 新規ユーザー登録時に自動でprofilesにレコード作成
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- レビュー変更時に articles.rating を自動更新
create or replace function public.update_article_rating()
returns trigger
language plpgsql
security definer
as $$
declare
  target_article_id uuid;
begin
  if tg_op = 'DELETE' then
    target_article_id := OLD.article_id;
  else
    target_article_id := NEW.article_id;
  end if;

  update public.articles
  set rating = (
    select coalesce(round(avg(r.rating)::numeric, 1), 0)
    from public.reviews r
    where r.article_id = target_article_id
  )
  where id = target_article_id;

  if tg_op = 'DELETE' then
    return OLD;
  end if;
  return NEW;
end;
$$;

create trigger trg_update_article_rating
  after insert or update or delete on public.reviews
  for each row
  execute function public.update_article_rating();

-- コースのレッスンタイトル取得（RLSバイパス）
create or replace function public.get_course_lessons(p_course_id uuid)
returns table (id uuid, title text, sort_order integer)
language sql
stable
security definer
as $$
  select id, title, sort_order
  from public.lessons
  where course_id = p_course_id
  order by sort_order;
$$;

-- ヒーロー統計情報
create or replace function public.get_hero_stats()
returns json
language sql
stable
security definer
as $$
  select json_build_object(
    'article_count', (select count(*) from public.articles where published = true),
    'user_count', (select count(*) from public.profiles),
    'satisfaction_percent', (
      select case when count(*) > 0
        then round((avg(rating) / 5.0) * 100)
        else null end
      from public.reviews
    )
  );
$$;

-- ============================================
-- 非正規化カラム (purchase_count, review_count)
-- ============================================
alter table public.articles add column if not exists purchase_count integer not null default 0;
alter table public.articles add column if not exists review_count integer not null default 0;

-- 9. stripe_payments テーブル
create table if not exists public.stripe_payments (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid references public.purchases(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null not null,
  article_id uuid references public.articles(id) on delete set null not null,
  stripe_session_id text unique not null,
  stripe_payment_intent text,
  amount integer not null,
  platform_fee integer not null default 0,
  seller_amount integer not null default 0,
  currency text not null default 'jpy',
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.stripe_payments enable row level security;

create policy "Admins can manage all stripe_payments"
  on public.stripe_payments for all
  using (public.is_admin());

create policy "Users can view own stripe_payments"
  on public.stripe_payments for select
  using (auth.uid() = user_id);

-- 10. banners テーブル
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text not null,
  link_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.banners enable row level security;

create policy "Anyone can view active banners"
  on public.banners for select
  using (is_active = true);

create policy "Admins can manage banners"
  on public.banners for all
  using (public.is_admin());

-- ============================================
-- purchase_count / review_count 自動更新トリガー
-- ============================================

-- purchase_count 更新
create or replace function public.update_article_purchase_count()
returns trigger
language plpgsql
security definer
as $$
declare
  target_article_id uuid;
begin
  if tg_op = 'DELETE' then
    target_article_id := OLD.article_id;
  else
    target_article_id := NEW.article_id;
  end if;

  if target_article_id is not null then
    update public.articles
    set purchase_count = (
      select count(*) from public.purchases p
      where p.article_id = target_article_id and p.status = 'completed'
    )
    where id = target_article_id;
  end if;

  if tg_op = 'DELETE' then return OLD; end if;
  return NEW;
end;
$$;

create trigger trg_update_article_purchase_count
  after insert or update or delete on public.purchases
  for each row
  execute function public.update_article_purchase_count();

-- review_count 更新
create or replace function public.update_article_review_count()
returns trigger
language plpgsql
security definer
as $$
declare
  target_article_id uuid;
begin
  if tg_op = 'DELETE' then
    target_article_id := OLD.article_id;
  else
    target_article_id := NEW.article_id;
  end if;

  update public.articles
  set review_count = (
    select count(*) from public.reviews r
    where r.article_id = target_article_id
  )
  where id = target_article_id;

  if tg_op = 'DELETE' then return OLD; end if;
  return NEW;
end;
$$;

create trigger trg_update_article_review_count
  after insert or update or delete on public.reviews
  for each row
  execute function public.update_article_review_count();

-- ============================================
-- 11. likes テーブル
-- ============================================
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, article_id)
);

create index if not exists idx_likes_article_id on public.likes(article_id);
create index if not exists idx_likes_user_id on public.likes(user_id);

alter table public.articles add column if not exists like_count integer not null default 0;
alter table public.articles add column if not exists category text;
alter table public.articles add column if not exists slug text;
create unique index if not exists articles_slug_unique on public.articles(slug) where slug is not null;

alter table public.likes enable row level security;

create policy "Anyone can view likes"
  on public.likes for select
  using (true);

create policy "Users can insert own likes"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own likes"
  on public.likes for delete
  using (auth.uid() = user_id);

create policy "Admins can manage all likes"
  on public.likes for all
  using (public.is_admin());

-- like_count 自動更新トリガー
create or replace function public.update_article_like_count()
returns trigger
language plpgsql
security definer
as $$
declare
  target_article_id uuid;
begin
  if tg_op = 'DELETE' then
    target_article_id := OLD.article_id;
  else
    target_article_id := NEW.article_id;
  end if;

  update public.articles
  set like_count = (
    select count(*) from public.likes l
    where l.article_id = target_article_id
  )
  where id = target_article_id;

  if tg_op = 'DELETE' then return OLD; end if;
  return NEW;
end;
$$;

create trigger trg_update_article_like_count
  after insert or delete on public.likes
  for each row
  execute function public.update_article_like_count();

-- ============================================
-- 12. article_views テーブル（閲覧履歴）
-- ============================================
create table if not exists public.article_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  unique (user_id, article_id)
);

create index if not exists idx_article_views_user_id on public.article_views(user_id);
create index if not exists idx_article_views_article_id on public.article_views(article_id);

alter table public.article_views enable row level security;

create policy "Users can view own article_views"
  on public.article_views for select
  using (auth.uid() = user_id);

create policy "Users can insert own article_views"
  on public.article_views for insert
  with check (auth.uid() = user_id);

create policy "Users can update own article_views"
  on public.article_views for update
  using (auth.uid() = user_id);

create policy "Admins can manage all article_views"
  on public.article_views for all
  using (public.is_admin());

-- ============================================
-- 13. bookmarks テーブル
-- ============================================
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, article_id)
);

create index if not exists idx_bookmarks_user_id on public.bookmarks(user_id);
create index if not exists idx_bookmarks_article_id on public.bookmarks(article_id);

alter table public.bookmarks enable row level security;

create policy "Users can view own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

create policy "Users can insert own bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

create policy "Admins can manage all bookmarks"
  on public.bookmarks for all
  using (public.is_admin());

-- ============================================
-- ストレージバケット
-- ============================================
-- Supabase Dashboard > Storage から以下を作成:
-- バケット名: id-documents (非公開)
