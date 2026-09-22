# ATM Card Design & Customization System

Plain HTML/CSS/JS frontend with Supabase as the backend (database + image storage).

## What's included

```
index.html          Home page
customize.html       Template / color / pattern / name / image picker + live preview
order.html            Contact form, submits the order to Supabase
admin.html            Passcode-gated dashboard listing all orders
css/style.css         All styling
js/card-options.js    Template, color, and pattern definitions (edit these to add options)
js/supabase-config.js Your Supabase project URL + anon key
js/customize.js       Customize page logic
js/order.js           Order page logic (image upload + insert)
js/admin.js           Admin page logic (fetch + status updates)
schema.sql            Run this in Supabase to create the table, policies, and storage bucket
```

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier works fine).

2. **Run the schema.** Open the SQL Editor in your Supabase dashboard, paste in the contents of `schema.sql`, and run it. This creates:
   - an `orders` table
   - Row Level Security policies that let the public order form insert rows, and let the admin page read/update them
   - a public `card-images` storage bucket for uploaded photos

3. **Connect the frontend.** In Supabase, go to **Project Settings → API** and copy your **Project URL** and **anon public key**. Paste them into `js/supabase-config.js`:

   ```js
   const SUPABASE_URL = "https://xxxxx.supabase.co";
   const SUPABASE_ANON_KEY = "eyJhbGciOi...";
   ```

4. **Set an admin passcode.** Open `js/admin.js` and change `ADMIN_PASSCODE` to something of your own.

5. **Open `index.html`** in a browser (or serve the folder with any static file server) — no build step needed.

## How the pieces fit together

- Card **templates, colors, and patterns** are plain JS config in `card-options.js` — no database table for these, since they don't change per customer. Add or edit entries there to change what's offered.
- When a visitor customizes a card, their choices are kept in the browser's `sessionStorage` (not the database yet) so they carry over from the Customize page to the Order page.
- Submitting the order page is the only point that talks to Supabase: it uploads the optional image to Storage, then inserts one row into `orders` with the contact details, the chosen design, and the image's public URL.
- The admin page reads every row from `orders`, shows summary counts, and lets you change each order's status (`pending` → `in_production` → `completed`, or `cancelled`).

## Security notes (read before going live)

This is intentionally kept simple for a small/learning project:

- The **admin passcode is a client-side check only** — it's not real authentication. Anyone who views the page source can see it, and the Supabase anon key is always visible in the browser regardless of any password screen.
- The current `schema.sql` policies let **anyone with the anon key read and update all orders**, so the admin page works without a real login.

Before handling real customers, swap this for **Supabase Auth**: create an admin user, sign in on `admin.html` with `supabaseClient.auth.signInWithPassword(...)`, and change the `orders` SELECT/UPDATE policies to `to authenticated` instead of `to anon`. That keeps orders readable only by signed-in staff.

## Extending it

- Add more templates/colors/patterns in `js/card-options.js` — the customize page and admin page both read from that file automatically.
- To email customers on status change, add a Supabase Edge Function triggered by updates to `orders.status`.
- To require sign-in before ordering, add Supabase Auth on `order.html` and store `user_id` on each order.
