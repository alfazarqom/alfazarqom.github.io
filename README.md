# Asri Collection — React CDN (No Build)

Asri Collection is a responsive storefront hosted as a static website on GitHub Pages. Header, Home, and Products support Mobile (320–767px), Tablet (768–1023px), and Desktop (1024px and above). Other page content retains its existing behavior and is outside the Responsive Layout V1 redesign scope. The application uses React loaded from a CDN, with Babel Standalone compiling JSX in the browser. It intentionally has no Node.js, npm, Vite, bundler, or build step.

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
GET https://mvwflakurihhakdrlteg.supabase.co/functions/v1/get-divoom-products
```

The frontend expects a JSON response containing `success: true`, a `data` array, and the optional numeric `total`. Product data comes from `public.divoom_products` and includes `id`, `item_group_id`, `title`, `description`, `rich_text_description`, `availability`, `condition`, `price`, `sale_price`, `link`, `image_link`, `additional_image_link`, `brand`, `google_product_category`, `product_type`, `color`, `size`, `material`, `pattern`, `gender`, `age_group`, and `additional_variant_attribute`. Prices are numeric IDR values; `sale_price` may be `null`. `additional_image_link` is a JSON array. The storefront uses `image_link` for the primary image and the additional image array for the product gallery.

The storefront reads through the Edge Function; it does not query the database directly, initialize the Supabase JavaScript client, or embed a Supabase anon key. It does not substitute demo products when a request fails. The endpoint and its deployed access configuration must be verified independently when the Supabase project or environment changes.

## Pages and behavior

- **Home:** brand introduction and featured products.
- **Products:** product catalog with search by title, brand, product type, color, item group, or description.
- **Product details:** dedicated `/products/{item_group_id}` route; all variants sharing the group ID are selectable on one detail page.
- **Navigation:** product details use the URL path and browser history; other placeholder pages retain hash-based navigation.
- **GitHub Pages deep links:** `404.html` redirects deep links to the root entry point with the requested path encoded in a query parameter; `index.html` restores the original path before React resolves the route.
- **BottomNavigation:** Home, Products, and Profile.
- **BottomActionBar:** ProductDetail, Search, Cart, Checkout, OrderSuccess, OrderTracking, Wishlist, and Contact.
- **Footer:** rendered inside each page.
- **Responsive Layout V1:** Header, Home, and Products support Mobile, Tablet, and Desktop; BottomNavigation appears only on Mobile.
- **Page status:** Home and Products retain their existing features. Profile and the other target routes currently render placeholders; their commerce functionality is not implemented.
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
- [ ] `get-divoom-products` returns HTTP success and the expected Divoom product JSON contract.
- [ ] Product search works.
- [ ] Clicking a product card opens `/products/{item_group_id}`.
- [ ] Product detail displays every variant sharing the selected `item_group_id`.
- [ ] Direct product URLs and refreshes load through the GitHub Pages `404.html` fallback.
- [ ] Browser back and forward restore the correct product route.
- [ ] Loading, error, empty, and retry states work.
- [ ] URL hash navigation works.
- [ ] Mobile layout remains usable at 320px, 390px, and 767px.
- [ ] BottomNavigation appears only on Home, Products, and Profile at Mobile widths (320–767px), and is hidden at Tablet/Desktop.
- [ ] BottomActionBar appears only on ProductDetail, Search, Cart, Checkout, OrderSuccess, OrderTracking, Wishlist, and Contact.
- [ ] Footer is nested inside each page.
- [ ] Header, Home, and Products render responsive layouts at 320px, 390px, 767px, 768px, 1023px, 1024px, and 1440px.
- [ ] No privileged Supabase credential is embedded in frontend files.
