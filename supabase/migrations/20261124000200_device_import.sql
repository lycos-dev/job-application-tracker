alter table public.applications add column last_followed_up_at timestamptz;

-- Bind each API insert to the initiating account even during a session change.
grant insert (user_id) on public.applications to authenticated;

create or replace function tracker_private.stamp_application()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.company := btrim(new.company);
  new.updated_at := statement_timestamp();

  if tg_op = 'INSERT' then
    -- Direct browser inserts cannot supply these columns. The import RPC can
    -- preserve history, bounded to the current time.
    new.created_at := least(new.created_at, new.updated_at);
    new.stage_changed_at := least(new.stage_changed_at, new.updated_at);
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

create function public.import_device_applications(expected_owner uuid, items jsonb)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  owner_id uuid := auth.uid();
  inserted integer;
begin
  if owner_id is null or expected_owner is distinct from owner_id then
    raise exception 'Account changed. Sign in again.' using errcode = '42501';
  end if;
  if jsonb_typeof(items) is distinct from 'array' then
    raise exception 'Expected an array of applications' using errcode = '22023';
  end if;
  insert into public.applications (
    id, user_id, company, role, stage, type, link, notes, applied_date, deadline,
    location, pay, pinned, created_at, stage_changed_at, last_followed_up_at
  )
  select md5(owner_id::text || ':local:' || x.id::text)::uuid, owner_id, x.company,
    x.role, x.stage, x.type, nullif(x.link,''), x.notes, nullif(x.applied_date,'')::date,
    nullif(x.deadline,'')::date, x.location, x.pay, coalesce(x.pinned,false),
    coalesce(x.created_at,now()), coalesce(x.stage_changed_at,now()),
    case when x.last_followed_up_at is not null then least(x.last_followed_up_at,now()) end
  from jsonb_to_recordset(items) as x(
    id uuid, company text, role text, stage text, type text, link text, notes text,
    applied_date text, deadline text, location text, pay text, pinned boolean,
    is_sample boolean, created_at timestamptz, stage_changed_at timestamptz, last_followed_up_at timestamptz
  )
  where not coalesce(x.is_sample,false)
  on conflict (id) do nothing;
  get diagnostics inserted = row_count;
  return inserted;
end;
$$;
revoke all on function public.import_device_applications(uuid,jsonb) from public, anon, authenticated;
grant execute on function public.import_device_applications(uuid,jsonb) to authenticated;

create function public.record_tracker_follow_up(expected_owner uuid, application_id uuid, expected_revision timestamptz)
returns setof public.applications language sql security definer set search_path = '' as $$
  update public.applications a set last_followed_up_at=statement_timestamp()
  where a.user_id = auth.uid() and a.user_id = expected_owner and a.id = application_id
    and a.stage='Applied' and a.updated_at=expected_revision
  returning a.*;
$$;
revoke all on function public.record_tracker_follow_up(uuid,uuid,timestamptz) from public, anon, authenticated;
grant execute on function public.record_tracker_follow_up(uuid,uuid,timestamptz) to authenticated;
