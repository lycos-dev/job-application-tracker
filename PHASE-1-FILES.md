# Application Tracker · Phase 1

Each heading is a path relative to the repository root.

## `.gitignore`

```text
node_modules/
dist/
.vercel/
.env
.env.*
!.env.example
supabase/.temp/
supabase/.branches/
*.local
*.log
.DS_Store
```

## `.env.example`

```text
# Copy to .env.local for Vite. Set both variables in Vercel as well.
# Use the public anon key from your Supabase project's API settings.
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## `package.json`

```json
{
  "name": "application-tracker",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=22.12.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "db:start": "supabase start",
    "db:stop": "supabase stop",
    "db:link": "supabase link",
    "db:push": "supabase db push",
    "db:reset": "supabase db reset --local",
    "db:lint": "supabase db lint --local --fail-on error",
    "db:test": "supabase test db",
    "db:new": "supabase migration new"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@supabase/supabase-js": "^2.95.3",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.13.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^6.0.0",
    "eslint": "^9.39.0",
    "eslint-plugin-react-hooks": "^7.0.1",
    "vite": "^8.0.0"
  }
}
```

## `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
})
```

## `vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## `eslint.config.js`

```js
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  { ignores: ['dist/**', 'supabase/.temp/**', 'supabase/.branches/**'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'no-debugger': 'error',
      'no-dupe-keys': 'error',
      'no-unreachable': 'error',
      'no-unsafe-finally': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
    },
  },
]
```

## `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" media="(prefers-color-scheme: light)" content="#e8ebee" />
    <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0a0c0f" />
    <meta name="description" content="Track jobs, internships, freelance work, and other opportunities from saved link to final decision." />
    <title>Application Tracker</title>
  </head>
  <body>
    <div id="root"></div>
    <noscript>Enable JavaScript to use Application Tracker.</noscript>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

## `src/main.jsx`

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

## `src/App.jsx`

```jsx
export default function App() {
  return (
    <main>
      <h1>Application Tracker</h1>
    </main>
  )
}
```

## `supabase/config.toml`

```toml
project_id = "application-tracker"

[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322
shadow_port = 54320
major_version = 17

[db.migrations]
enabled = true

[db.seed]
enabled = false

[realtime]
enabled = true

[auth]
enabled = true
site_url = "http://localhost:5173"
additional_redirect_urls = [
  "http://localhost:5173/auth/callback",
  "http://localhost:5173/reset-password"
]
enable_signup = true
minimum_password_length = 8

[auth.email]
enable_signup = true
enable_confirmations = true
double_confirm_changes = true
```

## `supabase/migrations/20261124000100_create_applications.sql`

```sql
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
```

## `supabase/tests/database/application_rules.test.sql`

```sql
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
```
