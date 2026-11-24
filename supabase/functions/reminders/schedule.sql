-- Run once after the function, pg_cron, pg_net and Vault secrets are ready.
-- Scheduling again with the same name updates the job for the same database role.
select cron.schedule(
  'application-tracker-reminders',
  '*/5 * * * *',
  $job$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name='tracker_project_url') || '/functions/v1/reminders',
      headers := jsonb_build_object('Content-Type','application/json','x-reminder-secret',
        (select decrypted_secret from vault.decrypted_secrets where name='tracker_reminder_secret')),
      body := '{}'::jsonb,
      timeout_milliseconds := 60000
    );
  $job$
);
