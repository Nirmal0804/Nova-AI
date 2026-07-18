import React, { memo, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage, AnalysisResult } from "../../hooks/useAnalysis";
import { PipelineVisualizer } from "./PipelineVisualizer";
import { AnalysisResults } from "./AnalysisResults";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  status: string;
  stageIndex: number;
  result: AnalysisResult | null;
  file: File | null;
  previewUrl: string | null;
  chatInput: string;
  setChatInput: (val: string) => void;
  handleSubmit: () => void;
  handleFile: (f: File | null) => void;
  isStreaming: boolean;
  abortRequest: () => void;
  showHistory: boolean;
  askInsight: (q: string) => void;
  insightLoading: boolean;
  handleResetChat: () => void;
}

export const ChatInterface = memo(({
  messages,
  status,
  stageIndex,
  result,
  file,
  previewUrl,
  chatInput,
  setChatInput,
  handleSubmit,
  handleFile,
  isStreaming,
  abortRequest,
  showHistory,
  askInsight,
  insightLoading,
  handleResetChat
}: ChatInterfaceProps) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status, stageIndex]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="cb-chat-container">
      {messages.length === 0 && status === "idle" && !showHistory ? (
        <div className="cb-welcome nova-reveal nova-in">
          <div className="cb-hero-orb orb1"></div>
          <div className="cb-hero-orb orb2"></div>
          <h2>Analyze Satellite Imagery</h2>
          <h1><span className="nebula-text">Earth Observation</span> Assistant</h1>
          <div className="cb-suggestions">
            <button onClick={() => setChatInput("Identify bodies of water and calculate total area.")}>
              <div className="sg-icon">💧</div>
              <div className="sg-text">
                <h4>Water Detection</h4>
                <p>Map lakes and rivers</p>
              </div>
            </button>
            <button onClick={() => setChatInput("Detect urban encroachment into forest regions.")}>
              <div className="sg-icon">🏙️</div>
              <div className="sg-text">
                <h4>Urban Sprawl</h4>
                <p>Track city expansion</p>
              </div>
            </button>
            <button onClick={() => setChatInput("Assess vegetation health and calculate NDVI.")}>
              <div className="sg-icon">🌿</div>
              <div className="sg-text">
                <h4>Agriculture</h4>
                <p>Analyze crop vitality</p>
              </div>
            </button>
          </div>
        </div>
      ) : !showHistory ? (
        <div className="cb-chat-history">
          {messages.map((m, i) => (
            <div key={i} className={`cb-msg-wrapper ${m.role}`}>
              {m.role === "assistant" && (
                <div className="cb-msg-avatar">
                  <div className="cb-dot small"></div>
                </div>
              )}
              <div className={`cb-msg-bubble ${m.role}`}>
                {m.role === "assistant" && (
                  <button className="cb-copy-btn" onClick={() => copyToClipboard(m.text)} title="Copy to clipboard">
                    📋
                  </button>
                )}
                {m.role === "user" ? (
                  <div className="cb-msg-text">{m.text}</div>
                ) : m.isReport && result ? (
                  <>
                    <div className="cb-markdown cb-report-text">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                    </div>
                    <br />
                    <AnalysisResults result={result} askInsight={askInsight} insightLoading={insightLoading} />
                  </>
                ) : (
                  <div className="cb-markdown">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}

          {status === "running" && <PipelineVisualizer stageIndex={stageIndex} status={status} />}
          <div ref={chatEndRef} />
        </div>
      ) : null}

      {!showHistory && (
        <div className="cb-input-area">
          {file && (
            <div className="cb-attachment-preview">
              <img src={previewUrl!} alt="Preview" />
              <div className="cb-attachment-info">
                <span className="cb-attachment-name">{file.name}</span>
                <span className="cb-attachment-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <button className="cb-attachment-remove" onClick={() => handleFile(null)}>×</button>
            </div>
          )}
          {!(result && !file) && (
            <div className="cb-input-box">
              <button
                className="cb-attach-btn"
                onClick={() => document.getElementById("file-upload")?.click()}
                title="Attach Image"
              >
                <span style={{ fontSize: "1.1rem" }}>+</span>
                <span className="cb-attach-text">Attach</span>
              </button>
              <input
                id="file-upload"
                type="file"
                accept="image/png, image/jpeg"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
              />
              <textarea
                id="chat-input-textarea"
                placeholder={file || result ? "Ask a follow-up question..." : "Describe what you want to analyze..."}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={Math.min(chatInput.split("\\n").length, 5) || 1}
              />
              {isStreaming || status === "running" ? (
                <button className="cb-submit-btn cb-stop-btn" onClick={abortRequest} title="Stop generation">
                  ⏹
                </button>
              ) : (
                <button
                  className="cb-submit-btn"
                  onClick={handleSubmit}
                  disabled={(!chatInput.trim() && !file) || status === "running"}
                >
                  ↑
                </button>
              )}
            </div>
          )}

          {result && !file && (
            <div className="cb-input-box" style={{ justifyContent: 'center', background: 'transparent', border: 'none', boxShadow: 'none' }}>
              <button
                className="cb-attach-btn"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                onClick={handleResetChat}
              >
                🔄 Start New Analysis
              </button>
            </div>
          )}
          <div className="cb-footer-text">
            NOVA AI can make mistakes. Verify critical intelligence.
          </div>
        </div>
      )}
    </div>
  );
});

ChatInterface.displayName = "ChatInterface";
