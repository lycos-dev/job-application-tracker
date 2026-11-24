# Roleward™ by Lycos Blanza

One repository contains the Vite/React frontend at the root and the Postgres migrations, RLS policies, database tests, and optional reminder function under `supabase/`.

## Run it

Use Node 22.12 or newer and npm. From the folder containing package.json:

```sh
npm ci
npm run dev
```

Set the two public Supabase variables in .env.local before starting Vite, or use the local-stack launcher below. Open http://localhost:5173 and sign in. Sample applications are available inside your account.

## Log in and sign up locally

1. Install the Supabase CLI and start Docker Desktop (or a compatible Docker runtime).
2. Stop any Vite server already using port 5173. From the repository root run:
   ```sh
   npm run dev:local
   ```
3. Open http://localhost:5173 and select **Sign up**. Enter an email and matching passwords. The launcher prints the URL of the local email inbox. Confirm using the button in the email or enter its code in the app. Test **Log in**, **Forgot password?** and **Sign out** against this local project.
4. The launcher starts Supabase, applies pending local migrations and passes its local API URL and public key to Vite for this session. Existing env files stay intact. Stop Vite with Ctrl+C. Run `npm run db:stop` when finished with the local backend.

Google sign-in needs a Google OAuth client, even during local testing. The Google provider setup is described below. If a previous release saved applications on this browser, Settings → Import device applications copies personal rows after confirmation. Previously imported IDs are skipped.

## Update your existing deployment

1. Copy this release into the existing repository root and deploy it to Vercel. Keep your existing Supabase project and data. No database migration is required for this release.
2. In Supabase → Authentication → URL Configuration, use your live Vercel origin as **Site URL**. Add the exact production URLs ending in **/auth/callback** and **/reset-password** to Redirect URLs. Add the same paths on localhost or trusted preview domains if you use them.
3. In Authentication → Email Templates, replace **Confirm signup** with the entire contents of `supabase/templates/confirmation.html` and **Reset password** with `supabase/templates/recovery.html`. Save each template. These templates use the app-supplied return URL, a one-time token hash, and a numeric code. A link opens the app and waits for a click before verification. A code also works in another browser. Hosted templates must be saved in the dashboard even if local templates are configured.
4. Enable Email and Confirm email under Authentication → Sign In / Providers. For a public app, configure a verified sender with custom SMTP in Auth settings. The default Supabase mailer restricts recipients to your project team. Disable click tracking for auth emails at your mail provider. Inspect Auth logs and provider delivery logs if mail is missing.
5. In Google Cloud, create an OAuth **Web application** client for Roleward. Add the production app origin to Authorized JavaScript origins. Add the Supabase callback displayed by the Google provider to Authorized redirect URIs. For this project it is `https://ftrmvinaswmnkmrkiazn.supabase.co/auth/v1/callback`. Save the client ID and secret in Supabase → Authentication → Sign In / Providers → Google and enable it. For public access, configure an external audience and publish the consent app when ready. While in Testing, add your testers in Google Cloud.
6. On the deployed URL, sign up with a new address. Open the latest email on a second device and select **Confirm email**. For a second signup, test entering the emailed code. Then sign out and test password login, Google sign-in, cancellation, and password reset in a private window. Opening `/local` signed out should return to login. Close old app tabs and reopen if the installed app still shows the former branding.

## Workspace navigation

| Tab | What you can do |
| --- | --- |
| Dashboard | See all five stage totals, click a stage to open its board filter, review the three next actions, or reopen one of the four most recently updated applications. |
| Applications | Quick-save a link, log an application, edit details, search, filter, switch between board and list, or move a card. |
| Follow-ups | Work through overdue and upcoming Saved deadlines (seven-day window) and Applied items due for a follow-up. Log a follow-up to remove it from the due queue. |
| Settings | Change theme, manage sample data, access account controls, import device records, and opt into reminders. |

The sidebar becomes a bottom navigation bar on phones. Each tab has its own URL and supports browser back, forward, and reload. On desktop, press / from any workspace tab to jump to search.

## Supabase setup

1. Create a Supabase project. Install the Supabase CLI and run `supabase login`. The source already includes supabase/config.toml. The standard initialization command `supabase init` is needed only for an empty checkout that has no Supabase directory.
2. From the repo root link and apply the schema:
   ```sh
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```
3. Copy .env.example to .env.local. Set VITE_SUPABASE_URL to the project URL and VITE_SUPABASE_PUBLISHABLE_KEY to the project’s publishable key. The existing VITE_SUPABASE_ANON_KEY variable also works. Restart Vite. Keep service-role, provider, and reminder secrets on the backend.
4. In Authentication → Sign In / Providers, enable Email. Turn on confirmation and configure production SMTP for confirmation and recovery mail. Set a minimum password length of at least eight. The app uses PKCE. Open email links in the same browser that requested them when using Supabase’s default templates.
5. For Google, create a Web OAuth client in Google Cloud. Register the **Supabase callback URL displayed in the Google provider settings** as the authorized redirect URI. Paste the Google client ID and secret into the Supabase Google provider and enable it. The app returns from Supabase to /auth/callback.
6. In Authentication → URL Configuration, set Site URL to the production Vercel origin. Add both /auth/callback and /reset-password on the production origin and on http://localhost:5173. Add http://localhost:5173 for local testing. For previews add the two paths using a wildcard restricted to **your project and Vercel team**, for example `https://your-project-*-your-team.vercel.app/auth/callback` and the corresponding /reset-password URL. Check the actual preview hostname pattern before saving.
7. The migrations publish applications to supabase_realtime. Keep private Realtime channels enabled. Signed-in clients listen for owner-filtered inserts and updates and a private deletion signal. The client reconciles on subscription, reconnect, and window focus.

To run the stack locally, start Docker and use `npm run db:start`. Read the local URL, anon key and email test inbox URL from `supabase status`. Set those local values in .env.local. Run `npm run db:test` against this local database. Cloud provider settings are configured separately on a hosted project. For local Google testing, enable [auth.external.google] in config.toml with env-backed client_id and secret, and register the local Supabase Auth callback with Google.

## Vercel

1. Push the complete application-tracker directory as the repository root. Import that repository in Vercel. Leave Root Directory at the root.
2. Use the detected Vite preset, npm run build, dist output, and Node 22.12+ (Node 24 works). The lockfile is included.
3. Set the two VITE_SUPABASE variables for Production and the Preview environments you use. Point previews at a separate Supabase project if using test data.
4. Deploy, copy the assigned domain into Supabase Auth URL Configuration, and redeploy after any change to build-time env values. vercel.json rewrites SPA routes to index.html. Test by opening /login and /reset-password directly.
5. The production build includes locally hosted fonts, a manifest, phone icons and a versioned offline shell. Install from the HTTPS site’s browser menu or iOS Share → Add to Home Screen. Hosted writes require connectivity. Cached cloud data is scoped by project and account, and cleared for the departing account on sign-out.

## Workflow

- Quick save accepts a company or posting link. Enter creates a Saved card, then opens its editor. Log application and the mobile plus button open an Applied draft. More details contains dates, location and pay.
- Stage tiles filter both views. Search, type, and follow-up filters combine. Clear filters restores the pipeline. Priority rows sort first.
- Drag by the grip, hold it briefly on touch, use the Move to… picker, or change the stage in List. Moving out of Saved stamps today's applied date. A stage change restarts the follow-up clock. Editing notes or starring a row preserves it.
- Saved deadlines turn amber at three days and red after expiry. Applied items prompt follow-up after ten local calendar days. Use **Log follow-up** to restart the ten-day timer without changing the stage or applied date. A move toast can reveal the destination stage.
- Cloud mutations appear immediately and revert on failure. A revision check prevents stale updates and deletes. Close and reopen an editor to review the latest record after a conflict. Closing a changed draft offers **Keep editing**. Destructive deletion requires a second action.
- Use / for search and n for a new application. The theme follows the device until overridden. Motion honors the device’s reduced-motion preference.
- Sample rows can be removed together without touching personal entries.

## Commands

```sh
npm run dev
npm run lint
npm test
npm run build
npm run preview
npm run dev:local
npm run db:start
npm run db:test
npm run db:lint
npm run db:push
```

npm run db:reset recreates only the **local** database. Run it only when you intend to erase local database data. The root package contains the requested frontend libraries, Vite/React build tooling, and ESLint/React Hooks lint tooling. Regression tests use Node's built-in test runner. The Edge Function uses native fetch and the runtime crypto library.

## Optional email reminders

Deployment and scheduling instructions are in [supabase/functions/reminders/README.md](supabase/functions/reminders/README.md). Migrations prepare the schema. Email delivery starts when an operator configures Resend, deploys the function, schedules it, and a user opts in.

## Acceptance checklist

- Create an account, confirm its email, sign in, sign out, complete Google OAuth, and reset a password using the email link.
- Add by URL and company. Log an Applied item. Reload the tracker and confirm persistence. Check the optional import against your original device records.
- Move a card with the mouse and with a touch hold. Move another with the sheet. Confirm stage counts and applied dates.
- Combine stage, search, type, priority and follow-up controls. Clear sample data and check personal records remain.
- Open one account in two browsers. Add, move and delete in one. Observe changes in the other. Edit a stale draft and check the conflict warning.
- Sign into a second account. Check that the first user's rows never display. Run the database tests to check ownership enforcement independently of the UI.
- Install on a phone over HTTPS, reopen offline, check cached data, reconnect, and exercise the 360px layout and bottom sheet.
