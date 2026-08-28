import { useState, useMemo, useCallback, useEffect } from 'react';
import Navbar from './Navbar';
import StatCard from './StatCard';
import FilterChips from './FilterChips';
import TriageFeed from './TriageFeed';
import MapPanel from './MapPanel';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SEED_REPORTS, SEED_API_METRICS } from '../lib/seedData';

/**
 * Filter chip definitions.
 * Each chip maps to a filter function applied to the reports array.
 */
const CHIP_FILTERS = {
  All: () => true,
  Hausa: (r) => r.language === 'hausa',
  English: (r) => r.language === 'english',
  'Voter Suppression': (r) => r.category === 'voter_suppression',
  Pending: (r) => r.status === 'pending',
  Verified: (r) => r.status === 'verified',
  Flagged: (r) => r.status === 'flagged',
};

const CHIP_LABELS = Object.keys(CHIP_FILTERS);

/**
 * Dashboard — Main layout shell.
 * Combines Navbar, StatCards, FilterChips, TriageFeed, and MapPanel.
 *
 * @param {object|null} session - Supabase auth session (null in demo mode)
 * @param {function} onSignOut - Sign-out handler
 * @param {boolean} isDemo - Whether in demo mode
 */
export default function Dashboard({ session, onSignOut, isDemo = false }) {
  const [reports, setReports] = useState(SEED_REPORTS);
  const [activeChips, setActiveChips] = useState(new Set(['All']));
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [apiMetrics] = useState(SEED_API_METRICS);

  // Fetch live reports from Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const fetchReports = async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setReports(data);
      }
    };

    fetchReports();

    // Real-time subscription for new/updated reports
    const channel = supabase
      .channel('reports-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setReports((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setReports((prev) =>
              prev.map((r) => (r.id === payload.new.id ? payload.new : r))
            );
          } else if (payload.eventType === 'DELETE') {
            setReports((prev) => prev.filter((r) => r.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter reports based on active chips
  const filteredReports = useMemo(() => {
    if (activeChips.has('All')) return reports;

    return reports.filter((report) => {
      // Report passes if it matches ANY active chip filter
      return Array.from(activeChips).some((chip) => {
        const filterFn = CHIP_FILTERS[chip];
        return filterFn ? filterFn(report) : true;
      });
    });
  }, [reports, activeChips]);

  // Compute stats from ALL reports (not filtered)
  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((r) => r.status === 'pending').length;
    const verified = reports.filter((r) => r.status === 'verified').length;
    const flagged = reports.filter((r) => r.status === 'flagged').length;
    return { total, pending, verified, flagged };
  }, [reports]);

  // Chip toggle logic
  const handleChipToggle = useCallback((chip) => {
    setActiveChips((prev) => {
      const next = new Set(prev);

      if (chip === 'All') {
        // Selecting "All" clears everything else
        return new Set(['All']);
      }

      // Deselect "All" when selecting specific filter
      next.delete('All');

      if (next.has(chip)) {
        next.delete(chip);
        // If nothing left, default to "All"
        if (next.size === 0) return new Set(['All']);
      } else {
        next.add(chip);
      }

      return next;
    });
  }, []);

  // Status change handler
  const handleStatusChange = useCallback(
    async (reportId, newStatus) => {
      // Optimistic update
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, status: newStatus, updated_at: new Date().toISOString() } : r
        )
      );

      if (isSupabaseConfigured()) {
        try {
          await supabase
            .from('reports')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', reportId);
        } catch (err) {
          console.error('Failed to update status:', err);
        }
      }
    },
    []
  );

  // Transcript save handler
  const handleTranscriptSave = useCallback((reportId, newTranscript) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId ? { ...r, transcript: newTranscript } : r
      )
    );
  }, []);

  const userEmail = isDemo ? 'demo@kuria.ng' : session?.user?.email || 'user';

  return (
    <div className="min-h-screen bg-kuria-page">
      <Navbar userEmail={userEmail} onSignOut={onSignOut} isDemo={isDemo} />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        {/* Metric Counters */}
        <div id="stat-cards" className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard
            icon="📊"
            label="Total Reports"
            value={stats.total}
            trend={`${filteredReports.length} shown`}
            trendDirection="neutral"
          />
          <StatCard
            icon="⏳"
            label="Pending"
            value={stats.pending}
            trend="Awaiting review"
            trendDirection={stats.pending > 5 ? 'up' : 'neutral'}
          />
          <StatCard
            icon="✅"
            label="Verified"
            value={stats.verified}
            trend="Confirmed accurate"
            trendDirection="up"
          />
          <StatCard
            icon="🚩"
            label="Flagged"
            value={stats.flagged}
            trend="Needs attention"
            trendDirection={stats.flagged > 0 ? 'down' : 'neutral'}
          />
          <StatCard
            icon="⚡"
            label="API Usage"
            value={`${apiMetrics.transcription_calls}/${apiMetrics.transcription_limit}`}
            trend={`${apiMetrics.storage_used_mb}MB / ${apiMetrics.storage_limit_mb}MB storage`}
            trendDirection={
              apiMetrics.transcription_calls / apiMetrics.transcription_limit > 0.9
                ? 'down'
                : 'neutral'
            }
          />
        </div>

        {/* Filter Chips */}
        <div className="mb-6">
          <FilterChips
            chips={CHIP_LABELS}
            activeChips={activeChips}
            onToggle={handleChipToggle}
          />
        </div>

        {/* Main Content: Feed + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Triage Feed — 3/5 width on desktop */}
          <div className="lg:col-span-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1 scrollbar-thin">
            <TriageFeed
              reports={filteredReports}
              selectedReportId={selectedReportId}
              onSelectReport={setSelectedReportId}
              onStatusChange={handleStatusChange}
              onTranscriptSave={handleTranscriptSave}
            />
          </div>

          {/* Map Panel — 2/5 width on desktop, sticky */}
          <div className="lg:col-span-2 h-[400px] lg:h-[calc(100vh-320px)] lg:sticky lg:top-[88px]">
            <MapPanel
              reports={filteredReports}
              selectedReportId={selectedReportId}
              onMarkerClick={setSelectedReportId}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
