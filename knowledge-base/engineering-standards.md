# Engineering standards

## Clean code

- Use explicit, named types at API and component boundaries. Narrow unknown data before using it and preserve exact identifiers and money values.
- Give files and functions names that describe their purpose. Keep render logic focused on presentation, network calls in feature API modules, and shared formatting and error handling in their established locations.
- Validate forms for fast feedback. Use server responses for business validation and show the resulting field or form error. Reuse the nearest existing helper or component before adding a new abstraction.
- Render descriptions and other operator-entered text as text. Keep sensitive customer data out of screenshots, fixtures, console output, and analytics.
- For changes such as archive or a future refund, show the affected record and consequence before submission. Disable duplicate submissions while pending, handle conflicts, and update affected views from the server after success.

## Checks before merging

Run `npm run lint` and `npm run build` from the admin project. Oxlint and the build check code and types. Use these scans during review to find possible violations in styles and application code:

```sh
rg -n -g '*.{css,ts,tsx}' '#[[:xdigit:]]{3,8}\b|\b(rgba?|hsla?|oklch|oklab|lch|lab|color)\(|\b(bg|text|border|ring|outline|fill|stroke|shadow|accent|decoration|from|via|to)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)\b' src
rg -n -g '*.{ts,tsx}' 'https?://|localhost|127\.0\.0\.1|/api/v[0-9]+|\b(fetch|fetchBaseQuery)\(' src
```

Review matches in context. Theme definitions may contain color literals, and approved external links and image URLs may contain hosts. API origins belong in environment configuration, the version prefix belongs in the shared client, and API resource paths belong in feature API definitions. Also inspect inline styles and arbitrary Tailwind values for color names or palette values that the scan may miss.

For a feature, check the normal path and its relevant failures in the browser. Cover keyboard use and a narrow viewport for UI changes. For protected screens, verify direct access without a session, MFA sign-in, session expiry, and cache clearing on sign-out. For data changes, verify validation, denied access, and duplicate submission behavior where applicable. Use a local or disposable backend and synthetic records. Add regression tests where a failure in access, data handling, or a critical workflow needs repeatable coverage.
