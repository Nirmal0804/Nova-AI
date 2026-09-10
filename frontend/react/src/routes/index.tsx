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
          <li><a href="#solution" onClick={(e) => { e.preventDefault(); document.getElementById('solution')?.scrollIntoView({ behavior: 'smooth' }); }}>How it Works</a></li>
          <li><a href="#landcover" onClick={(e) => { e.preventDefault(); document.getElementById('landcover')?.scrollIntoView({ behavior: 'smooth' }); }}>Land Cover</a></li>
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


