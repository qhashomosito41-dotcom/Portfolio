# Mosito Qhasho Portfolio

A full-stack personal portfolio and content management system for Mosito Qhasho. The public site presents a profile, skills, projects, experience, education, certifications, and a contact form. A private dashboard lets the site owner manage every piece of content without editing code.

## Features

### Public site

- Responsive single-page portfolio with dark and light themes, persisted in `localStorage`.
- Profile, skills grouped by category, projects with filtering and search, experience, education, certifications, social links, and CV download or "CV on request".
- Individual project case-study pages with image galleries, technologies, links, and structured data.
- Contact form with client and server validation, honeypot spam protection, rate limiting, database storage, and optional email notification.
- CMS-driven page title, description, canonical URL, footer tagline, Open Graph/Twitter metadata, `robots.txt`, and `sitemap.xml`.
- Accessible navigation, skip link, focus styles, reduced-motion support, and descriptive empty states.
- Custom 404 page and production error boundary.

### Admin dashboard

- Secure login using Argon2id password hashing, database-backed sessions, HTTP-only cookies, CSRF protection, and login rate limiting.
- Dashboard counts, recent messages, CV status, quick actions, and recent projects.
- Full CRUD for projects, screenshots, skills, experience, education, certifications, certificates, social links, and messages.
- Profile editor, image upload, CV upload/visibility controls, and site settings.
- Contact message inbox with read/unread/archive states, search, and safe reply links.
- Server-side validation mirroring the client forms.
- SMTP test-email tool and clear "not configured" states.

## Technology

| Layer    | Stack                                                                            |
| -------- | -------------------------------------------------------------------------------- |
| Client   | React 18, TypeScript, Vite 8, Tailwind CSS 4, React Router, React Hook Form, Zod |
| Server   | Node.js, Express 4, TypeScript, Prisma 6, Zod, Pino                              |
| Database | MySQL 8 or MariaDB 10.4+                                                         |
| Auth     | Argon2id, database sessions, CSRF tokens                                         |
| Uploads  | Multer with MIME and magic-byte checks                                           |
| Tests    | Vitest, Supertest, Testing Library, jsdom                                        |

## Repository structure

```text
.
├── client/                 React application
│   ├── src/components/     Public and shared UI
│   ├── src/pages/          Public and admin pages
│   ├── src/contexts/       Auth, theme, toast, public-data providers
│   ├── src/utils/          API client, validation, formatting, schemas
│   ├── tests/              Component and validation tests
│   └── vite.config.ts      Vite/Vitest config and development proxy
├── server/                 Express API and Prisma project
│   ├── prisma/             Schema, migrations, seed, admin initializer
│   ├── src/controllers/    Public and admin request handlers
│   ├── src/middleware/     Auth, validation, uploads, errors, security
│   ├── src/routes/         API route definitions
│   ├── src/services/       Serializers, email, dashboard, site data
│   ├── src/views/          SEO routes
│   └── tests/              API integration tests
├── storage/                Uploaded files (ignored by git)
├── .env.example            Environment template for `server/.env`
└── package.json            Workspace scripts
```

## Requirements

- Node.js 20.19+ or 22.12+ (Node 22 LTS recommended).
- MySQL 8 or MariaDB 10.4+.
- npm 10+.
- A writable storage directory.
- Optional: SMTP account for contact notification emails.

## Getting started

### 1. Install dependencies

```bash
npm run install:all
```

This installs root tooling plus the `client` and `server` packages.

### 2. Create the databases

Create the development database (and optionally the test database):

```sql
CREATE DATABASE mosito_portfolio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE mosito_portfolio_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configure the server

Copy the root template into the server directory:

```bash
cp .env.example server/.env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example server/.env
```

Then edit `server/.env` and set at least:

- `DATABASE_URL`
- `SESSION_SECRET` (at least 32 random characters)
- `CLIENT_ORIGIN` and `SITE_URL`

Generate a session secret with `openssl rand -hex 32` or PowerShell:

```powershell
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
```

### 4. Generate Prisma client and migrate

```bash
npm run db:generate
npm run db:migrate
```

Use `npm run db:deploy` instead of `db:migrate` in production.

### 5. Seed starter content

```bash
npm run db:seed
```

The seed is intentionally conservative:

- Creates the profile, skills, footer tagline, and contact settings.
- Creates **draft** projects and **unpublished** certification records.
- Creates one experience and one education record from supplied information.

> **Review all seeded content before publishing.** Confirm the internship dates, responsibilities, education details, project descriptions, and certification providers. Draft projects and certifications do not appear publicly until published in the dashboard.

### 6. Create the administrator

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` in `server/.env`, then run:

```bash
npm run admin:init
```

After the account is created, remove `ADMIN_PASSWORD` from the environment file. The initializer is idempotent and will not overwrite an existing account.

### 7. Run in development

```bash
npm run dev
```

- Client: <http://localhost:5173>
- API: <http://localhost:4000>
- Admin: <http://localhost:5173/admin/login>

The Vite development server proxies `/api`, `/robots.txt`, and `/sitemap.xml` to port `4000`.

## Production build and deployment

### Build

```bash
npm run build
```

This compiles the server to `server/dist` and the client to `client/dist`.

### Start

```bash
npm start
```

The Express server serves the API and the built client from `client/dist`, with SPA fallback for client-side routes. `NODE_ENV=production` enables the strict Content Security Policy and secure cookies.

### Deployment checklist

1. Set `NODE_ENV=production`.
2. Use a strong, unique `SESSION_SECRET`.
3. Point `DATABASE_URL` at the production database and run `npm run db:deploy`.
4. Run `npm run db:seed` only if you want starter records; then review them.
5. Create the administrator, then remove `ADMIN_PASSWORD` from the environment.
6. Set `SITE_URL` to the public HTTPS origin, for example `https://mosito.example`.
7. Set `CLIENT_ORIGIN` to the same public origin (or the separate Vite origin during development).
8. Set `COOKIE_SECURE=true` and terminate TLS at a reverse proxy.
9. Configure `STORAGE_DIR` on persistent storage and ensure it is writable.
10. Configure SMTP if contact emails should be sent.
11. Run the server under a process manager (systemd, PM2, Docker, or your host's service manager).
12. Proxy HTTPS traffic to the Node process and serve uploaded files from the same origin.

The application expects one Node process. If you run multiple instances, move rate-limit state and sessions to shared storage.

## Environment variables

All server variables live in `server/.env`. See `.env.example` for the full template.

| Variable                     | Required  | Purpose                                                         |
| ---------------------------- | --------- | --------------------------------------------------------------- |
| `NODE_ENV`                   | Yes       | `development`, `test`, or `production`                          |
| `PORT`                       | No        | API/server port, default `4000`                                 |
| `DATABASE_URL`               | Yes       | MySQL connection string                                         |
| `SESSION_SECRET`             | Yes       | Secret used to sign session cookies; minimum 32 characters      |
| `SESSION_COOKIE_NAME`        | No        | Session cookie name                                             |
| `SESSION_TTL_HOURS`          | No        | Session lifetime, default `8`                                   |
| `CLIENT_ORIGIN`              | No        | Allowed development/client origin                               |
| `SITE_URL`                   | No        | Public site base URL for canonical links, sitemap, and media    |
| `STORAGE_DIR`                | No        | Upload directory, default `../storage`                          |
| `LOG_LEVEL`                  | No        | Pino log level, default `info`                                  |
| `LOGIN_RATE_LIMIT_MAX`       | No        | Login attempts per window, default `10`                         |
| `CONTACT_RATE_LIMIT_MAX`     | No        | Contact submissions per hour, default `5`                       |
| `ADMIN_EMAIL`                | Init only | First administrator email                                       |
| `ADMIN_PASSWORD`             | Init only | First administrator password; remove after initialization       |
| `ADMIN_NAME`                 | No        | Administrator display name                                      |
| `SMTP_HOST`                  | No        | SMTP host; omit to disable email delivery                       |
| `SMTP_PORT`                  | No        | SMTP port, default `587`                                        |
| `SMTP_SECURE`                | No        | `true` for implicit TLS (usually port 465)                      |
| `SMTP_USER`                  | No        | SMTP username                                                   |
| `SMTP_PASSWORD`              | No        | SMTP password or app password                                   |
| `SMTP_FROM`                  | No        | From address for notification emails                            |
| `CONTACT_NOTIFICATION_EMAIL` | No        | Override recipient; otherwise the profile contact email is used |
| `COOKIE_SECURE`              | No        | Force secure cookies outside production                         |

## Content workflow

1. Sign in at `/admin/login`.
2. Review the profile, experience, and education records.
3. Add or edit projects. Use **Save project** to update, then set visibility to **Published** only when the content is verified.
4. Add screenshots to a project and reorder them.
5. Add social links and confirm each URL points to a real profile.
6. Upload a CV if one should be downloadable; otherwise the site shows "CV on request".
7. Update site settings, canonical URL, and notification email.
8. Send a test email after configuring SMTP.
9. Check the public site in both themes and at mobile width.

Messages are always stored in the database. If SMTP is unavailable or not configured, the contact form still succeeds and the dashboard shows the message.

## Testing

```bash
npm test
```

Or individually:

```bash
npm run test:server
npm run test:client
```

Server tests use `server/.env.test` and the `mosito_portfolio_test` database. The suite applies migrations, clears data, and removes `storage-test/` before and after the run. It refuses to run unless the database name contains `_test`.

Covered areas include authentication and CSRF, public content filtering, contact validation and honeypot behavior, origin checks, admin project CRUD, image upload validation, skills, messages, settings, and CV access control.

Run lint and production builds before deploying:

```bash
npm run lint
npm run build
```

## Uploads

- Project and profile images: JPEG, PNG, WebP, or GIF up to **8 MB**.
- Certificates: image files or PDF up to **8 MB**.
- CV files: PDF up to **10 MB**.
- File extensions, MIME types, and magic bytes are validated server-side.
- Files are stored under `STORAGE_DIR` in separate `projects`, `profiles`, `certifications`, and `cv` folders.
- Deleting a record also removes its associated files.

## Security notes

- Passwords are hashed with Argon2id; plain-text passwords are never stored.
- Sessions are stored in the database and sent as HTTP-only, SameSite cookies.
- State-changing admin and auth requests require a CSRF token.
- Login and contact endpoints are rate limited.
- State-changing requests from unknown origins are rejected.
- Helmet sets security headers; production enables a strict CSP.
- Admin routes require an authenticated session; CV and certificate files have separate access checks.
- Uploaded files are validated by signature, not only by extension.
- Contact messages are stored even when email delivery fails.

## API overview

| Area    | Main routes                                                                                                                                                                                         |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Health  | `GET /api/health`                                                                                                                                                                                   |
| Auth    | `GET /api/auth/session`, `POST /api/auth/login`, `POST /api/auth/logout`                                                                                                                            |
| Public  | `GET /api/home`, `/api/profile`, `/api/projects`, `/api/projects/:slug`, `/api/skills`, `/api/experience`, `/api/education`, `/api/certifications`, `/api/social-links`, `/api/cv`, `/api/settings` |
| Contact | `POST /api/contact`                                                                                                                                                                                 |
| Admin   | `/api/admin/dashboard`, `/profile`, `/projects`, `/skills`, `/experience`, `/education`, `/certifications`, `/cv`, `/messages`, `/social-links`, `/settings`, `/email/test`                         |
| SEO     | `GET /robots.txt`, `GET /sitemap.xml`                                                                                                                                                               |

Admin requests require a valid session and CSRF token. See `server/src/routes` for the complete route list.

## Troubleshooting

**Port 4000 is already in use.** Another process is using the API port. Stop that process, or change `PORT` in `server/.env` and update the Vite proxy target in `client/vite.config.ts`. This repository's environment had an unrelated application on port 4000 during development; do not terminate processes you do not own.

**The page loads but is unstyled or blank under a different hostname.** `CLIENT_ORIGIN` and `SITE_URL` must include the exact origin used in the browser. CORS is applied only to `/api`; API requests from an unlisted origin are rejected. Add the origin to both variables and restart the server.

**Prisma cannot connect.** Confirm MySQL/MariaDB is running, the database exists, and `DATABASE_URL` uses the correct user, password, host, and port.

**Uploads fail.** Check `STORAGE_DIR`, directory permissions, and the file size/type limits.

**Emails are not sent.** SMTP is optional. Configure all SMTP variables and use the settings page's test-email tool. Messages remain available in the dashboard regardless.

**Tests refuse to run.** Ensure `server/.env.test` points to a database whose name contains `_test`. The test setup intentionally blocks non-test databases.

## Ownership

All portfolio content belongs to Mosito Qhasho. Replace seeded placeholder and draft content with verified information before publishing.
