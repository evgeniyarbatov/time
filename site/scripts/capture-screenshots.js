import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const port = 4173;
const baseUrl = `http://127.0.0.1:${port}/time/`;
const screenshotsDir = path.join(process.cwd(), "screenshots");
const deviceScaleFactor = 2;

const viewports = [
  { name: "mobile-375x667", width: 375, height: 667 },
  { name: "desktop-1366x768", width: 1366, height: 768 },
];
const colorSchemes = [
  { name: "light", suffix: "", colorScheme: "light" },
  { name: "dark", suffix: "-dark", colorScheme: "dark" },
];
const lastAccessedOptions = [
  { name: "last-minute", maxDays: 0, maxHours: 0, maxMinutes: 0, maxSeconds: 59 },
  { name: "last-hour", maxDays: 0, maxHours: 0, maxMinutes: 59, maxSeconds: 59 },
  { name: "last-day", maxDays: 0, maxHours: 23, maxMinutes: 59, maxSeconds: 59 },
  { name: "last-week", maxDays: 6, maxHours: 23, maxMinutes: 59, maxSeconds: 59 },
  { name: "last-month", maxDays: 29, maxHours: 23, maxMinutes: 59, maxSeconds: 59 },
  { name: "last-year", maxDays: 364, maxHours: 23, maxMinutes: 59, maxSeconds: 59 },
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

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomOffsetMs = ({ maxDays, maxHours, maxMinutes, maxSeconds }) => {
  const days = randomInt(0, maxDays);
  const hours = randomInt(0, maxHours);
  const minutes = randomInt(0, maxMinutes);
  const seconds = randomInt(0, maxSeconds);
  const totalSeconds =
    ((days * 24 + hours) * 60 + minutes) * 60 + seconds;
  return Math.max(totalSeconds, 1) * 1000;
};

const buildUniqueOffsetGenerator = () => {
  const usedOffsets = new Map();
  return (option) => {
    const usedForOption = usedOffsets.get(option.name) ?? new Set();
    let offsetMs = randomOffsetMs(option);
    while (usedForOption.has(offsetMs)) {
      offsetMs = randomOffsetMs(option);
    }
    usedForOption.add(offsetMs);
    usedOffsets.set(option.name, usedForOption);
    return offsetMs;
  };
};

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
  await rm(screenshotsDir, { recursive: true, force: true });
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
    const getUniqueOffsetMs = buildUniqueOffsetGenerator();

    try {
      for (const viewport of viewports) {
        for (const scheme of colorSchemes) {
          for (const option of lastAccessedOptions) {
            const context = await browser.newContext({
              viewport,
              colorScheme: scheme.colorScheme,
              deviceScaleFactor,
            });
            const offsetMs = getUniqueOffsetMs(option);
            await context.addCookies([
              {
                name: "lastAccessedAt",
                value: String(Date.now() - offsetMs),
                url: baseUrl,
              },
            ]);
            const page = await context.newPage();
            await page.emulateMedia({ colorScheme: scheme.colorScheme });
            await page.goto(baseUrl, { waitUntil: "networkidle" });
            await page.waitForSelector(".clock-digits");
            await page.screenshot({
              path: path.join(
                screenshotsDir,
                `${viewport.name}${scheme.suffix}-${option.name}.png`
              ),
              fullPage: true,
              scale: "device",
            });
            await context.close();
          }
        }
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
