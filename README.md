# Asri Collection — React + Babel Standalone

A no-build React storefront hosted as static files on GitHub Pages. JSX is compiled in the browser by Babel Standalone; this application does not require Vite, Webpack, Node.js build tooling, or a package manager at runtime.

## Runtime

- React and ReactDOM 18.3.1 using pinned UMD CDN assets.
- Babel Standalone 7.26.10 using a pinned CDN asset.
- JavaScript + JSX loaded as separate source files.
- CSS split into tokens, global, layout, components, and responsive layers.
- Custom hash routing with browser Back/Forward handling.
- Existing Supabase Edge Function for public product catalog reads.
- Cart and wishlist persisted in browser localStorage.

An internet connection is required for the CDN libraries, fonts, catalog endpoint, and remote product images.

## Repository structure

    .
    ├── index.html
    ├── css/
    │   ├── tokens.css
    │   ├── global.css
    │   ├── layout.css
    │   ├── components.css
    │   └── responsive.css
    ├── js/
    │   ├── config.js
    │   ├── loader.js
    │   ├── core.jsx
    │   ├── components.jsx
    │   ├── pages.jsx
    │   └── app.jsx
    ├── assets/
    │   ├── fonts/
    │   ├── icons/
    │   └── images/
    ├── docs/
    │   ├── DESIGN_SYSTEM.md
    │   └── DUITKU-POP-DOCUMENTATION-ROLE.md
    ├── blueprint-design-system.json
    ├── structure.json
    └── README.md

The JSX loader fetches and compiles source files sequentially before mounting React. This avoids relying on browser-native JSX support or an npm build pipeline.

## Routing and layout rules

Example hash routes: #/, #/shop, #/search, #/categories/:slug, #/products/:id, #/cart, #/wishlist, and #/checkout.

AppShell is for browsing, discovery, navigation, and informational pages. StandaloneLayout is for functional, transactional, or form-submit flows. Ordinary navigation CTAs remain in AppShell. BottomActionBar, when present, remains in normal document flow; it is not fixed, absolute, or sticky by default.

## Product data

The frontend reads the existing endpoint:

    GET https://mvwflakurihhakdrlteg.supabase.co/functions/v1/get-products

Expected response envelope:

    { "success": true, "data": [], "total": 147 }

The frontend validates HTTP status, the success flag, the data array, and product identifiers. It does not query the database directly, include a privileged key, or substitute hardcoded/demo products. The endpoint and database were not changed by this frontend migration. Availability is shown separately from numeric stock quantity; products are not automatically hidden based on stock.

## Implemented frontend behavior

- Home and featured products.
- Product catalog with search and basic price sorting.
- Product detail as a dedicated StandalonePage route.
- Add to cart, quantity changes, removal, and local persistence.
- Wishlist add/remove and local persistence.
- Checkout preview form (no order submission).
- AppShell and StandaloneLayout separation.
- BottomActionBar component in normal document flow.
- Toast feedback, loading, error, retry, and empty states.
- Responsive product grid and mobile navigation.

## Deliberately not activated

Order creation, shipping calculation, payment processing, payment callbacks, order tracking, customer authentication, contact delivery, and refund/cancellation operations are not connected. These require separately verified backend/provider contracts and separate approval. Checkout currently displays a frontend preview and cannot create a real order or payment.

Several page routes are architectural placeholders until their data sources and business requirements are approved. Their presence must not be interpreted as completed business integrations.

## Local preview

Serve the repository root with any static HTTP server, for example:

    python -m http.server 8000

Open http://localhost:8000. Opening index.html with a file URL is not recommended because the JSX loader fetches source files.

## GitHub Pages

Publish the repository root from the intended branch using GitHub Pages settings. No build command is required. This implementation does not change Pages settings or deploy the site.

## Verification checklist

- [ ] React, ReactDOM, and Babel CDN assets load.
- [ ] Sequential JSX loading succeeds.
- [ ] No JavaScript runtime errors.
- [ ] GitHub Pages serves JSX files as fetchable text.
- [ ] Supabase get-products returns the expected response.
- [ ] Product search, sorting, detail route, cart, and wishlist work.
- [ ] Back and Forward update the active route.
- [ ] Responsive and keyboard behavior are checked on target browsers.
- [ ] Checkout remains preview-only until backend integration is approved.
