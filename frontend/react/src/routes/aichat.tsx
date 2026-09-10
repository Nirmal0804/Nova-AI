import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAnalysis } from "../hooks/useAnalysis";
import { ChatInterface } from "../components/ui/ChatInterface";
import "./aichat.css";

export const Route = createFileRoute("/aichat")({
  component: NovaDemo,
});

function NovaDemo() {
  const {
    file,
    previewUrl,
    status,
    stageIndex,
    result,
    error,
    messages,
    sessions,
    isStreaming,
    handleFile,
    handleReset,
    restoreSession,
    runAnalysis,
    askInsight,
    insightLoading,
    abortRequest
  } = useAnalysis();

  const [chatInput, setChatInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = () => {
    const prompt = chatInput.trim();
    if (!prompt && !file) return;
    if (file && status !== "running") {
      runAnalysis(prompt);
      setChatInput("");
    } else if (result && status !== "running") {
      askInsight(prompt);
      setChatInput("");
    }
  };

  const handleResetChat = () => {
    handleReset();
    setChatInput("");
    setShowHistory(false);
  };

  return (
    <div className="cb-root" style={{ paddingTop: '80px' }}>
      <div id="stars"></div>

      <nav className="nova-nav">
        <div className="nova-logo">
          <div className="nova-dot" />
          NOVA AI
          <span className="nova-live">● LIVE</span>
        </div>
        <ul className="nova-links">
          <li><Link to="/">Home</Link></li>
        </ul>
        <div className="nova-tag">SIH25170</div>
      </nav>

      <div className="cb-layout">
        {/* MAIN AREA */}
        <main className="cb-main">

          {showHistory ? (
            <div className="cb-history-view">
              <h2 className="cb-history-title">Session History</h2>
              {sessions.length === 0 ? (
                <div className="cb-history-empty">No past sessions found.</div>
              ) : (
                <div className="cb-history-list">
                  {sessions.map(s => (
                    <div key={s.id} className="cb-history-card" onClick={() => { restoreSession(s); setShowHistory(false); }}>
                      {s.previewUrl && <img src={s.previewUrl} alt="Thumbnail" className="cb-history-thumb" />}
                      <div className="cb-history-info">
                        <div className="cb-history-date">{s.date.toLocaleString()}</div>
                        <div className="cb-history-desc">
                          {s.result?.insight?.slice(0, 60) || s.messages[0]?.text?.slice(0, 60) || "Unfinished Session"}...
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {error && (
                <div style={{ padding: '0 24px' }}>
                  <div className="cb-input-error">{error}</div>
                </div>
              )}

              <ChatInterface
                messages={messages}
                status={status}
                stageIndex={stageIndex}
                result={result}
                file={file}
                previewUrl={previewUrl}
                chatInput={chatInput}
                setChatInput={setChatInput}
                handleSubmit={handleSubmit}
                handleFile={handleFile}
                isStreaming={isStreaming}
                abortRequest={abortRequest}
                showHistory={showHistory}
                askInsight={askInsight}
                insightLoading={insightLoading}
                handleResetChat={handleResetChat}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
