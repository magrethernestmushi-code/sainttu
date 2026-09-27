// English storefront copy, looked up by data-i18n keys in the HTML and by
// app.js / checkout.js for dynamic text (cart, checkout, etc).
const SAINTTU_I18N = {
  en: {
    dir: "ltr",
    cart: "Cart",
    heroEyebrow: "A house of considered things",
    heroTitle: "Sainttu",
    heroSub: "Pieces chosen slowly, made to last. Pay by Visa card, checkout in under a minute.",
    heroCta: "View the collection",
    collectionTitle: "The Collection",
    collectionSub: "Every piece below is added and priced by Sainttu directly.",
    aboutTitle: "About Sainttu",
    aboutBody: "Sainttu is a small, independent storefront. We add what we sell ourselves, and every order is paid for securely by Visa card at checkout.",
    footerSecure: "Secured checkout · Visa accepted",
    yourCart: "Your Cart",
    total: "Total",
    checkout: "Checkout with Visa",
    checkoutTitle: "Checkout",
    orderSummary: "Order summary",
    payTitle: "Pay by Visa",
    payNote: "You'll enter your card details on Stripe's secure payment page. Sainttu never sees or stores your card number.",
    email: "Email for receipt",
    payBtn: "Pay with Visa",
    secureBadge: "🔒 Encrypted checkout · Visa, Mastercard supported",
    addToCart: "Add to cart",
    emptyCart: "Your cart is empty.",
    noProducts: "No products yet — add some in data/products.json.",
    deliverToDefault: "Deliver to — set your location",
    deliveryTitle: "Delivery location",
    shareLocation: "Share my location",
    name: "Full name",
    phone: "Phone number",
    whatsappBtn: "Order via WhatsApp",
    orDivider: "or"
  }
};

function sainttuApplyLang(lang) {
  const dict = SAINTTU_I18N[lang] || SAINTTU_I18N.en;
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });
}

document.addEventListener("DOMContentLoaded", () => sainttuApplyLang("en"));
