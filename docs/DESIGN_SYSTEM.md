# Asri Collection — Design System

**Version:** 2.0.0  
**Status:** Migrated to Storefront UI and Tailwind; verification pending.

## Technology baseline

- React 18.3.1 and ReactDOM 18.3.1 via npm.
- TypeScript 5.7.
- Vite 6 for development and production build.
- Storefront UI React 4.0.3 with the Storefront UI Tailwind preset.
- Tailwind CSS 3.4 and PostCSS.
- GitHub Pages static hosting target; Vite output is `dist/`.

The documentation site is versioned under Storefront UI V2. The React npm package has its own independent package version; this repository currently pins `@storefront-ui/react@4.0.3`. Confirm dependency installation and peer compatibility with the build before deployment.

## Design principles

1. Preserve the approved ASRI visual identity.
2. Use Storefront UI components for standard interactive controls where appropriate.
3. Prefer Tailwind utilities and reusable React components over bespoke CSS.
4. Keep responsive behavior consistent across all existing pages.
5. Preserve semantic markup, keyboard access, visible focus, and touch targets.
6. Keep the data/API contract independent from the UI library.

## Brand tokens

The values below remain aligned with `blueprint-design-system.json` and are configured in `tailwind.config.cjs`.

| Token | Value |
|---|---|
| Green | `#176b45` |
| Green dark | `#104c34` |
| Deep green | `#183e2d` |
| Paper | `#fbfbf8` |
| Ink | `#171a17` |
| Muted | `#777d75` |
| Line | `#e8e9e3` |
| Body font | DM Sans |
| Display font | Manrope |
| Editorial accent | Georgia |

## Responsive layout

| Viewport | Width | Header | Gutter | Product grid |
|---|---:|---:|---:|---:|
| Mobile | 320–767px | 64px | 16–20px | 2 columns |
| Tablet | 768–1023px | 72px | 32px | 3 columns |
| Desktop | ≥1024px | 76px | clamp(32px, 6vw, 84px) | 4 columns |

- Content maximum width: 1440px.
- BottomNavigation is visible only on Home, Products, and Profile at Mobile widths.
- BottomActionBar is used on ProductDetail, Search, Cart, Checkout, OrderSuccess, OrderTracking, Wishlist, and Contact.
- Footer remains inside each page.
- Main content owns vertical scrolling; bottom navigation is outside the scrolling region.

## Component and styling policy

- Storefront UI React provides the base UI components.
- Tailwind utility classes compose ASRI page and component layouts.
- `src/styles/globals.css` is limited to Tailwind layers and minimal global base/accessibility rules.
- Do not recreate a large application-specific stylesheet.
- Keep repeated component patterns in React components rather than duplicating utility strings across pages.

## Data and navigation invariants

- Product catalog endpoint remains `https://mvwflakurihhakdrlteg.supabase.co/functions/v1/get-divoom-products`.
- Product cards navigate to `/products/{item_group_id}`.
- Product detail groups variants by `item_group_id`.
- Product loading, error, retry, and empty states remain explicit.
- No demo product fallback is permitted.
- Other pages that were placeholders remain placeholders until separately approved.

## Verification requirements

- [ ] `npm install` resolves dependencies and peer requirements.
- [ ] `npm run build` succeeds.
- [ ] Storefront UI Button renders and responds.
- [ ] Responsive layout is checked at 320, 390, 767, 768, 1023, 1024, and 1440px.
- [ ] Product endpoint and JSON contract remain unchanged.
- [ ] Product route, direct access, refresh, and browser history work.
- [ ] No horizontal overflow or inaccessible interactive controls.
- [ ] GitHub Pages publishes the `dist/` output after separate deployment approval.

## Change control

This branch implements the frontend migration only. Database, Edge Function, secrets, GitHub Pages settings, production deployment, and merge remain outside this approval.
