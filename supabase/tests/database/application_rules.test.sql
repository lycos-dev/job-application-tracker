begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(12);

insert into auth.users (id) values
  ('00000000-0000-4000-8000-000000000001'),
  ('00000000-0000-4000-8000-000000000002');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);

insert into public.applications (id, company) values
  ('00000000-0000-4000-8000-100000000001', 'Northwind');
select is((select stage from public.applications), 'Saved', 'Quick save defaults to Saved');
select is((select applied_date from public.applications), null::date, 'Quick save leaves date empty');

update public.applications set stage = 'Interviewing', applied_date = date '2000-01-01';
select is((select applied_date from public.applications), current_date, 'Moving out of Saved stamps today');

insert into public.applications (company, stage, is_sample, applied_date)
values ('Contoso', 'Applied', true, current_date - 12);
update public.applications set notes = 'New notes', pinned = true where company = 'Contoso';
select is(
  (select stage_changed_at::date from public.applications where company = 'Contoso'),
  current_date - 12, 'Editing or pinning preserves the follow-up clock'
);
update public.applications set stage = 'Offer' where company = 'Contoso';
select is(
  (select stage_changed_at::date from public.applications where company = 'Contoso'),
  current_date, 'Changing stage resets the follow-up clock'
);
select throws_ok(
  $$insert into public.applications (company, link) values ('Example', 'javascript:alert(1)')$$,
  '23514', null, 'Unsupported URL scheme is rejected'
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000002', true);
select is((select count(*) from public.applications), 0::bigint, 'Second account sees zero rows');
select is_empty(
  $$update public.applications set pinned = false returning id$$, 'Second account cannot edit rows'
);
select is_empty(
  $$delete from public.applications returning id$$, 'Second account cannot delete rows'
);
select throws_ok(
  $$insert into public.applications (user_id, company)
    values ('00000000-0000-4000-8000-000000000001', 'Wrong owner')$$,
  '42501', null, 'Explicit cross-account ownership is rejected'
);

insert into public.applications (company, stage) values ('Fabrikam', 'Applied');
select is((select applied_date from public.applications), current_date, 'Logging directly in Applied stamps today');
delete from public.applications where company = 'Fabrikam';
select is((select count(*) from public.applications), 0::bigint, 'Owner can delete their row');

select * from finish();
rollback;
