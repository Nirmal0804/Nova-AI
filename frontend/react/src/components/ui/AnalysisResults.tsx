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
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const htmlContent = result.professional_report || "<p>No unified report available.</p>";

  const downloadReport = async () => {
    setIsDownloading(true);
    try {
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `NovaAI_Geospatial_Intelligence_Report_${new Date().toISOString().replace(/[:.]/g, "-")}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Report Download error", err);
      alert("Failed to download HTML report");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {isFullscreen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#0f1115',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.25rem', fontFamily: 'Space Mono, monospace' }}>NovaAI Unified Report</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="cb-attach-btn"
                onClick={downloadReport}
                disabled={isDownloading}
                style={{ height: '36px' }}
              >
                {isDownloading ? "Generating..." : "📄 Download HTML"}
              </button>
              <button
                className="cb-attach-btn"
                style={{ background: '#7f1d1d', borderColor: '#ef4444', color: '#fca5a5', height: '36px' }}
                onClick={() => setIsFullscreen(false)}
              >
                ✕ Close Fullscreen
              </button>
            </div>
          </div>
          <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }}>
            <iframe
              srcDoc={htmlContent}
              style={{ width: '100%', height: '100%', border: 'none', background: '#0f1115' }}
              title="Unified HTML Report Fullscreen"
            />
          </div>
        </div>
      )}

      <div className="cb-report-card nova-reveal nova-in" style={{ padding: "10px", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px', gap: '10px' }}>
          <button
            className="cb-attach-btn"
            onClick={() => setIsFullscreen(true)}
            style={{ fontSize: '13px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            🔍 Toggle Fullscreen
          </button>
          <button
            className="cb-attach-btn"
            onClick={downloadReport}
            disabled={isDownloading}
            style={{ fontSize: '13px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {isDownloading ? "Generating..." : "📄 Download Report (HTML)"}
          </button>
        </div>

        <div style={{ width: '100%', height: '800px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155' }}>
          <iframe
            srcDoc={htmlContent}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Unified HTML Report"
          />
        </div>

        {/* QUICK AI QUESTIONS */}
        <div className="dashboard-section" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <h4 className="cb-section-title" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', margin: '0 0 12px', fontFamily: 'Space Mono, monospace' }}>💬 Quick AI Questions</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {[
              { label: "🌱 Explain the environment", q: "Explain the environment" },
              { label: "🏗 Analyze infrastructure", q: "Analyze infrastructure" },
              { label: "⚠ Assess possible risks", q: "Assess possible risks" },
              { label: "📈 Future land use", q: "Future land use" },
              { label: "🧠 Explain like I'm 10", q: "Explain like I'm 10" }
            ].map((btn, idx) => (
              <button
                key={idx}
                className="cb-attach-btn"
                disabled={insightLoading}
                onClick={() => askInsight(btn.q)}
                style={{ fontSize: '13px', padding: '8px 16px', height: 'auto', display: 'flex', alignItems: 'center' }}
              >
                {btn.label}
              </button>
            ))}
          </div>
          {insightLoading && (
            <div className="cb-insight-loading" style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="cb-dot small pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--aurora)' }} /> Generating Insight...
            </div>
          )}
        </div>

      </div>
    </ErrorBoundary>
  );
});

AnalysisResults.displayName = "AnalysisResults";
