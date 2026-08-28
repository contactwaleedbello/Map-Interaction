import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { supabase, isSupabaseConfigured } from './lib/supabase';

/**
 * App — Root component and auth gate.
 * Renders Auth screen when unauthenticated, Dashboard when authenticated.
 * Supports demo mode bypass when Supabase is not configured.
 */
export default function App() {
  const [session, setSession] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (isDemo) {
      setIsDemo(false);
      return;
    }
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setSession(null);
  };

  const handleDemoLogin = () => {
    setIsDemo(true);
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kuria-page">
        <div className="text-center">
          <div className="w-10 h-10 rounded-kuria-full border-2 border-kuria-border border-t-kuria-primary animate-spin mx-auto mb-3" />
          <p className="text-sm text-kuria-text-secondary">Loading…</p>
        </div>
      </div>
    );
  }

  // Auth gate
  if (!session && !isDemo) {
    return <Auth onDemoLogin={handleDemoLogin} />;
  }

  return (
    <Dashboard session={session} onSignOut={handleSignOut} isDemo={isDemo} />
  );
}
