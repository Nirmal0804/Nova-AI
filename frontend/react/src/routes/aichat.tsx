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
    } else if (result && status !== "running") {
      askInsight(prompt);
    }
  };

  const handleResetChat = () => {
    handleReset();
    setChatInput("");
    setShowHistory(false);
  };

  return (
    <div className="cb-root">
      <div id="stars"></div>

      <div className="cb-layout">
        {/* SIDEBAR */}
        <aside className="cb-sidebar">
          <div className="cb-sidebar-top">
            <button className={`cb-sidebar-btn ${!showHistory ? 'active' : ''}`} title="New Chat" onClick={handleResetChat}>✨</button>
            <button className={`cb-sidebar-btn ${showHistory ? 'active' : ''}`} title="History" onClick={() => setShowHistory(true)}>📜</button>
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
            <Link to="/" className="cb-back-link">
              ← Back to overview
            </Link>
          </header>

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
