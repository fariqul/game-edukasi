-- ============================================
-- INFORMATIKA LAB ADVENTURE - SUPABASE FOUNDATION
-- ============================================

create extension if not exists pgcrypto;

-- ============================================
-- TIMESTAMP TRIGGER
-- ============================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- ============================================
-- CORE TABLES
-- ============================================
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    role text not null default 'siswa' check (role in ('admin', 'guru', 'siswa')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.class_rooms (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    grade_level text,
    academic_year text,
    created_by uuid references public.profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.class_members (
    id bigint generated always as identity primary key,
    class_room_id uuid not null references public.class_rooms(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    role_in_class text not null check (role_in_class in ('guru', 'siswa')),
    is_active boolean not null default true,
    joined_at timestamptz not null default now(),
    unique (class_room_id, user_id)
);

create table if not exists public.game_sessions (
    id uuid primary key default gen_random_uuid(),
    class_room_id uuid not null references public.class_rooms(id) on delete cascade,
    host_user_id uuid not null references public.profiles(id) on delete restrict,
    game_mode text not null,
    session_code text unique,
    status text not null default 'waiting' check (status in ('waiting', 'in_progress', 'finished', 'cancelled')),
    started_at timestamptz,
    ended_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.session_participants (
    id bigint generated always as identity primary key,
    session_id uuid not null references public.game_sessions(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    status text not null default 'joined' check (status in ('joined', 'playing', 'submitted', 'disconnected')),
    score integer not null default 0,
    time_ms integer,
    joined_at timestamptz not null default now(),
    submitted_at timestamptz,
    unique (session_id, user_id)
);

create table if not exists public.session_events (
    id bigint generated always as identity primary key,
    session_id uuid not null references public.game_sessions(id) on delete cascade,
    actor_user_id uuid not null references public.profiles(id) on delete cascade,
    event_type text not null,
    payload jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create table if not exists public.session_rankings (
    id bigint generated always as identity primary key,
    session_id uuid not null references public.game_sessions(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    rank_position integer not null check (rank_position > 0),
    score integer not null default 0,
    time_ms integer,
    calculated_at timestamptz not null default now(),
    unique (session_id, user_id),
    unique (session_id, rank_position)
);

create index if not exists idx_class_members_user_id on public.class_members(user_id);
create index if not exists idx_class_members_class_id on public.class_members(class_room_id);
create index if not exists idx_game_sessions_class on public.game_sessions(class_room_id);
create index if not exists idx_game_sessions_status on public.game_sessions(status);
create index if not exists idx_participants_session on public.session_participants(session_id);
create index if not exists idx_events_session_created on public.session_events(session_id, created_at desc);
create index if not exists idx_rankings_session_rank on public.session_rankings(session_id, rank_position);

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_class_rooms_set_updated_at on public.class_rooms;
create trigger trg_class_rooms_set_updated_at
before update on public.class_rooms
for each row execute function public.set_updated_at();

drop trigger if exists trg_game_sessions_set_updated_at on public.game_sessions;
create trigger trg_game_sessions_set_updated_at
before update on public.game_sessions
for each row execute function public.set_updated_at();

-- ============================================
-- AUTO PROFILE ON SIGNUP
-- ============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, full_name, role)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', ''),
        coalesce(new.raw_user_meta_data->>'role', 'siswa')
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============================================
-- ACCESS HELPER FUNCTIONS FOR RLS
-- ============================================
create or replace function public.my_global_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
    select p.role
    from public.profiles p
    where p.id = auth.uid();
$$;

create or replace function public.is_class_member(target_class uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
    select exists (
        select 1
        from public.class_members cm
        where cm.class_room_id = target_class
          and cm.user_id = auth.uid()
          and cm.is_active = true
    );
$$;

create or replace function public.is_class_teacher(target_class uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
    select exists (
        select 1
        from public.class_members cm
        where cm.class_room_id = target_class
          and cm.user_id = auth.uid()
          and cm.is_active = true
          and cm.role_in_class = 'guru'
    );
$$;

create or replace function public.is_session_member(target_session uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
    select exists (
        select 1
        from public.game_sessions gs
        join public.class_members cm on cm.class_room_id = gs.class_room_id
        where gs.id = target_session
          and cm.user_id = auth.uid()
          and cm.is_active = true
    );
$$;

create or replace function public.is_session_teacher(target_session uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
    select exists (
        select 1
        from public.game_sessions gs
        left join public.class_members cm
            on cm.class_room_id = gs.class_room_id
           and cm.user_id = auth.uid()
           and cm.is_active = true
        where gs.id = target_session
          and (gs.host_user_id = auth.uid() or cm.role_in_class = 'guru')
    );
$$;

-- ============================================
-- RLS
-- ============================================
alter table public.profiles enable row level security;
alter table public.class_rooms enable row level security;
alter table public.class_members enable row level security;
alter table public.game_sessions enable row level security;
alter table public.session_participants enable row level security;
alter table public.session_events enable row level security;
alter table public.session_rankings enable row level security;

drop policy if exists profiles_select_self_or_class on public.profiles;
create policy profiles_select_self_or_class
on public.profiles
for select
using (
    id = auth.uid()
    or exists (
        select 1
        from public.class_members cm_self
        join public.class_members cm_other
            on cm_self.class_room_id = cm_other.class_room_id
        where cm_self.user_id = auth.uid()
          and cm_self.is_active = true
          and cm_other.user_id = profiles.id
          and cm_other.is_active = true
    )
);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self
on public.profiles
for insert
with check (id = auth.uid());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists class_rooms_select_member on public.class_rooms;
create policy class_rooms_select_member
on public.class_rooms
for select
using (public.is_class_member(id));

drop policy if exists class_rooms_insert_guru_admin on public.class_rooms;
create policy class_rooms_insert_guru_admin
on public.class_rooms
for insert
with check (public.my_global_role() in ('admin', 'guru'));

drop policy if exists class_rooms_update_teacher_or_admin on public.class_rooms;
create policy class_rooms_update_teacher_or_admin
on public.class_rooms
for update
using (public.is_class_teacher(id) or public.my_global_role() = 'admin')
with check (public.is_class_teacher(id) or public.my_global_role() = 'admin');

drop policy if exists class_rooms_delete_admin on public.class_rooms;
create policy class_rooms_delete_admin
on public.class_rooms
for delete
using (public.my_global_role() = 'admin');

drop policy if exists class_members_select_class_member on public.class_members;
create policy class_members_select_class_member
on public.class_members
for select
using (public.is_class_member(class_room_id));

drop policy if exists class_members_insert_teacher_or_admin on public.class_members;
create policy class_members_insert_teacher_or_admin
on public.class_members
for insert
with check (public.is_class_teacher(class_room_id) or public.my_global_role() = 'admin');

drop policy if exists class_members_update_teacher_or_admin on public.class_members;
create policy class_members_update_teacher_or_admin
on public.class_members
for update
using (public.is_class_teacher(class_room_id) or public.my_global_role() = 'admin')
with check (public.is_class_teacher(class_room_id) or public.my_global_role() = 'admin');

drop policy if exists class_members_delete_teacher_or_admin on public.class_members;
create policy class_members_delete_teacher_or_admin
on public.class_members
for delete
using (public.is_class_teacher(class_room_id) or public.my_global_role() = 'admin');

drop policy if exists sessions_select_member on public.game_sessions;
create policy sessions_select_member
on public.game_sessions
for select
using (public.is_session_member(id));

drop policy if exists sessions_insert_teacher_only on public.game_sessions;
create policy sessions_insert_teacher_only
on public.game_sessions
for insert
with check (
    public.is_class_teacher(class_room_id)
    and host_user_id = auth.uid()
);

drop policy if exists sessions_update_teacher_only on public.game_sessions;
create policy sessions_update_teacher_only
on public.game_sessions
for update
using (public.is_session_teacher(id))
with check (public.is_session_teacher(id));

drop policy if exists sessions_delete_teacher_only on public.game_sessions;
create policy sessions_delete_teacher_only
on public.game_sessions
for delete
using (public.is_session_teacher(id));

drop policy if exists participants_select_member on public.session_participants;
create policy participants_select_member
on public.session_participants
for select
using (public.is_session_member(session_id));

drop policy if exists participants_insert_self on public.session_participants;
create policy participants_insert_self
on public.session_participants
for insert
with check (
    user_id = auth.uid()
    and public.is_session_member(session_id)
);

drop policy if exists participants_update_self_or_teacher on public.session_participants;
create policy participants_update_self_or_teacher
on public.session_participants
for update
using (
    user_id = auth.uid()
    or public.is_session_teacher(session_id)
)
with check (
    user_id = auth.uid()
    or public.is_session_teacher(session_id)
);

drop policy if exists participants_delete_teacher_only on public.session_participants;
create policy participants_delete_teacher_only
on public.session_participants
for delete
using (public.is_session_teacher(session_id));

drop policy if exists events_select_member on public.session_events;
create policy events_select_member
on public.session_events
for select
using (public.is_session_member(session_id));

drop policy if exists events_insert_member on public.session_events;
create policy events_insert_member
on public.session_events
for insert
with check (
    actor_user_id = auth.uid()
    and public.is_session_member(session_id)
);

drop policy if exists rankings_select_member on public.session_rankings;
create policy rankings_select_member
on public.session_rankings
for select
using (public.is_session_member(session_id));

drop policy if exists rankings_write_teacher on public.session_rankings;
create policy rankings_write_teacher
on public.session_rankings
for all
using (public.is_session_teacher(session_id))
with check (public.is_session_teacher(session_id));

-- ============================================
-- GRANTS FOR AUTHENTICATED CLIENT
-- ============================================
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
