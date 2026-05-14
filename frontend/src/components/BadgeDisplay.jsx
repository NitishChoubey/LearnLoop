export default function BadgeDisplay({ badges = [], max = 6, size = "md" }) {
  const sizes = { sm: "text-xl", md: "text-3xl", lg: "text-4xl" };
  const containerSizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  if (!badges.length) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 italic">No badges yet. Start teaching!</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {badges.slice(0, max).map((ub) => (
        <div
          key={ub.id}
          className="group relative"
          title={`${ub.badge.name}: ${ub.badge.description}`}
        >
          <div
            className={`${containerSizes[size]} bg-gradient-to-br from-gold-100 to-gold-200 dark:from-gold-900/30 dark:to-gold-800/30 border-2 border-gold-300 dark:border-gold-600 rounded-xl flex items-center justify-center cursor-help transition-transform hover:scale-110`}
          >
            <span className={sizes[size]}>{ub.badge.icon}</span>
          </div>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
            <p className="font-semibold">{ub.badge.name}</p>
            <p className="text-gray-300 mt-0.5">{ub.badge.description}</p>
          </div>
        </div>
      ))}
      {badges.length > max && (
        <div className={`${containerSizes[size]} bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl flex items-center justify-center`}>
          <span className="text-sm font-bold text-gray-500 dark:text-gray-400">+{badges.length - max}</span>
        </div>
      )}
    </div>
  );
}
