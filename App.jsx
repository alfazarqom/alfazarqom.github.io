const { useEffect, useMemo, useRef, useState } = React;

const PRODUCTS_ENDPOINT = "https://mvwflakurihhakdrlteg.supabase.co/functions/v1/get-divoom-products";

const ALLOWED_PAGES = ["home", "products", "productDetail", "search", "cart", "checkout", "orderSuccess", "orderTracking", "wishlist", "profile", "contact"];

function resolveLocation() {
  const pathname = decodeURIComponent(window.location.pathname).replace(/\/+$/, "") || "/";
  const productMatch = pathname.match(/^\/products\/([a-z0-9]+)$/i);
  if (productMatch) return { page: "productDetail", itemGroupId: productMatch[1] };

  const requestedPage = window.location.hash.replace("#", "") || "home";
  return {
    page: ALLOWED_PAGES.includes(requestedPage) ? requestedPage : "home",
    itemGroupId: null
  };
}


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
  const salePrice = Number(product.sale_price);
  const price = Number(product.price);
  return product.sale_price != null && Number.isFinite(salePrice) &&
    Number.isFinite(price) && salePrice > 0 && salePrice < price
    ? salePrice : product.price;
}

function productImages(product) {
  const additional = Array.isArray(product.additional_image_link) ? product.additional_image_link : [];
  return [...new Set([product.image_link, ...additional].filter(
    (url) => typeof url === "string" && /^https?:\/\//i.test(url)
  ))];
}

function sanitizeRichText(html) {
  if (typeof html !== "string" || !html.trim()) return "";
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const allowedTags = new Set(["P", "UL", "OL", "LI", "STRONG", "B", "EM", "I", "BR", "A", "H3", "H4"]);
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
  function serialize(node) {
    if (node.nodeType === Node.TEXT_NODE) return escapeHtml(node.nodeValue || "");
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const tag = node.tagName;
    const children = Array.from(node.childNodes).map(serialize).join("");
    if (!allowedTags.has(tag)) return children;
    if (tag === "BR") return "<br>";
    if (tag === "A") {
      const href = node.getAttribute("href") || "";
      return /^https:\/\//i.test(href)
        ? '<a href="' + escapeHtml(href) + '" target="_blank" rel="noopener noreferrer">' + children + "</a>"
        : children;
    }
    return "<" + tag.toLowerCase() + ">" + children + "</" + tag.toLowerCase() + ">";
  }
  return Array.from(parsed.body.childNodes).map(serialize).join("");
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
  const available = String(product.availability || "").toLowerCase() === "in stock";

  return (
    <button
      className="product-card"
      type="button"
      onClick={() => onSelect(product)}
      aria-label={`Lihat detail ${product.title || "produk"}`}
    >
      <span className="product-image-wrap">
        {product.image_link ? (
          <img
            className="product-image"
            src={product.image_link}
            alt={product.title || "Produk Asri Collection"}
            loading="lazy"
          />
        ) : (
          <span className="image-placeholder" aria-hidden="true">ASRI</span>
        )}
        {product.color && <span className="product-label">{product.color}</span>}
      </span>
      <span className="product-meta">
        <span className="product-brand">
          {product.brand || product.product_type || "DIVOOM"}
        </span>
        <strong className="product-title">{product.title || "Produk"}</strong>
        <span className="product-price">
          {formatPrice(displayPrice(product), "IDR")}
        </span>
        <span className={`stock-status ${available ? "is-available" : ""}`}>
          <span className="status-dot" />
          {available ? "Tersedia" : String(product.availability || "").toLowerCase() === "out of stock" ? "Stok habis" : "Status tidak diketahui"}
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
          key={product.id ?? index}
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
    product.item_group_id ? ["Grup produk", product.item_group_id] : null,
    product.product_type ? ["Kategori", product.product_type] : null,
    product.color ? ["Warna", product.color] : null,
    product.condition ? ["Kondisi", product.condition] : null,
    ["Ketersediaan", product.availability || "Belum diketahui"]
  ].filter(Boolean) : [];
  const images = product ? productImages(product) : [];
  const safeRichDescription = product ? sanitizeRichText(product.rich_text_description) : "";

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
            {images.length > 0 ? (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <img src={images[0]} alt={product.title || "Produk Divoom"} />
                {images.length > 1 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.5rem" }}>
                    {images.slice(1).map((src, index) => (
                      <img key={src} src={src} alt={(product.title || "Produk") + " - gambar " + (index + 2)} loading="lazy" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "0.5rem" }} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span className="image-placeholder">DIVOOM</span>
            )}
          </div>
          <div className="detail-copy">
            <p className="eyebrow">
              {product.brand || product.product_type || "DIVOOM"}
            </p>
            <h2 id="detail-title">{product.title || "Produk"}</h2>
            <p className="detail-price">
              {formatPrice(displayPrice(product), "IDR")}
            </p>
            {safeRichDescription ? (
              <div className="detail-description" dangerouslySetInnerHTML={{ __html: safeRichDescription }} />
            ) : product.description ? (
              <p className="detail-description">{product.description}</p>
            ) : null}
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


function ProductDetailPage({ products, itemGroupId, status, error, onRetry, onNavigate }) {
  const variants = products.filter((product) => product.item_group_id === itemGroupId);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    setSelectedId(variants[0]?.id || "");
  }, [itemGroupId, products]);

  if (status === "loading") return <LoadingState />;
  if (status === "error") return <ErrorState message={error} onRetry={onRetry} />;
  if (!variants.length) {
    return (
      <section className="product-detail-page">
        <div className="empty-state">
          <span className="empty-icon">?</span>
          <h1>Produk tidak ditemukan</h1>
          <p>Produk dengan kode grup <strong>{itemGroupId}</strong> tidak tersedia di katalog.</p>
          <button className="button button-dark" type="button" onClick={() => onNavigate("products")}>Kembali ke produk</button>
        </div>
        <PageFooter />
      </section>
    );
  }

  const selected = variants.find((product) => product.id === selectedId) || variants[0];
  const images = productImages(selected);
  const safeRichDescription = sanitizeRichText(selected.rich_text_description);
  const available = String(selected.availability || "").toLowerCase() === "in stock";
  const variantLabel = (product) => product.color || product.title || product.id;

  return (
    <section className="product-detail-page">
      <button className="detail-breadcrumb" type="button" onClick={() => onNavigate("products")}>← Kembali ke produk</button>
      <div className="product-detail-layout">
        <div className="product-detail-gallery">
          {images.length ? (
            <>
              <img className="product-detail-main-image" src={images[0]} alt={selected.title || "Produk"} />
              {images.length > 1 && (
                <div className="product-detail-thumbnails">
                  {images.slice(1).map((src, index) => (
                    <img key={src} src={src} alt={(selected.title || "Produk") + " - gambar " + (index + 2)} loading="lazy" />
                  ))}
                </div>
              )}
            </>
          ) : <span className="image-placeholder">DIVOOM</span>}
        </div>
        <div className="product-detail-copy">
          <p className="eyebrow">{selected.brand || selected.product_type || "DIVOOM"}</p>
          <h1>{selected.title || "Produk"}</h1>
          <p className="product-detail-price">{formatPrice(displayPrice(selected), "IDR")}</p>
          <p className={`stock-status ${available ? "is-available" : ""}`}>
            <span className="status-dot" />
            {available ? "Tersedia" : String(selected.availability || "").toLowerCase() === "out of stock" ? "Stok habis" : "Status tidak diketahui"}
          </p>

          {variants.length > 1 && (
            <div className="variant-selector">
              <span className="variant-selector-label">Pilih varian ({variants.length})</span>
              <div className="variant-options">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    className={`variant-option ${selected.id === variant.id ? "is-selected" : ""}`}
                    aria-pressed={selected.id === variant.id}
                    onClick={() => setSelectedId(variant.id)}
                  >
                    {variantLabel(variant)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {safeRichDescription ? (
            <div className="detail-description" dangerouslySetInnerHTML={{ __html: safeRichDescription }} />
          ) : selected.description ? (
            <p className="detail-description">{selected.description}</p>
          ) : null}

          <dl className="detail-facts">
            {[
              ["Grup produk", selected.item_group_id],
              ["Kategori", selected.product_type],
              ["Warna", selected.color],
              ["Kondisi", selected.condition],
              ["Material", selected.material],
              ["Ukuran", selected.size]
            ].filter(([, value]) => value).map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
          <p className="detail-note">Informasi produk dan varian ditampilkan dari katalog Supabase.</p>
        </div>
      </div>
      <PageFooter />
    </section>
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
  const [initialLocation] = useState(resolveLocation);
  const [page, setPage] = useState(initialLocation.page);
  const [itemGroupId, setItemGroupId] = useState(initialLocation.itemGroupId);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [total, setTotal] = useState(null);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return products;

    return products.filter((product) =>
      [product.title, product.brand, product.product_type, product.color, product.item_group_id, product.description]
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
        throw new Error("Format respons get-divoom-products tidak sesuai.");
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

  function scrollToTop() {
    document.querySelector(".main-content")?.scrollTo({ top: 0, behavior: "instant" });
  }

  function showPage(nextPage) {
    const normalizedPage = ALLOWED_PAGES.includes(nextPage) ? nextPage : "home";
    setPage(normalizedPage);
    setItemGroupId(null);
    const nextUrl = normalizedPage === "home" ? "/#home" : `/#${normalizedPage}`;
    if (window.location.pathname + window.location.hash !== nextUrl) {
      window.history.pushState({ page: normalizedPage }, "", nextUrl);
    }
    scrollToTop();
  }

  function navigateToProduct(groupId) {
    const normalizedGroupId = String(groupId || "");
    if (!/^[a-z0-9]+$/i.test(normalizedGroupId)) return;
    setPage("productDetail");
    setItemGroupId(normalizedGroupId);
    window.history.pushState(
      { page: "productDetail", itemGroupId: normalizedGroupId },
      "",
      `/products/${encodeURIComponent(normalizedGroupId)}`
    );
    scrollToTop();
  }

  useEffect(() => {
    loadProducts();

    const handleLocationChange = () => {
      const location = resolveLocation();
      setPage(location.page);
      setItemGroupId(location.itemGroupId);
      scrollToTop();
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  useEffect(() => {
    document.title = page === "productDetail" ? "Detail Produk | Asri Collection" : "Asri Collection";
  }, [page, itemGroupId]);

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

        <div className="header-utility-actions" aria-label="Aksi cepat">
          <button className="header-icon-button" type="button" aria-label="Cari" onClick={() => showPage("search")}>⌕</button>
          <button className="header-icon-button" type="button" aria-label="Wishlist" onClick={() => showPage("wishlist")}>♡</button>
          <button className="header-icon-button" type="button" aria-label="Keranjang" onClick={() => showPage("cart")}>♧</button>
        </div>
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
                  <ProductGrid products={featuredProducts} onSelect={(product) => navigateToProduct(product.item_group_id)} />}
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
                <ProductGrid products={filteredProducts} onSelect={(product) => navigateToProduct(product.item_group_id)} />}
              <PageFooter />
            </section>
          ) : page === "productDetail" ? (
            <ProductDetailPage
              products={products}
              itemGroupId={itemGroupId}
              status={status}
              error={error}
              onRetry={loadProducts}
              onNavigate={showPage}
            />
          ) : (
            <section className="catalog-section">
              <PagePlaceholder title={{
                search: "Pencarian", cart: "Keranjang", checkout: "Checkout",
                orderSuccess: "Pesanan Berhasil", orderTracking: "Lacak Pesanan",
                wishlist: "Wishlist", profile: "Profil", contact: "Kontak"
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

    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
