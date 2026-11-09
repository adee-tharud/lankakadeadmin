# React + TypeScript + Vite

The [LankaKade admin knowledge base](./knowledge-base/README.md) describes the project's backend integration, design system, file structure, and engineering standards.

## Run the admin panel locally

1. Set up the [backend and an MFA-enrolled admin account](../../backend/knowledge-base/auth-and-accounts.md).
2. Copy `.env.example` to `.env.local` and set `VITE_API_ORIGIN` to the backend origin.
3. Start the backend and run `npm run dev` here. Open [the local admin workspace](http://localhost:5174). Use the exact origin configured in the backend's `ADMIN_ORIGIN`.

Sign in with the provisioned admin account and an authenticator or recovery code.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
