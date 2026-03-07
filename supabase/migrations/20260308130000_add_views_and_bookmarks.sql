-- ============================================
-- article_views + bookmarks テーブル
-- ============================================

-- 1. article_views テーブル（閲覧履歴）
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

-- 2. bookmarks テーブル
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
