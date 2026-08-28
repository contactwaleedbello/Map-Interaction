import ReportCard from './ReportCard';

/**
 * TriageFeed — Scrollable feed of report cards.
 * Renders filtered reports as a vertical list of ReportCard components.
 *
 * @param {object[]} reports - Filtered report data
 * @param {string|null} selectedReportId - Currently selected report
 * @param {function} onSelectReport - Called with reportId
 * @param {function} onStatusChange - Passed down to ReportCard
 * @param {function} onTranscriptSave - Passed down to ReportCard
 */
export default function TriageFeed({
  reports,
  selectedReportId,
  onSelectReport,
  onStatusChange,
  onTranscriptSave,
}) {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="w-16 h-16 flex items-center justify-center rounded-kuria-full bg-kuria-muted mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <p className="text-sm font-medium text-kuria-text-secondary">No reports match filters</p>
        <p className="text-xs text-kuria-text-tertiary mt-1">
          Try adjusting the filter chips above
        </p>
      </div>
    );
  }

  return (
    <div id="triage-feed" className="space-y-4">
      {reports.map((report) => (
        <div
          key={report.id}
          onClick={() => onSelectReport?.(report.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onSelectReport?.(report.id);
          }}
          role="button"
          tabIndex={0}
          className="cursor-pointer"
        >
          <ReportCard
            report={report}
            isSelected={report.id === selectedReportId}
            onStatusChange={onStatusChange}
            onTranscriptSave={onTranscriptSave}
          />
        </div>
      ))}
    </div>
  );
}
