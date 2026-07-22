import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";

import ClockTracker from "./ClockTracker";

const readClockTime = (container) =>
  Array.from(container.querySelectorAll(".time"), (node) => node.textContent).join(
    ":"
  );

const formatTimeInZone = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const lookup = (type) => parts.find((part) => part.type === type)?.value ?? "";
  return `${lookup("hour")}:${lookup("minute")}:${lookup("second")}`;
};

const withTimezone = async (timeZone, run) => {
  const previous = process.env.TZ;
  process.env.TZ = timeZone;
  try {
    await run();
  } finally {
    process.env.TZ = previous;
  }
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  document.cookie = "lastAccessedAt=; max-age=0; path=/";
});

describe.each([
  "UTC",
  "America/New_York",
  "Asia/Tokyo",
])("ClockTracker timezone rendering (%s)", (timeZone) => {
  it("renders the current local time", async () => {
    const fixedDate = new Date("2024-01-15T12:34:56Z");

    await withTimezone(timeZone, async () => {
      vi.useFakeTimers();
      vi.setSystemTime(fixedDate);
      const { container } = render(<ClockTracker />);

      expect(readClockTime(container)).toBe(
        formatTimeInZone(fixedDate, timeZone)
      );
    });
  });
});

it("ticks on the next second boundary", async () => {
  // Mid-second so a naive 1000ms interval would lag the wall-clock flip.
  const fixedDate = new Date("2024-01-15T12:34:56.400Z");

  await withTimezone("UTC", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
    const { container } = render(<ClockTracker />);

    expect(readClockTime(container)).toBe("12:34:56");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(599);
    });
    expect(readClockTime(container)).toBe("12:34:56");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(readClockTime(container)).toBe("12:34:57");
  });
});

it("refreshes immediately when the tab becomes visible again", async () => {
  const fixedDate = new Date("2024-01-15T12:34:56.400Z");

  await withTimezone("UTC", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
    const { container } = render(<ClockTracker />);

    expect(readClockTime(container)).toBe("12:34:56");

    vi.setSystemTime(new Date("2024-01-15T12:34:59.100Z"));
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });

    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(readClockTime(container)).toBe("12:34:59");
  });
});

it("shows elapsed time from the lastAccessedAt cookie", async () => {
  const now = new Date("2024-01-15T12:34:56Z");
  const twoHoursFiveMinutes = now.getTime() - (2 * 3600 + 5 * 60) * 1000;

  await withTimezone("UTC", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    document.cookie = `lastAccessedAt=${twoHoursFiveMinutes}; path=/`;

    render(<ClockTracker />);

    expect(
      screen.getByText("Last accessed 2 hours and 5 minutes ago")
    ).toBeInTheDocument();
  });
});

it("shows colons on desktop but hides them on mobile", () => {
  render(<ClockTracker />);

  expect(screen.getAllByText(":")).toHaveLength(2);

  const cssPath = path.join(process.cwd(), "src", "custom.css");
  const css = fs.readFileSync(cssPath, "utf8");

  expect(css).toMatch(/\.separator\s*\{[^}]*display:\s*inline-flex/i);

  const mobileIndex = css.indexOf("@media (max-width: 640px)");
  expect(mobileIndex).toBeGreaterThan(-1);

  const mobileCss = css.slice(mobileIndex);
  expect(mobileCss).toMatch(/\.separator\s*\{[^}]*display:\s*none/i);
});

it("renders even if cookie access fails (Safari blocked cookies)", () => {
  const hadOwnCookie = Object.prototype.hasOwnProperty.call(document, "cookie");
  const originalDescriptor = Object.getOwnPropertyDescriptor(document, "cookie");

  Object.defineProperty(document, "cookie", {
    configurable: true,
    get() {
      throw new Error("Cookies blocked");
    },
    set() {
      throw new Error("Cookies blocked");
    },
  });

  try {
    expect(() => render(<ClockTracker />)).not.toThrow();
    expect(screen.getAllByText(":")).toHaveLength(2);
  } finally {
    if (hadOwnCookie && originalDescriptor) {
      Object.defineProperty(document, "cookie", originalDescriptor);
    } else {
      delete document.cookie;
    }
  }
});
