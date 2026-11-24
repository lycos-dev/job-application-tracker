# Roleward™ source files

Each heading gives the path relative to the repository root.

## `.env.example`

````
# Copy to .env.local for Vite. Set these public values in Vercel.
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
# Existing deployments may keep VITE_SUPABASE_ANON_KEY as the public-key variable.
````

## `.gitignore`

````
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
````

## `README.md`

````
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
````

## `eslint.config.js`

````
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
````

## `index.html`

````
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#e8ebee" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="icon" href="/icons/icon-192.png" type="image/png" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <link rel="preload" href="/fonts/barlow-condensed-700.woff2" as="font" type="font/woff2" crossorigin />
    <meta name="description" content="Track jobs, internships, freelance work, and other opportunities from saved link to final decision." />
    <meta name="referrer" content="no-referrer" />
    <title>Roleward™ · Application Tracker</title>
  </head>
  <body>
    <div id="root"></div>
    <noscript>Enable JavaScript to use Roleward™.</noscript>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
````

## `package-lock.json`

````
{
  "name": "application-tracker",
  "version": "0.1.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "application-tracker",
      "version": "0.1.0",
      "dependencies": {
        "@dnd-kit/core": "^6.3.1",
        "@supabase/supabase-js": "^2.119.2",
        "react": "^19.2.0",
        "react-dom": "^19.2.0",
        "react-router-dom": "^7.13.0"
      },
      "devDependencies": {
        "@vitejs/plugin-react": "^6.0.0",
        "eslint": "^9.39.0",
        "eslint-plugin-react-hooks": "^7.0.1",
        "vite": "^8.0.0"
      },
      "engines": {
        "node": ">=22.12.0"
      }
    },
    "node_modules/@babel/code-frame": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.29.7.tgz",
      "integrity": "sha512-Aup7aUOfpbAUg2ROOJN6Iw5f9DMBlzu0mIkm/malLQFN/YQgO48wCj0Kxa3sEHJvPVFg7siR+qRInwXd2qhQKw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-validator-identifier": "^7.29.7",
        "js-tokens": "^4.0.0",
        "picocolors": "^1.1.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/compat-data": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/compat-data/-/compat-data-7.29.7.tgz",
      "integrity": "sha512-locTkQyKvwIEgBzVrn8693ebc97F2U8ZHjbXwDXJ5Fn2TCpNwTlKcaKLkdHop5c/icOFE7qt7Q9JC5hnKNa6Gg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/core": {
      "version": "7.29.13",
      "resolved": "https://registry.npmjs.org/@babel/core/-/core-7.29.13.tgz",
      "integrity": "sha512-j1nvOQCZYSgp7HLmisnCXFTpVvFODiijQ9QHkORfGKWH6YDtskTEeCJS7eV545GZ9UBzrq0e2xsOd5QQ5PjIqw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/generator": "^7.29.13",
        "@babel/helper-compilation-targets": "^7.29.13",
        "@babel/helper-module-transforms": "^7.29.13",
        "@babel/helpers": "^7.29.13",
        "@babel/parser": "^7.29.13",
        "@babel/template": "^7.29.7",
        "@babel/traverse": "^7.29.13",
        "@babel/types": "^7.29.11",
        "@jridgewell/remapping": "^2.3.5",
        "convert-source-map": "^2.0.0",
        "debug": "^4.1.0",
        "gensync": "^1.0.0-beta.2",
        "json5": "^2.2.3",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/babel"
      }
    },
    "node_modules/@babel/generator": {
      "version": "7.29.15",
      "resolved": "https://registry.npmjs.org/@babel/generator/-/generator-7.29.15.tgz",
      "integrity": "sha512-gNWJUX0FlevflramOkaInywOMhU1lkln38gAC7TFZv2tsWbLYbN/2WZFGcq8zbX0Z55e4vGa27IB/NaeZoauWQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.29.15",
        "@babel/types": "^7.29.15",
        "@jridgewell/gen-mapping": "^0.3.12",
        "@jridgewell/trace-mapping": "^0.3.28",
        "jsesc": "^3.0.2"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-compilation-targets": {
      "version": "7.29.13",
      "resolved": "https://registry.npmjs.org/@babel/helper-compilation-targets/-/helper-compilation-targets-7.29.13.tgz",
      "integrity": "sha512-8WxJ4/Vmes3ghacj8VOJy3NW8eyHiFY/4thU/LSBuBE470+igjR/j1ZTNn8fV5VdNrLx6iXUwig526UdOvfP0w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/compat-data": "^7.29.7",
        "@babel/helper-validator-option": "^7.29.7",
        "browserslist": "^4.24.0",
        "lru-cache": "^5.1.1",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-globals": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-globals/-/helper-globals-7.29.7.tgz",
      "integrity": "sha512-3nQVUAtvkKH9zahfWgw96Jc/uFOmjACE1kQz82E2lqWmHBgjzbNlsC22nuQTfahmWeQtTq5nQ/4Nnd2A1wj4zA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-imports": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-imports/-/helper-module-imports-7.29.7.tgz",
      "integrity": "sha512-ejHwrQQYcm9xnTivShn2IDOlIzInN34AXskvq9QicvCtEzq1Vzclu/tKF8Jq1Cg8JG2GL6/EmjgsCT7lXepE3g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/traverse": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-transforms": {
      "version": "7.29.14",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-transforms/-/helper-module-transforms-7.29.14.tgz",
      "integrity": "sha512-2XDvQVd9JESaOgGc4jT2/jquTAO7ppA5noTZQqH+MmZ89yjCzScLwtCPbWtkPZylL+TLWR49IwWmk+QkRR4GsA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-module-imports": "^7.29.7",
        "@babel/helper-validator-identifier": "^7.29.7",
        "@babel/traverse": "^7.29.14"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/helper-string-parser": {
      "version": "7.29.15",
      "resolved": "https://registry.npmjs.org/@babel/helper-string-parser/-/helper-string-parser-7.29.15.tgz",
      "integrity": "sha512-C2FuapQ2Kh1OnVHAoLi5rD3GBJ8COb9Q609T6HEpLqaBAo560PDP5OxBE5dCI/h951MBO/+bCUYU5SZ+8ZlV+w==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-identifier": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-identifier/-/helper-validator-identifier-7.29.7.tgz",
      "integrity": "sha512-qehxGkRj55h/ff8EMaJ+cYhyaKlHIxqYDn682wQD7RNp9UujOQsHog2uS0r2vzr4pW+sXf90NeeayjcNaX3fFg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-option": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-option/-/helper-validator-option-7.29.7.tgz",
      "integrity": "sha512-N9ZErrD+yW5geCDtBqnOoxmR8+tNKiGuxKlDpuJxfsqpa2dFcexaziGAE/qoHLiDDreVNMupxGmSoNlyvsA3gw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helpers": {
      "version": "7.29.15",
      "resolved": "https://registry.npmjs.org/@babel/helpers/-/helpers-7.29.15.tgz",
      "integrity": "sha512-l+ezV2czw3t2d2ELq+3CwPL4WLKK5O8IywBXb9/gpmbCOVZFmRYJPmHVqSCv2k+8iKbE30Zf54siOoIZ52XOxA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/template": "^7.29.7",
        "@babel/types": "^7.29.15"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/parser": {
      "version": "7.29.15",
      "resolved": "https://registry.npmjs.org/@babel/parser/-/parser-7.29.15.tgz",
      "integrity": "sha512-RpKWyisHoP81twtSCgmE02iU0RnPcq1DN5bBEbpUePrjA9Q3wXhufnCJrrayPpoZieqFh3zyZQqwtSK0gGccRA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.29.15"
      },
      "bin": {
        "parser": "bin/babel-parser.js"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@babel/template": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/template/-/template-7.29.7.tgz",
      "integrity": "sha512-puq+Gf35oI24FeN11LkoUQFqv9uwNeWpxXZi/Ji3rRIoKAzKnxRaZ+Gkj0vKS9ZCiTESfng1N9LyOyXvo+m+Gg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/parser": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/traverse": {
      "version": "7.29.15",
      "resolved": "https://registry.npmjs.org/@babel/traverse/-/traverse-7.29.15.tgz",
      "integrity": "sha512-ZfawBo2i8vvt+BTt37dWDKBPjUfm/H+bw+ltwsCRhW7gPtyNVwUXuNo54eO2Xo+P4VXpalPFfFISbBTRKC8SOQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/generator": "^7.29.15",
        "@babel/helper-globals": "^7.29.7",
        "@babel/parser": "^7.29.15",
        "@babel/template": "^7.29.7",
        "@babel/types": "^7.29.15",
        "debug": "^4.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/types": {
      "version": "7.29.15",
      "resolved": "https://registry.npmjs.org/@babel/types/-/types-7.29.15.tgz",
      "integrity": "sha512-/XKpKDakL//LZ66bq1XsZOswuqeI5MZqPLDu18o3XdkU1fNJ7bdPtzgnc4ZNS+bBGHV0FJG8jjb8SwcC3nNVQQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-string-parser": "^7.29.15",
        "@babel/helper-validator-identifier": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@dnd-kit/accessibility": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/@dnd-kit/accessibility/-/accessibility-3.1.1.tgz",
      "integrity": "sha512-2P+YgaXF+gRsIihwwY1gCsQSYnu9Zyj2py8kY5fFvUM1qm2WA2u639R6YNVfU4GWr+ZM5mqEsfHZZLoRONbemw==",
      "license": "MIT",
      "dependencies": {
        "tslib": "^2.0.0"
      },
      "peerDependencies": {
        "react": ">=16.8.0"
      }
    },
    "node_modules/@dnd-kit/core": {
      "version": "6.3.1",
      "resolved": "https://registry.npmjs.org/@dnd-kit/core/-/core-6.3.1.tgz",
      "integrity": "sha512-xkGBRQQab4RLwgXxoqETICr6S5JlogafbhNsidmrkVv2YRs5MLwpjoF2qpiGjQt8S9AoxtIV603s0GIUpY5eYQ==",
      "license": "MIT",
      "dependencies": {
        "@dnd-kit/accessibility": "^3.1.1",
        "@dnd-kit/utilities": "^3.2.2",
        "tslib": "^2.0.0"
      },
      "peerDependencies": {
        "react": ">=16.8.0",
        "react-dom": ">=16.8.0"
      }
    },
    "node_modules/@dnd-kit/utilities": {
      "version": "3.2.2",
      "resolved": "https://registry.npmjs.org/@dnd-kit/utilities/-/utilities-3.2.2.tgz",
      "integrity": "sha512-+MKAJEOfaBe5SmV6t34p80MMKhjvUz0vRrvVJbPT0WElzaOJ/1xs+D+KDv+tD/NE5ujfrChEcshd4fLn0wpiqg==",
      "license": "MIT",
      "dependencies": {
        "tslib": "^2.0.0"
      },
      "peerDependencies": {
        "react": ">=16.8.0"
      }
    },
    "node_modules/@emnapi/core": {
      "version": "2.0.0-beta.2",
      "resolved": "https://registry.npmjs.org/@emnapi/core/-/core-2.0.0-beta.2.tgz",
      "integrity": "sha512-MzCVoWtcg4Pm2B3je5mMvYMvj3MmBKw+fU7vbsJc9/iT8ip6/eYIHo/Dsm/mr+wsHB6SEyJDuxB09Yy6r/8+4A==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@emnapi/wasi-threads": "2.2.0",
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@emnapi/runtime": {
      "version": "2.0.0-beta.2",
      "resolved": "https://registry.npmjs.org/@emnapi/runtime/-/runtime-2.0.0-beta.2.tgz",
      "integrity": "sha512-JcrSPzPvZuNZvJqPTF9Fw25LbOJ8avzFVlaf2grmH4Cku0oGP47tRgqPZadcfj3YoZMHkFVnCYFbQM8I+i5QEw==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@emnapi/wasi-threads": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/@emnapi/wasi-threads/-/wasi-threads-2.2.0.tgz",
      "integrity": "sha512-JP7OYH38Q7+pyTAe14raZHLQIK7BDKbdwji+Xi3pcd/6QkJYQH3SX4wu6EplGrGJWRepoNzedfm0G3B9Z4e9Rw==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@eslint-community/eslint-utils": {
      "version": "4.10.1",
      "resolved": "https://registry.npmjs.org/@eslint-community/eslint-utils/-/eslint-utils-4.10.1.tgz",
      "integrity": "sha512-cuadcxVFE8sDK6iWJbs8Sn0av2Nrh2QSGQhVlBW9AaAHqHwjWsZHT8LJ4hFGPh7ASBV2deFdM7H/DPjulmh8rg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "eslint-visitor-keys": "^3.4.3"
      },
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      },
      "peerDependencies": {
        "eslint": "^6.0.0 || ^7.0.0 || >=8.0.0"
      }
    },
    "node_modules/@eslint-community/eslint-utils/node_modules/eslint-visitor-keys": {
      "version": "3.4.3",
      "resolved": "https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-3.4.3.tgz",
      "integrity": "sha512-wpc+LXeiyiisxPlEkUzU6svyS1frIO3Mgxj1fdy7Pm8Ygzguax2N3Fa/D/ag1WqbOprdI+uY6wMUl8/a2G+iag==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": "^12.22.0 || ^14.17.0 || >=16.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/@eslint-community/regexpp": {
      "version": "4.12.3",
      "resolved": "https://registry.npmjs.org/@eslint-community/regexpp/-/regexpp-4.12.3.tgz",
      "integrity": "sha512-R76UKbvsqI68DJJVTVyqFKqU98CN4+B+acxNfEA2IFarSzP0SjtKf/3+fFiXzTyv5Fj3PxLkGHe2wnVWWMxobQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^12.0.0 || ^14.0.0 || >=16.0.0"
      }
    },
    "node_modules/@eslint/config-array": {
      "version": "0.21.2",
      "resolved": "https://registry.npmjs.org/@eslint/config-array/-/config-array-0.21.2.tgz",
      "integrity": "sha512-nJl2KGTlrf9GjLimgIru+V/mzgSK0ABCDQRvxw5BjURL7WfH5uoWmizbH7QB6MmnMBd8cIC9uceWnezL1VZWWw==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@eslint/object-schema": "^2.1.7",
        "debug": "^4.3.1",
        "minimatch": "^3.1.5"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/config-helpers": {
      "version": "0.4.2",
      "resolved": "https://registry.npmjs.org/@eslint/config-helpers/-/config-helpers-0.4.2.tgz",
      "integrity": "sha512-gBrxN88gOIf3R7ja5K9slwNayVcZgK6SOUORm2uBzTeIEfeVaIhOpCtTox3P6R7o2jLFwLFTLnC7kU/RGcYEgw==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@eslint/core": "^0.17.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/core": {
      "version": "0.17.0",
      "resolved": "https://registry.npmjs.org/@eslint/core/-/core-0.17.0.tgz",
      "integrity": "sha512-yL/sLrpmtDaFEiUj1osRP4TI2MDz1AddJL+jZ7KSqvBuliN4xqYY54IfdN8qD8Toa6g1iloph1fxQNkjOxrrpQ==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@types/json-schema": "^7.0.15"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/eslintrc": {
      "version": "3.3.7",
      "resolved": "https://registry.npmjs.org/@eslint/eslintrc/-/eslintrc-3.3.7.tgz",
      "integrity": "sha512-F42g89Qd5oAWtp0k0nnSrjziAKza7w8SVT4mStc18LZMaRb4J1HQAHLCalEtDCxrTuksx7NU9qsmeLwpOfPqWw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ajv": "^6.14.0",
        "debug": "^4.3.2",
        "espree": "^10.0.1",
        "globals": "^14.0.0",
        "ignore": "^5.2.0",
        "import-fresh": "^3.2.1",
        "js-yaml": "^4.3.2",
        "minimatch": "^3.1.5",
        "strip-json-comments": "^3.1.1"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/@eslint/js": {
      "version": "9.39.5",
      "resolved": "https://registry.npmjs.org/@eslint/js/-/js-9.39.5.tgz",
      "integrity": "sha512-QywQuszQh77pIXCsq998c8hbhSTI/azTty1Z6N53dmAudKHhy573j3yvRLsX2BSp8YpLtoCEG8E9DJe+8zUh4A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://eslint.org/donate"
      }
    },
    "node_modules/@eslint/object-schema": {
      "version": "2.1.7",
      "resolved": "https://registry.npmjs.org/@eslint/object-schema/-/object-schema-2.1.7.tgz",
      "integrity": "sha512-VtAOaymWVfZcmZbp6E2mympDIHvyjXs/12LqWYjVw6qjrfF+VK+fyG33kChz3nnK+SU5/NeHOqrTEHS8sXO3OA==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@eslint/plugin-kit": {
      "version": "0.4.1",
      "resolved": "https://registry.npmjs.org/@eslint/plugin-kit/-/plugin-kit-0.4.1.tgz",
      "integrity": "sha512-43/qtrDUokr7LJqoF2c3+RInu/t4zfrpYdoSDfYyhg52rwLV6TnOvdG4fXm7IkSB3wErkcmJS9iEhjVtOSEjjA==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@eslint/core": "^0.17.0",
        "levn": "^0.4.1"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      }
    },
    "node_modules/@humanfs/core": {
      "version": "0.19.2",
      "resolved": "https://registry.npmjs.org/@humanfs/core/-/core-0.19.2.tgz",
      "integrity": "sha512-UhXNm+CFMWcbChXywFwkmhqjs3PRCmcSa/hfBgLIb7oQ5HNb1wS0icWsGtSAUNgefHeI+eBrA8I1fxmbHsGdvA==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@humanfs/types": "^0.15.0"
      },
      "engines": {
        "node": ">=18.18.0"
      }
    },
    "node_modules/@humanfs/node": {
      "version": "0.16.8",
      "resolved": "https://registry.npmjs.org/@humanfs/node/-/node-0.16.8.tgz",
      "integrity": "sha512-gE1eQNZ3R++kTzFUpdGlpmy8kDZD/MLyHqDwqjkVQI0JMdI1D51sy1H958PNXYkM2rAac7e5/CnIKZrHtPh3BQ==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@humanfs/core": "^0.19.2",
        "@humanfs/types": "^0.15.0",
        "@humanwhocodes/retry": "^0.4.0"
      },
      "engines": {
        "node": ">=18.18.0"
      }
    },
    "node_modules/@humanfs/types": {
      "version": "0.15.0",
      "resolved": "https://registry.npmjs.org/@humanfs/types/-/types-0.15.0.tgz",
      "integrity": "sha512-ZZ1w0aoQkwuUuC7Yf+7sdeaNfqQiiLcSRbfI08oAxqLtpXQr9AIVX7Ay7HLDuiLYAaFPu8oBYNq/QIi9URHJ3Q==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=18.18.0"
      }
    },
    "node_modules/@humanwhocodes/module-importer": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@humanwhocodes/module-importer/-/module-importer-1.0.1.tgz",
      "integrity": "sha512-bxveV4V8v5Yb4ncFTT3rPSgZBOpCkjfK0y4oVVVJwIuDVBRMDXrPyXRL988i5ap9m9bnyEEjWfm5WkBmtffLfA==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=12.22"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/nzakas"
      }
    },
    "node_modules/@humanwhocodes/retry": {
      "version": "0.4.3",
      "resolved": "https://registry.npmjs.org/@humanwhocodes/retry/-/retry-0.4.3.tgz",
      "integrity": "sha512-bV0Tgo9K4hfPCek+aMAn81RppFKv2ySDQeMoSZuvTASywNTnVJCArCZE2FWqpvIatKu7VMRLWlR1EazvVhDyhQ==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=18.18"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/nzakas"
      }
    },
    "node_modules/@jridgewell/gen-mapping": {
      "version": "0.3.13",
      "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.13.tgz",
      "integrity": "sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.0",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/remapping": {
      "version": "2.3.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/remapping/-/remapping-2.3.5.tgz",
      "integrity": "sha512-LI9u/+laYG4Ds1TDKSJW2YPrIlcVYOwi2fUC6xB43lueCjgxV4lffOCZCtYFiH6TNOX+tQKXx97T4IKHbhyHEQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.5",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.3.tgz",
      "integrity": "sha512-lhTtjtoEArWBjismtfS761S9Hlyn+nIZqOZVYoZ1Xn82PMNMVnk+jj/NhC4fAXGTs7ydONcJiR5vyQBTMDu27g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.6.0.tgz",
      "integrity": "sha512-T7jf+5zgsZHwNJ4lvQ7/aezbyk0nNX+zJVWpmHA7VYsEx7a7qr5Rg5IbtJFqkgze5Y2sruq1RUY8Q837Od7iFw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.31",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.31.tgz",
      "integrity": "sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@napi-rs/wasm-runtime": {
      "version": "1.2.6",
      "resolved": "https://registry.npmjs.org/@napi-rs/wasm-runtime/-/wasm-runtime-1.2.6.tgz",
      "integrity": "sha512-mRyDmEw9/fCDXCGfL1sbgIw/GUK0PVxRW4YwgPN61F3LQ+fSyoBFarJVzgGyhF6kRzEQZ0FejDqm4WLXSeqQmw==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@tybys/wasm-util": "^0.10.3"
      },
      "engines": {
        "node": "^20.19.0 || ^22.13.0 || >=23.5.0"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/Brooooooklyn"
      },
      "peerDependencies": {
        "@emnapi/core": "^1.7.1 || 2.0.0-beta.2",
        "@emnapi/runtime": "^1.7.1 || 2.0.0-beta.2"
      }
    },
    "node_modules/@oxc-project/types": {
      "version": "0.156.0",
      "resolved": "https://registry.npmjs.org/@oxc-project/types/-/types-0.156.0.tgz",
      "integrity": "sha512-1Duyg48TdJNdyhEB8Xn1L36bT9Pv6GUtlKjHxOys8xkaF/rQq3XJE+bAurSK/AgIz5mGFsb77cn9Pb20+WCScw==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/oxc-project"
      }
    },
    "node_modules/@rolldown/binding-android-arm-eabi": {
      "version": "1.2.19",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-android-arm-eabi/-/binding-android-arm-eabi-1.2.19.tgz",
      "integrity": "sha512-e+Ebe0WT+9tbXmNKPIiC8YrWAHYwug3m6i4p3rZGGulfZri1jtI4HslT+OZnFf/OIHowWF71DTlHwXBP2SiA7A==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-android-arm64": {
      "version": "1.2.19",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-android-arm64/-/binding-android-arm64-1.2.19.tgz",
      "integrity": "sha512-hOombrTJ+szt2ciEzS7oCA78lMPBgF5UMQWCJIyNfnrI7GLl8HYoFqCnpL2gcPOaXMqryGCU5ExdQKyDDcC+yA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-arm64": {
      "version": "1.2.19",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-darwin-arm64/-/binding-darwin-arm64-1.2.19.tgz",
      "integrity": "sha512-XoMA2pwCKGTQzUjPgtRwkedH4WmXhdIPKT6l6oOxd1PUbNodGI6DcBekgN7EC//+x3pfBYX/qL1gNmZAqivw5g==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-x64": {
      "version": "1.2.19",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-darwin-x64/-/binding-darwin-x64-1.2.19.tgz",
      "integrity": "sha512-zo8EsSSwMZCY/e+fRnGaX02YGgvJD0yvhNi/9hpGPA2MJ9ZF8dPCw75UGfpI6OpQ/myR/dIYmogRvqiZD0TrXg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-freebsd-x64": {
      "version": "1.2.19",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-freebsd-x64/-/binding-freebsd-x64-1.2.19.tgz",
      "integrity": "sha512-O8ISAOfI1nj7AuBPd30FSF47z7f7lzlk5poQVGgiikvQuGEBFYvW8ki+UEnT+YJPnNGjQzn304klt4O9FUE7mA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm-gnueabihf": {
      "version": "1.2.19",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm-gnueabihf/-/binding-linux-arm-gnueabihf-1.2.19.tgz",
      "integrity": "sha512-/lYCba5NO0yq4S0jGMH8QTBtkvQxoXjoQWzF5BcWp9MjB9jxVRD1GQDNofkVjcOj30DWyhLIN/4Oe60JKzaONw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-gnu": {
      "version": "1.2.19",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-gnu/-/binding-linux-arm64-gnu-1.2.19.tgz",
      "integrity": "sha512-pm/apFMBnSbFb3O6nG5pHO1iqHhZrjGDFEjSm+ot9J17XXPvH9L90y5h+jgfHCE+Qdlsvy8qKEcU4VKxgjD+vA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-musl": {
      "version": "1.2.19",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-musl/-/binding-linux-arm64-musl-1.2.19.tgz",
      "integrity": "sha512-K1SmQp3FFichn8oqrNIwvFoZ5wcvjC7goBzpaMNvLf9FZc+QB/QvLmnpJZgAAGHiD980tP8FZZnXk2K94rvlxg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-ppc64-gnu": {
      "version": "1.2.19",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-ppc64-gnu/-/binding-linux-ppc64-gnu-1.2.19.tgz",
      "integrity": "sha512-I0xwD57jP/3A7+5UPZin2w8Y7XHEmEM5zqpYZOcQ45MlNW6tUJUziymV3yRr7rL4vwyfEcRsRksC4a7Kc08p5Q==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-s390x-gnu": {
      "version": "1.2.19",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-s390x-gnu/-/binding-linux-s390x-gnu-1.2.19.tgz",
      "integrity": "sha512-BrtEHT24SNXj9HiXqy+s/kXiSiQGt6EKCPUlRirAoIioVxKGnbXBUEkbZASAei7iZJB0/Ynm+0JP00Ipx7AnSw==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-gnu": {
      "version": "1.2.19",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-gnu/-/binding-linux-x64-gnu-1.2.19.tgz",
      "integrity": "sha512-rm75/9DkHKeU2WnA8w4X94WGYgLlDCFCfkQC+4bguVJmC/jvDRv2B+2wLOYhyE0fVuv7//Ckk39OoOufyCu76Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-musl": {
      "version": "1.2.19",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-musl/-/binding-linux-x64-musl-1.2.19.tgz",
      "integrity": "sha512-irh/4+iYFM4GAzpluDErgjz89bj6NDtqqMAG/6O1LG38Ed3NpyebzCpcVNkFW8uhy+/3/BocUvnXDR33CXWe9A==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-openharmony-arm64": {
      "version": "1.2.19",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-openharmony-arm64/-/binding-openharmony-arm64-1.2.19.tgz",
      "integrity": "sha512-+KWTWNoPt+CfSq94CiceWu3yPE+QzkaG+phPyz9G60tmZLwfQkcA4AeksafzvJAw4pvg1mcd5a1TkUqVv0s4JA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-wasm32-wasi": {
      "version": "1.2.19",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-wasm32-wasi/-/binding-wasm32-wasi-1.2.19.tgz",
      "integrity": "sha512-7EH+skOsl5qpWnK0vzamgJFhOv1cwxQpsxm8tI883K9fur5c27p8q87fzEO6BbBPabA2/+s/zR63/pLc137iOg==",
      "cpu": [
        "wasm32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@emnapi/core": "2.0.0-beta.2",
        "@emnapi/runtime": "2.0.0-beta.2",
        "@napi-rs/wasm-runtime": "1.2.6"
      },
      "engines": {
        "node": "^20.19.0 || ^22.13.0 || >=23.5.0"
      }
    },
    "node_modules/@rolldown/binding-win32-arm64-msvc": {
      "version": "1.2.19",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-arm64-msvc/-/binding-win32-arm64-msvc-1.2.19.tgz",
      "integrity": "sha512-3Q1Yg1Q7tEvBWoZf5rFvG/GKZQPgwfru+p4wBajDfJFBs0SHCpL++dfTjW9gyAKd1T7ZpIYvdaUax7Pa/IhFVQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-win32-x64-msvc": {
      "version": "1.2.19",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-x64-msvc/-/binding-win32-x64-msvc-1.2.19.tgz",
      "integrity": "sha512-y/sqRRc6d7hECzOFc5n3LSeqctmIp9mMjY1Kq4s14uLPd/LZ4z7i1zrW6fMtp2mPeuQIC4e6ULMcwQzMomqQag==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/pluginutils": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.1.1.tgz",
      "integrity": "sha512-glFIJDvLNDtJhT9qrMFWLPbvS+skxgt4L0K8Ei2YtnhPysAJnsI7nyxSJxKj4ADeKX0OLjC4ntRkwpLOoS3rwA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@supabase/auth-js": {
      "version": "2.119.2",
      "resolved": "https://registry.npmjs.org/@supabase/auth-js/-/auth-js-2.119.2.tgz",
      "integrity": "sha512-zWi7pGT6XIMWG0Ja5Unvsv9ixwgLTq/pnWNzGVwVXlr/onraf3v4VwepCFSlxGrvNyKRmhn7O6e4CHF1TJg73Q==",
      "license": "MIT",
      "dependencies": {
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=22.0.0"
      }
    },
    "node_modules/@supabase/auth-js/node_modules/tslib": {
      "version": "2.8.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
      "license": "0BSD"
    },
    "node_modules/@supabase/functions-js": {
      "version": "2.119.2",
      "resolved": "https://registry.npmjs.org/@supabase/functions-js/-/functions-js-2.119.2.tgz",
      "integrity": "sha512-0pmNQRKahGbezgUV2m02l7j4t0Wdl7KMNNMWGCMe76beA7e1IfTPihtNssqWWw1IjqMDi0axoqLiDPzcdbPuGw==",
      "license": "MIT",
      "dependencies": {
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=22.0.0"
      }
    },
    "node_modules/@supabase/functions-js/node_modules/tslib": {
      "version": "2.8.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
      "license": "0BSD"
    },
    "node_modules/@supabase/phoenix": {
      "version": "0.4.5",
      "resolved": "https://registry.npmjs.org/@supabase/phoenix/-/phoenix-0.4.5.tgz",
      "integrity": "sha512-aAn9H9ovVyeApKy11OWOrrOGq8DV68yWeH4ud2lN9fzn4aO8Zb5GLL9m1pUg9nLqIcT+ZDfAcsZe0E/nqdv2lw==",
      "license": "MIT"
    },
    "node_modules/@supabase/postgrest-js": {
      "version": "2.119.2",
      "resolved": "https://registry.npmjs.org/@supabase/postgrest-js/-/postgrest-js-2.119.2.tgz",
      "integrity": "sha512-Q5RIy5wD79jArQSID06JXqS9F+bKLcTr81Yz7hwk2qkMX4fWMru4HLvG3UvoY0FlQzjcjXqVba7+6GeaItq6UQ==",
      "license": "MIT",
      "dependencies": {
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=22.0.0"
      }
    },
    "node_modules/@supabase/postgrest-js/node_modules/tslib": {
      "version": "2.8.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
      "license": "0BSD"
    },
    "node_modules/@supabase/realtime-js": {
      "version": "2.119.2",
      "resolved": "https://registry.npmjs.org/@supabase/realtime-js/-/realtime-js-2.119.2.tgz",
      "integrity": "sha512-1xHRbZ8RgKq8Qn50uNJMnBdkuzK35GQTo1hx2+bC3QvCxbzXnFkbmq2ZyT9xSjOCuLBfD5ve3ZKxJcbWefL3ow==",
      "license": "MIT",
      "dependencies": {
        "@supabase/phoenix": "0.4.5",
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=22.0.0"
      }
    },
    "node_modules/@supabase/realtime-js/node_modules/tslib": {
      "version": "2.8.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
      "license": "0BSD"
    },
    "node_modules/@supabase/storage-js": {
      "version": "2.119.2",
      "resolved": "https://registry.npmjs.org/@supabase/storage-js/-/storage-js-2.119.2.tgz",
      "integrity": "sha512-dbzPuYKYc3/HGz+cRXAK45zR5FWMEH6lr2Is13ZOExhOBCM3F0iO96Z9VuhlLA64vPLeSQP24O/jesWg1QY6fw==",
      "license": "MIT",
      "dependencies": {
        "iceberg-js": "^0.8.1",
        "tslib": "2.8.1"
      },
      "engines": {
        "node": ">=22.0.0"
      }
    },
    "node_modules/@supabase/storage-js/node_modules/tslib": {
      "version": "2.8.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
      "license": "0BSD"
    },
    "node_modules/@supabase/supabase-js": {
      "version": "2.119.2",
      "resolved": "https://registry.npmjs.org/@supabase/supabase-js/-/supabase-js-2.119.2.tgz",
      "integrity": "sha512-4HvF4G2DwdqjmwPBpz9RHnXWfdK0wSkw4yBhxe64CdeF8gdxsTF9WZuHFuNWtQnHllq71ZDyAghr4Q8nC0m/NA==",
      "license": "MIT",
      "dependencies": {
        "@supabase/auth-js": "2.119.2",
        "@supabase/functions-js": "2.119.2",
        "@supabase/postgrest-js": "2.119.2",
        "@supabase/realtime-js": "2.119.2",
        "@supabase/storage-js": "2.119.2"
      },
      "engines": {
        "node": ">=22.0.0"
      },
      "peerDependencies": {
        "@opentelemetry/api": ">=1.0.0"
      },
      "peerDependenciesMeta": {
        "@opentelemetry/api": {
          "optional": true
        }
      }
    },
    "node_modules/@tybys/wasm-util": {
      "version": "0.10.5",
      "resolved": "https://registry.npmjs.org/@tybys/wasm-util/-/wasm-util-0.10.5.tgz",
      "integrity": "sha512-dOGOPxlaNV+G046mZzN+9C0dAcQZeSKcXiVaM0TYy/LM4ttTmgSBDxYfovcYI8Em3+eAbiAYpvWLOv8+ZVRJKA==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@types/estree": {
      "version": "1.0.10",
      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.10.tgz",
      "integrity": "sha512-lTyOMnOcmRBzdCv6/4zUZCrEhV0xrqQiUZBZtVcbmLHBXKLnN8q89v/wKRF/Q0HbwVsqbIG3o5HDoFl9sduM+g==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/json-schema": {
      "version": "7.0.15",
      "resolved": "https://registry.npmjs.org/@types/json-schema/-/json-schema-7.0.15.tgz",
      "integrity": "sha512-5+fP8P8MFNC+AyZCDxrB2pkZFPGzqQWUzpSeuuVLvm8VMcorNYavBqoFcxK8bQz4Qsbn4oUEEem4wDLfcysGHA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@vitejs/plugin-react": {
      "version": "6.3.0",
      "resolved": "https://registry.npmjs.org/@vitejs/plugin-react/-/plugin-react-6.3.0.tgz",
      "integrity": "sha512-H9E955aVvD2F4zNHCw4eIZbIfF6xKldlh7MNu+hSU7xwQzh65lI/N+CJWqmfhi0PEjDXIt/H7T7J/4wU63KJiw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@rolldown/pluginutils": "^1.0.1"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "peerDependencies": {
        "@rolldown/plugin-babel": "^0.1.7 || ^0.2.0 || ^0.3.0",
        "babel-plugin-react-compiler": "^1.0.0",
        "oxc-transform-react": ">=0.152.0 <0.157.0",
        "vite": "^8.0.0"
      },
      "peerDependenciesMeta": {
        "@rolldown/plugin-babel": {
          "optional": true
        },
        "babel-plugin-react-compiler": {
          "optional": true
        },
        "oxc-transform-react": {
          "optional": true
        }
      }
    },
    "node_modules/acorn": {
      "version": "8.19.0",
      "resolved": "https://registry.npmjs.org/acorn/-/acorn-8.19.0.tgz",
      "integrity": "sha512-oJlA3XiRm7Cyk6qFD2Jn8ak9B7jSy0qy00ADO3+8dpT0LSjFihQYv4C02LFCSYJV3Q37xYwwRy5m+IpIiUzqWw==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "acorn": "bin/acorn"
      },
      "engines": {
        "node": ">=0.4.0"
      }
    },
    "node_modules/acorn-jsx": {
      "version": "5.3.2",
      "resolved": "https://registry.npmjs.org/acorn-jsx/-/acorn-jsx-5.3.2.tgz",
      "integrity": "sha512-rq9s+JNhf0IChjtDXxllJ7g41oZk5SlXtp0LHwyA5cejwn7vKmKp4pPri6YEePv2PU65sAsegbXtIinmDFDXgQ==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "acorn": "^6.0.0 || ^7.0.0 || ^8.0.0"
      }
    },
    "node_modules/ajv": {
      "version": "6.15.0",
      "resolved": "https://registry.npmjs.org/ajv/-/ajv-6.15.0.tgz",
      "integrity": "sha512-fgFx7Hfoq60ytK2c7DhnF8jIvzYgOMxfugjLOSMHjLIPgenqa7S7oaagATUq99mV6IYvN2tRmC0wnTYX6iPbMw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fast-deep-equal": "^3.1.1",
        "fast-json-stable-stringify": "^2.0.0",
        "json-schema-traverse": "^0.4.1",
        "uri-js": "^4.2.2"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/epoberezkin"
      }
    },
    "node_modules/ansi-styles": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-4.3.0.tgz",
      "integrity": "sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "color-convert": "^2.0.1"
      },
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
      }
    },
    "node_modules/argparse": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/argparse/-/argparse-2.0.1.tgz",
      "integrity": "sha512-8+9WqebbFzpX9OR+Wa6O29asIogeRMzcGtAINdpMHHyAg10f05aSFVBbcEqGf/PXw1EjAZ+q2/bEBg3DvurK3Q==",
      "dev": true,
      "license": "Python-2.0"
    },
    "node_modules/balanced-match": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/balanced-match/-/balanced-match-1.0.2.tgz",
      "integrity": "sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/baseline-browser-mapping": {
      "version": "2.11.39",
      "resolved": "https://registry.npmjs.org/baseline-browser-mapping/-/baseline-browser-mapping-2.11.39.tgz",
      "integrity": "sha512-Q9buOYhr2ggrEZpImICecZTJHCCd8yXkRUokFlUEQ8uiD6oP82F4W4jWnhOHZYV+wlvrC51V7Wy0ULyWjil5Wg==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "baseline-browser-mapping": "dist/cli.cjs"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/brace-expansion": {
      "version": "1.1.22",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-1.1.22.tgz",
      "integrity": "sha512-CKLDTuSsN0+r1ThM0WkzzBI7dnPI6xEGfa/JnVYIK9JNBA1N1NyPwXVHor//NKD/y3sDxp764sZdLhFK7pH8XQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^1.0.0",
        "concat-map": "0.0.1"
      }
    },
    "node_modules/browserslist": {
      "version": "4.29.6",
      "resolved": "https://registry.npmjs.org/browserslist/-/browserslist-4.29.6.tgz",
      "integrity": "sha512-CmVVIQ3RVc5HxYEc9X84GvxK/C8C1wH8TlKAiO7uTxF8PDwt7r8t9Qk3J9NkMOVzX5O/HbLv3yzxZg9HPrnI9w==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "baseline-browser-mapping": "^2.11.37",
        "caniuse-lite": "^1.0.30001826",
        "electron-to-chromium": "^1.5.486",
        "node-releases": "^2.0.64",
        "update-browserslist-db": "^1.4.0"
      },
      "bin": {
        "browserslist": "cli.js"
      },
      "engines": {
        "node": "^6 || ^7 || ^8 || ^9 || ^10 || ^11 || ^12 || >=13.7"
      }
    },
    "node_modules/callsites": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/callsites/-/callsites-3.1.0.tgz",
      "integrity": "sha512-P8BjAsXvZS+VIDUI11hHCQEv74YT67YUi5JJFNWIqL235sBmjX4+qx9Muvls5ivyNENctx46xQLQ3aTuE7ssaQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/caniuse-lite": {
      "version": "1.0.30001827",
      "resolved": "https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001827.tgz",
      "integrity": "sha512-YWEDr46gSO81M8w6uPbaIy4++IXsirx2asUqvllNiD4BPf75ibxclUjWEqp8ObCenRv+UM2n5Y8xuRPT8V8FrQ==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/caniuse-lite"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "CC-BY-4.0"
    },
    "node_modules/chalk": {
      "version": "4.1.2",
      "resolved": "https://registry.npmjs.org/chalk/-/chalk-4.1.2.tgz",
      "integrity": "sha512-oKnbhFyRIXpUuez8iBMmyEa4nbj4IOQyuhc/wy9kY7/WVPcwIO9VA668Pu8RkO7+0G76SLROeyw9CpQ061i4mA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ansi-styles": "^4.1.0",
        "supports-color": "^7.1.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/chalk/chalk?sponsor=1"
      }
    },
    "node_modules/color-convert": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz",
      "integrity": "sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "color-name": "~1.1.4"
      },
      "engines": {
        "node": ">=7.0.0"
      }
    },
    "node_modules/color-name": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz",
      "integrity": "sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/concat-map": {
      "version": "0.0.1",
      "resolved": "https://registry.npmjs.org/concat-map/-/concat-map-0.0.1.tgz",
      "integrity": "sha512-/Srv4dswyQNBfohGpz9o6Yb3Gz3SrUDqBH5rTuhGR7ahtlbYKnVxw2bCFMRljaA7EXHaXZ8wsHdodFvbkhKmqg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/convert-source-map": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/convert-source-map/-/convert-source-map-2.0.0.tgz",
      "integrity": "sha512-Kvp459HrV2FEJ1CAsi1Ku+MY3kasH19TFykTz2xWmMeq6bk2NU3XXvfJ+Q61m0xktWwt+1HSYf3JZsTms3aRJg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/cookie": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/cookie/-/cookie-1.1.1.tgz",
      "integrity": "sha512-ei8Aos7ja0weRpFzJnEA9UHJ/7XQmqglbRwnf2ATjcB9Wq874VKH9kfjjirM6UhU2/E5fFYadylyhFldcqSidQ==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/cross-spawn": {
      "version": "7.0.6",
      "resolved": "https://registry.npmjs.org/cross-spawn/-/cross-spawn-7.0.6.tgz",
      "integrity": "sha512-uV2QOWP2nWzsy2aMp8aRibhi9dlzF5Hgh5SHaB9OiTGEyDTiJJyx0uy51QXdyWbtAHNua4XJzUKca3OzKUd3vA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "path-key": "^3.1.0",
        "shebang-command": "^2.0.0",
        "which": "^2.0.1"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/debug": {
      "version": "4.4.3",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",
      "integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/deep-is": {
      "version": "0.1.4",
      "resolved": "https://registry.npmjs.org/deep-is/-/deep-is-0.1.4.tgz",
      "integrity": "sha512-oIPzksmTg4/MriiaYGO+okXDT7ztn/w3Eptv/+gSIdMdKsJo0u4CfYNFJPy+4SKMuCqGw2wxnA+URMg3t8a/bQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/detect-libc": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz",
      "integrity": "sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/electron-to-chromium": {
      "version": "1.5.493",
      "resolved": "https://registry.npmjs.org/electron-to-chromium/-/electron-to-chromium-1.5.493.tgz",
      "integrity": "sha512-/Wto2sKd0EpepzMqwSP2il2TNc+rnBDF6k1poCvhRKpaSSD4sLGRBE+FydqHs2QwcW9cXKLVDqnauzJy1oByYw==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/escalade": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz",
      "integrity": "sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/escape-string-regexp": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-4.0.0.tgz",
      "integrity": "sha512-TtpcNJ3XAzx3Gq8sWRzJaVajRs0uVxA2YAkdb1jm2YkPz4G6egUFAyA3n5vtEIZefPk5Wa4UXbKuS5fKkJWdgA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/eslint": {
      "version": "9.39.5",
      "resolved": "https://registry.npmjs.org/eslint/-/eslint-9.39.5.tgz",
      "integrity": "sha512-DgZS62aPLXKlnxILS/AYCoRvHaZeXceIzlXPkkGGzJWSow1aEk0lbTlxUSlyjC8jcaKxAdOnTDz+o1JFSBsyjw==",
      "deprecated": "This version is no longer supported. Please see https://eslint.org/version-support for other options.",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@eslint-community/eslint-utils": "^4.8.0",
        "@eslint-community/regexpp": "^4.12.1",
        "@eslint/config-array": "^0.21.2",
        "@eslint/config-helpers": "^0.4.2",
        "@eslint/core": "^0.17.0",
        "@eslint/eslintrc": "^3.3.6",
        "@eslint/js": "9.39.5",
        "@eslint/plugin-kit": "^0.4.1",
        "@humanfs/node": "^0.16.6",
        "@humanwhocodes/module-importer": "^1.0.1",
        "@humanwhocodes/retry": "^0.4.2",
        "@types/estree": "^1.0.6",
        "ajv": "^6.14.0",
        "chalk": "^4.0.0",
        "cross-spawn": "^7.0.6",
        "debug": "^4.3.2",
        "escape-string-regexp": "^4.0.0",
        "eslint-scope": "^8.4.0",
        "eslint-visitor-keys": "^4.2.1",
        "espree": "^10.4.0",
        "esquery": "^1.5.0",
        "esutils": "^2.0.2",
        "fast-deep-equal": "^3.1.3",
        "file-entry-cache": "^8.0.0",
        "find-up": "^5.0.0",
        "glob-parent": "^6.0.2",
        "ignore": "^5.2.0",
        "imurmurhash": "^0.1.4",
        "is-glob": "^4.0.0",
        "json-stable-stringify-without-jsonify": "^1.0.1",
        "lodash.merge": "^4.6.2",
        "minimatch": "^3.1.5",
        "natural-compare": "^1.4.0",
        "optionator": "^0.9.3"
      },
      "bin": {
        "eslint": "bin/eslint.js"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://eslint.org/donate"
      },
      "peerDependencies": {
        "jiti": "*"
      },
      "peerDependenciesMeta": {
        "jiti": {
          "optional": true
        }
      }
    },
    "node_modules/eslint-plugin-react-hooks": {
      "version": "7.1.1",
      "resolved": "https://registry.npmjs.org/eslint-plugin-react-hooks/-/eslint-plugin-react-hooks-7.1.1.tgz",
      "integrity": "sha512-f2I7Gw6JbvCexzIInuSbZpfdQ44D7iqdWX01FKLvrPgqxoE7oMj8clOfto8U6vYiz4yd5oKu39rRSVOe1zRu0g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/core": "^7.24.4",
        "@babel/parser": "^7.24.4",
        "hermes-parser": "^0.25.1",
        "zod": "^3.25.0 || ^4.0.0",
        "zod-validation-error": "^3.5.0 || ^4.0.0"
      },
      "engines": {
        "node": ">=18"
      },
      "peerDependencies": {
        "eslint": "^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0-0 || ^9.0.0 || ^10.0.0"
      }
    },
    "node_modules/eslint-scope": {
      "version": "8.4.0",
      "resolved": "https://registry.npmjs.org/eslint-scope/-/eslint-scope-8.4.0.tgz",
      "integrity": "sha512-sNXOfKCn74rt8RICKMvJS7XKV/Xk9kA7DyJr8mJik3S7Cwgy3qlkkmyS2uQB3jiJg6VNdZd/pDBJu0nvG2NlTg==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "esrecurse": "^4.3.0",
        "estraverse": "^5.2.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/eslint-visitor-keys": {
      "version": "4.2.1",
      "resolved": "https://registry.npmjs.org/eslint-visitor-keys/-/eslint-visitor-keys-4.2.1.tgz",
      "integrity": "sha512-Uhdk5sfqcee/9H/rCOJikYz67o0a2Tw2hGRPOG2Y1R2dg7brRe1uG0yaNQDHu+TO/uQPF/5eCapvYSmHUjt7JQ==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/espree": {
      "version": "10.4.0",
      "resolved": "https://registry.npmjs.org/espree/-/espree-10.4.0.tgz",
      "integrity": "sha512-j6PAQ2uUr79PZhBjP5C5fhl8e39FmRnOjsD5lGnWrFU8i2G776tBK7+nP8KuQUTTyAZUwfQqXAgrVH5MbH9CYQ==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "acorn": "^8.15.0",
        "acorn-jsx": "^5.3.2",
        "eslint-visitor-keys": "^4.2.1"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=21.1.0"
      },
      "funding": {
        "url": "https://opencollective.com/eslint"
      }
    },
    "node_modules/esquery": {
      "version": "1.7.0",
      "resolved": "https://registry.npmjs.org/esquery/-/esquery-1.7.0.tgz",
      "integrity": "sha512-Ap6G0WQwcU/LHsvLwON1fAQX9Zp0A2Y6Y/cJBl9r/JbW90Zyg4/zbG6zzKa2OTALELarYHmKu0GhpM5EO+7T0g==",
      "dev": true,
      "license": "BSD-3-Clause",
      "dependencies": {
        "estraverse": "^5.1.0"
      },
      "engines": {
        "node": ">=0.10"
      }
    },
    "node_modules/esrecurse": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/esrecurse/-/esrecurse-4.3.0.tgz",
      "integrity": "sha512-KmfKL3b6G+RXvP8N1vr3Tq1kL/oCFgn2NYXEtqP8/L3pKapUA4G8cFVaoF3SU323CD4XypR/ffioHmkti6/Tag==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "estraverse": "^5.2.0"
      },
      "engines": {
        "node": ">=4.0"
      }
    },
    "node_modules/estraverse": {
      "version": "5.3.0",
      "resolved": "https://registry.npmjs.org/estraverse/-/estraverse-5.3.0.tgz",
      "integrity": "sha512-MMdARuVEQziNTeJD8DgMqmhwR11BRQ/cBP+pLtYdSTnf3MIO8fFeiINEbX36ZdNlfU/7A9f3gUw49B3oQsvwBA==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=4.0"
      }
    },
    "node_modules/esutils": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/esutils/-/esutils-2.0.3.tgz",
      "integrity": "sha512-kVscqXk4OCp68SZ0dkgEKVi6/8ij300KBWTJq32P/dYeWTSwK41WyTxalN1eRmA5Z9UU/LX9D7FWSmV9SAYx6g==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/fast-deep-equal": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-3.1.3.tgz",
      "integrity": "sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/fast-json-stable-stringify": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/fast-json-stable-stringify/-/fast-json-stable-stringify-2.1.0.tgz",
      "integrity": "sha512-lhd/wF+Lk98HZoTCtlVraHtfh5XYijIjalXck7saUtuanSDyLMxnHhSXEDJqHxD7msR8D0uCmqlkwjCV8xvwHw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/fast-levenshtein": {
      "version": "2.0.6",
      "resolved": "https://registry.npmjs.org/fast-levenshtein/-/fast-levenshtein-2.0.6.tgz",
      "integrity": "sha512-DCXu6Ifhqcks7TZKY3Hxp3y6qphY5SJZmrWMDrKcERSOXWQdMhU9Ig/PYrzyw/ul9jOIyh0N4M0tbC5hodg8dw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/fdir": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12.0.0"
      },
      "peerDependencies": {
        "picomatch": "^3 || ^4"
      },
      "peerDependenciesMeta": {
        "picomatch": {
          "optional": true
        }
      }
    },
    "node_modules/file-entry-cache": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/file-entry-cache/-/file-entry-cache-8.0.0.tgz",
      "integrity": "sha512-XXTUwCvisa5oacNGRP9SfNtYBNAMi+RPwBFmblZEF7N7swHYQS6/Zfk7SRwx4D5j3CH211YNRco1DEMNVfZCnQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "flat-cache": "^4.0.0"
      },
      "engines": {
        "node": ">=16.0.0"
      }
    },
    "node_modules/find-up": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/find-up/-/find-up-5.0.0.tgz",
      "integrity": "sha512-78/PXT1wlLLDgTzDs7sjq9hzz0vXD+zn+7wypEe4fXQxCmdmqfGsEPQxmiCSQI3ajFV91bVSsvNtrJRiW6nGng==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "locate-path": "^6.0.0",
        "path-exists": "^4.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/flat-cache": {
      "version": "4.0.1",
      "resolved": "https://registry.npmjs.org/flat-cache/-/flat-cache-4.0.1.tgz",
      "integrity": "sha512-f7ccFPK3SXFHpx15UIGyRJ/FJQctuKZ0zVuN3frBo4HnK3cay9VEW0R6yPYFHC0AgqhukPzKjq22t5DmAyqGyw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "flatted": "^3.2.9",
        "keyv": "^4.5.4"
      },
      "engines": {
        "node": ">=16"
      }
    },
    "node_modules/flatted": {
      "version": "3.4.4",
      "resolved": "https://registry.npmjs.org/flatted/-/flatted-3.4.4.tgz",
      "integrity": "sha512-5+ybhBZANEJxaH3X5evAFatUxLfEHSr7n6kYJ+1Qd0mUqr4eu9gIf6GDbWHf8RJijHrjjO8G+la14SlL2SeS1Q==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/gensync": {
      "version": "1.0.0-beta.2",
      "resolved": "https://registry.npmjs.org/gensync/-/gensync-1.0.0-beta.2.tgz",
      "integrity": "sha512-3hN7NaskYvMDLQY55gnW3NQ+mesEAepTqlg+VEbj7zzqEMBVNhzcGYYeqFo/TlYz6eQiFcp1HcsCZO+nGgS8zg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/glob-parent": {
      "version": "6.0.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-6.0.2.tgz",
      "integrity": "sha512-XxwI8EOhVQgWp6iDL+3b0r86f4d6AX6zSU55HfB4ydCEuXLXc5FcYeOu+nnGftS4TEju/11rt4KJPTMgbfmv4A==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.3"
      },
      "engines": {
        "node": ">=10.13.0"
      }
    },
    "node_modules/globals": {
      "version": "14.0.0",
      "resolved": "https://registry.npmjs.org/globals/-/globals-14.0.0.tgz",
      "integrity": "sha512-oahGvuMGQlPw/ivIYBjVSrWAfWLBeku5tpPE2fOPLi+WHffIWbuh2tCjhyQhTBPMf5E9jDEH4FOmTYgYwbKwtQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/has-flag": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/has-flag/-/has-flag-4.0.0.tgz",
      "integrity": "sha512-EykJT/Q1KjTWctppgIAgfSO0tKVuZUjhgMr17kqTumMl6Afv3EISleU7qZUzoXDFTAHTDC4NOoG/ZxU3EvlMPQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/hermes-estree": {
      "version": "0.25.1",
      "resolved": "https://registry.npmjs.org/hermes-estree/-/hermes-estree-0.25.1.tgz",
      "integrity": "sha512-0wUoCcLp+5Ev5pDW2OriHC2MJCbwLwuRx+gAqMTOkGKJJiBCLjtrvy4PWUGn6MIVefecRpzoOZ/UV6iGdOr+Cw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/hermes-parser": {
      "version": "0.25.1",
      "resolved": "https://registry.npmjs.org/hermes-parser/-/hermes-parser-0.25.1.tgz",
      "integrity": "sha512-6pEjquH3rqaI6cYAXYPcz9MS4rY6R4ngRgrgfDshRptUZIc3lw0MCIJIGDj9++mfySOuPTHB4nrSW99BCvOPIA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "hermes-estree": "0.25.1"
      }
    },
    "node_modules/iceberg-js": {
      "version": "0.8.1",
      "resolved": "https://registry.npmjs.org/iceberg-js/-/iceberg-js-0.8.1.tgz",
      "integrity": "sha512-1dhVQZXhcHje7798IVM+xoo/1ZdVfzOMIc8/rgVSijRK38EDqOJoGula9N/8ZI5RD8QTxNQtK/Gozpr+qUqRRA==",
      "license": "MIT",
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/ignore": {
      "version": "5.3.2",
      "resolved": "https://registry.npmjs.org/ignore/-/ignore-5.3.2.tgz",
      "integrity": "sha512-hsBTNUqQTDwkWtcdYI2i06Y/nUBEsNEDJKjWdigLvegy8kDuJAS8uRlpkkcQpyEXL0Z/pjDy5HBmMjRCJ2gq+g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 4"
      }
    },
    "node_modules/import-fresh": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/import-fresh/-/import-fresh-3.3.1.tgz",
      "integrity": "sha512-TR3KfrTZTYLPB6jUjfx6MF9WcWrHL9su5TObK4ZkYgBdWKPOFoSoQIdEuTuR82pmtxH2spWG9h6etwfr1pLBqQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "parent-module": "^1.0.0",
        "resolve-from": "^4.0.0"
      },
      "engines": {
        "node": ">=6"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/imurmurhash": {
      "version": "0.1.4",
      "resolved": "https://registry.npmjs.org/imurmurhash/-/imurmurhash-0.1.4.tgz",
      "integrity": "sha512-JmXMZ6wuvDmLiHEml9ykzqO6lwFbof0GG4IkcGaENdCRDDmMVnny7s5HsIgHCbaq0w2MyPhDqkhTUgS2LU2PHA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.8.19"
      }
    },
    "node_modules/is-extglob": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/is-extglob/-/is-extglob-2.1.1.tgz",
      "integrity": "sha512-SbKbANkN603Vi4jEZv49LeVJMn4yGwsbzZworEoyEiutsN3nJYdbO36zfhGJ6QEDpOZIFkDtnq5JRxmvl3jsoQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-glob": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/is-glob/-/is-glob-4.0.3.tgz",
      "integrity": "sha512-xelSayHH36ZgE7ZWhli7pW34hNbNl8Ojv5KVmkJD4hBdD3th8Tfk9vYasLM+mXWOZhFkgZfxhLSnrwRr4elSSg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-extglob": "^2.1.1"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/isexe": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/isexe/-/isexe-2.0.0.tgz",
      "integrity": "sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/js-tokens": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-4.0.0.tgz",
      "integrity": "sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/js-yaml": {
      "version": "4.3.2",
      "resolved": "https://registry.npmjs.org/js-yaml/-/js-yaml-4.3.2.tgz",
      "integrity": "sha512-SFNOvSJ+Dgf/9An904Yx+CgSlIPCkIpao4qo51lpee25TIRejdH3rhR4EZMGoNx3/TP3O+wzWuiTFl4sqbltzA==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/puzrin"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/nodeca"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "argparse": "^2.0.1"
      },
      "bin": {
        "js-yaml": "bin/js-yaml.js"
      }
    },
    "node_modules/jsesc": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/jsesc/-/jsesc-3.1.0.tgz",
      "integrity": "sha512-/sM3dO2FOzXjKQhJuo0Q173wf2KOo8t4I8vHy6lF9poUp7bKT0/NHE8fPX23PwfhnykfqnC2xRxOnVw5XuGIaA==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "jsesc": "bin/jsesc"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/json-buffer": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/json-buffer/-/json-buffer-3.0.1.tgz",
      "integrity": "sha512-4bV5BfR2mqfQTJm+V5tPPdf+ZpuhiIvTuAB5g8kcrXOZpTT/QwwVRWBywX1ozr6lEuPdbHxwaJlm9G6mI2sfSQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/json-schema-traverse": {
      "version": "0.4.1",
      "resolved": "https://registry.npmjs.org/json-schema-traverse/-/json-schema-traverse-0.4.1.tgz",
      "integrity": "sha512-xbbCH5dCYU5T8LcEhhuh7HJ88HXuW3qsI3Y0zOZFKfZEHcpWiHU/Jxzk629Brsab/mMiHQti9wMP+845RPe3Vg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/json-stable-stringify-without-jsonify": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/json-stable-stringify-without-jsonify/-/json-stable-stringify-without-jsonify-1.0.1.tgz",
      "integrity": "sha512-Bdboy+l7tA3OGW6FjyFHWkP5LuByj1Tk33Ljyq0axyzdk9//JSi2u3fP1QSmd1KNwq6VOKYGlAu87CisVir6Pw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/json5": {
      "version": "2.2.3",
      "resolved": "https://registry.npmjs.org/json5/-/json5-2.2.3.tgz",
      "integrity": "sha512-XmOWe7eyHYH14cLdVPoyg+GOH3rYX++KpzrylJwSW98t3Nk+U8XOl8FWKOgwtzdb8lXGf6zYwDUzeHMWfxasyg==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "json5": "lib/cli.js"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/keyv": {
      "version": "4.5.4",
      "resolved": "https://registry.npmjs.org/keyv/-/keyv-4.5.4.tgz",
      "integrity": "sha512-oxVHkHR/EJf2CNXnWxRLW6mg7JyCCUcG0DtEGmL2ctUo1PNTin1PUil+r/+4r5MpVgC/fn1kjsx7mjSujKqIpw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "json-buffer": "3.0.1"
      }
    },
    "node_modules/levn": {
      "version": "0.4.1",
      "resolved": "https://registry.npmjs.org/levn/-/levn-0.4.1.tgz",
      "integrity": "sha512-+bT2uH4E5LGE7h/n3evcS/sQlJXCpIp6ym8OWJ5eV6+67Dsql/LaaT7qJBAt2rzfoa/5QBGBhxDix1dMt2kQKQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "prelude-ls": "^1.2.1",
        "type-check": "~0.4.0"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/lightningcss": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss/-/lightningcss-1.33.0.tgz",
      "integrity": "sha512-WkUDrojuJs0xkgGf2udWxa3yGBRxPtxUkB79i6aCZLRgc7PM8fZe9TosfPDcvEpQZbuFASnHYmRLBLUbmLOIIA==",
      "dev": true,
      "license": "MPL-2.0",
      "dependencies": {
        "detect-libc": "^2.0.3"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      },
      "optionalDependencies": {
        "lightningcss-android-arm64": "1.33.0",
        "lightningcss-darwin-arm64": "1.33.0",
        "lightningcss-darwin-x64": "1.33.0",
        "lightningcss-freebsd-x64": "1.33.0",
        "lightningcss-linux-arm-gnueabihf": "1.33.0",
        "lightningcss-linux-arm64-gnu": "1.33.0",
        "lightningcss-linux-arm64-musl": "1.33.0",
        "lightningcss-linux-x64-gnu": "1.33.0",
        "lightningcss-linux-x64-musl": "1.33.0",
        "lightningcss-win32-arm64-msvc": "1.33.0",
        "lightningcss-win32-x64-msvc": "1.33.0"
      }
    },
    "node_modules/lightningcss-android-arm64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.33.0.tgz",
      "integrity": "sha512-gEpRTalKdosp4Bb8qWtc2iOgE5SeIHlpS1up9bFq2wAyYhl1UdTObYiHe98zEM9SQvSoqQZ1IQD0JNpg3Ml5pg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-arm64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-arm64/-/lightningcss-darwin-arm64-1.33.0.tgz",
      "integrity": "sha512-Sciaz8eenNTKn9b3t7+xr0ipTp9YxKQY4npwQ3mrRuL0BAVHBLyZxofhaKBAVtzmtRZ/zTyo0/to4B1uWG/Djg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-x64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.33.0.tgz",
      "integrity": "sha512-Z5UPAxzrjlWNNyGy6i65cJzzvgJ5D3T6wMvs+gWpY9d7qRhANrxqAp6LhxIgZhWEw18RfJTGcRxjuLIBr+m8XQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-freebsd-x64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.33.0.tgz",
      "integrity": "sha512-QQM/Ti/hQajJwCY+RiWuCZ9sdtI/XQk7nDK5vC8kkdwixezOlDgvDx7+RT+QjK6FcFT4MpsuoBnHIo/O3StRRg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm-gnueabihf": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.33.0.tgz",
      "integrity": "sha512-N7FVBe6iS24MlM6R/4RBTxGhQheZGs7tiQ9U32UtF75NzP5Q7xWPRqLBCKxlRQRk3rY1jCIPLzx7WzOhuUIRLQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-gnu": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.33.0.tgz",
      "integrity": "sha512-j2v/itmy4HlNxlc6voKXYgBqNi0Ng2LShg4z7GufpEgs05P+2suBVyi9I6YHq5uoVFx9ETin3eCEhLVyXGQnKg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-musl": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.33.0.tgz",
      "integrity": "sha512-yiO5ROMuYQgXbC60yjZU5CYSFZGKXL0HFATXt9mHJn1+zW55oCtMI9NfcVhYLMFDL7gV7oBPon/EmMMGg2OvtQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-gnu": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.33.0.tgz",
      "integrity": "sha512-ar+Ju7LmcN0Jo4FpL4hpFybwNG9/3A/Br5KW2n2jyODg3MEZXaDYADdemoNS+BDNfMgKvylJLj4S5tyRActuAg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-musl": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.33.0.tgz",
      "integrity": "sha512-RYiYbkokw0trfKqqzfF55lginwEPrD3OJDfTuJzFs1MK6iFnDenaz1fqLLtX4ITG3OktJQXOeTaw1awrBAlZPw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-arm64-msvc": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.33.0.tgz",
      "integrity": "sha512-1K+MPfLSFVpphzpdbfkhlWk6wBrTObBzS2T6db10PNOZgR9GoVsAWzwNyuhUYYbTp23j+4RrncfujZ4uAzXvwA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-x64-msvc": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.33.0.tgz",
      "integrity": "sha512-OlEICDx/Xl0FqSp4bry8zFnCvGpig3Gl4gCquvYwHuqJKEC1+n9NgDniFvqHGmMv1ZkqDJrDqKKSykTDX+ehuA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/locate-path": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/locate-path/-/locate-path-6.0.0.tgz",
      "integrity": "sha512-iPZK6eYjbxRu3uB4/WZ3EsEIMJFMqAoopl3R+zuq0UjcAm/MO6KCweDgPfP3elTztoKP3KtnVHxTn2NHBSDVUw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "p-locate": "^5.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/lodash.merge": {
      "version": "4.6.2",
      "resolved": "https://registry.npmjs.org/lodash.merge/-/lodash.merge-4.6.2.tgz",
      "integrity": "sha512-0KpjqXRVvrYyCsX1swR/XTK0va6VQkQM6MNo7PqW77ByjAhoARA8EfrP1N4+KlKj8YS0ZUCtRT/YUuhyYDujIQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/lru-cache": {
      "version": "5.1.1",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-5.1.1.tgz",
      "integrity": "sha512-KpNARQA3Iwv+jTA0utUVVbrh+Jlrr1Fv0e56GGzAFOXN7dk/FviaDW8LHmK52DlcH4WP2n6gI8vN1aesBFgo9w==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "yallist": "^3.0.2"
      }
    },
    "node_modules/minimatch": {
      "version": "3.1.5",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-3.1.5.tgz",
      "integrity": "sha512-VgjWUsnnT6n+NUk6eZq77zeFdpW2LWDzP6zFGrCbHXiYNul5Dzqk2HHQ5uFH2DNW5Xbp8+jVzaeNt94ssEEl4w==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "brace-expansion": "^1.1.7"
      },
      "engines": {
        "node": "*"
      }
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/nanoid": {
      "version": "3.3.20",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.20.tgz",
      "integrity": "sha512-uKdg2G3GNCKQn9byYOpxbGqrT2fGO5KRt5J/8b3pok8rT6qxGWF6hxMyJiEYtAf+FVyYuD9hRaDqX5uPFYJ4ZQ==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/natural-compare": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/natural-compare/-/natural-compare-1.4.0.tgz",
      "integrity": "sha512-OWND8ei3VtNC9h7V60qff3SVobHr996CTwgxubgyQYEpg290h9J0buyECNNJexkFm5sOajh5G116RYA1c8ZMSw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/node-releases": {
      "version": "2.0.65",
      "resolved": "https://registry.npmjs.org/node-releases/-/node-releases-2.0.65.tgz",
      "integrity": "sha512-PfvofsGQ+MiOQIPkX9fU8ELUWmy5zL74CdQaph/ismKszfFkfwXaw0cGiwbwym2hT9k5+mdyl8O5WQ1MD8EHmA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/optionator": {
      "version": "0.9.4",
      "resolved": "https://registry.npmjs.org/optionator/-/optionator-0.9.4.tgz",
      "integrity": "sha512-6IpQ7mKUxRcZNLIObR0hz7lxsapSSIYNZJwXPGeF0mTVqGKFIXj1DQcMoT22S3ROcLyY/rz0PWaWZ9ayWmad9g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "deep-is": "^0.1.3",
        "fast-levenshtein": "^2.0.6",
        "levn": "^0.4.1",
        "prelude-ls": "^1.2.1",
        "type-check": "^0.4.0",
        "word-wrap": "^1.2.5"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/p-limit": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/p-limit/-/p-limit-3.1.0.tgz",
      "integrity": "sha512-TYOanM3wGwNGsZN2cVTYPArw454xnXj5qmWF1bEoAc4+cU/ol7GVh7odevjp1FNHduHc3KZMcFduxU5Xc6uJRQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "yocto-queue": "^0.1.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/p-locate": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/p-locate/-/p-locate-5.0.0.tgz",
      "integrity": "sha512-LaNjtRWUBY++zB5nE/NwcaoMylSPk+S+ZHNB1TzdbMJMny6dynpAGt7X/tl/QYq3TIeE6nxHppbo2LGymrG5Pw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "p-limit": "^3.0.2"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/parent-module": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/parent-module/-/parent-module-1.0.1.tgz",
      "integrity": "sha512-GQ2EWRpQV8/o+Aw8YqtfZZPfNRWZYkbidE9k5rpl/hC3vtHHBfGm2Ifi6qWV+coDGkrUKZAxE3Lot5kcsRlh+g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "callsites": "^3.0.0"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/path-exists": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/path-exists/-/path-exists-4.0.0.tgz",
      "integrity": "sha512-ak9Qy5Q7jYb2Wwcey5Fpvg2KoAc/ZIhLSLOSBmRmygPsGwkVVt0fZa0qrtMz+m6tJTAHfZQ8FnmB4MG4LWy7/w==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/path-key": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/path-key/-/path-key-3.1.1.tgz",
      "integrity": "sha512-ojmeN0qd+y0jszEtoY48r0Peq5dwMEkIlCOu6Q5f41lfkswXuKtYrhgoTpLnyIcHm24Uhqx+5Tqm2InSwLhE6Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/picomatch": {
      "version": "4.0.7",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz",
      "integrity": "sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/postcss": {
      "version": "8.5.33",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.33.tgz",
      "integrity": "sha512-RVHEU9/Pp1Fnjr/MpAJsZoADukCKhfIi15OunEYiGktIkYLkPVvC1sioWolGDS7XByMTx9m/IGbro0Js13zhnQ==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.20",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.2"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/prelude-ls": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/prelude-ls/-/prelude-ls-1.2.1.tgz",
      "integrity": "sha512-vkcDPrRZo1QZLbn5RLGPpg/WmIQ65qoWWhcGKf/b5eplkkarX0m9z8ppCat4mlOqUsWpyNuYgO3VRyrYHSzX5g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/punycode": {
      "version": "2.3.1",
      "resolved": "https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz",
      "integrity": "sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/react": {
      "version": "19.3.1",
      "resolved": "https://registry.npmjs.org/react/-/react-19.3.1.tgz",
      "integrity": "sha512-QNhWdt7nrgVWWQG58QuGsAR3jv3Hbe4mb4vz7w2csnHavciZJgda1CPNaldF6eVxv90ud3jUXpKlHL69gO38yw==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-dom": {
      "version": "19.3.1",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-19.3.1.tgz",
      "integrity": "sha512-Y0bARz53lhEC1NMCASs0/j+faB/zqt3R8hpvg1e8+61ZVJ4UL0UdC4cBbXfZMcIuhrfgeILTLe+ZeBCavQPtKQ==",
      "license": "MIT",
      "dependencies": {
        "scheduler": "^0.28.0"
      },
      "peerDependencies": {
        "react": "^19.3.1"
      }
    },
    "node_modules/react-router": {
      "version": "7.18.6",
      "resolved": "https://registry.npmjs.org/react-router/-/react-router-7.18.6.tgz",
      "integrity": "sha512-SP8KqKfRLlJzqzPseC+r6yYFsqPEavtQCC4BKV810tBGijjESLtwVPam+gPOO+wYeXrYN/TNy2CAykQVcNg4iQ==",
      "license": "MIT",
      "dependencies": {
        "cookie": "^1.0.1",
        "set-cookie-parser": "^2.6.0"
      },
      "engines": {
        "node": ">=20.0.0"
      },
      "peerDependencies": {
        "react": ">=18",
        "react-dom": ">=18"
      },
      "peerDependenciesMeta": {
        "react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/react-router-dom": {
      "version": "7.18.6",
      "resolved": "https://registry.npmjs.org/react-router-dom/-/react-router-dom-7.18.6.tgz",
      "integrity": "sha512-a8JzFsKEY3EY9QL7t4T1b1OhuY0ngEfwMzXQNgBO/2cuIW9028JbVq3uk2rKnjLredzcIoDKLzUkguIq6fnkFA==",
      "license": "MIT",
      "dependencies": {
        "react-router": "7.18.6"
      },
      "engines": {
        "node": ">=20.0.0"
      },
      "peerDependencies": {
        "react": ">=18",
        "react-dom": ">=18"
      }
    },
    "node_modules/resolve-from": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/resolve-from/-/resolve-from-4.0.0.tgz",
      "integrity": "sha512-pb/MYmXstAkysRFx8piNI1tGFNQIFA3vkE3Gq4EuA1dF6gHp/+vgZqsCGJapvy8N3Q+4o7FwvquPJcnZ7RYy4g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/rolldown": {
      "version": "1.2.19",
      "resolved": "https://registry.npmjs.org/rolldown/-/rolldown-1.2.19.tgz",
      "integrity": "sha512-QIiV1J9d0pzN4jeeTH4sjPy0AZ6cAy2cG0ExeoE1+U8Rvj+hR3gYkokx0YbeUNGlZqiQJJ2utcETe0oKXwzsuA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@oxc-project/types": "=0.156.0",
        "@rolldown/pluginutils": "^1.0.0"
      },
      "bin": {
        "rolldown": "bin/cli.mjs"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "optionalDependencies": {
        "@rolldown/binding-android-arm-eabi": "1.2.19",
        "@rolldown/binding-android-arm64": "1.2.19",
        "@rolldown/binding-darwin-arm64": "1.2.19",
        "@rolldown/binding-darwin-x64": "1.2.19",
        "@rolldown/binding-freebsd-x64": "1.2.19",
        "@rolldown/binding-linux-arm-gnueabihf": "1.2.19",
        "@rolldown/binding-linux-arm64-gnu": "1.2.19",
        "@rolldown/binding-linux-arm64-musl": "1.2.19",
        "@rolldown/binding-linux-ppc64-gnu": "1.2.19",
        "@rolldown/binding-linux-s390x-gnu": "1.2.19",
        "@rolldown/binding-linux-x64-gnu": "1.2.19",
        "@rolldown/binding-linux-x64-musl": "1.2.19",
        "@rolldown/binding-openharmony-arm64": "1.2.19",
        "@rolldown/binding-wasm32-wasi": "1.2.19",
        "@rolldown/binding-win32-arm64-msvc": "1.2.19",
        "@rolldown/binding-win32-x64-msvc": "1.2.19"
      }
    },
    "node_modules/scheduler": {
      "version": "0.28.0",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.28.0.tgz",
      "integrity": "sha512-juorfCmIkIw8tT+p5BXSm6PJjQF/ycEYmKyzURCIt/RaZIhL+PulbQ9Yu2z1HdOJDdqDTlxA1+xKBmHXJsczAw==",
      "license": "MIT"
    },
    "node_modules/semver": {
      "version": "6.3.2",
      "resolved": "https://registry.npmjs.org/semver/-/semver-6.3.2.tgz",
      "integrity": "sha512-GYrCADwpu6yV5OAvchkQ27Z5wwMxWAEMg5NNWjyHh/5DboFFqbdbvYNIvZouQpxXyeMPoTOh0vdPYKlf0ZswdQ==",
      "dev": true,
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      }
    },
    "node_modules/set-cookie-parser": {
      "version": "2.7.3",
      "resolved": "https://registry.npmjs.org/set-cookie-parser/-/set-cookie-parser-2.7.3.tgz",
      "integrity": "sha512-irZHtTqurLna57KQG/s+fzOwv/J6XSH4cs8M/vsrY3uCaQ3S6+QJguAH0WdN47SXlk82voMZ4naWMQf8fdEoIg==",
      "license": "MIT"
    },
    "node_modules/shebang-command": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/shebang-command/-/shebang-command-2.0.0.tgz",
      "integrity": "sha512-kHxr2zZpYtdmrN1qDjrrX/Z1rR1kG8Dx+gkpK1G4eXmvXswmcE1hTWBWYUzlraYw1/yZp6YuDY77YtvbN0dmDA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "shebang-regex": "^3.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/shebang-regex": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/shebang-regex/-/shebang-regex-3.0.0.tgz",
      "integrity": "sha512-7++dFhtcx3353uBaq8DDR4NuxBetBzC7ZQOhmTQInHEd6bSrXdiEyzCvG07Z44UYdLShWUyXt5M/yhz8ekcb1A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/source-map-js": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.4.tgz",
      "integrity": "sha512-J7ZjMvHd9O1fcT/5V09QWaaSl2BbWx3F6O08spde82Namf9UB0GxRVIPiNbVsdKkoizHiSpTodo3vp2bAy91MA==",
      "dev": true,
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/strip-json-comments": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/strip-json-comments/-/strip-json-comments-3.1.1.tgz",
      "integrity": "sha512-6fPc+R4ihwqP6N/aIv2f1gMH8lOVtWQHoqC4yK6oSDVVocumAsfCqjkXnqiYMhmMwS/mEHLp7Vehlt3ql6lEig==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/supports-color": {
      "version": "7.2.0",
      "resolved": "https://registry.npmjs.org/supports-color/-/supports-color-7.2.0.tgz",
      "integrity": "sha512-qpCAvRl9stuOHveKsn7HncJRvv501qIacKzQlO/+Lwxc9+0q2wLyv4Dfvt80/DPn2pqOBsJdDiogXGR9+OvwRw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "has-flag": "^4.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/tinyglobby": {
      "version": "0.2.17",
      "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.17.tgz",
      "integrity": "sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fdir": "^6.5.0",
        "picomatch": "^4.0.4"
      },
      "engines": {
        "node": ">=12.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/SuperchupuDev"
      }
    },
    "node_modules/tslib": {
      "version": "2.9.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.9.1.tgz",
      "integrity": "sha512-a4Ux9VKuIMHsOS7ENbEq6hK2ZGYIT27Rtl0E4eD9KqwxhKiQeMZE/9xb3IdYwWaSOyIBQLExhQgXDTYoiCxnWA==",
      "license": "0BSD"
    },
    "node_modules/type-check": {
      "version": "0.4.0",
      "resolved": "https://registry.npmjs.org/type-check/-/type-check-0.4.0.tgz",
      "integrity": "sha512-XleUoc9uwGXqjWwXaUTZAmzMcFZ5858QA2vvx1Ur5xIcixXIP+8LnFDgRplU30us6teqdlskFfu+ae4K79Ooew==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "prelude-ls": "^1.2.1"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/update-browserslist-db": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/update-browserslist-db/-/update-browserslist-db-1.4.0.tgz",
      "integrity": "sha512-WPJuOnjI9FWDct4fB+ej4Mz8opLaw5CDcZ2t44tFZ0vIQVYWzBhWR3mkixuUj/A7+vY4V9+ApOZ2YYLwdgq46w==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "escalade": "^3.2.0",
        "picocolors": "^1.1.1"
      },
      "bin": {
        "update-browserslist-db": "cli.js"
      },
      "peerDependencies": {
        "browserslist": ">= 4.21.0"
      }
    },
    "node_modules/uri-js": {
      "version": "4.4.1",
      "resolved": "https://registry.npmjs.org/uri-js/-/uri-js-4.4.1.tgz",
      "integrity": "sha512-7rKUyy33Q1yc98pQ1DAmLtwX109F7TIfWlW1Ydo8Wl1ii1SeHieeh0HHfPeL2fMXK6z0s8ecKs9frCuLJvndBg==",
      "dev": true,
      "license": "BSD-2-Clause",
      "dependencies": {
        "punycode": "^2.1.0"
      }
    },
    "node_modules/vite": {
      "version": "8.3.8",
      "resolved": "https://registry.npmjs.org/vite/-/vite-8.3.8.tgz",
      "integrity": "sha512-LzOn3h9rG/0vhLdXrV4yJ4QFA9eEoqCl+Yx+kGJd7aB9w6nfNgVHKSYwLPZUHrz4ZGa+t+kXjV9itvcHDLQouA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "lightningcss": "^1.33.0",
        "picomatch": "^4.0.7",
        "postcss": "^8.5.32",
        "rolldown": "~1.2.18",
        "tinyglobby": "^0.2.17"
      },
      "bin": {
        "vite": "bin/vite.js"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "funding": {
        "url": "https://github.com/vitejs/vite?sponsor=1"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      },
      "peerDependencies": {
        "@types/node": "^20.19.0 || >=22.12.0",
        "@vitejs/devtools": "^0.7.1 || ^0.8.0",
        "esbuild": "^0.27.0 || ^0.28.0",
        "jiti": ">=1.21.0",
        "less": "^4.0.0",
        "sass": "^1.70.0",
        "sass-embedded": "^1.70.0",
        "stylus": ">=0.54.8",
        "sugarss": "^5.0.0",
        "terser": "^5.16.0",
        "tsx": "^4.8.1",
        "yaml": "^2.4.2"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        },
        "@vitejs/devtools": {
          "optional": true
        },
        "esbuild": {
          "optional": true
        },
        "jiti": {
          "optional": true
        },
        "less": {
          "optional": true
        },
        "sass": {
          "optional": true
        },
        "sass-embedded": {
          "optional": true
        },
        "stylus": {
          "optional": true
        },
        "sugarss": {
          "optional": true
        },
        "terser": {
          "optional": true
        },
        "tsx": {
          "optional": true
        },
        "yaml": {
          "optional": true
        }
      }
    },
    "node_modules/which": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/which/-/which-2.0.2.tgz",
      "integrity": "sha512-BLI3Tl1TW3Pvl70l3yq3Y64i+awpwXqsGBYWkkqMtnbXgrMD+yj7rhW0kuEDxzJaYXGjEW5ogapKNMEKNMjibA==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "isexe": "^2.0.0"
      },
      "bin": {
        "node-which": "bin/node-which"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/word-wrap": {
      "version": "1.2.5",
      "resolved": "https://registry.npmjs.org/word-wrap/-/word-wrap-1.2.5.tgz",
      "integrity": "sha512-BN22B5eaMMI9UMtjrGd5g5eCYPpCPDUy0FJXbYsaT5zYxjFOckS53SQDE3pWkVoWpHXVb3BrYcEN4Twa55B5cA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/yallist": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/yallist/-/yallist-3.1.1.tgz",
      "integrity": "sha512-a4UGQaWPH59mOXUYnAG2ewncQS4i4F43Tv3JoAM+s2VDAmS9NsK8GpDMLrCHPksFT7h3K6TOoUNn2pb7RoXx4g==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/yocto-queue": {
      "version": "0.1.0",
      "resolved": "https://registry.npmjs.org/yocto-queue/-/yocto-queue-0.1.0.tgz",
      "integrity": "sha512-rVksvsnNCdJ/ohGc6xgPwyN8eheCxsiLM8mxuE/t/mOVqJewPuO1miLpTHQiRgTKCLexL4MeAFVagts7HmNZ2Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/zod": {
      "version": "4.6.7",
      "resolved": "https://registry.npmjs.org/zod/-/zod-4.6.7.tgz",
      "integrity": "sha512-g8W2D2kU6a8untc053fX1uVBKzM7yqAxW/3zwk83+6RyF2+SKOuV+c0wBDhUwzV1PaGapmZH+rmcUzPf+3CGwg==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/colinhacks"
      }
    },
    "node_modules/zod-validation-error": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/zod-validation-error/-/zod-validation-error-4.0.2.tgz",
      "integrity": "sha512-Q6/nZLe6jxuU80qb/4uJ4t5v2VEZ44lzQjPDhYJNztRQ4wyWc6VF3D3Kb/fAuPetZQnhS3hnajCf9CsWesghLQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18.0.0"
      },
      "peerDependencies": {
        "zod": "^3.25.0 || ^4.0.0"
      }
    }
  }
}
````

## `package.json`

````
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
    "db:new": "supabase migration new",
    "postbuild": "node scripts/build-offline.js",
    "test": "node --test",
    "dev:local": "node scripts/dev-local.js"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@supabase/supabase-js": "^2.119.2",
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
````

## `public/fonts/barlow-condensed-600.woff2`

Binary asset included in the ZIP.

## `public/fonts/barlow-condensed-700.woff2`

Binary asset included in the ZIP.

## `public/fonts/barlow-condensed-LICENSE.txt`

````
Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow) BarlowCondensed-ThinItalic.ttf: Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow) BarlowCondensed-ExtraLight.ttf: Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow) BarlowCondensed-ExtraLightItalic.ttf: Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow) BarlowCondensed-Light.ttf: Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow) BarlowCondensed-LightItalic.ttf: Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow) BarlowCondensed-Regular.ttf: Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow) BarlowCondensed-Italic.ttf: Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow) BarlowCondensed-Medium.ttf: Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow) BarlowCondensed-MediumItalic.ttf: Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow) BarlowCondensed-SemiBold.ttf: Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow) BarlowCondensed-SemiBoldItalic.ttf: Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow) BarlowCondensed-Bold.ttf: Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow) BarlowCondensed-BoldItalic.ttf: Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow) BarlowCondensed-ExtraBold.ttf: Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow) BarlowCondensed-ExtraBoldItalic.ttf: Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow) BarlowCondensed-Black.ttf: Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow) BarlowCondensed-BlackItalic.ttf: Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
````

## `public/fonts/inter-400.woff2`

Binary asset included in the ZIP.

## `public/fonts/inter-500.woff2`

Binary asset included in the ZIP.

## `public/fonts/inter-600.woff2`

Binary asset included in the ZIP.

## `public/fonts/inter-LICENSE.txt`

````
Copyright 2016 The Inter Project Authors (https://github.com/rsms/inter) Inter-Italic[opsz,wght].ttf: Copyright 2016 The Inter Project Authors (https://github.com/rsms/inter)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
````

## `public/icons/apple-touch-icon.png`

Binary asset included in the ZIP.

## `public/icons/icon-192.png`

Binary asset included in the ZIP.

## `public/icons/icon-512.png`

Binary asset included in the ZIP.

## `public/icons/lb.svg`

````
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="8" fill="#252840"/>
  <path fill="#a8adff" d="M10 14h8v29h9v7H10z"/>
  <path fill="#eff1ff" fill-rule="evenodd" d="M30 14h14l8 7v8l-4 3 6 5v7l-7 6H30zm8 7v8h5l2-2v-4l-2-2zm0 15v7h7l2-2v-3l-3-2z"/>
</svg>
````

## `public/icons/maskable-512.png`

Binary asset included in the ZIP.

## `public/manifest.webmanifest`

````
{
  "id": "/",
  "name": "Roleward™ Application Tracker",
  "short_name": "Roleward™",
  "description": "Track jobs, internships, and other opportunities.",
  "lang": "en",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#e8ebee",
  "theme_color": "#e8ebee",
  "icons": [
    {"src":"/icons/icon-192.png","sizes":"192x192","type":"image/png","purpose":"any"},
    {"src":"/icons/icon-512.png","sizes":"512x512","type":"image/png","purpose":"any"},
    {"src":"/icons/maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}
  ]
}
````

## `scripts/build-offline.js`

````
import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

const dist = 'dist'
async function assets(dir) {
  const urls = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) urls.push(...await assets(path))
    else if (!entry.name.endsWith('.txt') && entry.name !== 'sw.js') urls.push(path)
  }
  return urls
}
const files = (await assets(dist)).sort()
const hash = createHash('sha256')
for (const file of files) hash.update(file).update(await readFile(file))
const version = hash.digest('hex').slice(0, 16)
const urls = files.map(path => '/' + relative(dist, path).split(sep).join('/'))
const worker = [
  'const prefix = "application-tracker.shell."',
  'const version = prefix + ' + JSON.stringify(version),
  'const assets = ' + JSON.stringify(urls),
  "self.addEventListener('install', event => {",
  "  event.waitUntil(caches.open(version).then(cache => cache.addAll(assets)))",
  "})",
  "self.addEventListener('activate', event => {",
  "  event.waitUntil(caches.keys().then(keys => Promise.all(",
  "    keys.filter(key => key.startsWith(prefix) && key !== version).map(key => caches.delete(key))",
  "  )).then(() => self.clients.claim()))",
  "})",
  "self.addEventListener('fetch', event => {",
  "  const url = new URL(event.request.url)",
  "  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return",
  "  const path = event.request.mode === 'navigate' ? '/index.html' : url.pathname",
  "  if (!assets.includes(path)) return",
  "  event.respondWith(caches.open(version).then(cache => cache.match(path)).then(hit => hit || fetch(event.request)))",
  "})",
].join('\n')
await writeFile(join(dist, 'sw.js'), worker)
````

## `scripts/dev-local.js`

````
import { spawnSync } from 'node:child_process'
import { createServer } from 'vite'

function cli(args) {
  // Capture status privately. It can contain credentials that Vite must never expose.
  const result=spawnSync('supabase',args,{encoding:'utf8',maxBuffer:8*1024*1024,windowsHide:true})
  if(result.error?.code==='ENOENT') throw Error('Install the Supabase CLI and start Docker Desktop, then run npm run dev:local again.')
  if(result.error || result.status!==0) throw Error('Supabase '+args[0]+' failed. Check Docker is running and run supabase '+args[0]+' from this folder for details.')
  return result.stdout
}

try {
  console.log('Starting your local Supabase project…')
  cli(['start'])
  cli(['migration','up','--local'])
  const entries=Object.fromEntries(cli(['status','-o','env']).split(/\r?\n/).flatMap(line=>{
    const match=/^([A-Z_]+)="?([^"]*)"?$/.exec(line.trim())
    return match?[[match[1],match[2]]]:[]
  }))
  const url=entries.API_URL, key=entries.PUBLISHABLE_KEY||entries.ANON_KEY
  if(!url||!key) throw Error('Supabase did not return its local API URL and public key. Update the CLI and retry.')
  process.env.VITE_SUPABASE_URL=url
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY=key
  process.env.VITE_SUPABASE_ANON_KEY=key
  console.log('Local confirmation and recovery inbox: '+(entries.MAILPIT_URL||entries.INBUCKET_URL||'http://127.0.0.1:54324'))
  const server=await createServer({server:{port:5173,strictPort:true}})
  await server.listen()
  server.printUrls()
} catch(e) { console.error(e.message); process.exitCode=1 }
````

## `src/App.jsx`

````
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import LoadingSkeleton from './components/LoadingSkeleton.jsx'

import { useAuth } from './hooks/useAuth.js'
import { useTheme } from './hooks/useTheme.js'
import './styles/tokens.css'
import './styles/base.css'
import './styles/tracker.css'
import './styles/board.css'
import './styles/list.css'
import './styles/sheets.css'
import './styles/auth.css'
import './styles/workspace.css'

const Tracker = lazy(() => import('./pages/Tracker.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))

const AuthCallback = lazy(() => import('./pages/AuthCallback.jsx'))

function WorkspaceRoutes() {
  const theme = useTheme()
  const { user, loading, error } = useAuth()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const fragment = new URLSearchParams(location.hash.slice(1))
  const hasCallback = ['code','token_hash','error','error_code','access_token'].some(key => params.has(key) || fragment.has(key))
  const recovery = (params.get('type') || fragment.get('type')) === 'recovery'
  if (loading) return <LoadingSkeleton />
  const login = mode => <Login key={mode} mode={mode} user={user} authError={error} />
  const callback = reset => <AuthCallback key={location.key} recovery={reset} />
  return <Suspense fallback={<LoadingSkeleton />}><Routes>
    <Route path="/" element={hasCallback ? callback(recovery) : <Navigate replace to={user ? '/dashboard' : '/login'}/>} />
    {['dashboard','applications','follow-ups','account'].map(tab =>
      <Route key={tab} path={'/'+tab} element={user ? <Tracker key={user.id} user={user} theme={theme} tab={tab}/> : <Navigate to="/login" replace />}/>)}
    <Route path="/auth/callback" element={callback(recovery)} />
    <Route path="/confirm-email" element={login('confirm')} />
    <Route path="/login" element={login('login')} />
    <Route path="/signup" element={login('signup')} />
    <Route path="/forgot-password" element={login('forgot')} />
    <Route path="/reset-password" element={hasCallback ? <AuthCallback recovery /> : login('reset')} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense>
}

export default function App() {
  return <BrowserRouter><WorkspaceRoutes /></BrowserRouter>
}
````

## `src/components/Agenda.jsx`

````
import { useState } from 'react'
import Icon from './Icon.jsx'

export function ActionRow({item,edit,follow,compact=false}) {
  const {row,kind,label} = item
  return <div className={'action-row '+kind}>
    <span className="action-symbol"><Icon name={kind==='deadline'?'calendar':'flag'}/></span>
    <button className="row-title" onClick={()=>edit(row)}><b>{row.company}</b><small>{label}</small></button>
    {!compact && kind==='follow' ? <button className="soft-button" onClick={()=>follow(row)}>Log follow-up</button> :
      <button className="row-arrow" aria-label={'Open '+row.company} onClick={()=>edit(row)}><Icon name="arrow" size={16}/></button>}
  </div>
}
export default function Agenda({items,actions}){
  const [filter,setFilter] = useState('all')
  const shown = items.filter(item=>filter==='all'||item.kind===filter)
  return <section className="surface agenda"><div className="section-top"><h2>Action queue</h2></div>
    <div className="queue-tabs" aria-label="Action type">{[['all','All'],['follow','Follow-ups'],['deadline','Deadlines']].map(([key,label])=>
      <button key={key} aria-pressed={key===filter} onClick={()=>setFilter(key)}>{label}</button>)}</div>
    {shown.map(item=><ActionRow key={item.row.id} item={item} edit={actions.edit} follow={actions.follow}/>)}
    {!shown.length && <div className="quiet"><Icon name="check"/><h3>You’re caught up</h3>
      <p>{filter==='follow'?'Applications appear here after ten days without activity.':filter==='deadline'?'No overdue or upcoming deadlines in the next seven days.':'Upcoming deadlines and applications due for a follow-up will appear here.'}</p></div>}
  </section>
}
````

## `src/components/Board.jsx`

````
import { useRef, useState } from 'react'
import { DndContext, DragOverlay, KeyboardSensor, MouseSensor, TouchSensor, pointerWithin,
  rectIntersection, useSensor, useSensors } from '@dnd-kit/core'
import { STAGES, stageStyle } from '../lib/utils.js'
import { useCardMotion } from '../hooks/useCardMotion.js'
import Column from './Column.jsx'

function collision(args) { return args.pointerCoordinates ? pointerWithin(args) : rectIntersection(args) }
export default function Board({ rows, stage, actions, today }) {
  const rail = useRef(null)
  const [tab, setTab] = useState('Saved')
  const [dragged, setDragged] = useState(null)
  useCardMotion(rail,rows,stage,Boolean(dragged))
  const sensors = useSensors(useSensor(MouseSensor,{activationConstraint:{distance:5}}),
    useSensor(TouchSensor,{activationConstraint:{delay:280,tolerance:8}}),useSensor(KeyboardSensor))
  const stages = stage ? [stage] : STAGES
  const active = rows.find(row => row.id === dragged)
  function jump(name) {
    const el = rail.current.querySelector('[data-column="' + name + '"]')
    if (el) rail.current.scrollTo({ left: el.offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  return <DndContext sensors={sensors} collisionDetection={collision}
    onDragStart={e => setDragged(e.active.id)} onDragCancel={() => setDragged(null)}
    onDragEnd={e => {
      setDragged(null)
      if (e.over && active && e.over.id !== active.stage) actions.move(active.id, e.over.id)
    }}>
    {!stage && <nav aria-label="Jump to stage" className="stage-nav">{stages.map(name =>
      <button key={name} className={tab === name ? 'selected' : ''} onClick={() => jump(name)} style={stageStyle(name)}>{name}</button>)}</nav>}
    <div className="board" ref={rail} onScroll={() => {
      const el = rail.current
      const nearest = [...el.children].reduce((best, child) =>
        Math.abs(child.offsetLeft - el.scrollLeft) < Math.abs(best.offsetLeft - el.scrollLeft) ? child : best)
      setTab(nearest.dataset.column)
    }}>{stages.map(name => <Column key={name} stage={name} rows={rows.filter(row => row.stage === name)}
      actions={actions} today={today} />)}</div>
    <DragOverlay>{active && <div className="drag-preview" style={stageStyle(active.stage)}><b>{active.company}</b><small>{active.role}</small></div>}</DragOverlay>
  </DndContext>
}
````

## `src/components/Brand.jsx`

````
export default function Brand() {
  return <span className="brand">
    <img className="lb-mark" src="/icons/lb.svg" width="34" height="34" alt=""/>
    <span>Roleward<sup>™</sup></span>
  </span>
}
````

## `src/components/Card.jsx`

````
import Icon from './Icon.jsx'
import { deadlineBadge, daysBetween, followUp, localDate, shortDate, stageStyle } from '../lib/utils.js'

export function PostingLink({ link }) {
  if (!link) return null
  let url
  try { url = new URL(link) } catch { return null }
  if (!['http:', 'https:'].includes(url.protocol)) return null
  return <a className="posting" href={url.href} target="_blank" rel="noopener noreferrer">
    <Icon name="external" size={14} />{url.hostname.replace(/^www\./, '')}</a>
}
export function FollowUpAction({ row, today, onFollow }) {
  if (followUp(row,today)) return <button className="apply" onClick={() => onFollow(row)}>Log follow-up</button>
  if (row.stage === 'Applied' && row.last_followed_up_at) return <small className="row-nudge">
    Followed up {shortDate(localDate(new Date(row.last_followed_up_at)))}</small>
  return null
}
export function Priority({ row, onPin }) {
  return <button type="button" className={'priority icon-button' + (row.pinned ? ' active' : '')}
    aria-label={'Priority for ' + row.company} aria-pressed={row.pinned} onClick={() => onPin(row)}>
    <Icon name="star" size={18} fill={row.pinned} /></button>
}
export default function Card({ row, actions, today, drag }) {
  const due = deadlineBadge(row, today)
  return <article data-card-id={row.id} className={'card' + (actions.highlight === row.id ? ' just-saved' : '') + (drag.isDragging ? ' dragging' : '')} ref={drag.setNodeRef}
    style={stageStyle(row.stage)} onClick={e => {
      if (!e.target.closest('button,a')) actions.edit(row)
    }}>
    <div className="card-head">
      <button className="company" onClick={() => actions.edit(row)}>{row.company}</button>
      <Priority row={row} onPin={actions.pin} />
    </div>
    <span className="position">{row.role || 'No role added'}</span>
    <div className="tags"><span>{row.type}</span>
      {row.applied_date && !['Saved','Closed'].includes(row.stage) && <span>{Math.max(0,daysBetween(row.applied_date,today))}d</span>}
      {due && <span className={due.tone}>{due.text}</span>}
      {followUp(row,today) && <span className="soon">⚑ Follow up</span>}
    </div>
    <PostingLink link={row.link} />
    {row.notes && <p className="card-notes">{row.notes}</p>}
    <FollowUpAction row={row} today={today} onFollow={actions.follow} />
    {row.stage === 'Saved' && <button className="apply" onClick={() => actions.apply(row)}>Mark as applied <Icon name="arrow" size={14} /></button>}
    <div className="card-foot">
      <button className="move" onClick={() => actions.pick(row)}>Move to…</button>
      <button className="handle icon-button" ref={drag.setActivatorNodeRef} {...drag.attributes} {...drag.listeners}
        aria-label={'Drag ' + row.company}><Icon name="grip" size={16}/></button>
    </div>
  </article>
}
````

## `src/components/Column.jsx`

````
import { useDraggable, useDroppable } from '@dnd-kit/core'
import Card from './Card.jsx'
import { stageStyle } from '../lib/utils.js'

function DraggableCard(props) {
  const drag = useDraggable({ id: props.row.id })
  return <Card {...props} drag={drag} />
}
export default function Column({ stage, rows, actions, today }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  return <section ref={setNodeRef} data-column={stage} aria-label={stage + ' column'}
    className={'column' + (isOver ? ' over' : '')} style={stageStyle(stage)}>
    <h2>{stage}<small>{rows.length}</small></h2>
    <div className="cards">{rows.length ? rows.map(row => <DraggableCard key={row.id} row={row} actions={actions} today={today} />)
      : <div className="dropzone">Drop here</div>}</div>
  </section>
}
````

## `src/components/EditorSheet.jsx`

````
import { useRef, useState } from 'react'
import Sheet from './Sheet.jsx'
import { cleanForm, formFields, STAGES, TYPES } from '../lib/utils.js'

export default function EditorSheet({ initial, onClose, onSave, onDelete }) {
  const [draft, setDraft] = useState(initial)
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState('')
  const [discard,setDiscard] = useState(false)
  const dirty = formFields.some(key => (draft[key] ?? '') !== (initial[key] ?? ''))
  const busy = useRef(false)
  function requestClose() {
    if (busy.current) return
    if (dirty) { setDiscard(true); setConfirm(false) }
    else onClose()
  }
  const [pending, setPending] = useState(false)
  const bind = key => ({ value: draft[key] ?? '', onChange: e => {
    setDraft(prev => ({ ...prev, [key]: e.target.value })); setConfirm(false); setError('')
  } })
  const input = (caption, key, type = 'text', attrs = {}) =>
    <label>{caption}<input type={type} {...bind(key)} {...attrs} /></label>
  async function submit(action) {
    if (busy.current) return
    busy.current = true
    setPending(true)
    try { await action(); onClose() }
    catch (e) { setError(e.message) }
    finally { busy.current = false; setPending(false) }
  }
  function save(event) {
    event.preventDefault()
    submit(() => {
      const clean = cleanForm(draft)
      const fields = initial.id ? Object.fromEntries(formFields.filter(k => clean[k] !== (initial[k] || '')).map(k => [k,clean[k]])) : clean
      return onSave(initial.id, fields)
    })
  }
  return <Sheet title={initial.id ? 'Edit opportunity' : 'New opportunity'} onClose={requestClose}>
    {discard ? <div className="discard-panel"><h3>Discard unsaved changes?</h3><p>Your last saved version will be kept.</p>
      <div className="sheet-actions"><button className="btn ghost" onClick={onClose}>Discard changes</button>
      <button className="btn" autoFocus onClick={() => setDiscard(false)}>Keep editing</button></div></div> : <form onSubmit={save}>
      <div className="sheet-body">
        {input('Company or organization', 'company', 'text', { required: true, autoFocus: true, autoComplete: 'organization' })}
        {input('Role', 'role')}
        <div className="fields-pair">
          <label>Stage<select {...bind('stage')}>{STAGES.map(s => <option key={s}>{s}</option>)}</select></label>
          <label>Type<select {...bind('type')}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></label>
        </div>
        {input('Link to the posting', 'link', 'text', { placeholder: 'https://…', inputMode: 'url', autoCapitalize: 'none' })}
        <label>Notes<textarea rows="3" {...bind('notes')} placeholder="Contacts, requirements, or next steps…" /></label>
        <details><summary>More details</summary>
          <div className="fields-pair">{input('Applied date', 'applied_date', 'date')}{input('Apply by', 'deadline', 'date')}</div>
          <div className="fields-pair">{input('Location / setup', 'location')}{input('Pay', 'pay')}</div>
        </details>
        {error && <p role="alert" className="error">{error}</p>}
        {confirm && <p role="alert">Delete this application and its notes?</p>}
      </div>
      <footer className="sheet-actions">
        {initial.id && <button type="button" disabled={pending} className="btn ghost danger" onClick={() =>
          confirm ? submit(() => onDelete(initial.id)) : setConfirm(true)}>{confirm ? 'Confirm delete' : 'Delete'}</button>}
        <button type="button" disabled={pending} className="btn ghost push" onClick={requestClose}>Cancel</button>
        <button className="btn" disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>
      </footer>
    </form>}
  </Sheet>
}
````

## `src/components/EmailVerification.jsx`

````
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as api from '../lib/api.js'

export default function EmailVerification({ initialEmail, recovery, justSent }) {
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [wait, setWait] = useState(justSent ? 60 : 0)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const navigate = useNavigate()
  useEffect(() => {
    if (!wait) return
    const timer = setTimeout(() => setWait(wait - 1), 1000)
    return () => clearTimeout(timer)
  }, [wait])
  async function submit(event) {
    event.preventDefault()
    const resend = event.nativeEvent.submitter?.value === 'resend'
    if (lock.current || (resend && wait)) return
    const address = email.trim()
    if (!event.currentTarget.elements.email.reportValidity()) return
    lock.current = true
    setBusy(true)
    setError('')
    setNotice('')
    try {
      if (resend) {
        if (recovery) await api.requestReset(address)
        else await api.resendConfirmation(address)
        setWait(60)
        setNotice('If this address is eligible, a fresh email is on its way. Use the latest one.')
      } else {
        await api.verifyEmailCode(address, code.trim(), recovery)
        navigate(recovery ? '/reset-password' : '/dashboard', { replace: true })
      }
    } catch (err) {
      if (err.status === 429) setWait(60)
      setError(err.code === 'otp_expired' ? 'This code is invalid or expired. Check the latest email or request a new one.' : err.message)
    } finally { lock.current = false; setBusy(false) }
  }
  return <form className="auth-form" onSubmit={submit}><fieldset disabled={busy}>
    <label className="auth-field"><span>Email address</span><input required type="email" name="email" autoComplete="email"
      value={email} onChange={e => setEmail(e.target.value)}/></label>
    <label className="auth-field"><span>Email code</span><input name="code" className="otp-input" autoComplete="one-time-code"
      inputMode="numeric" pattern="[0-9]{6,10}" required value={code} maxLength={10}
      onChange={e => setCode(e.target.value.trim())}/></label>
    <button className="btn auth-primary" type="submit" value="verify">{busy ? 'Please wait…' : 'Verify code'}</button>
    <button className="soft-button" type="submit" value="resend" formNoValidate disabled={wait > 0}>
      {wait ? 'Resend available in '+wait+'s' : 'Resend email'}</button>
  </fieldset>{notice && <p role="status" className="notice-success">{notice}</p>}
    {error && <p role="alert" className="error">{error}</p>}</form>
}
````

## `src/components/EmptyState.jsx`

````
import Icon from './Icon.jsx'
export default function EmptyState({ filtered, onNew, onSamples, onReset }) {
  return <section className="empty">
    <span className="empty-icon"><Icon name={filtered ? 'search' : 'folder'} size={29} /></span>
    <h2>{filtered ? 'No matching applications' : 'Nothing tracked yet'}</h2>
    <p>{filtered ? 'Try another search or clear the active filters.' :
      'Save roles you might want, log the ones you’ve applied to, and keep every link and note in one place.'}</p>
    <div className="empty-actions">{filtered ? <button className="btn ghost" onClick={onReset}>Clear filters</button> : <>
      <button className="btn" onClick={onNew}><Icon name="plus" size={16}/>Log an application</button>
      <button className="btn ghost" onClick={onSamples}>Try with sample data</button></>}</div>
  </section>
}
````

## `src/components/FilterBar.jsx`

````
import { TYPES } from '../lib/utils.js'
import Icon from './Icon.jsx'
export default function FilterBar({ query, setQuery, type, setType, due, setDue, count, view, setView, searchRef }) {
  return <div className="toolbar">
    <label className="search-box"><Icon name="search" size={16} /><input type="search" ref={searchRef}
      aria-label="Search applications" placeholder="Search applications…" value={query} onChange={e => setQuery(e.target.value)} /><kbd>/</kbd></label>
    <select aria-label="Filter by type" value={type} onChange={e => setType(e.target.value)}>
      <option value="">All types</option>{TYPES.map(t => <option key={t}>{t}</option>)}</select>
    {(count > 0 || due) && <button className="chip" aria-pressed={due} onClick={() => setDue(!due)}>
      <Icon name="flag" size={15} />{count} to follow up</button>}
    <div className="views" aria-label="Tracker view">{['board','list'].map(v => <button key={v} aria-pressed={view === v}
      onClick={() => setView(v)}><Icon name={v} size={16} />{v}</button>)}</div>
  </div>
}
````

## `src/components/Icon.jsx`

````
const paths = {
  overview:'M3 3h7v8H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 15h7v6H3z',
  settings:'M4 7h6m4 0h6M4 17h10m4 0h2M10 4v6m4 4v6',
  calendar:'M3 5h18v16H3zM7 3v5m10-5v5M3 11h18',
  eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0',

  plus: 'M12 5v14M5 12h14', arrow: 'M4 12h15m-6-6 6 6-6 6',
  external: 'M7 17 18 6M8 6h10v10', search: 'M20 20l-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9z',
  board: 'M3 5h18v14H3zM9 5v14m6-14v14', list: 'M8 6h13M8 12h13M8 18h13M3 6h1m-1 6h1m-1 6h1',
  flag: 'M5 21V4h13l-3 4 3 4H5', x: 'm6 6 12 12M18 6 6 18',
  theme: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 0v18',
  grip: 'M8 6h.1M8 12h.1M8 18h.1M15 6h.1M15 12h.1M15 18h.1',
  device: 'M3 4h18v13H3zM8 21h8m-4-4v4', check: 'm4 12 5 5L20 6',
  folder: 'M3 7h7l2 2h9v10H3zM4 7V4h7l2 2h6v3',
}
export default function Icon({ name, size = 18, fill = false }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={name === 'grip' ? 3.5 : 1.65} strokeLinecap="round" strokeLinejoin="round">
    <path d={paths[name]} fill={fill ? 'currentColor' : 'none'} />
  </svg>
}
````

## `src/components/ListView.jsx`

````
import { STAGES, deadlineBadge, shortDate, stageStyle } from '../lib/utils.js'
import { PostingLink, Priority, FollowUpAction } from './Card.jsx'
export default function ListView({ rows, actions, today }) {
  return <div className="list-wrap"><table><thead><tr>{['Priority','Company','Role','Type','Stage','Date','Link'].map(h =>
    <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{rows.map(row => {
    const due = deadlineBadge(row,today)
    return <tr key={row.id} className={actions.highlight === row.id ? 'just-saved' : ''} style={stageStyle(row.stage)}>
      <td data-label="Priority"><Priority row={row} onPin={actions.pin} /></td>
      <td data-label="Company"><button className="company" onClick={() => actions.edit(row)}>{row.company}</button></td>
      <td data-label="Role">{row.role || '—'}</td><td data-label="Type">{row.type}</td>
      <td data-label="Stage"><select className="stage-select" aria-label={'Stage for ' + row.company} value={row.stage}
        onChange={e => actions.move(row.id,e.target.value)}>{STAGES.map(s => <option key={s}>{s}</option>)}</select></td>
      <td data-label="Date">{shortDate(row.applied_date || row.created_at.slice(0,10))}
        <FollowUpAction row={row} today={today} onFollow={actions.follow} />
        {due && <small className={'row-nudge ' + due.tone}>{due.text}</small>}</td>
      <td data-label="Link">{row.link ? <PostingLink link={row.link} /> : '—'}</td>
    </tr>
  })}</tbody></table></div>
}
````

## `src/components/LoadingSkeleton.jsx`

````
export default function LoadingSkeleton() {
  return <main className="tracker loading" aria-busy="true" aria-label="Loading Roleward">
    <div className="skeleton-title" /><div className="skeleton-tiles">{Array.from({ length: 5 }, (_, i) => <i key={i}/>)}</div>
    <div className="skeleton-toolbar" /><div className="skeleton-panel" />
  </main>
}
````

## `src/components/MoveSheet.jsx`

````
import { useState } from 'react'
import { STAGES, stageStyle } from '../lib/utils.js'
import Sheet from './Sheet.jsx'
import Icon from './Icon.jsx'
export default function MoveSheet({ row, onMove, onClose }) {
  const [error,setError] = useState('')
  const [busy,setBusy] = useState(false)
  return <Sheet title={'Move ' + row.company} onClose={onClose} className="move-sheet">
    <div className="sheet-body stage-options">{STAGES.map(stage =>
      <button key={stage} disabled={busy || stage === row.stage} className="stage-option" style={stageStyle(stage)}
        onClick={async () => {
          setBusy(true)
          try { await onMove(row.id,stage); onClose() } catch(e) { setError(e.message); setBusy(false) }
        }}><span className="dot" />{stage}{stage === row.stage && <Icon name="check" />}</button>)}
      {error && <p role="alert" className="error">{error}</p>}
    </div>
  </Sheet>
}
````

## `src/components/QuickAdd.jsx`

````
import { useRef, useState } from 'react'
export default function QuickAdd({ onQuick }) {
  const [text,setText] = useState('')
  const [error,setError] = useState('')
  const pending = useRef(false)
  return <><form className="quick" onSubmit={async e => {
    e.preventDefault()
    if (pending.current) return
    pending.current = true
    try { await onQuick(text); setText(''); setError('') } catch (err) { setError(err.message) }
    finally { pending.current = false }
  }}>
    <input aria-label="Quick save" placeholder="Job link or company" value={text}
      onChange={e => { setText(e.target.value); setError('') }} required />
    <button className="btn">Save for later</button>
  </form>{error && <p className="error" role="alert">{error}</p>}</>
}
````

## `src/components/Sheet.jsx`

````
import { useEffect, useId, useRef } from 'react'
import Icon from './Icon.jsx'
export default function Sheet({ title, onClose, children, className = '' }) {
  const ref = useRef(null)
  const id = useId()
  useEffect(() => {
    const dialog = ref.current
    const previous = document.activeElement
    dialog.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = overflow
      if (previous?.isConnected) previous.focus({ preventScroll: true })
    }
  }, [])
  return <dialog ref={ref} aria-labelledby={id} className={'sheet ' + className}
    onCancel={event => { event.preventDefault(); onClose() }}
    onClick={event => {
      if (event.target !== ref.current) return
      const rect = ref.current.getBoundingClientRect()
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose()
    }}>
    <header className="sheet-head"><h2 id={id}>{title}</h2>
      <button className="icon-button" type="button" onClick={onClose} aria-label="Close sheet"><Icon name="x" /></button>
    </header>
    {children}
  </dialog>
}
````

## `src/components/StageTiles.jsx`

````
import { useEffect, useRef, useState } from 'react'
import { STAGES, stageStyle } from '../lib/utils.js'
function Count({ value }) {
  const [display,setDisplay] = useState(value)
  const current = useRef(value)
  useEffect(() => {
    const from = current.current
    if (from === value) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      current.current = value; setDisplay(value); return
    }
    const start = performance.now()
    let frame
    function tick(time) {
      const p = Math.min(1, (time - start) / 250)
      current.current = Math.round(from + (value - from) * (1 - (1 - p) ** 3))
      setDisplay(current.current)
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  },[value])
  return <b aria-hidden="true">{display}</b>
}
export default function StageTiles({ rows, selected, onChange }) {
  return <section aria-label="Stage filters" className="tiles">{STAGES.map(stage => {
    const count = rows.filter(row => row.stage === stage).length
    return <button key={stage} className="tile" aria-pressed={selected === stage} style={stageStyle(stage)}
      aria-label={stage + ', ' + count + ' applications'} onClick={() => onChange(selected === stage ? '' : stage)}>
      <small>{stage}</small><Count value={count} /></button>
  })}</section>
}
````

## `src/components/Toast.jsx`

````
import { useEffect } from 'react'
import Icon from './Icon.jsx'
export default function Toast({ notice, onDismiss }) {
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(onDismiss, notice.error || notice.action ? 7000 : 3500)
    return () => clearTimeout(timer)
  },[notice,onDismiss])
  return notice && <div className={'toast' + (notice.error ? ' failed' : '')} role={notice.error ? 'alert' : 'status'}>
    <span>{notice.text}</span>{notice.action && <button className="toast-action" onClick={notice.onAction}>{notice.action}</button>}<button className="icon-button" aria-label="Dismiss message" onClick={onDismiss}><Icon name="x" size={16}/></button>
  </div>
}
````

## `src/components/WorkspaceNav.jsx`

````
import { Link } from 'react-router-dom'
import Brand from './Brand.jsx'
import Icon from './Icon.jsx'

export const tabs = {dashboard:'Dashboard',applications:'Applications','follow-ups':'Follow-ups',account:'Settings'}
const icons = {dashboard:'overview',applications:'board','follow-ups':'flag',account:'settings'}
export default function WorkspaceNav({active,pathFor,user,count,theme}){
  return <aside className="workspace-nav"><Link className="brand-link" to={pathFor('dashboard')}><Brand/></Link>
    <nav className="main-tabs" aria-label="Workspace">{Object.entries(tabs).map(([key,label]) =>
      <Link key={key} to={pathFor(key)} aria-current={active===key?'page':undefined} className="tab-link">
        <Icon name={icons[key]} /><span>{label}</span>{key==='follow-ups' && count>0 && <small>{count}</small>}
      </Link>)}</nav>
    <div className="workspace-identity"><Icon name="device"/><div><b>Personal workspace</b>
      <small>{user.email}</small></div></div>
    <button className="theme-control" title={'Theme: '+theme.mode} aria-label={'Theme: '+theme.mode+'. Change theme'} onClick={theme.cycle}>
      <Icon name="theme"/><span>Theme</span><small>{theme.mode}</small></button>
  </aside>
}
````

## `src/hooks/useApplications.js`

````
import { useMemo, useSyncExternalStore } from 'react'
import * as remote from '../lib/api.js'
import { cachedRows, cacheRows } from '../lib/cache.js'
import { cloudWorkspace } from '../lib/cloudWorkspace.js'

export function useApplications(userId) {
  const api = useMemo(() => cloudWorkspace(userId,remote,{read:cachedRows,write:cacheRows}),[userId])
  const snapshot = useSyncExternalStore(api.subscribe,api.getSnapshot)
  return { ...snapshot, api }
}
````

## `src/hooks/useAuth.js`

````
import { useEffect, useState } from 'react'
import { cloudEnabled, onAuth, session } from '../lib/api.js'
import { forgetRows } from '../lib/cache.js'

export function useAuth() {
  const [state,setState] = useState({ user:null, loading:cloudEnabled, error:'' })
  useEffect(() => {
    if (!cloudEnabled) return
    let active = true
    let received = false
    let previous
    const apply = value => {
      const user = value?.user ?? null
      if (previous && previous !== user?.id) forgetRows(previous)
      previous = user?.id
      if (active) setState({user, loading:false, error:''})
    }
    const off = onAuth((_event, value) => { received = true; apply(value) })
    session().then(value => { if (active && !received) apply(value) }).catch(e => {
      if (active && !received) setState({user:null,loading:false,error:e.message})
    })
    return () => { active = false; off() }
  },[])
  return state
}
````

## `src/hooks/useCardMotion.js`

````
import { useLayoutEffect, useRef } from 'react'

// Keep a position within the scroll surface, so horizontal scrolling is not a move.
export function useCardMotion(ref, rows, stage, dragging) {
  const previous = useRef(new Map())
  useLayoutEffect(() => {
    const board = ref.current
    if (!board) return
    const bounds = board.getBoundingClientRect()
    const next = new Map()
    for (const el of board.querySelectorAll('[data-card-id]')) {
      const rect = el.getBoundingClientRect()
      const position = { x:rect.left - bounds.left + board.scrollLeft, y:rect.top - bounds.top }
      next.set(el.dataset.cardId,position)
      const before = previous.current.get(el.dataset.cardId)
      if (!before || dragging || !el.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) continue
      const dx = before.x - position.x, dy = before.y - position.y
      // Long jumps into other columns use the destination highlight.
      if ((Math.abs(dx) + Math.abs(dy) < 2) || Math.abs(dx) > 50 || Math.abs(dy) > 650) continue
      el.animate([{ translate: dx + 'px ' + dy + 'px' },{ translate:'0 0' }],
        {duration:220,easing:'cubic-bezier(.18,.66,.29,1)'})
    }
    previous.current = next
  },[ref,rows,stage,dragging])
}
````

## `src/hooks/useTheme.js`

````
import { useEffect, useState } from 'react'

const modes = ['system', 'dark', 'light']
const key = 'application-tracker.theme'
export function useTheme() {
  const [mode, setMode] = useState(() => {
    try { const value = localStorage.getItem(key); return modes.includes(value) ? value : 'system' }
    catch { return 'system' }
  })
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const theme = mode === 'system' ? (media.matches ? 'dark' : 'light') : mode
      document.documentElement.dataset.theme = theme
      document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#0a0c0f' : '#e8ebee'
    }
    apply()
    try { localStorage.setItem(key, mode) } catch { /* Theme still applies for this session. */ }
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [mode])
  function cycle() {
    const system = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const other = system === 'dark' ? 'light' : 'dark'
    setMode(current => current === 'system' ? other : current === other ? system : 'system')
  }
  return { mode, cycle }
}
````

## `src/lib/agenda.js`

````
import { daysBetween, followUp, localDate, shortDate } from './utils.js'

export function nextActions(rows,today){
  const deadlines = [], followups = []
  for (const row of rows) {
    if (row.stage === 'Saved' && row.deadline) {
      const days = daysBetween(today,row.deadline)
      if (days <= 7) deadlines.push({row,kind:'deadline',days,label:days < 0 ? 'Overdue · '+shortDate(row.deadline) :
        days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : 'Apply by '+shortDate(row.deadline)})
    } else if (followUp(row,today)) {
      const last = Math.max(Date.parse(row.stage_changed_at),Date.parse(row.last_followed_up_at)||0)
      const days = daysBetween(localDate(new Date(last)),today)
      followups.push({row,kind:'follow',days,label:days+' days since last activity'})
    }
  }
  deadlines.sort((a,b)=>a.days-b.days || a.row.company.localeCompare(b.row.company))
  followups.sort((a,b)=>b.days-a.days || a.row.company.localeCompare(b.row.company))
  return [...deadlines.filter(x=>x.days<=1),...followups,...deadlines.filter(x=>x.days>1)]
}
````

## `src/lib/api.js`

````
import { client, configIssue, project, publicKey } from './supabaseClient.js'
import { formFields } from './utils.js'

export const cloudEnabled = Boolean(client)
export { configIssue }
function db() {
  if (!client) throw new Error(configIssue || 'Connect Supabase to use an account.')
  return client
}
function checked({ data, error }) {
  if (error) throw error
  return data
}
export const session = async () => checked(await db().auth.getSession()).session
export function onAuth(listener) {
  const { data } = db().auth.onAuthStateChange(listener)
  return () => data.subscription.unsubscribe()
}
const redirect = path => new URL(path, window.location.origin).href
export const signIn = async (email, password) => checked(await db().auth.signInWithPassword({ email, password }))
export const signUp = async (email, password) => checked(await db().auth.signUp({
  email, password, options: { emailRedirectTo: redirect('/auth/callback') },
}))
export const resendConfirmation = async email => checked(await db().auth.resend({
  type:'signup', email, options:{emailRedirectTo:redirect('/auth/callback')},
}))
export async function google() {
  db()
  const response = await fetch(new URL('/auth/v1/settings', project), { headers: { apikey: publicKey } })
  if (!response.ok) throw Error('Could not reach the sign-in service. Please try again.')
  if ((await response.json()).external?.google === false) {
    throw Error('Google sign-in is unavailable right now. You can continue with email.')
  }
  const data = checked(await db().auth.signInWithOAuth({
    provider: 'google', options: { redirectTo: redirect('/auth/callback'), skipBrowserRedirect: true },
  }))
  if (!data.url) throw Error('Google sign-in could not start. Please try again.')
  window.location.assign(data.url)
}
export const verifyEmailCode = async (email, token, recovery = false) =>
  checked(await db().auth.verifyOtp({ email, token, type: recovery ? 'recovery' : 'email' }))
export const requestReset = async email => checked(await db().auth.resetPasswordForEmail(email, { redirectTo: redirect('/reset-password') }))
export const changePassword = async password => checked(await db().auth.updateUser({ password }))
export const signOut = async () => checked(await db().auth.signOut({ scope: 'local' }))

export async function finishAuth(href) {
  const url = new URL(href)
  const params = url.searchParams
  const fragment = new URLSearchParams(url.hash.slice(1))
  const problem = params.get('error_code') || fragment.get('error_code') || params.get('error') || fragment.get('error')
  if (problem) {
    if (problem === 'otp_expired') throw Error('This email link has expired or has already been used. You can request a fresh one.')
    throw Error('Sign-in was cancelled or could not be completed. You can try again.')
  }
  if (params.get('code')) return checked(await db().auth.exchangeCodeForSession(params.get('code')))
  const type = params.get('type')
  if (params.get('token_hash') && ['email','signup','recovery'].includes(type)) {
    return checked(await db().auth.verifyOtp({ token_hash: params.get('token_hash'), type }))
  }
  throw Error('This link is incomplete. Open the latest email or start sign-in again.')
}

const table = () => db().from('applications')
export async function loadRows(userId) {
  const rows = []
  let cursor
  for (;;) {
    let query = table().select('*').eq('user_id',userId).order('id').limit(250)
    if (cursor) query = query.gt('id',cursor)
    const page = checked(await query)
    rows.push(...page)
    if (page.length < 250) return rows
    cursor = page.at(-1).id
  }
}

function payload(fields) {
  const entries = [...formFields, 'pinned'].filter(key => Object.hasOwn(fields,key)).map(key =>
    [key, fields[key] === '' && key !== 'company' ? null : fields[key]])
  return Object.fromEntries(entries)
}
export async function insertRows(userId, rows, samples = false) {
  const body = rows.map(row => ({ ...payload(row), id: row.id, user_id: userId, is_sample: samples }))
  const query = samples ? table().upsert(body, { onConflict: 'id', ignoreDuplicates: true }) : table().insert(body)
  return checked(await query.select('*'))
}
export async function changeRow(userId, id, patch, revision) {
  const row = checked(await table().update(payload(patch)).eq('user_id',userId).eq('id',id)
    .eq('updated_at',revision).select().maybeSingle())
  if (!row) throw new Error('This application changed on another device. Open the latest version and try again.')
  return row
}
export async function logFollowUp(userId,id,revision) {
  const row = checked(await db().rpc('record_tracker_follow_up',{
    expected_owner:userId, application_id:id, expected_revision:revision,
  }).maybeSingle())
  if (!row) throw new Error('Review the latest application before logging a follow-up.')
  return row
}
export async function deleteRow(userId, id, revision) {
  const row = checked(await table().delete().eq('user_id',userId).eq('id',id)
    .eq('updated_at',revision).select('id').maybeSingle())
  if (!row) throw new Error('This application has changed or was deleted. Refresh and review it.')
}
export async function deleteSamples(userId) {
  checked(await table().delete().eq('user_id',userId).eq('is_sample',true))
}
const closing = new Map()
export function watchRows(userId, changed, status) {
  let active = true
  let channel
  // The SDK reuses a channel by topic. Wait for a previous subscription to
  // finish leaving before binding handlers (including a Strict Mode remount).
  Promise.resolve(closing.get(userId)).then(() => {
    if (!active) return
    channel = db().channel('applications:' + userId, { config: { private: true } })
    for (const event of ['INSERT','UPDATE']) channel.on('postgres_changes', {
      event, schema: 'public', table: 'applications', filter: 'user_id=eq.' + userId,
    }, changed)
    channel.on('broadcast',{event:'removed'},changed).subscribe(state => { if (active) status(state) })
  }).catch(() => { if (active) status('CHANNEL_ERROR') })
  return () => {
    active = false
    if (!channel) return
    const done = db().removeChannel(channel).catch(() => {}).finally(() => {
      if (closing.get(userId) === done) closing.delete(userId)
    })
    closing.set(userId,done)
  }
}
export async function importRows(userId, rows) {
  return checked(await db().rpc('import_device_applications',{ expected_owner: userId, items: rows }))
}
export async function reminderSetting(userId) {
  return checked(await db().from('reminder_preferences').select('enabled,timezone').eq('user_id',userId).maybeSingle())
}
export async function setReminders(userId, enabled) {
  checked(await db().from('reminder_preferences').upsert({
    user_id:userId, enabled, timezone:Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  },{ onConflict:'user_id' }))
}
````

## `src/lib/cache.js`

````
import { project } from './supabaseClient.js'
const key = id => 'application-tracker.cloud.v1:' + project + ':' + id

export function cachedRows(id) {
  try {
    const rows = JSON.parse(localStorage.getItem(key(id)))
    return Array.isArray(rows) && rows.every(row => row.user_id === id && row.id &&
      typeof row.company === 'string' && typeof row.created_at === 'string') ? rows : null
  } catch { return null }
}
export function cacheRows(id, rows) {
  try { localStorage.setItem(key(id), JSON.stringify(rows)) } catch { /* Session state remains available. */ }
}
export function forgetRows(id) {
  try { localStorage.removeItem(key(id)) } catch { /* Browser storage can be disabled. */ }
}
````

## `src/lib/cloudWorkspace.js`

````
import { createRow, updateRow } from './utils.js'
import { sampleData } from './sampleData.js'

// Only acknowledged rows go into the durable cache. Pending changes are overlays.
export function cloudWorkspace(userId, remote, cache) {
  const saved = cache.read(userId)
  let base = saved || []
  let loaded = saved !== null
  let status = 'Connecting'
  let error = ''
  let snapshot
  let epoch = 0
  let unsubscribe, timer, poll
  const listeners = new Set()
  const pending = new Set()

  function project() {
    let rows = base
    for (const operation of pending) rows = operation.preview(rows)
    snapshot = { rows, loading: !loaded && !error, pending: pending.size, error, status }
    for (const fn of listeners) fn()
  }
  project()

  async function refresh() {
    if (!listeners.size || pending.size) return
    const ticket = ++epoch
    try {
      if (!navigator.onLine) throw new Error('Offline. Reconnect to sync changes.')
      const rows = await remote.loadRows(userId)
      if (ticket !== epoch) return
      base = rows
      loaded = true
      error = ''
      cache.write(userId,base)
    } catch (e) {
      if (ticket !== epoch) return
      error = e.message
    }
    project()
  }

  function schedule() {
    clearTimeout(timer)
    if (listeners.size) timer = setTimeout(refresh, 60)
  }
  function network() {
    status = navigator.onLine ? 'Connecting' : 'Offline'
    project()
    schedule()
  }
  function subscribe(listener) {
    listeners.add(listener)
    if (listeners.size === 1) {
      let connected = false
      unsubscribe = remote.watchRows(userId,schedule, state => {
        if (!listeners.size) return
        connected = state === 'SUBSCRIBED'
        status = !navigator.onLine ? 'Offline' : connected ? 'Live' : 'Reconnecting'
        project()
        if (connected) schedule()
      })
      window.addEventListener('focus',schedule)
      window.addEventListener('online',network)
      window.addEventListener('offline',network)
      poll = setInterval(() => { if (!connected && navigator.onLine) schedule() },30000)
      refresh()
    }
    return () => {
      listeners.delete(listener)
      if (listeners.size) return
      epoch++
      clearTimeout(timer)
      clearInterval(poll)
      window.removeEventListener('focus',schedule)
      window.removeEventListener('online',network)
      window.removeEventListener('offline',network)
      unsubscribe?.()
    }
  }

  async function mutate(ids, preview, commit) {
    if (!navigator.onLine) throw new Error('You’re offline. Reconnect to save this change.')
    if ([...pending].some(op => ids.some(id => op.ids.includes(id)))) throw new Error('This application is still saving. Try again in a moment.')
    const op = { ids, preview }
    epoch++
    pending.add(op)
    project()
    try {
      const { apply, result } = await commit()
      base = apply(base)
      if (listeners.size) cache.write(userId,base)
      return result
    } finally {
      pending.delete(op)
      project()
      schedule()
    }
  }
  const without = (rows,id) => rows.filter(row => row.id !== id)
  const replace = (rows,row) => [row,...without(rows,row.id)]
  function current(id, revision) {
    const row = base.find(item => item.id === id)
    if (!row || (revision && row.updated_at !== revision)) throw new Error('This application changed. Open the latest version to continue.')
    return row
  }

  return {
    subscribe, getSnapshot: () => snapshot, refresh,
    async add(fields) {
      const row = { ...createRow(fields), user_id:userId }
      return mutate([row.id], rows => replace(rows,row), async () => {
        const [stored] = await remote.insertRows(userId,[row])
        return { apply: rows => replace(rows,stored), result:stored }
      })
    },
    async update(id, fields, revision) {
      const old = current(id,revision)
      const next = updateRow(old,fields)
      const patch = Object.fromEntries(Object.keys(fields).map(k => [k,next[k]]))
      if (!Object.keys(patch).length) return old
      return mutate([id],rows => replace(rows,next), async () => {
        const stored = await remote.changeRow(userId,id,patch,old.updated_at)
        return { apply: rows => replace(rows,stored), result:stored }
      })
    },
    async recordFollowUp(id,revision) {
      const row = current(id,revision)
      if (row.stage !== 'Applied') throw new Error('Only Applied items can be followed up.')
      const next = { ...row,last_followed_up_at:new Date().toISOString() }
      return mutate([id],rows => replace(rows,next),async () => {
        const stored = await remote.logFollowUp(userId,id,row.updated_at)
        return { apply:rows => replace(rows,stored),result:stored }
      })
    },
    async remove(id,revision) {
      const old = current(id,revision)
      return mutate([id],rows => without(rows,id),async () => {
        await remote.deleteRow(userId,id,old.updated_at)
        return { apply: rows => without(rows,id) }
      })
    },
    async addSamples() {
      if (snapshot.rows.some(row => row.is_sample)) return
      const samples = sampleData()
      // Stable per-account IDs make repeated loads from two devices converge.
      for (const row of samples) {
        const hash = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(userId + ':sample:' + row.company))
        const h = Array.from(new Uint8Array(hash),b => b.toString(16).padStart(2,'0')).join('')
        row.id = [h.slice(0,8),h.slice(8,12),'5'+h.slice(13,16),'a'+h.slice(17,20),h.slice(20,32)].join('-')
        row.user_id = userId
      }
      return mutate(['samples', ...samples.map(row => row.id)],rows => [...rows,...samples],async () => {
        const stored = await remote.insertRows(userId,samples,true)
        return { apply: rows => stored.reduce(replace,rows) }
      })
    },
    async clearSamples() {
      const keep = rows => rows.filter(row => !row.is_sample)
      return mutate(['samples', ...snapshot.rows.filter(row => row.is_sample).map(row => row.id)],keep,async () => {
        await remote.deleteSamples(userId)
        return { apply:keep }
      })
    },
  }
}
````

## `src/lib/localWorkspace.js`

````
import { cleanForm, createRow } from './utils.js'

const KEY = 'application-tracker.local.v1'

function read() {
  const raw = localStorage.getItem(KEY)
  if (!raw) {
    const legacy = localStorage.getItem('apptrk1')
    if (!legacy) return []
    const rows = JSON.parse(legacy).map(item => {
      const applied = item.stage !== 'Saved' ? item.date : ''
      const row = createRow({ ...item, location: item.where, applied_date: applied })
      return { ...row, pinned: !!item.pin, is_sample: !!item.sample,
        stage_changed_at: applied ? new Date(applied + 'T12:00:00').toISOString() : row.created_at }
    })
    localStorage.setItem(KEY, JSON.stringify(rows))
    return rows
  }
  const rows = JSON.parse(raw)
  if (!Array.isArray(rows)) throw new Error('Unexpected storage format.')
  for (const row of rows) {
    cleanForm(row)
    if (!row.id || !Number.isFinite(Date.parse(row.created_at)) ||
        !Number.isFinite(Date.parse(row.stage_changed_at))) throw new Error('Incomplete stored application.')
  }
  return rows
}

// Accounts can explicitly import records saved by earlier versions of the app.
export function readDeviceImport() {
  try { return { rows: read().filter(row => !row.is_sample), error: '' } }
  catch { return { rows: [], error: 'Could not read previous applications from this browser.' } }
}
````

## `src/lib/sampleData.js`

````
import { createRow, offsetDate } from './utils.js'

export function sampleData() {
  const examples = [
    { company: 'Northwind Labs', role: 'Frontend Developer', stage: 'Saved', link: 'northwind.example/careers',
      deadline: offsetDate(4), location: 'Remote', notes: 'Strong team. Tailor CV to React work.' },
    { company: 'Contoso', role: 'Marketing Intern', stage: 'Applied', type: 'Internship',
      applied_date: offsetDate(-12), notes: 'Applied through the careers page.' },
    { company: 'Fabrikam', role: 'Data Analyst', stage: 'Interviewing', applied_date: offsetDate(-9),
      notes: 'Second interview on Friday.' },
    { company: 'Tailspin Studio', role: 'Freelance Designer', stage: 'Offer', type: 'Freelance',
      applied_date: offsetDate(-20), pay: 'Per project' },
  ]
  return examples.map(fields => {
    const row = createRow(fields)
    return { ...row, is_sample: true, pinned: row.stage === 'Saved',
      stage_changed_at: fields.applied_date ? new Date(fields.applied_date + 'T12:00:00').toISOString() : row.created_at }
  })
}
````

## `src/lib/supabaseClient.js`

````
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
export const publicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
const key = publicKey
function setup() {
  if (!url && !key) return { client: null, issue: '' }
  try {
    const endpoint = new URL(url)
    const local = ['localhost','127.0.0.1','[::1]'].includes(endpoint.hostname)
    if (endpoint.protocol !== 'https:' && !(local && endpoint.protocol === 'http:')) throw Error()
    if (!key?.startsWith('sb_publishable_')) {
      const part = key.split('.')[1].replaceAll('-', '+').replaceAll('_', '/')
      if (JSON.parse(atob(part)).role !== 'anon') throw Error()
    }
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    const client = createClient(url, key, {
      auth: { flowType: 'pkce', detectSessionInUrl: false },
      global: { fetch: (input, init = {}) => {
        const headers = new Headers(init.headers)
        if (String(input).startsWith(endpoint.origin + '/rest/v1/')) headers.append('Prefer', 'timezone=' + timezone)
        return fetch(input, { ...init, headers })
      } },
    })
    return { client, issue: '' }
  } catch {
    return { client: null, issue: 'Check the Supabase URL and public anon or publishable key in your environment, then restart the app.' }
  }
}
export const { client, issue: configIssue } = setup()
export const project = url || 'local'
````

## `src/lib/utils.js`

````
export const STAGES = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Closed']
export const TYPES = ['Job', 'Internship', 'Freelance', 'Other']
export const stageStyle = stage => ({ '--stage': 'var(--' + stage.toLowerCase() + ')' })

export function localDate(date = new Date()) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((part, i) =>
    String(part).padStart(i ? 2 : 4, '0')).join('-')
}

export function offsetDate(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return localDate(date)
}

export function shortDate(value) {
  return value ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })
    .format(new Date(value + 'T12:00:00')) : '—'
}

export function daysBetween(start, end) {
  return Math.round((Date.parse(end + 'T00:00:00Z') - Date.parse(start + 'T00:00:00Z')) / 86400000)
}

export function followUp(row, today = localDate()) {
  const activity = Math.max(Date.parse(row.stage_changed_at), Date.parse(row.last_followed_up_at) || 0)
  return row.stage === 'Applied' && daysBetween(localDate(new Date(activity)), today) >= 10
}

export function deadlineBadge(row, today) {
  if (!row.deadline || row.stage !== 'Saved') return null
  const days = daysBetween(today, row.deadline)
  return { tone: days < 0 ? 'late' : days <= 3 ? 'soon' : '', text:
    (days < 0 ? 'Deadline passed · ' : 'Apply by ') + shortDate(row.deadline) }
}

export function normalizeLink(value = '') {
  const input = value.trim()
  if (!input) return ''
  const invalid = () => new Error('Enter a valid http or https posting link.')
  if (/[\s\\\u0000-\u001f\u007f]/.test(input) || input.startsWith('//')) throw invalid()
  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(input)
  const domainWithPort = /^[\w.-]+\.\w+:\d+(?:[/?#]|$)/i.test(input)
  if (hasScheme && !domainWithPort && !/^https?:\/\/[^/]/i.test(input)) throw invalid()
  let url
  try {
    url = new URL(/^https?:\/\//i.test(input) ? input : 'https://' + input)
  } catch { throw invalid() }
  if (!['https:', 'http:'].includes(url.protocol) || !url.hostname || url.username || url.password) throw invalid()
  if (!hasScheme && !url.hostname.includes('.') && url.hostname !== 'localhost') throw invalid()
  return url.href
}

export function quickFields(value) {
  const input = value.trim()
  if (!input) throw new Error('Paste a posting link or enter a company name.')
  if (!/^[a-z][a-z\d+.-]*:/i.test(input) && !/^\/\//.test(input) &&
      !/^[^\s/]+\.[a-z]{2,}(?:[:/?#]|$)/i.test(input)) return { company: input }
  const link = normalizeLink(input)
  const host = new URL(link).hostname.replace(/^www\./, '')
  const labels = host.split('.')
  const offset = /\.(com|org|net|co)\.[a-z]{2}$/i.test(host) ? 3 : 2
  const company = (labels.at(-offset) || labels[0]).replace(/-/g, ' ')
  return { link, company: company.charAt(0).toUpperCase() + company.slice(1) }
}

export const formFields = ['company','role','stage','type','link','notes','applied_date','deadline','location','pay']
export function blank(stage = 'Applied') {
  return { company: '', role: '', stage, type: 'Job', link: '', notes: '', applied_date:
    stage === 'Saved' ? '' : localDate(), deadline: '', location: '', pay: '' }
}

export function cleanForm(input) {
  const row = Object.fromEntries(formFields.map(key => [key, String(input[key] ?? '').trim()]))
  if (!row.company) throw new Error('Enter a company or organization.')
  if (!STAGES.includes(row.stage) || !TYPES.includes(row.type)) throw new Error('Choose a listed stage and type.')
  row.link = normalizeLink(row.link)
  for (const key of ['deadline', 'applied_date']) {
    const date = row[key]
    if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) ||
      new Date(date).toISOString().slice(0, 10) !== date)) throw new Error('Enter a valid calendar date.')
  }
  return row
}

function rowId() {
  if (crypto.randomUUID) return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 15) | 64
  bytes[8] = (bytes[8] & 63) | 128
  const hex = Array.from(bytes, n => n.toString(16).padStart(2, '0')).join('')
  return [hex.slice(0,8), hex.slice(8,12), hex.slice(12,16), hex.slice(16,20), hex.slice(20)].join('-')
}

export function createRow(fields, now = new Date()) {
  const clean = cleanForm({ ...blank(fields.stage), ...fields })
  if (clean.stage !== 'Saved' && !clean.applied_date) clean.applied_date = localDate(now)
  return { ...clean, id: rowId(), pinned: false, is_sample: false,
    created_at: now.toISOString(), stage_changed_at: now.toISOString(), updated_at: now.toISOString() }
}

export function updateRow(old, patch, now = new Date()) {
  const next = { ...old, ...cleanForm({ ...old, ...patch }), updated_at: now.toISOString() }
  if ('pinned' in patch) next.pinned = Boolean(patch.pinned)
  if (old.stage !== next.stage) {
    next.stage_changed_at = next.updated_at
    if (old.stage === 'Saved') next.applied_date = localDate(now)
  }
  return next
}

export function sortedRows(rows) {
  return [...rows].sort((a, b) => Number(b.pinned) - Number(a.pinned) ||
    (b.applied_date || b.created_at.slice(0, 10)).localeCompare(a.applied_date || a.created_at.slice(0, 10)) ||
    b.created_at.localeCompare(a.created_at) || a.id.localeCompare(b.id))
}
````

## `src/main.jsx`

````
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(error => console.warn('Offline support unavailable.', error))
  })
}
````

## `src/pages/Account.jsx`

````
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import * as api from '../lib/api.js'
import { readDeviceImport } from '../lib/localWorkspace.js'

export default function Account({ user }) {
  const [enabled,setEnabled] = useState(false)
  const [ready,setReady] = useState(false)
  const [busy,setBusy] = useState(false)
  const [confirm,setConfirm] = useState(false)
  const { state } = useLocation()
  const [message,setMessage] = useState(state?.message || '')
  const [error,setError] = useState('')
  const navigate = useNavigate()
  const [{ rows: deviceRows, error: importError }] = useState(readDeviceImport)
  useEffect(() => {
    let active = true
    api.reminderSetting(user.id).then(row => {
      if (active) { setEnabled(Boolean(row?.enabled)); setReady(true) }
    }).catch(e => { if (active) setError(e.message) })
    return () => { active = false }
  },[user.id])
  async function run(fn) {
    if (busy) return
    setBusy(true); setError(''); setMessage('')
    try { await fn() } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  return <div className="account embedded-account">
    <section className="account-panel"><h2>Account details</h2><p>{user.email}</p>
      <section><h2>Email reminders</h2><p>Get one daily email when a Saved deadline is within three days or an Applied item needs a follow-up.</p>
        <label className="check"><input type="checkbox" checked={enabled} disabled={!ready || busy}
          onChange={e => { const value = e.target.checked; run(async () => {
            setEnabled(value)
            try { await api.setReminders(user.id,value); setMessage('Reminder preference saved.') }
            catch (error) { setEnabled(!value); throw error }
          }) }} />Daily reminders</label></section>
      {deviceRows.length > 0 && <section><h2>Import previous applications</h2>
        <p>{deviceRows.length} personal {deviceRows.length === 1 ? 'application' : 'applications'} saved by a previous version in this browser.</p>
        <button className="btn ghost" disabled={busy} onClick={() => {
          if (!confirm) { setConfirm(true); return }
          run(async () => {
            const count = await api.importRows(user.id,deviceRows)
            setMessage(count + ' added to this account. Your device copy is still available.'); setConfirm(false)
          })
        }}>{confirm ? 'Confirm import to ' + user.email : 'Import device applications'}</button>
      </section>}
      {importError && <p role="status">{importError}</p>}
      {message && <p role="status" className="notice-success">{message}</p>}
      {error && <p role="alert" className="error">{error}</p>}
      <div className="account-controls"><Link to="/reset-password">Change password</Link>
        <button className="btn ghost" disabled={busy} onClick={() => run(async () => { await api.signOut(); navigate('/login',{replace:true}) })}>Sign out</button></div>
    </section></div>
}
````

## `src/pages/AuthCallback.jsx`

````
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { finishAuth } from '../lib/api.js'
import Brand from '../components/Brand.jsx'

export default function AuthCallback({ recovery }) {
  const [href] = useState(() => window.location.href)
  const [approved, setApproved] = useState(() => !new URL(href).searchParams.has('token_hash'))
  const [error, setError] = useState('')
  const pending = useRef(null)
  const navigate = useNavigate()
  useEffect(() => {
    if (!approved) return
    let active = true
    // Both Strict Mode effects observe the same one-use credential exchange.
    pending.current ??= finishAuth(href)
    pending.current.then(() => {
      if (active) navigate(recovery ? '/reset-password' : '/dashboard', { replace: true })
    }).catch(e => {
      if (active) setError(e.code === 'bad_code_verifier' || /code verifier|both auth code/i.test(e.message)
        ? 'This link needs the browser where you started. For email confirmation, you can also enter the code from your email.' : e.message)
    })
    return () => { active = false }
  }, [approved, href, navigate, recovery])
  const action = recovery ? 'Continue to reset password' : 'Confirm email'
  return <main className="account callback-panel"><Brand/><section className="account-panel">
    <h1>{error ? 'Check your link' : approved ? 'Signing you in' : recovery ? 'Reset your password' : 'Confirm your email'}</h1>
    {error ? <><p role="alert">{error}</p><div className="sent-actions">
      <Link className="btn" replace to={recovery ? '/forgot-password' : '/login'}>{recovery ? 'Request a reset email' : 'Back to login'}</Link>
      {!recovery && <Link className="back-login" replace to="/confirm-email">Enter a code or resend confirmation</Link>}
    </div></> : approved ? <p role="status">Verifying your session…</p> :
      <><p>Continue to verify this request for your Roleward account.</p><button className="btn" onClick={() => setApproved(true)}>{action}</button></>}
  </section></main>
}
````

## `src/pages/Dashboard.jsx`

````
import { STAGES, stageStyle, shortDate, localDate } from '../lib/utils.js'
import Icon from '../components/Icon.jsx'
import {ActionRow} from '../components/Agenda.jsx'

export default function Dashboard({rows,items,openStage,openAgenda,edit,onSamples,onNew}){
  const recent = [...rows].sort((a,b)=>b.updated_at.localeCompare(a.updated_at)).slice(0,4)
  const counts = STAGES.map(stage=>rows.filter(r=>r.stage===stage).length)
  return <div className="dashboard-grid">
    <section className="pipeline-summary"><div className="summary-head"><h2>Your pipeline</h2>
      <button onClick={()=>openStage('')} aria-label="View all applications"><Icon name="external"/></button></div>
      <div className="pipeline-total"><strong>{rows.length}</strong><span>tracked {rows.length===1?'opportunity':'opportunities'}</span></div>
      <div className="distribution" aria-hidden="true">{STAGES.map((s,i)=><i key={s} style={{...stageStyle(s),flex:counts[i]||0}}/>)}</div>
      <div className="stage-legend">{STAGES.map((s,i)=><button key={s} style={stageStyle(s)} onClick={()=>openStage(s)}
        aria-label={'View '+s+' applications'}><span><i/>{s}</span><b>{counts[i]}</b></button>)}</div>
    </section>
    <section className="surface next-up"><div className="section-top"><h2>Needs attention</h2><button className="text-action" onClick={openAgenda}>View all <Icon name="arrow" size={14}/></button></div>
      {items.length ? items.slice(0,3).map(item=><ActionRow key={item.row.id} item={item} edit={edit} compact/>) :
        <div className="quiet"><Icon name="check"/><h3>All caught up</h3><p>Deadlines and follow-ups will show up here when they’re due.</p></div>}
    </section>
    <section className="surface recent"><div className="section-top"><h2>Recently updated</h2>
      {!!rows.length && <button className="text-action" onClick={()=>openStage('')}>Applications <Icon name="arrow" size={14}/></button>}</div>
      {recent.length ? recent.map(row=><button className="recent-row" key={row.id} onClick={()=>edit(row)} style={stageStyle(row.stage)}>
        <span className="company-monogram">{row.company.trim().slice(0,1).toUpperCase()}</span>
        <span className="recent-name"><b>{row.company}</b><small>{row.role || row.type}</small></span>
        <span className="stage-label"><i/>{row.stage}</span>
        <span className="recent-date">{shortDate(localDate(new Date(row.updated_at)))}</span><Icon name="arrow" size={14}/>
      </button>) : <div className="first-entry"><h3>Start with your first opportunity</h3>
        <p>Log an application, or explore the dashboard with sample entries.</p>
        <div><button className="btn ghost" onClick={onNew}>Log an application</button><button className="text-action" onClick={onSamples}>Try with sample data</button></div>
      </div>}
    </section>
  </div>
}
````

## `src/pages/Login.jsx`

````
import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import * as api from '../lib/api.js'
import EmailVerification from '../components/EmailVerification.jsx'
import Brand from '../components/Brand.jsx'
import Icon from '../components/Icon.jsx'

const titles = { confirm:'Confirm your email', login:'Welcome back', signup:'Create your account', forgot:'Reset your password', reset:'Choose a new password' }
const captions = { login:'Sign in to your application workspace.',signup:'Keep your applications and next steps together across devices.',
  forgot:'Enter the email you used to create your account.',reset:'Use at least eight characters.' }

function PasswordField({ label, name, existing=false }) {
  const [visible,setVisible] = useState(false)
  return <label className="auth-field"><span>{label}</span><span className="password-wrap">
    <input name={name} type={visible?'text':'password'} autoComplete={existing?'current-password':'new-password'}
      minLength={existing?1:8} required aria-label={label}/>
    <button type="button" onClick={()=>setVisible(!visible)} aria-label={(visible?'Hide ':'Show ')+label.toLowerCase()}
      aria-pressed={visible}><Icon name="eye" size={17}/></button></span></label>
}

export default function Login({ mode='login', user, authError }) {
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [sent,setSent]=useState('')
  const [justSent,setJustSent]=useState(false)
  const lock=useRef(false)
  const navigate=useNavigate()
  const authEntry=mode==='login'||mode==='signup'
  const recovery=mode==='reset'
  useEffect(()=>{document.title=titles[mode]+' · Roleward™'},[mode])
  if (user && (authEntry || mode==='confirm')) return <Navigate replace to="/dashboard"/>
  async function run(fn){
    if(lock.current) return
    lock.current=true; setBusy(true); setError('')
    try { await fn() } catch(e){ setError(e.message) }
    finally { lock.current=false; setBusy(false) }
  }
  function submit(event){
    event.preventDefault()
    const fields=new FormData(event.currentTarget)
    const email=String(fields.get('email')||'').trim()
    const password=String(fields.get('password')||'')
    run(async()=>{
      if ((mode==='signup'||recovery) && password!==fields.get('confirm')) throw Error('Your passwords don’t match.')
      if (!api.cloudEnabled) throw Error(api.configIssue || 'Account services are unavailable. Please try again later.')
      if(mode==='signup'){
        const data=await api.signUp(email,password)
        if(data.session) navigate('/dashboard',{replace:true})
        else { setJustSent(true); setSent(email) }
      } else if(mode==='forgot'){ await api.requestReset(email); setJustSent(true); setSent(email) }
      else if(recovery){ await api.changePassword(password); navigate('/account',{replace:true,state:{message:'Password updated.'}}) }
      else {
        try { await api.signIn(email,password) }
        catch (err) {
          if (err.code !== 'email_not_confirmed') throw err
          setSent(email)
          return
        }
        navigate('/dashboard',{replace:true})
      }
    })
  }
  return <main className="auth-layout">
    <aside className="auth-art"><Brand/>
      <div className="art-content"><h2>Application<br/>tracker<span>.</span></h2>
        <p>Track your applications, deadlines, and next steps.</p>
        <div className="paper-stack" aria-hidden="true">{[['Saved','saved'],['Applied','applied'],['Interviewing','interviewing']].map(([label,stage],i)=>
          <div className={'paper paper-'+i} key={stage} style={{'--stage':'var(--'+stage+')'}}><div><i/>{label}</div><span/><span/></div>)}</div>
      </div>
      <span className="maker">Designed by Lycos Blanza</span>
    </aside>
    <section className="auth-form-area"><div className="auth-form-card">
      <div className="mobile-brand"><Brand/></div>
      {authEntry && !sent && <nav className="auth-tabs" aria-label="Account access">
        <Link to="/login" aria-current={mode==='login'?'page':undefined}>Log in</Link>
        <Link to="/signup" aria-current={mode==='signup'?'page':undefined}>Sign up</Link></nav>}
      <h1>{sent ? 'Check your email' : titles[mode]}</h1>
      <p className="auth-caption">{sent || mode==='confirm' ?
        'Open the link in your latest email, or enter the code below.' : captions[mode]}</p>
      {sent || mode==='confirm' ? <>
        <EmailVerification initialEmail={sent} recovery={mode==='forgot'} justSent={justSent}/>
        <Link className="back-login" to="/login" onClick={()=>setSent('')}>Back to login</Link></> :
      recovery && !user ? <Link className="btn" to="/forgot-password">Request a fresh reset link</Link> :
      <form onSubmit={submit} className="auth-form"><fieldset disabled={busy}>
        {!recovery && <label className="auth-field"><span>Email address</span><input name="email" type="email" autoComplete="email" required placeholder="you@example.com"/></label>}
        {mode!=='forgot' && <PasswordField label={recovery?'New password':'Password'} name="password" existing={mode==='login'}/>}
        {(recovery||mode==='signup') && <><p className="field-help">At least 8 characters.</p><PasswordField label="Confirm password" name="confirm"/></>}
        {mode==='login' && <Link className="forgot-link" to="/forgot-password">Forgot password?</Link>}
        <button className="btn auth-primary">{busy?'Please wait…':{login:'Log in',signup:'Create account',forgot:'Send reset link',reset:'Save password'}[mode]}<Icon name="arrow" size={16}/></button>
        {authEntry && api.cloudEnabled && <button className="btn ghost google-btn" type="button" onClick={()=>run(api.google)}>Continue with Google</button>}
      </fieldset></form>}
      {(error||authError||api.configIssue) && <p role="alert" className="error">{error||authError||api.configIssue}</p>}
      {!sent && !authEntry && mode!=='confirm' && <Link className="back-login" to="/login">← Back to login</Link>}
      {!sent && mode==='login' && <Link className="back-login" to="/confirm-email">Need to confirm your email?</Link>}
    </div></section>
  </main>
}
````

## `src/pages/Tracker.jsx`

````
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApplications } from '../hooks/useApplications.js'
import { blank, followUp, localDate, quickFields, sortedRows } from '../lib/utils.js'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import WorkspaceNav, { tabs } from '../components/WorkspaceNav.jsx'
import Dashboard from './Dashboard.jsx'
import Account from './Account.jsx'
import Agenda from '../components/Agenda.jsx'
import { nextActions } from '../lib/agenda.js'
import Board from '../components/Board.jsx'
import ListView from '../components/ListView.jsx'
import StageTiles from '../components/StageTiles.jsx'
import QuickAdd from '../components/QuickAdd.jsx'
import FilterBar from '../components/FilterBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Icon from '../components/Icon.jsx'
import Toast from '../components/Toast.jsx'
import EditorSheet from '../components/EditorSheet.jsx'
import MoveSheet from '../components/MoveSheet.jsx'

export default function Tracker({ theme, user, tab }) {
  const navigate = useNavigate()
  const focusAfterNav = useRef(false)
  const pathFor = useCallback(section => '/' + section,[])
  useEffect(() => {
    document.title = tabs[tab] + ' · Roleward™'
    window.scrollTo(0,0)
    if (tab==='applications' && focusAfterNav.current) {
      focusAfterNav.current=false
      const field=search.current || quick.current?.querySelector('input')
      field?.focus()
    }
  },[tab])
  const { rows, error, api, loading, pending, status } = useApplications(user.id)
  const [stage,setStage] = useState('')
  const [type,setType] = useState('')
  const [query,setQuery] = useState('')
  const [due,setDue] = useState(false)
  const [view,setView] = useState(() => {
    try { return localStorage.getItem('application-tracker.view') === 'list' ? 'list' : 'board' } catch { return 'board' }
  })
  const [editor,setEditor] = useState(null)
  const [moveId,setMoveId] = useState(null)
  const [notice,setNotice] = useState(null)
  const [highlight,setHighlight] = useState(null)
  const [today,setToday] = useState(localDate)
  const search = useRef(null)
  const quick = useRef(null)
  const dismiss = useCallback(() => setNotice(null),[])
  const openNew = () => setEditor(blank('Applied'))
  useEffect(() => {
    const update = () => setToday(localDate())
    const timer = setInterval(update, 30000)
    window.addEventListener('focus',update)
    return () => {clearInterval(timer); window.removeEventListener('focus',update)}
  },[])
  useEffect(() => {
    const keydown = e => {
      if (editor || moveId || e.isComposing || e.repeat || e.altKey || e.metaKey || e.ctrlKey ||
        e.target.closest('input,textarea,select,[contenteditable="true"]')) return
      if (e.key === '/') {
        e.preventDefault()
        if (tab !== 'applications') { focusAfterNav.current=true; navigate(pathFor('applications')) }
        else (search.current || quick.current?.querySelector('input'))?.focus()
      }
      if (e.key === 'n') { e.preventDefault(); setEditor(blank('Applied')) }
    }
    window.addEventListener('keydown',keydown)
    return () => window.removeEventListener('keydown',keydown)
  },[editor,moveId,tab,navigate,pathFor])
  useEffect(() => {
    if (!highlight) return
    const timeout = setTimeout(() => setHighlight(null),1200)
    return () => clearTimeout(timeout)
  },[highlight])
  function reset() { setStage(''); setType(''); setQuery(''); setDue(false) }
  function showFailure(err) { setNotice({text:err.message,error:true}) }
  async function move(id, target) {
    await api.update(id,{stage:target})
    setHighlight({id})
    setNotice({text:'Moved to ' + target + '.', action:'Show stage', onAction:() => {
      openStage(target); setNotice(null)
    }})
  }
  const actions = { highlight:highlight?.id, edit:setEditor, pick:row => setMoveId(row.id),
    move:(id,target) => move(id,target).catch(showFailure),
    apply:row => move(row.id,'Applied').catch(showFailure),
    follow:row => api.recordFollowUp(row.id,row.updated_at).then(() => {
      setHighlight({id:row.id}); setNotice({text:'Follow-up recorded for ' + row.company + '.'})
    }).catch(showFailure),
    pin:row => api.update(row.id,{pinned:!row.pinned}).catch(showFailure) }
  const term = query.trim().toLocaleLowerCase()
  const visible = sortedRows(rows.filter(row => (!stage || row.stage === stage) && (!type || row.type === type) &&
    (!due || followUp(row,today)) && [row.company,row.role,row.notes,row.location].join(' ').toLocaleLowerCase().includes(term)))
  const moving = rows.find(row => row.id === moveId)
  const items = nextActions(rows,today)
  const samples = rows.some(row=>row.is_sample)
  function openStage(value) { reset(); setStage(value); navigate(pathFor('applications')) }
  const trySamples = () => api.addSamples().then(reset).catch(showFailure)
  const clearSamples = () => api.clearSamples().then(() => { reset(); setNotice({text:'Sample data cleared.'}) }).catch(showFailure)
  if (loading) return <LoadingSkeleton />
  return <div className="workspace"><WorkspaceNav active={tab} pathFor={pathFor} user={user} count={items.length} theme={theme}/>
    <main className="workspace-main"><header className="page-head"><div>
      <p className="page-date">{new Date(today+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</p>
      <h1>{tabs[tab]}</h1></div>
      {tab!=='account' && <button className="btn global-add" onClick={openNew}><Icon name="plus" size={17}/>Log application</button>}
    </header>
    {user && <div className="sync-line" role="status"><i className={pending ? 'working' : status === 'Live' ? 'live' : ''}/>
      {pending ? 'Saving changes…' : error ? 'Sync needs attention' : status === 'Live' ? 'Live sync' : status}</div>}
    {error && <div className="note" role="alert">{error}<button onClick={api.refresh}>Retry</button></div>}
    <div className="page-content" key={tab}>
    {tab==='dashboard' && <Dashboard rows={rows} items={items} openStage={openStage} openAgenda={()=>navigate(pathFor('follow-ups'))}
      edit={setEditor} onSamples={trySamples} onNew={openNew}/>}
    {tab==='follow-ups' && <Agenda items={items} actions={actions}/>}
    {tab==='account' && <div className="settings-stack"><Account user={user}/>
      <section className="surface settings-panel"><h2>Appearance</h2><button className="soft-button" onClick={theme.cycle}>Theme · {theme.mode}</button></section>
      {(samples || !rows.length) && <section className="surface settings-panel"><h2>Sample applications</h2>
        <button className="soft-button" onClick={samples ? clearSamples : trySamples}>{samples?'Clear sample data':'Try with sample data'}</button></section>}</div>}
    {tab==='applications' && <>
    <StageTiles rows={rows} selected={stage} onChange={setStage} />
    <div ref={quick}><QuickAdd onQuick={async value => {
      const row = await api.add({ ...quickFields(value), stage:'Saved' })
      reset(); setEditor(row); setHighlight({id:row.id}); setNotice({text:'Saved for later.'})
    }} /></div>
    {rows.length > 0 && <FilterBar query={query} setQuery={setQuery} type={type} setType={setType} due={due} setDue={setDue}
      count={rows.filter(row => followUp(row,today)).length} view={view} searchRef={search} setView={v => {
        setView(v); try { localStorage.setItem('application-tracker.view',v) } catch { /* Session preference remains active. */ }
      }} />}
    {(stage || type || due || term) && <div className="active-filters"><span>{visible.length} of {rows.length} shown</span>
      <button onClick={reset}>Clear filters</button></div>}
    {samples && <div className="sample-line"><span>Includes sample applications</span><button onClick={clearSamples}>Clear sample data</button></div>}
    {error && !rows.length ? null : !visible.length ? <EmptyState filtered={rows.length > 0} onNew={openNew} onReset={reset}
      onSamples={() => api.addSamples().then(reset).catch(showFailure)} /> :
      view === 'board' ? <Board rows={visible} stage={stage} actions={actions} today={today}/> :
      <ListView rows={visible} actions={actions} today={today}/>}
    </>}</div>
    {tab!=='account' && <button className="fab" aria-label="Log application" onClick={openNew}><Icon name="plus" size={24}/></button>}
    {editor && <EditorSheet key={editor.id || 'new'} initial={editor} onClose={() => setEditor(null)}
      onSave={async (id,fields) => {
        const stored = id ? await api.update(id,fields,editor.updated_at) : await api.add(fields)
        if (!id) reset()
        setHighlight({id:stored.id})
        setNotice({text:id ? 'Changes saved.' : 'Application logged.'})
      }} onDelete={async id => { await api.remove(id,editor.updated_at); setNotice({text:'Application deleted.'}) }} />}
    {moving && <MoveSheet row={moving} onMove={move} onClose={() => setMoveId(null)} />}
    <Toast notice={notice} onDismiss={dismiss}/>
  </main></div>
}
````

## `src/styles/auth.css`

````
.account { max-width: 480px; margin: 7vh auto; padding: 12px 16px; }
.back, .account-links a { display: inline-flex; align-items: center; font-size: 13px; }
.account-panel { margin-top: 8px; padding: 22px; border: 1px solid var(--line); border-top: 4px solid var(--acc); background: var(--panel); border-radius: 4px; }
.account-panel h1 { font-size: 40px; line-height: 1; margin: 0; }
.account-notice { color: var(--mute); }
.account fieldset { margin: 0; padding: 0; border: 0; }
.account fieldset .btn { width: 100%; margin: 5px 0; opacity: .55; }
.account-links { display: flex; justify-content: space-between; }
.local-action { width: 100%; margin-top: 12px; }

.account fieldset:not(:disabled) .btn:enabled { opacity: 1; }
.account-panel { animation: enter .22s ease-out; }
.account-panel section { border-top: 1px solid var(--line); padding-block: 10px; }
.account h2 { margin: 0; font-size: 22px; }
.account .check { display: flex; align-items: center; gap: 10px; cursor: pointer; min-height: 44px; }
.account .check input { width: 19px; height: 19px; min-height: 0; accent-color: var(--acc); margin: 0; }
.account-controls { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.account-controls a { display: inline-flex; align-items: center; }
.account-panel .back { display: flex; }
.notice-success { padding: 10px; border-left: 3px solid var(--offer); background: var(--p2); }
.discard-panel { padding: 4px 16px 16px; }
````

## `src/styles/base.css`

````
* { box-sizing: border-box; }
html { min-height: 100%; background: var(--bg); scroll-padding-top: env(safe-area-inset-top); }
body { margin: 0; color: var(--ink); font: 14px/1.5 var(--body); min-height: 100dvh; isolation: isolate; }
body::before {
  content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background-image: radial-gradient(60% 40% at 0 0,color-mix(in srgb,var(--acc) 16%,transparent),transparent),
    linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);
  background-size: auto,44px 44px,44px 44px; mask-image: linear-gradient(#000 35%,transparent);
}
button, input, select, textarea { font: inherit; color: inherit; }
button, select, summary { cursor: pointer; }
button, a, summary, select, input { min-height: 44px; }
button, a { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
button { transition: background .15s, border-color .15s, transform .15s; }
button:active:not(:disabled) { transform: translateY(1px); }
button:disabled { cursor: default; }
button:focus-visible, a:focus-visible, summary:focus-visible, select:focus-visible, input:focus-visible, textarea:focus-visible {
  outline: 2px solid var(--acc); outline-offset: 2px;
}
input, textarea, select {
  background: var(--panel); border: 1px solid var(--line); border-radius: 4px;
  padding: 9px 12px; min-width: 0; max-width: 100%;
}
input::placeholder, textarea::placeholder { color: var(--mute); }
option { color: var(--ink); background: var(--panel); }
a { color: var(--acc); }
h1, h2 { font-family: var(--hd); text-transform: uppercase; }
button svg, a svg { flex: none; }
.btn, .icon-button, .device-link, .views button, .chip, .posting, .apply, .move, .fab {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
}
.btn {
  border: 1px solid var(--acc); border-radius: 4px; background: var(--acc); color: var(--on-accent);
  padding: 9px 17px; text-transform: uppercase; letter-spacing: .075em; font: 700 16px var(--hd);
  text-decoration: none;
}
.btn.ghost, .icon-button { color: var(--ink); background: var(--panel); border: 1px solid var(--line); border-radius: 4px; }
.icon-button { width: 44px; min-width: 44px; padding: 0; }
.btn.ghost:hover, .icon-button:hover { background: var(--p2); border-color: var(--mute); }
.btn:not(.ghost):hover { filter: brightness(1.06); }
.error { color: var(--red-ink); }
@keyframes enter { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
}
````

## `src/styles/board.css`

````
.stage-nav { display: flex; position: sticky; top: env(safe-area-inset-top,0px); z-index: 2; background: var(--bg); overflow-x: auto; scrollbar-width: none; margin: 0 0 8px; border-bottom: 1px solid var(--line); }
.stage-nav button { flex: 1; min-width: 44px; padding: 0 3px; border: 0; border-bottom: 3px solid transparent; color: var(--mute); font: 600 13px var(--hd); text-transform: uppercase; background: transparent; }
.stage-nav .selected { border-color: var(--stage); color: var(--ink); }
.board { position: relative; display: flex; gap: 12px; overflow-x: auto; align-items: flex-start; scroll-snap-type: x mandatory; padding: 2px 2px 14px; scrollbar-width: thin; }
.column { flex: 1 0 85%; min-width: 0; scroll-snap-align: start; border: 1px solid var(--line); border-top: 3px solid var(--stage); border-radius: 4px; background: var(--p2); padding: 10px; transition: background .15s; }
.column.over { background: color-mix(in srgb,var(--stage) 14%,var(--p2)); outline: 1px dashed var(--stage); }
.column h2 { display: flex; align-items: center; justify-content: space-between; margin: 0; padding: 1px 4px 10px; font: 700 20px var(--hd); letter-spacing: .06em; }
.column h2 small { font: 600 12px var(--mono); color: var(--mute); }
.cards { display: grid; gap: 8px; }
.dropzone { padding: 22px 0; text-align: center; border: 1px dashed var(--line); color: var(--mute); font: 11px var(--mono); letter-spacing: .1em; text-transform: uppercase; }
.card, .drag-preview { min-width: 0; background: var(--panel); border: 1px solid var(--line); border-left: 4px solid var(--stage); border-radius: 4px; padding: 4px 10px 0; overflow-wrap: anywhere; }
.card { animation: enter .22s both; cursor: pointer; }
.card:hover { border-color: var(--stage); }
.card.dragging { opacity: .35; }
.card-head { display: flex; justify-content: space-between; }
.company { background: none; border: none; text-align: left; padding: 0; font-weight: 600; overflow-wrap: anywhere; }
.priority.icon-button, .handle.icon-button { color: var(--mute); background: transparent; border: 0; }
.priority.active, .priority:hover { color: var(--warn-ink); }
.position { display: block; margin: -2px 0 9px; font-size: 12.5px; color: var(--mute); }
.tags { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
.tags span { padding: 2px 5px; color: var(--mute); border: 1px solid var(--line); border-radius: 3px; background: var(--p2); font: 10px/1.4 var(--mono); text-transform: uppercase; }
.tags .soon, .row-nudge.soon { color: var(--warn-ink); border-color: var(--gold); }
.tags .late, .row-nudge.late { color: var(--red-ink); border-color: var(--red); }
.posting { justify-content: flex-start; font: 11px var(--mono); text-decoration: none; min-width: 44px; max-width: 100%; overflow-wrap: anywhere; }
.posting:hover, .move:hover, .company:hover { text-decoration: underline; }
.card-notes { margin: 6px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color: var(--mute); font-size: 12px; }
.apply, .move { background: transparent; border: 0; color: var(--acc); padding: 0; font: 600 13px var(--hd); letter-spacing: .065em; text-transform: uppercase; }
.card-foot { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--line); margin-top: 6px; }
.move { color: var(--mute); }
.handle { cursor: grab; touch-action: manipulation; user-select: none; -webkit-touch-callout: none; }
.drag-preview { padding: 14px; box-shadow: 0 8px 22px #0003; }
.drag-preview small { display: block; color: var(--mute); }
@media (min-width: 700px) {
  .stage-nav { display: none; }
  .board { scroll-snap-type: x proximity; }
  .column { flex-basis: 225px; max-height: 72vh; display: flex; flex-direction: column; }
  .cards { overflow-y: auto; }
}

.board, .list-wrap { animation: enter .2s ease-out both; }
.just-saved { animation: arrival 1.05s ease-out; }
.priority.active svg { animation: star-pop .25s ease-out; }
@keyframes arrival {
  from { background-color: color-mix(in srgb,var(--stage) 26%,var(--panel)); box-shadow: inset 0 0 0 1px var(--stage); }
  to { background-color: var(--panel); box-shadow: inset 0 0 0 1px transparent; }
}
@keyframes star-pop { 45% { scale: 1.22; } }
@media (prefers-reduced-motion: reduce) {
  .just-saved { outline: 1px solid var(--stage); outline-offset: -1px; }
  .sync-line .working { animation: none; }
}
````

## `src/styles/list.css`

````
.list-wrap { background: var(--panel); border: 1px solid var(--line); border-radius: 4px; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th { padding: 11px; background: var(--p2); color: var(--mute); font: 600 10px var(--mono); letter-spacing: .1em; text-transform: uppercase; }
td { padding: 4px 10px; border-top: 1px solid var(--line); overflow-wrap: anywhere; }
.stage-select { border-color: var(--stage); background: color-mix(in srgb,var(--stage) 12%,var(--panel)); font: 11px var(--mono); }
.row-nudge { display: block; color: var(--warn-ink); }
@media (max-width: 699px) {
  .list-wrap { border: 0; background: none; }
  table,tbody { display: block; }
  thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  tr { display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: center; gap: 0 8px; padding: 6px 12px; border: 1px solid var(--line); border-left: 4px solid var(--stage); background: var(--panel); margin-bottom: 8px; border-radius: 4px; }
  td { padding: 2px 0; border: 0; min-width: 0; }
  td[data-label="Company"] { grid-area: 1/1; }
  td[data-label="Priority"] { grid-area: 1/2; justify-self: end; }
  td[data-label="Role"] { grid-area: 2/1; }
  td[data-label="Type"] { grid-area: 2/2; justify-self: end; color: var(--mute); }
  td[data-label="Stage"] { grid-area: 3/2; justify-self: end; }
  td[data-label="Date"] { grid-area: 3/1; color: var(--mute); }
  td[data-label="Link"] { grid-column: 1/-1; }
}
@media (min-width:700px) { .list-wrap { overflow-x: auto; } table { min-width: 680px; } }
````

## `src/styles/sheets.css`

````
.sheet { position: fixed; inset: auto 0 0; margin: 0 auto; padding: 0; width: 100%; max-width: 540px; max-height: 94dvh; overflow: auto; overscroll-behavior: contain; background: var(--panel); color: var(--ink); border: 1px solid var(--line); border-top: 4px solid var(--acc); border-radius: 6px 6px 0 0; }
.sheet[open] { animation: enter .2s both; }
.sheet::backdrop { background: rgba(5,7,10,.68); }
.sheet-head, .sheet-actions { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--panel); }
.sheet-head { position: sticky; top: 0; z-index: 1; justify-content: space-between; border-bottom: 1px solid var(--line); }
.sheet h2 { margin: 0; font-size: 28px; line-height: 1.15; overflow-wrap: anywhere; }
.sheet-body { padding: 15px 16px 4px; }
.sheet label, .account label { display: block; margin-bottom: 12px; min-width: 0; font: 600 10.5px/1.5 var(--mono); letter-spacing: .1em; text-transform: uppercase; color: var(--mute); }
.sheet input, .sheet select, .sheet textarea, .account input { display: block; width: 100%; margin-top: 4px; background: var(--p2); font: 400 16px var(--body); color: var(--ink); letter-spacing: normal; text-transform: none; }
.sheet textarea { resize: vertical; }
.fields-pair { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px; }
.sheet details { border-top: 1px solid var(--line); }
.sheet summary { padding: 14px 0; font: 600 11px var(--mono); letter-spacing: .08em; text-transform: uppercase; color: var(--acc); }
.sheet-actions { position: sticky; bottom: 0; padding-bottom: max(12px,env(safe-area-inset-bottom)); border-top: 1px solid var(--line); }
.push { margin-left: auto; }
.btn.ghost.danger { color: var(--red-ink); }
.stage-options { display: grid; gap: 7px; padding-bottom: max(18px,env(safe-area-inset-bottom)); }
.stage-option { display: flex; align-items: center; gap: 12px; border: 1px solid var(--line); border-left: 4px solid var(--stage); background: var(--p2); border-radius: 3px; text-align: left; font: 600 18px var(--hd); padding: 5px 14px; }
.stage-option:disabled { background: var(--panel); }
.stage-option svg { margin-left: auto; }
@media (min-width: 700px) {
  .sheet { inset: 0; margin: auto; border-radius: 5px; max-height: 90dvh; }
  .sheet-head, .sheet-actions { padding-inline: 22px; }
  .sheet-body { padding-inline: 22px; }
  .sheet input, .sheet select, .sheet textarea { font-size: 14px; }
}
````

## `src/styles/tokens.css`

````
@font-face { font-family: "Barlow Condensed"; font-weight: 600; font-display: swap; src: url("/fonts/barlow-condensed-600.woff2") format("woff2"); }
@font-face { font-family: "Barlow Condensed"; font-weight: 700; font-display: swap; src: url("/fonts/barlow-condensed-700.woff2") format("woff2"); }
@font-face { font-family: Inter; font-weight: 400; font-display: swap; src: url("/fonts/inter-400.woff2") format("woff2"); }
@font-face { font-family: Inter; font-weight: 500; font-display: swap; src: url("/fonts/inter-500.woff2") format("woff2"); }
@font-face { font-family: Inter; font-weight: 600; font-display: swap; src: url("/fonts/inter-600.woff2") format("woff2"); }

:root {
  color-scheme: light;
  --bg: #e8ebee; --panel: #fff; --p2: #f1f3f5; --line: #ccd2d9;
  --ink: #12161b; --mute: #586271; --acc: #5b63e6; --gold: #d99a00;
  --red: #e0405f; --grid: rgba(20,30,50,.07); --on-accent: white;
  --warn-ink: #815700; --red-ink: #a42141;
  --saved: #f5b83d; --applied: #7c83ff; --interviewing: #3aa0ff; --offer: #22c997; --closed: #9aa0b4;
  --hd: "Barlow Condensed","Arial Narrow",system-ui,sans-serif;
  --body: Inter,system-ui,-apple-system,"Segoe UI",sans-serif;
  --mono: ui-monospace,"SF Mono",Menlo,Consolas,monospace;
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: #0a0c0f; --panel: #13171c; --p2: #1b2027; --line: #2b323b;
  --ink: #e9edf2; --mute: #8e98a6; --acc: #7c83ff; --gold: #f5b83d;
  --red: #ff5f7e; --grid: rgba(255,255,255,.045); --on-accent: #101324;
  --warn-ink: var(--gold); --red-ink: var(--red);
}
````

## `src/styles/tracker.css`

````
.tracker {
  max-width: 1280px; margin: auto;
  padding: max(23px,env(safe-area-inset-top)) max(14px,env(safe-area-inset-right)) calc(92px + env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left));
}
.masthead { display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; }
.eyebrow { margin: 0 0 6px; color: var(--acc); font: 600 10px/1.5 var(--mono); letter-spacing: .13em; text-transform: uppercase; }
.masthead h1 { margin: 0; font: 700 clamp(40px,6vw,60px)/.95 var(--hd); letter-spacing: .02em; text-transform: uppercase; }
.masthead h1::after { content: ""; display: block; margin-top: 12px; background: var(--acc); width: 84px; height: 5px; }
.header-tools { display: flex; align-items: center; gap: 6px; }
.device-link { min-width: 44px; font: 11px var(--mono); color: var(--mute); text-decoration: none; }
.device-link span { display: none; }
.tiles { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(108px,1fr); gap: 8px; overflow-x: auto; padding: 4px 2px; margin: 19px -2px 14px; scrollbar-width: thin; }
.tile { text-align: left; border: 1px solid var(--line); border-left: 4px solid var(--stage); border-radius: 4px; padding: 9px 11px; background: var(--panel); }
.tile[aria-pressed=true], .tile:hover { border-color: var(--stage); background: color-mix(in srgb,var(--stage) 7%,var(--panel)); }
.tile small { display: block; color: var(--mute); font: 600 10px var(--mono); letter-spacing: .1em; text-transform: uppercase; }
.tile b { display: block; color: var(--stage); font: 700 36px/1.12 var(--hd); }
.quick { display: flex; gap: 7px; margin-bottom: 12px; }
.quick input { flex: 1; font-size: 16px; }
.quick .btn { padding-inline: 11px; white-space: nowrap; }
.log-top { display: none; }
.toolbar { display: flex; flex-wrap: wrap; gap: 7px; align-items: center; margin-bottom: 14px; }
.search-box { display: flex; align-items: center; gap: 7px; background: var(--panel); border: 1px solid var(--line); border-radius: 4px; color: var(--mute); padding: 0 10px; flex: 1 1 165px; min-width: 0; }
.search-box input { border: 0; width: 100%; padding: 4px 0; background: transparent; font-size: 16px; }
.search-box:focus-within { outline: 2px solid var(--acc); }
.search-box input:focus-visible { outline: 0; }
kbd { display: none; font: 11px var(--mono); padding: 1px 5px; border: 1px solid var(--line); border-radius: 2px; }
.chip, .views button { font: 600 13px var(--hd); letter-spacing: .07em; text-transform: uppercase; padding: 0 12px; }
.chip { color: var(--warn-ink); background: var(--p2); border: 1px solid var(--line); border-radius: 3px; }
.chip[aria-pressed=true] { background: color-mix(in srgb,var(--gold) 15%,var(--panel)); border-color: var(--gold); }
.views { display: inline-flex; margin-left: auto; border: 1px solid var(--line); border-radius: 4px; overflow: hidden; }
.views button { border: 0; background: var(--panel); color: var(--mute); }
.views button[aria-pressed=true] { background: var(--acc); color: var(--on-accent); }
.note { display: flex; align-items: center; justify-content: space-between; gap: 12px; border: 1px dashed var(--acc); border-radius: 4px; padding: 3px 12px; margin-bottom: 14px; color: var(--mute); font-size: 12px; }
.note button { background: none; border: 0; color: var(--acc); font-size: 12px; font-weight: 600; text-decoration: underline; flex-shrink: 0; max-width: 105px; }
.empty { text-align: center; padding: 35px 15px; background: var(--panel); border: 1px dashed var(--line); border-radius: 4px; animation: enter .25s both; }
.empty-icon { display: inline-grid; place-items: center; width: 48px; height: 48px; background: var(--p2); border: 1px solid var(--line); color: var(--mute); border-radius: 4px; margin-bottom: 12px; }
.empty h2 { margin: 0; font: 700 34px/1.1 var(--hd); letter-spacing: .025em; }
.empty p { max-width: 440px; margin: 7px auto 20px; color: var(--mute); }
.empty-actions { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
.fab { position: fixed; right: max(16px,env(safe-area-inset-right)); bottom: calc(16px + env(safe-area-inset-bottom)); width: 54px; height: 54px; border: 1px solid var(--acc); background: var(--acc); color: var(--on-accent); border-radius: 5px; z-index: 3; box-shadow: 0 4px 15px #0003; }
.toast { position: fixed; z-index: 5; bottom: calc(80px + env(safe-area-inset-bottom)); left: 50%; transform: translateX(-50%); max-width: calc(100% - 30px); width: max-content; display: flex; align-items: center; gap: 12px; padding: 0 0 0 12px; color: var(--ink); background: var(--panel); border: 1px solid var(--line); border-left: 3px solid var(--acc); box-shadow: 0 4px 18px #0002; }
.toast.failed { border-left-color: var(--red); }
.toast .icon-button { border: 0; }
@media (min-width: 700px) {
  .tracker { padding: max(28px,env(safe-area-inset-top)) 20px 70px; }
  .device-link span, kbd { display: inline; }
  .header-tools { gap: 16px; }
  .tiles { grid-template-columns: repeat(5,minmax(0,1fr)); margin-block: 22px 15px; gap: 10px; }
  .tile { padding: 12px 16px; }
  .tile b { font-size: 42px; }
  .tile small, .eyebrow { font-size: 11px; }
  .log-top { display: inline-flex; }
  .fab { display: none; }
  .quick input, .search-box input { font-size: 14px; }
  .quick .btn { padding-inline: 20px; }
  .empty { padding: 48px 20px; }
  .note button { max-width: none; }
  .toast { bottom: 22px; }
}

.loading > div, .skeleton-tiles i { background: var(--p2); border: 1px solid var(--line); border-radius: 4px; }
.loading .skeleton-title { width: min(240px,70%); height: 80px; }
.loading .skeleton-tiles { display: grid; grid-template-columns: repeat(5,1fr); gap: 8px; margin: 22px 0 14px; border: 0; background: transparent; }
.skeleton-tiles i { height: 72px; }
.skeleton-toolbar { height: 44px; margin-bottom: 12px; }
.skeleton-panel { height: 160px; }

.sync-line, .active-filters { display: flex; gap: 8px; align-items: center; color: var(--mute); font: 11px var(--mono); }
.sync-line { justify-content: flex-end; margin: 7px 0 -12px; }
.sync-line i { width: 7px; height: 7px; border-radius: 50%; background: var(--gold); }
.sync-line .live { background: var(--offer); }
.sync-line .working { background: var(--acc); animation: sync-pulse .8s ease-in-out infinite alternate; }
.active-filters { margin-top: -8px; }
.active-filters button, .toast-action { background: transparent; border: 0; text-decoration: underline; color: var(--acc); }
.toast { animation: toast-in .18s ease-out; }
@keyframes toast-in { from { opacity: 0; translate: 0 6px; } to { opacity: 1; translate: 0 0; } }
@keyframes sync-pulse { from { opacity: .4; } to { opacity: 1; } }
````

## `src/styles/workspace.css`

````
/* The workspace has one navigation surface and one primary action per screen. */
.workspace { --rail: 224px; min-height: 100dvh; }
.brand { display:inline-flex; align-items:center; gap:10px; font:700 21px/1 var(--hd); letter-spacing:.01em; white-space:nowrap; }
.workspace-nav { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:max(8px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) 8px max(16px,env(safe-area-inset-left)); background:var(--panel); border-bottom:1px solid var(--line); }
.brand-link { display:flex; align-items:center; text-decoration:none; color:var(--ink); }
.main-tabs { display:grid; grid-template-columns:repeat(4,1fr); position:fixed; z-index:5; bottom:0; left:0; right:0; background:var(--panel); padding:4px max(4px,env(safe-area-inset-right)) max(4px,env(safe-area-inset-bottom)) max(4px,env(safe-area-inset-left)); border-top:1px solid var(--line); }
.tab-link { position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:50px; gap:2px; color:var(--mute); text-decoration:none; font:500 11px var(--body); border-radius:4px; }
.tab-link[aria-current="page"] { background:color-mix(in srgb,var(--acc) 10%,var(--panel)); color:var(--acc); }
.tab-link small { position:absolute; top:-1px; right:18%; background:var(--p2); color:var(--ink); padding:1px 4px; font:10px var(--mono); border-radius:3px; }
.workspace-identity, .theme-control span, .theme-control small { display:none; }
.theme-control,.row-arrow,.summary-head button { display:inline-flex; align-items:center; justify-content:center; min-width:44px; min-height:44px; background:transparent; color:inherit; border:0; border-radius:4px; }
.workspace-main { min-width:0; max-width:1510px; margin:0 auto; padding:22px max(15px,env(safe-area-inset-right)) calc(138px + env(safe-area-inset-bottom)) max(15px,env(safe-area-inset-left)); }
.page-head,.section-top,.summary-head { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.page-head { margin-bottom:18px; }
.page-head h1,.auth-form-card h1 { margin:5px 0 0; font:700 clamp(40px,5vw,60px)/1 var(--hd); letter-spacing:-.025em; text-transform:none; }
.page-date { margin:0; color:var(--mute); font:500 11px/1.4 var(--mono); }
.global-add { display:none; }
.workspace .fab { bottom:calc(70px + env(safe-area-inset-bottom)); }
.workspace .toast { bottom:calc(134px + env(safe-area-inset-bottom)); }
.workspace .sync-line { margin: -10px 0 12px; }
.page-content { animation:enter .2s ease-out; }
.dashboard-grid,.settings-stack { display:grid; gap:14px; min-width:0; }
.surface,.pipeline-summary { min-width:0; background:var(--panel); border:1px solid var(--line); border-radius:6px; overflow:hidden; }
.surface h2,.pipeline-summary h2,.embedded-account h2 { font:600 24px/1.1 var(--hd); text-transform:none; margin:0; letter-spacing:0; }
.section-top { padding:8px 15px; min-height:58px; border-bottom:1px solid var(--line); }
.text-action,.sample-line button,.back-login,.auth-foot a { display:inline-flex; align-items:center; justify-content:center; gap:6px; font-size:12px; font-weight:600; background:none; color:var(--acc); border:0; text-decoration:none; }
.text-action:hover,.auth-foot a:hover,.back-login:hover { text-decoration:underline; }
.pipeline-summary { padding:15px 16px 6px; background-color:#202239; color:#fafaff; border-color:#353751; background-image:radial-gradient(ellipse at 100% 0, #43487766, transparent 65%),linear-gradient(#d8dcff0a 1px,transparent 1px),linear-gradient(90deg,#d8dcff0a 1px,transparent 1px);background-size:auto,24px 24px,24px 24px; }
.summary-head button { color:#d7d9ff; border:1px solid #ffffff2b; }
.pipeline-total { padding-block:10px 13px; display:flex; align-items:baseline; gap:10px; }
.pipeline-total strong { font:600 74px/.98 var(--hd); font-variant-numeric:tabular-nums; }
.pipeline-total span { color:#c7c9df; font-size:13px; }
.distribution { display:flex; gap:0; height:7px; background:#ffffff20; }
.distribution i { background:var(--stage); transition:flex .35s ease; }
.stage-legend { display:grid; grid-template-columns:1fr 1.03fr 1.45fr .85fr .87fr; margin-top:8px; }
.stage-legend button { min-width:0; display:grid; justify-items:start; gap:3px; padding:7px 0; border:0; background:none; color:#e0e1f0; text-align:left; }
.stage-legend button:hover { color:white; text-decoration:underline; }
.stage-legend span { font:500 12px var(--hd); white-space:nowrap; }
.stage-legend b { font:600 20px var(--hd); }
.stage-legend i,.stage-label i { display:inline-block; background:var(--stage); width:5px; height:5px; margin-right:4px; vertical-align:middle; }
.quiet,.first-entry { padding:24px 18px; }
.quiet>svg { width:32px;height:32px; padding:7px; color:var(--acc); background:color-mix(in srgb,var(--acc) 9%,var(--panel)); border-radius:4px; }
.quiet h3,.first-entry h3 { margin:8px 0 3px; font:600 22px var(--hd); }
.quiet p,.first-entry p,.settings-panel p { color:var(--mute); margin:0 0 6px; font-size:13px; }
.first-entry>div { display:flex; flex-wrap:wrap; gap:12px; margin-top:14px; }
.action-row,.recent-row { display:flex; align-items:center; gap:10px; padding:7px 14px; border-bottom:1px solid var(--line); }
.action-row:last-child,.recent-row:last-child { border-bottom:0; }
.action-symbol,.company-monogram { flex:none; width:31px; height:34px; display:grid; place-items:center; background:var(--p2); border-radius:3px; color:var(--mute); }
.action-symbol { color:var(--acc); background:color-mix(in srgb,var(--acc) 10%,var(--panel)); }
.deadline .action-symbol { color:var(--warn-ink); background:color-mix(in srgb,var(--gold) 12%,var(--panel)); }
.row-title,.recent-name { flex:1; min-width:0; overflow-wrap:anywhere; text-align:left; }
.row-title { border:none; background:none; padding:5px 0; }
.row-title b,.recent-name b { font-weight:600; font-size:14px; display:block; }
.row-title small,.recent-name small { display:block; color:var(--mute); font-size:12px; }
.row-arrow { color:var(--mute); }
.row-arrow:hover,.recent-row:hover { background:var(--p2); }
.recent-row { width:100%; background:none; color:var(--ink); border-width:0 0 1px; border-style:solid; border-radius:0; min-height:64px; }
.company-monogram { color:var(--ink); background:color-mix(in srgb,var(--stage) 14%,var(--p2)); font:600 17px var(--hd); }
.stage-label { font:11px var(--mono); color:var(--mute); }
.recent-date,.recent-row>svg { display:none; }
.soft-button { border:1px solid var(--line); background:var(--panel); border-radius:4px; color:var(--ink); font-size:12px; padding-inline:12px; }
.soft-button:hover { border-color:var(--acc); }
.queue-tabs { display:flex; gap:5px; padding:8px 14px; }
.queue-tabs button { border:0; padding:0 10px; font:500 13px var(--body); color:var(--mute); background:none; border-radius:4px; }
.queue-tabs [aria-pressed=true] { color:var(--acc); background:color-mix(in srgb,var(--acc) 9%,var(--panel)); }
.settings-stack { max-width:720px; }.settings-panel { padding:20px; }.settings-panel p { margin:10px 0; }.settings-panel button { margin-top:10px; }
.embedded-account { padding:0; margin:0; max-width:none; }.embedded-account .account-panel { margin:0; }
.sample-line { display:flex; gap:12px; justify-content:space-between; align-items:center; font-size:12px; color:var(--mute); }
.workspace .tiles { margin-top:0; }
@media(min-width:760px){
  .workspace { display:grid; grid-template-columns:var(--rail) minmax(0,1fr); align-items:start; }
  .workspace-nav { position:sticky; top:0; flex-direction:column; align-items:stretch; justify-content:flex-start; height:100dvh; padding:22px 13px 12px; border:0; border-right:1px solid var(--line); }
  .brand-link { margin-bottom:28px; padding-left:6px; }.brand { font-size:20px; }
  .main-tabs { position:static; display:flex; flex-direction:column; padding:0; gap:4px; border:0; }
  .tab-link { flex-direction:row; justify-content:flex-start; padding:0 12px; min-height:46px; gap:12px; font-size:13px; }
  .tab-link:hover { background:var(--p2); }.tab-link small { position:static; margin-left:auto; }
  .workspace-identity { display:flex; margin-top:auto; align-items:center; gap:10px; border-top:1px solid var(--line); padding:18px 4px 8px; }
  .workspace-identity>div { min-width:0; }.workspace-identity b,.workspace-identity small { display:block;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }.workspace-identity small { color:var(--mute); font-size:10px; }
  .theme-control { gap:8px; justify-content:flex-start; padding:0 6px; }.theme-control span,.theme-control small { display:inline; }.theme-control small { margin-left:auto; color:var(--mute); text-transform:capitalize; }
  .workspace-main { width:100%; padding:clamp(24px,3vw,50px); }.workspace .fab { display:none; }.global-add { display:inline-flex; }
  .workspace .toast { bottom:24px; }.page-head { margin-bottom:24px; }.workspace .sync-line { margin-top:-16px; }
  .recent-date,.recent-row>svg { display:block; color:var(--mute); }.recent-date { width:76px; font:11px var(--mono); text-align:right; }.recent-row { padding-inline:20px; gap:16px; }
  .stage-label { min-width:100px; }.section-top { padding:10px 20px; }
}
@media(min-width:1080px){
  .dashboard-grid { grid-template-columns:minmax(0,1.35fr) minmax(270px,1fr); gap:18px; }.recent {grid-column:1/-1;}
  .pipeline-summary { padding:20px 24px 14px; }.stage-legend span { font:11px var(--mono); }.pipeline-total { padding-block:18px; }
}

/* Authentication uses the same stage palette and grid as the live pipeline. */
.auth-layout { min-height:100dvh; display:grid; align-content:center; }
.auth-art { display:none; }
.auth-form-area { width:100%; padding:22px max(19px,env(safe-area-inset-right)) max(24px,env(safe-area-inset-bottom)) max(19px,env(safe-area-inset-left)); }
.auth-form-card { max-width:390px; margin:auto; }
.mobile-brand { margin:0 0 28px; }
.auth-tabs { display:grid; grid-template-columns:1fr 1fr; gap:4px; background:var(--p2); padding:4px; border-radius:5px; border:1px solid var(--line); margin-bottom:24px; }
.auth-tabs a { display:grid; place-items:center; text-decoration:none; font-weight:600; font-size:13px; color:var(--mute); border-radius:3px; }
.auth-tabs [aria-current=page] { background:var(--panel); color:var(--ink); box-shadow:0 1px 4px #10172b18; }
.auth-form-card h1 { font-size:44px; }.auth-caption { margin:8px 0 22px; color:var(--mute); }
.auth-form fieldset { display:grid; gap:13px; padding:0; margin:0; min-width:0; border:0; }
.auth-field { display:grid; gap:6px; font:600 13px var(--body); }
.auth-field input { width:100%; background:var(--panel); min-height:46px; font:400 16px var(--body); }
.password-wrap { display:flex; align-items:stretch; position:relative; }.password-wrap input { padding-right:45px; }
.password-wrap button { position:absolute; right:1px; top:1px; min-width:44px; background:transparent; color:var(--mute); border:0; }
.forgot-link,.back-login,.auth-foot a { display:inline-flex; align-items:center; font-weight:600; font-size:13px; text-decoration:none; }
.forgot-link { justify-self:end; margin-block:-8px; }.field-help { color:var(--mute); font-size:12px; margin:-8px 0 0; }
.auth-primary { width:100%; justify-content:space-between; }.auth-primary,.google-btn { min-height:46px; }
.auth-foot { border-top:1px solid var(--line); padding-top:10px; margin-top:20px; }
.auth-foot summary { font-size:12px; color:var(--mute); padding-block:12px; }.auth-foot p { margin:0 0 8px; font-size:13px; }
.sent-actions { display:grid; gap:8px; }.auth-form-card { animation:enter .22s ease-out; }
@media(min-width:820px){
  .auth-layout { grid-template-columns:minmax(310px,.9fr) minmax(450px,1.1fr); align-content:stretch; background:var(--panel); }
  .auth-art { display:flex; flex-direction:column; padding:clamp(30px,5vw,76px); color:#f6f6ff; background-color:#202239;
    background-image:radial-gradient(ellipse at 90% 15%,#575b984d,transparent 65%),linear-gradient(#fff1 1px,transparent 1px),linear-gradient(90deg,#fff1 1px,transparent 1px); background-size:auto,44px 44px,44px 44px; }
  .art-content { margin:auto 0; padding-block:36px; }.art-content h2 { font:700 clamp(64px,8vw,117px)/.85 var(--hd); letter-spacing:-.04em; margin:0; }.art-content h2 span { color:#9399ff; }
  .art-content p { color:#c4c7df; max-width:300px; }.paper-stack { height:134px; width:min(100%,365px); position:relative; margin-top:48px; }
  .paper { position:absolute; width:56%; height:87px; background:#2e324e; box-shadow:0 5px 16px #0c0d1e45; border:1px solid #565a7d; border-left:4px solid var(--stage); border-radius:4px; padding:12px; }
  .paper-1 { top:22px; left:21%; background:#343955; }.paper-2 { top:44px;left:42%; background:#3c4160; }
  .paper div { color:#f6f5ff; font:600 16px var(--hd); }.paper span { display:block; height:3px; background:#757994; margin-top:8px; width:72%; }.paper span:last-child {width:43%;}
  .auth-form-area { align-self:center; padding:32px; }.mobile-brand { display:none; }
}

@media (min-width:700px) and (max-width:759px) { .workspace .fab { display:inline-flex; } }

.brand sup { font:600 .46em var(--body); vertical-align:super; margin-left:2px; }
.lb-mark { flex:none; }
.maker { color:#c4c7df; font:500 13px var(--body); }
.otp-input { letter-spacing:.16em; font-variant-numeric:tabular-nums; }
.callback-panel > .brand { margin-bottom:18px; }
@keyframes settle { from { opacity:0; transform:translateY(9px); } to { opacity:1; transform:translateY(0); } }
@keyframes unfold { from { opacity:0; transform:translate(-12px,8px) rotate(-4deg); } to { opacity:1; transform:none; } }
@media (prefers-reduced-motion:no-preference) {
  .dashboard-grid>section,.auth-form fieldset,.auth-caption,.lb-mark { animation:settle .32s ease-out both; }
  .dashboard-grid>section:nth-child(2) { animation-delay:45ms; }
  .dashboard-grid>section:nth-child(3) { animation-delay:85ms; }
  .paper { animation:unfold .55s cubic-bezier(.2,.72,.23,1) both; }
  .paper-1 { animation-delay:70ms; } .paper-2 { animation-delay:140ms; }
  .tab-link svg,.auth-primary svg,.recent-row .company-monogram { transition:transform .18s ease-out; }
  .tab-link[aria-current=page] svg { transform:translateY(-1px); }
  .auth-primary:is(:hover,:focus-visible) svg { transform:translateX(3px); }
  .recent-row:is(:hover,:focus-visible) .company-monogram { transform:translateY(-2px); }
}
@media (prefers-reduced-motion:reduce) {
  *,*::before,*::after { animation:none!important; transition:none!important; scroll-behavior:auto!important; }
}
````

## `supabase/config.toml`

````
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

[auth.email.template.confirmation]
subject = "Confirm your Roleward account"
content_path = "./supabase/templates/confirmation.html"

[auth.email.template.recovery]
subject = "Reset your Roleward password"
content_path = "./supabase/templates/recovery.html"

[functions.reminders]
enabled = true
verify_jwt = false
entrypoint = "./functions/reminders/index.js"
````

## `supabase/functions/reminders/README.md`

````
# Scheduled email reminders

The function sends a plain-text digest for each opted-in account with a confirmed email. Saved deadlines from today through three days ahead and Applied items with ten calendar days of inactivity qualify. Sample rows are excluded. The database uses the timezone saved when the user enables reminders. Delivery begins at 08:00 local time.

1. Verify a sender domain in Resend and create an API key.
2. Generate a random secret of at least 32 characters. From the repo root run `supabase secrets set --env-file supabase/functions/reminders/.env.local` after placing RESEND_API_KEY, REMINDER_FROM (your verified sender address), and REMINDER_CRON_SECRET in that ignored file. Supabase supplies SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to the hosted function. Keep all these values out of Vite.
3. Push the migrations. Deploy with `supabase functions deploy reminders`. The checked-in config disables gateway JWT verification for this endpoint. The function authenticates every POST using x-reminder-secret.
4. Enable **pg_cron** and **pg_net** in Supabase. In Vault, add **tracker_project_url** with the HTTPS project URL without a trailing slash, and **tracker_reminder_secret** with the same secret as REMINDER_CRON_SECRET.
5. Run the contents of `schedule.sql` in the project SQL Editor. It polls every five minutes. Enable **Daily reminders** on the app’s Account screen to opt in.
6. To pause scheduled execution, run `select cron.unschedule('application-tracker-reminders');`. Individual users can disable reminders in Account.

Each invocation claims up to five digests. The lease prevents overlapping runs from claiming the same work. The database keeps the first digest body for a local day and Resend receives a stable idempotency key when delivery is retried. Delivery failures return HTTP 503 and the next poll can retry after five minutes. Unsent digests expire at the end of the local day. Old delivery records are removed after seven days. To diagnose failures, inspect function invocation status, pg_net responses, and the Resend dashboard. Credentials and email content are excluded from application logs.
````

## `supabase/functions/reminders/index.js`

````
import { timingSafeEqual } from 'node:crypto'

function authorized(request, secret) {
  if (!secret || secret.length < 32) return false
  const received = new TextEncoder().encode(request.headers.get('x-reminder-secret') || '')
  const expected = new TextEncoder().encode(secret)
  return received.length === expected.length && timingSafeEqual(received,expected)
}

export async function sendReminders(request, env, transport = fetch) {
  if (request.method !== 'POST') return new Response('Method not allowed',{status:405,headers:{Allow:'POST'}})
  if (!authorized(request,env('REMINDER_CRON_SECRET'))) return new Response('Unauthorized',{status:401})
  const url = env('SUPABASE_URL')
  const key = env('SUPABASE_SERVICE_ROLE_KEY')
  const resend = env('RESEND_API_KEY')
  const from = env('REMINDER_FROM')
  if (!url || !key || !resend || !from) return new Response('Missing function configuration',{status:503})
  async function rpc(name, args) {
    const response = await transport(url + '/rest/v1/rpc/' + name,{
      method:'POST', headers:{apikey:key,Authorization:'Bearer ' + key,'Content-Type':'application/json'},
      body:JSON.stringify(args), signal:AbortSignal.timeout(12000),
    })
    if (!response.ok) throw new Error('Database request failed')
    return response
  }
  let sent = 0
  let failed = 0
  try {
    const jobs = await (await rpc('claim_tracker_reminders',{})).json()
    for (const job of jobs) {
      try {
        const result = await transport('https://api.resend.com/emails',{
          method:'POST', headers:{Authorization:'Bearer ' + resend,'Content-Type':'application/json',
            'Idempotency-Key':'tracker/' + job.owner_id + '/' + job.mail_day},
          body:JSON.stringify({from,to:[job.recipient],subject:'Roleward™ application reminders · ' + job.mail_day,
            text:job.content + '\n\nManage email reminders in your Roleward account.'}),
          signal:AbortSignal.timeout(12000),
        })
        if (!result.ok) throw new Error('Email delivery failed')
        await rpc('ack_tracker_reminder',{owner_id:job.owner_id,day_sent:job.mail_day,token:job.token})
        sent++
      } catch {
        // Retain this lease for retry while allowing unrelated recipients to finish.
        failed++
      }
      if (sent + failed < jobs.length) await new Promise(resolve => setTimeout(resolve,600))
    }
    return Response.json({sent,failed,retry:failed > 0},{status:failed ? 503 : 200})
  } catch {
    // Keep the frozen digest and let the lease expire for the next scheduled retry.
    return Response.json({sent,retry:true},{status:503})
  }
}

if (typeof Deno !== 'undefined') Deno.serve(request => sendReminders(request,name => Deno.env.get(name)))
````

## `supabase/functions/reminders/schedule.sql`

````
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
````

## `supabase/migrations/20261124000100_create_applications.sql`

````
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
````

## `supabase/migrations/20261124000200_device_import.sql`

````
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
````

## `supabase/migrations/20261124000300_reminders.sql`

````
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
````

## `supabase/templates/confirmation.html`

````
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:32px 16px;background:#eceef4;font:16px/1.55 Arial,sans-serif;color:#21243a">
    <div style="max-width:480px;margin:auto;padding:28px;background:#ffffff;border-top:4px solid #626ac2">
      <p style="margin:0;color:#4d539a;font-size:17px;font-weight:bold">LB / Roleward™</p>
      <h1 style="line-height:1.15">Confirm your email</h1>
      <p>Open the link and select the confirmation button, or enter the code below in Roleward.</p>
      <p><a style="display:inline-block;padding:12px 18px;background:#32365c;color:#ffffff;text-decoration:none" href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&amp;type=email">Confirm email</a></p>
      <p style="margin-bottom:4px">Your one-time code</p>
      <p style="font:700 28px monospace;letter-spacing:3px;margin-top:0">{{ .Token }}</p>
      <p style="color:#555a70">If you didn’t request this email, you can ignore it.</p>
    </div>
  </body>
</html>
````

## `supabase/templates/recovery.html`

````
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:32px 16px;background:#eceef4;font:16px/1.55 Arial,sans-serif;color:#21243a">
    <div style="max-width:480px;margin:auto;padding:28px;background:#ffffff;border-top:4px solid #626ac2">
      <p style="margin:0;color:#4d539a;font-size:17px;font-weight:bold">LB / Roleward™</p>
      <h1 style="line-height:1.15">Reset your password</h1>
      <p>Open the link and select the confirmation button, or enter the code below in Roleward.</p>
      <p><a style="display:inline-block;padding:12px 18px;background:#32365c;color:#ffffff;text-decoration:none" href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&amp;type=recovery">Reset password</a></p>
      <p style="margin-bottom:4px">Your one-time code</p>
      <p style="font:700 28px monospace;letter-spacing:3px;margin-top:0">{{ .Token }}</p>
      <p style="color:#555a70">If you didn’t request this email, you can ignore it.</p>
    </div>
  </body>
</html>
````

## `supabase/tests/database/application_rules.test.sql`

````
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
````

## `supabase/tests/database/cloud_features.test.sql`

````
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
````

## `tests/agenda.test.js`

````
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { nextActions } from '../src/lib/agenda.js'

test('agenda prioritizes overdue and imminent deadlines, then follow-ups, then the week ahead',() => {
  const today='2026-11-24'
  const saved=day=>({company:'Company',stage:'Saved',deadline:'2026-'+day})
  const waiting={company:'Waiting',stage:'Applied',stage_changed_at:'2026-11-11T12:00:00'}
  const recent={...waiting,last_followed_up_at:'2026-11-22T12:00:00'}
  const result=nextActions([saved('12-02'),saved('11-30'),recent,waiting,saved('11-22'),saved('11-25'),
    {...saved('11-24'),stage:'Closed'}],today)
  assert.deepEqual(result.map(x=>x.row),[saved('11-22'),saved('11-25'),waiting,saved('11-30')])
})
````

## `tests/reminders.test.js`

````
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sendReminders } from '../supabase/functions/reminders/index.js'
const secret = 'test-only-example'.repeat(3)
const env = key => ({REMINDER_CRON_SECRET:secret,RESEND_API_KEY:'example',REMINDER_FROM:'test@example.test',
  SUPABASE_SERVICE_ROLE_KEY:'test-only',SUPABASE_URL:'https://test.invalid'})[key]
const request = token => new Request('https://test.invalid',{method:'POST',headers:{'x-reminder-secret':token}})
test('unauthorized requests cannot claim a batch',async () => {
  const result = await sendReminders(request('bad'),env,() => assert.fail())
  assert.equal(result.status,401)
})
test('provider failure leaves the digest unacknowledged; retries keep their idempotency key',async () => {
  const job = {owner_id:'a',mail_day:'2026-11-24',recipient:'me@example.test',token:'lease',content:'Apply by today'}
  const keys = []
  let acknowledgments = 0
  const transport = async (url,init) => {
    if (url.endsWith('/claim_tracker_reminders')) return Response.json([job])
    if (url.endsWith('/ack_tracker_reminder')) { acknowledgments++; return new Response(null,{status:204}) }
    keys.push(init.headers['Idempotency-Key'])
    return new Response(null,{status:keys.length === 1 ? 503 : 200})
  }
  assert.equal((await sendReminders(request(secret),env,transport)).status,503)
  assert.equal(acknowledgments,0)
  assert.equal((await sendReminders(request(secret),env,transport)).status,200)
  assert.equal(acknowledgments,1)
  assert.equal(keys[0],keys[1])
})

test('one rejected recipient does not hold up the next recipient',async () => {
  const make = owner_id => ({owner_id,mail_day:'2026-11-24',recipient:owner_id+'@example.test',token:'lease',content:'Due today'})
  const acks = []
  const result = await sendReminders(request(secret),env,async (url,init) => {
    if (url.endsWith('/claim_tracker_reminders')) return Response.json([make('one'),make('two')])
    if (url.endsWith('/ack_tracker_reminder')) {
      acks.push(JSON.parse(init.body).owner_id)
      return new Response(null,{status:204})
    }
    return new Response(null,{status:JSON.parse(init.body).to[0] === 'one@example.test' ? 422 : 200})
  })
  assert.equal(result.status,503)
  assert.deepEqual(acks,['two'])
})
````

## `tests/workspace.test.js`

````
import test from 'node:test'
import assert from 'node:assert/strict'
import { cloudWorkspace } from '../src/lib/cloudWorkspace.js'
import { createRow, updateRow, followUp, offsetDate } from '../src/lib/utils.js'

function setup(row, remote) {
  const cacheWrites = []
  const store = cloudWorkspace('owner',{
    watchRows:() => () => {}, loadRows:async () => [row], ...remote,
  },{read:() => [row],write:(_id,rows) => cacheWrites.push(rows)})
  return {store,cacheWrites}
}
test('failed optimistic stage change restores the confirmed row',async () => {
  const row = createRow({company:'A',stage:'Saved'})
  let reject
  const {store} = setup(row,{changeRow:() => new Promise((_resolve,r) => {reject=r})})
  const write = store.update(row.id,{stage:'Applied'})
  assert.equal(store.getSnapshot().rows[0].stage,'Applied')
  assert.equal(store.getSnapshot().pending,1)
  reject(new Error('Connection lost'))
  await assert.rejects(write,/Connection lost/)
  assert.equal(store.getSnapshot().rows[0].stage,'Saved')
  assert.equal(store.getSnapshot().pending,0)
})
test('an overlapping write cannot clobber a pending edit',async () => {
  const row = createRow({company:'A',stage:'Saved'})
  let complete
  const {store} = setup(row,{changeRow:() => new Promise(r => {complete=r})})
  const first = store.update(row.id,{pinned:true})
  await assert.rejects(store.update(row.id,{company:'B'}),/still saving/)
  complete({...row,pinned:true})
  await first
  assert.equal(store.getSnapshot().rows[0].pinned,true)
})
test('stale editor revisions are rejected before a request',async () => {
  const row = createRow({company:'A',stage:'Saved'})
  const {store} = setup(row,{})
  await assert.rejects(store.remove(row.id,'stale'),/latest version/)
  await assert.rejects(store.update(row.id,{notes:'old'},'stale'),/latest version/)
})
test('an old fetch cannot resurrect a row after an acknowledged delete',async () => {
  const row = createRow({company:'A',stage:'Saved'})
  let release
  const {store,cacheWrites} = setup(row,{loadRows:() => new Promise(r => {release=r}),deleteRow:async () => {}})
  const off=store.subscribe(() => {})
  try {
    await store.remove(row.id,row.updated_at)
    release([row])
    await Promise.resolve()
    assert.deepEqual(store.getSnapshot().rows,[])
    assert.deepEqual(cacheWrites.at(-1),[])
  } finally {off()}
})
test('edits preserve follow-up age, and leaving Saved sets the application date',() => {
  const row = createRow({company:'A',stage:'Applied'})
  row.stage_changed_at = new Date(offsetDate(-12)+'T12:00:00').toISOString()
  assert.equal(followUp(updateRow(row,{notes:'updated'})),true)
  assert.equal(followUp({...row,last_followed_up_at:new Date().toISOString()}),false)
  const saved = createRow({company:'B',stage:'Saved'})
  assert.equal(updateRow(saved,{stage:'Interviewing'},new Date('2026-11-01T12:00:00')).applied_date,'2026-11-01')
})

// Node's DOM-independent store tests use browser lifecycle and connection signals.
globalThis.window = new EventTarget()
Object.defineProperty(globalThis.navigator,'onLine',{value:true,configurable:true})
````

## `vercel.json`

````
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
````

## `vite.config.js`

````
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
})
````
