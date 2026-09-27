# Sainttu

A storefront: browse products, add to cart, pay by Visa card, and get a receipt.
You add and price your own products — nothing here invents inventory for you.

## How the payment actually reaches your account (read this first)

No website can move a Visa payment straight into a bank/forex account by writing
custom code — every legitimate business online routes card payments through a
licensed payment processor first, both by law and for basic fraud protection.
This project uses **Stripe** to do that:

1. A shopper clicks "Pay with Visa" → your server (`server/server.js`) asks
   Stripe to create a secure payment page for the exact order total.
2. The shopper enters their card details **on Stripe's own page**, not yours.
   Sainttu's code never sees or stores the card number.
3. Stripe charges the Visa card and confirms the payment back to your server.
4. Stripe then **pays out** the money on its normal schedule (daily/weekly) to
   whichever bank account or currency you've set as your payout destination —
   this is a setting in your Stripe account, not something in this code.

### Where to point it at your forex account
In your Stripe Dashboard: **Settings → Bank accounts and currencies → Add
bank account**, add your forex/foreign-currency account's details, and set it
as the payout destination. If your bank is in Tanzania and doesn't support a
currency Stripe pays out in directly, you may need Stripe's multi-currency
settlement, or a processor with local payout support (Flutterwave, DPO Pay,
Selcom, Pesapal are common alternatives in East Africa) — happy to swap the
integration to one of those instead if Stripe doesn't fit your bank.

## Project structure

```
sainttu/
  public/            the website (frontend)
    index.html        storefront + product grid
    checkout.html      order summary + Visa payment
    success.html       shown after a successful payment
    cancel.html         shown if payment is cancelled
    data/products.json  your product catalog — EDIT THIS to add real products
    css/style.css
    js/
  server/            the backend (creates Stripe payment sessions)
    server.js
    package.json
    .env.example       copy to .env and fill in your real Stripe keys
```

## Adding your products
Open `public/data/products.json` and edit the list — each product needs:

```json
{
  "id": "sainttu-004",
  "name": "Product name",
  "description": "One line about it",
  "price": 39.00,
  "currency": "USD",
  "image": "https://your-image-url.jpg"
}
```

Prices shown to shoppers and prices actually charged both come from this one
file — the server re-reads it for every checkout, so nobody can change what
they pay by editing the page in their browser.

## Running it locally
```
cd server
npm install
cp .env.example .env      # then fill in your real Stripe secret key
npm start
```
Open http://localhost:4242 — the server also serves the frontend, so you
don't need a separate step for that.

## Getting a Stripe account
1. Sign up at stripe.com (business details, bank/forex account for payouts).
2. Dashboard → Developers → API keys → copy the **secret key** into `.env`.
3. Once you're ready to go live, switch from Stripe's test keys to live keys,
   and Stripe will verify your business before real payouts start.

## Deploying
Any Node host works (Render, Railway, a VPS, etc.). Set the same environment
variables from `.env` in your host's dashboard, set `SITE_URL` to your real
domain, and add a webhook endpoint in Stripe pointing at
`https://yourdomain.com/api/webhook` so order confirmations are logged
server-side even if a shopper closes their browser right after paying.

## Language
The site has an EN / عربي toggle in the header (see `public/js/i18n.js`).
Add more phrases there as you add more storefront copy.
