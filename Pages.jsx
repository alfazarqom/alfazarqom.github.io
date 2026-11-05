const AsriPages = (() => {
  const h = React.createElement;
  const money = (value, currency = "IDR") => {
    const number = Number(value);
    if (!Number.isFinite(number)) return "Harga belum tersedia";
    try { return new Intl.NumberFormat("id-ID", { style: "currency", currency, maximumFractionDigits: 0 }).format(number); }
    catch { return "Rp" + number.toLocaleString("id-ID"); }
  };
  const price = product => product?.sale_price != null && Number(product.sale_price) < Number(product.price) ? product.sale_price : product?.price;
  const available = product => String(product?.availability || "").trim().toLowerCase() === "available";
  const idOf = product => String(product?.id ?? product?.sku ?? "");
  function Footer() {
    return h("footer", { className: "page-footer" },
      h("span", { className: "footer-brand" }, "ASRI COLLECTION"),
      h("span", null, "Considered style, made personal."),
      h("span", null, "© " + new Date().getFullYear() + " Asri Collection"));
  }
  function Heading({ eyebrow, title, description }) {
    return h("div", { className: "catalog-heading" },
      h("p", { className: "eyebrow" }, eyebrow || "ASRI COLLECTION"),
      h("h1", null, title),
      description ? h("p", null, description) : null);
  }
  function Empty({ title, description, action, actionLabel }) {
    return h("div", { className: "empty-state" },
      h("span", { className: "empty-icon", "aria-hidden": "true" }, "⌕"),
      h("h3", null, title), h("p", null, description),
      action ? h("button", { className: "button button-dark", type: "button", onClick: action }, actionLabel || "Lanjutkan") : null);
  }
  function ProductGrid({ products, onOpen, wishlistIds = [], onToggleWishlist }) {
    if (!products.length) return h(Empty, { title: "Produk tidak ditemukan", description: "Coba kata kunci lain atau jelajahi katalog." });
    return h("div", { className: "product-grid" }, products.map(product =>
      h("article", { className: "product-card-wrap", key: idOf(product) },
        h("button", { className: "product-card", type: "button", onClick: () => onOpen(product) },
          h("span", { className: "product-image-wrap" },
            product.image_url ? h("img", { className: "product-image", src: product.image_url, alt: product.title || "Produk", loading: "lazy" }) : h("span", { className: "image-placeholder" }, "ASRI"),
            Array.isArray(product.labels) && product.labels.length ? h("span", { className: "product-label" }, product.labels[0]) : null),
          h("span", { className: "product-meta" },
            h("span", { className: "product-brand" }, product.brand || product.category || "ASRI COLLECTION"),
            h("strong", { className: "product-title" }, product.title || "Produk"),
            h("span", { className: "product-price" }, money(price(product), product.currency)),
            h("span", { className: "stock-status " + (available(product) ? "is-available" : "") }, available(product) ? "Tersedia" : "Tidak tersedia untuk dibeli"))),
        h("button", { className: "wishlist-toggle " + (wishlistIds.includes(idOf(product)) ? "is-selected" : ""), type: "button", "aria-label": wishlistIds.includes(idOf(product)) ? "Hapus dari wishlist" : "Tambah ke wishlist", onClick: () => onToggleWishlist(product) }, wishlistIds.includes(idOf(product)) ? "♥" : "♡")));
  }
  function Detail({ product, wishlistIds, onToggleWishlist, onAdd }) {
    if (!product) return h(Empty, { title: "Produk tidak ditemukan", description: "Produk tidak tersedia pada katalog yang berhasil dimuat." });
    return h("div", { className: "product-detail-page" },
      h("div", { className: "detail-panel" },
        h("div", { className: "detail-image-wrap" }, product.image_url ? h("img", { src: product.image_url, alt: product.title || "Produk" }) : h("span", { className: "image-placeholder" }, "ASRI")),
        h("div", { className: "detail-copy" },
          h("p", { className: "eyebrow" }, product.brand || product.category || "ASRI COLLECTION"),
          h("h1", null, product.title || "Produk"),
          h("p", { className: "detail-price" }, money(price(product), product.currency)),
          product.description ? h("p", { className: "detail-description" }, product.description) : null,
          h("dl", { className: "detail-facts" },
            product.sku ? h("div", null, h("dt", null, "SKU"), h("dd", null, product.sku)) : null,
            h("div", null, h("dt", null, "Ketersediaan"), h("dd", null, product.availability || "Belum diketahui")),
            product.stock_quantity != null ? h("div", null, h("dt", null, "Informasi stok"), h("dd", null, String(product.stock_quantity))) : null),
          h("p", { className: "detail-note" }, "Ketersediaan pembelian dan jumlah stok merupakan informasi terpisah."),
          h("div", { className: "inline-actions" },
            h("button", { className: "button button-outline", type: "button", onClick: () => onToggleWishlist(product) }, wishlistIds.includes(idOf(product)) ? "♥ Tersimpan" : "♡ Simpan ke wishlist"),
            h("button", { className: "button button-dark", type: "button", disabled: !available(product), onClick: () => onAdd(product) }, "Tambah ke keranjang")))));
  }
  function Search({ query, setQuery, products, loading, error, retry, onOpen, wishlistIds, onToggleWishlist }) {
    const normalized = query.trim().toLowerCase();
    const matches = products.filter(product => !normalized || [product.title, product.brand, product.category, product.sku, product.description].filter(Boolean).some(value => String(value).toLowerCase().includes(normalized)));
    return h(React.Fragment, null,
      h(Heading, { eyebrow: "TEMUKAN PILIHANMU", title: "Cari produk.", description: "Cari berdasarkan nama, merek, kategori, SKU, atau deskripsi." }),
      h("label", { className: "search-field search-page-field" },
        h("span", { "aria-hidden": "true" }, "⌕"),
        h("input", { type: "search", value: query, onChange: event => setQuery(event.target.value), placeholder: "Ketik nama atau SKU produk...", "aria-label": "Cari produk" }),
        h("button", { type: "button", disabled: !query, onClick: () => setQuery("") }, "Hapus")),
      h("p", { className: "result-count" }, normalized ? matches.length + " hasil ditemukan" : products.length + " produk"),
      loading ? h("div", { className: "loading-state" }, "Memuat katalog produk...") : error ? h("div", { className: "error-state", role: "alert" }, error, h("button", { className: "button button-dark", type: "button", onClick: retry }, "Coba lagi")) : h(ProductGrid, { products: matches, onOpen, wishlistIds, onToggleWishlist }));
  }
  function Cart({ lines, count, subtotal, onQuantity, onRemove, onShop }) {
    if (!lines.length) return h(Empty, { title: "Keranjang masih kosong", description: "Tambahkan produk yang tersedia untuk mulai berbelanja.", action: onShop, actionLabel: "Jelajahi produk" });
    return h("div", { className: "cart-layout" },
      h("div", { className: "cart-lines" }, lines.map(line =>
        h("article", { className: "cart-line", key: line.productId },
          h("div", { className: "cart-line-image" }, line.product.image_url ? h("img", { src: line.product.image_url, alt: "" }) : "ASRI"),
          h("div", { className: "cart-line-info" },
            h("strong", null, line.product.title),
            h("span", null, money(price(line.product), line.product.currency)),
            h("div", { className: "quantity-control" },
              h("button", { type: "button", disabled: line.quantity <= 1, onClick: () => onQuantity(line.productId, line.quantity - 1), "aria-label": "Kurangi jumlah" }, "−"),
              h("output", null, line.quantity),
              h("button", { type: "button", disabled: line.quantity >= 99, onClick: () => onQuantity(line.productId, line.quantity + 1), "aria-label": "Tambah jumlah" }, "+")),
            h("button", { className: "text-link danger-link", type: "button", onClick: () => onRemove(line.productId) }, "Hapus"))))),
      h("aside", { className: "summary-card" },
        h("h2", null, "Ringkasan"),
        h("div", null, h("span", null, "Total item"), h("strong", null, count)),
        h("div", { className: "summary-total" }, h("span", null, "Subtotal"), h("strong", null, money(subtotal))),
        h("p", null, "Biaya pengiriman dan total akhir belum dihitung.")));
  }
  function Field({ label, value, onChange, type = "text", required = true, autoComplete }) {
    return h("label", { className: "form-field" }, h("span", null, label + (required ? " *" : "")), h("input", { type, value: value || "", required, autoComplete, onChange: event => onChange(event.target.value) }));
  }
  function Checkout({ customer, setCustomer, lines, subtotal, onSubmit, onBack }) {
    if (!lines.length) return h(Empty, { title: "Belum ada produk", description: "Tambahkan produk ke keranjang sebelum checkout.", action: onBack, actionLabel: "Ke keranjang" });
    const update = (key, value) => setCustomer(current => ({ ...current, [key]: value }));
    return h("form", { className: "checkout-layout", onSubmit: onSubmit },
      h("div", { className: "form-card" }, h("h2", null, "Data penerima"),
        h(Field, { label: "Nama lengkap", value: customer.name, onChange: value => update("name", value), autoComplete: "name" }),
        h(Field, { label: "Email", type: "email", value: customer.email, onChange: value => update("email", value), autoComplete: "email" }),
        h(Field, { label: "Nomor telepon", type: "tel", value: customer.phone, onChange: value => update("phone", value), autoComplete: "tel" }),
        h(Field, { label: "Alamat lengkap", value: customer.address, onChange: value => update("address", value), autoComplete: "street-address" }),
        h(Field, { label: "Kota/Kabupaten", value: customer.city, onChange: value => update("city", value) }),
        h(Field, { label: "Kode pos", required: false, value: customer.postalCode, onChange: value => update("postalCode", value) })),
      h("aside", { className: "summary-card" }, h("h2", null, "Ringkasan pesanan"),
        lines.map(line => h("div", { key: line.productId }, h("span", null, line.product.title + " × " + line.quantity), h("strong", null, money(Number(price(line.product)) * line.quantity, line.product.currency)))),
        h("div", { className: "summary-total" }, h("span", null, "Subtotal"), h("strong", null, money(subtotal))),
        h("p", null, "Pengiriman, pajak, pembayaran, dan pengiriman order ke server belum tersedia."),
        h("button", { className: "button button-dark full-width", type: "submit" }, "Buat draft pesanan")));
  }
  function OrderSuccess({ order, onTrack, onShop }) {
    return h("div", { className: "order-result" },
      h("span", { className: "order-result-icon" }, "✓"),
      h("p", { className: "eyebrow" }, "DRAFT TERSIMPAN DI PERANGKAT"),
      h("h1", null, "Draft pesanan dibuat."),
      h("p", null, "Ini bukan pesanan yang dikirim ke toko. Tidak ada pembayaran atau reservasi stok yang dilakukan."),
      order ? h("div", { className: "order-reference" },
        h("span", null, "Referensi lokal"), h("strong", null, order.id),
        h("span", null, new Date(order.createdAt).toLocaleString("id-ID")),
        h("strong", null, money(order.subtotal))) : h("p", null, "Draft tidak ditemukan pada perangkat ini."),
      h("div", { className: "inline-actions" },
        h("button", { className: "button button-dark", type: "button", disabled: !order, onClick: onTrack }, "Lihat draft"),
        h("button", { className: "button button-outline", type: "button", onClick: onShop }, "Kembali belanja")));
  }
  function Tracking({ orders, activeOrder, trackingInput, setTrackingInput, onLookup }) {
    return h(React.Fragment, null,
      h(Heading, { eyebrow: "RIWAYAT LOKAL", title: "Lacak pesanan.", description: "Pencarian hanya mencakup draft yang tersimpan di browser perangkat ini." }),
      h("form", { className: "tracking-form", onSubmit: onLookup },
        h("label", { className: "form-field" }, h("span", null, "Nomor referensi"), h("input", { value: trackingInput, onChange: event => setTrackingInput(event.target.value), placeholder: "Contoh: ASRI-..." })),
        h("button", { className: "button button-dark", type: "submit" }, "Cari draft")),
      activeOrder ? h("article", { className: "tracking-card" },
        h("div", { className: "tracking-card-heading" }, h("div", null, h("span", { className: "eyebrow" }, "REFERENSI LOKAL"), h("h2", null, activeOrder.id)), h("span", { className: "status-pill" }, "Draft lokal")),
        h("p", null, "Dibuat " + new Date(activeOrder.createdAt).toLocaleString("id-ID")),
        h("p", null, (activeOrder.customer?.name || "") + " · " + (activeOrder.customer?.city || "")),
        h("div", { className: "summary-total" }, h("span", null, "Subtotal"), h("strong", null, money(activeOrder.subtotal))),
        h("p", { className: "notice-text" }, activeOrder.notice)) :
        h(Empty, { title: "Belum ada draft yang dipilih", description: "Masukkan nomor referensi lokal atau buat draft melalui checkout." }));
  }
  function Wishlist({ products, loading, error, retry, wishlistIds, onOpen, onToggleWishlist }) {
    return h(React.Fragment, null,
      h(Heading, { eyebrow: "SIMPANANMU", title: "Wishlist.", description: "Produk yang kamu simpan untuk dilihat kembali." }),
      loading ? h("div", { className: "loading-state" }, "Memuat wishlist...") : error ? h("div", { className: "error-state", role: "alert" }, error, h("button", { className: "button button-dark", type: "button", onClick: retry }, "Coba lagi")) : h(ProductGrid, { products, onOpen, wishlistIds, onToggleWishlist }));
  }
  function Profile({ customer, setCustomer, orderCount, wishlistCount, cartCount, onOrders, onWishlist, onCart, onSaved }) {
    const update = (key, value) => setCustomer(current => ({ ...current, [key]: value }));
    return h(React.Fragment, null,
      h(Heading, { eyebrow: "AKUN TAMU", title: "Profil.", description: "Profil opsional tersimpan di browser ini. Tidak memerlukan akun." }),
      h("form", { className: "form-card profile-form", onSubmit: event => { event.preventDefault(); onSaved(); } },
        h(Field, { label: "Nama", required: false, value: customer.name, onChange: value => update("name", value), autoComplete: "name" }),
        h(Field, { label: "Email", type: "email", required: false, value: customer.email, onChange: value => update("email", value), autoComplete: "email" }),
        h(Field, { label: "Nomor telepon", type: "tel", required: false, value: customer.phone, onChange: value => update("phone", value), autoComplete: "tel" }),
        h("button", { className: "button button-dark", type: "submit" }, "Simpan profil lokal")),
      h("div", { className: "profile-shortcuts" },
        h("button", { type: "button", onClick: onOrders }, "Riwayat draft (" + orderCount + ")"),
        h("button", { type: "button", onClick: onWishlist }, "Wishlist (" + wishlistCount + ")"),
        h("button", { type: "button", onClick: onCart }, "Keranjang (" + cartCount + ")")));
  }
  function Contact({ form, setForm, onCopy }) {
    const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
    return h(React.Fragment, null,
      h(Heading, { eyebrow: "KAMI SIAP MEMBANTU", title: "Hubungi kami.", description: "Siapkan pesan untuk dikirim melalui kanal kontak resmi Asri Collection." }),
      h("form", { className: "form-card contact-form", onSubmit: onCopy },
        h(Field, { label: "Nama", value: form.name, onChange: value => update("name", value) }),
        h(Field, { label: "Email", type: "email", value: form.email, onChange: value => update("email", value) }),
        h("label", { className: "form-field" }, h("span", null, "Pesan *"), h("textarea", { required: true, rows: 5, value: form.message, onChange: event => update("message", event.target.value) })),
        h("button", { className: "button button-dark", type: "submit" }, "Salin draft pesan"),
        h("p", { className: "form-hint" }, "Pesan tidak dikirim otomatis karena kanal kontak resmi belum dikonfigurasi.")));
  }
  return { Footer, Heading, Empty, ProductGrid, Detail, Search, Cart, Checkout, OrderSuccess, Tracking, Wishlist, Profile, Contact };
})();
window.AsriPages = AsriPages;
