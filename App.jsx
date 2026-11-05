const { useEffect, useMemo, useState } = React;
const Pages = window.AsriPages;
const PRODUCTS_ENDPOINT = "https://mvwflakurihhakdrlteg.supabase.co/functions/v1/get-products";
const PAGE_NAMES = ["home", "products", "productDetail", "search", "cart", "checkout", "orderSuccess", "orderTracking", "wishlist", "profile", "contact"];
const BOTTOM_NAV_PAGES = ["home", "products", "profile"];

function readLocal(key, fallback) {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
}
function priceOf(product) {
  return product?.sale_price != null && product?.price != null && Number(product.sale_price) < Number(product.price) ? product.sale_price : product?.price;
}
function money(value, currency = "IDR") {
  const number = Number(value);
  if (!Number.isFinite(number)) return "Harga belum tersedia";
  try { return new Intl.NumberFormat("id-ID", { style: "currency", currency, maximumFractionDigits: 0 }).format(number); }
  catch { return "Rp" + number.toLocaleString("id-ID"); }
}
function productId(product) { return String(product?.id ?? product?.sku ?? ""); }
function canBuy(product) { return String(product?.availability || "").trim().toLowerCase() === "available"; }
function readRoute() {
  const [page, query = ""] = window.location.hash.replace(/^#/, "").split("?");
  return { page: PAGE_NAMES.includes(page) ? page : "home", params: new URLSearchParams(query) };
}
function setRoute(page, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== "") query.set(key, String(value)); });
  const hash = "#" + page + (query.toString() ? "?" + query.toString() : "");
  if (window.location.hash !== hash) window.history.pushState({}, "", hash);
}
function LoadingState() {
  return <div className="loading-state"><span className="spinner" />Memuat katalog produk...</div>;
}
function ErrorState({ message, onRetry }) {
  return <div className="error-state" role="alert"><span className="error-icon">!</span><h3>Katalog belum dapat dimuat</h3><p>{message}</p><button className="button button-dark" type="button" onClick={onRetry}>Coba lagi</button></div>;
}
function ProductQuickView({ product, onClose, onOpenDetail, onAdd }) {
  const dialogRef = React.useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (product && dialog && !dialog.open) dialog.showModal();
    if (!product && dialog?.open) dialog.close();
  }, [product]);
  function close() { if (dialogRef.current?.open) dialogRef.current.close(); onClose(); }
  return <dialog ref={dialogRef} className="product-dialog" onClose={onClose} onClick={event => { if (event.target === dialogRef.current) close(); }}>
    <button className="detail-close" type="button" onClick={close} aria-label="Tutup detail">×</button>
    {product && <section className="detail-panel">
      <div className="detail-image-wrap">{product.image_url ? <img src={product.image_url} alt={product.title || "Produk"} /> : <span className="image-placeholder">ASRI</span>}</div>
      <div className="detail-copy"><p className="eyebrow">{product.brand || product.category || "ASRI COLLECTION"}</p><h2>{product.title || "Produk"}</h2><p className="detail-price">{money(priceOf(product), product.currency)}</p>
        {product.description && <p className="detail-description">{product.description}</p>}
        <p className="detail-note">Ketersediaan: {product.availability || "Belum diketahui"}{product.stock_quantity != null ? " · Informasi stok: " + product.stock_quantity : ""}</p>
        <div className="inline-actions"><button className="button button-outline" type="button" onClick={onOpenDetail}>Detail lengkap</button><button className="button button-dark" type="button" disabled={!canBuy(product)} onClick={onAdd}>Tambah ke keranjang</button></div>
      </div>
    </section>}
  </dialog>;
}
function BottomNavigation({ page, onNavigate }) {
  const items = [["home", "Beranda", "⌂"], ["products", "Produk", "▦"], ["profile", "Profil", "○"]];
  return <nav className="bottom-navigation" aria-label="Navigasi bawah">{items.map(([id, label, icon]) => <button key={id} type="button" className={"bottom-navigation-item " + (page === id ? "is-active" : "")} aria-current={page === id ? "page" : undefined} onClick={() => onNavigate(id)}><span className="bottom-navigation-icon" aria-hidden="true">{icon}</span><span>{label}</span></button>)}</nav>;
}
function BottomActionBar({ page, onNavigate, onPrimary, primaryLabel, disabled }) {
  const labels = { productDetail: "Detail Produk", search: "Pencarian", cart: "Keranjang", checkout: "Checkout", orderSuccess: "Pesanan Disiapkan", orderTracking: "Lacak Pesanan", wishlist: "Wishlist", contact: "Kontak" };
  return <nav className="bottom-action-bar" aria-label={labels[page] || "Aksi halaman"}>
    {primaryLabel ? <button className="button button-dark action-primary-button" type="button" disabled={disabled} onClick={onPrimary}>{primaryLabel}</button> : <button className="action-back-button" type="button" onClick={() => onNavigate(page === "orderSuccess" ? "orderTracking" : "products")}>{page === "orderSuccess" ? "Lacak pesanan" : "← Kembali ke produk"}</button>}
  </nav>;
}

function App() {
  const initial = readRoute();
  const [page, setPage] = useState(initial.page);
  const [products, setProducts] = useState([]);
  const [catalogStatus, setCatalogStatus] = useState("loading");
  const [catalogError, setCatalogError] = useState("");
  const [catalogTotal, setCatalogTotal] = useState(null);
  const [query, setQuery] = useState(initial.params.get("q") || "");
  const [selectedProductId, setSelectedProductId] = useState(initial.params.get("id") || "");
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [cart, setCart] = useState(() => readLocal("asri-cart-v1", []));
  const [wishlistIds, setWishlistIds] = useState(() => readLocal("asri-wishlist-v1", []));
  const [customer, setCustomer] = useState(() => readLocal("asri-customer-v1", { name: "", email: "", phone: "", address: "", city: "", postalCode: "" }));
  const [orders, setOrders] = useState(() => readLocal("asri-local-orders-v1", []));
  const [activeOrderId, setActiveOrderId] = useState(initial.params.get("order") || "");
  const [trackingInput, setTrackingInput] = useState(initial.params.get("order") || "");
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [notice, setNotice] = useState("");

  const productsById = useMemo(() => new Map(products.map(product => [productId(product), product])), [products]);
  const selectedProduct = productsById.get(selectedProductId) || null;
  const cartLines = useMemo(() => cart.map(line => ({ ...line, product: productsById.get(String(line.productId)) })).filter(line => line.product), [cart, productsById]);
  const wishlistProducts = useMemo(() => wishlistIds.map(id => productsById.get(String(id))).filter(Boolean), [wishlistIds, productsById]);
  const cartCount = cartLines.reduce((total, line) => total + line.quantity, 0);
  const subtotal = cartLines.reduce((total, line) => total + (Number(priceOf(line.product)) || 0) * line.quantity, 0);
  const activeOrder = orders.find(order => order.id === activeOrderId) || null;

  useEffect(() => { try { localStorage.setItem("asri-cart-v1", JSON.stringify(cart)); } catch {} }, [cart]);
  useEffect(() => { try { localStorage.setItem("asri-wishlist-v1", JSON.stringify(wishlistIds)); } catch {} }, [wishlistIds]);
  useEffect(() => { try { localStorage.setItem("asri-customer-v1", JSON.stringify(customer)); } catch {} }, [customer]);
  useEffect(() => { try { localStorage.setItem("asri-local-orders-v1", JSON.stringify(orders)); } catch {} }, [orders]);

  async function loadProducts() {
    setCatalogStatus("loading"); setCatalogError("");
    try {
      const response = await fetch(PRODUCTS_ENDPOINT, { method: "GET", headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Permintaan katalog gagal (HTTP " + response.status + ").");
      const result = await response.json();
      if (result?.success !== true || !Array.isArray(result.data)) throw new Error("Format respons get-products tidak sesuai.");
      setProducts(result.data);
      setCatalogTotal(Number.isFinite(Number(result.total)) ? Number(result.total) : null);
      setCatalogStatus("success");
    } catch (error) {
      setProducts([]); setCatalogTotal(null);
      setCatalogError(error?.message || "Terjadi kesalahan saat memuat katalog.");
      setCatalogStatus("error");
    }
  }
  function showPage(nextPage, params = {}) {
    const target = PAGE_NAMES.includes(nextPage) ? nextPage : "home";
    setRoute(target, params); setPage(target);
    if (params.id !== undefined) setSelectedProductId(String(params.id));
    if (params.order !== undefined) { setActiveOrderId(String(params.order)); setTrackingInput(String(params.order)); }
    if (target === "search" && params.q !== undefined) setQuery(String(params.q));
    setQuickViewProduct(null);
    document.querySelector(".main-content")?.scrollTo({ top: 0, behavior: "instant" });
  }
  function addToCart(product, quantity = 1) {
    if (!product || !canBuy(product)) { setNotice("Produk ini belum tersedia untuk dibeli."); return; }
    const id = productId(product);
    setCart(current => {
      const existing = current.find(line => String(line.productId) === id);
      return existing ? current.map(line => String(line.productId) === id ? { ...line, quantity: Math.min(99, line.quantity + quantity) } : line) : [...current, { productId: id, quantity }];
    });
    setNotice("Produk ditambahkan ke keranjang.");
  }
  function updateQuantity(id, quantity) {
    setCart(current => current.map(line => String(line.productId) === String(id) ? { ...line, quantity: Math.max(1, Math.min(99, quantity)) } : line));
  }
  function removeFromCart(id) { setCart(current => current.filter(line => String(line.productId) !== String(id))); }
  function toggleWishlist(product) {
    const id = productId(product);
    const exists = wishlistIds.includes(id);
    setWishlistIds(current => exists ? current.filter(value => value !== id) : [...current, id]);
    setNotice(exists ? "Produk dihapus dari wishlist." : "Produk disimpan ke wishlist.");
  }
  function openProduct(product) { showPage("productDetail", { id: productId(product) }); }
  function updateCustomer(field, value) { setCustomer(current => ({ ...current, [field]: value })); }
  function submitCheckout(event) {
    event.preventDefault();
    if (!cartLines.length) { setNotice("Keranjang masih kosong."); showPage("cart"); return; }
    if (cartLines.some(line => !canBuy(line.product))) { setNotice("Ada produk di keranjang yang tidak lagi tersedia. Periksa keranjang."); showPage("cart"); return; }
    if (!customer.name.trim() || !customer.email.trim() || !customer.phone.trim() || !customer.address.trim() || !customer.city.trim()) { setNotice("Lengkapi data penerima terlebih dahulu."); return; }
    const order = {
      id: "ASRI-" + Date.now().toString(36).toUpperCase(),
      createdAt: new Date().toISOString(),
      status: "draft_local",
      customer: { ...customer },
      items: cartLines.map(line => ({ productId: line.productId, title: line.product.title, quantity: line.quantity, unitPrice: Number(priceOf(line.product)) || 0, currency: line.product.currency || "IDR" })),
      subtotal,
      notice: "Draft lokal saja. Pesanan belum dikirim ke server dan belum ada pembayaran atau reservasi stok."
    };
    setOrders(current => [order, ...current]); setActiveOrderId(order.id); setTrackingInput(order.id); setCart([]);
    showPage("orderSuccess", { order: order.id });
  }
  function lookupOrder(event) {
    event.preventDefault();
    const found = orders.find(order => order.id.toLowerCase() === trackingInput.trim().toLowerCase());
    if (found) { setActiveOrderId(found.id); showPage("orderTracking", { order: found.id }); }
    else setNotice("Referensi tidak ditemukan di penyimpanan lokal perangkat ini.");
  }
  function copyContact(event) {
    event.preventDefault();
    const text = "Nama: " + contactForm.name + "\nEmail: " + contactForm.email + "\nPesan: " + contactForm.message;
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => setNotice("Draft pesan disalin. Kirim melalui kanal kontak resmi toko."), () => setNotice("Pesan tidak dapat disalin pada browser ini."));
    else setNotice("Fitur salin tidak tersedia pada browser ini.");
  }

  useEffect(() => {
    loadProducts();
    const sync = () => {
      const route = readRoute();
      setPage(route.page); setQuery(route.params.get("q") || "");
      setSelectedProductId(route.params.get("id") || "");
      setActiveOrderId(route.params.get("order") || "");
      setTrackingInput(route.params.get("order") || "");
      setQuickViewProduct(null);
    };
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => { window.removeEventListener("popstate", sync); window.removeEventListener("hashchange", sync); };
  }, []);
  useEffect(() => { document.title = (page === "orderSuccess" ? "Draft Pesanan" : page) + " — Asri Collection"; }, [page]);
  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const featuredProducts = products.slice(0, 4);

  const primaryLabel = page === "productDetail" ? "Tambah ke keranjang" :
    page === "cart" ? "Lanjut checkout" :
    page === "orderSuccess" ? "Lacak draft" :
    page === "wishlist" ? "Jelajahi produk" : null;
  const primaryAction = page === "productDetail" ? () => addToCart(selectedProduct) :
    page === "cart" ? () => showPage("checkout") :
    page === "orderSuccess" ? () => showPage("orderTracking", { order: activeOrderId }) :
    page === "wishlist" ? () => showPage("products") : null;
  const primaryDisabled = (page === "productDetail" && (!selectedProduct || !canBuy(selectedProduct))) ||
    (page === "cart" && cartLines.length === 0) ||
    (page === "orderSuccess" && !activeOrder);

  return <div className="app-shell">
    <header className="site-header">
      <a className="brand-lockup" href="#home" aria-label="Asri Collection home" onClick={event => { event.preventDefault(); showPage("home"); }}>
        <span className="brand-mark">A</span><span className="brand-copy"><strong>ASRI</strong><small>COLLECTION</small></span>
      </a>
      <nav className="main-navigation" aria-label="Navigasi utama">
        <button type="button" className={"nav-button " + (page === "home" ? "is-active" : "")} aria-current={page === "home" ? "page" : undefined} onClick={() => showPage("home")}>Beranda</button>
        <button type="button" className={"nav-button " + (page === "products" ? "is-active" : "")} aria-current={page === "products" ? "page" : undefined} onClick={() => showPage("products")}>Produk</button>
      </nav>
      <div className="header-utility-actions" aria-label="Aksi cepat">
        <button className="header-icon-button" type="button" aria-label="Cari" onClick={() => showPage("search", { q: query })}>⌕</button>
        <button className="header-icon-button" type="button" aria-label="Wishlist" onClick={() => showPage("wishlist")}>♡</button>
        <button className="header-icon-button" type="button" aria-label={"Keranjang " + cartCount + " item"} onClick={() => showPage("cart")}>♧<span className="cart-count">{cartCount}</span></button>
      </div>
    </header>

    <main className="main-content"><div className="main-content-inner">
      {page === "home" && <section id="home-page">
        <section className="hero-section">
          <div className="hero-content"><p className="eyebrow hero-eyebrow"><span /> CURATED FOR EVERYDAY ELEGANCE</p><h1>Temukan gaya yang <em>bercerita.</em></h1><p className="hero-description">Pilihan fashion dan aksesori terkurasi untuk melengkapi setiap momen, dengan karakter yang tetap terasa personal.</p><button className="button button-light" type="button" onClick={() => showPage("products")}>Jelajahi koleksi <span>↗</span></button><div className="hero-caption"><span>01 / 02</span><span>TIMELESS · CONSIDERED · YOURS</span></div></div>
          <div className="hero-art" aria-hidden="true"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-monogram">A<span>.</span></div><div className="hero-art-caption">THE ART OF<br />EVERYDAY STYLE</div></div>
        </section>
        <section className="intro-strip"><p>STYLE, WITH INTENTION.</p><span>Kurasi pilihan. Detail bermakna. Gaya milikmu.</span></section>
        <section className="section-block"><div className="section-heading"><div><p className="eyebrow">PILIHAN KAMI</p><h2>Featured pieces</h2></div><button className="text-link" type="button" onClick={() => showPage("products")}>Lihat semua produk <span>↗</span></button></div>
          {catalogStatus === "loading" ? <LoadingState /> : catalogStatus === "error" ? <ErrorState message={catalogError} onRetry={loadProducts} /> : <Pages.ProductGrid products={featuredProducts} onOpen={setQuickViewProduct} wishlistIds={wishlistIds} onToggleWishlist={toggleWishlist} />}
        </section><Pages.Footer />
      </section>}

      {page === "products" && <section id="products-page" className="catalog-section">
        <Pages.Heading eyebrow="THE ASRI EDIT" title={<>Our collection<span>.</span></>} description="Temukan item pilihan yang menyatukan kualitas, fungsi, dan karakter." />
        <div className="catalog-toolbar"><span>{catalogStatus === "loading" ? "Memuat produk..." : catalogStatus === "error" ? "Katalog tidak tersedia" : catalogTotal !== null ? products.length + " dari " + catalogTotal + " produk" : products.length + " produk"}</span><button className="text-link" type="button" onClick={() => showPage("search", { q: query })}>Cari produk <span>⌕</span></button></div>
        {catalogStatus === "loading" ? <LoadingState /> : catalogStatus === "error" ? <ErrorState message={catalogError} onRetry={loadProducts} /> : <Pages.ProductGrid products={products} onOpen={setQuickViewProduct} wishlistIds={wishlistIds} onToggleWishlist={toggleWishlist} />}
        <Pages.Footer />
      </section>}

      {page === "productDetail" && <section className="catalog-section"><Pages.Heading eyebrow="DETAIL PRODUK" title="Pilihan untukmu." description="Informasi produk dari katalog." /><Pages.Detail product={selectedProduct} wishlistIds={wishlistIds} onToggleWishlist={toggleWishlist} onAdd={addToCart} /><Pages.Footer /></section>}

      {page === "search" && <section className="catalog-section"><Pages.Search query={query} setQuery={setQuery} products={products} loading={catalogStatus === "loading"} error={catalogError} retry={loadProducts} onOpen={openProduct} wishlistIds={wishlistIds} onToggleWishlist={toggleWishlist} /><Pages.Footer /></section>}

      {page === "cart" && <section className="catalog-section"><Pages.Heading eyebrow="RINGKASAN BELANJA" title="Keranjang." description="Periksa pilihan produk dan jumlah sebelum melanjutkan." /><Pages.Cart lines={cartLines} count={cartCount} subtotal={subtotal} onQuantity={updateQuantity} onRemove={removeFromCart} onShop={() => showPage("products")} /><Pages.Footer /></section>}

      {page === "checkout" && <section className="catalog-section"><Pages.Heading eyebrow="INFORMASI PENERIMA" title="Checkout." description="Isi data penerima untuk membuat draft pesanan lokal." /><Pages.Checkout customer={customer} setCustomer={setCustomer} lines={cartLines} subtotal={subtotal} onSubmit={submitCheckout} onBack={() => showPage("cart")} /><Pages.Footer /></section>}

      {page === "orderSuccess" && <section className="catalog-section"><Pages.OrderSuccess order={activeOrder} onTrack={() => showPage("orderTracking", { order: activeOrderId })} onShop={() => showPage("products")} /><Pages.Footer /></section>}

      {page === "orderTracking" && <section className="catalog-section"><Pages.Tracking orders={orders} activeOrder={activeOrder} trackingInput={trackingInput} setTrackingInput={setTrackingInput} onLookup={lookupOrder} onSelectOrder={id => { setActiveOrderId(id); setTrackingInput(id); }} /><Pages.Footer /></section>}

      {page === "wishlist" && <section className="catalog-section"><Pages.Wishlist products={wishlistProducts} loading={catalogStatus === "loading"} error={catalogError} retry={loadProducts} wishlistIds={wishlistIds} onOpen={openProduct} onToggleWishlist={toggleWishlist} /><Pages.Footer /></section>}

      {page === "profile" && <section className="catalog-section"><Pages.Profile customer={customer} setCustomer={setCustomer} orderCount={orders.length} wishlistCount={wishlistIds.length} cartCount={cartCount} onOrders={() => showPage("orderTracking")} onWishlist={() => showPage("wishlist")} onCart={() => showPage("cart")} onSaved={() => setNotice("Profil lokal disimpan.")} /><Pages.Footer /></section>}

      {page === "contact" && <section className="catalog-section"><Pages.Contact form={contactForm} setForm={setContactForm} onCopy={copyContact} /><Pages.Footer /></section>}
    </div></main>

    {BOTTOM_NAV_PAGES.includes(page) ? <BottomNavigation page={page} onNavigate={showPage} /> : <BottomActionBar page={page} onNavigate={showPage} onPrimary={primaryAction} primaryLabel={primaryLabel} disabled={primaryDisabled} />}
    {notice && <div className="toast-message" role="status">{notice}<button type="button" aria-label="Tutup notifikasi" onClick={() => setNotice("")}>×</button></div>}
    <ProductQuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} onOpenDetail={() => { const product = quickViewProduct; setQuickViewProduct(null); openProduct(product); }} onAdd={() => { addToCart(quickViewProduct); setQuickViewProduct(null); }} />
  </div>;
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
