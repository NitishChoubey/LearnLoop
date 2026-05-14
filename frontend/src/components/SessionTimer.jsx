import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

export default function SessionTimer({ startTime, isActive }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isActive || !startTime) return;
    const start = new Date(startTime).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isActive, startTime]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-2 bg-primary-500/10 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 px-3 py-1.5 rounded-lg">
      <Timer size={15} className={isActive ? "animate-pulse" : ""} />
      <span className="font-mono font-semibold text-sm">
        {hours > 0 ? `${pad(hours)}:` : ""}{pad(minutes)}:{pad(seconds)}
      </span>
      {isActive && (
        <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
      )}
    </div>
  );
}
