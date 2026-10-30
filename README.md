# Asri Collection — Static HTML

A mobile-responsive storefront built with native HTML, CSS, and JavaScript. It is hosted directly by GitHub Pages and does not use React, TypeScript, Babel, Vite, Node.js, or a build step.

## Repository structure

```text
.
├── index.html   # Static page markup and semantic layout
├── style.css    # Responsive storefront styles
├── script.js    # Browser interactions and Supabase product query
└── README.md    # Project documentation
```

## Technology

- Native HTML5 for page structure.
- Plain CSS for layout and responsive styling.
- Browser-native JavaScript ES modules for interactions.
- Supabase JavaScript client loaded from esm.sh.
- Supabase Database REST API for public product reads.

There is no compilation or bundling step. The browser needs an internet connection to load the Supabase client, Google Fonts, and remote product images.

## Supabase connection

The browser client is initialized in `script.js` with the project's URL and public anon key. The storefront reads `public.products`:

```js
supabase
  .from("products")
  .select("*")
  .order("created_at", { ascending: false });
```

The public anon key is intended for browser use. Never expose a Supabase service-role key, secret API key, database password, or other privileged credential in this repository. Public access must be constrained by Postgres grants and Row Level Security (RLS).

## Pages and behavior

- **Home:** brand introduction and four featured products.
- **Products:** product catalog with search by title, brand, category, or SKU.
- **Product details:** dialog with available product information.
- **Responsive layout:** desktop and mobile breakpoints in `style.css`.

Product records are loaded from Supabase; there is no hardcoded product fallback. If the request fails, the page displays an error state and retry action.

## Local preview

Serve the repository root with any static HTTP server:

```bash
python -m http.server 8000
```

Open `http://localhost:8000`. Opening the file directly with a `file://` URL is not recommended because browser ES modules may be restricted.

## GitHub Pages

Configure **Settings → Pages** to publish the repository root from the production branch. No GitHub Actions workflow or build command is required when using the branch-based Pages source.

## Verification checklist

- [ ] GitHub Pages serves `index.html` from the repository root.
- [ ] Browser console has no JavaScript or module-loading errors.
- [ ] Supabase query returns rows from `public.products`.
- [ ] Product search and detail dialog work.
- [ ] Error and retry states work when the API is unavailable.
- [ ] Mobile layout is usable.
- [ ] No privileged Supabase credential is present in frontend files.
