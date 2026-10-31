# Asri Collection — Static HTML

A mobile-responsive storefront built with native HTML, CSS, and JavaScript. It is hosted directly by GitHub Pages and does not use React, TypeScript, Babel, Vite, Node.js, or a build step.

## Repository structure

```text
.
├── index.html   # Static page markup and semantic layout
├── style.css    # Responsive storefront styles
├── script.js    # Browser interactions and get-products Edge Function request
└── README.md    # Project documentation
```

## Technology

- Native HTML5 for page structure.
- Plain CSS for layout and responsive styling.
- Browser-native JavaScript ES modules for interactions.
- Supabase Edge Function for public product catalog reads.

There is no compilation or bundling step. The browser needs an internet connection to request the product catalog and load remote product images and fonts.

## Product data source

The storefront requests the Supabase Edge Function:

```text
GET https://mvwflakurihhakdrlteg.supabase.co/functions/v1/get-products
```

The frontend expects a JSON response with this shape:

```json
{
  "success": true,
  "data": [],
  "total": 147
}
```

The `data` array contains product records from `public.products`. The storefront does not query the table directly, initialize the Supabase JavaScript client, or include a Supabase anon key in browser code. No customer login is required for this public catalog request; the Edge Function's deployed access configuration controls endpoint access.

The storefront validates the HTTP response and the `success` and `data` fields before rendering. It does not substitute hardcoded/demo products if the request fails.

## Product fields used by the storefront

- `id`: identifies a product for the detail dialog.
- `title`, `brand`, `category`, `sku`: product identity and search.
- `price`, `sale_price`, `currency`: displayed price.
- `availability`, `stock_quantity`: availability and stock display.
- `image_url`, `labels`, `description`: product presentation.

Additional fields returned by the function may be available in the response but are not currently rendered by this storefront.

## Pages and behavior

- **Home:** brand introduction and four featured products.
- **Products:** product catalog with search by title, brand, category, or SKU.
- **Product details:** dialog with available product information and a direct checkout link.\n- **Checkout / payment:** `mayar.html` loads the same product catalog, collects customer and shipping details, and calls the `mayar-create-invoice` Supabase Edge Function. The server validates product IDs, stock, price, shipping, and creates the Mayar invoice. The browser redirects to the returned HTTPS payment URL. An idempotency key is reused for identical checkout retries in the current tab.
- **Responsive layout:** desktop and mobile breakpoints in `style.css`.
- **Loading and errors:** loading state, error message, and retry action.

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
- [ ] Browser console has no JavaScript errors.
- [ ] Browser request to `get-products` returns HTTP success and valid JSON.
- [ ] Product search and detail dialog work.\n- [ ] Mayar checkout loads products and creates an invoice through the Supabase Edge Function in sandbox.
- [ ] Error and retry states work when the API is unavailable.
- [ ] Mobile layout is usable.
- [ ] No Supabase privileged credential or anon key is embedded in frontend files.
