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
  askInsight: (q: string) => void;
  insightLoading: boolean;
}

export const AnalysisResults = memo(({ result, askInsight, insightLoading }: AnalysisResultsProps) => {
  const [showMask, setShowMask] = useState(true);
  const [showRaw, setShowRaw] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPdf = async () => {
    setIsDownloading(true);
    try {
      const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:8000";
      const payload = { analysis: result };
      const res = await fetch(`${API_BASE}/api/report/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to generate PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `NovaAI_Report_${new Date().toISOString().replace(/[:.]/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF Download error", err);
      alert("Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const rawText = result.professional_report || result.gpt_analysis || result.summary || "";

  // Extract bullets securely
  const extractBullets = (text: string) => {
    if (!text) return ["Scene analysis completed successfully."];
    // try capturing explicit bullets
    const bullets = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-') || line.startsWith('*'))
      .map(line => line.replace(/^[-*]\s*/, '').trim())
      .filter(line => line.length > 5);

    if (bullets.length >= 2) {
      return bullets.slice(0, 5).map(b => b.split('.')[0] + '.');
    }

    // Fallback to sentences
    const sentences = text.split(/[.?!]\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 15 && s.length < 150 && !s.includes('#'));

    if (sentences.length > 0) {
      return sentences.slice(0, 5).map(s => s.endsWith('.') ? s : s + '.');
    }

    return ["Observation analysis complete."];
  };

  const findings = extractBullets(rawText);
  const textLower = rawText.toLowerCase();
  const hasKeyword = (words: string[]) => words.some(w => textLower.includes(w));

  const vegStatus = hasKeyword(['dense forest', 'agriculture', 'lush', 'vegetation']) ? 'High' : hasKeyword(['sparse', 'some vegetation', 'grass']) ? 'Medium' : 'Low';
  const urbanStatus = hasKeyword(['residential', 'industrial', 'urban', 'buildings', 'city']) ? 'High' : hasKeyword(['road', 'infrastructure', 'suburban']) ? 'Medium' : 'Low';
  const waterStatus = hasKeyword(['water', 'river', 'lake', 'ocean', 'sea', 'coast', 'pool']) ? 'Detected' : 'Not Detected';
  const indStatus = hasKeyword(['industrial', 'factory', 'manufacturing', 'plant']) ? 'Detected' : 'Not Detected';
  const envRisk = result.risk_level || (hasKeyword(['risk', 'danger', 'hazard', 'pollution', 'flood']) ? 'High' : 'Low');

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => setShowMask(true)}>
      <div className="cb-report-card nova-reveal nova-in">

        <div className="cb-report-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Earth Observation Dashboard</h3>
          <button
            className="cb-attach-btn"
            onClick={downloadPdf}
            disabled={isDownloading}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            {isDownloading ? "Generating..." : "📄 Download PDF"}
          </button>
        </div>
        <hr className="cb-divider" />

        {/* SECTION 1 - AI SUMMARY */}
        <div className="dashboard-section">
          <h4 className="cb-section-title">🛰 AI Summary</h4>
          <div className="dashboard-cards-grid">
            <div className="dash-card">
              <span className="dash-label">Primary Land Cover</span>
              <span className="dash-value highlight">{result.dominant_land_cover || "N/A"}</span>
            </div>
            <div className="dash-card">
              <span className="dash-label">Secondary Land Cover</span>
              <span className="dash-value">{result.secondary_land_cover && result.secondary_land_cover !== "none" ? result.secondary_land_cover : "None"}</span>
            </div>
            <div className="dash-card">
              <span className="dash-label">Confidence</span>
              <span className="dash-value">{(result.confidence == 'High') ? '🟢 High' : (result.confidence == 'Medium' ? '🟡 Medium' : '🔴 Low')}</span>
            </div>
            <div className="dash-card">
              <span className="dash-label">Overall Status</span>
              <span className="dash-value">✅ {envRisk === 'High' ? 'Requires Attention' : 'Stable Urban Area'}</span>
            </div>
          </div>
        </div>

        {/* SECTION 2 - KEY FINDINGS */}
        <div className="dashboard-section">
          <h4 className="cb-section-title">🔍 Key Findings</h4>
          <ul className="dash-bullets">
            {findings.map((f, i) => <li key={i}>✓ {f}</li>)}
          </ul>
        </div>

        {/* SECTION 3 - ENVIRONMENTAL ASSESSMENT */}
        <div className="dashboard-section">
          <h4 className="cb-section-title">🌍 Environmental Assessment</h4>
          <div className="env-badges-grid">
            <div className="env-badge">
              <span className="env-icon">🌱</span>
              <span className="env-name">Vegetation</span>
              <span className={`env-status status-${vegStatus.toLowerCase()}`}>{vegStatus}</span>
            </div>
            <div className="env-badge">
              <span className="env-icon">🏙</span>
              <span className="env-name">Urban Density</span>
              <span className={`env-status status-${urbanStatus.toLowerCase()}`}>{urbanStatus}</span>
            </div>
            <div className="env-badge">
              <span className="env-icon">💧</span>
              <span className="env-name">Water Presence</span>
              <span className={`env-status status-${waterStatus.toLowerCase().replace(' ', '-')}`}>{waterStatus}</span>
            </div>
            <div className="env-badge">
              <span className="env-icon">🏭</span>
              <span className="env-name">Industrial Activity</span>
              <span className={`env-status status-${indStatus.toLowerCase().replace(' ', '-')}`}>{indStatus}</span>
            </div>
            <div className="env-badge">
              <span className="env-icon">⚠</span>
              <span className="env-name">Environmental Risk</span>
              <span className={`env-status status-${envRisk.toLowerCase()}`}>{envRisk}</span>
            </div>
          </div>
        </div>

        {/* SECTION 4 - QUICK AI QUESTIONS */}
        <div className="dashboard-section">
          <h4 className="cb-section-title">💬 Quick AI Questions</h4>
          <div className="cb-insights-grid">
            <button disabled={insightLoading} onClick={() => askInsight("Explain the environment")}>🌱 Explain the environment</button>
            <button disabled={insightLoading} onClick={() => askInsight("Analyze infrastructure")}>🏗 Analyze infrastructure</button>
            <button disabled={insightLoading} onClick={() => askInsight("Assess possible risks")}>⚠ Assess possible risks</button>
            <button disabled={insightLoading} onClick={() => askInsight("Future land use")}>📈 Future land use</button>
            <button disabled={insightLoading} onClick={() => askInsight("Explain like I'm 10")}>🧠 Explain like I'm 10</button>
          </div>
          {insightLoading && <div className="cb-insight-loading"><div className="cb-dot small pulse" /> Generating Insight...</div>}
        </div>

        <hr className="cb-divider" />

        {/* KEEP: Telemetry & Context */}
        <div className="dashboard-section">
          <h4 className="cb-section-title">📡 Telemetry & Context</h4>
          <div className="cb-eo-panel">
            <div className="cb-eo-grid">
              <div className="cb-eo-item">
                <span className="cb-eo-label">Resolution</span>
                <span className="cb-eo-value">High</span>
              </div>
              <div className="cb-eo-item">
                <span className="cb-eo-label">Projection</span>
                <span className="cb-eo-value">EPSG:4326</span>
              </div>
              <div className="cb-eo-item">
                <span className="cb-eo-label">Processing Time</span>
                <span className="cb-eo-value">{result.metadata?.processing_time_ms || 0} ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* KEEP: Mask Image */}
        {result.mask_image && (
          <div className="dashboard-section">
            <h4 className="cb-section-title">🗺 Segmentation Map</h4>
            <div className="cb-report-image-container">
              {showMask && <img src={`data:image/png;base64,${result.mask_image}`} alt="Mask" className="cb-mask-overlay" />}
              <button className="cb-mask-toggle" onClick={() => setShowMask(!showMask)}>
                {showMask ? "Hide SegMap" : "Show SegMap"}
              </button>
            </div>
          </div>
        )}

        {/* KEEP: LC Breakdown Chart if it was previously there, actually the previous one didn't have it locally, but it might be passed via classes */}
        {result.classes && result.classes.length > 0 && (
          <div className="dashboard-section">
            <h4 className="cb-section-title">📊 Land Cover Breakdown</h4>
            <div className="cb-eo-flags">
              {result.classes.map((c, idx) => (
                <div key={idx} className="cb-eo-match-row">
                  <span style={{ color: c.color }}>■ {c.label}</span>
                  <span className="cb-eo-match-score">{c.pct.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="dashboard-section" style={{ marginTop: '20px' }}>
          <details className="cb-raw-json">
            <summary onClick={(e) => { e.preventDefault(); setShowRaw(!showRaw); }}>
              {showRaw ? "Hide Raw Data" : "Show Technical Metadata"}
            </summary>
            {showRaw && <pre>{JSON.stringify(result.metadata || result, null, 2)}</pre>}
          </details>
        </div>

      </div>
    </ErrorBoundary>
  );
});

AnalysisResults.displayName = "AnalysisResults";
