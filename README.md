# Asri Collection — React CDN (No Build)

Asri Collection is a responsive storefront hosted as a static website on GitHub Pages. The application uses React loaded from a CDN, with Babel Standalone compiling JSX in the browser. It intentionally has no Node.js, npm, Vite, bundler, or build step.

## Repository structure

```text
.
├── index.html
├── App.jsx
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
- React Hooks for application state, product filtering, loading, and product details.
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

- **Home:** brand introduction and featured products.
- **Products:** product catalog with search by title, brand, category, or SKU.
- **Product details:** native HTML `<dialog>` controlled by React.
- **Navigation:** home/products state synchronized with the URL hash.
- **Responsive layout:** desktop and mobile rules in `style.css`.
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
- [ ] Product search and the native product detail dialog work.
- [ ] Loading, error, empty, and retry states work.
- [ ] URL hash navigation works.
- [ ] Mobile and desktop layouts remain usable.
- [ ] No privileged Supabase credential is embedded in frontend files.
