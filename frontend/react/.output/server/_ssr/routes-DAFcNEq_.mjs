import { a as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import "./router-BjfSz_WH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DAFcNEq_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var flow = [
	{
		n: "01",
		icon: "📤",
		title: "Image Validation",
		desc: "Format, size, and dimension checks; conversion to RGB"
	},
	{
		n: "02",
		icon: "🧠",
		title: "RemoteCLIP ViT-L-14",
		desc: "Encodes the image and scores it against EO text prompts, zero-shot"
	},
	{
		n: "03",
		icon: "⚙️",
		title: "EO Interpreter",
		desc: "Filters noise, maps tags to land-cover categories, assigns confidence"
	},
	{
		n: "04",
		icon: "🧩",
		title: "Prompt Builder",
		desc: "Constructs constrained analyst prompt from structured EO context only"
	},
	{
		n: "05",
		icon: "💬",
		title: "LLM Report",
		desc: "Generates a formal Earth Observation analysis report"
	}
];
var landCoverTypes = [
	{
		name: "Forest",
		color: "#10b981"
	},
	{
		name: "Vegetation",
		color: "#10b981"
	},
	{
		name: "Agriculture",
		color: "#84cc16"
	},
	{
		name: "Annual Crop",
		color: "#84cc16"
	},
	{
		name: "Residential",
		color: "#a855f7"
	},
	{
		name: "Industrial",
		color: "#f43f5e"
	},
	{
		name: "Water",
		color: "#0ea5e9"
	},
	{
		name: "River",
		color: "#38bdf8"
	},
	{
		name: "Water Body",
		color: "#0ea5e9"
	},
	{
		name: "Desert",
		color: "#eab308"
	},
	{
		name: "Flood",
		color: "#0ea5e9"
	}
];
var tech = [
	{
		label: "Vision",
		title: "RemoteCLIP ViT-L-14",
		tags: [
			"OpenCLIP",
			"PyTorch",
			"Pillow"
		],
		aurora: false
	},
	{
		label: "Backend",
		title: "API & Server",
		tags: [
			"FastAPI",
			"Pydantic v2",
			"Uvicorn"
		],
		aurora: false
	},
	{
		label: "LLM",
		title: "OpenRouter",
		tags: ["Provider-abstracted", "Swappable Local Model"],
		aurora: true
	},
	{
		label: "Frontend",
		title: "Interactive UI",
		tags: [
			"React 18",
			"Vite",
			"TanStack Router"
		],
		aurora: false
	}
];
var marquee = [
	"PyTorch",
	"RemoteCLIP",
	"OpenRouter",
	"FastAPI",
	"React",
	"Zero-Shot",
	"Earth Observation",
	"ISRO EO",
	"Vite",
	"Pydantic"
];
function NovaLanding() {
	const progressRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const container = document.getElementById("stars");
		if (container && container.childElementCount === 0) {
			const frag = document.createDocumentFragment();
			for (let i = 0; i < 150; i++) {
				const star = document.createElement("div");
				star.className = "nova-star";
				const size = Math.random() * 2.5 + .5;
				star.style.width = `${size}px`;
				star.style.height = `${size}px`;
				star.style.top = `${Math.random() * 100}%`;
				star.style.left = `${Math.random() * 100}%`;
				star.style.setProperty("--o", `${Math.random() * .7 + .1}`);
				star.style.setProperty("--d", `${Math.random() * 4 + 2}s`);
				frag.appendChild(star);
			}
			container.appendChild(frag);
		}
		let ticking = false;
		const onScroll = () => {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					const h = document.documentElement;
					const pct = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
					if (progressRef.current) progressRef.current.style.width = `${pct}%`;
					ticking = false;
				});
				ticking = true;
			}
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
		let rafId;
		const onMoveRoot = (e) => {
			if (rafId) cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame(() => {
				document.body.style.setProperty("--mouse-x", `${e.clientX}px`);
				document.body.style.setProperty("--mouse-y", `${e.clientY}px`);
			});
		};
		window.addEventListener("mousemove", onMoveRoot);
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("mousemove", onMoveRoot);
			io.disconnect();
			if (rafId) cancelAnimationFrame(rafId);
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
								href: "#solution",
								onClick: (e) => {
									e.preventDefault();
									document.getElementById("solution")?.scrollIntoView({ behavior: "smooth" });
								},
								children: "How it Works"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#landcover",
								onClick: (e) => {
									e.preventDefault();
									document.getElementById("landcover")?.scrollIntoView({ behavior: "smooth" });
								},
								children: "Land Cover"
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
									"Turn satellite imagery into a",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "nebula-text",
										children: "professional"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"analyst report",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "accent-cursor" })
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "hero-sub",
									children: "Powered by RemoteCLIP ViT-L-14 zero-shot classification and LLM reasoning, with declared confidence and limitations on every result."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "hero-cta",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/aichat",
										className: "btn btn-primary",
										children: "Try Now"
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
						onClick: () => document.getElementById("solution")?.scrollIntoView({ behavior: "smooth" }),
						role: "button",
						tabIndex: 0,
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
				id: "solution",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "section-header nova-reveal",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "section-eyebrow",
									children: "How NOVA AI Works"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "From raw image to clear insight" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "section-sub",
									children: "A five-stage pipeline combining zero-shot computer vision and large language models to translate satellite imagery into human-readable intelligence."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flow",
							children: flow.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flow-step nova-spot nova-reveal",
								style: { transitionDelay: `${i * 100}ms` },
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
							}, s.n))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "nova-reveal",
							style: {
								textAlign: "center",
								color: "var(--aurora)",
								marginTop: "40px",
								fontSize: "0.95rem"
							},
							children: "The language model never sees the image — it receives only validated, structured findings, which is what prevents fabricated observations."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "divider" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				id: "landcover",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "section-header nova-reveal",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "section-eyebrow",
								children: "Zero-Shot Capabilities"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Supported Land Cover Types" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "section-sub",
								children: "Classification is zero-shot, meaning new categories can be added purely by defining a text label — no retraining or labelled dataset required."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "landcover-grid",
						children: landCoverTypes.map((type, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "landcover-card nova-spot nova-reveal",
							style: { transitionDelay: `${i % 4 * 60}ms` },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "lc-dot",
								style: { backgroundColor: type.color }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "lc-name",
								children: type.name
							})]
						}, type.name))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "divider" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				id: "sample",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "section-header nova-reveal",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "section-eyebrow",
							children: "Sample Output"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Analysis & Limitations" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sample-flex nova-reveal",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "sample-card nova-spot",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "sc-header",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "sc-title",
										children: "Forest Scene Analysis"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "sc-sub",
										children: "Dominant: Forest / Secondary: Water"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "sc-badge",
										children: "Confidence: High"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "sc-bar",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
											width: "70%",
											backgroundColor: "#10b981"
										} }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
											width: "20%",
											backgroundColor: "#0ea5e9"
										} }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
											width: "10%",
											backgroundColor: "#333"
										} })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "sc-text",
									children: "The provided satellite imagery is dominated by dense, unbroken forest canopy (70%), indicative of a mature woodland ecosystem. The spectral signature strongly aligns with active vegetation."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "sc-text",
									children: "A secondary land cover of water (20%) is detected, likely representing a river or lake intersecting the forested region. The clean division between these areas suggests natural geographical boundaries without significant human intervention."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "sc-meta",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Vision: RemoteCLIP ViT-L-14" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "LLM: GPT-4o-mini" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Processed in 2.4s" })
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "limitations-card",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "System Limitations" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The system states what it cannot do on every response to ensure analytical integrity:" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Zero-shot semantic interpretation — no fine-tuning on EO labels" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No pixel-level segmentation or object boundary detection" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No object counting or instance detection" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No temporal or change-detection analysis" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Based on image-text similarity, not spectral analysis" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "May degrade on atypical viewpoints, cloud cover, or low resolution" })
								] })
							]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "divider" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				id: "tech",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "section-header nova-reveal",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "section-eyebrow",
							children: "Under The Hood"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Technologies Used" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "tech-grid",
						children: tech.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "tech-card nova-spot nova-reveal",
							style: { transitionDelay: `${i * 60}ms` },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "tech-label",
									children: t.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "tech-title",
									children: t.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "tech-tags",
									children: t.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `tag ${t.aurora ? "aurora" : ""}`,
										children: tag
									}, tag))
								})
							]
						}, t.label))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "divider" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				id: "cta",
				style: {
					padding: "100px 20px",
					textAlign: "center",
					background: "var(--deep)"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "nova-reveal",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Start analyzing imagery instantly." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-sub",
							style: {
								marginBottom: "40px",
								margin: "14px auto 40px auto",
								maxWidth: "500px"
							},
							children: "No setup required. Experience zero-shot classification directly in your browser."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/aichat",
							className: "btn btn-primary",
							style: {
								padding: "16px 40px",
								fontSize: "1.1rem"
							},
							children: "Try Now"
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "NOVA AI" }), " · Team Yakuzas · SIH25170 · Where Space Meets AI"] })
		]
	});
}
//#endregion
export { NovaLanding as component };
