import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

/**
 * Kaduna center coordinates and default zoom.
 */
const KADUNA_CENTER = [10.5222, 7.4383];
const DEFAULT_ZOOM = 10;

/**
 * Custom marker icons colored by report status.
 * Uses inline SVG data URIs to avoid external icon dependencies.
 */
const createStatusIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width: 24px; height: 24px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });

const STATUS_ICONS = {
  pending: createStatusIcon('#FF9800'),  // warning-500
  verified: createStatusIcon('#009688'), // success-500
  flagged: createStatusIcon('#D32F2F'),  // error-600
};

/**
 * Inner component to fly to a selected report on the map.
 */
function FlyToReport({ selectedId, reports }) {
  const map = useMap();

  const selected = reports.find((r) => r.id === selectedId);
  if (selected?.latitude && selected?.longitude) {
    map.flyTo([selected.latitude, selected.longitude], 13, { duration: 0.8 });
  }

  return null;
}

/**
 * MapPanel — React Leaflet map centered on Kaduna.
 * Plots report coordinates as color-coded markers.
 * Uses OpenStreetMap tiles (free, no API key).
 *
 * @param {object[]} reports - Filtered reports to plot
 * @param {string|null} selectedReportId - ID of the currently selected report
 * @param {function} onMarkerClick - Called with reportId when a marker is clicked
 */
export default function MapPanel({ reports, selectedReportId, onMarkerClick }) {
  const markers = useMemo(
    () =>
      reports.filter(
        (r) => r.latitude != null && r.longitude != null
      ),
    [reports]
  );

  return (
    <div
      id="map-panel"
      className="bg-kuria-surface border border-kuria-border rounded-kuria-lg shadow-kuria-card overflow-hidden h-full"
    >
      {/* Map Header */}
      <div className="px-4 py-3 border-b border-kuria-border-subtle flex items-center justify-between">
        <h2 className="font-heading text-sm font-semibold text-kuria-text-heading">
          Kaduna Region Map
        </h2>
        <span className="text-xs text-kuria-text-tertiary">
          {markers.length} plotted
        </span>
      </div>

      {/* Map Container */}
      <div className="h-[calc(100%-48px)]">
        <MapContainer
          center={KADUNA_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          className="w-full h-full"
          /* React Leaflet v5 is compatible with React 19.
             If on React 18, pin to react-leaflet@4.2.1 + leaflet@1.9.4. */
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {selectedReportId && (
            <FlyToReport selectedId={selectedReportId} reports={markers} />
          )}

          {markers.map((report) => (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={STATUS_ICONS[report.status] || STATUS_ICONS.pending}
              eventHandlers={{
                click: () => onMarkerClick?.(report.id),
              }}
            >
              <Popup>
                <div className="max-w-[220px]">
                  <p className="text-xs font-semibold text-neutral-800 mb-1">
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    {' · '}
                    {(report.language || '').charAt(0).toUpperCase() + (report.language || '').slice(1)}
                  </p>
                  <p className="text-xs text-neutral-600 line-clamp-3">
                    {report.transcript?.slice(0, 120)}
                    {(report.transcript?.length || 0) > 120 ? '…' : ''}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-1 font-mono">
                    {report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
