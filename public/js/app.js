const SAINTTU_CART_KEY = "sainttu_cart";
const SAINTTU_LOCATION_KEY = "sainttu_location";

function getSavedLocation() {
  try {
    return JSON.parse(localStorage.getItem(SAINTTU_LOCATION_KEY)) || null;
  } catch {
    return null;
  }
}

function saveLocation(loc) {
  localStorage.setItem(SAINTTU_LOCATION_KEY, JSON.stringify(loc));
}

// Amazon/Bolt-style "deliver to" location: asks the browser for GPS coordinates,
// then turns them into a readable place name via OpenStreetMap's free reverse
// geocoding (no API key needed). Falls back gracefully if the shopper declines.
function requestLocation(onDone) {
  if (!navigator.geolocation) {
    onDone(null, "Location not supported on this device");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      let label = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`,
          { headers: { "Accept-Language": "en" } }
        );
        if (res.ok) {
          const data = await res.json();
          const a = data.address || {};
          label = [a.suburb || a.neighbourhood || a.road, a.city || a.town || a.county, a.country]
            .filter(Boolean)
            .join(", ") || label;
        }
      } catch {
        // Reverse geocoding failed — keep the raw coordinates as the label.
      }
      const loc = { lat: latitude, lng: longitude, label };
      saveLocation(loc);
      onDone(loc, null);
    },
    (err) => {
      onDone(null, err.message || "Could not get your location");
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function buildWhatsAppOrderLink(whatsappNumber) {
  const cart = getCart();
  const loc = getSavedLocation();
  const name = document.getElementById("fullName")?.value || "";
  const phone = document.getElementById("phone")?.value || "";

  const lines = [
    "New order — Sainttu",
    "",
    ...cart.map(i => `• ${i.name} x${i.qty} — ${formatMoney(i.price * i.qty, i.currency)}`),
    "",
    `Total: ${formatMoney(cartTotal(cart), cart[0]?.currency || "USD")}`,
    "",
    `Name: ${name}`,
    `Phone: ${phone}`,
    loc ? `Delivery location: ${loc.label} (https://maps.google.com/?q=${loc.lat},${loc.lng})` : "Delivery location: not shared"
  ];
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${whatsappNumber}?text=${text}`;
}


function getCart() {
  try {
    return JSON.parse(localStorage.getItem(SAINTTU_CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(SAINTTU_CART_KEY, JSON.stringify(cart));
  renderCart();
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, currency: product.currency, qty: 1 });
  }
  saveCart(cart);
  openCart();
}

function removeFromCart(id) {
  saveCart(getCart().filter(item => item.id !== id));
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function formatMoney(amount, currency) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(amount);
}

function renderCart() {
  const cart = getCart();
  const lang = document.documentElement.lang === "ar" ? "ar" : "en";
  const dict = SAINTTU_I18N[lang];

  const countEl = document.getElementById("cartCount");
  if (countEl) countEl.textContent = cart.reduce((n, i) => n + i.qty, 0);

  const itemsEl = document.getElementById("cartItems");
  if (itemsEl) {
    itemsEl.innerHTML = "";
    if (cart.length === 0) {
      itemsEl.innerHTML = `<p class="empty-note">${dict.emptyCart}</p>`;
    } else {
      cart.forEach(item => {
        const row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML = `
          <div>
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-qty">x${item.qty} · ${formatMoney(item.price, item.currency)}</div>
            <button class="remove-item" data-id="${item.id}">&times;</button>
          </div>
          <div>${formatMoney(item.price * item.qty, item.currency)}</div>
        `;
        itemsEl.appendChild(row);
      });
      itemsEl.querySelectorAll(".remove-item").forEach(btn => {
        btn.addEventListener("click", () => removeFromCart(btn.dataset.id));
      });
    }
  }

  const totalEl = document.getElementById("cartTotal");
  if (totalEl) totalEl.textContent = formatMoney(cartTotal(cart), cart[0]?.currency || "USD");
}

function openCart() {
  document.getElementById("cartDrawer")?.classList.add("open");
  document.getElementById("cartOverlay")?.classList.add("open");
}
function closeCart() {
  document.getElementById("cartDrawer")?.classList.remove("open");
  document.getElementById("cartOverlay")?.classList.remove("open");
}

let SAINTTU_ACTIVE_CATEGORY = "All";

function renderCategoryTabs(products) {
  const tabsEl = document.getElementById("categoryTabs");
  if (!tabsEl) return;
  const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];
  tabsEl.innerHTML = "";
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "category-tab" + (cat === SAINTTU_ACTIVE_CATEGORY ? " active" : "");
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      SAINTTU_ACTIVE_CATEGORY = cat;
      loadProducts();
    });
    tabsEl.appendChild(btn);
  });
}

async function loadProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  try {
    const res = await fetch("data/products.json");
    const allProducts = await res.json();
    const lang = document.documentElement.lang === "ar" ? "ar" : "en";
    const dict = SAINTTU_I18N[lang];

    renderCategoryTabs(allProducts);
    const products = SAINTTU_ACTIVE_CATEGORY === "All"
      ? allProducts
      : allProducts.filter(p => p.category === SAINTTU_ACTIVE_CATEGORY);

    if (!products.length) {
      grid.innerHTML = `<p class="empty-note">${dict.noProducts}</p>`;
      return;
    }

    grid.innerHTML = "";
    products.forEach(product => {
      const card = document.createElement("div");
      card.className = "product-card";
      const bg = product.image ? `background-image:url('${product.image}')` : "";
      card.innerHTML = `
        <div class="product-image" style="${bg}"></div>
        <div class="product-body">
          <div class="product-name">${product.name}</div>
          <div class="product-desc">${product.description || ""}</div>
          <div class="product-price">${formatMoney(product.price, product.currency)}</div>
          <button class="add-btn">${dict.addToCart}</button>
        </div>
      `;
      card.querySelector(".add-btn").addEventListener("click", () => addToCart(product));
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = `<p class="empty-note">Could not load products.json</p>`;
    console.error(err);
  }
}

function initLocationBar() {
  const btn = document.getElementById("locationBtn");
  const textEl = document.getElementById("locationText");
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
  document.getElementById("cartBtn")?.addEventListener("click", openCart);
  document.getElementById("closeCart")?.addEventListener("click", closeCart);
  document.getElementById("cartOverlay")?.addEventListener("click", closeCart);
  document.getElementById("langToggle")?.addEventListener("click", () => {
    setTimeout(() => { loadProducts(); renderCart(); }, 0);
  });
  initLocationBar();
  loadProducts();
  renderCart();
});
