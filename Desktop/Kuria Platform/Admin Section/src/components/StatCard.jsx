/**
 * StatCard — KPI metric card.
 * Follows Kuria component.stat-card spec: surface bg, card shadow, heading + label typography.
 *
 * @param {string} label - Metric name (e.g., "Total Reports")
 * @param {string|number} value - Metric value
 * @param {'up'|'down'|'neutral'} trendDirection
 * @param {string} trend - Trend text (e.g., "+12 today")
 * @param {string} icon - Emoji or text icon
 */
export default function StatCard({ label, value, trendDirection = 'neutral', trend, icon }) {
  const trendColors = {
    up: 'text-kuria-text-success',
    down: 'text-kuria-text-error',
    neutral: 'text-kuria-text-tertiary',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <div className="bg-kuria-surface border border-kuria-border rounded-kuria-lg shadow-kuria-card p-5 flex items-start gap-4 min-w-0">
      {/* Icon */}
      {icon && (
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-kuria-lg bg-kuria-primary-subtle">
          <span className="text-xl">{icon}</span>
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-kuria-text-secondary uppercase tracking-wider">
          {label}
        </p>
        <p className="font-heading text-2xl font-bold text-kuria-text-heading mt-1 truncate">
          {value}
        </p>
        {trend && (
          <p className={`text-xs font-medium mt-1 ${trendColors[trendDirection]}`}>
            {trendIcons[trendDirection]} {trend}
          </p>
        )}
      </div>
    </div>
  );
}
