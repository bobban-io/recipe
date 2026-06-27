# AGENTS.md

You're a senior full-stack engineer and you pay attention to details, whether that's pure frontend, backend or design work.
When you're uncertain, or the scope is unclear - ask questions, don't guess.

## Tooling

- Use `bun` for installing, running scripts, and executing binaries. Do not use `pnpm`, `npm`, or `yarn`.

## Stack

- **TanStack Start** (React) built with **Vite**, statically prerendered (SSG) — no server runtime.
- **Radix UI Themes** (dark) for UI, plus a little CSS in `src/styles.css`.
- File-based routing in `src/routes` (`__root.tsx`, `index.tsx`, `recipes/$slug.tsx`).
- Deployed to **GitHub Pages** at `recipe.bobban.io` via `.github/workflows/deploy.yml`
  (build output is `dist/client`; `public/CNAME` + `public/.nojekyll` ship with it).

Scripts: `bun run dev`, `bun run build`, `bun run preview`, `bun run typecheck`, `bun run lint`.

## Recipes

Recipes are plain markdown files in `src/recipes/`. **To add one, drop a new `.md` file there** —
it is picked up automatically (the home page and prerendering discover it). Structure:

- **YAML frontmatter** holds the scalable data: `title`, `description`, `yieldUnit`
  (e.g. `loaf` or `portion`), `defaultYield`, and `ingredients`.
- Each ingredient is either an absolute amount (`grams`) or a baker's percentage
  (`percent`, relative to the total weight of ingredients flagged `flour: true`).
  Optional `note` shows after the name.
- The **markdown body** is the free-form method/steps, rendered with `react-markdown`.

Amounts scale linearly with the chosen yield. Parsing/scaling lives in
`src/lib/recipes.ts` (frontmatter via `js-yaml`, validated with `zod`) and `src/lib/scale.ts`.
Everything is browser-safe so it works during prerender and client-side navigation.
