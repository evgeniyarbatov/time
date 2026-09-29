import { beforeEach, describe, expect, it, vi } from "vitest";

const setupServiceWorkerEnv = () => {
  const listeners = {};
  const cache = {
    addAll: vi.fn(async () => {}),
    put: vi.fn(async () => {}),
  };
  const caches = {
    open: vi.fn(async () => cache),
    keys: vi.fn(async () => []),
    delete: vi.fn(async () => true),
    match: vi.fn(async () => undefined),
  };
  const self = {
    location: { origin: "https://time.test" },
    addEventListener: (type, handler) => {
      listeners[type] = handler;
    },
    skipWaiting: vi.fn(),
    clients: { claim: vi.fn() },
  };

  globalThis.caches = caches;
  globalThis.self = self;
  globalThis.fetch = vi.fn();

  return { cache, caches, listeners };
};

const loadServiceWorker = async () => {
  vi.resetModules();
  const baseUrl = String(import.meta.url);
  await import(new URL("../public/sw.js", baseUrl));
};

beforeEach(() => {
  delete globalThis.caches;
  delete globalThis.fetch;
  delete globalThis.self;
});

describe("service worker offline behavior", () => {
  it("precaches the core assets on install", async () => {
    const { cache, listeners } = setupServiceWorkerEnv();
    await loadServiceWorker();

    let waitPromise;
    listeners.install({
      waitUntil: (promise) => {
        waitPromise = promise;
      },
    });
    await waitPromise;

    expect(cache.addAll).toHaveBeenCalledWith(
      expect.arrayContaining([
        "./",
        "./index.html",
        "./manifest.webmanifest",
        "./clock.svg",
      ])
    );
  });

  it("falls back to index.html when a navigation request is offline", async () => {
    const { caches, listeners } = setupServiceWorkerEnv();
    caches.match.mockResolvedValue("offline-index");
    globalThis.fetch.mockRejectedValue(new Error("offline"));
    await loadServiceWorker();

    let responsePromise;
    listeners.fetch({
      request: {
        method: "GET",
        mode: "navigate",
        url: "https://time.test/",
      },
      respondWith: (promise) => {
        responsePromise = promise;
      },
    });

    await expect(responsePromise).resolves.toBe("offline-index");
    expect(caches.match).toHaveBeenCalledWith("./index.html");
  });
});
