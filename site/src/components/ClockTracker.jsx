import { useState, useEffect } from "react";

const ClockTracker = () => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

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
  

  return (
    <div className="container">
        <div className="clock-digits">
            <div className="input-container">
                <input type="number" id="hours" value={hours} min="0" max="23" />
            </div>
            <div className="input-container">
                <label>:</label>
                <input type="number" id="minutes" value={minutes} min="0" max="59" />
            </div>
            <div className="input-container">
                <label>:</label>
                <input type="number" id="seconds" value={seconds} min="0" max="59" />
            </div>
        </div>
    </div>
  );
};

export default ClockTracker;