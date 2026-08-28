import { useState, useCallback } from 'react';
import Badge from './Badge';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * ReportCard — Data triage card for a single incoming report.
 * Follows Kuria component.card spec: surface bg, border, lg radius, card shadow.
 * Contains: audio player, editable transcript, timestamp, coordinates, status badges.
 *
 * @param {object} report - Report data object
 * @param {function} onStatusChange - Called with (reportId, newStatus)
 * @param {function} onTranscriptSave - Called with (reportId, newTranscript)
 * @param {boolean} isSelected - Highlight when selected on map
 */
export default function ReportCard({ report, onStatusChange, onTranscriptSave, isSelected = false }) {
  const [transcript, setTranscript] = useState(report.transcript || '');
  const [saving, setSaving] = useState(false);

  const handleTranscriptBlur = useCallback(async () => {
    if (transcript === report.transcript) return;
    setSaving(true);

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('reports')
          .update({ transcript, updated_at: new Date().toISOString() })
          .eq('id', report.id);
      } catch (err) {
        console.error('Failed to save transcript:', err);
      }
    }

    onTranscriptSave?.(report.id, transcript);
    setSaving(false);
  }, [transcript, report.id, report.transcript, onTranscriptSave]);

  const handleStatusClick = (newStatus) => {
    if (newStatus === report.status) return;
    onStatusChange?.(report.id, newStatus);
  };

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleString('en-NG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const languageLabels = {
    hausa: 'Hausa',
    english: 'English',
  };

  const categoryLabels = {
    voter_suppression: 'Voter Suppression',
    logistics: 'Logistics',
  };

  return (
    <div
      id={`report-card-${report.id}`}
      className={`
        bg-kuria-surface border rounded-kuria-lg shadow-kuria-card
        transition-all duration-300
        ${isSelected ? 'border-kuria-border-primary ring-2 ring-kuria-primary/20' : 'border-kuria-border'}
      `}
    >
      {/* Card Header — Timestamp + Language + Category */}
      <div className="px-5 pt-4 pb-3 border-b border-kuria-border-subtle flex flex-wrap items-center gap-2">
        <span className="text-xs text-kuria-text-tertiary font-mono">
          {formatTime(report.created_at)}
        </span>
        <div className="flex items-center gap-1.5 ml-auto">
          <Badge variant="primary">
            {languageLabels[report.language] || report.language}
          </Badge>
          {report.category && (
            <Badge variant="info">
              {categoryLabels[report.category] || report.category}
            </Badge>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="px-5 py-4 space-y-4">
        {/* Audio Player */}
        {report.audio_url ? (
          <div>
            <label className="block text-xs font-medium text-kuria-text-secondary uppercase tracking-wider mb-1.5">
              Audio
            </label>
            <audio
              controls
              preload="metadata"
              src={report.audio_url}
              className="w-full h-8 rounded-kuria-md"
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-kuria-md bg-kuria-muted">
            <span className="text-kuria-text-tertiary text-sm">🔇</span>
            <span className="text-xs text-kuria-text-tertiary">No audio file attached</span>
          </div>
        )}

        {/* Editable Transcript */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor={`transcript-${report.id}`}
              className="text-xs font-medium text-kuria-text-secondary uppercase tracking-wider"
            >
              Transcript
            </label>
            {saving && (
              <span className="text-xs text-kuria-text-tertiary">Saving…</span>
            )}
          </div>
          <textarea
            id={`transcript-${report.id}`}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onBlur={handleTranscriptBlur}
            rows={3}
            className="w-full px-3 py-2 text-sm bg-kuria-surface text-kuria-text border border-kuria-border rounded-kuria-md font-body leading-relaxed resize-y transition-colors duration-150 focus:outline-none focus:border-kuria-border-focus focus:shadow-kuria-focus placeholder:text-kuria-text-tertiary"
            placeholder="Transcript text…"
          />
        </div>

        {/* Coordinates */}
        {report.latitude != null && report.longitude != null && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-kuria-text-tertiary">📍</span>
            <span className="text-xs text-kuria-text-secondary font-mono">
              {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
            </span>
          </div>
        )}
      </div>

      {/* Card Footer — Status Badges */}
      <div className="px-5 py-3 border-t border-kuria-border-subtle flex flex-wrap items-center gap-2">
        <span className="text-xs text-kuria-text-tertiary mr-1">Status:</span>
        <Badge
          variant="warning"
          interactive
          active={report.status === 'pending'}
          onClick={() => handleStatusClick('pending')}
        >
          Pending
        </Badge>
        <Badge
          variant="success"
          interactive
          active={report.status === 'verified'}
          onClick={() => handleStatusClick('verified')}
        >
          Verified
        </Badge>
        <Badge
          variant="error"
          interactive
          active={report.status === 'flagged'}
          onClick={() => handleStatusClick('flagged')}
        >
          Flagged
        </Badge>
      </div>
    </div>
  );
}
