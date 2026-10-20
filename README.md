# PocketUI components

Copy-paste React Native components that don't crash. Docs, live previews and install steps: https://pocketui-xi.vercel.app

- `ui/` — the components you copy, plus `theme.ts` (every component reads its colors and spacing from it).
- `demos/` — a usage example for each component.
- `meta/` — each component's files and dependencies.

Components use plain `StyleSheet`, strict TypeScript, and only the dependencies listed in their `meta/<name>.json`.

```sh
bun install
bun run typecheck
```

MIT licensed.
