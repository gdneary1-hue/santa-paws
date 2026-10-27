/* ==========================================================
   PRICES: update them here, in one place.
   Use a number like 8 or 7.50. Leave as null to show "Price coming soon".
   ========================================================== */
const PRICES = {
  treats: 10,       // Holiday Dog Treats (bag)
  accessory: 25,    // Holiday Leash Charm
  bundle: 30        // Holiday Gift Bundle (treats + leash charm)
};

const PRODUCT_NAMES = {
  treats: "Holiday Dog Treats",
  accessory: "Holiday Leash Charm",
  bundle: "Holiday Gift Bundle"
};

const COMING_SOON = "Price coming soon";
const money = (n) => "$" + n.toFixed(2);
const hasPrice = (key) => typeof PRICES[key] === "number";

/* ---------- Show prices on product cards and the order form ---------- */
document.querySelectorAll("[data-price]").forEach((el) => {
  const key = el.dataset.price;
  if (hasPrice(key)) {
    el.textContent = money(PRICES[key]);
    el.classList.remove("is-tbd");
  } else if (el.classList.contains("qty-price")) {
    el.textContent = COMING_SOON;
    el.classList.add("is-tbd");
  }
});

/* Bundle savings badge (only shows when the bundle costs less than buying both) */
const savingsEl = document.querySelector("[data-savings]");
if (savingsEl && hasPrice("treats") && hasPrice("accessory") && hasPrice("bundle")) {
  const savings = PRICES.treats + PRICES.accessory - PRICES.bundle;
  if (savings > 0) {
    savingsEl.textContent = "Save " + (Number.isInteger(savings) ? "$" + savings : money(savings));
    savingsEl.hidden = false;
  }
}

/* ---------- Header: mobile menu, shadow on scroll, active link ---------- */
const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("site-nav");

function setMenu(open) {
  toggle.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("open", open);
}
toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); toggle.focus(); }
});

const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach((a) => {
    const section = document.querySelector(a.getAttribute("href"));
    if (section) observer.observe(section);
  });
}

/* ---------- Order form: quantities and live total ---------- */
const form = document.getElementById("order-form");
const qtyInputs = [...form.querySelectorAll("input[data-product]")];
const totalEl = document.getElementById("order-total");
const summaryField = document.getElementById("order-summary-field");
const qtyError = document.getElementById("qty-error");

function readQty(input) {
  const n = Math.floor(Number(input.value));
  return Number.isFinite(n) && n > 0 ? Math.min(n, Number(input.max) || 50) : 0;
}

function updateTotal() {
  let total = 0;
  let items = 0;
  let missingPrice = false;
  const lines = [];

  qtyInputs.forEach((input) => {
    const key = input.dataset.product;
    const qty = readQty(input);
    if (!qty) return;
    items += qty;
    if (hasPrice(key)) {
      total += qty * PRICES[key];
      lines.push(`${qty} x ${PRODUCT_NAMES[key]} (${money(qty * PRICES[key])})`);
    } else {
      missingPrice = true;
      lines.push(`${qty} x ${PRODUCT_NAMES[key]}`);
    }
  });

  const tbd = items > 0 && missingPrice;
  totalEl.textContent = tbd ? COMING_SOON : money(total);
  totalEl.classList.toggle("is-tbd", tbd);
  summaryField.value = lines.join("; ") + (items ? ` | Total: ${tbd ? COMING_SOON : money(total)}` : "");
  if (items) qtyError.hidden = true;
  return items;
}

qtyInputs.forEach((input) => {
  input.addEventListener("input", updateTotal);
  input.addEventListener("change", () => { input.value = readQty(input); updateTotal(); });
});

form.querySelectorAll(".step-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    input.value = Math.max(0, Math.min(readQty(input) + Number(btn.dataset.step), Number(input.max) || 50));
    updateTotal();
  });
});

/* "Pre-Order" buttons on product cards add one of that item to the form */
document.querySelectorAll("[data-add]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = form.querySelector(`input[data-product="${btn.dataset.add}"]`);
    if (readQty(input) === 0) input.value = 1;
    updateTotal();
  });
});

updateTotal();

/* ---------- Order form: validation and submit (Formspree) ---------- */
const statusEl = document.getElementById("form-status");
const thankYou = document.getElementById("thank-you");
const submitBtn = document.getElementById("submit-btn");
const fulfillmentError = document.getElementById("fulfillment-error");

function validate() {
  let firstBad = null;
  ["name", "email"].forEach((id) => {
    const field = document.getElementById(id);
    const ok = field.checkValidity() && field.value.trim() !== "";
    field.setAttribute("aria-invalid", String(!ok));
    if (!ok && !firstBad) firstBad = field;
  });

  const hasItems = updateTotal() > 0;
  qtyError.hidden = hasItems;
  if (!hasItems && !firstBad) firstBad = qtyInputs[0];

  const fulfillment = form.querySelector('input[name="fulfillment"]:checked');
  fulfillmentError.hidden = Boolean(fulfillment);
  if (!fulfillment && !firstBad) firstBad = form.querySelector('input[name="fulfillment"]');

  if (firstBad) {
    statusEl.textContent = "Almost there! Please fill in the highlighted fields.";
    statusEl.hidden = false;
    firstBad.focus();
    return false;
  }
  statusEl.hidden = true;
  return true;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validate()) return;

  const notConnected = form.action.includes("YOUR_FORM_ID");
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  try {
    if (!notConnected) {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });
      if (!res.ok) throw new Error("Formspree error " + res.status);
    }
    const firstName = document.getElementById("name").value.trim().split(/\s+/)[0];
    document.getElementById("thank-you-name").textContent = firstName ? ", " + firstName : "";
    document.getElementById("preview-note").hidden = !notConnected;
    form.hidden = true;
    thankYou.hidden = false;
    thankYou.focus();
  } catch (err) {
    statusEl.textContent = "Sorry, something went wrong sending your order. Please try again in a moment.";
    statusEl.hidden = false;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Place My Pre-Order";
  }
});

document.getElementById("order-again").addEventListener("click", () => {
  form.reset();
  form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
  updateTotal();
  thankYou.hidden = true;
  form.hidden = false;
  document.getElementById("name").focus();
});
