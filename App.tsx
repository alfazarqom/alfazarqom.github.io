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
  const linkStyle = (page: Page): React.CSSProperties => ({
    border: 0,
    background: "transparent",
    color: activePage === page ? "#047857" : "#64748b",
    fontSize: 14,
    fontWeight: activePage === page ? 700 : 500,
    padding: "10px 12px",
    cursor: "pointer",
    borderBottom: activePage === page ? "2px solid #047857" : "2px solid transparent",
  });

  return (
    <header style={{
      height: 68,
      padding: "0 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      background: "#ffffff",
      borderBottom: "1px solid #e2e8f0",
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}>
      <strong style={{ fontSize: 19, letterSpacing: "-0.5px" }}>My App</strong>
      <nav aria-label="Main navigation" style={{ display: "flex", alignItems: "center" }}>
        <button type="button" style={linkStyle("home")} onClick={() => onNavigate("home")}>Home</button>
        <button type="button" style={linkStyle("products")} onClick={() => onNavigate("products")}>Products</button>
      </nav>
    </header>
  );
}

function Home() {
  return (
    <section>
      <p style={{ color: "#047857", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Welcome</p>
      <h1 style={{ margin: "8px 0 12px", fontSize: "clamp(30px, 7vw, 48px)", lineHeight: 1.1, letterSpacing: "-1.5px" }}>
        Your application starts here.
      </h1>
      <p style={{ maxWidth: 560, color: "#64748b", lineHeight: 1.7, margin: 0 }}>
        A lightweight React and TypeScript application running directly in the browser on GitHub Pages.
      </p>
    </section>
  );
}

function Products() {
  return (
    <section>
      <p style={{ color: "#047857", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Catalog</p>
      <h1 style={{ margin: "8px 0 12px", fontSize: "clamp(30px, 7vw, 48px)", lineHeight: 1.1, letterSpacing: "-1.5px" }}>Products</h1>
      <p style={{ color: "#64748b", lineHeight: 1.7, margin: 0 }}>Your products page is ready to be developed.</p>
    </section>
  );
}

function Main({ activePage }: { activePage: Page }) {
  return (
    <main style={{ width: "100%", maxWidth: 960, margin: "0 auto", padding: "clamp(28px, 7vw, 64px) 20px" }}>
      {activePage === "home" ? <Home /> : <Products />}
    </main>
  );
}

function App() {
  const [activePage, setActivePage] = useState<Page>("home");

  return (
    <div style={{ minHeight: "100vh" }}>
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
