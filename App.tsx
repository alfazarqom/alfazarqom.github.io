import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";

// Public browser credentials. The anon key is designed for client-side use;
// database access must remain protected by Supabase Row Level Security.
const supabaseUrl = "https://mvwflakurihhakdrlteg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12d2ZsYWt1cmloaGFrZHJsdGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMjIwMDksImV4cCI6MjEwNDc5ODAwOX0.E09Vufp77NOkpGjJZMH6sbWYInKu_sMzV7eqHX6xQ0A";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Page = "home" | "products";

type Product = {
  id: string;
  title: string;
  brand: string | null;
  price: number | null;
  sale_price: number | null;
  currency: string;
  description: string | null;
  sku: string | null;
  category: string | null;
  availability: string | null;
  stock_quantity: number | null;
  colors: unknown;
  sizes: unknown;
  image_url: string | null;
  additional_image_urls: unknown;
  labels: unknown;
  created_at: string;
  updated_at: string;
};

const formatPrice = (amount: number | null, currency = "IDR") => {
  if (amount === null || amount === undefined) return "Harga belum tersedia";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getDisplayPrice = (product: Product) =>
  product.sale_price !== null &&
  product.price !== null &&
  product.sale_price < product.price
    ? product.sale_price
    : product.price;

function Header({
  activePage,
  onNavigate,
}: {
  activePage: Page;
  onNavigate: (page: Page) => void;
}) {
  return (
    <header className="site-header">
      <button className="brand-lockup" type="button" onClick={() => onNavigate("home")} aria-label="Asri Collection home">
        <span className="brand-mark">A</span>
        <span className="brand-copy">
          <strong>ASRI</strong>
          <small>COLLECTION</small>
        </span>
      </button>
      <nav className="main-navigation" aria-label="Navigasi utama">
        <button type="button" className={activePage === "home" ? "nav-button is-active" : "nav-button"} aria-current={activePage === "home" ? "page" : undefined} onClick={() => onNavigate("home")}>Beranda</button>
        <button type="button" className={activePage === "products" ? "nav-button is-active" : "nav-button"} aria-current={activePage === "products" ? "page" : undefined} onClick={() => onNavigate("products")}>Produk</button>
      </nav>
      <button className="header-cta" type="button" onClick={() => onNavigate("products")}>Jelajahi <span aria-hidden="true">↗</span></button>
    </header>
  );
}

function ProductCard({ product, onSelect }: { product: Product; onSelect: (product: Product) => void }) {
  const [imageFailed, setImageFailed] = useState(false);
  const price = getDisplayPrice(product);
  const isAvailable = (product.availability || "").toLowerCase() === "available";

  return (
    <button className="product-card" type="button" onClick={() => onSelect(product)}>
      <span className="product-image-wrap">
        {product.image_url && !imageFailed ? (
          <img className="product-image" src={product.image_url} alt={product.title} loading="lazy" onError={() => setImageFailed(true)} />
        ) : (
          <span className="image-placeholder" aria-hidden="true">ASRI</span>
        )}
        {Array.isArray(product.labels) && product.labels.length > 0 && (
          <span className="product-label">{String(product.labels[0])}</span>
        )}
      </span>
      <span className="product-meta">
        <span className="product-brand">{product.brand || product.category || "ASRI COLLECTION"}</span>
        <strong className="product-title">{product.title}</strong>
        <span className="product-price">{formatPrice(price, product.currency)}</span>
        <span className={isAvailable ? "stock-status is-available" : "stock-status"}>
          <span className="status-dot" /> {isAvailable ? "Tersedia" : "Periksa ketersediaan"}
          {product.stock_quantity !== null ? <span className="stock-count"> · Stok {product.stock_quantity}</span> : null}
        </span>
      </span>
    </button>
  );
}

function ProductGrid({ products, onSelect }: { products: Product[]; onSelect: (product: Product) => void }) {
  if (!products.length) {
    return <div className="empty-state"><span className="empty-icon">⌕</span><h3>Produk tidak ditemukan</h3><p>Coba kata kunci lain.</p></div>;
  }
  return <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} onSelect={onSelect} />)}</div>;
}

function ProductDetail({ product, onClose }: { product: Product; onClose: () => void }) {
  const [imageFailed, setImageFailed] = useState(false);
  const price = getDisplayPrice(product);
  return (
    <div className="detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="detail-panel" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <button className="detail-close" type="button" onClick={onClose} aria-label="Tutup detail">×</button>
        <div className="detail-image-wrap">
          {product.image_url && !imageFailed ? <img src={product.image_url} alt={product.title} onError={() => setImageFailed(true)} /> : <span className="image-placeholder">ASRI</span>}
        </div>
        <div className="detail-copy">
          <p className="eyebrow">{product.brand || product.category || "ASRI COLLECTION"}</p>
          <h2 id="detail-title">{product.title}</h2>
          <p className="detail-price">{formatPrice(price, product.currency)}</p>
          {product.description && product.description !== "deskripsi belum di atur" && <p className="detail-description">{product.description}</p>}
          <dl className="detail-facts">
            {product.sku && <div><dt>SKU</dt><dd>{product.sku}</dd></div>}
            {product.category && <div><dt>Kategori</dt><dd>{product.category}</dd></div>}
            <div><dt>Ketersediaan</dt><dd>{product.availability || "Belum diketahui"}</dd></div>
            {product.stock_quantity !== null && <div><dt>Stok</dt><dd>{product.stock_quantity}</dd></div>}
          </dl>
          <p className="detail-note">Informasi produk ditampilkan langsung dari katalog Supabase.</p>
        </div>
      </section>
    </div>
  );
}

function LoadingState() {
  return <div className="loading-state"><span className="spinner" />Memuat katalog produk...</div>;
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="error-state" role="alert">
      <span className="error-icon">!</span>
      <h3>Katalog belum dapat dimuat</h3>
      <p>{message}</p>
      <button className="button button-dark" type="button" onClick={onRetry}>Coba lagi</button>
    </div>
  );
}

function Home({
  products,
  loading,
  error,
  onNavigate,
  onRetry,
  onSelect,
}: {
  products: Product[];
  loading: boolean;
  error: string;
  onNavigate: (page: Page) => void;
  onRetry: () => void;
  onSelect: (product: Product) => void;
}) {
  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <p className="eyebrow hero-eyebrow"><span /> CURATED FOR EVERYDAY ELEGANCE</p>
          <h1>Temukan gaya yang <em>bercerita.</em></h1>
          <p className="hero-description">Pilihan fashion dan aksesori terkurasi untuk melengkapi setiap momen, dengan karakter yang tetap terasa personal.</p>
          <button className="button button-light" type="button" onClick={() => onNavigate("products")}>Jelajahi koleksi <span aria-hidden="true">↗</span></button>
          <div className="hero-caption"><span>01 / 02</span><span>TIMELESS · CONSIDERED · YOURS</span></div>
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
          <div><p className="eyebrow">PILIHAN KAMI</p><h2>Featured pieces</h2></div>
          <button className="text-link" type="button" onClick={() => onNavigate("products")}>Lihat semua produk <span>↗</span></button>
        </div>
        {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={onRetry} /> : <ProductGrid products={products.slice(0, 4)} onSelect={onSelect} />}
      </section>
    </>
  );
}

function Products({
  products,
  loading,
  error,
  onRetry,
  onSelect,
}: {
  products: Product[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  onSelect: (product: Product) => void;
}) {
  const [search, setSearch] = useState("");
  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      [product.title, product.brand, product.category, product.sku]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [products, search]);

  return (
    <section className="catalog-section">
      <div className="catalog-heading">
        <p className="eyebrow">THE ASRI EDIT</p>
        <h1>Our collection<span>.</span></h1>
        <p>Temukan item pilihan yang menyatukan kualitas, fungsi, dan karakter.</p>
      </div>
      <div className="catalog-toolbar">
        <span>{loading ? "Memuat produk..." : error ? "Katalog tidak tersedia" : `${filteredProducts.length} produk`}</span>
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari produk..." aria-label="Cari produk" />
        </label>
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={onRetry} /> : <ProductGrid products={filteredProducts} onSelect={onSelect} />}
    </section>
  );
}

function App() {
  const [activePage, setActivePage] = useState<Page>("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: queryError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (queryError) throw queryError;
      setProducts((data || []) as Product[]);
    } catch (loadError) {
      setProducts([]);
      const message =
        loadError instanceof Error
          ? loadError.message
          : typeof loadError === "object" && loadError !== null && "message" in loadError
            ? String(loadError.message)
            : "Terjadi kesalahan saat menghubungkan ke Supabase.";
      setError(message || "Terjadi kesalahan saat menghubungkan ke Supabase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  return (
    <div className="app-shell">
      <Header activePage={activePage} onNavigate={setActivePage} />
      <main className="main-content">
        <div className="main-content-inner">
          {activePage === "home" ? (
            <Home products={products} loading={loading} error={error} onNavigate={setActivePage} onRetry={loadProducts} onSelect={setSelectedProduct} />
          ) : (
            <Products products={products} loading={loading} error={error} onRetry={loadProducts} onSelect={setSelectedProduct} />
          )}
        </div>
      </main>
      <footer className="site-footer">
        <span className="footer-brand">ASRI COLLECTION</span>
        <span>Considered style, made personal.</span>
        <span>© {new Date().getFullYear()} Asri Collection</span>
      </footer>
      {selectedProduct && <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Element "#root" tidak ditemukan.');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
