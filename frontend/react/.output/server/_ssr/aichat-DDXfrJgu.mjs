import { a as __toESM } from "../_runtime.mjs";
import { n as AnimatePresence, t as motion } from "../_libs/framer-motion.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import "./router-uRy6lj2w.mjs";
import { t as imageCompression } from "../_libs/browser-image-compression.mjs";
import { t as Markdown } from "../_libs/react-markdown+[...].mjs";
import { t as remarkGfm } from "../_libs/remark-gfm.mjs";
import { t as m } from "../_libs/react-error-boundary.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/aichat-DDXfrJgu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var API_BASE = "http://localhost:8000";
var PIPELINE_STAGES = [
	{
		icon: "📤",
		title: "Uploading Image...",
		desc: "Transferring file to secure server"
	},
	{
		icon: "🛰️",
		title: "Running RemoteCLIP...",
		desc: "Extracting vision features"
	},
	{
		icon: "🌍",
		title: "Interpreting EO Context...",
		desc: "Mapping land cover & vegetation"
	},
	{
		icon: "💬",
		title: "Generating GPT Response...",
		desc: "Synthesizing AI insights"
	}
];
function useAnalysis() {
	const [file, setFile] = (0, import_react.useState)(null);
	const [previewUrl, setPreviewUrl] = (0, import_react.useState)(null);
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [stageIndex, setStageIndex] = (0, import_react.useState)(-1);
	const [result, setResult] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [sessions, setSessions] = (0, import_react.useState)([]);
	const [isStreaming, setIsStreaming] = (0, import_react.useState)(false);
	const [abortController, setAbortController] = (0, import_react.useState)(null);
	const timers = (0, import_react.useRef)([]);
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
		handleFile: (0, import_react.useCallback)(async (f) => {
			setError(null);
			if (!f) return;
			if (![
				"image/png",
				"image/jpeg",
				"image/jpg"
			].includes(f.type)) {
				setError(`Invalid file type. Please upload a PNG or JPG image.`);
				return;
			}
			try {
				const compressedFile = await imageCompression(f, {
					maxSizeMB: 2,
					maxWidthOrHeight: 1920,
					useWebWorker: true
				});
				setFile(compressedFile);
				setPreviewUrl(URL.createObjectURL(compressedFile));
			} catch (err) {
				console.error("Image compression error", err);
				if (f.size > 10 * 1024 * 1024) {
					setError(`File is too large. Max size is 10MB.`);
					return;
				}
				setFile(f);
				setPreviewUrl(URL.createObjectURL(f));
			}
		}, []),
		handleReset: (0, import_react.useCallback)(() => {
			if (messages.length > 0 || result || file) setSessions((prev) => [{
				id: Date.now(),
				date: /* @__PURE__ */ new Date(),
				messages,
				result,
				file,
				previewUrl
			}, ...prev]);
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
		}, [
			messages,
			result,
			file,
			previewUrl,
			abortController
		]),
		restoreSession: (0, import_react.useCallback)((s) => {
			setMessages(s.messages);
			setResult(s.result);
			setFile(s.file);
			setPreviewUrl(s.previewUrl);
			setStatus(s.result || s.messages.length > 0 ? "done" : "idle");
		}, []),
		runAnalysis: (0, import_react.useCallback)(async (prompt) => {
			if (!file || !prompt.trim()) return;
			setMessages((prev) => [...prev, {
				role: "user",
				text: prompt
			}]);
			setStatus("running");
			setResult(null);
			setError(null);
			setStageIndex(0);
			timers.current.forEach(clearTimeout);
			timers.current = [];
			[
				1,
				2,
				3
			].forEach((i) => {
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
				const controller = new AbortController();
				setAbortController(controller);
				const timeoutId = setTimeout(() => controller.abort(), 6e4);
				const fetchAnalysis = fetch(`${API_BASE}/api/analyze`, {
					method: "POST",
					body: formData,
					signal: controller.signal
				}).then(async (res) => {
					clearTimeout(timeoutId);
					if (!res.ok) {
						if (res.status === 413) throw new Error("Image too large for the backend to process.");
						if (res.status === 415) throw new Error("Unsupported image format.");
						if (res.status === 400 || res.status === 422) throw new Error("Invalid image or request.");
						if (res.status >= 500) throw new Error("The backend encountered an unexpected error.");
						throw new Error(`Analysis failed due to an unknown error (${res.status}).`);
					}
					return await res.json();
				}).catch((err) => {
					clearTimeout(timeoutId);
					throw err;
				});
				const [data] = await Promise.all([fetchAnalysis, minDuration]);
				setResult(data);
				setStatus("done");
				setMessages((prev) => {
					const historySnapshot = prev.filter((m) => !m.isReport).map((m) => ({
						role: m.role,
						text: m.text
					}));
					setTimeout(async () => {
						try {
							setIsStreaming(true);
							const streamController = new AbortController();
							setAbortController(streamController);
							const res = await fetch(`${API_BASE}/api/chat/stream`, {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									question: prompt,
									result: data,
									history: historySnapshot
								}),
								signal: streamController.signal
							});
							if (!res.ok) throw new Error(`Chat request failed (${res.status})`);
							const reader = res.body?.getReader();
							const decoder = new TextDecoder();
							if (!reader) throw new Error("No readable stream");
							setMessages((m) => [...m, {
								role: "assistant",
								text: ""
							}]);
							let done = false;
							while (!done) {
								const { value, done: streamDone } = await reader.read();
								done = streamDone;
								if (value) {
									const text = decoder.decode(value, { stream: true });
									setMessages((m) => {
										const updated = [...m];
										const last = updated[updated.length - 1];
										if (last && last.role === "assistant" && !last.isReport) updated[updated.length - 1] = {
											...last,
											text: last.text + text
										};
										return updated;
									});
								}
							}
						} catch (err) {
							if (err.name !== "AbortError") console.error("Follow-up chat failed", err);
						} finally {
							setIsStreaming(false);
							setAbortController(null);
						}
					}, 50);
					return [...prev, {
						role: "assistant",
						text: data.insight,
						isReport: true
					}];
				});
				setFile(null);
				setPreviewUrl(null);
			} catch (err) {
				setStatus("idle");
				setStageIndex(-1);
				let friendlyMsg = "Something went wrong while analyzing the image.";
				if (err.name === "AbortError") friendlyMsg = "The request timed out. The server took too long to respond.";
				else if (err instanceof TypeError) friendlyMsg = "Network failure. Could not connect to the backend server.";
				else if (err instanceof Error) friendlyMsg = err.message;
				setMessages((prev) => [...prev, {
					role: "assistant",
					text: `⚠️ Error: ${friendlyMsg}`
				}]);
				setError(friendlyMsg);
			}
		}, [file]),
		sendChat: (0, import_react.useCallback)(async (prompt) => {
			if (!prompt.trim() || !result) return;
			setMessages((m) => [...m, {
				role: "user",
				text: prompt
			}]);
			const finalHistory = messages.filter((m) => !m.isReport).map((m) => ({
				role: m.role,
				text: m.text
			}));
			try {
				setIsStreaming(true);
				const controller = new AbortController();
				setAbortController(controller);
				const res = await fetch(`${API_BASE}/api/chat/stream`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						question: prompt,
						result,
						history: [...finalHistory, {
							role: "user",
							text: prompt
						}]
					}),
					signal: controller.signal
				});
				if (!res.ok) throw new Error(`Chat request failed (${res.status})`);
				const reader = res.body?.getReader();
				const decoder = new TextDecoder();
				if (!reader) throw new Error("No readable stream");
				setMessages((m) => [...m, {
					role: "assistant",
					text: ""
				}]);
				let done = false;
				while (!done) {
					const { value, done: streamDone } = await reader.read();
					done = streamDone;
					if (value) {
						const text = decoder.decode(value, { stream: true });
						setMessages((m) => {
							const updated = [...m];
							const last = updated[updated.length - 1];
							if (last && last.role === "assistant") updated[updated.length - 1] = {
								...last,
								text: last.text + text
							};
							return updated;
						});
					}
				}
			} catch (err) {
				if (err.name !== "AbortError") setMessages((m) => {
					const last = m[m.length - 1];
					if (last && last.role === "assistant" && !last.text) return [...m.slice(0, -1), {
						role: "assistant",
						text: `Couldn't reach the backend at ${API_BASE} — is it running?`
					}];
					return [...m, {
						role: "assistant",
						text: `Couldn't reach the backend at ${API_BASE} — is it running?`
					}];
				});
			} finally {
				setIsStreaming(false);
				setAbortController(null);
			}
		}, [result, messages]),
		abortRequest: (0, import_react.useCallback)(() => {
			if (abortController) {
				abortController.abort();
				setAbortController(null);
				setIsStreaming(false);
				setStatus("done");
			}
		}, [abortController])
	};
}
var PipelineVisualizer = ({ stageIndex, status }) => {
	if (status !== "running") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "cb-msg-bubble assistant",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "cb-pipeline",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: PIPELINE_STAGES.map((s, i) => {
				const isActive = stageIndex === i;
				const isDone = stageIndex > i;
				if (!isActive && !isDone) return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						y: 10
					},
					animate: {
						opacity: 1,
						y: 0
					},
					className: `cb-stage ${isActive ? "active" : ""} ${isDone ? "done" : ""}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "cb-stage-icon",
						children: isDone ? "✓" : isActive ? s.icon : "•"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: s.title })]
				}, s.title);
			}) })
		})
	});
};
function ErrorFallback({ error, resetErrorBoundary }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "cb-input-error",
		role: "alert",
		style: { marginTop: "20px" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Something went wrong rendering the analysis results:" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				style: { color: "red" },
				children: error.message
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "cb-attach-btn",
				onClick: resetErrorBoundary,
				style: { marginTop: "10px" },
				children: "Try again"
			})
		]
	});
}
var AnalysisResults = (0, import_react.memo)(({ result }) => {
	const [showMask, setShowMask] = (0, import_react.useState)(true);
	const [showRaw, setShowRaw] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
		FallbackComponent: ErrorFallback,
		onReset: () => {
			setShowMask(true);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "cb-report-card nova-reveal nova-in",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "cb-report-header",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Earth Observation Report" }), result.risk_level && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: `cb-risk-badge ${result.risk_level.toLowerCase()}`,
						children: ["RISK: ", result.risk_level.toUpperCase()]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", { className: "cb-divider" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "cb-report-section",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "cb-section-title",
						children: "Telemetry & Context"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "cb-eo-panel",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "cb-eo-grid",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "cb-eo-item",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "cb-eo-label",
										children: "Scene Type"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "cb-eo-value",
										children: result.scene_type || "Urban / Natural"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "cb-eo-item",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "cb-eo-label",
										children: "Resolution"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "cb-eo-value",
										children: result.width && result.height ? `${result.width}x${result.height}` : "High"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "cb-eo-item",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "cb-eo-label",
										children: "Projection"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "cb-eo-value",
										children: result.geo_metadata?.crs ? String(result.geo_metadata.crs) : "EPSG:4326"
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "cb-eo-flags",
							children: result.flags?.map((f, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "cb-eo-match-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									f.icon,
									" ",
									f.label
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "cb-eo-match-score",
									children: "DETECTED"
								})]
							}, idx))
						})]
					})]
				}),
				result.mask_image && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "cb-report-section",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "cb-section-title",
						children: "Segmentation Map"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "cb-report-image-container",
						children: [showMask && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: `data:image/png;base64,${result.mask_image}`,
							alt: "Mask Overlay",
							className: "cb-mask-overlay",
							style: {
								opacity: 1,
								mixBlendMode: "normal"
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "cb-mask-toggle",
							onClick: () => setShowMask(!showMask),
							children: showMask ? "Hide SegMap" : "Show SegMap"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "cb-report-section",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "cb-section-title",
						children: "Land Cover Distribution"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "cb-classes",
						children: result.classes?.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "cb-class-row",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "cb-class-label",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "cb-swatch",
										style: { background: c.color }
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: c.label })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "cb-class-bar-track",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "cb-class-bar",
										style: {
											width: `${c.pct}%`,
											background: c.color
										}
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "cb-class-pct",
									children: [c.pct, "%"]
								})
							]
						}, c.label))
					})]
				}),
				result.ndvi_score !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "cb-report-section",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "cb-section-title",
						children: "Vegetation Index (NDVI)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "cb-ndvi-section",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "cb-ndvi-score",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "cb-ndvi-val",
								style: { color: result.ndvi_score > .4 ? "#00e5a0" : result.ndvi_score < .1 ? "#ff4e6a" : "#ffb84e" },
								children: result.ndvi_score.toFixed(2)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "cb-ndvi-label",
								children: "Mean NDVI"
							})]
						}), result.ndvi_heatmap && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: { flex: 2 },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: `data:image/png;base64,${result.ndvi_heatmap}`,
								alt: "NDVI Heatmap",
								className: "cb-chart-img"
							})
						})]
					})]
				}),
				result.pie_chart && result.bar_chart && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "cb-report-section",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "cb-section-title",
						children: "Statistical Analysis"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "cb-charts-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "half",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: `data:image/png;base64,${result.pie_chart}`,
								alt: "Pie Chart",
								className: "cb-chart-img"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "half",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: `data:image/png;base64,${result.bar_chart}`,
								alt: "Bar Chart",
								className: "cb-chart-img"
							})
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "cb-report-section",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "cb-section-title",
						children: "Strategic Insights"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "cb-insights-grid",
						children: [result.use_cases && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "cb-insight-col",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
								className: "cb-insight-heading",
								children: "Potential Use Cases"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "cb-insight-list",
								children: result.use_cases.map((uc, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: uc.name }),
									": ",
									uc.rationale
								] }, i))
							})]
						}), result.recommended_actions && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "cb-insight-col",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
								className: "cb-insight-heading",
								children: "Recommended Actions"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "cb-insight-list",
								children: result.recommended_actions.map((ra, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: ra.audience }),
									": ",
									ra.action
								] }, i))
							})]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "cb-report-section",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "cb-raw-json",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
							onClick: (e) => {
								e.preventDefault();
								setShowRaw(!showRaw);
							},
							children: showRaw ? "Hide Raw JSON" : "Show Raw JSON"
						}), showRaw && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { children: JSON.stringify(result, null, 2) })]
					})
				})
			]
		})
	});
});
AnalysisResults.displayName = "AnalysisResults";
var ChatInterface = (0, import_react.memo)(({ messages, status, stageIndex, result, file, previewUrl, chatInput, setChatInput, handleSubmit, handleFile, isStreaming, abortRequest, showHistory }) => {
	const chatEndRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [
		messages,
		status,
		stageIndex
	]);
	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text);
	};
	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "cb-chat-container",
		children: [messages.length === 0 && status === "idle" && !showHistory ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "cb-welcome nova-reveal nova-in",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cb-hero-orb orb1" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cb-hero-orb orb2" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Analyze Satellite Imagery" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "nebula-text",
					children: "Earth Observation"
				}), " Assistant"] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "cb-suggestions",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setChatInput("Identify bodies of water and calculate total area."),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "sg-icon",
								children: "💧"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sg-text",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Water Detection" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Map lakes and rivers" })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setChatInput("Detect urban encroachment into forest regions."),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "sg-icon",
								children: "🏙️"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sg-text",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Urban Sprawl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Track city expansion" })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setChatInput("Assess vegetation health and calculate NDVI."),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "sg-icon",
								children: "🌿"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sg-text",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Agriculture" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Analyze crop vitality" })]
							})]
						})
					]
				})
			]
		}) : !showHistory ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "cb-chat-history",
			children: [
				messages.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `cb-msg-wrapper ${m.role}`,
					children: [m.role === "assistant" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "cb-msg-avatar",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cb-dot small" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `cb-msg-bubble ${m.role}`,
						children: [m.role === "assistant" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "cb-copy-btn",
							onClick: () => copyToClipboard(m.text),
							title: "Copy to clipboard",
							children: "📋"
						}), m.role === "user" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "cb-msg-text",
							children: m.text
						}) : m.isReport && result ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalysisResults, { result }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "cb-markdown",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Markdown, {
								remarkPlugins: [remarkGfm],
								children: m.text
							})
						})]
					})]
				}, i)),
				status === "running" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PipelineVisualizer, {
					stageIndex,
					status
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: chatEndRef })
			]
		}) : null, !showHistory && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "cb-input-area",
			children: [
				file && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "cb-attachment-preview",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: previewUrl,
							alt: "Preview"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "cb-attachment-info",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "cb-attachment-name",
								children: file.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "cb-attachment-size",
								children: [(file.size / 1024 / 1024).toFixed(2), " MB"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "cb-attachment-remove",
							onClick: () => handleFile(null),
							children: "×"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "cb-input-box",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "cb-attach-btn",
							onClick: () => document.getElementById("file-upload")?.click(),
							title: "Attach Image",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: { fontSize: "1.1rem" },
								children: "+"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "cb-attach-text",
								children: "Attach"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "file-upload",
							type: "file",
							accept: "image/png, image/jpeg",
							style: { display: "none" },
							onChange: (e) => handleFile(e.target.files?.[0] || null)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							id: "chat-input-textarea",
							placeholder: file || result ? "Ask a follow-up question..." : "Describe what you want to analyze...",
							value: chatInput,
							onChange: (e) => setChatInput(e.target.value),
							onKeyDown: handleKeyDown,
							rows: Math.min(chatInput.split("\\n").length, 5) || 1
						}),
						isStreaming || status === "running" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "cb-submit-btn cb-stop-btn",
							onClick: abortRequest,
							title: "Stop generation",
							children: "⏹"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "cb-submit-btn",
							onClick: handleSubmit,
							disabled: !chatInput.trim() && !file || status === "running",
							children: "↑"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "cb-footer-text",
					children: "NOVA AI can make mistakes. Verify critical intelligence."
				})
			]
		})]
	});
});
ChatInterface.displayName = "ChatInterface";
function NovaDemo() {
	const { file, previewUrl, status, stageIndex, result, error, messages, sessions, isStreaming, handleFile, handleReset, restoreSession, runAnalysis, sendChat, abortRequest } = useAnalysis();
	const [chatInput, setChatInput] = (0, import_react.useState)("");
	const [showHistory, setShowHistory] = (0, import_react.useState)(false);
	const handleSubmit = () => {
		const prompt = chatInput.trim();
		if (!prompt && !file) return;
		if (file && status !== "running") runAnalysis(prompt);
		else if (result && status !== "running") sendChat(prompt);
	};
	const handleResetChat = () => {
		handleReset();
		setChatInput("");
		setShowHistory(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "cb-root",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { id: "stars" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "cb-layout",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "cb-sidebar",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "cb-sidebar-top",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: `cb-sidebar-btn ${!showHistory ? "active" : ""}`,
							title: "New Chat",
							onClick: handleResetChat,
							children: "✨"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: `cb-sidebar-btn ${showHistory ? "active" : ""}`,
							title: "History",
							onClick: () => setShowHistory(true),
							children: "📜"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "cb-sidebar-btn",
							title: "Saved Reports",
							children: "📁"
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "cb-main",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "cb-header",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "cb-logo-text",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cb-dot" }), "NOVA AI"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "cb-back-link",
						children: "← Back to overview"
					})]
				}), showHistory ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "cb-history-view",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "cb-history-title",
						children: "Session History"
					}), sessions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "cb-history-empty",
						children: "No past sessions found."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "cb-history-list",
						children: sessions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "cb-history-card",
							onClick: () => {
								restoreSession(s);
								setShowHistory(false);
							},
							children: [s.previewUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: s.previewUrl,
								alt: "Thumbnail",
								className: "cb-history-thumb"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "cb-history-info",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "cb-history-date",
									children: s.date.toLocaleString()
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "cb-history-desc",
									children: [s.result?.insight?.slice(0, 60) || s.messages[0]?.text?.slice(0, 60) || "Unfinished Session", "..."]
								})]
							})]
						}, s.id))
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { padding: "0 24px" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "cb-input-error",
						children: error
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatInterface, {
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
					showHistory
				})] })]
			})]
		})]
	});
}
//#endregion
export { NovaDemo as component };
