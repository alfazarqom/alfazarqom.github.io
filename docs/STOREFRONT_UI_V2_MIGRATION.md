# Storefront UI Migration — V2 Requirement

**Status:** Implemented on `feat/responsive-layout-v1`; verification pending.

## Scope
- Replace React CDN and Babel Standalone with React npm packages, TypeScript, and Vite.
- Integrate Storefront UI React and its Tailwind preset.
- Replace the legacy global stylesheet with Tailwind utility classes and a minimal Tailwind entry stylesheet.
- Migrate the application shell, header, navigation, product presentation, product detail, page feedback, footer, and existing placeholder pages.
- Preserve existing API, data shape, route semantics, and placeholder feature status.

## Design constraints
- Preserve ASRI brand palette and typography through Tailwind theme tokens.
- Mobile 320–767px; Tablet 768–1023px; Desktop 1024px and above.
- Product grid: 2 / 3 / 4 columns.
- BottomNavigation: Home, Products, Profile only.
- BottomActionBar: ProductDetail, Search, Cart, Checkout, OrderSuccess, OrderTracking, Wishlist, Contact.
- Footer remains nested inside each page.
- Avoid bespoke CSS; global CSS is limited to Tailwind layers and minimal base/accessibility rules.

## Data and routing invariants
- Keep the `get-divoom-products` endpoint unchanged.
- Keep `/products/{item_group_id}` unchanged.
- Product detail groups variants by `item_group_id`.
- Do not add demo fallback products or modify backend/database behavior.
- Preserve GitHub Pages deep-link forwarding through `public/404.html`.

## Deployment boundary
Vite outputs `dist/`. This branch adds a build-only CI workflow; it does not publish GitHub Pages or change repository Pages settings. Publishing `dist/` requires separate approval.
