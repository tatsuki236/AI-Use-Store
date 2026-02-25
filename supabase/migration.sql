-- ============================================
-- A-Note Academy Database Migration
-- ============================================

-- 1. profiles テーブル
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. courses テーブル
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  price integer not null default 0,
  thumbnail_url text,
  created_at timestamptz not null default now()
);

-- 3. lessons テーブル
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  content text not null default '',
  video_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 4. purchases テーブル
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  created_at timestamptz not null default now(),
  unique(user_id, course_id)
);

-- ============================================
-- RLS (Row Level Security) 有効化
-- ============================================

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.purchases enable row level security;

-- ============================================
-- RLS ポリシー
-- ============================================

-- profiles: ユーザーは自分のプロフィールのみ閲覧・更新可能
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- profiles: Adminは全プロフィール閲覧・更新可能
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update all profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- courses: 誰でも閲覧可能
create policy "Anyone can view courses"
  on public.courses for select
  using (true);

-- courses: Adminのみ作成・更新・削除可能
create policy "Admins can manage courses"
  on public.courses for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- lessons: 購入済みユーザーのみ閲覧可能
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

-- lessons: Adminは全レッスン閲覧可能
create policy "Admins can view all lessons"
  on public.lessons for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- lessons: Adminのみ作成・更新・削除可能
create policy "Admins can manage lessons"
  on public.lessons for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- purchases: ユーザーは自分の購入のみ閲覧可能
create policy "Users can view own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

-- purchases: ユーザーは購入（insert）可能
create policy "Users can create purchases"
  on public.purchases for insert
  with check (auth.uid() = user_id);

-- purchases: Adminは全購入を閲覧・更新可能
create policy "Admins can view all purchases"
  on public.purchases for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update purchases"
  on public.purchases for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- 新規ユーザー登録時に自動でprofilesにレコード作成
-- ============================================

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
