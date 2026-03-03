-- UBUTABERAhub full backend schema (Supabase/Postgres)
-- Run in Supabase SQL editor after your existing users table is created.

create extension if not exists pgcrypto;

-- 1) Lawyer directory (profile information for role = lawyer)
create table if not exists public.lawyers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.users(id) on delete cascade,
  display_name text not null,
  location text default 'Kigali, Rwanda',
  hourly_rate integer default 50000,
  rating numeric(3,2) default 4.50,
  reviews_count integer default 0,
  years_experience integer default 0,
  specialization text[] default '{}',
  is_available boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) Cases
create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  case_number text unique not null,
  title text not null,
  description text,
  case_type text default 'Other',
  status text default 'Pending',
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  filed_at timestamptz default now(),
  next_hearing_at timestamptz,
  citizen_id uuid references public.users(id) on delete set null,
  assigned_lawyer_id uuid references public.users(id) on delete set null,
  assigned_judge_id uuid references public.users(id) on delete set null,
  assigned_clerk_id uuid references public.users(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_cases_status on public.cases(status);
create index if not exists idx_cases_priority on public.cases(priority);
create index if not exists idx_cases_citizen on public.cases(citizen_id);
create index if not exists idx_cases_lawyer on public.cases(assigned_lawyer_id);
create index if not exists idx_cases_judge on public.cases(assigned_judge_id);
create index if not exists idx_cases_clerk on public.cases(assigned_clerk_id);

-- 3) Appointments
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.cases(id) on delete set null,
  citizen_id uuid references public.users(id) on delete set null,
  lawyer_id uuid references public.users(id) on delete set null,
  judge_id uuid references public.users(id) on delete set null,
  clerk_id uuid references public.users(id) on delete set null,
  appointment_type text default 'Consultation',
  starts_at timestamptz not null,
  duration_minutes integer default 30,
  mode text default 'video' check (mode in ('video', 'in_person', 'phone')),
  status text default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_appointments_starts_at on public.appointments(starts_at);
create index if not exists idx_appointments_status on public.appointments(status);

-- 4) Conversations + messages
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  subject text,
  case_id uuid references public.cases(id) on delete set null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.conversation_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text,
  unread_count integer default 0,
  unique(conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid references public.users(id) on delete set null,
  body text not null,
  created_at timestamptz default now()
);

create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at desc);

-- 5) Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text default 'general',
  title text not null,
  body text default '',
  metadata jsonb default '{}'::jsonb,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_notifications_user_created_at on public.notifications(user_id, created_at desc);
create index if not exists idx_notifications_user_is_read on public.notifications(user_id, is_read);

-- 5) Generic timestamp trigger
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_lawyers_updated_at on public.lawyers;
create trigger trg_lawyers_updated_at before update on public.lawyers
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_cases_updated_at on public.cases;
create trigger trg_cases_updated_at before update on public.cases
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_appointments_updated_at on public.appointments;
create trigger trg_appointments_updated_at before update on public.appointments
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_conversations_updated_at on public.conversations;
create trigger trg_conversations_updated_at before update on public.conversations
for each row execute function public.update_updated_at_column();

-- 6) RLS
alter table public.lawyers enable row level security;
alter table public.cases enable row level security;
alter table public.appointments enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

-- Lawyers: public readable, owner editable
drop policy if exists "lawyers_read_all" on public.lawyers;
create policy "lawyers_read_all" on public.lawyers for select using (true);

drop policy if exists "lawyers_update_owner" on public.lawyers;
create policy "lawyers_update_owner" on public.lawyers for update using (auth.uid() = user_id);

drop policy if exists "lawyers_insert_owner" on public.lawyers;
create policy "lawyers_insert_owner" on public.lawyers for insert with check (auth.uid() = user_id);

-- Cases: visible to assigned participants
drop policy if exists "cases_select_participants" on public.cases;
create policy "cases_select_participants" on public.cases
for select using (
  auth.uid() = citizen_id
  or auth.uid() = assigned_lawyer_id
  or auth.uid() = assigned_judge_id
  or auth.uid() = assigned_clerk_id
);

drop policy if exists "cases_insert_citizen" on public.cases;
create policy "cases_insert_citizen" on public.cases
for insert with check (auth.uid() = citizen_id);

drop policy if exists "cases_update_participants" on public.cases;
create policy "cases_update_participants" on public.cases
for update using (
  auth.uid() = citizen_id
  or auth.uid() = assigned_lawyer_id
  or auth.uid() = assigned_judge_id
  or auth.uid() = assigned_clerk_id
);

-- Appointments: visible to involved parties
drop policy if exists "appointments_select_participants" on public.appointments;
create policy "appointments_select_participants" on public.appointments
for select using (
  auth.uid() = citizen_id
  or auth.uid() = lawyer_id
  or auth.uid() = judge_id
  or auth.uid() = clerk_id
);

drop policy if exists "appointments_insert_participants" on public.appointments;
create policy "appointments_insert_participants" on public.appointments
for insert with check (
  auth.uid() = citizen_id
  or auth.uid() = lawyer_id
  or auth.uid() = judge_id
  or auth.uid() = clerk_id
);

drop policy if exists "appointments_update_participants" on public.appointments;
create policy "appointments_update_participants" on public.appointments
for update using (
  auth.uid() = citizen_id
  or auth.uid() = lawyer_id
  or auth.uid() = judge_id
  or auth.uid() = clerk_id
);

-- Conversations / participants / messages
drop policy if exists "conversations_select_participants" on public.conversations;
create policy "conversations_select_participants" on public.conversations
for select using (
  exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = conversations.id
      and cp.user_id = auth.uid()
  )
);

drop policy if exists "participants_select_self" on public.conversation_participants;
create policy "participants_select_self" on public.conversation_participants
for select using (user_id = auth.uid());

drop policy if exists "messages_select_participants" on public.messages;
create policy "messages_select_participants" on public.messages
for select using (
  exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id
      and cp.user_id = auth.uid()
  )
);

drop policy if exists "messages_insert_sender" on public.messages;
create policy "messages_insert_sender" on public.messages
for insert with check (auth.uid() = sender_id);

-- Notifications: each user sees and updates own notifications
drop policy if exists "notifications_select_self" on public.notifications;
create policy "notifications_select_self" on public.notifications
for select using (auth.uid() = user_id);

drop policy if exists "notifications_update_self" on public.notifications;
create policy "notifications_update_self" on public.notifications
for update using (auth.uid() = user_id);

-- 7) Helpful demo seed (safe upserts)
insert into public.cases (case_number, title, description, case_type, status, priority)
values
  ('CASE-2024-001', 'Property Dispute Resolution', 'Boundary dispute and title verification.', 'Property Law', 'In Progress', 'high'),
  ('CASE-2024-039', 'Property Transfer - Uwimana Estate', 'Transfer documentation review.', 'Civil', 'Pending', 'medium'),
  ('CASE-2024-045', 'Commercial Dispute - ABC Corp vs XYZ Ltd', 'Contract and payment dispute.', 'Civil', 'Awaiting Ruling', 'high')
on conflict (case_number) do nothing;
