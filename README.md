# Libris

Campus library for students and staff. Students browse the catalog, borrow and return books, renew a loan, and join a hold list when a title is out. Staff approve accounts, check books in and out, look up ISBNs, and manage the collection.

Live: [learning-system-two.vercel.app](https://learning-system-two.vercel.app)

## What’s in it

**Students**
- Sign up with a university ID card (staff approve the account)
- Catalog search with ranking (title, author, genre, summary)
- Borrow, return, renew once, and place holds when copies are 0
- Profile with loans, receipts, overdue fines ($1/day)
- Home page picks books from borrow history (or popular titles)

**Staff**
- Admin and librarian roles
- Dashboard, users, books, borrow requests, desk checkout
- ISBN lookup (Pro)
- Settings: library name, loan days, branding, staff invites
- Free / Pro billing through Stripe Checkout ($19/mo)

**Also**
- Due-soon and overdue reminder emails (Pro, daily cron)
- Image uploads via ImageKit

## Stack

Next.js 15, TypeScript, Tailwind, NextAuth, Drizzle, Neon Postgres, Upstash Redis / QStash, ImageKit, Resend, Stripe.

## Run it locally

```bash
npm install
cp .env.example .env.local
```

Fill `.env.local` (see below), then:

```bash
npm run db:migrate
npm run seed
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

`npm run seed` only if the catalog is empty. Running it again can duplicate books.

## Env

Copy from `.env.example`. The ones you actually need to start:

| Variable | What it’s for |
|---|---|
| `DATABASE_URL` | Neon Postgres |
| `AUTH_SECRET` | NextAuth |
| `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` | Cover / ID uploads |
| `IMAGEKIT_PRIVATE_KEY` | Cover / ID uploads |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | Cover / ID uploads |
| `UPSTASH_REDIS_URL` / `UPSTASH_REDIS_TOKEN` | Rate limits |
| `QSTASH_URL` / `QSTASH_TOKEN` | Workflows |
| `RESEND_TOKEN` | Emails |

**Vercel:** set `PROD_API_ENDPOINT` to `https://your-app.vercel.app` (not localhost). That is the URL used after Stripe Checkout and in emails.

**Stripe (optional, test mode is fine)**
- `STRIPE_SECRET_KEY` — `sk_test_...`
- `STRIPE_WEBHOOK_SECRET` — `whsec_...`

Webhook URL (no CLI needed on the live site):

`https://your-app.vercel.app/api/stripe/webhook`

Events: `checkout.session.completed`, `customer.subscription.created`, `invoice.paid`, `customer.subscription.deleted`.

Test card: `4242 4242 4242 4242`, any future date, any CVC.

Without Stripe keys, settings still has **Enable Pro for development**.

## Demo accounts

After seed / first admin signup, use your own approved admin user. Students stay `PENDING` until staff approve them.

## Scripts

```bash
npm run dev          # local
npm run build        # production build
npm run db:migrate   # apply SQL migrations
npm run seed         # sample books
npm run db:studio    # Drizzle Studio
```

Do not commit `.env.local`.
