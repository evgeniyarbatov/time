# time

A full-screen local clock for setting watches and clocks: https://evgeniyarbatov.github.io/time/

<img width="1561" height="941" alt="Screenshot 2026-01-13 at 9 02 01 AM" src="https://github.com/user-attachments/assets/b9adc454-41d3-490f-864f-4cc677135096" />

## What it does

- Shows the device's local time as `HH:MM:SS`, scaled to fill the screen.
- Stacks the digits vertically on narrow screens and follows the system dark mode.
- Shows how long it has been since your last visit.
- Works offline and installs as an app (PWA).

## How it works

- A React + Vite single page. Ticks are aligned to the wall-clock second, so the display changes exactly when the second does.
- A service worker caches the page for offline use.
- A cookie stores the last-visit timestamp.
- Every push to `main` runs the tests, builds the site and deploys it to GitHub Pages.

## How to run

```
make run
```
