/**
 * FilterChips — Horizontal chip bar for filtering reports.
 * Uses Kuria tabs.variant.pills tokens: pill shape, primary-subtle active bg.
 *
 * @param {string[]} chips - Array of chip labels
 * @param {Set<string>} activeChips - Currently active chip labels
 * @param {function} onToggle - Called with chip label when toggled
 */
export default function FilterChips({ chips, activeChips, onToggle }) {
  return (
    <div id="filter-chips" className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => {
        const isActive = activeChips.has(chip);
        return (
          <button
            key={chip}
            type="button"
            onClick={() => onToggle(chip)}
            className={`
              inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-kuria-full
              border transition-all duration-150
              ${
                isActive
                  ? 'bg-kuria-primary-subtle text-kuria-primary border-kuria-primary'
                  : 'bg-kuria-surface text-kuria-text-secondary border-kuria-border hover:bg-kuria-muted hover:text-kuria-text'
              }
            `}
          >
            {chip}
          </button>
        );
      })}
    </div>
  );
}
