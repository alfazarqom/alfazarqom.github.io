const { useEffect, useMemo, useRef, useState } = React;

const PRODUCTS_ENDPOINT = "https://mvwflakurihhakdrlteg.supabase.co/functions/v1/get-products";

function formatPrice(amount, currency = "IDR") {
  if (amount === null || amount === undefined || amount === "") return "Harga belum tersedia";
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
      maximumFractionDigits: 0
    }).format(Number(amount));
  } catch {
    return "Rp" + new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Number(amount) || 0);
  }
}

function displayPrice(product) {
  return product.sale_price != null &&
    product.price != null &&
    Number(product.sale_price) < Number(product.price)
    ? product.sale_price
    : product.price;
}

function LoadingState() {
  return (
    <div className="loading-state">
      <span className="spinner" />
      Memuat katalog produk...
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <span className="error-icon">!</span>
      <h3>Katalog belum dapat dimuat</h3>
      <p>{message}</p>
      <button className="button button-dark" type="button" onClick={onRetry}>
        Coba lagi
      </button>
    </div>
  );
}

function ProductCard({ product, onSelect }) {
  const available = String(product.availability || "").toLowerCase() === "available";

  return (
    <button
      className="product-card"
      type="button"
      onClick={() => onSelect(product)}
      aria-label={`Lihat detail ${product.title || "produk"}`}
    >
      <span className="product-image-wrap">
        {product.image_url ? (
          <img
            className="product-image"
            src={product.image_url}
            alt={product.title || "Produk Asri Collection"}
            loading="lazy"
          />
        ) : (
          <span className="image-placeholder" aria-hidden="true">ASRI</span>
        )}
        {Array.isArray(product.labels) && product.labels.length > 0 && (
          <span className="product-label">{product.labels[0]}</span>
        )}
      </span>
      <span className="product-meta">
        <span className="product-brand">
          {product.brand || product.category || "ASRI COLLECTION"}
        </span>
        <strong className="product-title">{product.title || "Produk"}</strong>
        <span className="product-price">
          {formatPrice(displayPrice(product), product.currency)}
        </span>
        <span className={`stock-status ${available ? "is-available" : ""}`}>
          <span className="status-dot" />
          {available ? "Tersedia" : "Periksa ketersediaan"}
          {product.stock_quantity != null && (
            <span className="stock-count"> · Stok {product.stock_quantity}</span>
          )}
        </span>
      </span>
    </button>
  );
}

function ProductGrid({ products, onSelect }) {
  if (!products.length) {
    return (
      <div className="empty-state">
        <span className="empty-icon">⌕</span>
        <h3>Produk tidak ditemukan</h3>
        <p>Coba kata kunci lain.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <ProductCard
          key={product.id ?? product.sku ?? index}
          product={product}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function ProductQuickView({ product, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (product && dialog && !dialog.open) dialog.showModal();
    if (!product && dialog?.open) dialog.close();
  }, [product]);

  function handleClose() {
    if (dialogRef.current?.open) dialogRef.current.close();
    onClose();
  }

  const facts = product ? [
    product.sku ? ["SKU", product.sku] : null,
    product.category ? ["Kategori", product.category] : null,
    ["Ketersediaan", product.availability || "Belum diketahui"],
    product.stock_quantity != null ? ["Stok", product.stock_quantity] : null
  ].filter(Boolean) : [];

  return (
    <dialog
      ref={dialogRef}
      className="product-dialog"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) handleClose();
      }}
    >
      <button
        className="detail-close"
        type="button"
        onClick={handleClose}
        aria-label="Tutup detail"
      >
        ×
      </button>
      {product && (
        <section className="detail-panel">
          <div className="detail-image-wrap">
            {product.image_url ? (
              <img src={product.image_url} alt={product.title || "Produk"} />
            ) : (
              <span className="image-placeholder">ASRI</span>
            )}
          </div>
          <div className="detail-copy">
            <p className="eyebrow">
              {product.brand || product.category || "ASRI COLLECTION"}
            </p>
            <h2 id="detail-title">{product.title || "Produk"}</h2>
            <p className="detail-price">
              {formatPrice(displayPrice(product), product.currency)}
            </p>
            {product.description && product.description !== "deskripsi belum di atur" && (
              <p className="detail-description">{product.description}</p>
            )}
            <dl className="detail-facts">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <p className="detail-note">
              Informasi produk ditampilkan langsung dari katalog Supabase.
            </p>
          </div>
        </section>
      )}
    </dialog>
  );
}


function PageFooter() {
  return (
    <footer className="page-footer">
      <span className="footer-brand">ASRI COLLECTION</span>
      <span>Considered style, made personal.</span>
      <span>© {new Date().getFullYear()} Asri Collection</span>
    </footer>
  );
}

function BottomNavigation({ page, onNavigate }) {
  const items = [
    ["home", "Beranda", "⌂"],
    ["products", "Produk", "▦"],
    ["profile", "Profil", "○"]
  ];
  return (
    <nav className="bottom-navigation" aria-label="Navigasi bawah">
      {items.map(([id, label, icon]) => (
        <button key={id} type="button"
          className={`bottom-navigation-item ${page === id ? "is-active" : ""}`}
          aria-current={page === id ? "page" : undefined}
          onClick={() => onNavigate(id)}>
          <span className="bottom-navigation-icon" aria-hidden="true">{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function BottomActionBar({ page, onNavigate }) {
  const labels = {
    productDetail: "Detail Produk", search: "Pencarian", cart: "Keranjang",
    checkout: "Checkout", orderSuccess: "Pesanan Berhasil",
    orderTracking: "Lacak Pesanan", wishlist: "Wishlist", contact: "Kontak"
  };
  return (
    <nav className="bottom-action-bar" aria-label={labels[page] || "Aksi halaman"}>
      <button type="button" className="action-back-button" onClick={() => onNavigate("products")}>
        ← Kembali ke produk
      </button>
    </nav>
  );
}

function PagePlaceholder({ title }) {
  return (
    <section className="placeholder-page">
      <p className="eyebrow">ASRI COLLECTION</p>
      <h1>{title}</h1>
      <p>Halaman ini sudah terdaftar dalam struktur aplikasi, tetapi fitur dan kontennya belum diimplementasikan.</p>
    </section>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(
    window.location.hash.replace("#", "") || "home"
  );
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [total, setTotal] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return products;

    return products.filter((product) =>
      [product.title, product.brand, product.category, product.sku]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))
    );
  }, [products, query]);

  async function loadProducts() {
    setStatus("loading");
    setError("");

    try {
      const response = await fetch(PRODUCTS_ENDPOINT, {
        method: "GET",
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        throw new Error(`Permintaan katalog gagal (HTTP ${response.status}).`);
      }

      const result = await response.json();
      if (result?.success !== true || !Array.isArray(result.data)) {
        throw new Error("Format respons get-products tidak sesuai.");
      }

      setProducts(result.data);
      setTotal(Number.isFinite(Number(result.total)) ? Number(result.total) : null);
      setStatus("success");
    } catch (requestError) {
      setProducts([]);
      setTotal(null);
      setError(
        requestError?.message ||
        "Terjadi kesalahan saat menghubungkan ke katalog produk."
      );
      setStatus("error");
    }
  }

  function showPage(nextPage) {
    const allowedPages = ["home", "products", "productDetail", "search", "cart", "checkout", "orderSuccess", "orderTracking", "wishlist", "profile", "contact"];
    const normalizedPage = allowedPages.includes(nextPage) ? nextPage : "home";
    setPage(normalizedPage);

    if (window.location.hash !== `#${normalizedPage}`) {
      window.history.replaceState(null, "", `#${normalizedPage}`);
    }

    document.querySelector(".main-content")?.scrollTo({
      top: 0,
      behavior: "instant"
    });
  }

  useEffect(() => {
    loadProducts();

    const handleHashChange = () => {
      const requestedPage = window.location.hash.replace("#", "") || "home";
      const allowedPages = ["home", "products", "productDetail", "search", "cart", "checkout", "orderSuccess", "orderTracking", "wishlist", "profile", "contact"];
      setPage(allowedPages.includes(requestedPage) ? requestedPage : "home");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    document.title = "Asri Collection";
  }, []);

  const featuredProducts = products.slice(0, 4);

  return (
    <div className="app-shell">
      <header className="site-header">
        <a
          className="brand-lockup"
          href="#home"
          aria-label="Asri Collection home"
          onClick={(event) => {
            event.preventDefault();
            showPage("home");
          }}
        >
          <span className="brand-mark">A</span>
          <span className="brand-copy">
            <strong>ASRI</strong>
            <small>COLLECTION</small>
          </span>
        </a>

        <nav className="main-navigation" aria-label="Navigasi utama">
          <button
            type="button"
            className={`nav-button ${page === "home" ? "is-active" : ""}`}
            aria-current={page === "home" ? "page" : undefined}
            onClick={() => showPage("home")}
          >
            Beranda
          </button>
          <button
            type="button"
            className={`nav-button ${page === "products" ? "is-active" : ""}`}
            aria-current={page === "products" ? "page" : undefined}
            onClick={() => showPage("products")}
          >
            Produk
          </button>
        </nav>

        <button
          className="header-cta"
          type="button"
          onClick={() => showPage("products")}
        >
          Jelajahi <span aria-hidden="true">↗</span>
        </button>
      </header>

      <main className="main-content">
        <div className="main-content-inner">
          {page === "home" ? (
            <section id="home-page">
              <section className="hero-section">
                <div className="hero-content">
                  <p className="eyebrow hero-eyebrow">
                    <span /> CURATED FOR EVERYDAY ELEGANCE
                  </p>
                  <h1>Temukan gaya yang <em>bercerita.</em></h1>
                  <p className="hero-description">
                    Pilihan fashion dan aksesori terkurasi untuk melengkapi setiap momen,
                    dengan karakter yang tetap terasa personal.
                  </p>
                  <button
                    className="button button-light"
                    type="button"
                    onClick={() => showPage("products")}
                  >
                    Jelajahi koleksi <span aria-hidden="true">↗</span>
                  </button>
                  <div className="hero-caption">
                    <span>01 / 02</span>
                    <span>TIMELESS · CONSIDERED · YOURS</span>
                  </div>
                </div>
                <div className="hero-art" aria-hidden="true">
                  <div className="hero-orbit orbit-one" />
                  <div className="hero-orbit orbit-two" />
                  <div className="hero-monogram">A<span>.</span></div>
                  <div className="hero-art-caption">THE ART OF<br />EVERYDAY STYLE</div>
                </div>
              </section>

              <section className="intro-strip">
                <p>STYLE, WITH INTENTION.</p>
                <span>Kurasi pilihan. Detail bermakna. Gaya milikmu.</span>
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">PILIHAN KAMI</p>
                    <h2>Featured pieces</h2>
                  </div>
                  <button className="text-link" type="button" onClick={() => showPage("products")}>
                    Lihat semua produk <span>↗</span>
                  </button>
                </div>
                {status === "loading" ? <LoadingState /> :
                  status === "error" ? <ErrorState message={error} onRetry={loadProducts} /> :
                  <ProductGrid products={featuredProducts} onSelect={setSelectedProduct} />}
              </section>
              <PageFooter />
            </section>
          ) : page === "products" ? (
            <section id="products-page" className="catalog-section">
              <div className="catalog-heading">
                <p className="eyebrow">THE ASRI EDIT</p>
                <h1>Our collection<span>.</span></h1>
                <p>Temukan item pilihan yang menyatukan kualitas, fungsi, dan karakter.</p>
              </div>
              <div className="catalog-toolbar">
                <span>
                  {status === "loading" ? "Memuat produk..." :
                    status === "error" ? "Katalog tidak tersedia" :
                    total !== null ? `${filteredProducts.length} dari ${total} produk` :
                    `${filteredProducts.length} produk`}
                </span>
                <label className="search-field">
                  <span aria-hidden="true">⌕</span>
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Cari produk..."
                    aria-label="Cari produk"
                  />
                </label>
              </div>
              {status === "loading" ? <LoadingState /> :
                status === "error" ? <ErrorState message={error} onRetry={loadProducts} /> :
                <ProductGrid products={filteredProducts} onSelect={setSelectedProduct} />}
              <PageFooter />
            </section>
          ) : (
            <section className="catalog-section">
              <PagePlaceholder title={{
                productDetail: "Detail Produk", search: "Pencarian", cart: "Keranjang",
                checkout: "Checkout", orderSuccess: "Pesanan Berhasil",
                orderTracking: "Lacak Pesanan", wishlist: "Wishlist",
                profile: "Profil", contact: "Kontak"
              }[page] || "Halaman"} />
              <PageFooter />
            </section>
          )}
        </div>
      </main>

      {["home", "products", "profile"].includes(page) ? (
        <BottomNavigation page={page} onNavigate={showPage} />
      ) : (
        <BottomActionBar page={page} onNavigate={showPage} />
      )}

      <ProductQuickView
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
