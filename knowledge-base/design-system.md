# Design system

Use the supplied dashboard screenshot as visual direction. The target is a deep green sidebar with a clear active item, a white or warm off-white work area, a pale green page header, white summary cards, and compact operational tables. Use quiet borders and consistent spacing so the most important action or status is easy to spot.

## Theme rules

- Define semantic Tailwind color tokens with `@theme` in [src/index.css](../src/index.css). Start with roles such as `--color-sidebar`, `--color-on-sidebar`, `--color-surface`, `--color-surface-accent`, `--color-ink`, `--color-muted`, `--color-border`, and `--color-focus`. Define additional action and status roles as their components need them.
- Use token classes such as `bg-sidebar`, `bg-surface`, and `text-ink`. Keep literal color values in the theme definitions. Use semantic tokens for icons, status badges, and hover, focus, and disabled states. Prefer `currentColor` for inline icons. Original artwork can keep its source colors.
- Use green for the main brand and primary action. Reserve warning and error colors for their meanings. Pair every status color with a readable label. Choose type, spacing, radii, and elevation as shared design decisions.
- Reuse UI primitives for buttons, fields, dialogs, tables, and badges. Give each screen one clear title and keep common actions in predictable positions.

## Responsive and accessible behavior

- Keep a persistent sidebar when space allows and use a labeled navigation drawer on narrow screens. Ensure keyboard users can open and close it and return focus to the trigger.
- Let dashboard cards wrap. Keep dense tables in a labeled scroll region on small screens so the page itself fits the viewport. Use semantic headers and keep filters and paging controls accessible.
- Use labeled fields, meaningful button names, visible focus indicators, and adequate text and control contrast. Make navigation, forms, and dialogs usable by keyboard. Restore focus when a dialog closes.
- Define loading, empty, error, and success states for each data screen. Keep form input on recoverable failures. Show errors near the affected fields and give the user a clear retry where it is safe.
