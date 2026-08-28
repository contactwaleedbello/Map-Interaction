import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Auth — Email/password login screen.
 * Uses Kuria card, input, and button design tokens via Tailwind.
 * When Supabase is not configured, allows demo bypass.
 */
export default function Auth({ onDemoLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('login'); // 'login' | 'signup'

  const configured = isSupabaseConfigured();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!configured) return;

    setLoading(true);
    setError(null);

    try {
      const { error: authError } =
        mode === 'login'
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (authError) throw authError;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-kuria-page px-4">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-kuria-lg bg-kuria-primary-subtle mb-4">
            <span className="text-2xl">🌱</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-kuria-text-heading">
            Kuri'a Admin
          </h1>
          <p className="text-sm text-kuria-text-secondary mt-1">
            Electoral Integrity Data Triage
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-kuria-surface border border-kuria-border rounded-kuria-lg shadow-kuria-card p-6">
          <h2 className="font-heading text-lg font-semibold text-kuria-text-heading mb-6">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-kuria-md bg-kuria-error-subtle border border-kuria-border-error">
              <p className="text-sm text-kuria-text-error">{error}</p>
            </div>
          )}

          {!configured && (
            <div className="mb-4 p-3 rounded-kuria-md bg-kuria-warning-subtle border border-[var(--token-color-border-warning)]">
              <p className="text-sm text-kuria-text-warning">
                Supabase is not configured. Use the demo login below to explore the dashboard with seed data.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="auth-email"
                className="block text-sm font-medium text-kuria-text mb-1"
              >
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required={configured}
                disabled={!configured}
                className="w-full h-10 px-3 text-sm bg-kuria-surface text-kuria-text placeholder:text-kuria-text-tertiary border border-kuria-border rounded-kuria-md transition-colors duration-150 focus:outline-none focus:border-kuria-border-focus focus:shadow-kuria-focus disabled:bg-kuria-disabled disabled:text-kuria-text-disabled disabled:cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="auth-password"
                className="block text-sm font-medium text-kuria-text mb-1"
              >
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required={configured}
                disabled={!configured}
                className="w-full h-10 px-3 text-sm bg-kuria-surface text-kuria-text placeholder:text-kuria-text-tertiary border border-kuria-border rounded-kuria-md transition-colors duration-150 focus:outline-none focus:border-kuria-border-focus focus:shadow-kuria-focus disabled:bg-kuria-disabled disabled:text-kuria-text-disabled disabled:cursor-not-allowed"
              />
            </div>

            {/* Submit */}
            {configured && (
              <button
                id="auth-submit"
                type="submit"
                disabled={loading}
                className="w-full h-10 px-4 text-sm font-semibold bg-kuria-primary text-kuria-text-on-primary rounded-kuria-md shadow-kuria-button transition-all duration-150 hover:bg-kuria-primary-hover hover:shadow-kuria-button-hover active:bg-kuria-primary-active disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? 'Authenticating…'
                  : mode === 'login'
                    ? 'Sign In'
                    : 'Create Account'}
              </button>
            )}
          </form>

          {/* Demo Login */}
          {!configured && (
            <button
              id="auth-demo"
              type="button"
              onClick={onDemoLogin}
              className="w-full mt-4 h-10 px-4 text-sm font-semibold bg-kuria-primary text-kuria-text-on-primary rounded-kuria-md shadow-kuria-button transition-all duration-150 hover:bg-kuria-primary-hover hover:shadow-kuria-button-hover active:bg-kuria-primary-active"
            >
              Enter Demo Dashboard
            </button>
          )}

          {/* Toggle mode */}
          {configured && (
            <p className="mt-4 text-center text-sm text-kuria-text-secondary">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                id="auth-toggle-mode"
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="font-medium text-kuria-text-link hover:text-[var(--token-color-text-link-hover)] transition-colors"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-kuria-text-tertiary">
          Kuri'a Platform · Kaduna State · 90-Day Pilot
        </p>
      </div>
    </div>
  );
}
