/**
 * Navbar — Top navigation bar.
 * Follows Kuria component.navbar spec: sticky, surface bg, subtle border, z-fixed.
 *
 * @param {string} userEmail - Authenticated user's email
 * @param {function} onSignOut - Sign-out handler
 * @param {boolean} isDemo - Whether in demo mode
 */
export default function Navbar({ userEmail, onSignOut, isDemo = false }) {
  return (
    <nav
      id="navbar"
      className="sticky top-0 z-50 bg-kuria-surface border-b border-kuria-border-subtle shadow-kuria-sticky"
    >
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center rounded-kuria-md bg-kuria-primary-subtle">
            <span className="text-base">🌱</span>
          </div>
          <div>
            <h1 className="font-heading text-base font-semibold text-kuria-text-heading leading-tight">
              Kuri'a Admin
            </h1>
            <p className="text-[10px] text-kuria-text-tertiary leading-none tracking-wider uppercase">
              Data Triage · Kaduna
            </p>
          </div>
        </div>

        {/* Right: User + Sign Out */}
        <div className="flex items-center gap-3">
          {isDemo && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-kuria-full bg-kuria-warning-subtle text-kuria-text-warning">
              Demo Mode
            </span>
          )}
          <span className="text-sm text-kuria-text-secondary hidden sm:inline truncate max-w-[200px]">
            {userEmail}
          </span>
          <button
            id="navbar-signout"
            type="button"
            onClick={onSignOut}
            className="h-8 px-3 text-sm font-medium bg-kuria-surface text-kuria-text border border-kuria-border rounded-kuria-md transition-all duration-150 hover:bg-kuria-muted hover:shadow-kuria-button"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
