# Asri Collection — React CDN (No Build)

A mobile-responsive React storefront served directly by GitHub Pages. React and ReactDOM are loaded from CDN; Babel Standalone transforms JSX in the browser. There is no Node.js, NPM, Vite, bundler, or build step.

## Repository structure

```text
.
├── index.html   # HTML shell and CDN runtime
├── App.jsx      # Single-file React application
├── style.css    # Existing responsive storefront styles
└── README.md    # Project documentation
```

## Technology

- React 18.3.1 UMD production runtime.
- ReactDOM 18.3.1 UMD production runtime.
- Babel Standalone 7.26.10 for browser-side JSX transformation.
- Native CSS for layout and responsive styling.
- React Hooks for application state, filtering, loading, and product details.
- Supabase Edge Function for public product catalog reads.
- GitHub Pages for static hosting.

The browser must be online to load the CDN libraries, web fonts, product images, and product catalog. Since Babel compiles JSX in the browser, this no-build setup prioritizes simple deployment over production build-time optimization.

## Product data source

The storefront requests:

```text
GET https://mvwflakurihhakdrlteg.supabase.co/functions/v1/get-products
```

The frontend expects a JSON response with `success: true` and a `data` array. It optionally displays `total` when supplied. Product fields used include `id`, `title`, `brand`, `category`, `sku`, `price`, `sale_price`, `currency`, `availability`, `stock_quantity`, `image_url`, `labels`, and `description`.

The storefront does not query the database directly, initialize the Supabase JavaScript client, or include a Supabase anon key. It does not substitute demo products when the request fails. The Edge Function's deployed access configuration controls endpoint access.

## Pages and behavior

- **Home:** brand introduction and four featured products.
- **Products:** catalog with search by title, brand, category, or SKU.
- **Product details:** native dialog rendered and controlled by React.
- **Navigation:** home/products state synchronized with the URL hash.
- **Responsive layout:** desktop and mobile breakpoints in `style.css`.
- **Loading and errors:** loading state, error message, and retry action.

## Local preview

Serve the repository root using any static HTTP server:

```bash
python -m http.server 8000
```

Open `http://localhost:8000`. Do not open the file directly with a `file://` URL; use HTTP so the browser can load the JSX source and CDN dependencies.

## GitHub Pages

Publish the repository root from the selected branch using **Settings → Pages**. No GitHub Actions workflow or build command is needed for branch-based Pages publishing. This migration branch is not configured or deployed by this change.

## Verification checklist

- [ ] CDN React, ReactDOM, and Babel scripts load successfully in a browser.
- [ ] JSX compiles and the React application mounts.
- [ ] Browser console has no runtime errors.
- [ ] `get-products` returns HTTP success and the expected JSON contract.
- [ ] Product search and product detail dialog work.
- [ ] Loading, error, empty, and retry states work.
- [ ] URL hash navigation works.
- [ ] Mobile and desktop layouts remain usable.
- [ ] No privileged Supabase credential is embedded in frontend files.
