import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/demo")({
  component: NovaDemo,
});

// ---------------------------------------------------------------------------
// Types — this is the contract the real backend (Step 2) needs to satisfy.
// Keep this shape stable and swapping runAnalysis()'s mock body for a real
// `fetch("/api/analyze", ...)` call is the only change needed later.
// ---------------------------------------------------------------------------

interface LandCoverClass {
  label: string;
  pct: number;
  color: string;
}

interface AnalysisResult {
  classes: LandCoverClass[];
  flags: { icon: string; label: string; level: "info" | "warning" | "danger" }[];
  insight: string;
  width?: number;
  height?: number;
  title?: string;
  risk_level?: "Low" | "Medium" | "High";
  use_cases?: { name: string; rationale: string }[];
  recommended_actions?: { audience: string; action: string }[];
  mask_image?: string;
  ndvi_heatmap?: string;
  ndvi_score?: number;
  ndvi_min?: number;
  ndvi_max?: number;
  pie_chart?: string;
  bar_chart?: string;
  geo_metadata?: Record<string, unknown>;
  scene_type?: string;
}

interface CompareResponse {
  result_a: AnalysisResult;
  result_b: AnalysisResult;
  comparison_chart?: string;
  deltas: { label: string; pct_a: number; pct_b: number; delta: number }[];
}

// Backend base URL. Set VITE_API_BASE_URL in .env.local if the FastAPI
// service isn't running on the default port (see backend/README.md).
const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:8000";

const PIPELINE_STAGES = [
  { icon: "📤", title: "Ingestion", desc: "Reading image and metadata" },
  { icon: "⚙️", title: "Preprocessing", desc: "Standardizing image format" },
  { icon: "🧠", title: "Vision Analysis", desc: "Identifying land patterns" },
  { icon: "💬", title: "AI Insight", desc: "Generating expert summaries" },
];

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

function NovaDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [stageIndex, setStageIndex] = useState(-1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [viewMode, setViewMode] = useState<"original" | "mask" | "blend">("original");
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  // Time-series comparison
  const [compareMode, setCompareMode] = useState(false);
  const [fileB, setFileB] = useState<File | null>(null);
  const [previewUrlB, setPreviewUrlB] = useState<string | null>(null);
  const [compareResult, setCompareResult] = useState<CompareResponse | null>(null);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    return () => timers.current.forEach(clearTimeout);
  }, []);

  const handleFile = useCallback((f: File | null) => {
    setError(null);
    if (!f) return;
    
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/tiff"];
    if (!validTypes.includes(f.type)) {
      setError(`Invalid file type. Please upload a PNG, JPG, or TIFF image.`);
      return;
    }
    
    if (f.size > 10 * 1024 * 1024) {
      setError(`File is too large (${(f.size / 1024 / 1024).toFixed(1)}MB). Max size is 10MB.`);
      return;
    }

    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setStatus("idle");
    setResult(null);
    setMessages([]);
    setStageIndex(-1);
    setUploadProgress(0);
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!file) return;
    setStatus("running");
    setResult(null);
    setError(null);
    setStageIndex(0);
    setUploadProgress(0);
    timers.current.forEach(clearTimeout);
    timers.current = [];

    const progressInterval = setInterval(() => {
      setUploadProgress(p => {
        if (p >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return Math.min(p + 12, 100);
      });
    }, 100);
    timers.current.push(progressInterval as any);

    // Advance through the first three stages on a fixed timer for visual
    // pacing; the real network request runs in parallel underneath.
    [1, 2, 3].forEach((i) => {
      const t = setTimeout(() => setStageIndex(i), i * 700);
      timers.current.push(t);
    });
    const minDuration = new Promise((resolve) => {
      const t = setTimeout(resolve, PIPELINE_STAGES.length * 550);
      timers.current.push(t);
    });

    try {
      const formData = new FormData();
      formData.append("image", file);

      const fetchAnalysis = fetch(`${API_BASE}/api/analyze`, { method: "POST", body: formData }).then(
        async (res) => {
          if (!res.ok) {
            const body = await res.json().catch(() => null);
            throw new Error(body?.detail ?? `Analysis failed (${res.status})`);
          }
          return (await res.json()) as AnalysisResult;
        },
      );

      const [data] = await Promise.all([fetchAnalysis, minDuration]);
      setResult(data);
      setStatus("done");
      setMessages([{ role: "assistant", text: data.insight }]);
    } catch (err) {
      setStatus("idle");
      setStageIndex(-1);
      setError(
        err instanceof Error
          ? `${err.message} — is the backend running at ${API_BASE}?`
          : "Something went wrong talking to the backend.",
      );
    }
  }, [file]);

  const sendChat = useCallback(async () => {
    const q = chatInput.trim();
    if (!q || !result) return;
    setChatInput("");
    const userMsg: ChatMessage = { role: "user", text: q };
    setMessages((m) => [...m, userMsg]);

    // Build history from existing messages (exclude the initial insight)
    const history = messages.slice(1).map((m) => ({ role: m.role, text: m.text }));

    try {
      const res = await fetch(`${API_BASE}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, result, history: [...history, { role: "user", text: q }] }),
      });
      if (!res.ok) throw new Error(`Chat request failed (${res.status})`);

      // Stream the response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No readable stream");

      // Add an empty assistant message that we'll append to
      setMessages((m) => [...m, { role: "assistant", text: "" }]);

      let done = false;
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          const text = decoder.decode(value, { stream: true });
          setMessages((m) => {
            const updated = [...m];
            const last = updated[updated.length - 1];
            if (last && last.role === "assistant") {
              updated[updated.length - 1] = { ...last, text: last.text + text };
            }
            return updated;
          });
        }
      }
    } catch {
      setMessages((m) => {
        // If the last message is an empty assistant placeholder, replace it
        const last = m[m.length - 1];
        if (last && last.role === "assistant" && !last.text) {
          return [...m.slice(0, -1), { role: "assistant" as const, text: `Couldn't reach the backend at ${API_BASE} — is it running?` }];
        }
        return [...m, { role: "assistant" as const, text: `Couldn't reach the backend at ${API_BASE} — is it running?` }];
      });
    }
  }, [chatInput, result, messages]);

  return (
    <div className="nd-root">
      <style>{css}</style>

      <nav className="nd-nav">
        <Link to="/" className="nd-logo">
          <div className="nd-dot" />
          NOVA AI
        </Link>
        <Link to="/" className="nd-back">
          ← Back to overview
        </Link>
      </nav>

      <div className="nd-container">
        <div className="nd-head">
          <div className="nd-eyebrow">Interactive Demo</div>
          <h1>Upload a satellite image</h1>
          <p>
            Upload any satellite or aerial image. NOVA AI will analyze the image to identify land-cover
            patterns, then generate expert insights, risk assessments, and recommended actions.
          </p>
        </div>

        <div className="nd-grid">
          {/* Left: upload + preview */}
          <div className="nd-panel">
            <div
              className={`nd-drop ${dragOver ? "drag" : ""} ${previewUrl ? "has-image" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFile(e.dataTransfer.files?.[0] ?? null);
              }}
              onClick={() => document.getElementById("nd-file-input")?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  document.getElementById("nd-file-input")?.click();
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Upload satellite image"
            >
              {previewUrl ? (
                <div className="nd-img-stack">
                  <button 
                    className="nd-remove-btn" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setFile(null); 
                      setPreviewUrl(null); 
                      setResult(null);
                      setStatus("idle");
                      setError(null);
                    }}
                    title="Remove image"
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                  {viewMode === "original" && (
                    <img src={previewUrl} alt="Uploaded satellite scene" />
                  )}
                  {viewMode === "mask" && result?.mask_image && (
                    <img src={`data:image/png;base64,${result.mask_image}`} alt="Segmentation mask" />
                  )}
                  {viewMode === "mask" && !result?.mask_image && (
                    <img src={previewUrl} alt="Uploaded satellite scene" />
                  )}
                  {viewMode === "blend" && (
                    <div className="nd-blend-container">
                      <img src={previewUrl} alt="Original" className="nd-blend-base" />
                      {result?.mask_image && (
                        <img src={`data:image/png;base64,${result.mask_image}`} alt="Mask overlay" className="nd-blend-overlay" style={{ opacity: overlayOpacity / 100 }} />
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="nd-drop-empty">
                  <div className="nd-drop-icon">🛰️</div>
                  <div className="nd-drop-title">Drop a satellite image here</div>
                  <div className="nd-drop-sub">or click to browse · PNG, JPG, TIFF</div>
                </div>
              )}
              <input
                id="nd-file-input"
                type="file"
                accept=".png,.jpg,.jpeg,.tiff,image/png,image/jpeg,image/tiff"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                onClick={(e) => (e.currentTarget.value = "")}
              />
            </div>

            {/* Overlay view toggle */}
            {result?.mask_image && (
              <div className="nd-view-toggle">
                {(["original", "mask", "blend"] as const).map((mode) => (
                  <button
                    key={mode}
                    className={`nd-view-btn ${viewMode === mode ? "active" : ""}`}
                    onClick={(e) => { e.stopPropagation(); setViewMode(mode); }}
                  >
                    {mode === "original" ? "🛰️ Original" : mode === "mask" ? "🎨 Mask" : "🔀 Blend"}
                  </button>
                ))}
              </div>
            )}

            {/* Opacity slider for blend mode */}
            {result?.mask_image && viewMode === "blend" && (
              <div className="nd-opacity-slider">
                <label>Opacity: {overlayOpacity}%</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <button className="nd-btn nd-btn-primary" disabled={!file || status === "running"} onClick={runAnalysis}>
              {status === "running" ? "Analyzing…" : "Run Analysis"}
            </button>

            {file && (
              <div className="nd-filename">
                📎 {file.name} <span>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            )}

            {status === "running" && uploadProgress < 100 && (
              <div className="nd-upload-progress">
                <div className="nd-upload-progress-bar" style={{ width: `${uploadProgress}%` }} />
                <span className="nd-upload-progress-text">{uploadProgress}% Uploaded</span>
              </div>
            )}

            {error && <div className="nd-error">⚠️ {error}</div>}

            {status !== "idle" && (
              <div className="nd-pipeline">
                {PIPELINE_STAGES.map((s, i) => {
                  const stateCls = i < stageIndex ? "done" : i === stageIndex && status === "running" ? "active" : status === "done" ? "done" : "";
                  return (
                    <div key={s.title} className={`nd-stage ${stateCls}`}>
                      <div className="nd-stage-icon">{stateCls === "done" ? "✓" : s.icon}</div>
                      <div>
                        <div className="nd-stage-title">{s.title}</div>
                        <div className="nd-stage-desc">{s.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: results + chat */}
          <div className="nd-panel">
            {!result && status !== "running" && (
              <div className="nd-placeholder">Results will appear here after you run an analysis.</div>
            )}

            {status === "running" && !result && (
              <div className="nd-placeholder">
                <div className="nd-spinner" />
                Running pipeline…
              </div>
            )}

            {result && (
              <>
                {result.title && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                    <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 600 }}>{result.title}</h2>
                    {result.risk_level && (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontFamily: "'Space Mono', monospace",
                          padding: "3px 10px",
                          borderRadius: "6px",
                          fontWeight: 600,
                          background:
                            result.risk_level === "High"
                              ? "rgba(255,78,106,0.15)"
                              : result.risk_level === "Medium"
                                ? "rgba(255,184,78,0.15)"
                                : "rgba(0,229,160,0.15)",
                          color:
                            result.risk_level === "High"
                              ? "#ff4e6a"
                              : result.risk_level === "Medium"
                                ? "#ffb84e"
                                : "#00e5a0",
                          border: `1px solid ${
                            result.risk_level === "High"
                              ? "rgba(255,78,106,0.3)"
                              : result.risk_level === "Medium"
                                ? "rgba(255,184,78,0.3)"
                                : "rgba(0,229,160,0.3)"
                          }`,
                        }}
                      >
                        {result.risk_level} Risk
                      </span>
                    )}
                  </div>
                )}
                <div className="nd-section-title">Land Cover Breakdown</div>
                <div className="nd-classes">
                  {result.classes.map((c) => (
                    <div key={c.label} className="nd-class-row">
                      <div className="nd-class-label">
                        <span className="nd-swatch" style={{ background: c.color }} />
                        {c.label}
                      </div>
                      <div className="nd-class-bar-track">
                        <div className="nd-class-bar" style={{ width: `${c.pct}%`, background: c.color }} />
                      </div>
                      <div className="nd-class-pct">{c.pct}%</div>
                    </div>
                  ))}
                </div>

                <div className="nd-flags">
                  {result.flags.map((f, i) => (
                    <div key={i} className={`nd-flag ${f.level}`}>
                      <span>{f.icon}</span> {f.label}
                    </div>
                  ))}
                </div>

                {/* Scene Type Badge */}
                {result.scene_type && (
                  <div className="nd-scene-badge">
                    🗺️ Scene: <strong>{result.scene_type}</strong>
                  </div>
                )}

                {/* Matplotlib Charts */}
                {(result.pie_chart || result.bar_chart) && (
                  <>
                    <div className="nd-section-title">Analysis Charts (Matplotlib)</div>
                    <div className="nd-charts-row">
                      {result.pie_chart && (
                        <div className="nd-chart-card">
                          <img src={`data:image/png;base64,${result.pie_chart}`} alt="Pie chart" />
                        </div>
                      )}
                      {result.bar_chart && (
                        <div className="nd-chart-card">
                          <img src={`data:image/png;base64,${result.bar_chart}`} alt="Bar chart" />
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* NDVI Vegetation Health */}
                {result.ndvi_score != null && (
                  <>
                    <div className="nd-section-title">Vegetation Health (NDVI)</div>
                    <div className="nd-ndvi-section">
                      <div className="nd-ndvi-score-card">
                        <div className="nd-ndvi-value" style={{
                          color: result.ndvi_score > 0.6 ? '#1a9850' : result.ndvi_score > 0.45 ? '#d9ef8b' : result.ndvi_score > 0.3 ? '#fee08b' : '#d73027'
                        }}>
                          {result.ndvi_score.toFixed(3)}
                        </div>
                        <div className="nd-ndvi-label">
                          {result.ndvi_score > 0.6 ? 'Dense Vegetation' : result.ndvi_score > 0.45 ? 'Moderate' : result.ndvi_score > 0.3 ? 'Sparse' : 'Low / Barren'}
                        </div>
                        <div className="nd-ndvi-range">
                          Range: {result.ndvi_min?.toFixed(3)} – {result.ndvi_max?.toFixed(3)}
                        </div>
                        <div className="nd-ndvi-legend">
                          <div className="nd-legend-bar" />
                          <div className="nd-legend-labels">
                            <span>Barren</span><span>Sparse</span><span>Healthy</span><span>Dense</span>
                          </div>
                        </div>
                      </div>
                      {result.ndvi_heatmap && (
                        <div className="nd-ndvi-heatmap">
                          <img src={`data:image/png;base64,${result.ndvi_heatmap}`} alt="NDVI heatmap" />
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Use Cases */}
                {result.use_cases && result.use_cases.length > 0 && (
                  <>
                    <div className="nd-section-title">Relevant Use Cases</div>
                    <div className="nd-usecases">
                      {result.use_cases.map((uc, i) => (
                        <div key={i} className="nd-usecase-card">
                          <div className="nd-uc-name">{uc.name}</div>
                          <div className="nd-uc-rationale">{uc.rationale}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Recommended Actions */}
                {result.recommended_actions && result.recommended_actions.length > 0 && (
                  <>
                    <div className="nd-section-title">Recommended Actions</div>
                    <div className="nd-actions">
                      {result.recommended_actions.map((ra, i) => (
                        <div key={i} className="nd-action-card">
                          <div className="nd-action-audience">{ra.audience}</div>
                          <div className="nd-action-text">{ra.action}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Download Buttons Row */}
                <div className="nd-export-row">
                  <button
                    className="nd-btn nd-btn-report"
                    disabled={downloadingPdf}
                    onClick={async (e) => {
                      e.preventDefault();
                      setDownloadingPdf(true);
                      try {
                        const res = await fetch(`${API_BASE}/api/report`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ result }),
                        });
                        if (!res.ok) throw new Error(`Report failed`);
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url; a.download = "nova_ai_report.pdf"; a.click();
                        URL.revokeObjectURL(url);
                      } catch { alert("Failed to generate PDF report."); }
                      finally { setDownloadingPdf(false); }
                    }}
                  >
                    {downloadingPdf ? "Generating…" : "📄 PDF Report"}
                  </button>
                  <button
                    className="nd-btn nd-btn-png"
                    disabled={downloadingPng}
                    onClick={async (e) => {
                      e.preventDefault();
                      setDownloadingPng(true);
                      try {
                        const res = await fetch(`${API_BASE}/api/export/png`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ result }),
                        });
                        if (!res.ok) throw new Error(`PNG failed`);
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url; a.download = "nova_ai_summary.png"; a.click();
                        URL.revokeObjectURL(url);
                      } catch { alert("Failed to generate PNG."); }
                      finally { setDownloadingPng(false); }
                    }}
                  >
                    {downloadingPng ? "Generating…" : "📸 PNG Export"}
                  </button>
                </div>

                <div className="nd-section-title">Ask about this image</div>
                <div className="nd-chat">
                  {messages.map((m, i) => (
                    <div key={i} className={`nd-msg ${m.role}`}>
                      {m.text}
                    </div>
                  ))}
                </div>
                <div className="nd-chat-input">
                  <input
                    placeholder="e.g. Is there flood risk here?"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  />
                  <button onClick={sendChat} disabled={!chatInput.trim()}>
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ──────── TIME-SERIES COMPARISON ──────── */}
        <div className="nd-compare-section">
          <div className="nd-section-title" style={{ cursor: "pointer" }} onClick={() => setCompareMode(!compareMode)}>
            {compareMode ? "▼" : "▶"} Time-Series Comparison
          </div>
          {compareMode && (
            <div className="nd-compare-panel">
              <div className="nd-compare-uploads">
                <div className="nd-compare-slot">
                  <div className="nd-compare-label">Image A (Before)</div>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Image A" className="nd-compare-thumb" />
                  ) : (
                    <div className="nd-compare-empty">Upload an image above first</div>
                  )}
                </div>
                <div className="nd-compare-slot">
                  <div className="nd-compare-label">Image B (After)</div>
                  {previewUrlB ? (
                    <img src={previewUrlB} alt="Image B" className="nd-compare-thumb" />
                  ) : (
                    <div
                      className="nd-compare-empty nd-compare-dropzone"
                      onClick={() => document.getElementById("nd-file-b")?.click()}
                    >
                      Click to upload Image B
                    </div>
                  )}
                  <input
                    id="nd-file-b"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      if (f) {
                        setFileB(f);
                        setPreviewUrlB(URL.createObjectURL(f));
                      }
                    }}
                  />
                </div>
              </div>
              <button
                className="nd-btn nd-btn-primary"
                disabled={!file || !fileB || comparing}
                onClick={async () => {
                  if (!file || !fileB) return;
                  setComparing(true);
                  setCompareResult(null);
                  try {
                    const fd = new FormData();
                    fd.append("image_a", file);
                    fd.append("image_b", fileB);
                    const res = await fetch(`${API_BASE}/api/analyze/compare`, {
                      method: "POST",
                      body: fd,
                    });
                    if (!res.ok) throw new Error(`Compare failed (${res.status})`);
                    const data = await res.json();
                    setCompareResult(data);
                  } catch (err: unknown) {
                    alert(`Comparison failed: ${err instanceof Error ? err.message : err}`);
                  } finally {
                    setComparing(false);
                  }
                }}
              >
                {comparing ? "Comparing…" : "Compare Images"}
              </button>

              {compareResult && (
                <div className="nd-compare-results">
                  <div className="nd-section-title">Change Detection</div>
                  <div className="nd-delta-table">
                    <div className="nd-delta-header">
                      <span>Class</span><span>Before</span><span>After</span><span>Change</span>
                    </div>
                    {compareResult.deltas.map((d, i) => (
                      <div key={i} className="nd-delta-row">
                        <span className="nd-delta-label">{d.label}</span>
                        <span>{d.pct_a}%</span>
                        <span>{d.pct_b}%</span>
                        <span className={`nd-delta-val ${d.delta > 0 ? "pos" : d.delta < 0 ? "neg" : ""}`}>
                          {d.delta > 0 ? "↑" : d.delta < 0 ? "↓" : "–"} {Math.abs(d.delta)}%
                        </span>
                      </div>
                    ))}
                  </div>
                  {compareResult.comparison_chart && (
                    <div className="nd-compare-chart">
                      <img src={`data:image/png;base64,${compareResult.comparison_chart}`} alt="Comparison chart" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const css = `
.nd-root {
  --void: #03030a; --deep: #080818; --surface: #0d0d24; --card: #11112e;
  --border: rgba(120, 100, 255, 0.18); --nebula: #6c47ff; --aurora: #00e5c8;
  --star: #f0edff; --muted: rgba(240, 237, 255, 0.55); --dim: rgba(240, 237, 255, 0.28);
  --danger: #ff4e6a; --warning: #ffb84e; --green: #00e5a0;
  background: var(--void); color: var(--star); font-family: 'Space Grotesk', system-ui, sans-serif;
  min-height: 100vh;
}
.nd-root * { box-sizing: border-box; }
.nd-nav {
  position: sticky; top: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between;
  padding: 16px 32px; background: rgba(3,3,10,0.75); backdrop-filter: blur(18px); border-bottom: 1px solid var(--border);
}
.nd-logo { display: flex; align-items: center; gap: 10px; font-family: 'Space Mono', monospace; font-weight: 700; color: var(--aurora); text-decoration: none; letter-spacing: 0.08em; }
.nd-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--aurora); box-shadow: 0 0 12px var(--aurora); }
.nd-back { color: var(--muted); text-decoration: none; font-size: 0.85rem; }
.nd-back:hover { color: var(--star); }

.nd-container { max-width: 1180px; margin: 0 auto; padding: 48px 32px 100px; }
.nd-head { margin-bottom: 36px; }
.nd-eyebrow { font-family: 'Space Mono', monospace; font-size: 0.75rem; color: var(--nebula); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px; }
.nd-head h1 { font-size: 2.2rem; margin: 0 0 10px; font-weight: 600; }
.nd-head p { color: var(--muted); max-width: 640px; margin: 0; line-height: 1.6; }

.nd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
@media (max-width: 880px) { .nd-grid { grid-template-columns: 1fr; } }

.nd-panel { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }

.nd-drop {
  border: 1.5px dashed var(--border); border-radius: 12px; min-height: 260px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: border-color 0.2s, background 0.2s; overflow: hidden; background: rgba(255,255,255,0.02);
}
.nd-drop.drag { border-color: var(--aurora); background: rgba(0,229,200,0.05); }
.nd-drop.has-image { padding: 0; }
.nd-drop img { width: 100%; height: 260px; object-fit: cover; display: block; }
.nd-drop-empty { text-align: center; color: var(--muted); padding: 20px; }
.nd-drop-icon { font-size: 2.2rem; margin-bottom: 10px; }
.nd-drop-title { color: var(--star); font-weight: 500; margin-bottom: 4px; }
.nd-drop-sub { font-size: 0.8rem; color: var(--dim); }

.nd-btn { width: 100%; margin-top: 16px; padding: 12px; border-radius: 10px; border: none; font-family: inherit; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.15s; }
.nd-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.nd-btn-primary { background: linear-gradient(90deg, var(--nebula), var(--aurora)); color: #06060f; }
.nd-btn-primary:not(:disabled):hover { transform: translateY(-1px); }

.nd-filename { margin-top: 12px; font-size: 0.8rem; color: var(--muted); font-family: 'Space Mono', monospace; }
.nd-filename span { color: var(--dim); }
.nd-error { margin-top: 12px; padding: 10px 12px; border-radius: 8px; font-size: 0.82rem; border: 1px solid rgba(255,78,106,0.4); background: rgba(255,78,106,0.08); color: #ffb3c0; }

.nd-upload-progress { margin-top: 12px; background: rgba(255,255,255,0.05); border-radius: 6px; height: 16px; position: relative; overflow: hidden; border: 1px solid var(--border); }
.nd-upload-progress-bar { height: 100%; background: linear-gradient(90deg, var(--nebula), var(--aurora)); transition: width 0.15s ease-out; }
.nd-upload-progress-text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-family: 'Space Mono', monospace; color: white; font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }

.nd-remove-btn { position: absolute; top: 10px; right: 10px; width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,0.6); color: white; border: 1px solid rgba(255,255,255,0.2); font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; backdrop-filter: blur(4px); transition: all 0.2s; }
.nd-remove-btn:hover { background: rgba(255,78,106,0.8); border-color: #ff4e6a; transform: scale(1.1); }
.nd-drop:focus-visible { outline: 2px solid var(--aurora); outline-offset: 4px; }

.nd-pipeline { margin-top: 24px; display: flex; flex-direction: column; gap: 10px; }
.nd-stage { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--border); opacity: 0.4; transition: opacity 0.3s, border-color 0.3s; }
.nd-stage.active { opacity: 1; border-color: var(--nebula); background: rgba(108,71,255,0.08); }
.nd-stage.done { opacity: 0.85; border-color: var(--aurora); }
.nd-stage-icon { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); flex-shrink: 0; }
.nd-stage.done .nd-stage-icon { background: var(--aurora); color: #06060f; }
.nd-stage-title { font-size: 0.85rem; font-weight: 600; }
.nd-stage-desc { font-size: 0.72rem; color: var(--dim); }

.nd-placeholder { min-height: 340px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; color: var(--dim); text-align: center; font-size: 0.9rem; }
.nd-spinner { width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid var(--border); border-top-color: var(--aurora); animation: nd-spin 0.8s linear infinite; }
@keyframes nd-spin { to { transform: rotate(360deg); } }

.nd-section-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin: 4px 0 14px; font-family: 'Space Mono', monospace; }
.nd-classes { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }
.nd-class-row { display: grid; grid-template-columns: 140px 1fr 44px; align-items: center; gap: 10px; font-size: 0.82rem; }
.nd-class-label { display: flex; align-items: center; gap: 8px; color: var(--star); }
.nd-swatch { width: 9px; height: 9px; border-radius: 2px; flex-shrink: 0; }
.nd-class-bar-track { height: 8px; border-radius: 6px; background: rgba(255,255,255,0.06); overflow: hidden; }
.nd-class-bar { height: 100%; border-radius: 6px; transition: width 0.5s ease; }
.nd-class-pct { text-align: right; color: var(--muted); font-family: 'Space Mono', monospace; font-size: 0.78rem; }

.nd-flags { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
.nd-flag { font-size: 0.82rem; padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border); display: flex; align-items: center; gap: 8px; }
.nd-flag.danger { border-color: rgba(255,78,106,0.4); background: rgba(255,78,106,0.08); color: #ffb3c0; }
.nd-flag.warning { border-color: rgba(255,184,78,0.4); background: rgba(255,184,78,0.08); color: #ffd699; }
.nd-flag.info { border-color: rgba(0,229,200,0.3); background: rgba(0,229,200,0.06); color: var(--star); }

.nd-chat { display: flex; flex-direction: column; gap: 10px; max-height: 220px; overflow-y: auto; margin-bottom: 12px; padding-right: 4px; }
.nd-msg { font-size: 0.85rem; line-height: 1.5; padding: 10px 12px; border-radius: 10px; max-width: 92%; }
.nd-msg.assistant { background: var(--card); border: 1px solid var(--border); align-self: flex-start; }
.nd-msg.user { background: rgba(108,71,255,0.18); align-self: flex-end; margin-left: auto; }
.nd-chat-input { display: flex; gap: 8px; }
.nd-chat-input input { flex: 1; background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; color: var(--star); font-family: inherit; font-size: 0.85rem; }
.nd-chat-input input:focus { outline: none; border-color: var(--nebula); }
.nd-chat-input button { padding: 10px 16px; border-radius: 8px; border: none; background: var(--aurora); color: #06060f; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
.nd-chat-input button:disabled { opacity: 0.4; cursor: not-allowed; }

.nd-usecases { display: flex; gap: 10px; margin-bottom: 18px; }
.nd-usecase-card { flex: 1; padding: 12px 14px; border-radius: 10px; border: 1px solid rgba(0,229,200,0.2); background: rgba(0,229,200,0.04); }
.nd-uc-name { font-size: 0.82rem; font-weight: 600; color: var(--aurora); margin-bottom: 4px; }
.nd-uc-rationale { font-size: 0.78rem; color: var(--muted); line-height: 1.45; }

.nd-actions { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
.nd-action-card { display: flex; align-items: baseline; gap: 10px; padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(108,71,255,0.2); background: rgba(108,71,255,0.04); }
.nd-action-audience { font-size: 0.72rem; font-family: 'Space Mono', monospace; font-weight: 600; color: var(--nebula); white-space: nowrap; min-width: 100px; }
.nd-action-text { font-size: 0.82rem; color: var(--muted); line-height: 1.45; }

.nd-view-toggle { display: flex; gap: 6px; margin-top: 10px; }
.nd-view-btn { flex: 1; padding: 8px 0; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--muted); font-family: inherit; font-size: 0.78rem; font-weight: 500; cursor: pointer; transition: all 0.2s; text-align: center; }
.nd-view-btn.active { border-color: var(--aurora); background: rgba(0,229,200,0.1); color: var(--aurora); font-weight: 600; }
.nd-view-btn:hover:not(.active) { border-color: rgba(0,229,200,0.4); color: var(--star); }

.nd-img-stack { width: 100%; height: 260px; position: relative; }
.nd-img-stack img { width: 100%; height: 260px; object-fit: cover; display: block; }
.nd-blend-container { width: 100%; height: 260px; position: relative; }
.nd-blend-base { width: 100%; height: 260px; object-fit: cover; display: block; }
.nd-blend-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 260px; object-fit: cover; mix-blend-mode: screen; }

.nd-opacity-slider { display: flex; align-items: center; gap: 10px; margin-top: 6px; padding: 0 4px; }
.nd-opacity-slider label { font-size: 0.72rem; color: var(--muted); font-family: 'Space Mono', monospace; white-space: nowrap; }
.nd-opacity-slider input[type=range] { flex: 1; accent-color: var(--aurora); height: 4px; }

.nd-scene-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(0,229,200,0.2); background: rgba(0,229,200,0.05); font-size: 0.82rem; color: var(--aurora); margin-bottom: 14px; }

.nd-charts-row { display: flex; gap: 12px; margin-bottom: 18px; }
.nd-chart-card { flex: 1; border-radius: 10px; overflow: hidden; border: 1px solid var(--border); background: var(--card); }
.nd-chart-card img { width: 100%; display: block; }

.nd-ndvi-section { display: flex; gap: 12px; margin-bottom: 18px; }
.nd-ndvi-score-card { flex: 1; padding: 14px; border-radius: 10px; border: 1px solid rgba(26,152,80,0.25); background: rgba(26,152,80,0.05); display: flex; flex-direction: column; gap: 6px; }
.nd-ndvi-value { font-size: 1.8rem; font-weight: 700; font-family: 'Space Mono', monospace; line-height: 1; }
.nd-ndvi-label { font-size: 0.82rem; font-weight: 600; color: var(--star); }
.nd-ndvi-range { font-size: 0.72rem; color: var(--dim); font-family: 'Space Mono', monospace; }
.nd-ndvi-legend { margin-top: 6px; }
.nd-legend-bar { height: 8px; border-radius: 4px; background: linear-gradient(90deg, #d73027, #fc8d59, #fee08b, #d9ef8b, #1a9850); }
.nd-legend-labels { display: flex; justify-content: space-between; font-size: 0.65rem; color: var(--dim); margin-top: 3px; }
.nd-ndvi-heatmap { flex: 1; border-radius: 10px; overflow: hidden; border: 1px solid rgba(26,152,80,0.2); }
.nd-ndvi-heatmap img { width: 100%; height: 100%; object-fit: cover; display: block; }

.nd-export-row { display: flex; gap: 10px; margin-bottom: 18px; }
.nd-btn-report { flex: 1; background: rgba(108,71,255,0.12); border: 1px solid rgba(108,71,255,0.3); color: var(--star); }
.nd-btn-report:not(:disabled):hover { background: rgba(108,71,255,0.22); transform: translateY(-1px); }
.nd-btn-png { flex: 1; background: rgba(0,229,200,0.08); border: 1px solid rgba(0,229,200,0.25); color: var(--star); }
.nd-btn-png:not(:disabled):hover { background: rgba(0,229,200,0.18); transform: translateY(-1px); }

.nd-compare-section { margin-top: 32px; padding: 24px; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; }
.nd-compare-panel { margin-top: 14px; }
.nd-compare-uploads { display: flex; gap: 16px; margin-bottom: 16px; }
.nd-compare-slot { flex: 1; }
.nd-compare-label { font-size: 0.75rem; font-family: 'Space Mono', monospace; color: var(--muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.06em; }
.nd-compare-thumb { width: 100%; height: 140px; object-fit: cover; border-radius: 10px; border: 1px solid var(--border); }
.nd-compare-empty { width: 100%; height: 140px; border-radius: 10px; border: 1.5px dashed var(--border); display: flex; align-items: center; justify-content: center; color: var(--dim); font-size: 0.82rem; }
.nd-compare-dropzone { cursor: pointer; transition: border-color 0.2s; }
.nd-compare-dropzone:hover { border-color: var(--aurora); color: var(--aurora); }
.nd-compare-results { margin-top: 20px; }
.nd-delta-table { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-bottom: 14px; }
.nd-delta-header { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; padding: 8px 14px; background: var(--card); font-size: 0.72rem; font-family: 'Space Mono', monospace; color: var(--muted); text-transform: uppercase; }
.nd-delta-row { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; padding: 8px 14px; border-top: 1px solid var(--border); font-size: 0.82rem; }
.nd-delta-label { color: var(--star); font-weight: 500; }
.nd-delta-val { font-weight: 600; font-family: 'Space Mono', monospace; }
.nd-delta-val.pos { color: #00e5a0; }
.nd-delta-val.neg { color: #ff4e6a; }
.nd-compare-chart { border-radius: 10px; overflow: hidden; border: 1px solid var(--border); }
.nd-compare-chart img { width: 100%; display: block; }
`;
