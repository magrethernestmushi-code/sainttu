// Minimal EN / AR text + direction toggle.
// Add more keys here as you add more storefront copy.
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
    noProducts: "No products yet — add some in data/products.json."
  },
  ar: {
    dir: "rtl",
    cart: "السلة",
    heroEyebrow: "بيت للأشياء المُختارة بعناية",
    heroTitle: "سينتو",
    heroSub: "قطع تُختار بتأنٍّ، وتُصنع لتدوم. ادفع ببطاقة فيزا، وأتمم الشراء في أقل من دقيقة.",
    heroCta: "تصفّح المجموعة",
    collectionTitle: "المجموعة",
    collectionSub: "كل قطعة أدناه أضافها وحدّد سعرها سينتو مباشرة.",
    aboutTitle: "عن سينتو",
    aboutBody: "سينتو متجر صغير ومستقل. نضيف ما نبيعه بأنفسنا، ويتم دفع كل طلب بأمان ببطاقة فيزا عند إتمام الشراء.",
    footerSecure: "دفع آمن · فيزا مقبولة",
    yourCart: "سلتك",
    total: "الإجمالي",
    checkout: "إتمام الشراء بفيزا",
    checkoutTitle: "إتمام الشراء",
    orderSummary: "ملخص الطلب",
    payTitle: "الدفع بفيزا",
    payNote: "ستدخل بيانات بطاقتك على صفحة الدفع الآمنة الخاصة بـ Stripe. سينتو لا يرى أو يخزن رقم بطاقتك أبدًا.",
    email: "البريد الإلكتروني للإيصال",
    payBtn: "ادفع بفيزا",
    secureBadge: "🔒 دفع مشفّر · فيزا وماستركارد مقبولتان",
    addToCart: "أضف إلى السلة",
    emptyCart: "سلتك فارغة.",
    noProducts: "لا توجد منتجات بعد — أضف بعضها في data/products.json."
  }
};

function sainttuApplyLang(lang) {
  const dict = SAINTTU_I18N[lang];
  if (!dict) return;
  document.documentElement.lang = lang;
  document.documentElement.dir = dict.dir;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });
  localStorage.setItem("sainttu_lang", lang);
}

function sainttuInitLang() {
  const saved = localStorage.getItem("sainttu_lang") || "en";
  sainttuApplyLang(saved);
  const toggle = document.getElementById("langToggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const current = document.documentElement.lang === "ar" ? "en" : "ar";
      sainttuApplyLang(current);
    });
  }
}

document.addEventListener("DOMContentLoaded", sainttuInitLang);
