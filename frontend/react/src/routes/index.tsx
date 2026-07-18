import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import "./index.css";

export const Route = createFileRoute("/")({
  component: NovaLanding,
});

const flow = [
  { n: "01", icon: "📤", title: "Image Validation", desc: "Format, size, and dimension checks; conversion to RGB" },
  { n: "02", icon: "🧠", title: "RemoteCLIP ViT-L-14", desc: "Encodes the image and scores it against EO text prompts, zero-shot" },
  { n: "03", icon: "⚙️", title: "EO Interpreter", desc: "Filters noise, maps tags to land-cover categories, assigns confidence" },
  { n: "04", icon: "🧩", title: "Prompt Builder", desc: "Constructs constrained analyst prompt from structured EO context only" },
  { n: "05", icon: "💬", title: "LLM Report", desc: "Generates a formal Earth Observation analysis report" },
];

const landCoverTypes = [
  { name: "Forest", color: "#10b981" },
  { name: "Vegetation", color: "#10b981" },
  { name: "Agriculture", color: "#84cc16" },
  { name: "Annual Crop", color: "#84cc16" },
  { name: "Residential", color: "#a855f7" },
  { name: "Industrial", color: "#f43f5e" },
  { name: "Water", color: "#0ea5e9" },
  { name: "River", color: "#38bdf8" },
  { name: "Water Body", color: "#0ea5e9" },
  { name: "Desert", color: "#eab308" },
  { name: "Flood", color: "#0ea5e9" },
];

const tech = [
  { label: "Vision", title: "RemoteCLIP ViT-L-14", tags: ["OpenCLIP", "PyTorch", "Pillow"], aurora: false },
  { label: "Backend", title: "API & Server", tags: ["FastAPI", "Pydantic v2", "Uvicorn"], aurora: false },
  { label: "LLM", title: "OpenRouter", tags: ["Provider-abstracted", "Swappable Local Model"], aurora: true },
  { label: "Frontend", title: "Interactive UI", tags: ["React 18", "Vite", "TanStack Router"], aurora: false },
];

const marquee = ["PyTorch", "RemoteCLIP", "OpenRouter", "FastAPI", "React", "Zero-Shot", "Earth Observation", "ISRO EO", "Vite", "Pydantic"];

function NovaLanding() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Starfield
    const container = document.getElementById("stars");
    if (container && container.childElementCount === 0) {
      const frag = document.createDocumentFragment();
      for (let i = 0; i < 150; i++) {
        const star = document.createElement("div");
        star.className = "nova-star";
        const size = Math.random() * 2.5 + 0.5;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.setProperty("--o", `${Math.random() * 0.7 + 0.1}`);
        star.style.setProperty("--d", `${Math.random() * 4 + 2}s`);
        frag.appendChild(star);
      }
      container.appendChild(frag);
    }

    // Scroll progress
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const h = document.documentElement;
          const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
          if (progressRef.current) progressRef.current.style.width = `${pct}%`;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Reveal on scroll
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("nova-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".nova-reveal").forEach((el) => io.observe(el));

    // Cursor spotlight on cards - OPTIMIZED
    let rafId: number;
    const onMoveRoot = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        document.body.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.body.style.setProperty('--mouse-y', `${e.clientY}px`);
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

  return (
    <div className="nova-root">
      <style>{css}</style>

      <div className="nova-progress" ref={progressRef} />

      <div id="stars" />
      <div className="nova-grid-overlay" />
      <div className="nova-grain" />

      <nav className="nova-nav">
        <div className="nova-logo">
          <div className="nova-dot" />
          NOVA AI
          <span className="nova-live">● LIVE</span>
        </div>
        <ul className="nova-links">
          <li><a href="#solution">How it Works</a></li>
          <li><a href="#landcover">Land Cover</a></li>
          <li><Link to="/aichat">Try Demo</Link></li>
        </ul>
        <div className="nova-tag">SIH25170</div>
      </nav>

      <section id="hero">
        <div className="hero-orb orb1" />
        <div className="hero-orb orb2" />
        <div className="hero-orb orb3" />
        <div className="hero-inner">
          <div className="nova-reveal">
            <div className="hero-eyebrow">Where Space Meets AI</div>
            <h1>
              Turn satellite imagery into a<br />
              <span className="nebula-text">professional</span>
              <br />
              analyst report
              <span className="accent-cursor" />
            </h1>
            <p className="hero-sub">
              Powered by RemoteCLIP ViT-L-14 zero-shot classification and LLM reasoning, with declared confidence and limitations on every result.
            </p>
            <div className="hero-cta">
              <Link to="/aichat" className="btn btn-primary">
                Try Now
              </Link>
            </div>
          </div>

          <div className="hero-visual nova-reveal">
            <svg className="orbit-svg" viewBox="0 0 520 520" aria-hidden>
              <defs>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#6c47ff" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#6c47ff" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="260" cy="260" r="240" fill="url(#glow)" />
              <circle cx="260" cy="260" r="240" fill="none" stroke="rgba(120,100,255,0.08)" strokeDasharray="4 6" />
              <circle cx="260" cy="260" r="185" fill="none" stroke="rgba(108,71,255,0.18)" />
              <circle cx="260" cy="260" r="130" fill="none" stroke="rgba(0,229,200,0.22)" />
            </svg>
            <div className="orbit-ring r3">
              <span className="sat">🛰</span>
            </div>
            <div className="orbit-ring r2">
              <span className="sat">📡</span>
            </div>
            <div className="orbit-ring r1">
              <span className="sat">✦</span>
            </div>
            <div className="globe-core">
              <span className="globe-emoji">🌍</span>
              <div className="scan-line" />
            </div>
            <div className="ping ping1" />
            <div className="ping ping2" />
            <div className="ping ping3" />
          </div>
        </div>

        <div 
          className="scroll-hint" 
          onClick={() => document.getElementById('solution')?.scrollIntoView({ behavior: 'smooth' })}
          role="button"
          tabIndex={0}
        >
          <span>SCROLL</span>
          <div className="scroll-bar"><div /></div>
        </div>
      </section>

      <div className="marquee">
        <div className="marquee-track">
          {[...marquee, ...marquee].map((m, i) => (
            <span key={i} className="marquee-item">◆ {m}</span>
          ))}
        </div>
      </div>

      <div className="divider" />

      <section id="solution">
        <div className="container">
          <div className="section-header nova-reveal">
            <div className="section-eyebrow">How NOVA AI Works</div>
            <h2>From raw image to clear insight</h2>
            <p className="section-sub">
              A five-stage pipeline combining zero-shot computer vision and large language models to translate satellite imagery into human-readable intelligence.
            </p>
          </div>
          <div className="flow">
            {flow.map((s, i) => (
              <div key={s.n} className="flow-step nova-spot nova-reveal" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="step-num">{s.n}</div>
                <div className="step-icon">{s.icon}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
          <p className="nova-reveal" style={{ textAlign: "center", color: "var(--aurora)", marginTop: "40px", fontSize: "0.95rem" }}>
            The language model never sees the image — it receives only validated, structured findings, which is what prevents fabricated observations.
          </p>
        </div>
      </section>

      <div className="divider" />

      <section id="landcover">
        <div className="container">
          <div className="section-header nova-reveal">
            <div className="section-eyebrow">Zero-Shot Capabilities</div>
            <h2>Supported Land Cover Types</h2>
            <p className="section-sub">
              Classification is zero-shot, meaning new categories can be added purely by defining a text label — no retraining or labelled dataset required.
            </p>
          </div>
          <div className="landcover-grid">
            {landCoverTypes.map((type, i) => (
              <div key={type.name} className="landcover-card nova-spot nova-reveal" style={{ transitionDelay: `${(i % 4) * 60}ms` }}>
                <div className="lc-dot" style={{ backgroundColor: type.color }} />
                <div className="lc-name">{type.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      <section id="sample">
        <div className="container">
          <div className="section-header nova-reveal">
            <div className="section-eyebrow">Sample Output</div>
            <h2>Analysis & Limitations</h2>
          </div>
          <div className="sample-flex nova-reveal">
            <div className="sample-card nova-spot">
              <div className="sc-header">
                <div>
                  <h3 className="sc-title">Forest Scene Analysis</h3>
                  <div className="sc-sub">Dominant: Forest / Secondary: Water</div>
                </div>
                <div className="sc-badge">Confidence: High</div>
              </div>
              <div className="sc-bar">
                <div style={{ width: "70%", backgroundColor: "#10b981" }} />
                <div style={{ width: "20%", backgroundColor: "#0ea5e9" }} />
                <div style={{ width: "10%", backgroundColor: "#333" }} />
              </div>
              <p className="sc-text">
                The provided satellite imagery is dominated by dense, unbroken forest canopy (70%), indicative of a mature woodland ecosystem. The spectral signature strongly aligns with active vegetation.
              </p>
              <p className="sc-text">
                A secondary land cover of water (20%) is detected, likely representing a river or lake intersecting the forested region. The clean division between these areas suggests natural geographical boundaries without significant human intervention.
              </p>
              <div className="sc-meta">
                <span>Vision: RemoteCLIP ViT-L-14</span>
                <span>LLM: GPT-4o-mini</span>
                <span>Processed in 2.4s</span>
              </div>
            </div>
            
            <div className="limitations-card">
              <h3>System Limitations</h3>
              <p>The system states what it cannot do on every response to ensure analytical integrity:</p>
              <ul>
                <li>Zero-shot semantic interpretation — no fine-tuning on EO labels</li>
                <li>No pixel-level segmentation or object boundary detection</li>
                <li>No object counting or instance detection</li>
                <li>No temporal or change-detection analysis</li>
                <li>Based on image-text similarity, not spectral analysis</li>
                <li>May degrade on atypical viewpoints, cloud cover, or low resolution</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      <section id="tech">
        <div className="container">
          <div className="section-header nova-reveal">
            <div className="section-eyebrow">Under The Hood</div>
            <h2>Technologies Used</h2>
          </div>
          <div className="tech-grid">
            {tech.map((t, i) => (
              <div key={t.label} className="tech-card nova-spot nova-reveal" style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="tech-label">{t.label}</div>
                <div className="tech-title">{t.title}</div>
                <div className="tech-tags">
                  {t.tags.map((tag) => (
                    <div key={tag} className={`tag ${t.aurora ? "aurora" : ""}`}>{tag}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />
      
      <section id="cta" style={{ padding: "100px 20px", textAlign: "center", background: "var(--deep)" }}>
         <div className="nova-reveal">
            <h2>Start analyzing imagery instantly.</h2>
            <p className="section-sub" style={{ marginBottom: "40px", margin: "14px auto 40px auto", maxWidth: "500px" }}>No setup required. Experience zero-shot classification directly in your browser.</p>
            <Link to="/aichat" className="btn btn-primary" style={{ padding: "16px 40px", fontSize: "1.1rem" }}>
              Try Now
            </Link>
         </div>
      </section>

      <footer>
        <span>NOVA AI</span> · Team Yakuzas · SIH25170 · Where Space Meets AI
      </footer>
    </div>
  );
}

const css = `
.nova-root {
  --void: #03030a;
  --deep: #080818;
  --surface: #0d0d24;
  --card: #11112e;
  --border: rgba(120, 100, 255, 0.18);
  --nebula: #6c47ff;
  --nebula-glow: rgba(108, 71, 255, 0.35);
  --aurora: #00e5c8;
  --aurora-glow: rgba(0, 229, 200, 0.25);
  --star: #f0edff;
  --muted: rgba(240, 237, 255, 0.55);
  --dim: rgba(240, 237, 255, 0.28);
  --danger: #ff4e6a;
  --green: #00e5a0;
  background: var(--void);
  color: var(--star);
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.65;
  min-height: 100vh;
  position: relative;
}
.nova-root * { box-sizing: border-box; }
.nova-root h1, .nova-root h2, .nova-root h3, .nova-root p, .nova-root ul { margin: 0; padding: 0; }
.nova-root ul { list-style: none; }

/* progress bar */
.nova-progress {
  position: fixed; top: 0; left: 0; height: 2px; width: 0%;
  background: linear-gradient(90deg, var(--nebula), var(--aurora));
  z-index: 200; box-shadow: 0 0 12px var(--aurora-glow);
  transition: width 0.05s linear;
}

/* starfield */
#stars {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 60% 40% at 80% 10%, rgba(108,71,255,0.15) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 10% 80%, rgba(0,229,200,0.08) 0%, transparent 60%),
    radial-gradient(ellipse 80% 60% at 50% 0%, #1a0a3a 0%, var(--void) 70%);
}
.nova-star {
  position: absolute; border-radius: 50%; background: white;
  animation: nova-tw var(--d, 3s) ease-in-out infinite alternate;
  opacity: var(--o, 0.6);
  box-shadow: 0 0 4px rgba(255,255,255,0.5);
}
@keyframes nova-tw {
  from { opacity: var(--o); transform: scale(1); }
  to { opacity: calc(var(--o) * 0.15); transform: scale(0.7); }
}

/* grid + grain overlays */
.nova-grid-overlay {
  position: fixed; inset: 0; z-index: 1; pointer-events: none;
  background-image:
    linear-gradient(rgba(120,100,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(120,100,255,0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 40%, transparent 90%);
}
.nova-grain {
  position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: 0.06;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
}

/* nav */
.nova-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  padding: 16px 40px; display: flex; align-items: center; justify-content: space-between;
  background: rgba(3, 3, 10, 0.65); backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--border);
}
.nova-logo {
  font-family: 'Space Mono', monospace; font-size: 1.05rem; font-weight: 700;
  color: var(--aurora); letter-spacing: 0.08em; display: flex; align-items: center; gap: 10px;
}
.nova-dot {
  width: 8px; height: 8px; border-radius: 50%; background: var(--aurora);
  box-shadow: 0 0 12px var(--aurora); animation: nova-pulse 2s ease-in-out infinite;
}
.nova-live {
  font-size: 0.6rem; color: var(--danger); letter-spacing: 0.2em; margin-left: 6px;
  animation: nova-blink 1.6s ease-in-out infinite;
}
@keyframes nova-blink { 0%,100%{opacity:1} 50%{opacity:0.35} }
@keyframes nova-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.6} }
.nova-links { display: flex; gap: 30px; }
.nova-links a {
  color: var(--muted); text-decoration: none; font-size: 0.85rem; letter-spacing: 0.05em;
  position: relative; transition: color 0.2s;
}
.nova-links a::after {
  content: ''; position: absolute; left: 0; bottom: -6px; width: 0; height: 1px;
  background: var(--aurora); transition: width 0.25s;
}
.nova-links a:hover { color: var(--star); }
.nova-links a:hover::after { width: 100%; }
.nova-tag {
  font-family: 'Space Mono', monospace; font-size: 0.7rem; color: var(--nebula);
  border: 1px solid var(--nebula); padding: 4px 10px; border-radius: 20px;
  letter-spacing: 0.08em; box-shadow: inset 0 0 12px rgba(108,71,255,0.15);
}

/* sections */
.nova-root section { position: relative; z-index: 2; }
.container { max-width: 1140px; margin: 0 auto; padding: 0 40px; }

/* hero */
#hero {
  min-height: 100vh; display: flex; align-items: center;
  padding: 120px 40px 80px; position: relative; overflow: hidden;
}
.hero-orb { position: absolute; border-radius: 50%; filter: blur(120px); pointer-events: none; }
.orb1 { width: 620px; height: 620px; top: -120px; right: -160px; background: rgba(108,71,255,0.22); animation: nova-drift 18s ease-in-out infinite alternate; }
.orb2 { width: 420px; height: 420px; bottom: -120px; left: -120px; background: rgba(0,229,200,0.14); animation: nova-drift 22s ease-in-out infinite alternate-reverse; }
.orb3 { width: 300px; height: 300px; top: 40%; left: 45%; background: rgba(255,78,106,0.06); animation: nova-drift 26s ease-in-out infinite alternate; }
@keyframes nova-drift {
  from { transform: translate(0,0) scale(1); }
  to   { transform: translate(40px,-30px) scale(1.1); }
}
.hero-inner {
  max-width: 1140px; margin: 0 auto; width: 100%;
  display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
}
.hero-eyebrow {
  font-family: 'Space Mono', monospace; font-size: 0.72rem; color: var(--aurora);
  letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 22px;
  display: flex; align-items: center; gap: 12px;
}
.hero-eyebrow::before { content: ''; width: 34px; height: 1px; background: var(--aurora); }
.nova-root h1 {
  font-size: clamp(2.8rem, 5vw, 4.3rem); font-weight: 700; line-height: 1.05;
  letter-spacing: -0.02em; margin-bottom: 24px;
}
.nova-root h1 .accent { color: var(--aurora); position: relative; }
.accent-cursor {
  display: inline-block; width: 3px; height: 0.9em; background: var(--aurora);
  margin-left: 6px; vertical-align: middle; animation: nova-blink 1s steps(2) infinite;
  box-shadow: 0 0 12px var(--aurora);
}
.nebula-text {
  background: linear-gradient(135deg, var(--nebula) 0%, var(--aurora) 50%, var(--nebula) 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: nova-shine 6s linear infinite;
}
@keyframes nova-shine { to { background-position: 200% 0; } }
.nova-root .hero-sub { color: var(--muted); font-size: 1.05rem; max-width: 460px; margin-bottom: 36px; }
.hero-cta { display: flex; gap: 14px; flex-wrap: wrap; }
.btn {
  padding: 13px 28px; border-radius: 8px; font-family: 'Space Grotesk', sans-serif;
  font-size: 0.9rem; font-weight: 600; letter-spacing: 0.03em; cursor: pointer;
  border: none; text-decoration: none; transition: all 0.25s; display: inline-block;
  position: relative; overflow: hidden;
}
.btn-primary {
  background: linear-gradient(135deg, var(--nebula), #8867ff); color: white;
  box-shadow: 0 0 30px var(--nebula-glow), inset 0 1px 0 rgba(255,255,255,0.15);
}
.btn-primary::after {
  content: ''; position: absolute; inset: 0; background: linear-gradient(120deg,transparent 30%,rgba(255,255,255,0.25) 50%,transparent 70%);
  transform: translateX(-100%); transition: transform 0.6s;
}
.btn-primary:hover::after { transform: translateX(100%); }
.btn-primary:hover { box-shadow: 0 0 50px var(--nebula-glow); transform: translateY(-2px); }
.btn-ghost { background: rgba(255,255,255,0.02); color: var(--star); border: 1px solid var(--border); backdrop-filter: blur(10px); }
.btn-ghost:hover { border-color: var(--aurora); color: var(--aurora); box-shadow: 0 0 24px rgba(0,229,200,0.2); }

.hero-stats {
  margin-top: 42px; display: grid; grid-template-columns: repeat(4,1fr); gap: 14px;
  padding-top: 26px; border-top: 1px solid var(--border);
}
.hero-stat .hs-v {
  font-family: 'Space Mono', monospace; font-size: 1.4rem; color: var(--star);
  background: linear-gradient(135deg, var(--star), var(--aurora));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.hero-stat .hs-l { font-size: 0.7rem; color: var(--dim); letter-spacing: 0.15em; text-transform: uppercase; margin-top: 4px; font-family:'Space Mono',monospace; }

/* satellite visual */
.hero-visual { display: flex; align-items: center; justify-content: center; position: relative; height: 520px; }
.orbit-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.orbit-ring {
  position: absolute; border-radius: 50%; border: 1px solid var(--border);
  animation: nova-spin var(--spd, 20s) linear infinite;
}
.orbit-ring .sat {
  position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
  font-size: 1.2rem; filter: drop-shadow(0 0 8px var(--aurora));
}
@keyframes nova-spin { to { transform: rotate(360deg); } }
.r1 { width: 260px; height: 260px; --spd: 14s; }
.r2 { width: 370px; height: 370px; --spd: 22s; border-color: rgba(108,71,255,0.22); }
.r2 .sat { filter: drop-shadow(0 0 8px var(--nebula)); }
.r3 { width: 480px; height: 480px; --spd: 34s; border-style: dashed; border-color: rgba(120,100,255,0.12); }
.r3 .sat { filter: drop-shadow(0 0 8px var(--danger)); }
.globe-core {
  width: 160px; height: 160px; border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #2a3a8c, #0d0d24 55%, #03030a);
  box-shadow: 0 0 80px rgba(108,71,255,0.5), inset 0 0 50px rgba(0,229,200,0.15);
  position: relative; z-index: 2; display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.globe-emoji { font-size: 3.8rem; filter: drop-shadow(0 0 12px rgba(0,229,200,0.4)); }
.scan-line {
  position: absolute; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--aurora), transparent);
  animation: nova-scan 3s linear infinite; box-shadow: 0 0 12px var(--aurora);
}
@keyframes nova-scan { 0%{top:0} 100%{top:100%} }
.ping {
  position: absolute; width: 10px; height: 10px; border-radius: 50%;
  background: var(--aurora); box-shadow: 0 0 12px var(--aurora);
}
.ping::after {
  content:''; position:absolute; inset:-4px; border-radius:50%;
  border: 1px solid var(--aurora); animation: nova-ping 2.2s ease-out infinite;
}
@keyframes nova-ping { 0%{transform:scale(1);opacity:1} 100%{transform:scale(4);opacity:0} }
.ping1 { top: 22%; left: 30%; }
.ping2 { top: 68%; right: 24%; background: var(--nebula); box-shadow:0 0 12px var(--nebula); animation-delay: 0.6s; }
.ping2::after { border-color: var(--nebula); }
.ping3 { bottom: 18%; left: 40%; background: var(--danger); box-shadow:0 0 12px var(--danger); animation-delay: 1.2s; }
.ping3::after { border-color: var(--danger); }

.scroll-hint {
  position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  font-family: 'Space Mono', monospace; font-size: 0.65rem; letter-spacing: 0.3em; color: var(--dim);
  text-decoration: none; cursor: pointer; transition: color 0.3s;
}
.scroll-hint:hover { color: var(--aurora); }
.scroll-bar { width: 1px; height: 40px; background: rgba(255,255,255,0.1); overflow: hidden; }
.scroll-bar > div { width: 100%; height: 40%; background: var(--aurora); animation: nova-slide 2s ease-in-out infinite; }
@keyframes nova-slide { 0%{transform:translateY(-100%)} 100%{transform:translateY(250%)} }

/* marquee */
.marquee {
  position: relative; z-index: 2; overflow: hidden;
  border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  background: rgba(8,8,24,0.5); padding: 14px 0;
  mask-image: linear-gradient(90deg, transparent, black 10%, black 90%, transparent);
}
.marquee-track { display: flex; gap: 40px; width: max-content; animation: nova-marq 40s linear infinite; }
.marquee-item {
  font-family: 'Space Mono', monospace; font-size: 0.75rem; letter-spacing: 0.15em;
  color: var(--muted); white-space: nowrap;
}
.marquee-item:nth-child(odd) { color: var(--aurora); }
@keyframes nova-marq { to { transform: translateX(-50%); } }

/* section header */
.section-header { text-align: center; margin-bottom: 60px; }
.section-eyebrow {
  font-family: 'Space Mono', monospace; font-size: 0.7rem; color: var(--aurora);
  letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 14px;
}
.nova-root h2 { font-size: clamp(1.9rem, 3vw, 2.6rem); font-weight: 700; letter-spacing: -0.015em; }
.nova-root .section-sub { color: var(--muted); margin: 14px auto 0; max-width: 640px; }

/* OPTIMIZED CURSOR SPOTLIGHT */
.nova-spot { position: relative; }
.nova-spot::before {
  content: ''; position: absolute; left: 0; top: 0; width: 100%; height: 100%;
  pointer-events: none; border-radius: inherit; z-index: 0;
  background: radial-gradient(250px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(108,71,255,0.1), transparent 40%);
  opacity: 0; transition: opacity 0.3s;
}
.nova-spot:hover::before { opacity: 1; }
.nova-spot > * { position: relative; z-index: 1; pointer-events: auto; }

/* reveal */
.nova-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
.nova-in { opacity: 1; transform: translateY(0); }

/* solution */
#solution { padding: 110px 40px; background: var(--deep); position: relative; }
.flow { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; }
.flow-step {
  flex: 1 1 180px; max-width: 240px;
  background: linear-gradient(180deg, var(--card), var(--surface));
  border: 1px solid var(--border); border-radius: 14px; padding: 24px 20px;
  text-align: center; transition: border-color 0.2s, transform 0.2s;
  display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
}
.flow-step:hover { border-color: var(--aurora); transform: translateY(-4px); box-shadow: 0 20px 60px -30px var(--aurora-glow); }
.step-num { font-family: 'Space Mono', monospace; font-size: 0.68rem; color: var(--aurora); letter-spacing: 0.15em; margin-bottom: 12px; }
.step-icon { font-size: 2.2rem; margin-bottom: 10px; }
.step-title { font-size: 0.95rem; font-weight: 600; margin-bottom: 6px; }
.step-desc { font-size: 0.8rem; color: var(--muted); }

/* landcover */
#landcover { padding: 110px 40px; }
.landcover-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; max-width: 1000px; margin: 0 auto; }
.landcover-card {
  background: linear-gradient(180deg, var(--card), var(--surface));
  border: 1px solid var(--border); border-radius: 10px; padding: 18px;
  display: flex; align-items: center; gap: 12px; transition: transform 0.2s, border-color 0.2s;
}
.landcover-card:hover { transform: translateY(-2px); border-color: var(--nebula); }
.lc-dot { width: 14px; height: 14px; border-radius: 50%; box-shadow: inset 0 0 4px rgba(0,0,0,0.3); }
.lc-name { font-size: 0.95rem; font-weight: 500; }

/* sample */
#sample { padding: 110px 40px; background: var(--deep); }
.sample-flex { display: flex; gap: 60px; max-width: 1000px; margin: 0 auto; align-items: flex-start; }
.sample-card {
  flex: 3; background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 32px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}
.sc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.sc-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 4px; }
.sc-sub { font-size: 0.85rem; color: var(--muted); }
.sc-badge { background: rgba(0, 229, 200, 0.1); color: var(--aurora); padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; border: 1px solid rgba(0, 229, 200, 0.3); }
.sc-bar { display: flex; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 24px; }
.sc-text { color: var(--muted); font-size: 0.9rem; margin-bottom: 12px; line-height: 1.6; }
.sc-meta { margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border); font-family: 'Space Mono', monospace; font-size: 0.75rem; color: var(--dim); display: flex; flex-wrap: wrap; gap: 16px; }

.limitations-card { flex: 2; padding-top: 12px; }
.limitations-card h3 { color: var(--aurora); margin-bottom: 12px; font-size: 1.2rem; }
.limitations-card p { color: var(--muted); font-size: 0.9rem; margin-bottom: 20px; }
.limitations-card ul li { color: var(--star); font-size: 0.9rem; margin-bottom: 12px; position: relative; padding-left: 18px; }
.limitations-card ul li::before { content: '•'; color: var(--nebula); position: absolute; left: 0; }

/* tech */
#tech { padding: 110px 40px; }
.tech-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
.tech-card {
  background: linear-gradient(180deg, var(--card), var(--surface));
  border: 1px solid var(--border); border-radius: 14px; padding: 26px;
  transition: border-color 0.25s, transform 0.2s;
}
.tech-card:hover { border-color: var(--nebula); transform: translateY(-4px); }
.tech-label { font-family: 'Space Mono', monospace; font-size: 0.65rem; color: var(--nebula); letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 12px; }
.tech-title { font-size: 1rem; font-weight: 600; margin-bottom: 12px; }
.tech-tags { display: flex; flex-wrap: wrap; gap: 7px; }
.tag {
  font-size: 0.72rem; padding: 4px 10px; border-radius: 20px;
  background: rgba(108,71,255,0.12); border: 1px solid rgba(108,71,255,0.28);
  color: var(--muted); font-family: 'Space Mono', monospace;
}
.tag.aurora { background: rgba(0,229,200,0.1); border-color: rgba(0,229,200,0.28); color: var(--aurora); }

footer {
  border-top: 1px solid var(--border); padding: 32px 40px; text-align: center;
  color: var(--dim); font-size: 0.82rem; font-family: 'Space Mono', monospace;
  position: relative; z-index: 2;
}
footer span { color: var(--aurora); }
.divider { height: 1px; background: linear-gradient(90deg, transparent, var(--border), transparent); position: relative; z-index: 2; }

@media (max-width: 900px) {
  .tech-grid { grid-template-columns: repeat(2,1fr); }
  .sample-flex { flex-direction: column; }
}
@media (max-width: 768px) {
  .nova-nav { padding: 14px 20px; }
  .nova-links { display: none; }
  #hero { padding: 110px 20px 80px; }
  .hero-inner { grid-template-columns: 1fr; gap: 40px; }
  .hero-visual { height: 380px; }
  .hero-stats { grid-template-columns: repeat(2,1fr); }
  .container, #solution, #tech, #landcover, #sample {
    padding-left: 20px; padding-right: 20px;
  }
  .tech-grid { grid-template-columns: 1fr; }
  .flow { flex-direction: column; align-items: stretch; gap: 16px; }
  .flow-step { max-width: none; }
  .scroll-hint { display: none; }
}
`
