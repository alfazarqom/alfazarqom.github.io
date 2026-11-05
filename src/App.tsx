import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { SfButton, SfInput, SfIconSearch } from "@storefront-ui/react";

const PRODUCTS_ENDPOINT = "https://mvwflakurihhakdrlteg.supabase.co/functions/v1/get-divoom-products";
const ALLOWED_PAGES = ["home", "products", "productDetail", "search", "cart", "checkout", "orderSuccess", "orderTracking", "wishlist", "profile", "contact"] as const;
type Page = typeof ALLOWED_PAGES[number];

type Product = {
  id?: string | number;
  item_group_id?: string;
  title?: string;
  description?: string;
  rich_text_description?: string;
  availability?: string;
  condition?: string;
  price?: number | string | null;
  sale_price?: number | string | null;
  image_link?: string;
  additional_image_link?: string[];
  brand?: string;
  product_type?: string;
  color?: string;
  material?: string;
  size?: string;
  [key: string]: unknown;
};

function resolveLocation(): { page: Page; itemGroupId: string | null } {
  const pathname = decodeURIComponent(window.location.pathname).replace(/\/+$/, "") || "/";
  const match = pathname.match(/^\/products\/([a-z0-9]+)$/i);
  if (match) return { page: "productDetail", itemGroupId: match[1] };
  const hash = window.location.hash.replace("#", "") || "home";
  return { page: ALLOWED_PAGES.includes(hash as Page) ? hash as Page : "home", itemGroupId: null };
}

function formatPrice(amount: unknown): string {
  if (amount === null || amount === undefined || amount === "") return "Harga belum tersedia";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(amount) || 0);
}

function displayPrice(product: Product): unknown {
  const sale = Number(product.sale_price);
  const price = Number(product.price);
  return product.sale_price != null && Number.isFinite(sale) && Number.isFinite(price) && sale > 0 && sale < price ? sale : product.price;
}

function productImages(product: Product): string[] {
  const extra = Array.isArray(product.additional_image_link) ? product.additional_image_link : [];
  return [...new Set([product.image_link, ...extra].filter((url): url is string => typeof url === "string" && /^https?:\/\//i.test(url)))];
}

function sanitizeRichText(html: string | undefined): string {
  if (!html?.trim()) return "";
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const allowed = new Set(["P", "UL", "OL", "LI", "STRONG", "B", "EM", "I", "BR", "A", "H3", "H4"]);
  const escape = (value: string) => value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
  function serialize(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return escape(node.nodeValue || "");
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node as Element;
    const children = Array.from(el.childNodes).map(serialize).join("");
    if (!allowed.has(el.tagName)) return children;
    if (el.tagName === "BR") return "<br>";
    if (el.tagName === "A") {
      const href = el.getAttribute("href") || "";
      return /^https:\/\//i.test(href) ? '<a href="' + escape(href) + '" target="_blank" rel="noopener noreferrer">' + children + "</a>" : children;
    }
    return "<" + el.tagName.toLowerCase() + ">" + children + "</" + el.tagName.toLowerCase() + ">";
  }
  return Array.from(parsed.body.childNodes).map(serialize).join("");
}

function PrimaryButton({ children, onClick, type = "button" }: { children: ReactNode; onClick?: () => void; type?: "button" | "submit" }) {
  return <SfButton type={type} onClick={onClick} className="min-h-11 rounded-sm bg-asri-green px-5 font-semibold text-white hover:bg-asri-dark">{children}</SfButton>;
}

function LoadingState() {
  return <div className="flex items-center justify-center gap-3 py-16 text-sm text-asri-muted" role="status"><span className="h-5 w-5 animate-spin rounded-full border-2 border-asri-line border-t-asri-green" />Memuat katalog produk...</div>;
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-16 text-center" role="alert"><span className="text-3xl text-red-700">!</span><h3 className="font-display text-xl font-semibold">Katalog belum dapat dimuat</h3><p className="text-sm text-asri-muted">{message}</p><PrimaryButton onClick={onRetry}>Coba lagi</PrimaryButton></div>;
}

function ProductSearch({ value, onChange, variant = "catalog", onSubmit }: { value: string; onChange: (value: string) => void; variant?: "catalog" | "header"; onSubmit?: () => void }) {
  return <form role="search" aria-label={variant === "header" ? "Pencarian katalog" : "Cari produk"} onSubmit={e => { e.preventDefault(); onSubmit?.(); }} className={variant === "header" ? "flex min-w-0 flex-1 items-center border-b border-asri-line" : "flex w-full items-center gap-2 border border-asri-line bg-white px-3"}>
    <SfInput
      type="search"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Cari produk..."
      aria-label="Cari produk"
      slotPrefix={<SfIconSearch />}
      wrapperClassName="min-w-0 flex-1"
    />
    {variant === "header" && <button type="submit" aria-label="Tampilkan hasil pencarian" className="px-2 text-asri-green">↵</button>}
  </form>;
}

function ProductCard({ product, onSelect }: { product: Product; onSelect: (product: Product) => void }) {
  const stock = String(product.availability || "").toLowerCase();
  const available = stock === "in stock";
  return <button type="button" onClick={() => onSelect(product)} aria-label={`Lihat detail ${product.title || "produk"}`} className="group min-w-0 text-left">
    <span className="relative block aspect-[4/4.7] overflow-hidden bg-[#f0f0eb]">
      {product.image_link ? <img src={product.image_link} alt={product.title || "Produk Asri Collection"} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" /> : <span className="flex h-full items-center justify-center font-display text-2xl text-asri-muted">ASRI</span>}
      {product.color && <span className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 text-[10px] uppercase tracking-wider">{product.color}</span>}
    </span>
    <span className="mt-3 flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-[.14em] text-asri-muted">{product.brand || product.product_type || "DIVOOM"}</span>
      <strong className="line-clamp-2 min-h-10 text-sm font-semibold leading-5">{product.title || "Produk"}</strong>
      <span className="text-sm font-bold tabular-nums">{formatPrice(displayPrice(product))}</span>
      <span className={`flex items-center gap-1.5 text-xs ${available ? "text-asri-green" : "text-asri-muted"}`}><span className={`h-1.5 w-1.5 rounded-full ${available ? "bg-asri-green" : "bg-asri-muted"}`} />{available ? "Tersedia" : stock === "out of stock" ? "Stok habis" : "Status tidak diketahui"}</span>
    </span>
  </button>;
}

function ProductGrid({ products, onSelect }: { products: Product[]; onSelect: (product: Product) => void }) {
  if (!products.length) return <div className="py-16 text-center"><p className="text-2xl">⌕</p><h3 className="mt-2 font-display text-xl font-semibold">Produk tidak ditemukan</h3><p className="mt-1 text-sm text-asri-muted">Coba kata kunci lain.</p></div>;
  return <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4 lg:gap-x-6">{products.map((p, i) => <ProductCard key={p.id ?? i} product={p} onSelect={onSelect} />)}</div>;
}

function PageFooter() {
  return <footer className="mt-16 flex flex-col gap-2 border-t border-asri-line py-7 text-xs text-asri-muted sm:flex-row sm:items-center sm:justify-between"><strong className="tracking-[.16em] text-asri-ink">ASRI COLLECTION</strong><span>Considered style, made personal.</span><span>© {new Date().getFullYear()} Asri Collection</span></footer>;
}

function BottomNavigation({ page, onNavigate }: { page: Page; onNavigate: (page: string) => void }) {
  const items: [Page, string, string][] = [["home", "Beranda", "⌂"], ["products", "Produk", "▦"], ["profile", "Profil", "○"]];
  return <nav aria-label="Navigasi bawah" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-asri-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">{items.map(([id, label, icon]) => <button key={id} type="button" aria-current={page === id ? "page" : undefined} onClick={() => onNavigate(id)} className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs ${page === id ? "font-semibold text-asri-green" : "text-asri-muted"}`}><span className="text-xl" aria-hidden="true">{icon}</span>{label}</button>)}</nav>;
}

function BottomActionBar({ page, onNavigate }: { page: Page; onNavigate: (page: string) => void }) {
  const labels: Partial<Record<Page, string>> = { productDetail: "Detail Produk", search: "Pencarian", cart: "Keranjang", checkout: "Checkout", orderSuccess: "Pesanan Berhasil", orderTracking: "Lacak Pesanan", wishlist: "Wishlist", contact: "Kontak" };
  return <nav aria-label={labels[page] || "Aksi halaman"} className="border-t border-asri-line bg-white px-5 py-3"><button type="button" onClick={() => onNavigate("products")} className="min-h-11 text-sm font-semibold text-asri-green">← Kembali ke produk</button></nav>;
}

function ProductDetailPage({ products, itemGroupId, status, error, onRetry, onNavigate }: { products: Product[]; itemGroupId: string | null; status: string; error: string; onRetry: () => void; onNavigate: (page: string) => void }) {
  const variants = products.filter(p => p.item_group_id === itemGroupId);
  const [selectedId, setSelectedId] = useState<string | number | undefined>("");
  useEffect(() => { setSelectedId(variants[0]?.id); }, [itemGroupId, products]);
  if (status === "loading") return <><LoadingState /><PageFooter /></>;
  if (status === "error") return <><ErrorState message={error} onRetry={onRetry} /><PageFooter /></>;
  if (!variants.length) return <><div className="py-20 text-center"><h1 className="font-display text-2xl font-semibold">Produk tidak ditemukan</h1><p className="mt-2 text-sm text-asri-muted">Produk dengan kode grup <strong>{itemGroupId}</strong> tidak tersedia di katalog.</p><div className="mt-5"><PrimaryButton onClick={() => onNavigate("products")}>Kembali ke produk</PrimaryButton></div></div><PageFooter /></>;
  const selected = variants.find(p => p.id === selectedId) || variants[0];
  const images = productImages(selected);
  const rich = sanitizeRichText(selected.rich_text_description);
  const stock = String(selected.availability || "").toLowerCase();
  return <section>
    <button type="button" onClick={() => onNavigate("products")} className="mb-6 min-h-11 text-sm text-asri-muted">← Kembali ke produk</button>
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
      <div className="min-w-0">
        {images.length ? <><img src={images[0]} alt={selected.title || "Produk"} className="aspect-square w-full bg-[#f0f0eb] object-cover" />{images.length > 1 && <div className="mt-3 grid grid-cols-4 gap-2">{images.slice(1).map((src, i) => <img key={src} src={src} alt={`${selected.title || "Produk"} - gambar ${i + 2}`} loading="lazy" className="aspect-square w-full object-cover" />)}</div>}</> : <div className="flex aspect-square items-center justify-center bg-[#f0f0eb] font-display text-2xl text-asri-muted">DIVOOM</div>}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-asri-muted">{selected.brand || selected.product_type || "DIVOOM"}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight">{selected.title || "Produk"}</h1>
        <p className="mt-4 text-xl font-bold">{formatPrice(displayPrice(selected))}</p>
        <p className={`mt-3 text-sm ${stock === "in stock" ? "text-asri-green" : "text-asri-muted"}`}>{stock === "in stock" ? "● Tersedia" : stock === "out of stock" ? "● Stok habis" : "● Status tidak diketahui"}</p>
        {variants.length > 1 && <div className="mt-7"><p className="mb-3 text-sm font-semibold">Pilih varian ({variants.length})</p><div className="flex flex-wrap gap-2">{variants.map(v => <button key={String(v.id)} type="button" aria-pressed={selected.id === v.id} onClick={() => setSelectedId(v.id)} className={`min-h-11 border px-4 text-sm ${selected.id === v.id ? "border-asri-green bg-asri-soft text-asri-green" : "border-asri-line bg-white"}`}>{v.color || v.title || v.id}</button>)}</div></div>}
        {rich ? <div className="mt-7 space-y-3 text-sm leading-7" dangerouslySetInnerHTML={{ __html: rich }} /> : selected.description && <p className="mt-7 text-sm leading-7 text-asri-muted">{selected.description}</p>}
        <dl className="mt-7 divide-y divide-asri-line border-y border-asri-line text-sm">{[["Grup produk", selected.item_group_id], ["Kategori", selected.product_type], ["Warna", selected.color], ["Kondisi", selected.condition], ["Material", selected.material], ["Ukuran", selected.size]].filter(([, value]) => value).map(([label, value]) => <div key={label} className="grid grid-cols-2 gap-3 py-3"><dt className="text-asri-muted">{label}</dt><dd className="text-right font-medium">{String(value)}</dd></div>)}</dl>
        <p className="mt-5 text-xs text-asri-muted">Informasi produk dan varian ditampilkan dari katalog Supabase.</p>
      </div>
    </div>
    <PageFooter />
  </section>;
}

function PagePlaceholder({ title }: { title: string }) {
  return <section className="mx-auto max-w-xl py-20 text-center"><p className="text-[10px] font-bold tracking-[.18em] text-asri-green">ASRI COLLECTION</p><h1 className="mt-3 font-display text-3xl font-semibold">{title}</h1><p className="mt-4 text-sm leading-7 text-asri-muted">Halaman ini sudah terdaftar dalam struktur aplikasi, tetapi fitur dan kontennya belum diimplementasikan.</p></section>;
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [initialLocation] = useState(resolveLocation);
  const [page, setPage] = useState<Page>(initialLocation.page);
  const [itemGroupId, setItemGroupId] = useState<string | null>(initialLocation.itemGroupId);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");
  const [total, setTotal] = useState<number | null>(null);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p => [p.title, p.brand, p.product_type, p.color, p.item_group_id, p.description].filter(Boolean).some(v => String(v).toLowerCase().includes(q)));
  }, [products, query]);

  async function loadProducts() {
    setStatus("loading"); setError("");
    try {
      const response = await fetch(PRODUCTS_ENDPOINT, { method: "GET", headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`Permintaan katalog gagal (HTTP ${response.status}).`);
      const result = await response.json();
      if (result?.success !== true || !Array.isArray(result.data)) throw new Error("Format respons get-divoom-products tidak sesuai.");
      setProducts(result.data);
      setTotal(Number.isFinite(Number(result.total)) ? Number(result.total) : null);
      setStatus("success");
    } catch (e) {
      setProducts([]); setTotal(null);
      setError(e instanceof Error ? e.message : "Terjadi kesalahan saat menghubungkan ke katalog produk.");
      setStatus("error");
    }
  }

  function scrollToTop() {
    document.querySelector("main")?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }

  function showPage(next: string) {
    const nextPage = ALLOWED_PAGES.includes(next as Page) ? next as Page : "home";
    setPage(nextPage); setItemGroupId(null);
    const nextUrl = nextPage === "home" ? "/#home" : `/#${nextPage}`;
    if (window.location.pathname + window.location.hash !== nextUrl) window.history.pushState({ page: nextPage }, "", nextUrl);
    scrollToTop();
  }

  function navigateToProduct(groupId: unknown) {
    const normalized = String(groupId || "");
    if (!/^[a-z0-9]+$/i.test(normalized)) return;
    setPage("productDetail"); setItemGroupId(normalized);
    window.history.pushState({ page: "productDetail", itemGroupId: normalized }, "", `/products/${encodeURIComponent(normalized)}`);
    scrollToTop();
  }

  useEffect(() => {
    void loadProducts();
    const onLocation = () => { const location = resolveLocation(); setPage(location.page); setItemGroupId(location.itemGroupId); scrollToTop(); };
    window.addEventListener("popstate", onLocation);
    window.addEventListener("hashchange", onLocation);
    return () => { window.removeEventListener("popstate", onLocation); window.removeEventListener("hashchange", onLocation); };
  }, []);

  useEffect(() => { document.title = page === "productDetail" ? "Detail Produk | Asri Collection" : "Asri Collection"; }, [page, itemGroupId]);

  const featured = products.slice(0, 4);
  const onSelect = (product: Product) => navigateToProduct(product.item_group_id);
  const isMainPage = ["home", "products", "profile"].includes(page);

  return <div className="flex min-h-screen flex-col">
    <header className="sticky top-0 z-20 border-b border-asri-line bg-asri-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-storefront items-center gap-4 px-4 md:h-[72px] md:px-8 lg:h-[76px] lg:px-[clamp(32px,6vw,84px)]">
        <a href="/#home" onClick={e => { e.preventDefault(); showPage("home"); }} aria-label="Asri Collection home" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center bg-asri-green font-display text-lg text-white">A</span><span className="flex flex-col leading-none"><strong className="font-display text-base tracking-[.12em]">ASRI</strong><small className="mt-1 text-[9px] tracking-[.2em] text-asri-muted">COLLECTION</small></span>
        </a>
        <nav aria-label="Navigasi utama" className="hidden shrink-0 items-center gap-5 md:flex">
          <button type="button" onClick={() => showPage("home")} aria-current={page === "home" ? "page" : undefined} className={`min-h-11 text-sm ${page === "home" ? "font-semibold text-asri-green" : "text-asri-muted"}`}>Beranda</button>
          <button type="button" onClick={() => showPage("products")} aria-current={page === "products" || page === "productDetail" ? "page" : undefined} className={`min-h-11 text-sm ${page === "products" || page === "productDetail" ? "font-semibold text-asri-green" : "text-asri-muted"}`}>Produk</button>
        </nav>
        <div className="hidden min-w-0 flex-1 md:block"><ProductSearch value={query} onChange={setQuery} variant="header" onSubmit={() => showPage("products")} /></div>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <button type="button" aria-label="Cari produk" onClick={() => showPage("search")} className="flex h-11 w-11 items-center justify-center text-xl text-asri-ink md:hidden">⌕</button>
          <button type="button" aria-label="Wishlist" onClick={() => showPage("wishlist")} className="flex h-11 w-11 items-center justify-center text-xl text-asri-ink">♡</button>
          <button type="button" aria-label="Keranjang" onClick={() => showPage("cart")} className="flex h-11 w-11 items-center justify-center text-xl text-asri-ink">♧</button>
        </div>
      </div>
    </header>
    <main className="min-h-0 flex-1 overflow-y-auto pb-16 md:pb-0">
      <div className="mx-auto max-w-storefront px-4 py-7 md:px-8 md:py-10 lg:px-[clamp(32px,6vw,84px)] lg:py-14">
        {page === "home" ? <section>
          <div className="grid overflow-hidden bg-asri-deep text-white md:grid-cols-2">
            <div className="flex flex-col items-start justify-center px-6 py-12 md:px-10 lg:px-14 lg:py-16">
              <p className="text-[10px] font-bold tracking-[.18em] text-white/70">CURATED FOR EVERYDAY ELEGANCE</p>
              <h1 className="mt-5 font-display text-4xl font-medium leading-tight md:text-5xl lg:text-6xl">Temukan gaya yang <em className="font-editorial font-normal">bercerita.</em></h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/75">Pilihan fashion dan aksesori terkurasi untuk melengkapi setiap momen, dengan karakter yang tetap terasa personal.</p>
              <div className="mt-7"><PrimaryButton onClick={() => showPage("products")}>Jelajahi koleksi ↗</PrimaryButton></div>
              <div className="mt-12 flex w-full justify-between text-[9px] tracking-[.16em] text-white/60"><span>01 / 02</span><span>TIMELESS · CONSIDERED · YOURS</span></div>
            </div>
            <div className="relative hidden min-h-[380px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#244b38] to-[#102d20] md:flex">
              <div className="absolute h-[78%] w-[78%] rounded-full border border-white/20" /><div className="absolute h-[58%] w-[58%] rounded-full border border-white/15" />
              <div className="font-editorial text-[14rem] leading-none text-white/90">A<span className="text-asri-green">.</span></div>
              <p className="absolute bottom-8 right-8 text-[10px] leading-5 tracking-[.18em] text-white/60">THE ART OF<br/>EVERYDAY STYLE</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 border-b border-asri-line py-6 text-[10px] font-bold tracking-[.16em] sm:flex-row sm:items-center sm:justify-between"><span>STYLE, WITH INTENTION.</span><span className="font-normal tracking-normal text-asri-muted">Kurasi pilihan. Detail bermakna. Gaya milikmu.</span></div>
          <section className="pt-10 md:pt-14">
            <div className="mb-6 flex items-end justify-between gap-3"><div><p className="text-[10px] font-bold tracking-[.16em] text-asri-green">PILIHAN KAMI</p><h2 className="mt-2 font-display text-2xl font-semibold md:text-3xl">Featured pieces</h2></div><button type="button" onClick={() => showPage("products")} className="min-h-11 text-xs font-semibold text-asri-green">Lihat semua produk ↗</button></div>
            {status === "loading" ? <LoadingState /> : status === "error" ? <ErrorState message={error} onRetry={() => void loadProducts()} /> : <ProductGrid products={featured} onSelect={onSelect} />}
          </section>
          <PageFooter />
        </section> : page === "products" ? <section>
          <div className="py-4 md:py-8"><p className="text-[10px] font-bold tracking-[.16em] text-asri-green">THE ASRI EDIT</p><h1 className="mt-2 font-display text-3xl font-semibold md:text-5xl">Our collection<span className="text-asri-green">.</span></h1><p className="mt-3 max-w-xl text-sm leading-7 text-asri-muted">Temukan item pilihan yang menyatukan kualitas, fungsi, dan karakter.</p></div>
          <div className="mb-6 flex flex-col gap-3 border-y border-asri-line py-3 md:flex-row md:items-center md:justify-between"><span className="text-xs text-asri-muted" aria-live="polite">{status === "loading" ? "Memuat produk..." : status === "error" ? "Katalog tidak tersedia" : total !== null ? `${filteredProducts.length} dari ${total} produk` : `${filteredProducts.length} produk`}</span><div className="w-full md:max-w-xs"><ProductSearch value={query} onChange={setQuery} /></div></div>
          {status === "loading" ? <LoadingState /> : status === "error" ? <ErrorState message={error} onRetry={() => void loadProducts()} /> : <ProductGrid products={filteredProducts} onSelect={onSelect} />}
          <PageFooter />
        </section> : page === "productDetail" ? <ProductDetailPage products={products} itemGroupId={itemGroupId} status={status} error={error} onRetry={() => void loadProducts()} onNavigate={showPage} /> : <section><PagePlaceholder title={({ search: "Pencarian", cart: "Keranjang", checkout: "Checkout", orderSuccess: "Pesanan Berhasil", orderTracking: "Lacak Pesanan", wishlist: "Wishlist", profile: "Profil", contact: "Kontak" } as Record<string, string>)[page] || "Halaman"} /><PageFooter /></section>}
      </div>
    </main>
    {isMainPage ? <BottomNavigation page={page} onNavigate={showPage} /> : <BottomActionBar page={page} onNavigate={showPage} />}
  </div>;
}
