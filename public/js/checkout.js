function renderSummary() {
  const cart = getCart();
  const itemsEl = document.getElementById("summaryItems");
  const totalEl = document.getElementById("summaryTotal");
  if (!itemsEl) return;

  itemsEl.innerHTML = "";
  cart.forEach(item => {
    const row = document.createElement("div");
    row.className = "summary-item";
    row.innerHTML = `<span>${item.name} × ${item.qty}</span><span>${formatMoney(item.price * item.qty, item.currency)}</span>`;
    itemsEl.appendChild(row);
  });
  totalEl.textContent = formatMoney(cartTotal(cart), cart[0]?.currency || "USD");
}

async function initWhatsappOrder() {
  const btn = document.getElementById("whatsappBtn");
  if (!btn) return;
  let whatsappNumber = "";
  try {
    const res = await fetch("/api/config");
    if (res.ok) {
      const data = await res.json();
      whatsappNumber = data.whatsappNumber || "";
    }
  } catch {
    // Config fetch failed — button stays disabled below.
  }

  if (!whatsappNumber) {
    btn.disabled = true;
    btn.title = "WhatsApp ordering isn't set up yet";
    return;
  }

  btn.addEventListener("click", () => {
    const cart = getCart();
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }
    const name = document.getElementById("fullName")?.value;
    const phone = document.getElementById("phone")?.value;
    if (!name || !phone) {
      alert("Please add your name and phone number first.");
      return;
    }
    window.open(buildWhatsAppOrderLink(whatsappNumber), "_blank");
  });
}

function initCheckoutLocation() {
  const btn = document.getElementById("checkoutLocationBtn");
  const textEl = document.getElementById("checkoutLocationText");
  if (!btn || !textEl) return;

  const saved = getSavedLocation();
  if (saved) textEl.textContent = saved.label;

  btn.addEventListener("click", () => {
    textEl.textContent = "Locating…";
    requestLocation((loc, err) => {
      textEl.textContent = loc ? loc.label : (err || "Could not get location");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());
  renderSummary();
  initCheckoutLocation();
  initWhatsappOrder();

  const form = document.getElementById("contactForm");
  const payBtn = document.getElementById("payBtn");
  const errorEl = document.getElementById("payError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    const cart = getCart();
    if (cart.length === 0) {
      errorEl.textContent = "Your cart is empty.";
      errorEl.hidden = false;
      return;
    }

    payBtn.disabled = true;
    payBtn.textContent = "Redirecting to secure payment…";

    try {
      // Only send product IDs and quantities — the server looks up real prices
      // itself so a shopper can never change the amount charged from the browser.
      const items = cart.map(i => ({ id: i.id, qty: i.qty }));
      const email = document.getElementById("email").value;

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, email })
      });

      if (!res.ok) throw new Error("Could not start payment session");
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // Stripe-hosted secure card page
      } else {
        throw new Error("No payment URL returned");
      }
    } catch (err) {
      console.error(err);
      errorEl.textContent = "Something went wrong starting payment. Please try again.";
      errorEl.hidden = false;
      payBtn.disabled = false;
      payBtn.textContent = "Pay with Visa";
    }
  });
});
