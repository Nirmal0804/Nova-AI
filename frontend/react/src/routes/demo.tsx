import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/demo")({
  component: NovaDemo,
});

// ---------------------------------------------------------------------------
// Types
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

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:8000";

const PIPELINE_STAGES = [
  { icon: "📤", title: "Uploading Image...", desc: "Transferring file to secure server" },
  { icon: "🛰️", title: "Running RemoteCLIP...", desc: "Extracting vision features" },
  { icon: "🌍", title: "Interpreting EO Context...", desc: "Mapping land cover & vegetation" },
  { icon: "💬", title: "Generating GPT Response...", desc: "Synthesizing AI insights" },
];

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  isReport?: boolean;
}

function NovaDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [stageIndex, setStageIndex] = useState(-1);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status, stageIndex]);

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
      setError(`File is too large. Max size is 10MB.`);
      return;
    }

    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }, []);

  const runAnalysis = useCallback(async (prompt: string) => {
    if (!file || !prompt.trim()) return;
    
    // Set up chat state
    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setChatInput("");
    setStatus("running");
    setResult(null);
    setError(null);
    setStageIndex(0);
    timers.current.forEach(clearTimeout);
    timers.current = [];

    // Advance through the first three stages on a faster fixed timer
    [1, 2, 3].forEach((i) => {
      const t = setTimeout(() => setStageIndex(i), i * 350);
      timers.current.push(t);
    });
    const minDuration = new Promise((resolve) => {
      const t = setTimeout(resolve, PIPELINE_STAGES.length * 350);
      timers.current.push(t);
    });

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("question", prompt);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

      const fetchAnalysis = fetch(`${API_BASE}/api/analyze`, { 
        method: "POST", 
        body: formData,
        signal: controller.signal
      }).then(
        async (res) => {
          clearTimeout(timeoutId);
          if (!res.ok) {
            if (res.status === 413) throw new Error("Image too large for the backend to process.");
            if (res.status === 415) throw new Error("Unsupported image format.");
            if (res.status === 400 || res.status === 422) throw new Error("Invalid image or request.");
            if (res.status >= 500) throw new Error("The backend encountered an unexpected error.");
            throw new Error(`Analysis failed due to an unknown error (${res.status}).`);
          }
          return (await res.json()) as AnalysisResult;
        }
      ).catch(err => {
        clearTimeout(timeoutId);
        throw err;
      });

      const [data] = await Promise.all([fetchAnalysis, minDuration]);
      setResult(data);
      setStatus("done");
      
      // Inject the rich report as an assistant message
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.insight, isReport: true }
      ]);
      // Clear file selection after analyzing so next prompt just chats unless a new file is added
      setFile(null);
      setPreviewUrl(null);
      
    } catch (err: any) {
      setStatus("idle");
      setStageIndex(-1);
      
      let friendlyMsg = "Something went wrong while analyzing the image.";
      if (err.name === "AbortError") friendlyMsg = "The request timed out. The server took too long to respond.";
      else if (err instanceof TypeError) friendlyMsg = "Network failure. Could not connect to the backend server.";
      else if (err instanceof Error) friendlyMsg = err.message;
      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `⚠️ Error: ${friendlyMsg}` }
      ]);
      setError(friendlyMsg);
    }
  }, [file]);

  const sendChat = useCallback(async (prompt: string) => {
    if (!prompt.trim() || !result) return;
    
    setMessages((m) => [...m, { role: "user", text: prompt }]);
    setChatInput("");
    
    // Exclude the initial rich report from standard text history for the stream
    const history = messages.filter(m => !m.isReport).map((m) => ({ role: m.role, text: m.text }));

    try {
      const res = await fetch(`${API_BASE}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt, result, history: [...history, { role: "user", text: prompt }] }),
      });
      if (!res.ok) throw new Error(`Chat request failed (${res.status})`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No readable stream");

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
        const last = m[m.length - 1];
        if (last && last.role === "assistant" && !last.text) {
          return [...m.slice(0, -1), { role: "assistant" as const, text: `Couldn't reach the backend at ${API_BASE} — is it running?` }];
        }
        return [...m, { role: "assistant" as const, text: `Couldn't reach the backend at ${API_BASE} — is it running?` }];
      });
    }
  }, [result, messages]);

  const handleSubmit = () => {
    const prompt = chatInput.trim();
    if (!prompt) return;
    if (file && status !== "running") {
      runAnalysis(prompt);
    } else if (result && status !== "running") {
      sendChat(prompt);
    }
  };

  const setSuggestion = (q: string) => {
    setChatInput(q);
    const el = document.getElementById("chat-input-textarea");
    if (el) el.focus();
  };

  return (
    <div className="cb-root">
      <style>{css}</style>
      <div id="stars"></div>

      <div className="cb-layout">
        {/* SIDEBAR */}
        <aside className="cb-sidebar">
          <div className="cb-sidebar-top">
            <button className="cb-sidebar-btn active" title="New Chat">✨</button>
            <button className="cb-sidebar-btn" title="History">📜</button>
            <button className="cb-sidebar-btn" title="Saved Reports">📁</button>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="cb-main">
          {/* HEADER */}
          <header className="cb-header">
            <Link to="/" className="cb-logo-text">
              <div className="cb-dot" />
              NOVA AI
            </Link>
          </header>

          <div className="cb-chat-container">
            {messages.length === 0 ? (
              <div className="cb-welcome">
                <div className="cb-hero-orb orb1"></div>
                <div className="cb-hero-orb orb2"></div>
                <h2>Hey! NOVA User</h2>
                <h1>What can I help you analyze?</h1>
                
                <div className="cb-suggestions">
                  <button onClick={() => setSuggestion("Identify flood risks and map water boundaries.")}>
                    <span className="sg-icon">🌊</span>
                    <div className="sg-text">
                      <h4>Flood Risk</h4>
                      <p>Analyze water boundaries</p>
                    </div>
                  </button>
                  <button onClick={() => setSuggestion("Map the land cover and segment urban areas.")}>
                    <span className="sg-icon">🏙️</span>
                    <div className="sg-text">
                      <h4>Land Cover</h4>
                      <p>Segment vegetation & urban</p>
                    </div>
                  </button>
                  <button onClick={() => setSuggestion("Assess crop health using NDVI analysis.")}>
                    <span className="sg-icon">🌾</span>
                    <div className="sg-text">
                      <h4>Crop Health</h4>
                      <p>Generate NDVI insights</p>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="cb-chat-history">
                {messages.map((m, i) => (
                  <div key={i} className={`cb-msg-wrapper ${m.role}`}>
                    {m.role === "assistant" && (
                       <div className="cb-msg-avatar">
                         <div className="cb-dot small" />
                       </div>
                    )}
                    <div className={`cb-msg-bubble ${m.role} ${m.isReport ? "is-report" : ""}`}>
                      <div className="cb-msg-text">{m.text}</div>
                      
                      {/* Rich Report Render */}
                      {m.isReport && result && (
                        <div className="cb-report-card">
                          <hr className="cb-divider" />
                          {result.title && (
                            <div className="cb-report-header">
                              <h3>{result.title}</h3>
                              {result.risk_level && (
                                <span className={`cb-risk-badge ${result.risk_level.toLowerCase()}`}>
                                  {result.risk_level} Risk
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Land Cover Classes */}
                          {result.classes && result.classes.length > 0 && (
                            <div className="cb-report-section">
                              <h4 className="cb-section-title">Land Cover Breakdown</h4>
                              <div className="cb-classes">
                                {result.classes.map((c) => (
                                  <div key={c.label} className="cb-class-row">
                                    <div className="cb-class-label">
                                      <span className="cb-swatch" style={{ background: c.color }} />
                                      {c.label}
                                    </div>
                                    <div className="cb-class-bar-track">
                                      <div className="cb-class-bar" style={{ width: `${c.pct}%`, background: c.color }} />
                                    </div>
                                    <div className="cb-class-pct">{c.pct}%</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* NDVI */}
                          {result.ndvi_score != null && (
                            <div className="cb-report-section">
                              <h4 className="cb-section-title">Vegetation Health (NDVI)</h4>
                              <div className="cb-ndvi-section">
                                <div className="cb-ndvi-score">
                                  <div className="cb-ndvi-val" style={{ color: result.ndvi_score > 0.6 ? '#1a9850' : result.ndvi_score > 0.45 ? '#d9ef8b' : result.ndvi_score > 0.3 ? '#fee08b' : '#d73027' }}>
                                    {result.ndvi_score.toFixed(3)}
                                  </div>
                                  <div className="cb-ndvi-label">
                                    {result.ndvi_score > 0.6 ? 'Dense Vegetation' : result.ndvi_score > 0.45 ? 'Moderate' : result.ndvi_score > 0.3 ? 'Sparse' : 'Low / Barren'}
                                  </div>
                                </div>
                                {result.ndvi_heatmap && (
                                  <img src={`data:image/png;base64,${result.ndvi_heatmap}`} alt="NDVI heatmap" className="cb-chart-img" />
                                )}
                              </div>
                            </div>
                          )}

                          {/* Matplotlib Charts */}
                          {(result.pie_chart || result.bar_chart) && (
                            <div className="cb-report-section">
                              <h4 className="cb-section-title">Statistical Charts</h4>
                              <div className="cb-charts-row">
                                {result.pie_chart && <img src={`data:image/png;base64,${result.pie_chart}`} alt="Pie chart" className="cb-chart-img half" />}
                                {result.bar_chart && <img src={`data:image/png;base64,${result.bar_chart}`} alt="Bar chart" className="cb-chart-img half" />}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading State */}
                {status === "running" && (
                  <div className="cb-msg-wrapper assistant">
                    <div className="cb-msg-avatar"><div className="cb-dot small pulse" /></div>
                    <div className="cb-msg-bubble assistant loading">
                      <div className="cb-pipeline">
                         {PIPELINE_STAGES.map((s, i) => {
                           const stateCls = i < stageIndex ? "done" : i === stageIndex ? "active" : "";
                           return (
                             <div key={s.title} className={`cb-stage ${stateCls}`}>
                               <span className="cb-stage-icon">{stateCls === "done" ? "✓" : s.icon}</span>
                               <span>{s.title}</span>
                             </div>
                           )
                         })}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* INPUT AREA */}
          <div className="cb-input-area">
            {previewUrl && (
              <div className="cb-attachment-preview">
                <img src={previewUrl} alt="Attachment" />
                <div className="cb-attachment-info">
                  <span className="cb-attachment-name">{file?.name}</span>
                  <span className="cb-attachment-size">{((file?.size || 0) / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <button className="cb-attachment-remove" onClick={() => { setFile(null); setPreviewUrl(null); }}>✕</button>
              </div>
            )}
            {error && <div className="cb-input-error">⚠️ {error}</div>}
            
            <div className="cb-input-box">
              <button 
                className="cb-attach-btn" 
                title="Attach satellite image"
                onClick={() => document.getElementById("cb-file-input")?.click()}
              >
                📎 <span className="cb-attach-text">Attach image</span>
              </button>
              <input
                id="cb-file-input"
                type="file"
                accept=".png,.jpg,.jpeg,.tiff,image/png,image/jpeg,image/tiff"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                onClick={(e) => (e.currentTarget.value = "")}
              />
              <textarea 
                id="chat-input-textarea"
                placeholder="Ask me anything..."
                value={chatInput}
                onChange={e => {
                  setChatInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                rows={1}
                disabled={status === "running"}
              />
              <button 
                className="cb-submit-btn" 
                disabled={(!chatInput.trim() && !file) || status === "running"}
                onClick={handleSubmit}
              >
                ↑
              </button>
            </div>
            <div className="cb-footer-text">
              NOVA AI can make mistakes. Verify critical intelligence.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const css = `
.cb-root {
  --void: #03030a; --deep: #080818; --surface: #0d0d24; --card: #11112e;
  --border: rgba(120, 100, 255, 0.18); --nebula: #6c47ff; --aurora: #00e5c8;
  --star: #f0edff; --muted: rgba(240, 237, 255, 0.55); --dim: rgba(240, 237, 255, 0.28);
  background: var(--void); color: var(--star); font-family: 'Space Grotesk', system-ui, sans-serif;
  height: 100vh; display: flex; flex-direction: column; overflow: hidden;
}
.cb-root * { box-sizing: border-box; }

#stars { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(ellipse 80% 60% at 50% 0%, #1a0a3a 0%, var(--void) 70%); }

.cb-layout { display: flex; height: 100%; z-index: 1; position: relative; }

/* SIDEBAR */
.cb-sidebar {
  width: 68px; background: rgba(3,3,10,0.8); backdrop-filter: blur(12px); border-right: 1px solid var(--border);
  display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 20px 0;
}
.cb-sidebar-top, .cb-sidebar-bottom { display: flex; flex-direction: column; gap: 16px; align-items: center; }
.cb-logo-icon { width: 40px; height: 40px; border-radius: 12px; background: rgba(0,229,200,0.1); border: 1px solid rgba(0,229,200,0.3); display: flex; align-items: center; justify-content: center; text-decoration: none; margin-bottom: 10px; }
.cb-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--aurora); box-shadow: 0 0 12px var(--aurora); }
.cb-dot.small { width: 6px; height: 6px; }
.cb-dot.pulse { animation: pulse 1.5s infinite alternate; }
@keyframes pulse { from { opacity: 1; transform: scale(1); } to { opacity: 0.4; transform: scale(0.8); } }

.cb-sidebar-btn { width: 40px; height: 40px; border-radius: 10px; border: none; background: transparent; color: var(--muted); font-size: 1.1rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.cb-sidebar-btn:hover { background: rgba(255,255,255,0.05); color: var(--star); }
.cb-sidebar-btn.active { background: rgba(108,71,255,0.15); color: var(--aurora); }

/* MAIN AREA */
.cb-main { flex: 1; display: flex; flex-direction: column; height: 100%; position: relative; }
.cb-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; }
.cb-logo-text { font-family: 'Space Mono', monospace; font-size: 1.1rem; font-weight: 700; color: var(--aurora); letter-spacing: 0.08em; display: flex; align-items: center; gap: 10px; text-decoration: none; }

.cb-chat-container { flex: 1; overflow-y: auto; display: flex; flex-direction: column; padding: 0 24px; }

/* WELCOME SCREEN */
.cb-welcome { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; position: relative; }
.cb-hero-orb { position: absolute; border-radius: 50%; filter: blur(100px); pointer-events: none; z-index: -1; }
.cb-welcome .orb1 { width: 500px; height: 500px; top: -100px; background: rgba(108, 71, 255, 0.12); }
.cb-welcome .orb2 { width: 300px; height: 300px; bottom: 100px; background: rgba(0, 229, 200, 0.08); }
.cb-welcome h2 { font-size: 1.8rem; font-weight: 400; color: var(--star); margin: 0; }
.cb-welcome h1 { font-size: 2.2rem; font-weight: 600; color: var(--star); margin: 5px 0 40px; }

.cb-suggestions { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; max-width: 800px; }
.cb-suggestions button { display: flex; align-items: flex-start; gap: 12px; background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 16px; width: 240px; text-align: left; cursor: pointer; transition: all 0.2s; }
.cb-suggestions button:hover { background: rgba(108,71,255,0.1); border-color: rgba(108,71,255,0.4); transform: translateY(-2px); }
.sg-icon { font-size: 1.4rem; padding: 8px; background: rgba(0,229,200,0.1); border-radius: 10px; }
.sg-text h4 { margin: 0 0 4px; font-size: 0.9rem; color: var(--star); font-weight: 600; }
.sg-text p { margin: 0; font-size: 0.75rem; color: var(--muted); }

/* CHAT HISTORY */
.cb-chat-history { max-width: 800px; width: 100%; margin: 0 auto; padding: 20px 0 40px; display: flex; flex-direction: column; gap: 24px; }
.cb-msg-wrapper { display: flex; gap: 16px; align-items: flex-start; }
.cb-msg-wrapper.user { justify-content: flex-end; }
.cb-msg-avatar { width: 28px; height: 28px; border-radius: 8px; background: rgba(0,229,200,0.1); border: 1px solid rgba(0,229,200,0.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 4px; }
.cb-msg-bubble { padding: 12px 18px; border-radius: 16px; font-size: 0.95rem; line-height: 1.6; max-width: 85%; }
.cb-msg-bubble.user { background: rgba(255,255,255,0.06); color: var(--star); border-bottom-right-radius: 4px; }
.cb-msg-bubble.assistant { background: transparent; color: var(--star); padding: 4px 0; max-width: 100%; }
.cb-msg-text { white-space: pre-wrap; }

/* PIPELINE (LOADING) */
.cb-pipeline { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
.cb-stage { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: var(--dim); font-family: 'Space Mono', monospace; transition: all 0.3s; }
.cb-stage.active { color: var(--aurora); }
.cb-stage.done { color: var(--muted); }
.cb-stage-icon { display: inline-block; width: 20px; text-align: center; }

/* RICH REPORT CARD */
.cb-report-card { margin-top: 20px; background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.cb-divider { border: none; height: 1px; background: var(--border); margin: 0 0 20px; }
.cb-report-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.cb-report-header h3 { margin: 0; font-size: 1.2rem; font-weight: 600; color: var(--aurora); }
.cb-risk-badge { font-size: 0.75rem; font-family: 'Space Mono', monospace; padding: 4px 10px; border-radius: 6px; font-weight: 600; }
.cb-risk-badge.high { background: rgba(255,78,106,0.15); color: #ff4e6a; border: 1px solid rgba(255,78,106,0.3); }
.cb-risk-badge.medium { background: rgba(255,184,78,0.15); color: #ffb84e; border: 1px solid rgba(255,184,78,0.3); }
.cb-risk-badge.low { background: rgba(0,229,160,0.15); color: #00e5a0; border: 1px solid rgba(0,229,160,0.3); }

.cb-report-section { margin-bottom: 24px; }
.cb-report-section:last-child { margin-bottom: 0; }
.cb-section-title { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); margin: 0 0 12px; font-family: 'Space Mono', monospace; }

.cb-classes { display: flex; flex-direction: column; gap: 8px; }
.cb-class-row { display: grid; grid-template-columns: 140px 1fr 50px; align-items: center; gap: 12px; font-size: 0.85rem; }
.cb-class-label { display: flex; align-items: center; gap: 8px; color: var(--star); }
.cb-swatch { width: 10px; height: 10px; border-radius: 2px; }
.cb-class-bar-track { height: 8px; border-radius: 4px; background: rgba(255,255,255,0.05); }
.cb-class-bar { height: 100%; border-radius: 4px; }
.cb-class-pct { font-family: 'Space Mono', monospace; color: var(--muted); text-align: right; }

.cb-ndvi-section { display: flex; gap: 16px; align-items: center; }
.cb-ndvi-score { flex: 1; background: rgba(26,152,80,0.1); border: 1px solid rgba(26,152,80,0.3); padding: 16px; border-radius: 12px; text-align: center; }
.cb-ndvi-val { font-size: 2rem; font-weight: 700; font-family: 'Space Mono', monospace; line-height: 1; margin-bottom: 4px; }
.cb-ndvi-label { font-size: 0.85rem; font-weight: 500; color: var(--star); }
.cb-chart-img { max-width: 100%; border-radius: 8px; border: 1px solid var(--border); }
.cb-charts-row { display: flex; gap: 12px; }
.cb-charts-row .half { flex: 1; min-width: 0; }

/* INPUT AREA */
.cb-input-area { max-width: 800px; width: 100%; margin: 0 auto; padding: 0 20px 20px; display: flex; flex-direction: column; gap: 8px; }
.cb-input-error { background: rgba(255,78,106,0.1); border: 1px solid rgba(255,78,106,0.3); color: #ffb3c0; padding: 8px 12px; border-radius: 8px; font-size: 0.85rem; }
.cb-attachment-preview { display: flex; align-items: center; gap: 12px; background: var(--card); border: 1px solid var(--border); padding: 8px; border-radius: 12px; width: max-content; max-width: 100%; }
.cb-attachment-preview img { width: 40px; height: 40px; border-radius: 6px; object-fit: cover; }
.cb-attachment-info { display: flex; flex-direction: column; }
.cb-attachment-name { font-size: 0.8rem; font-weight: 500; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cb-attachment-size { font-size: 0.7rem; color: var(--dim); }
.cb-attachment-remove { background: transparent; border: none; color: var(--muted); cursor: pointer; padding: 4px 8px; font-size: 1rem; }
.cb-attachment-remove:hover { color: var(--star); }

.cb-input-box { background: var(--surface); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; display: flex; align-items: flex-end; padding: 8px; gap: 8px; transition: border-color 0.2s; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
.cb-input-box:focus-within { border-color: rgba(0,229,200,0.4); }
.cb-attach-btn { background: rgba(255,255,255,0.05); border: none; color: var(--star); border-radius: 20px; padding: 10px 14px; font-size: 0.85rem; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: background 0.2s; height: 40px; flex-shrink: 0; }
.cb-attach-btn:hover { background: rgba(255,255,255,0.1); }
.cb-input-box textarea { flex: 1; background: transparent; border: none; color: var(--star); font-family: inherit; font-size: 0.95rem; line-height: 1.5; resize: none; padding: 8px; max-height: 150px; outline: none; margin-bottom: 2px; }
.cb-submit-btn { width: 36px; height: 36px; border-radius: 50%; border: none; background: var(--aurora); color: #000; font-size: 1.2rem; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: opacity 0.2s, transform 0.1s; flex-shrink: 0; margin-bottom: 2px; }
.cb-submit-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.cb-submit-btn:not(:disabled):hover { transform: scale(1.05); }

.cb-footer-text { text-align: center; font-size: 0.7rem; color: var(--dim); margin-top: 4px; }
@media (max-width: 600px) {
  .cb-attach-text { display: none; }
  .cb-suggestions button { width: 100%; }
}
`;
