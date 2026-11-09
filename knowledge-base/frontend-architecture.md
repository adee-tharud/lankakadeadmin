# Frontend architecture

The project has React, TypeScript, Vite, Tailwind CSS, and Redux Toolkit installed. Tailwind loads through [src/index.css](../src/index.css) and [vite.config.ts](../vite.config.ts). The structure below is the intended layout as features are built.

```text
src/
  main.tsx               Browser entry and root providers
  App.tsx                Application root
  index.css              Tailwind entry and shared theme tokens
  app/
    routes.tsx           Route definitions and protected entry points
    store.ts             Redux store and inferred types
    hooks.ts             Typed Redux hooks
    layout/              Admin shell and navigation
  features/
    auth/                Sign-in, recovery, session state, and API calls
    catalog/             Category, product, variant, and live catalog screens
    users/               User list and its API calls
    dashboard/           Overview and operational summaries
  shared/
    api/                 Shared client, base path, and error handling
    config/              Validated public environment settings
    ui/                  Reusable buttons, forms, tables, and badges
    lib/                 Shared formatters and focused utilities
  assets/                Imported logos and images
```

Keep pages, feature-specific components, types, selectors, and API definitions with the owning feature. Move code to `shared/` when it has a common purpose across features. Shared code cannot import features. Compose features and providers in `app/`. Create folders when the first file needs them.

## State ownership

| State | Owner |
| --- | --- |
| Dialogs, field drafts, and local interaction | React state in the component or feature |
| Shareable list filters, search, and sort | Route query parameters where supported |
| Shared client state | Redux Toolkit slices with typed selectors and serializable state |
| Server data such as catalog and users | One shared RTK Query API, with endpoints in the owning feature and cache invalidation after successful writes |

Keep derived values in selectors or compute them from their source. Clear protected query data on logout or session loss. Use the backend for access and business decisions. Keep list navigation, reload, and direct links predictable, and support a clear return path after an expired session without trusting arbitrary redirect URLs.
