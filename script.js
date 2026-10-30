import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const supabaseUrl = "https://mvwflakurihhakdrlteg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12d2ZsYWt1cmloaGFrZHJsdGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMjIwMDksImV4cCI6MjEwNDc5ODAwOX0.E09Vufp77NOkpGjJZMH6sbWYInKu_sMzV7eqHX6xQ0A";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const state = { products: [], page: "home" };
const $ = (selector) => document.querySelector(selector);

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function formatPrice(amount, currency = "IDR") {
  if (amount === null || amount === undefined || amount === "") return "Harga belum tersedia";
  try {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(amount));
  } catch {
    return formatFallbackPrice(amount);
  }
}

function formatFallbackPrice(amount) {
  return "Rp" + new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Number(amount) || 0);
}

function displayPrice(product) {
  return product.sale_price != null && product.price != null && Number(product.sale_price) < Number(product.price)
    ? product.sale_price : product.price;
}

function productCard(product) {
  const available = String(product.availability || "").toLowerCase() === "available";
  const image = product.image_url
    ? `<img class="product-image" src="${escapeHTML(product.image_url)}" alt="${escapeHTML(product.title)}" loading="lazy">`
    : '<span class="image-placeholder" aria-hidden="true">ASRI</span>';
  const label = Array.isArray(product.labels) && product.labels.length
    ? `<span class="product-label">${escapeHTML(product.labels[0])}</span>` : "";
  const stock = product.stock_quantity != null
    ? `<span class="stock-count"> · Stok ${escapeHTML(product.stock_quantity)}</span>` : "";
  return `<button class="product-card" type="button" data-product-id="${escapeHTML(product.id)}">
    <span class="product-image-wrap">${image}${label}</span>
    <span class="product-meta">
      <span class="product-brand">${escapeHTML(product.brand || product.category || "ASRI COLLECTION")}</span>
      <strong class="product-title">${escapeHTML(product.title || "Produk")}</strong>
      <span class="product-price">${formatPrice(displayPrice(product), product.currency)}</span>
      <span class="stock-status ${available ? "is-available" : ""}"><span class="status-dot"></span>${available ? "Tersedia" : "Periksa ketersediaan"}${stock}</span>
    </span>
  </button>`;
}

function renderGrid(container, products) {
  if (!products.length) {
    container.innerHTML = '<div class="empty-state"><span class="empty-icon">⌕</span><h3>Produk tidak ditemukan</h3><p>Coba kata kunci lain.</p></div>';
    return;
  }
  container.innerHTML = `<div class="product-grid">${products.map(productCard).join("")}</div>`;
}

function renderError(container, message) {
  container.innerHTML = `<div class="error-state" role="alert"><span class="error-icon">!</span><h3>Katalog belum dapat dimuat</h3><p>${escapeHTML(message)}</p><button class="button button-dark" type="button" data-retry> Coba lagi </button></div>`;
}

function renderProducts() {
  const query = ($("#product-search").value || "").trim().toLowerCase();
  const filtered = state.products.filter((product) =>
    [product.title, product.brand, product.category, product.sku]
      .filter(Boolean).some((value) => String(value).toLowerCase().includes(query))
  );
  $("#product-count").textContent = `${filtered.length} produk`;
  renderGrid($("#all-products"), filtered);
  renderGrid($("#featured-products"), state.products.slice(0, 4));
}

function showPage(page) {
  state.page = page;
  $("#home-page").hidden = page !== "home";
  $("#products-page").hidden = page !== "products";
  document.querySelectorAll("[data-page]").forEach((button) => {
    if (button.classList.contains("nav-button")) {
      const active = button.dataset.page === page;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    }
  });
  if (location.hash !== `#${page}`) history.replaceState(null, "", `#${page}`);
  $(".main-content").scrollTo({ top: 0, behavior: "instant" });
}

function openProduct(product) {
  const image = product.image_url
    ? `<img src="${escapeHTML(product.image_url)}" alt="${escapeHTML(product.title)}">`
    : '<span class="image-placeholder">ASRI</span>';
  const description = product.description && product.description !== "deskripsi belum di atur"
    ? `<p class="detail-description">${escapeHTML(product.description)}</p>` : "";
  const facts = [
    product.sku ? ["SKU", product.sku] : null,
    product.category ? ["Kategori", product.category] : null,
    ["Ketersediaan", product.availability || "Belum diketahui"],
    product.stock_quantity != null ? ["Stok", product.stock_quantity] : null
  ].filter(Boolean);
  $("#product-detail-content").innerHTML = `<section class="detail-panel">
    <div class="detail-image-wrap">${image}</div>
    <div class="detail-copy"><p class="eyebrow">${escapeHTML(product.brand || product.category || "ASRI COLLECTION")}</p>
      <h2 id="detail-title">${escapeHTML(product.title || "Produk")}</h2>
      <p class="detail-price">${formatPrice(displayPrice(product), product.currency)}</p>${description}
      <dl class="detail-facts">${facts.map(([label, value]) => `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>`).join("")}</dl>
      <p class="detail-note">Informasi produk ditampilkan langsung dari katalog Supabase.</p>
    </div></section>`;
  $("#product-dialog").showModal();
}

async function loadProducts() {
  const featured = $("#featured-products");
  const all = $("#all-products");
  featured.innerHTML = '<div class="loading-state"><span class="spinner"></span>Memuat katalog produk...</div>';
  all.innerHTML = '<div class="loading-state"><span class="spinner"></span>Memuat katalog produk...</div>';
  $("#product-count").textContent = "Memuat produk...";
  try {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    state.products = data || [];
    renderProducts();
  } catch (error) {
    state.products = [];
    const message = error?.message || "Terjadi kesalahan saat menghubungkan ke Supabase.";
    renderError(featured, message);
    renderError(all, message);
    $("#product-count").textContent = "Katalog tidak tersedia";
  }
}

document.addEventListener("click", (event) => {
  const pageButton = event.target.closest("[data-page]");
  if (pageButton) showPage(pageButton.dataset.page);

  const productButton = event.target.closest("[data-product-id]");
  if (productButton) {
    const product = state.products.find((item) => String(item.id) === productButton.dataset.productId);
    if (product) openProduct(product);
  }

  if (event.target.closest("[data-close-dialog]")) $("#product-dialog").close();
  if (event.target.closest("[data-retry]")) loadProducts();
});

$("#product-search").addEventListener("input", renderProducts);
$("#product-dialog").addEventListener("click", (event) => {
  if (event.target === $("#product-dialog")) $("#product-dialog").close();
});
$("#current-year").textContent = new Date().getFullYear();
showPage(location.hash === "#products" ? "products" : "home");
loadProducts();
