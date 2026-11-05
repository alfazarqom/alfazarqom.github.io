# Header & Navigation V1

**Status:** Approved and implemented on `feat/responsive-layout-v1`  
**Repository:** `alfazarqom/alfazarqom.github.io`

## Component structure

```text
Header
├── BrandLockup
├── MainNavigation
│   ├── Home
│   └── Products
├── HeaderSearch
└── HeaderActions
    ├── Search
    ├── Wishlist
    └── Cart
```

## Responsive specification

| Property | Mobile | Tablet | Desktop |
|---|---:|---:|---:|
| Viewport | 320–767px | 768–1023px | ≥1024px |
| Header height | 64px | 72px | 76px |
| Brand | Left | Left | Left |
| MainNavigation | Hidden | Left-aligned | Left-aligned |
| HeaderSearch | Hidden | Compact inline | Inline |
| HeaderActions | Search, Wishlist, Cart | Wishlist, Cart | Wishlist, Cart |
| BottomNavigation | Visible | Hidden | Hidden |

## Behavior
- BrandLockup navigates to Home.
- MainNavigation navigates to Home and Products; active destination is marked with the existing emerald accent.
- Mobile Search icon opens the existing Search route.
- Tablet/Desktop HeaderSearch submits the current query and opens Products with the query retained.
- Wishlist and Cart retain their existing routes.
- Header content uses the shared 1440px page width and approved page gutters.

## Accessibility
- Icon-only actions retain accessible names.
- Interactive controls have visible focus indicators and minimum 44px target height where applicable.
- Search uses a semantic form and labelled search input.

## Scope boundaries
No changes to backend, product response contract, other page content, deployment settings, or product route semantics.
