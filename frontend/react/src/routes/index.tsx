import { createFileRoute, Link } from "@tanstack/react-router";
import "./landing.css";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

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

function LandingPage() {
  const scrollToWorks = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById("works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="landing-root">
      {/* 1. Hero */}
      <section className="landing-hero">
        <div className="landing-container">
          <h1>
            Turn a satellite image into a<br />
            <span className="landing-accent">professional Earth Observation</span><br />
            analyst report.
          </h1>
          <p className="landing-hero-sub">
            Powered by RemoteCLIP ViT-L-14 zero-shot classification and LLM reasoning, with declared confidence and limitations on every result.
          </p>
          <div className="landing-cta-group">
            <Link to="/aichat" className="landing-btn landing-btn-primary">
              Try Now
            </Link>
            <a href="#works" onClick={scrollToWorks} className="landing-btn landing-btn-secondary">
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* 2. How NovaAI Works */}
      <section id="works" className="landing-works">
        <div className="landing-container">
          <h2>How NovaAI Works</h2>
          <div className="landing-pipeline">
            <div className="landing-stage">
              <span className="landing-stage-num">01</span>
              <h3>Image Validation</h3>
              <p className="landing-stage-desc">Format, size, and dimension checks; conversion to RGB</p>
            </div>
            <div className="landing-stage">
              <span className="landing-stage-num">02</span>
              <h3>RemoteCLIP ViT-L-14</h3>
              <p className="landing-stage-desc">Encodes the image and scores it against EO text prompts, zero-shot, no training required</p>
            </div>
            <div className="landing-stage">
              <span className="landing-stage-num">03</span>
              <h3>EO Interpreter</h3>
              <p className="landing-stage-desc">Deterministic rule engine: filters noise, maps tags to canonical land-cover categories, ranks by similarity, assigns a confidence band</p>
            </div>
            <div className="landing-stage">
              <span className="landing-stage-num">04</span>
              <h3>Prompt Builder</h3>
              <p className="landing-stage-desc">Constructs a constrained analyst prompt from structured EO context only; raw model internals are never passed through</p>
            </div>
            <div className="landing-stage">
              <span className="landing-stage-num">05</span>
              <h3>LLM Report</h3>
              <p className="landing-stage-desc">Generates a formal Earth Observation analysis report</p>
            </div>
          </div>
          <p className="landing-emphasis">
            The language model never sees the image — it receives only validated, structured findings, which is what prevents fabricated observations.
          </p>
        </div>
      </section>

      {/* 3. Supported Land Cover Types */}
      <section className="landing-categories">
        <div className="landing-container">
          <h2>Supported Land Cover Types</h2>
          <div className="landing-grid">
            {landCoverTypes.map((type) => (
              <div key={type.name} className="landing-category-card">
                <div className="landing-color-dot" style={{ backgroundColor: type.color }} />
                <span>{type.name}</span>
              </div>
            ))}
          </div>
          <p className="landing-zero-shot-note">
            Classification is zero-shot, so new categories are added by defining a text label — no retraining or labelled data needed.
          </p>
        </div>
      </section>

      {/* 4. Sample Output */}
      <section className="landing-sample">
        <div className="landing-container">
          <h2>Analysis & Limitations</h2>
          <div className="landing-sample-flex">
            <div className="landing-sample-card">
              <div className="sample-header">
                <div>
                  <h3>Forest Scene Analysis</h3>
                  <p className="landing-hero-sub" style={{ margin: 0, fontSize: "0.9rem" }}>
                    Dominant: Forest / Secondary: Water
                  </p>
                </div>
                <div className="sample-badge">Confidence: High</div>
              </div>
              
              <div className="sample-bar">
                <div className="sample-bar-segment" style={{ width: "70%", backgroundColor: "#10b981" }} title="Forest: 70%" />
                <div className="sample-bar-segment" style={{ width: "20%", backgroundColor: "#0ea5e9" }} title="Water: 20%" />
                <div className="sample-bar-segment" style={{ width: "10%", backgroundColor: "#333" }} title="Other: 10%" />
              </div>

              <div className="sample-text">
                <p>
                  The provided satellite imagery is dominated by dense, unbroken forest canopy (70%), indicative of a mature woodland ecosystem. The spectral signature strongly aligns with active vegetation.
                </p>
                <p>
                  A secondary land cover of water (20%) is detected, likely representing a river or lake intersecting the forested region. The clean division between these areas suggests natural geographical boundaries without significant human intervention or recent disruption.
                </p>
              </div>

              <div className="sample-meta">
                <span>Vision: RemoteCLIP ViT-L-14</span>
                <span>LLM: GPT-4o-mini</span>
                <span>Processed in 2.4s</span>
              </div>
            </div>

            <div className="landing-limitations">
              <h3>System Limitations</h3>
              <p style={{ color: "var(--muted)", marginBottom: "20px", fontSize: "0.9rem" }}>
                The system states what it cannot do on every response to ensure analytical integrity:
              </p>
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

      {/* 5. Technologies */}
      <section className="landing-tech">
        <div className="landing-container">
          <h2>Technologies</h2>
          <div className="landing-tech-grid">
            <div className="landing-tech-group">
              <div className="landing-tech-label">Vision</div>
              <div className="landing-tech-list">RemoteCLIP ViT-L-14<br/>OpenCLIP<br/>PyTorch<br/>Pillow</div>
            </div>
            <div className="landing-tech-group">
              <div className="landing-tech-label">Backend</div>
              <div className="landing-tech-list">FastAPI<br/>Pydantic v2<br/>Uvicorn<br/>Tenacity</div>
            </div>
            <div className="landing-tech-group">
              <div className="landing-tech-label">LLM</div>
              <div className="landing-tech-list">OpenRouter<br/><span style={{ fontSize: "0.85rem", color: "var(--dim)" }}>(provider-abstracted — swappable for a local model)</span></div>
            </div>
            <div className="landing-tech-group">
              <div className="landing-tech-label">Frontend</div>
              <div className="landing-tech-list">React 18<br/>Vite<br/>TanStack Router</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Closing CTA */}
      <section className="landing-closing">
        <div className="landing-container">
          <Link to="/aichat" className="landing-btn landing-btn-primary" style={{ fontSize: "1.2rem", padding: "18px 40px" }}>
            Try Now
          </Link>
          <p className="landing-closing-copy">
            Start analyzing satellite imagery instantly. No setup required.
          </p>
        </div>
      </section>

    </div>
  );
}
