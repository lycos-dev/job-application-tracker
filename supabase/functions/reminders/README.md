# Scheduled email reminders

The function sends a plain-text digest for each opted-in account with a confirmed email. Saved deadlines from today through three days ahead and Applied items with ten calendar days of inactivity qualify. Sample rows are excluded. The database uses the timezone saved when the user enables reminders. Delivery begins at 08:00 local time.

1. Verify a sender domain in Resend and create an API key.
2. Generate a random secret of at least 32 characters. From the repo root run `supabase secrets set --env-file supabase/functions/reminders/.env.local` after placing RESEND_API_KEY, REMINDER_FROM (your verified sender address), and REMINDER_CRON_SECRET in that ignored file. Supabase supplies SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to the hosted function. Keep all these values out of Vite.
3. Push the migrations. Deploy with `supabase functions deploy reminders`. The checked-in config disables gateway JWT verification for this endpoint. The function authenticates every POST using x-reminder-secret.
4. Enable **pg_cron** and **pg_net** in Supabase. In Vault, add **tracker_project_url** with the HTTPS project URL without a trailing slash, and **tracker_reminder_secret** with the same secret as REMINDER_CRON_SECRET.
5. Run the contents of `schedule.sql` in the project SQL Editor. It polls every five minutes. Enable **Daily reminders** on the app’s Account screen to opt in.
6. To pause scheduled execution, run `select cron.unschedule('application-tracker-reminders');`. Individual users can disable reminders in Account.

Each invocation claims up to five digests. The lease prevents overlapping runs from claiming the same work. The database keeps the first digest body for a local day and Resend receives a stable idempotency key when delivery is retried. Delivery failures return HTTP 503 and the next poll can retry after five minutes. Unsent digests expire at the end of the local day. Old delivery records are removed after seven days. To diagnose failures, inspect function invocation status, pg_net responses, and the Resend dashboard. Credentials and email content are excluded from application logs.
