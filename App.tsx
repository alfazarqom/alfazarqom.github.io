import React, { useState } from "react";
import { createRoot } from "react-dom/client";

type Page = "home" | "products";

function Header({
  activePage,
  onNavigate,
}: {
  activePage: Page;
  onNavigate: (page: Page) => void;
}) {
  return (
    <header className="site-header">
      <strong className="site-brand">My App</strong>
      <nav className="main-navigation" aria-label="Main navigation">
        <button
          type="button"
          className={`nav-button ${activePage === "home" ? "is-active" : ""}`}
          aria-current={activePage === "home" ? "page" : undefined}
          onClick={() => onNavigate("home")}
        >
          Home
        </button>
        <button
          type="button"
          className={`nav-button ${activePage === "products" ? "is-active" : ""}`}
          aria-current={activePage === "products" ? "page" : undefined}
          onClick={() => onNavigate("products")}
        >
          Products
        </button>
      </nav>
    </header>
  );
}

function Home() {
  return (
    <section>
      <p className="eyebrow">Welcome</p>
      <h1 className="page-title">Your application starts here.</h1>
      <p className="page-description">
        A lightweight React and TypeScript application running directly in the
        browser on GitHub Pages.
      </p>
    </section>
  );
}

function Products() {
  return (
    <section>
      <p className="eyebrow">Catalog</p>
      <h1 className="page-title">Products</h1>
      <p className="page-description">
        Your products page is ready to be developed.
      </p>
    </section>
  );
}

function Main({ activePage }: { activePage: Page }) {
  return (
    <main className="main-content">
      <div className="main-content-inner">
        {activePage === "home" ? <Home /> : <Products />}
      </div>
    </main>
  );
}

function App() {
  const [activePage, setActivePage] = useState<Page>("home");

  return (
    <div className="app-shell">
      <Header activePage={activePage} onNavigate={setActivePage} />
      <Main activePage={activePage} />
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
