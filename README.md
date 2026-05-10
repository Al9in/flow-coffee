# FLOW — Modern Slow Bar ☕

> A luxury specialty coffee ordering system. Precision-brewed juicy coffee served at peak flow.

## Overview

FLOW is a premium coffee ordering platform with:
- **Daily limited-drop** reservations (e.g. 40 cups/day)
- **Live order tracking** with real-time status updates
- **Admin dashboard** with full order management
- **Mobile-first** design built for car-side pickup

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React, TypeScript, TailwindCSS |
| Database | Supabase (PostgreSQL + Realtime) |
| Payments | Stripe + Apple Pay |
| Hosting | Netlify |

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-username/flow-coffee
cd flow-coffee
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and paste the contents of `supabase-schema.sql`
3. Run the SQL to create all tables and seed data
4. Go to **Database → Replication** and enable realtime for:
   - `orders`
   - `settings`
5. Go to **Settings → API** and copy:
   - `Project URL`
   - `anon / public` key

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-password
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Pages

| URL | Description |
|-----|-------------|
| `/` | Landing page with daily cup counter |
| `/order` | Menu and cart |
| `/checkout` | Order form + payment |
| `/track/[id]` | Live order tracking |
| `/admin` | Admin dashboard (password protected) |

---

## Admin Dashboard

Access at `/admin` with your admin password.

**Features:**
- Live overview: orders, cups sold, revenue
- Order management with status updates
- Coffee management (toggle availability, edit details)
- Daily limit controls

**Default password:** `flow2024` — change via `NEXT_PUBLIC_ADMIN_PASSWORD`

---

## Stripe Integration

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe dashboard
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   STRIPE_SECRET_KEY=sk_live_xxx
   ```
4. Enable Apple Pay in your Stripe dashboard
5. Implement `stripe-webhook` Netlify Function to confirm payments

---

## Deploying to Netlify

### Automatic Deploy from GitHub

1. Push this repo to GitHub
2. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**
3. Select your repository
4. Build settings (auto-detected from `netlify.toml`):
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_PASSWORD`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (optional)
6. Click **Deploy**

### Required Netlify Plugin

Make sure `@netlify/plugin-nextjs` is installed (it's in `package.json` if you add it).

---

## Database Schema

### `orders`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| order_number | text | e.g. `FLOW-1042` |
| customer_name | text | |
| phone | text | |
| car_number | text | |
| pickup_time | text | |
| notes | text | Optional |
| items | jsonb | Array of `{product_id, product_name, quantity, price}` |
| total | numeric | In AED |
| payment_status | text | `pending / paid / failed` |
| status | text | `placed / confirmed / brewing / ready / delivered / cancelled` |
| created_at | timestamptz | |

### `products`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| name | text | e.g. `Costa Rica — Washed` |
| origin | text | Country |
| process | text | Washed / Natural / Anaerobic |
| notes | text[] | Tasting notes array |
| price | numeric | In AED |
| available_today | boolean | Toggle from admin |

### `settings`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Single row |
| daily_limit | integer | Default: 40 |
| cups_sold | integer | Increments per order |

---

## Project Structure

```
flow-coffee/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── order/page.tsx     # Menu
│   │   ├── checkout/page.tsx  # Checkout
│   │   ├── track/[orderid]/page.tsx  # Tracking
│   │   ├── admin/page.tsx     # Admin dashboard
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── Nav.tsx
│   └── lib/
│       ├── supabase.ts        # DB client + types
│       └── cart.tsx           # Cart context
├── supabase-schema.sql        # Database setup
├── netlify.toml               # Netlify config
├── .env.example
└── README.md
```

---

## License

Built for FLOW Specialty Coffee.
