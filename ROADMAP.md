# Roadmap

Minimal full-screen clock PWA (React + Vite), offline-capable, deployed to S3 via Terraform. Iterated heavily on visual polish (digit sizing/centering, dark mode, mobile rotation) and robustness (offline support, wall-clock-aligned ticks, screenshot tests) since the first version, which apparently offered a selection of clock styles before narrowing to one.

## Near-term

- The design-evolution retrospective already in TODO.md is the stated next step.
- Add CI so `make deploy` isn't the first thing to catch a broken build (see TODO.md).
