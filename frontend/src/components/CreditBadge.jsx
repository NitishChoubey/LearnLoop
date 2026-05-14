import { Coins } from "lucide-react";

export default function CreditBadge({ credits = 0, size = "md", showLabel = false }) {
  const sizes = {
    sm: "text-xs px-2.5 py-1 gap-1",
    md: "text-sm px-3 py-1.5 gap-1.5",
    lg: "text-base px-4 py-2 gap-2",
  };
  const iconSizes = { sm: 12, md: 14, lg: 18 };

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full bg-gradient-to-r from-gold-100 to-amber-50 text-gold-800 ring-1 ring-gold-300/40 dark:from-gold-900/40 dark:to-amber-900/30 dark:text-gold-300 dark:ring-gold-600/30 ${sizes[size]}`}
    >
      <Coins size={iconSizes[size]} className="opacity-90" />
      <span>{credits}</span>
      {showLabel && <span className="font-medium opacity-80">credits</span>}
    </span>
  );
}
