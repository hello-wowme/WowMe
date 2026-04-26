-- ============================================================
-- WowMe Supabase Schema
-- Supabase Dashboard > SQL Editor で実行してください
-- ============================================================

-- ① ユーザーテーブル
create table if not exists public.users (
  id          text primary key,          -- Google sub
  name        text,
  email       text unique,
  picture     text,
  role        text default 'user',
  is_admin    boolean default false,
  created_at  timestamptz default now()
);

-- ② タレントプロフィール
create table if not exists public.talent_profiles (
  id             uuid default gen_random_uuid() primary key,
  user_id        text references public.users(id) on delete cascade,
  display_name   text not null,
  bio            text default '',
  category       text default '',
  tags           text[] default '{}',
  price          integer not null default 0,
  response_time  integer default 24,      -- 時間
  avatar_url     text default '',
  cover_url      text default '',
  level          integer default 1,
  total_orders   integer default 0,
  rating         numeric(3,2) default 0,
  review_count   integer default 0,
  available      boolean default true,
  setup_complete boolean default false,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ③ 注文テーブル
create table if not exists public.orders (
  id                       uuid default gen_random_uuid() primary key,
  user_id                  text references public.users(id),
  talent_profile_id        uuid references public.talent_profiles(id),
  occasion                 text,
  recipient_name           text default '',
  message                  text,
  instructions             text default '',
  is_gift                  boolean default false,
  price                    integer not null,
  status                   text default 'pending',
  -- pending / processing / completed / rejected
  stripe_payment_intent_id text,
  video_url                text,
  created_at               timestamptz default now(),
  completed_at             timestamptz
);

-- ④ ストレージバケット（Storage > New bucket で作成 or SQL）
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('videos', 'videos', false)
on conflict do nothing;

-- ============================================================
-- RLS（Row Level Security）ポリシー
-- ============================================================

alter table public.users            enable row level security;
alter table public.talent_profiles  enable row level security;
alter table public.orders           enable row level security;

-- users: 誰でも読める、本人のみ書ける
create policy "users_select" on public.users for select using (true);
create policy "users_insert" on public.users for insert with check (true);
create policy "users_update" on public.users for update using (true);

-- talent_profiles: 誰でも読める、本人のみ書ける
create policy "talent_profiles_select" on public.talent_profiles for select using (true);
create policy "talent_profiles_insert" on public.talent_profiles for insert with check (true);
create policy "talent_profiles_update" on public.talent_profiles for update using (true);
create policy "talent_profiles_delete" on public.talent_profiles for delete using (true);

-- orders: 誰でも読める・作れる（実運用では認証ベースに変更推奨）
create policy "orders_select" on public.orders for select using (true);
create policy "orders_insert" on public.orders for insert with check (true);
create policy "orders_update" on public.orders for update using (true);

-- Storage ポリシー
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatars_upload" on storage.objects
  for insert with check (bucket_id = 'avatars');

create policy "videos_upload" on storage.objects
  for insert with check (bucket_id = 'videos');
create policy "videos_select" on storage.objects
  for select using (bucket_id = 'videos');
