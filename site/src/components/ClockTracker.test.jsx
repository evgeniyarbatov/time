import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

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

it("ticks every second", async () => {
  const fixedDate = new Date("2024-01-15T12:34:56Z");

  await withTimezone("UTC", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
    const { container } = render(<ClockTracker />);

    expect(readClockTime(container)).toBe("12:34:56");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(readClockTime(container)).toBe("12:34:57");
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
