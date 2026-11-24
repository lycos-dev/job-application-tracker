create table public.reminder_preferences (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  enabled boolean not null default false,
  timezone text not null default 'UTC'
);
alter table public.reminder_preferences enable row level security;
revoke all on public.reminder_preferences from public, anon, authenticated;
grant select, insert on public.reminder_preferences to authenticated;
grant update (enabled, timezone, user_id) on public.reminder_preferences to authenticated;
create policy manage_own_reminders on public.reminder_preferences
for all to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create function tracker_private.validate_timezone()
returns trigger language plpgsql set search_path = '' as $$
begin
  if not exists (select from pg_catalog.pg_timezone_names where name = new.timezone) then
    raise exception 'Unknown timezone' using errcode = '22023';
  end if;
  return new;
end;
$$;
create trigger reminder_timezone before insert or update of timezone on public.reminder_preferences
for each row execute function tracker_private.validate_timezone();

create table tracker_private.reminder_mail (
  user_id uuid not null references auth.users on delete cascade,
  mail_day date not null,
  recipient text not null,
  content text not null,
  lease_until timestamptz,
  lease_token uuid,
  sent_at timestamptz,
  primary key (user_id,mail_day)
);
revoke all on tracker_private.reminder_mail from public, anon, authenticated;

-- Resolve the confirmed address on the server. One immutable digest per local day.
create function public.claim_tracker_reminders()
returns table(owner_id uuid, mail_day date, recipient text, content text, token uuid)
language plpgsql security definer set search_path = '' as $$
begin
  delete from tracker_private.reminder_mail m where m.mail_day < current_date - 7;

  insert into tracker_private.reminder_mail as m (user_id,mail_day,recipient,content)
  select p.user_id, clock.local_day, u.email,
    'Your application reminders for ' || clock.local_day::text || E'\n\n' || due.lines
  from public.reminder_preferences p
  join auth.users u on u.id=p.user_id
  cross join lateral (select (now() at time zone p.timezone)::date as local_day) clock
  cross join lateral (
    select string_agg(
      case when a.stage='Saved' then 'Apply by ' || a.deadline::text else 'Follow up' end ||
      ' — ' || a.company || coalesce(' · ' || nullif(a.role,''),''),
      E'\n' order by a.deadline nulls last, a.company, a.id
    ) as lines from public.applications a
    where a.user_id=p.user_id and not a.is_sample and (
      (a.stage='Saved' and a.deadline between clock.local_day and clock.local_day+3)
      or (a.stage='Applied' and clock.local_day-(greatest(a.stage_changed_at,a.last_followed_up_at) at time zone p.timezone)::date >= 10)
    )
  ) due
  where p.enabled and u.email_confirmed_at is not null and nullif(u.email,'') is not null
    and extract(hour from now() at time zone p.timezone) >= 8 and due.lines is not null
    and not exists (select from tracker_private.reminder_mail existing
      where existing.user_id=p.user_id and existing.mail_day=clock.local_day)
  order by p.user_id limit 10
  on conflict on constraint reminder_mail_pkey do nothing;

  return query
  with available as (
    select q.user_id,q.mail_day from tracker_private.reminder_mail q
    join public.reminder_preferences p on p.user_id=q.user_id and p.enabled
    join auth.users u on u.id=q.user_id and u.email=q.recipient and u.email_confirmed_at is not null
    where q.sent_at is null and q.mail_day=(now() at time zone p.timezone)::date
      and (q.lease_until is null or q.lease_until < now())
    order by q.lease_until nulls first,q.user_id limit 5 for update of q skip locked
  )
  update tracker_private.reminder_mail q
    set lease_until=now()+interval '5 minutes', lease_token=gen_random_uuid()
  from available b where (q.user_id,q.mail_day)=(b.user_id,b.mail_day)
  returning q.user_id,q.mail_day,q.recipient,q.content,q.lease_token;
end;
$$;

create function public.ack_tracker_reminder(owner_id uuid, day_sent date, token uuid)
returns void language sql security definer set search_path = '' as $$
  update tracker_private.reminder_mail set sent_at=now(),lease_until=null,lease_token=null
  where user_id=owner_id and mail_day=day_sent and lease_token=token;
$$;
revoke all on function public.claim_tracker_reminders(), public.ack_tracker_reminder(uuid,date,uuid)
from public, anon, authenticated;
grant execute on function public.claim_tracker_reminders(), public.ack_tracker_reminder(uuid,date,uuid)
to service_role;
