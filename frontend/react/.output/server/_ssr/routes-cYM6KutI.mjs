import { a as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import "./router-uRy6lj2w.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-cYM6KutI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var problems = [
	{
		icon: "🔍",
		title: "Manual Interpretation",
		desc: "Trained analysts spend hours manually reviewing satellite images to extract basic land-use patterns — a bottleneck that doesn't scale."
	},
	{
		icon: "⏱️",
		title: "Slow Disaster Analysis",
		desc: "When floods or wildfires strike, response teams need imagery-based intelligence in minutes. Current pipelines take days."
	},
	{
		icon: "🧩",
		title: "Fragmented EO Insights",
		desc: "Spectral bands, NDVI indices, and radar data live in separate tools — no single system converts them into unified, readable insights."
	},
	{
		icon: "📡",
		title: "Inaccessible for Non-Experts",
		desc: "Complex satellite data formats and GIS tooling lock out environmental agencies, planners, and first responders who need answers fast."
	}
];
var flow = [
	{
		n: "01",
		icon: "📤",
		title: "Image Ingestion",
		desc: "User uploads satellite image or connects to ISRO EO data streams via API"
	},
	{
		n: "02",
		icon: "⚙️",
		title: "Preprocessing",
		desc: "Rasterio & GDAL normalize imagery; OpenCV handles spatial calibration"
	},
	{
		n: "03",
		icon: "🧠",
		title: "Vision Analysis",
		desc: "ViT / EfficientNet segment land patterns — water, vegetation, urban cover"
	},
	{
		n: "04",
		icon: "💬",
		title: "LLM Insight",
		desc: "GPT-OSS converts vision outputs into plain-language reports and answers questions"
	}
];
var marquee = [
	"PyTorch",
	"ViT",
	"GPT-OSS",
	"LLaMA",
	"OpenCV",
	"Rasterio",
	"GDAL",
	"FastAPI",
	"Sentinel Hub",
	"NASA Earthdata",
	"ISRO EO",
	"Plotly",
	"EfficientNet",
	"Mistral"
];
function NovaLanding() {
	const progressRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const container = document.getElementById("stars");
		if (container && container.childElementCount === 0) for (let i = 0; i < 220; i++) {
			const star = document.createElement("div");
			star.className = "nova-star";
			const size = Math.random() * 2.5 + .5;
			star.style.width = `${size}px`;
			star.style.height = `${size}px`;
			star.style.top = `${Math.random() * 100}%`;
			star.style.left = `${Math.random() * 100}%`;
			star.style.setProperty("--o", `${Math.random() * .7 + .1}`);
			star.style.setProperty("--d", `${Math.random() * 4 + 2}s`);
			container.appendChild(star);
		}
		const onScroll = () => {
			const h = document.documentElement;
			const pct = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
			if (progressRef.current) progressRef.current.style.width = `${pct}%`;
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
		const io = new IntersectionObserver((entries) => {
			entries.forEach((e) => {
				if (e.isIntersecting) {
					e.target.classList.add("nova-in");
					io.unobserve(e.target);
				}
			});
		}, { threshold: .12 });
		document.querySelectorAll(".nova-reveal").forEach((el) => io.observe(el));
		const onMove = (e) => {
			document.querySelectorAll(".nova-spot").forEach((el) => {
				const r = el.getBoundingClientRect();
				el.style.setProperty("--mx", `${e.clientX - r.left}px`);
				el.style.setProperty("--my", `${e.clientY - r.top}px`);
			});
		};
		window.addEventListener("mousemove", onMove);
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("mousemove", onMove);
			io.disconnect();
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "nova-root",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "nova-progress",
				ref: progressRef
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { id: "stars" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "nova-grid-overlay" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "nova-grain" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "nova-nav",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "nova-logo",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "nova-dot" }),
							"NOVA AI",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "nova-live",
								children: "● LIVE"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "nova-links",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#problem",
								children: "Problem"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#solution",
								children: "Solution"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/aichat",
								children: "Try Demo"
							}) })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "nova-tag",
						children: "SIH25170"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "hero",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hero-orb orb1" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hero-orb orb2" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hero-orb orb3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hero-inner",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "nova-reveal",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "hero-eyebrow",
									children: "Where Space Meets AI"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "nebula-text",
										children: "Multimodal AI"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"for Earth",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "accent",
										children: ["Observation", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "accent-cursor" })]
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "hero-sub",
									children: "NOVA AI enhances GPT-OSS with vision capabilities built for ISRO Earth Observation data — turning raw satellite imagery into clear, actionable intelligence."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "hero-cta",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/aichat",
										className: "btn btn-primary",
										children: "Launch Demo"
									})
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hero-visual nova-reveal",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
									className: "orbit-svg",
									viewBox: "0 0 520 520",
									"aria-hidden": true,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("radialGradient", {
											id: "glow",
											cx: "50%",
											cy: "50%",
											r: "50%",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
												offset: "0%",
												stopColor: "#6c47ff",
												stopOpacity: "0.5"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
												offset: "100%",
												stopColor: "#6c47ff",
												stopOpacity: "0"
											})]
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
											cx: "260",
											cy: "260",
											r: "240",
											fill: "url(#glow)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
											cx: "260",
											cy: "260",
											r: "240",
											fill: "none",
											stroke: "rgba(120,100,255,0.08)",
											strokeDasharray: "4 6"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
											cx: "260",
											cy: "260",
											r: "185",
											fill: "none",
											stroke: "rgba(108,71,255,0.18)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
											cx: "260",
											cy: "260",
											r: "130",
											fill: "none",
											stroke: "rgba(0,229,200,0.22)"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "orbit-ring r3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "sat",
										children: "🛰"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "orbit-ring r2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "sat",
										children: "📡"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "orbit-ring r1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "sat",
										children: "✦"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "globe-core",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "globe-emoji",
										children: "🌍"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "scan-line" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ping ping1" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ping ping2" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ping ping3" })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "scroll-hint",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "SCROLL" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "scroll-bar",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "marquee",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "marquee-track",
					children: [...marquee, ...marquee].map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "marquee-item",
						children: ["◆ ", m]
					}, i))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "divider" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				id: "problem",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "section-header nova-reveal",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "section-eyebrow",
								children: "The Challenge"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Why satellite data stays dark" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "section-sub",
								children: "Earth Observation generates petabytes of imagery. Without AI, most of it goes unread — and disasters go undetected."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "problem-grid",
						children: problems.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "problem-card nova-spot nova-reveal",
							style: { transitionDelay: `${i * 60}ms` },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "prob-icon",
									children: p.icon
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "prob-title",
									children: p.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "prob-desc",
									children: p.desc
								})
							]
						}, p.title))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "divider" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				id: "solution",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "section-header nova-reveal",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "section-eyebrow",
								children: "How NOVA AI Works"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "From raw image to clear insight" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "section-sub",
								children: "A four-stage pipeline that combines computer vision and large language models to translate satellite imagery into human-readable intelligence."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flow",
						children: flow.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flow-item nova-reveal",
							style: { transitionDelay: `${i * 100}ms` },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flow-step nova-spot",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "step-num",
										children: s.n
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "step-icon",
										children: s.icon
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "step-title",
										children: s.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "step-desc",
										children: s.desc
									})
								]
							}), i < flow.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flow-arrow",
								children: "→"
							})]
						}, s.n))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "NOVA AI" }), " · Team Yakuzas · SIH25170 · Where the Space Meets AI"] })
		]
	});
}
//#endregion
export { NovaLanding as component };
