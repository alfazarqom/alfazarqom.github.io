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
├── style.css
├── script.js
└── README.md
```

### Verified frontend stack

- Native HTML5
- Plain CSS
- Browser-native JavaScript ES modules
- GitHub Pages static hosting
- Supabase Edge Function for public product catalog reads

This repository currently uses a static frontend. React, TypeScript, Vite, and a component build pipeline are not part of the verified implementation baseline.

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

### 5.2 Responsive breakpoint

The current stylesheet contains a verified breakpoint at:

| Breakpoint | Behavior |
|---|---|
| `max-width: 760px` | Mobile layout adjustments |

At this breakpoint, the header, hero, content padding, product grid, and catalog toolbar change layout.

Do not assume additional tablet or desktop breakpoint values unless they are found in the source stylesheet.

### 5.3 Product grid

- Desktop baseline: four columns.
- Mobile breakpoint baseline: two columns.
- Product media uses an aspect ratio of `4 / 4.7`.
- Product cards use consistent metadata spacing and a two-line title clamp.

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

The current stylesheet already defines visible focus outlines for several navigation and action controls. New interactive elements must follow the same principle.

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

- Current visual implementation: `style.css`
- Current page structure: `index.html`
- Current browser behavior: `script.js`
- Design-system documentation: `docs/DESIGN_SYSTEM.md`

When documentation and implementation differ, report the discrepancy. Do not silently treat either one as updated.
