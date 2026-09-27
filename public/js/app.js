const SAINTTU_CART_KEY = "sainttu_cart";

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

async function loadProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  try {
    const res = await fetch("data/products.json");
    const products = await res.json();
    const lang = document.documentElement.lang === "ar" ? "ar" : "en";
    const dict = SAINTTU_I18N[lang];

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

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());
  document.getElementById("cartBtn")?.addEventListener("click", openCart);
  document.getElementById("closeCart")?.addEventListener("click", closeCart);
  document.getElementById("cartOverlay")?.addEventListener("click", closeCart);
  document.getElementById("langToggle")?.addEventListener("click", () => {
    setTimeout(() => { loadProducts(); renderCart(); }, 0);
  });
  loadProducts();
  renderCart();
});
