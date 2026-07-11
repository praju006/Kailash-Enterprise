# Anaya Sarees — E-commerce Platform

Next.js storefront with real order processing, order tracking, an admin
dashboard, and optional email/SMS notifications + Razorpay (UPI/card) payments.

## Running locally

```bash
npm install
npx prisma migrate dev   # applies schema to your database
npx prisma db seed       # loads the product catalog + creates the admin login
npm run dev
```

Visit `http://localhost:3000`. Admin dashboard: `http://localhost:3000/admin`.

## What's live right now

- **Storefront**: browsing, filtering, cart, wishlist — all working.
- **Checkout**: Cash on Delivery works end-to-end today. Orders are saved to
  the database, given a real order number (`ANY123456`), and visible to the
  customer via `/track` and to you via `/admin/orders`.
- **Admin dashboard** (`/admin`): order list with status updates (Processing →
  Confirmed → Shipped → Out for Delivery → Delivered), payment marking, and
  full product CRUD (add/edit/delete, prices, images, badges).
- **Order tracking** (`/track`): customers look up their order with the order
  number + the email or phone they checked out with.

## What needs your credentials before it goes fully live

These are wired up and will activate automatically the moment you fill in the
corresponding values in `.env` — no code changes needed.

| Feature | What you need | Where |
|---|---|---|
| **Database** | A Supabase project's Postgres connection strings | Supabase dashboard → Project Settings → Database → Connection String. Use the **pooled** string (port 6543, `?pgbouncer=true`) for `DATABASE_URL`, and the **direct** string (port 5432) for `DIRECT_URL`. |
| **Order confirmation emails** | SMTP credentials (Gmail App Password, Zoho, or a transactional provider like Brevo/SES) | Fill `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` in `.env` |
| **Order confirmation SMS** | A Twilio account (paid) | Fill `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` |
| **UPI / card payments** | A Razorpay account (free to create, requires KYC to accept live payments) | Fill `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`. Until then, checkout only offers Cash on Delivery — UPI/Card show as "Currently unavailable" automatically. |

Until those are filled in, the app still runs correctly: emails/SMS just log
to the server console instead of sending, and online payment options stay
disabled with COD as the only checkout path.

## Admin login

Default credentials (set in `.env` — **change `ADMIN_PASSWORD` before going
live**):

- Username: `admin`
- Password: `anaya2026`

## Migrating the database to Supabase

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine to start).
2. Copy the two connection strings into `.env` as described in the table above.
3. Run:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
   This creates all tables on Supabase and loads the starting catalog + admin login.
4. Restart `npm run dev` (or redeploy).

## Deploying

This is a standard Next.js app — it deploys cleanly to Vercel (recommended,
same company as Next.js) or any Node host. Set all the same `.env` values as
environment variables in your hosting dashboard. SQLite is not used once
Supabase is connected, so there's no filesystem persistence requirement.

## Security notes

- `SESSION_SECRET` in `.env` signs the admin login cookie — set it to a long
  random string before going live (a leaked default secret would let someone
  forge an admin session).
- Product pricing is always recalculated server-side from the database at
  checkout, never trusted from the browser — prevents price tampering.
- Order lookups on `/track` require the order number **and** a matching email
  or phone, so orders can't be browsed/enumerated by guessing numbers.
