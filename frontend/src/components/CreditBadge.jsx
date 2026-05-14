import { Coins } from "lucide-react";

export default function CreditBadge({ credits = 0, size = "md", showLabel = false }) {
  const sizes = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-2 gap-2",
  };
  const iconSizes = { sm: 12, md: 14, lg: 18 };

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full bg-gold-500/15 text-gold-600 dark:text-gold-400 ${sizes[size]}`}
    >
      <Coins size={iconSizes[size]} />
      <span>{credits}</span>
      {showLabel && <span className="font-normal">credits</span>}
    </span>
  );
}
