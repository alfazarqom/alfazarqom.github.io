# Asri Collection — Design System

**Version:** 1.0.0  
**Status:** Initial documentation baseline  
**Owner:** AI Design System Architect  
**Repository:** `alfazarqom/alfazarqom.github.io`

## 1. Purpose

This document defines the visual foundations, reusable UI rules, responsive behavior, accessibility expectations, and change-control process for the Asri Collection storefront.

The design system is the reference for future UI work. Existing implementation details are recorded as the current baseline; recommendations are not considered implemented until the relevant source files are changed and verified.

## 2. Project context

### Verified repository structure

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

### Verified frontend stack

- HTML5 document shell in `index.html`.
- React 18.3.1 and ReactDOM 18.3.1 UMD production runtimes loaded from CDN.
- Babel Standalone 7.26.10 compiles JSX in the browser.
- React application and UI components in `App.jsx`.
- Native CSS in `style.css`.
- GitHub Pages static hosting.
- Supabase Edge Function for public product catalog reads.

This is a React CDN application with no Node.js, npm, Vite, bundler, or build step. `index.html` provides the root mount point and browser runtime; `App.jsx` owns application rendering and behavior.

## 3. Design principles

1. **Consistency:** use shared tokens and repeatable visual rules.
2. **Clarity:** prioritize readable content and clear actions.
3. **Mobile-first:** make small-screen layouts usable before expanding them.
4. **Restraint:** use decoration intentionally; preserve visual hierarchy.
5. **Reusability:** prefer shared patterns over one-off styling.
6. **Accessibility:** support keyboard use, visible focus, semantic markup, and sufficient contrast.
7. **Traceability:** distinguish current implementation from proposed changes.

## 4. Foundations

### 4.1 Color palette

The values below are extracted from the current `style.css`. They document the existing implementation and are not a new visual redesign.

| Token | Current value | Usage |
|---|---|---|
| `color.ink` | `#171a17` | Primary text |
| `color.muted` | `#777d75` | Secondary text |
| `color.line` | `#e8e9e3` | Borders and separators |
| `color.green` | `#176b45` | Primary accent and active states |
| `color.green-dark` | `#104c34` | Dark green actions |
| `color.paper` | `#fbfbf8` | Main page background |

Additional colors currently used in component styles include:

| Value | Current usage |
|---|---|
| `#183e2d` | Hero background |
| `#f0f0eb` | Product image surface |
| `#fff` | Search field background |
| `#a34f34` | Error state |

**Rule:** new styles should reuse an existing palette token where possible. Add a new color only when a documented UI need cannot be met by the current palette.

### 4.2 Typography

| Role | Current font |
|---|---|
| Primary sans-serif | DM Sans |
| Display / heading | Manrope |
| Editorial serif accent | Georgia, Times New Roman |

Typography rules:

- Use DM Sans for general interface text.
- Use Manrope for prominent headings and selected component headings.
- Use the serif stack only for editorial emphasis and brand character.
- Preserve readable line-height and avoid excessive letter spacing on small screens.
- Do not introduce additional font families without documenting the reason.

### 4.3 Spacing

The current stylesheet uses a mixture of fixed values and responsive `clamp()` expressions. The following are observed examples, not yet a normalized spacing scale:

| Context | Current value |
|---|---|
| Desktop page side padding | `clamp(20px, 6vw, 84px)` |
| Mobile page side padding | `18px` |
| Product grid gap | `22px` desktop; `14px` mobile column gap |
| Main section top padding | `64px` |
| Mobile section top padding | `46px` |

Future work should consolidate repeated spacing values into documented CSS custom properties before broad refactoring.

### 4.4 Shape, borders, and elevation

- The current interface favors square or minimally rounded surfaces.
- The header, cards, search field, and content sections use subtle borders.
- Circular shapes are reserved for selected brand and icon treatments.
- Shadows are used sparingly, including the product detail surface.
- Avoid adding large radii or heavy shadows without a clear component-level reason.

## 5. Layout system

### 5.1 Global layout

- `#root` fills the viewport and uses a vertical flex layout.
- `.app-shell` is a full-height vertical application shell.
- `.site-header` and `.site-footer` remain outside the scrolling content region.
- `.main-content` owns vertical scrolling.
- `.main-content-inner` is centered and capped at `1440px`.

### 5.2 Responsive breakpoint — Responsive Layout V1

The approved responsive scope is Header, HomePage, and ProductsPage.

| Viewport | Width | Header height | Page gutter | Product grid | Hero |
|---|---:|---:|---:|---:|---:|
| Mobile | 320–767px | 64px | 20px (16px at ≤380px) | 2 columns | 1 column |
| Tablet | 768–1023px | 72px | 32px | 3 columns | 2 columns |
| Desktop | ≥1024px | 76px | clamp(32px, 6vw, 84px) | 4 columns | 2 columns |

BottomNavigation is visible only on Mobile. Header navigation and inline search are used on Tablet and Desktop. Other page content is not redesigned by this release.

### 5.3 Product grid

- Mobile: two columns.
- Tablet: three columns.
- Desktop: four columns.
- Product media uses an aspect ratio of `4 / 4.7`.
- Product cards use consistent metadata spacing and a two-line title clamp.
- HomePage and ProductsPage use the same ProductGrid and ProductCard components.

## 6. Component standards

The following component patterns are present in the current storefront. Their selectors are implementation references, not framework components.

| Component / pattern | Current selectors |
|---|---|
| Application shell | `.app-shell`, `.main-content` |
| Header | `.site-header`, `.brand-lockup`, `.main-navigation` |
| Navigation item | `.nav-button` |
| Header action | `.header-cta` |
| Hero | `.hero-section`, `.hero-content`, `.hero-art` |
| Section heading | `.section-heading`, `.eyebrow` |
| Button | `.button`, `.button-light`, `.button-dark` |
| Product grid | `.product-grid`, `.product-card` |
| Product metadata | `.product-meta`, `.product-title`, `.product-price` |
| Search | `.search-field` |
| Feedback states | `.loading-state`, `.empty-state`, `.error-state` |
| Product detail | `.product-dialog`, `.detail-panel`, `.detail-copy` |
| Footer | `.site-footer` |

### Component requirements

Every new or substantially revised component should document:

1. Purpose and usage.
2. Required content and semantic HTML element.
3. Relevant design tokens.
4. Default, hover, active, focus, disabled, loading, and error states where applicable.
5. Mobile behavior.
6. Keyboard and accessibility behavior.

## 7. Interaction and accessibility

- All interactive controls must be keyboard reachable.
- Preserve a clearly visible `:focus-visible` treatment.
- Use semantic buttons for actions and links for navigation.
- Provide accessible names for controls without visible labels.
- Keep status and loading feedback available to assistive technology where appropriate.
- Do not communicate availability, errors, or selection using color alone.
- Respect reduced-motion preferences when adding non-essential animation.
- Verify text and control contrast before introducing new color combinations.

The current stylesheet defines visible focus outlines for several navigation and action controls. New interactive elements must follow the same principle.

## 8. CSS token direction

The current stylesheet defines these root custom properties:

```css
:root {
  --ink: #171a17;
  --muted: #777d75;
  --line: #e8e9e3;
  --green: #176b45;
  --green-dark: #104c34;
  --paper: #fbfbf8;
  --serif: Georgia, "Times New Roman", serif;
}
```

These are the existing source values. A future token refactor may introduce a more systematic naming scheme, but should preserve visual output unless a redesign is explicitly approved.

## 9. AI Design System Architect role

The AI Design System Architect is responsible for:

- Auditing the current UI and stylesheet before proposing changes.
- Maintaining this document as the design-system reference.
- Defining and documenting tokens, components, patterns, and responsive rules.
- Identifying inconsistencies and duplicate style definitions.
- Providing implementation-ready specifications to frontend engineering.
- Checking that implementation matches approved specifications.
- Avoiding unrelated application, data, or backend changes.

### Operating rules

1. Audit before recommending.
2. Separate verified facts, indications, and unverified assumptions.
3. Do not claim a proposed token or component exists until verified in source.
4. Do not change the established visual baseline without approval.
5. Prefer minimal, reusable changes.
6. Update this document when an approved design-system decision changes.
7. Verify the affected UI after implementation.

## 10. Change-control workflow

```text
AUDIT
  ↓
RECOMMENDATION
  ↓
REQUIREMENT
  ↓
APPROVAL
  ↓
IMPLEMENTATION
  ↓
VERIFICATION
```

Documentation changes do not automatically authorize CSS, HTML, JavaScript, database, or deployment changes. Each implementation scope must be explicit.

## 11. Verification checklist

- [ ] Design tokens match the source stylesheet.
- [ ] No undocumented color or typography values are introduced.
- [ ] Layout remains usable at the existing mobile breakpoint.
- [ ] Product cards retain consistent image and text treatment.
- [ ] Interactive elements have visible keyboard focus.
- [ ] Loading, empty, and error states remain distinguishable.
- [ ] Changes do not alter product data or backend behavior.
- [ ] The rendered UI is checked after implementation.

## 12. Source of truth

- HTML document and CDN runtime: `index.html`
- React application structure and browser behavior: `App.jsx`
- Current visual implementation: `style.css`
- Structured application architecture: `structure.json`
- Structured design tokens and design specification: `blueprint-design-system.json`
- Human-readable design-system documentation: `docs/DESIGN_SYSTEM.md`

`index.html` mounts the React application into `#root`; the rendered storefront components and application behavior are implemented in `App.jsx`. When documentation and implementation differ, report the discrepancy. Do not silently treat either one as updated.


## 13. Responsive Layout V1 — approved implementation

### Header & Navigation
- Mobile: 64px header; BrandLockup left; Search, Wishlist, Cart actions right; no header MainNavigation or inline search; BottomNavigation visible.
- Tablet: 72px header; BrandLockup and left-aligned MainNavigation; compact inline search; Wishlist and Cart right.
- Desktop: 76px header; BrandLockup and left-aligned MainNavigation; inline search; Wishlist and Cart right.
- Header inline search submits the query and opens ProductsPage.
- Active Home/Products navigation uses the existing emerald accent.

### HomePage
- Mobile: single-column hero with content before visual; vertical IntroStrip; two-column featured grid.
- Tablet: two-column hero; horizontal IntroStrip; three-column featured grid.
- Desktop: two-column editorial hero; horizontal IntroStrip; four-column featured grid.

### ProductsPage
- Mobile: stacked catalog heading and full-width search; two-column grid.
- Tablet: horizontal catalog toolbar; three-column grid.
- Desktop: horizontal catalog toolbar; four-column grid.

### Shared implementation constraints
- Keep ProductCard shared by HomePage and ProductsPage.
- Keep product navigation at `/products/{item_group_id}`.
- Keep the existing Supabase Edge Function as the catalog source; no demo fallback.
- Keep the existing React CDN, ReactDOM CDN, Babel Standalone, and GitHub Pages architecture.
- Footer remains inside each page.
- Tablet/Desktop redesign is limited to Header, HomePage, and ProductsPage; other page content is not redesigned.
