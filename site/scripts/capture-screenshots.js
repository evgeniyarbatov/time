import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const port = 4173;
const baseUrl = `http://127.0.0.1:${port}/`;
const screenshotsDir = path.join(process.cwd(), "screenshots");
const lastAccessedAt = Date.now() - (2 * 3600 + 5 * 60) * 1000;

const viewports = [
  { name: "mobile-360x800", width: 360, height: 800 },
  { name: "mobile-375x667", width: 375, height: 667 },
  { name: "mobile-390x844", width: 390, height: 844 },
  { name: "mobile-428x926", width: 428, height: 926 },
  { name: "desktop-1366x768", width: 1366, height: 768 },
  { name: "desktop-1440x900", width: 1440, height: 900 },
  { name: "desktop-1920x1080", width: 1920, height: 1080 },
];

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(" ")} failed`));
      }
    });
    child.on("error", reject);
  });

const waitForServer = async () => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(baseUrl, { method: "GET" });
      if (response.ok) return;
    } catch (error) {
      // Keep polling until the preview server is ready.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("Preview server did not start in time");
};

const captureScreenshots = async () => {
  await mkdir(screenshotsDir, { recursive: true });

  await run("npm", ["run", "build"]);

  const preview = spawn(
    "npm",
    [
      "run",
      "preview",
      "--",
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
      "--strictPort",
    ],
    { stdio: "inherit" }
  );

  try {
    await waitForServer();

    const browser = await chromium.launch();

    try {
      for (const viewport of viewports) {
        const context = await browser.newContext({ viewport });
        await context.addCookies([
          {
            name: "lastAccessedAt",
            value: String(lastAccessedAt),
            url: baseUrl,
          },
        ]);
        const page = await context.newPage();
        await page.goto(baseUrl, { waitUntil: "networkidle" });
        await page.waitForSelector(".clock-digits");
        await page.screenshot({
          path: path.join(screenshotsDir, `${viewport.name}.png`),
          fullPage: true,
        });
        await context.close();
      }
    } finally {
      await browser.close();
    }
  } finally {
    preview.kill("SIGTERM");
  }
};

captureScreenshots().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
