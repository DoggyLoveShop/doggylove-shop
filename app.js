"use strict";

/* ---------- Datos ---------- */
const PRODUCTS = [
  { id: 1,  name: "Alimento premium adulto 8 kg", category: "Alimento", price: 142000, image: IMAGES["alimento-adulto"], emoji: "🥣", tint: "#FFF1CC" },
  { id: 2,  name: "Alimento adulto 3 kg",          category: "Alimento", price: 68000,  image: IMAGES["alimento-adulto-3kg"], emoji: "🍖", tint: "#FFF1CC" },
  { id: 3,  name: "Snacks dentales x12",          category: "Alimento", price: 24000,  image: IMAGES["snacks-dentales"], emoji: "🦴", tint: "#FFF1CC" },
  { id: 4,  name: "Shampoo de avena 500 ml",      category: "Higiene",  price: 28000,  image: IMAGES["shampoo-avena"], emoji: "🧴", tint: "#DDF0F7" },
  { id: 5,  name: "Cepillo desenredante y peine",         category: "Higiene",  price: 19000,  image: IMAGES["cepillo"], emoji: "🪮", tint: "#DDF0F7" },
  { id: 6,  name: "Cortauñas con protector",      category: "Higiene",  price: 21000,  image: IMAGES["cortaunas"], emoji: "✂️", tint: "#DDF0F7" },
  { id: 7,  name: "Pelota dental de caucho",       category: "Juguetes", price: 12000,  image: IMAGES["pelota"], emoji: "🎾", tint: "#FFE0DA" },
  { id: 8,  name: "Cuerda de algodón",            category: "Juguetes", price: 15000,  image: IMAGES["cuerda"], emoji: "🪢", tint: "#FFE0DA" },
  { id: 9,  name: "Collar ajustable reflectivo",  category: "Paseo",    price: 26000,  image: IMAGES["collar"], emoji: "🦮", tint: "#DDF3E8" },
  { id: 10, name: "Correa de 1.5 m",              category: "Paseo",    price: 32000,  image: IMAGES["correa"], emoji: "🐕", tint: "#DDF3E8" },
  { id: 11, name: "Cama ortopédica mediana",      category: "Descanso", price: 115000, image: IMAGES["cama"], emoji: "🛏️", tint: "#E8E3FA" },
  { id: 12, name: "Impermeable talla M",          category: "Paseo",    price: 45000,  image: IMAGES["impermeable"], emoji: "🧥", tint: "#DDF3E8" }
];

const STORAGE_KEY = "doggylove-cart-v1";
const state = { query: "", category: "Todos", sort: "name", cart: loadCart() };

/* ---------- Utilidades ---------- */
const $ = (sel) => document.querySelector(sel);
const money = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const byId = (id) => PRODUCTS.find((p) => p.id === id);

function loadCart() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function saveCart() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart)); }
  catch { /* almacenamiento no disponible: el carrito sigue en memoria */ }
}
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}

/* ---------- Catálogo ---------- */
function visibleProducts() {
  const q = state.query.trim().toLowerCase();
  const list = PRODUCTS.filter((p) =>
    (state.category === "Todos" || p.category === state.category) &&
    p.name.toLowerCase().includes(q)
  );
  const sorters = {
    name: (a, b) => a.name.localeCompare(b.name, "es"),
    asc:  (a, b) => a.price - b.price,
    desc: (a, b) => b.price - a.price
  };
  return list.sort(sorters[state.sort]);
}

function renderChips() {
  const cats = ["Todos", ...new Set(PRODUCTS.map((p) => p.category))];
  $("#chips").innerHTML = cats.map((c) =>
    `<button class="chip" data-cat="${c}" aria-pressed="${c === state.category}">${c}</button>`
  ).join("");
  $("#statCats").textContent = cats.length - 1;
}

function renderGrid() {
  const items = visibleProducts();
  $("#grid").innerHTML = items.length
    ? items.map((p) => `
      <article class="card">
        <div class="pic" style="--tint:${p.tint}" aria-hidden="true">${p.image ? `<img src="${p.image}" alt="" loading="lazy" data-emoji="${p.emoji}">` : p.emoji}</div>
        <span class="cat">${p.category}</span>
        <h3>${p.name}</h3>
        <div class="row">
          <span class="price">${money.format(p.price)}</span>
          <button class="btn" data-add="${p.id}" aria-label="Agregar ${p.name} al carrito">Agregar</button>
        </div>
      </article>`).join("")
    : `<p class="empty">No encontramos productos con esa búsqueda. Prueba con otra palabra o cambia la categoría.</p>`;
  $("#statProducts").textContent = items.length;
}

/* ---------- Carrito ---------- */
function cartTotals() {
  let units = 0, total = 0;
  for (const [id, qty] of Object.entries(state.cart)) {
    units += qty;
    total += byId(Number(id)).price * qty;
  }
  return { units, total };
}

function renderCart() {
  const entries = Object.entries(state.cart);
  $("#cartList").innerHTML = entries.length
    ? entries.map(([id, qty]) => {
        const p = byId(Number(id));
        return `<li>
          <strong>${p.emoji} ${p.name}</strong>
          <span class="price">${money.format(p.price * qty)}</span>
          <div class="qty">
            <button data-dec="${id}" aria-label="Quitar una unidad">−</button>
            <span aria-live="polite">${qty}</span>
            <button data-inc="${id}" aria-label="Agregar una unidad">+</button>
          </div>
          <button class="chip" data-del="${id}">Eliminar</button>
        </li>`;
      }).join("")
    : `<li><span style="grid-column:1/-1;color:var(--muted)">Tu carrito está vacío. Agrega productos desde el catálogo.</span></li>`;

  const { units, total } = cartTotals();
  $("#count").textContent = units;
  $("#statCart").textContent = units;
  $("#statTotal").textContent = money.format(total);
  $("#cartTotal").textContent = money.format(total);
  saveCart();
}

function changeQty(id, delta) {
  const next = (state.cart[id] || 0) + delta;
  if (next <= 0) delete state.cart[id];
  else state.cart[id] = next;
  renderCart();
}

function setDrawer(open) {
  $("#drawer").classList.toggle("open", open);
  $("#scrim").classList.toggle("open", open);
  $("#drawer").setAttribute("aria-hidden", String(!open));
  $("#openCart").setAttribute("aria-expanded", String(open));
  if (open) $("#closeCart").focus(); else $("#openCart").focus();
}

/* ---------- Eventos (delegación) ---------- */
$("#grid").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-add]");
  if (!btn) return;
  const id = Number(btn.dataset.add);
  changeQty(id, 1);
  toast(`${byId(id).name} agregado al carrito`);
});

// Si la foto no existe o falla al cargar, se muestra el emoji del producto
$("#grid").addEventListener("error", (e) => {
  const img = e.target;
  if (img.tagName === "IMG") img.replaceWith(document.createTextNode(img.dataset.emoji || "🐾"));
}, true);

$("#chips").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-cat]");
  if (!chip) return;
  state.category = chip.dataset.cat;
  renderChips();
  renderGrid();
});

$("#q").addEventListener("input", (e) => { state.query = e.target.value; renderGrid(); });
$("#sort").addEventListener("change", (e) => { state.sort = e.target.value; renderGrid(); });

$("#cartList").addEventListener("click", (e) => {
  const t = e.target;
  if (t.dataset.inc) changeQty(Number(t.dataset.inc), 1);
  if (t.dataset.dec) changeQty(Number(t.dataset.dec), -1);
  if (t.dataset.del) { delete state.cart[t.dataset.del]; renderCart(); }
});

$("#openCart").addEventListener("click", () => setDrawer(true));
$("#closeCart").addEventListener("click", () => setDrawer(false));
$("#scrim").addEventListener("click", () => setDrawer(false));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && $("#drawer").classList.contains("open")) setDrawer(false);
});

$("#checkout").addEventListener("click", () => {
  const { units, total } = cartTotals();
  if (!units) { toast("Agrega al menos un producto"); return; }
  toast(`Pedido de ${units} artículos por ${money.format(total)} listo para enviar`);
});

/* ---------- Validación del formulario ---------- */
const rules = {
  name:  (v) => v.trim().length >= 3 ? "" : "Escribe tu nombre completo (mínimo 3 letras).",
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Escribe un correo válido, por ejemplo nombre@correo.com.",
  msg:   (v) => v.trim().length >= 10 ? "" : "Cuéntanos un poco más (mínimo 10 caracteres)."
};

function validateField(id) {
  const input = $("#" + id);
  const error = rules[id](input.value);
  $("#e-" + id).textContent = error;
  input.setAttribute("aria-invalid", String(Boolean(error)));
  return !error;
}

Object.keys(rules).forEach((id) => $("#" + id).addEventListener("blur", () => validateField(id)));

$("#form").addEventListener("submit", (e) => {
  e.preventDefault();
  const results = Object.keys(rules).map(validateField);
  if (results.every(Boolean)) {
    e.target.reset();
    $("#formOk").hidden = false;
  } else {
    $("#formOk").hidden = true;
    $("#" + Object.keys(rules)[results.indexOf(false)]).focus();
  }
});

/* ---------- Inicio ---------- */
$("#year").textContent = new Date().getFullYear();
renderChips();
renderGrid();
renderCart();
