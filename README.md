# Asri Collection — React, Vite & Storefront UI

Responsive storefront built with React 18, TypeScript, Vite, Storefront UI React, and Tailwind CSS. Responsive breakpoints: Mobile (320–767px), Tablet (768–1023px), Desktop (1024px+).

## Technology

- React / ReactDOM 19.0.0
- TypeScript 5.7
- Vite 6
- `@storefront-ui/react` 4.0.3
- Tailwind CSS 4.1 with Storefront UI Tailwind configuration
- npm
- Supabase Edge Function for public catalog reads

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

Vite writes production assets to `dist/`. The GitHub Pages publishing workflow/settings are not activated by this migration branch. Production must publish the `dist/` output; that deployment change requires separate approval.

## Product data source

The frontend continues to request:

```text
GET https://mvwflakurihhakdrlteg.supabase.co/functions/v1/get-divoom-products
```

The response contract remains `success: true`, `data: Product[]`, and optional `total`. The frontend does not query Supabase directly and does not substitute demo products when the request fails.

## Pages and behavior

- Home: brand introduction and featured products.
- Products: catalog and client-side search.
- Product detail: `/products/{item_group_id}`; all variants with the same group identifier are shown.
- Other routes: existing hash routes and placeholders remain unchanged.
- BottomNavigation: Home, Products, Profile.
- BottomActionBar: ProductDetail, Search, Cart, Checkout, OrderSuccess, OrderTracking, Wishlist, Contact.
- Footer: nested inside each page.
- GitHub Pages deep-link fallback: `public/404.html` is copied into the Vite output.

## Styling

Storefront UI components and Tailwind 4 utilities are the primary styling system. `src/styles/globals.css` contains Tailwind layers and minimal base/accessibility rules. The former root `style.css` has been removed. ASRI tokens are configured in `tailwind.config.cjs`.

## Verification

- [ ] `npm install` succeeds.
- [ ] `npm run build` succeeds.
- [ ] API contract and product route are preserved.
- [ ] Deep-link refresh and browser history work.
- [ ] Responsive widths 320, 390, 767, 768, 1023, 1024, and 1440px are checked.
- [ ] GitHub Pages serves `dist/` after separate deployment approval.
