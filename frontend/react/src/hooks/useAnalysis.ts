import { useCallback, useRef, useState } from "react";
import imageCompression from "browser-image-compression";

export interface LandCoverClass {
  label: string;
  pct: number;
  color: string;
}

export interface AnalysisResult {
  status: string;
  dominant_land_cover: string;
  secondary_land_cover?: string;
  confidence: string;
  summary: string;
  gpt_analysis?: string;
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

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  isReport?: boolean;
}

export interface ChatSession {
  id: number;
  date: Date;
  messages: ChatMessage[];
  result: AnalysisResult | null;
  file: File | null;
  previewUrl: string | null;
}

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:8000";

export const PIPELINE_STAGES = [
  { icon: "📤", title: "Uploading Image...", desc: "Transferring file to secure server" },
  { icon: "🛰️", title: "Running RemoteCLIP...", desc: "Extracting vision features" },
  { icon: "🌍", title: "Interpreting EO Context...", desc: "Mapping land cover & vegetation" },
  { icon: "💬", title: "Generating GPT Response...", desc: "Synthesizing AI insights" },
];

export function useAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [stageIndex, setStageIndex] = useState(-1);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const handleFile = useCallback(async (f: File | null) => {
    setError(null);
    if (!f) return;

    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(f.type)) {
      setError(`Invalid file type. Please upload a PNG or JPG image.`);
      return;
    }

    try {
      // Client-side image compression
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };
      const compressedFile = await imageCompression(f, options);
      setFile(compressedFile);
      setPreviewUrl(URL.createObjectURL(compressedFile));
    } catch (err) {
      console.error("Image compression error", err);
      // Fallback to uncompressed if it fails
      if (f.size > 10 * 1024 * 1024) {
        setError(`File is too large. Max size is 10MB.`);
        return;
      }
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    }
  }, []);

  const handleReset = useCallback(() => {
    if (messages.length > 0 || result || file) {
      setSessions((prev) => [{
        id: Date.now(),
        date: new Date(),
        messages,
        result,
        file,
        previewUrl
      }, ...prev]);
    }
    setMessages([]);
    setFile(null);
    setPreviewUrl(null);
    setStatus("idle");
    setResult(null);
    setError(null);
    setStageIndex(-1);
    abortController?.abort();
    setAbortController(null);
    setIsStreaming(false);
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, [messages, result, file, previewUrl, abortController]);

  const restoreSession = useCallback((s: ChatSession) => {
    setMessages(s.messages);
    setResult(s.result);
    setFile(s.file);
    setPreviewUrl(s.previewUrl);
    setStatus(s.result || s.messages.length > 0 ? "done" : "idle");
  }, []);

  const runAnalysis = useCallback(async (prompt: string) => {
    if (!file || !prompt.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setStatus("running");
    setResult(null);
    setError(null);
    setStageIndex(0);
    timers.current.forEach(clearTimeout);
    timers.current = [];

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
      formData.append("image", file, file.name || "image.jpeg");

      const controller = new AbortController();
      setAbortController(controller);
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const fetchAnalysis = fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        body: formData,
        signal: controller.signal
      }).then(async (res) => {
        clearTimeout(timeoutId);
        if (!res.ok) {
          if (res.status === 413) throw new Error("Image too large for the backend to process.");
          if (res.status === 415) throw new Error("Unsupported image format.");

          let backendErrorStr = "";
          try {
            const errData = await res.json();
            backendErrorStr = errData.detail || "";
          } catch (e) { }

          if (res.status === 400 || res.status === 422) {
            throw new Error(backendErrorStr ? backendErrorStr : "Invalid image or request.");
          }
          if (res.status >= 500) throw new Error("The backend encountered an unexpected error.");
          throw new Error(`Analysis failed due to an unknown error (${res.status}).`);
        }
        return (await res.json()) as AnalysisResult;
      }).catch(err => {
        clearTimeout(timeoutId);
        throw err;
      });

      const [data] = await Promise.all([fetchAnalysis, minDuration]);
      setResult(data);
      setStatus("done");

      setMessages((prev) => {
        const historySnapshot = prev.filter(m => !m.isReport).map(m => ({ role: m.role, text: m.text }));

        setTimeout(async () => {
          try {
            setIsStreaming(true);
            const streamController = new AbortController();
            setAbortController(streamController);
            const res = await fetch(`${API_BASE}/api/chat/stream`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ question: prompt, result: data, history: historySnapshot }),
              signal: streamController.signal
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
                  if (last && last.role === "assistant" && !last.isReport) {
                    updated[updated.length - 1] = { ...last, text: last.text + text };
                  }
                  return updated;
                });
              }
            }
          } catch (err: any) {
            if (err.name !== "AbortError") {
              console.error("Follow-up chat failed", err);
            }
          } finally {
            setIsStreaming(false);
            setAbortController(null);
          }
        }, 50);

        return [
          ...prev,
          { role: "assistant", text: data.insight, isReport: true }
        ];
      });
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

  const askInsight = useCallback(async (question: string) => {
    if (!question.trim() || !result || insightLoading) return;

    setMessages((m) => [...m, { role: "user", text: question }]);
    setInsightLoading(true);

    try {
      const controller = new AbortController();
      setAbortController(controller);
      const res = await fetch(`${API_BASE}/api/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          eo_context: {
            dominant_land_cover: result.dominant_land_cover,
            secondary_land_cover: result.secondary_land_cover,
            confidence: result.confidence,
            summary: result.summary,
          }
        }),
        signal: controller.signal
      });

      if (!res.ok) throw new Error(`Insights request failed (${res.status})`);

      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", text: data.answer }]);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages((m) => [...m, { role: "assistant", text: `Insight generation is temporarily unavailable.` }]);
      }
    } finally {
      setInsightLoading(false);
      setAbortController(null);
    }
  }, [result, insightLoading]);

  const abortRequest = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsStreaming(false);
      setStatus("done");
    }
  }, [abortController]);

  return {
    file,
    previewUrl,
    status,
    stageIndex,
    result,
    error,
    messages,
    sessions,
    isStreaming,
    insightLoading,
    handleFile,
    handleReset,
    restoreSession,
    runAnalysis,
    askInsight,
    abortRequest
  };
}
