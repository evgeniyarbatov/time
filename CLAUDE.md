# time

A minimal full-screen clock web app (React + Vite), installable as an offline-capable PWA. Hosted on GitHub Pages at https://evgeniyarbatov.github.io/time/.

## Entry points

- `site/src/App.jsx` — root component, renders `ClockTracker`.
- `site/src/components/ClockTracker.jsx` — the clock itself.
- `site/src/sw.js` (public) — service worker for offline support.
- `.github/workflows/deploy.yml` — tests, builds and deploys to Pages on every push to `main`.

## How to run

```
make run
```

Installs npm deps and starts the Vite dev server in `site/`.

## Other Makefile targets

- `make test` — run vitest unit tests.
- `make screenshots` — capture Playwright screenshots (needs browser deps).
- `make build` — production build into `site/dist`.

## Conventions / gotchas

- All app code lives under `site/`.
- The site is served under `/time/` (Vite `base`); keep asset, manifest and service-worker paths relative to it, never root-absolute.
- Pushing to `main` deploys to production.
- Outstanding work is tracked in `TODO.md` and `CHANGELOG.md`, not GitHub issues.
