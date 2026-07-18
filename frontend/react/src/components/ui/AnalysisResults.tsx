import React, { memo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AnalysisResult } from "../../hooks/useAnalysis";

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="cb-input-error" role="alert" style={{ marginTop: '20px' }}>
      <p>Something went wrong rendering the analysis results:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>
      <button className="cb-attach-btn" onClick={resetErrorBoundary} style={{ marginTop: '10px' }}>Try again</button>
    </div>
  );
}

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export const AnalysisResults = memo(({ result }: AnalysisResultsProps) => {
  const [showMask, setShowMask] = useState(true);
  const [showRaw, setShowRaw] = useState(false);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => { setShowMask(true); }}>
      <div className="cb-report-card nova-reveal nova-in">
        <div className="cb-report-header">
          <h3>Earth Observation Report</h3>
          {result.risk_level && (
            <span className={`cb-risk-badge ${result.risk_level.toLowerCase()}`}>
              RISK: {result.risk_level.toUpperCase()}
            </span>
          )}
        </div>
        <hr className="cb-divider" />

        <div className="cb-report-section">
          <h4 className="cb-section-title">Telemetry & Context</h4>
          <div className="cb-eo-panel">
            <div className="cb-eo-grid">
              <div className="cb-eo-item">
                <span className="cb-eo-label">Scene Type</span>
                <span className="cb-eo-value">{result.scene_type || "Urban / Natural"}</span>
              </div>
              <div className="cb-eo-item">
                <span className="cb-eo-label">Resolution</span>
                <span className="cb-eo-value">{result.width && result.height ? `${result.width}x${result.height}` : "High"}</span>
              </div>
              <div className="cb-eo-item">
                <span className="cb-eo-label">Projection</span>
                <span className="cb-eo-value">{result.geo_metadata?.crs ? String(result.geo_metadata.crs) : "EPSG:4326"}</span>
              </div>
            </div>
            
            <div className="cb-eo-flags">
              {result.flags?.map((f, idx) => (
                <div key={idx} className="cb-eo-match-row">
                  <span>{f.icon} {f.label}</span>
                  <span className="cb-eo-match-score">DETECTED</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {result.mask_image && (
          <div className="cb-report-section">
            <h4 className="cb-section-title">Segmentation Map</h4>
            <div className="cb-report-image-container">
              {/* Note: This assumes previewUrl is accessible or you pass base image as prop. 
                  If base image is not passed, mask is just displayed. */}
              {showMask && <img src={`data:image/png;base64,${result.mask_image}`} alt="Mask Overlay" className="cb-mask-overlay" style={{ opacity: 1, mixBlendMode: 'normal' }} />}
              <button className="cb-mask-toggle" onClick={() => setShowMask(!showMask)}>
                {showMask ? "Hide SegMap" : "Show SegMap"}
              </button>
            </div>
          </div>
        )}

        <div className="cb-report-section">
          <h4 className="cb-section-title">Land Cover Distribution</h4>
          <div className="cb-classes">
            {result.classes?.map((c) => (
              <div className="cb-class-row" key={c.label}>
                <div className="cb-class-label">
                  <div className="cb-swatch" style={{ background: c.color }}></div>
                  <span>{c.label}</span>
                </div>
                <div className="cb-class-bar-track">
                  <div className="cb-class-bar" style={{ width: `${c.pct}%`, background: c.color }}></div>
                </div>
                <div className="cb-class-pct">{c.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        {result.ndvi_score !== undefined && (
          <div className="cb-report-section">
            <h4 className="cb-section-title">Vegetation Index (NDVI)</h4>
            <div className="cb-ndvi-section">
              <div className="cb-ndvi-score">
                <div className="cb-ndvi-val" style={{ color: result.ndvi_score > 0.4 ? '#00e5a0' : result.ndvi_score < 0.1 ? '#ff4e6a' : '#ffb84e' }}>
                  {result.ndvi_score.toFixed(2)}
                </div>
                <div className="cb-ndvi-label">Mean NDVI</div>
              </div>
              {result.ndvi_heatmap && (
                <div style={{ flex: 2 }}>
                  <img src={`data:image/png;base64,${result.ndvi_heatmap}`} alt="NDVI Heatmap" className="cb-chart-img" />
                </div>
              )}
            </div>
          </div>
        )}

        {result.pie_chart && result.bar_chart && (
          <div className="cb-report-section">
            <h4 className="cb-section-title">Statistical Analysis</h4>
            <div className="cb-charts-row">
              <div className="half">
                <img src={`data:image/png;base64,${result.pie_chart}`} alt="Pie Chart" className="cb-chart-img" />
              </div>
              <div className="half">
                <img src={`data:image/png;base64,${result.bar_chart}`} alt="Bar Chart" className="cb-chart-img" />
              </div>
            </div>
          </div>
        )}

        <div className="cb-report-section">
          <h4 className="cb-section-title">Strategic Insights</h4>
          <div className="cb-insights-grid">
            {result.use_cases && (
              <div className="cb-insight-col">
                <h5 className="cb-insight-heading">Potential Use Cases</h5>
                <ul className="cb-insight-list">
                  {result.use_cases.map((uc, i) => (
                    <li key={i}><strong>{uc.name}</strong>: {uc.rationale}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.recommended_actions && (
              <div className="cb-insight-col">
                <h5 className="cb-insight-heading">Recommended Actions</h5>
                <ul className="cb-insight-list">
                  {result.recommended_actions.map((ra, i) => (
                    <li key={i}><strong>{ra.audience}</strong>: {ra.action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="cb-report-section">
          <details className="cb-raw-json">
            <summary onClick={(e) => { e.preventDefault(); setShowRaw(!showRaw); }}>
              {showRaw ? "Hide Raw JSON" : "Show Raw JSON"}
            </summary>
            {showRaw && <pre>{JSON.stringify(result, null, 2)}</pre>}
          </details>
        </div>

      </div>
    </ErrorBoundary>
  );
});

AnalysisResults.displayName = "AnalysisResults";
