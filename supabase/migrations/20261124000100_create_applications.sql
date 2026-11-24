create schema if not exists tracker_private;
revoke all on schema tracker_private from public, anon, authenticated;

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  company text not null check (company ~ '[^[:space:]]'),
  role text,
  stage text not null default 'Saved'
    check (stage in ('Saved', 'Applied', 'Interviewing', 'Offer', 'Closed')),
  type text not null default 'Job'
    check (type in ('Job', 'Internship', 'Freelance', 'Other')),
  link text check (
    link is null or (
      link ~* '^https?://[^/?#[:space:]]+([/?#].*)?$'
      and link !~ '[[:space:][:cntrl:]]'
      and strpos(link, chr(92)) = 0
    )
  ),
  notes text,
  applied_date date,
  deadline date,
  location text,
  pay text,
  pinned boolean not null default false,
  is_sample boolean not null default false,
  stage_changed_at timestamptz not null default statement_timestamp(),
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp()
);

create index applications_user_stage_idx on public.applications (user_id, stage);
create index applications_user_deadline_idx on public.applications (user_id, deadline);

-- current_date follows the PostgREST request timezone (Prefer: timezone=...).
create function tracker_private.stamp_application()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.company := btrim(new.company);
  new.updated_at := statement_timestamp();

  if tg_op = 'INSERT' then
    new.created_at := new.updated_at;
    new.stage_changed_at := new.updated_at;
    if new.stage <> 'Saved' then
      new.applied_date := coalesce(new.applied_date, current_date);
      -- The prototype's backdated Applied sample starts with a follow-up due.
      if new.stage = 'Applied' and new.is_sample then
        new.stage_changed_at := least(new.applied_date::timestamptz, new.updated_at);
      end if;
    end if;
  else
    new.created_at := old.created_at;
    if new.stage is distinct from old.stage then
      new.stage_changed_at := new.updated_at;
      if old.stage = 'Saved' then
        new.applied_date := current_date;
      end if;
    else
      new.stage_changed_at := old.stage_changed_at;
    end if;
  end if;
  return new;
end;
$$;

create trigger applications_stamp
before insert or update on public.applications
for each row execute function tracker_private.stamp_application();

alter table public.applications enable row level security;
revoke all on public.applications from public, anon, authenticated;

grant select, delete on public.applications to authenticated;
-- Client-generated ids let optimistic inserts reconcile with realtime events.
grant insert (
  id, company, role, stage, type, link, notes, applied_date, deadline,
  location, pay, pinned, is_sample
) on public.applications to authenticated;
grant update (
  company, role, stage, type, link, notes, applied_date, deadline, location, pay, pinned
) on public.applications to authenticated;

create policy applications_select_own on public.applications
for select to authenticated using ((select auth.uid()) = user_id);

create policy applications_insert_own on public.applications
for insert to authenticated with check ((select auth.uid()) = user_id);

create policy applications_update_own on public.applications
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy applications_delete_own on public.applications
for delete to authenticated using ((select auth.uid()) = user_id);

alter publication supabase_realtime add table public.applications;

-- Subscribe to owner-filtered inserts/updates plus this private delete signal.
-- A receiving device refetches through RLS. The message has no row payload.
create policy tracker_receive_own_deletions on realtime.messages
for select to authenticated using (
  extension = 'broadcast'
  and (select realtime.topic()) = 'applications:' || (select auth.uid())::text
);

create function tracker_private.notify_application_delete()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform realtime.send(
    '{}'::jsonb, 'removed', 'applications:' || old.user_id::text, true
  );
  return null;
end;
$$;

revoke all on function tracker_private.notify_application_delete()
from public, anon, authenticated;

create trigger applications_notify_delete
after delete on public.applications
for each row execute function tracker_private.notify_application_delete();
