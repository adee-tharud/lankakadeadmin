# Backend integration

The admin panel and storefront share a Node.js API backed by the `lankakade` MySQL database. The admin browser talks to the API. The backend owns permissions, prices, stock, payments, and state changes. The [backend knowledge base](../../../backend/knowledge-base/README.md) covers database setup and operations.

## Database map

| Area | What the admin UI needs to know |
| --- | --- |
| Identity | `users` holds customer and admin accounts. Sessions and admin MFA records are private. The current database supports one admin. |
| Catalog | A category groups products. A product has one or more sellable variants when offered, including one default variant for products without options. Each variant has its own SKU, price, and stock. Archive keeps IDs and history. |
| Inventory | Stock belongs to the variant. Available stock is on-hand stock minus reserved units. The backend records movements and evaluates low-stock alerts. The `v_low_stock` view supports reporting. |
| Orders and delivery | An order keeps snapshots of its items, prices, and delivery address. Show those values for order history, even after a catalog or profile edit. Order and fulfillment status have separate lifecycles. |
| Payments and refunds | A payment attempt belongs to an order and a refund belongs to a payment attempt. Sales reporting uses accepted captures and successful refunds from `v_sales_activity`. |
| Audit | `admin_audit_log` records privileged changes. The API writes audit events and controls any future access to them. |

Use the [database design](../../../backend/knowledge-base/database-design.md), [schema](../../../backend/database/schema.sql), and [migrations](../../../backend/database/migrations/) for exact fields and constraints. UI types follow API responses, which may expose a smaller set of fields.

## API coverage

| Area | Current contract |
| --- | --- |
| Sign-in, session, and recovery | [Auth and accounts](../../../backend/knowledge-base/auth-and-accounts.md#api-contract) documents MFA, session cookies, profile reads, sign-out, and password reset. |
| Users | The admin API provides a cursor-paginated read-only list. Account creation and role changes have no admin UI contract. |
| Categories, products, and variants | The [admin catalog API](../../../backend/knowledge-base/product-catalog.md#admin-api) supports reads, creation, editing, and archive. Variant creation accepts opening stock. |
| Live catalog | The [public catalog API](../../../backend/knowledge-base/product-catalog.md#storefront-api) reflects storefront visibility, prices, and availability. |
| Orders, dashboard metrics, stock adjustments, and sales | [System flows](../../../backend/knowledge-base/system-flows.md#admin-journey) describe the intended behavior. These admin APIs are not registered in the [backend app](../../../backend/src/app.js). Confirm a contract for each feature before wiring it up. |

Keep fixture data synthetic and label any preview that uses it. Treat a missing or failed dashboard request as unavailable data. A zero count must come from a successful response.

## API configuration and sessions

- Use a single public setting, `VITE_API_ORIGIN`, when wiring the client. Read and validate it in the configuration module. Put the version prefix in the shared API client and keep relative resource paths in the owning feature's API module. Keep environment-specific hosts and ports out of feature code.
- Run the admin frontend at the exact backend `ADMIN_ORIGIN`, including scheme, host, and port. The [backend environment example](../../../backend/.env.example) shows the local defaults. Send browser requests with `credentials: 'include'`. Let the browser send `Origin`; the backend checks it for admin requests, including reads.
- Bootstrap protected routes from the session-backed account endpoint and require the admin role before rendering protected data. The API enforces the current role and MFA on admin operations. When sign-in returns `MFA_REQUIRED`, prompt for an authenticator or recovery code.
- Keep passwords and MFA codes in form memory for the active flow. Let the browser manage the HTTP-only session cookie. Keep credentials, reset tokens, and customer records out of persistent browser storage and logs. For reset links, remove the token fragment from browser history after reading it.
- On a protected request's session-expired response, clear the session and private query cache and return to sign-in. Show an access error for denied requests. For sign-out, call the server logout endpoint and clear the session and private cache after success. Surface a failed sign-out and allow retry.
- Use the backend's stable `error` code for behavior and its safe `message` for display. Associate validation errors with the response's `field` when available. Handle empty `204` responses and network errors in the shared request layer.
- Treat every `VITE_` setting as public. Keep database credentials and payment, email, and authentication secrets on the backend.

## Commerce rules

- Preserve API IDs and cursors as strings. Use returned pagination cursors with the same filters, and reset paging when filters change.
- Preserve monetary values as decimal strings through request and form boundaries. Use a shared formatter for RON display and show backend totals. Use `Europe/Bucharest` for reporting periods as documented in the [database design](../../../backend/knowledge-base/database-design.md#integrity-and-query-conventions). Let the API resolve reporting boundaries to UTC.
- Show order, payment, and fulfillment status separately. Use the backend's allowed transitions and wait for server confirmation before showing success for financial, inventory, and fulfillment changes.
- The current design uses hosted online payment and delivery. The screenshot supplies visual direction. Pickup, payment at pickup, and its example statuses need a separate product and backend decision.
