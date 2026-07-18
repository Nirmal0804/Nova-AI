import { r as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Markdown } from "../_libs/react-markdown+[...].mjs";
import { t as remarkGfm } from "../_libs/remark-gfm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/aichat-BLOCa39Q.js
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
function NovaDemo() {
	const [file, setFile] = (0, import_react.useState)(null);
	const [previewUrl, setPreviewUrl] = (0, import_react.useState)(null);
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [stageIndex, setStageIndex] = (0, import_react.useState)(-1);
	const [result, setResult] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [chatInput, setChatInput] = (0, import_react.useState)("");
	const [sessions, setSessions] = (0, import_react.useState)([]);
	const [showHistory, setShowHistory] = (0, import_react.useState)(false);
	const [abortController, setAbortController] = (0, import_react.useState)(null);
	const [isStreaming, setIsStreaming] = (0, import_react.useState)(false);
	const [showMask, setShowMask] = (0, import_react.useState)(true);
	const timers = (0, import_react.useRef)([]);
	const chatEndRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [
		messages,
		status,
		stageIndex
	]);
	(0, import_react.useEffect)(() => {
		return () => timers.current.forEach(clearTimeout);
	}, []);
	const handleFile = (0, import_react.useCallback)((f) => {
		setError(null);
		if (!f) return;
		if (!["image/png", "image/jpeg"].includes(f.type)) {
			setError(`Invalid file type. Please upload a PNG or JPG image.`);
			return;
		}
		if (f.size > 10 * 1024 * 1024) {
			setError(`File is too large. Max size is 10MB.`);
			return;
		}
		setFile(f);
		setPreviewUrl(URL.createObjectURL(f));
	}, []);
	const handleReset = (0, import_react.useCallback)(() => {
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
		setChatInput("");
		setShowHistory(false);
		abortController?.abort();
		setAbortController(null);
		setIsStreaming(false);
		timers.current.forEach(clearTimeout);
		timers.current = [];
	}, [
		messages,
		result,
		file,
		previewUrl
	]);
	const restoreSession = (0, import_react.useCallback)((s) => {
		setMessages(s.messages);
		setResult(s.result);
		setFile(s.file);
		setPreviewUrl(s.previewUrl);
		setStatus(s.result || s.messages.length > 0 ? "done" : "idle");
		setShowHistory(false);
	}, []);
	const runAnalysis = (0, import_react.useCallback)(async (prompt) => {
		if (!file || !prompt.trim()) return;
		setMessages((prev) => [...prev, {
			role: "user",
			text: prompt
		}]);
		setChatInput("");
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
	}, [file]);
	const sendChat = (0, import_react.useCallback)(async (prompt) => {
		if (!prompt.trim() || !result) return;
		setMessages((m) => [...m, {
			role: "user",
			text: prompt
		}]);
		setChatInput("");
		const finalHistory = messages.filter((m) => !m.isReport).map((m) => ({
			role: m.role,
			text: m.text
		}));
		const analysisContext = result;
		try {
			setIsStreaming(true);
			const controller = new AbortController();
			setAbortController(controller);
			const res = await fetch(`${API_BASE}/api/chat/stream`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					question: prompt,
					result: analysisContext,
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
	}, [result, messages]);
	const handleSubmit = () => {
		const prompt = chatInput.trim();
		if (!prompt) return;
		if (file && status !== "running") runAnalysis(prompt);
		else if (result && status !== "running") sendChat(prompt);
	};
	const setSuggestion = (q) => {
		setChatInput(q);
		const el = document.getElementById("chat-input-textarea");
		if (el) el.focus();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "cb-root",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: css }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { id: "stars" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "cb-layout",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "cb-sidebar",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "cb-sidebar-top",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "cb-sidebar-btn active",
								title: "New Chat",
								onClick: handleReset,
								children: "✨"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "cb-sidebar-btn",
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
								onClick: () => restoreSession(s),
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
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "cb-chat-container",
						children: messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "cb-welcome",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cb-hero-orb orb1" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cb-hero-orb orb2" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Hey! NOVA User" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "What can I help you analyze?" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "cb-suggestions",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => setSuggestion("Identify flood risks and map water boundaries."),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "sg-icon",
												children: "🌊"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "sg-text",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Flood Risk" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Analyze water boundaries" })]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => setSuggestion("Map the land cover and segment urban areas."),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "sg-icon",
												children: "🏙️"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "sg-text",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Land Cover" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Segment vegetation & urban" })]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => setSuggestion("Assess crop health using NDVI analysis."),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "sg-icon",
												children: "🌾"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "sg-text",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Crop Health" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Generate NDVI insights" })]
											})]
										})
									]
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "cb-chat-history",
							children: [
								messages.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `cb-msg-wrapper ${m.role}`,
									children: [m.role === "assistant" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "cb-msg-avatar",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cb-dot small" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: `cb-msg-bubble ${m.role} ${m.isReport ? "is-report" : ""}`,
										children: [
											m.role === "assistant" && !m.isReport && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "cb-copy-btn",
												onClick: () => navigator.clipboard.writeText(m.text),
												title: "Copy text",
												children: "📋"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "cb-msg-text cb-markdown",
												children: m.role === "assistant" && !m.isReport ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Markdown, {
													remarkPlugins: [remarkGfm],
													children: m.text
												}) : m.text
											}),
											m.isReport && result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "cb-report-card",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", { className: "cb-divider" }),
													result.title && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "cb-report-header",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: result.title }), result.risk_level && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: `cb-risk-badge ${result.risk_level.toLowerCase()}`,
															children: [result.risk_level, " Risk"]
														})]
													}),
													previewUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "cb-report-image-container",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
																src: previewUrl,
																alt: "Analyzed scene",
																className: "cb-report-base-image"
															}),
															result.mask_image && showMask && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
																src: `data:image/png;base64,${result.mask_image}`,
																alt: "Segmentation mask",
																className: "cb-mask-overlay"
															}),
															result.mask_image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																className: "cb-mask-toggle",
																onClick: () => setShowMask(!showMask),
																children: showMask ? "Hide SegMap" : "Show SegMap"
															})
														]
													}),
													result.classes && result.classes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "cb-report-section",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
															className: "cb-section-title",
															children: "EO Context Analysis"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "cb-eo-panel",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "cb-eo-grid",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																		className: "cb-eo-item",
																		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																			className: "cb-eo-label",
																			children: "Dominant Cover"
																		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																			className: "cb-eo-value",
																			children: result.classes[0]?.label || "N/A"
																		})]
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																		className: "cb-eo-item",
																		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																			className: "cb-eo-label",
																			children: "Secondary"
																		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																			className: "cb-eo-value",
																			children: result.classes[1]?.label || "N/A"
																		})]
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																		className: "cb-eo-item",
																		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																			className: "cb-eo-label",
																			children: "Coverage"
																		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																			className: "cb-eo-value",
																			children: result.classes[0]?.pct ? `${result.classes[0].pct}%` : "N/A"
																		})]
																	})
																]
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "cb-eo-matches",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																	className: "cb-eo-label",
																	style: { marginBottom: "10px" },
																	children: "Area Breakdown"
																}), result.classes.slice(0, 4).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	className: "cb-eo-match-row",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: c.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																		className: "cb-eo-match-score",
																		children: [c.pct, "%"]
																	})]
																}, c.label))]
															})]
														})]
													}),
													result.use_cases?.length || result.recommended_actions?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "cb-report-section",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
															className: "cb-section-title",
															children: "Strategic Insights"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "cb-insights-grid",
															children: [result.use_cases && result.use_cases.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "cb-insight-col",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
																	className: "cb-insight-heading",
																	children: "Use Cases"
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
																	className: "cb-insight-list",
																	children: result.use_cases.map((uc, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
																		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [uc.name, ":"] }),
																		" ",
																		uc.rationale
																	] }, i))
																})]
															}), result.recommended_actions && result.recommended_actions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "cb-insight-col",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
																	className: "cb-insight-heading",
																	children: "Recommended Actions"
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
																	className: "cb-insight-list",
																	children: result.recommended_actions.map((ra, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
																		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [ra.audience, ":"] }),
																		" ",
																		ra.action
																	] }, i))
																})]
															})]
														})]
													}) : null,
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "cb-report-section",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
															className: "cb-raw-json",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: "View Raw JSON" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { children: JSON.stringify(result, null, 2) })]
														})
													}),
													result.classes && result.classes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "cb-report-section",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
															className: "cb-section-title",
															children: "Land Cover Breakdown"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "cb-classes",
															children: result.classes.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "cb-class-row",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																		className: "cb-class-label",
																		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																			className: "cb-swatch",
																			style: { background: c.color }
																		}), c.label]
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
													})
												]
											})
										]
									})]
								}, i)),
								status === "running" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "cb-msg-wrapper assistant",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "cb-msg-avatar",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cb-dot small pulse" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "cb-msg-bubble assistant loading",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "cb-pipeline",
											children: PIPELINE_STAGES.map((s, i) => {
												const stateCls = i < stageIndex ? "done" : i === stageIndex ? "active" : "";
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: `cb-stage ${stateCls}`,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "cb-stage-icon",
														children: stateCls === "done" ? "✓" : s.icon
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: s.title })]
												}, s.title);
											})
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: chatEndRef })
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "cb-input-area",
						children: [
							previewUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "cb-attachment-preview",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: previewUrl,
										alt: "Attachment"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "cb-attachment-info",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "cb-attachment-name",
											children: file?.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "cb-attachment-size",
											children: [((file?.size || 0) / 1024 / 1024).toFixed(2), " MB"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "cb-attachment-remove",
										onClick: () => {
											setFile(null);
											setPreviewUrl(null);
										},
										children: "✕"
									})
								]
							}),
							error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "cb-input-error",
								children: ["⚠️ ", error]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "cb-input-box",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: "cb-attach-btn",
										title: "Attach satellite image",
										onClick: () => document.getElementById("cb-file-input")?.click(),
										children: ["📎 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "cb-attach-text",
											children: "Attach"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "cb-file-input",
										type: "file",
										accept: ".png,.jpg,.jpeg,image/png,image/jpeg",
										hidden: true,
										onChange: (e) => handleFile(e.target.files?.[0] ?? null),
										onClick: (e) => e.currentTarget.value = ""
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										id: "chat-input-textarea",
										placeholder: "Ask me anything...",
										value: chatInput,
										onChange: (e) => {
											setChatInput(e.target.value);
											e.target.style.height = "auto";
											e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
										},
										onKeyDown: (e) => {
											if (e.key === "Enter" && !e.shiftKey) {
												e.preventDefault();
												if (!isStreaming && status !== "running") handleSubmit();
											}
										},
										rows: 1,
										disabled: status === "running"
									}),
									isStreaming || status === "running" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "cb-submit-btn cb-stop-btn",
										onClick: () => abortController?.abort(),
										title: "Stop generating",
										children: "■"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "cb-submit-btn",
										disabled: !chatInput.trim() && !file || status === "running",
										onClick: handleSubmit,
										title: "Send message",
										children: "↑"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "cb-footer-text",
								children: "NOVA AI can make mistakes. Verify critical intelligence."
							})
						]
					})] })]
				})]
			})
		]
	});
}
var css = `
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
.cb-back-link { font-size: 0.85rem; color: var(--muted); text-decoration: none; transition: color 0.2s; }
.cb-back-link:hover { color: var(--star); }

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
.cb-markdown p { margin-bottom: 12px; }
.cb-markdown p:last-child { margin-bottom: 0; }
.cb-markdown h1, .cb-markdown h2, .cb-markdown h3 { margin: 16px 0 8px; font-weight: 600; color: var(--star); }
.cb-markdown ul, .cb-markdown ol { padding-left: 20px; margin-bottom: 12px; }
.cb-markdown li { margin-bottom: 4px; }
.cb-markdown strong { font-weight: 600; color: var(--aurora); }
.cb-markdown code { font-family: 'Space Mono', monospace; font-size: 0.85em; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; }
.cb-markdown pre { background: rgba(0,0,0,0.3); border: 1px solid var(--border); padding: 12px; border-radius: 8px; overflow-x: auto; margin-bottom: 12px; }
.cb-markdown pre code { background: transparent; padding: 0; }
.cb-markdown table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
.cb-markdown th, .cb-markdown td { border: 1px solid var(--border); padding: 8px 12px; text-align: left; }
.cb-markdown th { background: rgba(255,255,255,0.05); }

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

/* EO PANEL */
.cb-eo-panel { background: rgba(0,0,0,0.25); border: 1px solid var(--border); border-radius: 12px; padding: 18px; margin-bottom: 16px; }
.cb-eo-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.cb-eo-item { display: flex; flex-direction: column; gap: 6px; }
.cb-eo-label { font-size: 0.72rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; font-family: 'Space Mono', monospace; }
.cb-eo-value { font-size: 0.95rem; font-weight: 600; color: var(--aurora); }
.cb-eo-match-row { display: flex; justify-content: space-between; font-size: 0.85rem; padding: 6px 0; border-bottom: 1px dashed rgba(255,255,255,0.05); }
.cb-eo-match-row:last-child { border-bottom: none; }
.cb-eo-match-score { font-family: 'Space Mono', monospace; color: var(--aurora); font-weight: 600; }

.cb-classes { display: flex; flex-direction: column; gap: 8px; }
.cb-class-row { display: grid; grid-template-columns: 140px 1fr 50px; align-items: center; gap: 12px; font-size: 0.85rem; }
.cb-class-label { display: flex; align-items: center; gap: 8px; color: var(--star); }
.cb-swatch { width: 10px; height: 10px; border-radius: 2px; }
.cb-class-bar-track { height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
.cb-class-bar { height: 100%; border-radius: 3px; }
.cb-class-pct { text-align: right; color: var(--muted); font-family: 'Space Mono', monospace; }

/* Strategic Insights */
.cb-insights-grid { display: flex; flex-direction: column; gap: 16px; }
.cb-insight-col { background: rgba(0,0,0,0.25); border: 1px solid var(--border); border-radius: 12px; padding: 18px; }
.cb-insight-heading { margin: 0 0 12px 0; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--aurora); font-family: 'Space Mono', monospace; }
.cb-insight-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.cb-insight-list li { font-size: 0.9rem; line-height: 1.5; color: var(--star); }
.cb-insight-list li strong { color: #fff; }

/* History View */
.cb-history-view { flex: 1; padding: 32px; overflow-y: auto; }
.cb-history-title { font-family: 'Space Mono', monospace; color: var(--aurora); margin-top: 0; margin-bottom: 24px; font-size: 1.25rem; font-weight: 400; text-transform: uppercase; letter-spacing: 0.05em; }
.cb-history-empty { color: var(--muted); font-size: 0.95rem; text-align: center; margin-top: 64px; }
.cb-history-list { display: flex; flex-direction: column; gap: 16px; max-width: 600px; margin: 0 auto; }
.cb-history-card { display: flex; gap: 16px; background: var(--card); border: 1px solid var(--border); padding: 16px; border-radius: 12px; cursor: pointer; transition: all 0.2s; align-items: center; }
.cb-history-card:hover { border-color: var(--aurora); transform: translateY(-2px); box-shadow: 0 4px 24px rgba(0,229,200,0.1); }
.cb-history-thumb { width: 64px; height: 64px; object-fit: cover; border-radius: 8px; flex-shrink: 0; background: #000; }
.cb-history-info { flex: 1; display: flex; flex-direction: column; gap: 4px; overflow: hidden; }
.cb-history-date { font-size: 0.8rem; color: var(--muted); font-family: 'Space Mono', monospace; }
.cb-history-desc { font-size: 0.95rem; color: var(--star); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Copy Button */
.cb-msg-bubble { position: relative; }
.cb-copy-btn { position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 6px; color: var(--muted); padding: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; transition: all 0.2s; opacity: 0; line-height: 1; }
.cb-msg-bubble:hover .cb-copy-btn { opacity: 1; }
.cb-copy-btn:hover { color: var(--aurora); border-color: var(--aurora); background: rgba(0,229,200,0.1); }

/* Raw JSON Details */
.cb-raw-json { border: 1px solid var(--border); border-radius: 8px; padding: 12px; background: rgba(0,0,0,0.3); }
.cb-raw-json summary { font-size: 0.85rem; color: var(--muted); cursor: pointer; font-family: 'Space Mono', monospace; text-transform: uppercase; user-select: none; }
.cb-raw-json summary:hover { color: var(--aurora); }
.cb-raw-json pre { margin: 12px 0 0 0; padding-top: 12px; border-top: 1px dashed var(--border); font-size: 0.8rem; color: var(--star); font-family: 'Space Mono', monospace; white-space: pre-wrap; word-wrap: break-word; overflow-x: hidden; max-height: 300px; overflow-y: auto; }

/* SegMap Overlay */
.cb-report-image-container { position: relative; width: 100%; max-height: 400px; border-radius: 12px; overflow: hidden; margin-bottom: 24px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; background: #000; }
.cb-report-base-image { width: 100%; height: 100%; object-fit: contain; }
.cb-mask-overlay { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; opacity: 0.65; mix-blend-mode: screen; pointer-events: none; }
.cb-mask-toggle { position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.65); color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 0.8rem; padding: 6px 12px; cursor: pointer; backdrop-filter: blur(4px); font-family: 'Space Mono', monospace; transition: all 0.2s; }
.cb-mask-toggle:hover { background: rgba(0,0,0,0.9); border-color: var(--aurora); color: var(--aurora); }

/* Stop Button */
.cb-stop-btn { font-size: 0.9rem !important; }
.cb-stop-btn:hover { background: rgba(255,50,50,0.2) !important; color: #ff5555 !important; border-color: #ff5555 !important; }

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
//#endregion
export { NovaDemo as component };
