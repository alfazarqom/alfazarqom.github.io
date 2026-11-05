# Asri Collection — React CDN (No Build)

Asri Collection is a mobile-only storefront hosted as a static website on GitHub Pages. The supported viewport width is 320–767px; wider screens show the same centered mobile layout capped at 767px. The application uses React loaded from a CDN, with Babel Standalone compiling JSX in the browser. It intentionally has no Node.js, npm, Vite, bundler, or build step.

## Repository structure

```text
.
├── index.html
├── App.jsx
├── Pages.jsx
├── style.css
├── structure.json
├── blueprint-design-system.json
├── README.md
└── docs/
    └── DESIGN_SYSTEM.md
```

## Technology

- React 18.3.1 UMD production runtime, loaded from CDN.
- ReactDOM 18.3.1 UMD production runtime, loaded from CDN.
- Babel Standalone 7.26.10 for browser-side JSX transformation.
- Native CSS in `style.css`.
- React Hooks for application state, catalog loading, page routing, and product selection.
- `Pages.jsx` contains the page-level React components, loaded by Babel Standalone before `App.jsx`.
- Browser `fetch()` for reading the public product catalog from a Supabase Edge Function.
- GitHub Pages for static hosting.

The browser must be online to load the CDN libraries, web fonts, product images, and product catalog. Babel compiles JSX in the browser, so this no-build setup favors a simple static deployment over build-time optimization.

## Product data source

The current frontend requests the following endpoint from `App.jsx`:

```text
GET https://mvwflakurihhakdrlteg.supabase.co/functions/v1/get-products
```

The frontend expects a JSON response containing `success: true` and a `data` array. It uses product fields including `id`, `title`, `brand`, `category`, `sku`, `price`, `sale_price`, `currency`, `availability`, `stock_quantity`, `image_url`, `labels`, and `description`. The optional `total` field is displayed when supplied.

The storefront reads through the Edge Function; it does not query the database directly, initialize the Supabase JavaScript client, or embed a Supabase anon key. It does not substitute demo products when a request fails. The endpoint and its deployed access configuration must be verified independently when the Supabase project or environment changes.

## Pages and behavior

- **Home:** brand introduction, featured catalog products, quick view, and wishlist actions.
- **Products:** live catalog grid and navigation to product search and detail.
- **ProductDetail:** catalog-backed product information, availability, wishlist, and add-to-cart.
- **Navigation:** page state synchronized with the URL hash.
- **BottomNavigation:** Home, Products, and Profile.
- **BottomActionBar:** ProductDetail, Search, Cart, Checkout, OrderSuccess, OrderTracking, Wishlist, and Contact.
- **Footer:** rendered inside each page.
- **Mobile-only layout:** 320–767px; no tablet or desktop layout.
- **Search:** searches product title, brand, category, SKU, and description.
- **Cart:** local persistent cart, quantity updates, removal, and subtotal.
- **Checkout:** guest recipient form and local draft creation. It does not submit an order to a server.
- **OrderSuccess:** confirms only that a local draft was saved; it does not indicate payment or order acceptance.
- **OrderTracking:** searches local draft references stored in the current browser only.
- **Wishlist:** local persistent saved products.
- **Profile:** optional guest profile stored in the current browser.
- **Contact:** validates and copies a message draft; no official contact recipient or automatic send is configured.
- **Local storage:** cart, wishlist, guest profile, and local order drafts are persisted in the current browser.
- **Feedback:** loading, error, empty, and retry states.

## Local preview

Run a static HTTP server from the repository root:

```bash
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000). Do not open `index.html` through a `file://` URL; serve it over HTTP so the browser can load the JSX source and CDN dependencies correctly.

## GitHub Pages

The site is designed to be published as static files from the repository root. For branch-based publishing, select `main` and the root folder (`/`) in **Settings → Pages**. This documentation update does not change GitHub Pages settings, workflows, or deployment state.

No GitHub Actions workflow, package installation, or build command is required for branch-based publishing.

## Project documentation

- `structure.json`: application architecture and component composition.
- `blueprint-design-system.json`: structured design-system specification and visual tokens.
- `docs/DESIGN_SYSTEM.md`: human-readable design-system rules and current implementation references.

When implementation and documentation differ, verify the source files and update the relevant documentation rather than assuming the documentation is current.

## Verification checklist

- [ ] React, ReactDOM, and Babel CDN scripts load successfully in a browser.
- [ ] Babel compiles `App.jsx` and React mounts into `#root`.
- [ ] Browser console has no runtime errors.
- [ ] `get-products` returns HTTP success and the expected JSON contract.
- [ ] Product search, product detail, quick view, and wishlist actions work.
- [ ] Cart changes persist after refresh.
- [ ] Guest profile and wishlist persist after refresh.
- [ ] Checkout creates a clearly labelled local draft only.
- [ ] Tracking finds drafts saved in the current browser.
- [ ] Contact form copies a draft without claiming it was sent.
- [ ] Loading, error, empty, and retry states work.
- [ ] URL hash navigation works.
- [ ] Mobile layout remains usable at 320px, 390px, and 767px.
- [ ] BottomNavigation appears only on Home, Products, and Profile.
- [ ] BottomActionBar appears only on ProductDetail, Search, Cart, Checkout, OrderSuccess, OrderTracking, Wishlist, and Contact.
- [ ] Footer is nested inside each page.
- [ ] Viewports wider than 767px do not activate a desktop/tablet layout.
- [ ] No privileged Supabase credential is embedded in frontend files.
- [ ] No order, payment, stock reservation, or server-side tracking is claimed without a verified backend contract.
