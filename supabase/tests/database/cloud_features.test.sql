begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(14);

insert into auth.users(id,email,email_confirmed_at) values
  ('00000000-0000-4000-8000-000000000011','owner@example.test',now()),
  ('00000000-0000-4000-8000-000000000012','other@example.test',now());
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000011',true);

select is(public.import_device_applications(auth.uid(),jsonb_build_array(jsonb_build_object(
  'id','00000000-0000-4000-8000-000000000099','company','Imported','type','Job','stage','Applied',
  'stage_changed_at',now()-interval '12 days','applied_date',current_date-12
))),1,'First import creates an application');
select is(public.import_device_applications(auth.uid(),'[{"id":"00000000-0000-4000-8000-000000000099","company":"Again","stage":"Saved","type":"Job"}]'),0,'Repeated import skips existing ids');
select is((select stage_changed_at::date from public.applications),current_date-12,'Import keeps follow-up history');
select throws_ok(
  $$select public.import_device_applications('00000000-0000-4000-8000-000000000012','[]')$$,
  '42501',null,'Import cannot target another account'
);
select throws_ok(
  $$select * from public.claim_tracker_reminders()$$,'42501',null,'Browser cannot read reminder queue'
);
-- Choose a real timezone where it is currently afternoon, independent of test runtime.
insert into public.reminder_preferences(enabled,timezone)
select true,name from pg_timezone_names where extract(hour from now() at time zone name) = 14 limit 1;

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000012',true);
select is((select count(*) from public.reminder_preferences),0::bigint,'Preferences stay private');
reset role;
set local role service_role;
create temporary table claimed as select * from public.claim_tracker_reminders();
select is((select count(*) from claimed),1::bigint,'Eligible confirmed user gets one digest');
select is((select recipient from claimed),'owner@example.test','Only the owner receives their digest');
select is_empty($$select * from public.claim_tracker_reminders()$$,'A second worker cannot claim a leased digest');
select public.ack_tracker_reminder(owner_id,mail_day,token) from claimed;
select is_empty($$select * from public.claim_tracker_reminders()$$,'Acknowledged day cannot be claimed again');
set local role authenticated;
select is_empty(
  $$select * from public.record_tracker_follow_up('00000000-0000-4000-8000-000000000011',
    md5('00000000-0000-4000-8000-000000000011:local:00000000-0000-4000-8000-000000000099')::uuid,now())$$,
  'Another account cannot log a follow-up'
);
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000011',true);
create temporary table before_follow as select * from public.applications;
select is((select count(*) from public.record_tracker_follow_up(auth.uid(),(select id from before_follow),
  (select updated_at from before_follow))),1::bigint,'Owner can record a follow-up');
select is((select last_followed_up_at::date from public.applications),current_date,'Follow-up starts a fresh clock');
select is((select applied_date from public.applications),(select applied_date from before_follow),'Original application date survives follow-up');
select * from finish();
rollback;
