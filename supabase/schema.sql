-- Run this in your Supabase SQL editor to set up the AidGraph schema

-- Threads table
create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null default 'New research thread',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references public.threads on delete cascade not null,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  created_at timestamptz default now() not null
);

-- API access requests table
create table if not exists public.api_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  org text,
  use_case text not null,
  email text not null,
  created_at timestamptz default now() not null
);

-- Indexes
create index if not exists threads_user_id_updated_at on public.threads (user_id, updated_at desc);
create index if not exists messages_thread_id_created_at on public.messages (thread_id, created_at asc);

-- Row Level Security
alter table public.threads enable row level security;
alter table public.messages enable row level security;
alter table public.api_requests enable row level security;

-- Policies: users can only access their own threads and messages
create policy "users own threads" on public.threads
  for all using (auth.uid() = user_id);

create policy "users own messages via thread" on public.messages
  for all using (
    exists (
      select 1 from public.threads t
      where t.id = thread_id and t.user_id = auth.uid()
    )
  );

-- API requests: anyone can insert, only admins read (service role)
create policy "anyone can submit api request" on public.api_requests
  for insert with check (true);
