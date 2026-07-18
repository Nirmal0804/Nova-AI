import{n as e,o as t,r as n,t as r}from"./index-DRHSuJpK.js";var i=t(n()),a=e(),o=[{icon:`🔍`,title:`Manual Interpretation`,desc:`Trained analysts spend hours manually reviewing satellite images to extract basic land-use patterns — a bottleneck that doesn't scale.`},{icon:`⏱️`,title:`Slow Disaster Analysis`,desc:`When floods or wildfires strike, response teams need imagery-based intelligence in minutes. Current pipelines take days.`},{icon:`🧩`,title:`Fragmented EO Insights`,desc:`Spectral bands, NDVI indices, and radar data live in separate tools — no single system converts them into unified, readable insights.`},{icon:`📡`,title:`Inaccessible for Non-Experts`,desc:`Complex satellite data formats and GIS tooling lock out environmental agencies, planners, and first responders who need answers fast.`}],s=[{n:`01`,icon:`📤`,title:`Image Ingestion`,desc:`User uploads satellite image or connects to ISRO EO data streams via API`},{n:`02`,icon:`⚙️`,title:`Preprocessing`,desc:`Rasterio & GDAL normalize imagery; OpenCV handles spatial calibration`},{n:`03`,icon:`🧠`,title:`Vision Analysis`,desc:`ViT / EfficientNet segment land patterns — water, vegetation, urban cover`},{n:`04`,icon:`💬`,title:`LLM Insight`,desc:`GPT-OSS converts vision outputs into plain-language reports and answers questions`}],c=[`PyTorch`,`ViT`,`GPT-OSS`,`LLaMA`,`OpenCV`,`Rasterio`,`GDAL`,`FastAPI`,`Sentinel Hub`,`NASA Earthdata`,`ISRO EO`,`Plotly`,`EfficientNet`,`Mistral`];function l(){let e=(0,i.useRef)(null);return(0,i.useEffect)(()=>{let t=document.getElementById(`stars`);if(t&&t.childElementCount===0)for(let e=0;e<220;e++){let e=document.createElement(`div`);e.className=`nova-star`;let n=Math.random()*2.5+.5;e.style.width=`${n}px`,e.style.height=`${n}px`,e.style.top=`${Math.random()*100}%`,e.style.left=`${Math.random()*100}%`,e.style.setProperty(`--o`,`${Math.random()*.7+.1}`),e.style.setProperty(`--d`,`${Math.random()*4+2}s`),t.appendChild(e)}let n=()=>{let t=document.documentElement,n=t.scrollTop/(t.scrollHeight-t.clientHeight)*100;e.current&&(e.current.style.width=`${n}%`)};window.addEventListener(`scroll`,n,{passive:!0}),n();let r=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting&&(e.target.classList.add(`nova-in`),r.unobserve(e.target))})},{threshold:.12});document.querySelectorAll(`.nova-reveal`).forEach(e=>r.observe(e));let i=e=>{document.querySelectorAll(`.nova-spot`).forEach(t=>{let n=t.getBoundingClientRect();t.style.setProperty(`--mx`,`${e.clientX-n.left}px`),t.style.setProperty(`--my`,`${e.clientY-n.top}px`)})};return window.addEventListener(`mousemove`,i),()=>{window.removeEventListener(`scroll`,n),window.removeEventListener(`mousemove`,i),r.disconnect()}},[]),(0,a.jsxs)(`div`,{className:`nova-root`,children:[(0,a.jsx)(`style`,{children:u}),(0,a.jsx)(`div`,{className:`nova-progress`,ref:e}),(0,a.jsx)(`div`,{id:`stars`}),(0,a.jsx)(`div`,{className:`nova-grid-overlay`}),(0,a.jsx)(`div`,{className:`nova-grain`}),(0,a.jsxs)(`nav`,{className:`nova-nav`,children:[(0,a.jsxs)(`div`,{className:`nova-logo`,children:[(0,a.jsx)(`div`,{className:`nova-dot`}),`NOVA AI`,(0,a.jsx)(`span`,{className:`nova-live`,children:`● LIVE`})]}),(0,a.jsxs)(`ul`,{className:`nova-links`,children:[(0,a.jsx)(`li`,{children:(0,a.jsx)(`a`,{href:`#problem`,children:`Problem`})}),(0,a.jsx)(`li`,{children:(0,a.jsx)(`a`,{href:`#solution`,children:`Solution`})}),(0,a.jsx)(`li`,{children:(0,a.jsx)(r,{to:`/aichat`,children:`Try Demo`})})]}),(0,a.jsx)(`div`,{className:`nova-tag`,children:`SIH25170`})]}),(0,a.jsxs)(`section`,{id:`hero`,children:[(0,a.jsx)(`div`,{className:`hero-orb orb1`}),(0,a.jsx)(`div`,{className:`hero-orb orb2`}),(0,a.jsx)(`div`,{className:`hero-orb orb3`}),(0,a.jsxs)(`div`,{className:`hero-inner`,children:[(0,a.jsxs)(`div`,{className:`nova-reveal`,children:[(0,a.jsx)(`div`,{className:`hero-eyebrow`,children:`Where Space Meets AI`}),(0,a.jsxs)(`h1`,{children:[(0,a.jsx)(`span`,{className:`nebula-text`,children:`Multimodal AI`}),(0,a.jsx)(`br`,{}),`for Earth`,(0,a.jsx)(`br`,{}),(0,a.jsxs)(`span`,{className:`accent`,children:[`Observation`,(0,a.jsx)(`span`,{className:`accent-cursor`})]})]}),(0,a.jsx)(`p`,{className:`hero-sub`,children:`NOVA AI enhances GPT-OSS with vision capabilities built for ISRO Earth Observation data — turning raw satellite imagery into clear, actionable intelligence.`}),(0,a.jsx)(`div`,{className:`hero-cta`,children:(0,a.jsx)(r,{to:`/aichat`,className:`btn btn-primary`,children:`Launch Demo`})})]}),(0,a.jsxs)(`div`,{className:`hero-visual nova-reveal`,children:[(0,a.jsxs)(`svg`,{className:`orbit-svg`,viewBox:`0 0 520 520`,"aria-hidden":!0,children:[(0,a.jsx)(`defs`,{children:(0,a.jsxs)(`radialGradient`,{id:`glow`,cx:`50%`,cy:`50%`,r:`50%`,children:[(0,a.jsx)(`stop`,{offset:`0%`,stopColor:`#6c47ff`,stopOpacity:`0.5`}),(0,a.jsx)(`stop`,{offset:`100%`,stopColor:`#6c47ff`,stopOpacity:`0`})]})}),(0,a.jsx)(`circle`,{cx:`260`,cy:`260`,r:`240`,fill:`url(#glow)`}),(0,a.jsx)(`circle`,{cx:`260`,cy:`260`,r:`240`,fill:`none`,stroke:`rgba(120,100,255,0.08)`,strokeDasharray:`4 6`}),(0,a.jsx)(`circle`,{cx:`260`,cy:`260`,r:`185`,fill:`none`,stroke:`rgba(108,71,255,0.18)`}),(0,a.jsx)(`circle`,{cx:`260`,cy:`260`,r:`130`,fill:`none`,stroke:`rgba(0,229,200,0.22)`})]}),(0,a.jsx)(`div`,{className:`orbit-ring r3`,children:(0,a.jsx)(`span`,{className:`sat`,children:`🛰`})}),(0,a.jsx)(`div`,{className:`orbit-ring r2`,children:(0,a.jsx)(`span`,{className:`sat`,children:`📡`})}),(0,a.jsx)(`div`,{className:`orbit-ring r1`,children:(0,a.jsx)(`span`,{className:`sat`,children:`✦`})}),(0,a.jsxs)(`div`,{className:`globe-core`,children:[(0,a.jsx)(`span`,{className:`globe-emoji`,children:`🌍`}),(0,a.jsx)(`div`,{className:`scan-line`})]}),(0,a.jsx)(`div`,{className:`ping ping1`}),(0,a.jsx)(`div`,{className:`ping ping2`}),(0,a.jsx)(`div`,{className:`ping ping3`})]})]}),(0,a.jsxs)(`div`,{className:`scroll-hint`,children:[(0,a.jsx)(`span`,{children:`SCROLL`}),(0,a.jsx)(`div`,{className:`scroll-bar`,children:(0,a.jsx)(`div`,{})})]})]}),(0,a.jsx)(`div`,{className:`marquee`,children:(0,a.jsx)(`div`,{className:`marquee-track`,children:[...c,...c].map((e,t)=>(0,a.jsxs)(`span`,{className:`marquee-item`,children:[`◆ `,e]},t))})}),(0,a.jsx)(`div`,{className:`divider`}),(0,a.jsx)(`section`,{id:`problem`,children:(0,a.jsxs)(`div`,{className:`container`,children:[(0,a.jsxs)(`div`,{className:`section-header nova-reveal`,children:[(0,a.jsx)(`div`,{className:`section-eyebrow`,children:`The Challenge`}),(0,a.jsx)(`h2`,{children:`Why satellite data stays dark`}),(0,a.jsx)(`p`,{className:`section-sub`,children:`Earth Observation generates petabytes of imagery. Without AI, most of it goes unread — and disasters go undetected.`})]}),(0,a.jsx)(`div`,{className:`problem-grid`,children:o.map((e,t)=>(0,a.jsxs)(`div`,{className:`problem-card nova-spot nova-reveal`,style:{transitionDelay:`${t*60}ms`},children:[(0,a.jsx)(`div`,{className:`prob-icon`,children:e.icon}),(0,a.jsx)(`div`,{className:`prob-title`,children:e.title}),(0,a.jsx)(`div`,{className:`prob-desc`,children:e.desc})]},e.title))})]})}),(0,a.jsx)(`div`,{className:`divider`}),(0,a.jsx)(`section`,{id:`solution`,children:(0,a.jsxs)(`div`,{className:`container`,children:[(0,a.jsxs)(`div`,{className:`section-header nova-reveal`,children:[(0,a.jsx)(`div`,{className:`section-eyebrow`,children:`How NOVA AI Works`}),(0,a.jsx)(`h2`,{children:`From raw image to clear insight`}),(0,a.jsx)(`p`,{className:`section-sub`,children:`A four-stage pipeline that combines computer vision and large language models to translate satellite imagery into human-readable intelligence.`})]}),(0,a.jsx)(`div`,{className:`flow`,children:s.map((e,t)=>(0,a.jsxs)(`div`,{className:`flow-item nova-reveal`,style:{transitionDelay:`${t*100}ms`},children:[(0,a.jsxs)(`div`,{className:`flow-step nova-spot`,children:[(0,a.jsx)(`div`,{className:`step-num`,children:e.n}),(0,a.jsx)(`div`,{className:`step-icon`,children:e.icon}),(0,a.jsx)(`div`,{className:`step-title`,children:e.title}),(0,a.jsx)(`div`,{className:`step-desc`,children:e.desc})]}),t<s.length-1&&(0,a.jsx)(`div`,{className:`flow-arrow`,children:`→`})]},e.n))})]})}),(0,a.jsxs)(`footer`,{children:[(0,a.jsx)(`span`,{children:`NOVA AI`}),` · Team Yakuzas · SIH25170 · Where the Space Meets AI`]})]})}var u=`
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
  overflow-x: hidden;
  position: relative;
}
.nova-root * { box-sizing: border-box; }
.nova-root h1, .nova-root h2, .nova-root p, .nova-root ul { margin: 0; padding: 0; }
.nova-root ul { list-style: none; }
html { scroll-behavior: smooth; }

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
.hero-sub { color: var(--muted); font-size: 1.05rem; max-width: 460px; margin-bottom: 36px; }
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
}
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
.section-sub { color: var(--muted); margin: 14px auto 0; max-width: 540px; }

/* cursor spotlight */
.nova-spot { position: relative; }
.nova-spot::before {
  content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: radial-gradient(240px circle at var(--mx,50%) var(--my,50%), rgba(108,71,255,0.14), transparent 60%);
  opacity: 0; transition: opacity 0.3s; z-index: 0;
}
.nova-spot:hover::before { opacity: 1; }
.nova-spot > * { position: relative; z-index: 1; }

/* reveal */
.nova-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
.nova-in { opacity: 1; transform: translateY(0); }

/* problem */
#problem { padding: 110px 40px; }
.problem-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; }
.problem-card {
  background: linear-gradient(180deg, var(--card), var(--surface));
  border: 1px solid var(--border); border-radius: 14px; padding: 30px;
  transition: border-color 0.25s, transform 0.2s;
}
.problem-card::after {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, var(--nebula), var(--aurora));
  opacity: 0; transition: opacity 0.25s; z-index: 2;
}
.problem-card:hover { border-color: rgba(108,71,255,0.5); transform: translateY(-4px); }
.problem-card:hover::after { opacity: 1; }
.prob-icon { font-size: 2rem; margin-bottom: 14px; }
.prob-title { font-size: 1.02rem; font-weight: 600; margin-bottom: 8px; }
.prob-desc { color: var(--muted); font-size: 0.88rem; }

/* solution */
#solution { padding: 110px 40px; background: var(--deep); position: relative; }
.flow { display: flex; align-items: stretch; justify-content: center; flex-wrap: wrap; }
.flow-item { display: flex; align-items: center; }
.flow-step {
  background: linear-gradient(180deg, var(--card), var(--surface));
  border: 1px solid var(--border); border-radius: 14px; padding: 30px 24px;
  width: 220px; text-align: center; transition: border-color 0.2s, transform 0.2s;
}
.flow-step:hover { border-color: var(--aurora); transform: translateY(-4px); box-shadow: 0 20px 60px -30px var(--aurora-glow); }
.flow-arrow { color: var(--dim); font-size: 1.4rem; padding: 0 8px; }
.step-num { font-family: 'Space Mono', monospace; font-size: 0.68rem; color: var(--aurora); letter-spacing: 0.15em; margin-bottom: 12px; }
.step-icon { font-size: 2.2rem; margin-bottom: 10px; }
.step-title { font-size: 0.95rem; font-weight: 600; margin-bottom: 6px; }
.step-desc { font-size: 0.8rem; color: var(--muted); }

/* tech */
#tech { padding: 110px 40px; }
.tech-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
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


/* impact */
#impact { padding: 110px 40px; }
.impact-row { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; align-items: start; }
.impact-eyebrow { font-size: 0.78rem; font-family: 'Space Mono', monospace; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 20px; }
.impact-eyebrow.aurora { color: var(--aurora); }
.impact-eyebrow.nebula { color: var(--nebula); }
.sdg-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 14px; }
.sdg-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; transition: border-color 0.2s, transform 0.2s; }
.sdg-card:hover { border-color: var(--aurora); transform: translateY(-2px); }
.sdg-num { font-family: 'Space Mono', monospace; font-size: 0.7rem; color: var(--aurora); margin-bottom: 6px; letter-spacing: 0.1em; }
.sdg-title { font-size: 0.9rem; font-weight: 600; margin-bottom: 4px; }
.sdg-desc { font-size: 0.78rem; color: var(--muted); }
.audience-list { display: flex; flex-direction: column; gap: 14px; }
.aud-item { display: flex; gap: 16px; align-items: flex-start; padding: 20px; border-radius: 12px; border: 1px solid var(--border); background: var(--card); transition: border-color 0.2s, transform 0.2s; }
.aud-item:hover { border-color: var(--nebula); transform: translateY(-2px); }
.aud-icon { font-size: 1.5rem; margin-top: 2px; }
.aud-title { font-size: 0.92rem; font-weight: 600; margin-bottom: 4px; }
.aud-desc { font-size: 0.8rem; color: var(--muted); }

/* team */
#team { padding: 110px 40px; background: var(--deep); }
.team-banner {
  background:
    radial-gradient(600px circle at 20% 0%, rgba(108,71,255,0.18), transparent 60%),
    radial-gradient(600px circle at 80% 100%, rgba(0,229,200,0.14), transparent 60%),
    linear-gradient(135deg, rgba(108,71,255,0.06) 0%, rgba(0,229,200,0.04) 100%);
  border: 1px solid var(--border); border-radius: 20px; padding: 56px 60px; text-align: center;
  position: relative; overflow: hidden;
}
.team-banner::before {
  content: ''; position: absolute; inset: 0;
  background-image: linear-gradient(rgba(120,100,255,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(120,100,255,0.06) 1px, transparent 1px);
  background-size: 30px 30px; opacity: 0.6;
  mask-image: radial-gradient(ellipse at center, black, transparent 70%);
}
.team-name {
  font-family: 'Space Mono', monospace; font-size: 2.8rem; font-weight: 700;
  background: linear-gradient(135deg, var(--aurora), var(--nebula));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  letter-spacing: 0.14em; margin-bottom: 14px; position: relative;
}
.team-desc { color: var(--muted); max-width: 520px; margin: 0 auto 28px; position: relative; }
.badge-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; position: relative; }
.badge { font-family: 'Space Mono', monospace; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 6px 16px; border-radius: 20px; }
.badge-purple { background: rgba(108,71,255,0.15); border: 1px solid rgba(108,71,255,0.32); color: var(--nebula); }
.badge-teal { background: rgba(0,229,200,0.1); border: 1px solid rgba(0,229,200,0.28); color: var(--aurora); }
.badge-red { background: rgba(255,78,106,0.1); border: 1px solid rgba(255,78,106,0.28); color: var(--danger); }

footer {
  border-top: 1px solid var(--border); padding: 32px 40px; text-align: center;
  color: var(--dim); font-size: 0.82rem; font-family: 'Space Mono', monospace;
  position: relative; z-index: 2;
}
footer span { color: var(--aurora); }

.divider { height: 1px; background: linear-gradient(90deg, transparent, var(--border), transparent); position: relative; z-index: 2; }

@media (max-width: 900px) {
  .tech-grid { grid-template-columns: repeat(2,1fr); }
}
@media (max-width: 768px) {
  .nova-nav { padding: 14px 20px; }
  .nova-links { display: none; }
  #hero { padding: 110px 20px 80px; }
  .hero-inner { grid-template-columns: 1fr; gap: 40px; }
  .hero-visual { height: 380px; }
  .hero-stats { grid-template-columns: repeat(2,1fr); }
  .container, #problem, #solution, #tech, #impact, #team {
    padding-left: 20px; padding-right: 20px;
  }
  .problem-grid, .tech-grid { grid-template-columns: 1fr; }
  .flow { flex-direction: column; align-items: center; gap: 8px; }
  .flow-item { flex-direction: column; }
  .flow-arrow { transform: rotate(90deg); padding: 8px 0; }
  .impact-row { grid-template-columns: 1fr; }
  .sdg-grid { grid-template-columns: 1fr; }
  .team-banner { padding: 36px 24px; }
  .scroll-hint { display: none; }
}
`;export{l as component};