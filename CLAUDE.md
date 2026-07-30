# time

A minimal full-screen clock web app (React + Vite), installable as an offline-capable PWA. Deployed to AWS S3 via Terraform.

## Entry points

- `site/src/App.jsx` — root component, renders `ClockTracker`.
- `site/src/components/ClockTracker.jsx` — the clock itself.
- `site/src/sw.js` (public) — service worker for offline support.
- `terraform/` — S3 bucket + policy for static hosting.

## How to run

```
make run
```

Installs npm deps and starts the Vite dev server in `site/`.

## Other Makefile targets

- `make test` — run vitest unit tests.
- `make screenshots` — capture Playwright screenshots (needs browser deps).
- `make deploy` — build the site and `terraform apply` (requires AWS credentials).

## Conventions / gotchas

- All app code lives under `site/`; Terraform lives under `terraform/`.
- `deploy` applies real infrastructure changes — don't run it without configured AWS credentials and a reviewed terraform plan.
- Outstanding work is tracked in `TODO.md` and `CHANGELOG.md`, not GitHub issues.
