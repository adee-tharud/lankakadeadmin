# LankaKade admin panel knowledge base

This guide records how to build the staff workspace for the Romanian LankaKade storefront. The baseline is React and TypeScript with Vite, Tailwind CSS, and Redux Toolkit. The admin interface uses a green and white theme.

| Guide | What it covers |
| --- | --- |
| [Backend integration](./backend-integration.md) | MySQL relationships, current API coverage, configuration, admin access, and commerce data |
| [Frontend architecture](./frontend-architecture.md) | Proposed file structure, routing, and ownership of UI and server state |
| [Design system](./design-system.md) | Screenshot direction, theme tokens, responsive layout, accessibility, and screen states |
| [Engineering standards](./engineering-standards.md) | Clean code, hardcoded color and endpoint checks, and feature verification |

## Feature readiness

Start with the admin shell and MFA sign-in, then connect the catalog and read-only users list. A live catalog view can use the same public read contract as the storefront. Dashboard totals, order and fulfillment operations, stock adjustments, and reporting need confirmed admin API contracts before they can show live data or accept changes. See [backend integration](./backend-integration.md#api-coverage) for the current boundaries.

## Product images

The Add Product form must require at least one image selected from the admin's device. Show a preview, let the admin replace the selection, and keep the product draft if the upload fails so they can retry.

The form sends a single image and the product details together. The API checks admin access and saves the processed image with the product. See the [device image upload contract](../../../backend/knowledge-base/product-catalog.md#device-image-uploads) for limits and database setup.

## Decisions to confirm

| Decision | When it matters |
| --- | --- |
| Admin UI language and display locale | Before settling shared labels and formatters. The storefront targets Romania and uses RON. |
| Dashboard metrics and date ranges | Before implementing counts. Define each metric, the statuses it includes, and the reporting time zone. |
| Inbox and store settings | Before adding navigation for these modules. Define their purpose, permissions, and API coverage. |
| Production admin and API origins | Before deployment. Confirm cookie behavior and the backend origin configuration with the deployed hostnames. |

Record cross-feature decisions here or in the relevant guide. Note what was decided, why, and when. Update the matching guide when a change affects the theme, a shared convention, or API behavior.
