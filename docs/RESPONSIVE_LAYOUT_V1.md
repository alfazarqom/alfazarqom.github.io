# Responsive Layout V1

**Status:** Approved and implemented on `feat/responsive-layout-v1`  
**Repository:** `alfazarqom/alfazarqom.github.io`

## 1. Breakpoints

| Viewport | Width | Header | Gutter | Product grid | Hero |
|---|---:|---:|---:|---:|---:|
| Mobile | 320–767px | 64px | 20px | 2 columns | 1 column |
| Tablet | 768–1023px | 72px | 32px | 3 columns | 2 columns |
| Desktop | ≥1024px | 76px | clamp(32px, 6vw, 84px) | 4 columns | 2 columns |

Content max width: 1440px. At widths ≤380px, page gutter reduces to 16px.

## 2. HomePage

- Mobile: hero content precedes hero visual; IntroStrip stacks vertically; featured products use two columns.
- Tablet: two-column hero; horizontal IntroStrip; three-column featured products.
- Desktop: two-column editorial hero; horizontal IntroStrip; four-column featured products.
- Explore and View All continue to navigate to Products.
- Loading, error, and empty states remain explicit.

## 3. ProductsPage

- Mobile: catalog heading stacks; search spans full width; two-column product grid.
- Tablet: catalog toolbar is horizontal; three-column product grid.
- Desktop: catalog toolbar is horizontal; four-column product grid.
- Search remains controlled by the existing query state and filters the same fetched catalog.
- Product count continues to compare filtered results with the API total when available.

## 4. Shared product presentation
- Home and Products use the same ProductGrid and ProductCard.
- Product images preserve the 4:4.7 aspect ratio.
- Product cards navigate to `/products/{item_group_id}`.
- `item_group_id` remains the product group identifier; no route or API changes.

## 5. Data and architecture constraints
- Catalog remains sourced from the existing Supabase Edge Function `get-divoom-products`.
- No demo fallback data is introduced.
- Existing loading, error, retry, and empty states are preserved.
- React CDN, ReactDOM CDN, Babel Standalone, native CSS, and GitHub Pages remain unchanged.
- Footer remains nested inside each page.
- Responsive redesign is limited to Header, HomePage, ProductsPage, shared product presentation, and related documentation. Other page content is not redesigned.

## 6. Verification targets
Test viewport widths: 320, 390, 767, 768, 1023, 1024, and 1440px.
Check horizontal overflow, navigation visibility, search behavior, product card navigation, image sizing, keyboard focus, and loading/error/empty states.
