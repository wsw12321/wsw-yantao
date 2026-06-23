# Repository Guidelines

## Project Structure & Module Organization

This is an Astro 5 site targeting Cloudflare Workers. Keep pages in `src/pages`; API endpoints live under `src/pages/api` and should export Astro route handlers. Reusable UI belongs in `src/components`, layouts in `src/layouts`, and shared server utilities in `src/lib`. Static assets served as-is go in `public`; imported assets belong in `src/assets`. Database schema is in `schema.sql`, and Cloudflare/D1 bindings are configured in `wrangler.toml`.

## Build, Test, and Development Commands

Use pnpm as the primary package manager; the Docker setup also assumes pnpm.

- `pnpm install --frozen-lockfile`: install dependencies from `pnpm-lock.yaml`.
- `pnpm dev --host 0.0.0.0`: run Astro locally on port 4321.
- `pnpm build`: produce the production build and run Astro checks.
- `pnpm preview --host 0.0.0.0`: serve the built site locally.
- `docker compose up -d --build`: build and start the containerized dev server.
- `docker compose run --rm app pnpm wrangler d1 execute wsw-yantao-db --local --file=schema.sql`: initialize the local D1 schema.

## Coding Style & Naming Conventions

TypeScript runs with Astro strict settings. Prefer ESM imports, single quotes, semicolons, and two-space indentation in `.ts`, `.astro`, and config files. Name Astro components and layouts in PascalCase, route files by URL path, and utility modules with lower-case descriptive names such as `session.ts`. Keep secrets out of source; use Cloudflare/Wrangler environment configuration.

## Testing Guidelines

No dedicated test runner is configured yet. Before submitting changes, run `pnpm build` and manually verify affected pages or API routes. For auth or database changes, reset the local D1 schema and test register, login, and logout flows. If adding automated tests, add the package script and document the runner; use `*.test.ts` for unit tests.

## Commit & Pull Request Guidelines

Recent commits use short, imperative summaries, sometimes with conventional prefixes like `feat:`. Keep commits focused and explain user-visible behavior. Pull requests should include a concise description, linked issue when applicable, test or build results, and screenshots for UI changes. Mention database or Wrangler configuration changes explicitly.
