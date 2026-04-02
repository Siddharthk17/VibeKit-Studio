# VibeKit Studio

Generate a theme, build a mini-site, publish it.

A full-stack web app for creating themed mini-sites with a live page builder, authentication, and public publishing.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Netlify Functions (serverless Node.js)
- **Database**: PostgreSQL (via `pg`)
- **Auth**: JWT with httpOnly cookies
- **Deployment**: Netlify

## Local Setup

### Prerequisites

- Node.js 20+
- PostgreSQL database (local or hosted like Supabase/Neon)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database

Run `schema.sql` against your PostgreSQL database:

```bash
psql "your-connection-string" -f schema.sql
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (e.g. `postgresql://user:pass@localhost:5432/vibekit`) |
| `JWT_SECRET` | Secret key for signing JWT tokens (use a strong random string in production) |
| `NODE_ENV` | `development` or `production` |

### 4. Run locally

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

### 5. Run with Netlify CLI (for function testing)

```bash
npx netlify dev
```

This runs the full stack with Netlify Functions at `http://localhost:8888`.

## Project Structure

```
├── netlify/
│   ├── functions/          # Serverless API endpoints
│   │   ├── auth-signup.ts
│   │   ├── auth-login.ts
│   │   ├── pages.ts         # GET list, POST create
│   │   ├── pages-id.ts      # GET one, PUT update
│   │   ├── pages-id-publish.ts   # POST publish/unpublish
│   │   ├── pages-id-duplicate.ts # POST duplicate
│   │   ├── public-pages-slug.ts  # GET public page, POST track view
│   │   └── public-pages-slug-contact.ts # POST contact form
│   └── lib/
│       ├── db.ts             # PostgreSQL pool
│       └── auth.ts           # JWT helpers
├── src/
│   ├── pages/               # Route components
│   │   ├── Landing.tsx       # Marketing landing
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── Dashboard.tsx     # Page list management
│   │   ├── PageBuilder.tsx   # Editor with live preview
│   │   └── PublishedPage.tsx # Public page view
│   ├── context/
│   │   └── AuthContext.tsx   # Auth state management
│   ├── lib/
│   │   ├── api.ts            # Frontend API client
│   │   └── themes.ts         # 6 theme presets with design tokens
│   ├── styles/
│   │   └── global.css        # Base styles, CSS variables
│   └── types/
│       └── index.ts          # TypeScript interfaces
├── netlify.toml             # Netlify config + redirects
├── schema.sql               # Database schema
└── package.json
```

## API Endpoints

### Auth
- `POST /api/auth-signup` — `{ email, password }` → `{ user, token }`
- `POST /api/auth-login` — `{ email, password }` → `{ user, token }`

### Pages (authenticated)
- `GET /api/pages` — List user's pages
- `POST /api/pages` — Create page `{ title?, theme_id? }`
- `GET /api/pages/:id` — Get page details
- `PUT /api/pages/:id` — Update page `{ title?, slug?, theme_id?, content? }`
- `POST /api/pages/:id/publish` — Publish page
- `POST /api/pages/:id/unpublish` — Unpublish page
- `POST /api/pages/:id/duplicate` — Clone page

### Public
- `GET /api/public/pages/:slug` — Get published page by slug
- `POST /api/public/pages/:slug/view` — Increment view count
- `POST /api/public/pages/:slug/contact` — Submit contact form

## Theme System

6 presets defined as CSS variable design tokens:

| Theme | Style |
|---|---|
| Minimal / Editorial | Clean, serif headings, solid buttons |
| Neo-Brutal | Bold borders, offset shadows, brutal buttons |
| Dark / Neon | Dark bg, purple accent, glowing buttons |
| Pastel / Soft | Warm tones, rounded corners, soft shadows |
| Luxury / Serif | Dark luxury, gold accent, outlined buttons |
| Retro / Pixel | Purple/green palette, monospace, pixel buttons |

Each theme defines: color palette, typography pairing, spacing scale, border radius, button style, and shadow treatment.

## Deployed URL

[Deploy on Netlify](https://app.netlify.com/)

## Tradeoffs + What I'd Improve Next

1. **No server-side rendering** — Published pages are client-rendered SPAs. Moving to SSR (Next.js or Astro) would improve SEO and initial load time for public pages.
2. **Auth stored in localStorage** — JWT is stored in localStorage for SPA convenience rather than httpOnly cookies. For production, httpOnly cookies via Netlify Functions would be more secure against XSS.
3. **No image upload** — Gallery uses external URLs only. Adding file upload (via Netlify Large Media or S3) would make the builder self-contained.
4. **No rate limiting** — Contact form and view tracking have no rate limiting. Adding Netlify Edge Functions or an external service would prevent abuse.
5. **No E2E tests** — The app has no automated test suite. Adding Playwright tests for the critical flows (signup → create → edit → publish → view) would catch regressions.
