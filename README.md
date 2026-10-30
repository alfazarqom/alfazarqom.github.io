# Asri Collection — GitHub Pages

A lightweight, mobile-responsive storefront built with React, TypeScript, and Supabase. The app runs directly in the browser on GitHub Pages; it does not require Vite, Node.js, a package installation, or a build step.

## Repository structure

```text
.
├── index.html       # Browser entry point, import map, Babel runtime
├── App.tsx          # React UI, page state, Supabase client and product query
├── style.css        # Responsive storefront styles
└── README.md        # Project documentation
```

## Technology

- React 18.3.1 and React DOM, loaded as browser ES modules.
- TypeScript + JSX, transformed in the browser by Babel Standalone.
- Supabase JavaScript client, loaded from esm.sh.
- Supabase Database REST API for public product reads.
- Plain CSS; no bundler or build pipeline.

Dependency versions are pinned in `index.html`. The browser needs an internet connection to load the CDN-hosted dependencies and remote product images.

## Supabase connection

The browser client is initialized in `App.tsx` with:

- Project URL: `https://mvwflakurihhakdrlteg.supabase.co`
- Public API key: the project's legacy `anon` key
- Source table: `public.products`

The app reads the table with a read-only query:

```ts
supabase
  .from("products")
  .select("*")
  .order("created_at", { ascending: false });
```

The query reads the product columns exposed by the table, including title, brand, price, sale price, currency, description, SKU, category, availability, stock, colors, sizes, image URLs, labels, and timestamps.

### API key safety

The `anon` key is intentionally public and is visible in browser source. It is not a password. Never put a Supabase `service_role` key, secret API key, database password, or other privileged credential in this repository or any frontend bundle.

Public access is controlled by Postgres grants and Row Level Security (RLS). The current `public.products` table has RLS enabled, an anon SELECT grant, and a SELECT policy named `Public can read all products` for `anon` and `authenticated`. This permits public read access to product rows; do not add write permissions unless a separately reviewed requirement calls for them.

The Supabase project audit also detected `public.bonsoir_products_02` with RLS disabled. This app does not query that table. Review and secure it separately in Supabase; enabling RLS without the correct policies can block legitimate access, so no database changes are made by this repository.

## Pages and behavior

### Home

- Storefront hero and brand introduction.
- Featured products loaded from Supabase.
- Navigation to the product catalog.

### Products

- Product catalog loaded from `public.products`.
- Search by product title, brand, category, or SKU.
- Product cards show price, availability, stock, and image.
- Product detail dialog shows available product information.

The UI does not use hardcoded product records or a local product fallback. If Supabase cannot be reached or RLS denies the request, the app displays an error state and a retry action.

## Run locally

Because this is a no-build browser app, serve the repository root with any static HTTP server. For example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

Opening `index.html` directly with a `file://` URL is not recommended because browser module and import-map behavior may differ.

## GitHub Pages deployment

1. Open the repository's **Settings → Pages**.
2. Select **Deploy from a branch** if that is the intended Pages source.
3. Choose the production branch and the repository root folder.
4. Save and wait for the Pages deployment to finish.
5. Open the published URL and verify the browser console and product catalog.

This change is proposed on a feature branch. Merge the pull request before expecting the production branch's GitHub Pages site to receive these changes.

## Verification checklist

- [ ] Confirm the GitHub Pages source branch and deployment status.
- [ ] Open the published site over HTTPS.
- [ ] Confirm React and Babel load without browser console errors.
- [ ] Confirm the Supabase project URL and public key are configured.
- [ ] Confirm the Products page returns rows from `public.products`.
- [ ] Test product search, detail dialog, retry state, and mobile layout.
- [ ] Confirm no privileged Supabase key is present in the frontend.
