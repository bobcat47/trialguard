# TrialGuard

Smart free trial manager that auto-detects trials from your email, tracks expiration dates, and helps you cancel before getting charged.

## Features

- **Email Auto-Detection** — Connect Gmail to automatically find trial signups
- **Trial Tracking** — Manual entry with smart duration calculation
- **Auto-Cancel Queue** — Set it and forget it, cancel before billing
- **Money Saved Tracker** — See exactly how much you've avoided spending
- **Cancel Guides** — Step-by-step instructions for 25+ services
- **Nexus Glassmorphism UI** — Iridescent, crystalline interface

## Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Hono + tRPC 11 + Drizzle ORM
- **Database**: MySQL
- **Auth**: OAuth 2.0

## Deploy to Railway

1. Push this repo to GitHub
2. Create new project on [Railway](https://railway.app) from this repo
3. Add MySQL database (Railway handles the `DATABASE_URL`)
4. Add environment variables from `.env.example`
5. Run `npx drizzle-kit push` and `npx tsx db/seed.ts` in Railway shell
6. Deploy!

## Environment Variables

```env
DATABASE_URL=mysql://user:pass@host:port/db
APP_ID=your_app_id
APP_SECRET=your_app_secret
VITE_APP_ID=your_app_id
VITE_KIMI_AUTH_URL=https://auth.kimi.com
OWNER_UNION_ID=your_union_id
```

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run start     # Start production server
npm run db:push   # Sync schema to DB
npm run db:seed   # Seed service database
```
