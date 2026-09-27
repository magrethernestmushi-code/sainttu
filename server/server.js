// Sainttu backend — creates secure Stripe Checkout sessions for card payment.
//
// HOW THE MONEY REACHES YOUR ACCOUNT:
// This server never touches your card details or your bank/forex account directly.
// It calls Stripe, which hosts the actual card-entry page and processes the Visa
// charge. Stripe then settles (pays out) the money on a schedule to whatever
// bank account or currency payout you configure in your Stripe Dashboard, under
// Settings -> Bank accounts and currencies / Payouts. That destination account is
// what makes it "your forex account" — it is a Stripe account setting, not code.
// See README.md for the exact steps.

require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const Stripe = require("stripe");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 4242;
const SITE_URL = process.env.SITE_URL || `http://localhost:${PORT}`;

app.use(express.static(path.join(__dirname, "..", "public")));

// Stripe webhook needs the raw body, so it's registered before express.json()
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    let event = req.body;

    if (process.env.STRIPE_WEBHOOK_SECRET) {
      const sig = req.headers["stripe-signature"];
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (err) {
        console.error("Webhook signature check failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("Payment confirmed for session:", session.id, session.customer_details?.email);
      // TODO: mark the order as paid in your own order storage, send a
      // confirmation email, notify Geamos Techwave systems, etc.
    }

    res.json({ received: true });
  }
);

app.use(express.json());

function loadProducts() {
  const file = path.join(__dirname, "..", "public", "data", "products.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

// Creates a Stripe Checkout session priced from the server's own product list,
// so a shopper can never pay less than the real price by editing the page.
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { items, email } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const products = loadProducts();

    const line_items = items.map(({ id, qty }) => {
      const product = products.find(p => p.id === id);
      if (!product) throw new Error(`Unknown product id: ${id}`);
      const quantity = Math.max(1, Math.min(20, parseInt(qty, 10) || 1));
      return {
        quantity,
        price_data: {
          currency: (product.currency || "USD").toLowerCase(),
          unit_amount: Math.round(product.price * 100), // Stripe uses smallest currency unit
          product_data: { name: product.name, description: product.description || undefined }
        }
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"], // covers Visa and Mastercard
      line_items,
      customer_email: email || undefined,
      success_url: `${SITE_URL}/success.html`,
      cancel_url: `${SITE_URL}/cancel.html`
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Sainttu server running at ${SITE_URL}`);
});
