import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const LAST_ACCESS_COOKIE = "lastAccessedAt";

const getCookieValue = (name) => {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
};

const setCookie = (name, value, maxAgeSeconds) => {
  try {
    document.cookie = `${name}=${encodeURIComponent(
      value
    )}; max-age=${maxAgeSeconds}; path=/`;
  } catch {
    return;
  }
};

const getElapsedTime = (startTimestamp) => {
  const totalSeconds = Math.max(
    0,
    Math.floor((Date.now() - startTimestamp) / 1000)
  );
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
};

const pluralize = (value, label) =>
  `${value} ${label}${value === 1 ? "" : "s"}`;

const ClockTracker = () => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [lastAccessedAt] = useState(() => {
    const cookieValue = getCookieValue(LAST_ACCESS_COOKIE);
    const parsed = cookieValue ? Number(cookieValue) : Date.now();
    return Number.isFinite(parsed) ? parsed : Date.now();
  });
  const [elapsed] = useState(() => getElapsedTime(lastAccessedAt));
  const containerRef = useRef(null);
  const digitsRef = useRef(null);

  const updateTime = () => {
    const now = new Date();
    setHours(now.getHours());
    setMinutes(now.getMinutes());
    setSeconds(now.getSeconds());
  };

  useEffect(() => {
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCookie(LAST_ACCESS_COOKIE, Date.now(), 60 * 60 * 24 * 365);
  }, []);

  const elapsedParts = [
    elapsed.days ? pluralize(elapsed.days, "day") : null,
    elapsed.hours ? pluralize(elapsed.hours, "hour") : null,
    elapsed.minutes ? pluralize(elapsed.minutes, "minute") : null,
    elapsed.seconds ? pluralize(elapsed.seconds, "second") : null,
  ].filter(Boolean);

  const elapsedText = elapsedParts.length
    ? elapsedParts.length === 1
      ? elapsedParts[0]
      : `${elapsedParts.slice(0, -1).join(" ")} and ${
          elapsedParts[elapsedParts.length - 1]
        }`
    : "";

  const fitDigits = useCallback(() => {
    const container = containerRef.current;
    const digits = digitsRef.current;
    if (!container || !digits) return;

    const baseSize = 100;
    digits.style.fontSize = `${baseSize}px`;
    const { width: containerWidth, height: containerHeight } =
      container.getBoundingClientRect();
    const { width: digitsWidth, height: digitsHeight } =
      digits.getBoundingClientRect();
    if (!digitsWidth || !digitsHeight) return;

    const scale = Math.min(
      containerWidth / digitsWidth,
      containerHeight / digitsHeight
    );
    digits.style.fontSize = `${baseSize * scale}px`;
  }, []);

  useLayoutEffect(() => {
    fitDigits();
  }, [hours, minutes, seconds, fitDigits]);

  useEffect(() => {
    const handleResize = () => fitDigits();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [fitDigits]);

  return (
    <div className="container" ref={containerRef}>
      <div className="clock-digits" ref={digitsRef}>
        <span className="time">{hours.toString().padStart(2, "0")}</span>
        <span className="separator">:</span>
        <span className="time">{minutes.toString().padStart(2, "0")}</span>
        <span className="separator">:</span>
        <span className="time">{seconds.toString().padStart(2, "0")}</span>
      </div>
      {elapsedText ? (
        <div className="last-accessed">Last accessed {elapsedText} ago</div>
      ) : null}
    </div>
  );
};

export default ClockTracker;
