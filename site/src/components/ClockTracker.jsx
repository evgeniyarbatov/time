import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const ClockTracker = () => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
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
            <span className="time">{hours.toString().padStart(2, '0')}</span>
            <span className="separator">:</span>
            <span className="time">{minutes.toString().padStart(2, '0')}</span>
            <span className="separator">:</span>
            <span className="time">{seconds.toString().padStart(2, '0')}</span>
        </div>
    </div>
  );
};

export default ClockTracker;
