import json
import datetime

class HTMLRenderer:
    def render(self, analysis: dict, claude_json: dict, image_base64: str = None) -> str:
        now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        
        if image_base64 and not image_base64.startswith("data:"):
            image_base64 = f"data:image/jpeg;base64,{image_base64}"
            
        img_tag = f'<div class="preview-container"><img src="{image_base64}" class="satellite-preview" alt="Satellite Preview" /><div class="preview-glow"></div></div>' if image_base64 else ''
        
        # safely extract claude_json
        ed = claude_json.get("executive_dashboard", {})
        ea = claude_json.get("environmental_assessment", {})
        findings = claude_json.get("key_findings", [])
        recs = claude_json.get("recommendations", [])
        
        # Icons (Lucide-inspired embedded SVG icons)
        svg_home = '<svg class="svg-icon-cls" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
        svg_nature = '<svg class="svg-icon-cls" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 14H6"/><path d="M12 4a4 4 0 0 1 4 4c0 3-4 6-4 6s-4-3-4-6a4 4 0 0 1 4-4Z"/></svg>'
        svg_confidence = '<svg class="svg-icon-cls" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>'
        svg_alert = '<svg class="svg-icon-cls" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
        svg_status = '<svg class="svg-icon-cls" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="m16 12-4-4-4 4"/></svg>'
        svg_satellite = '<svg class="svg-icon-cls" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="6"/></svg>'
        
        svg_veg = '<svg class="svg-icon-cls" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8A7 7 0 0 1 11 20z"/></svg>'
        svg_urban = '<svg class="svg-icon-cls" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="16"/><line x1="15" y1="22" x2="15" y2="16"/></svg>'
        svg_water = '<svg class="svg-icon-cls" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z"/></svg>'
        svg_industry = '<svg class="svg-icon-cls" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20V9l4 2 4-2 4 2 8-4v13H2z"/></svg>'
        svg_lightbulb = '<svg class="svg-icon-cls" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>'
        svg_check = '<svg class="svg-icon-cls" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'

        # Redesigned key findings as premium cards
        findings_html = ""
        for i, f in enumerate(findings):
            headline = "Observation"
            desc = f
            if " - " in f:
                parts = f.split(" - ", 1)
                headline, desc = parts[0], parts[1]
            elif ": " in f:
                parts = f.split(": ", 1)
                headline, desc = parts[0], parts[1]
            
            # clean output to be exactly one concise sentence
            desc = desc.split(". ")[0] + "." if ". " in desc else desc
            
            # Alternate neon border/glow classes
            vibe_cls = f"vibe-f-{i % 4}"
            findings_html += f"""
            <div class="insight-card {vibe_cls}">
                <div class="insight-icon">{svg_check}</div>
                <div class="insight-body">
                    <h4 class="insight-headline">{headline}</h4>
                    <p class="insight-desc">{desc}</p>
                </div>
            </div>
            """

        # Redesigned AI recommendations as cards
        recs_html = ""
        for i, r in enumerate(recs):
            title = "Action Item"
            desc = r
            if " - " in r:
                parts = r.split(" - ", 1)
                title, desc = parts[0], parts[1]
            elif ": " in r:
                parts = r.split(": ", 1)
                title, desc = parts[0], parts[1]
                
            # clean output to be exactly one concise sentence
            desc = desc.split(". ")[0] + "." if ". " in desc else desc
            
            # Alternate neon border/glow classes
            vibe_cls = f"vibe-r-{i % 4}"
            recs_html += f"""
            <div class="rec-card {vibe_cls}">
                <div class="rec-icon">{svg_lightbulb}</div>
                <div class="rec-body">
                    <h4 class="rec-title">{title}</h4>
                    <p class="rec-desc">{desc}</p>
                </div>
            </div>
            """

        # Helpers for Environmental Assessment Badges
        def badge_color(val):
            val = str(val).lower()
            if 'high' in val: return 'bg-red'
            if 'medium' in val: return 'bg-yellow'
            if 'low' in val: return 'bg-green'
            if 'not detected' in val or 'none' in val: return 'bg-gray'
            if 'detected' in val: return 'bg-blue'
            return 'bg-gray'
            
        def status_display(val):
            val_lower = str(val).lower()
            if 'high' in val_lower: return 'HIGH'
            if 'medium' in val_lower: return 'MEDIUM'
            if 'low' in val_lower: return 'LOW'
            if 'detected' in val_lower and 'not' not in val_lower: return 'DETECTED'
            return 'NONE'

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NovaAI Geospatial Dashboard</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono&display=swap');
        
        :root {{
            --bg: #03030a;
            --surface: rgba(17, 17, 46, 0.45);
            --surface-hover: rgba(255, 255, 255, 0.04);
            --border: rgba(255, 255, 255, 0.08);
            --text-main: #f0edff;
            --text-muted: rgba(240, 237, 255, 0.55);
            
            /* Vibrant Brand Accent Colors */
            --neon-blue: #0088ff;
            --neon-green: #39d353;
            --neon-purple: #ae52ff;
            --neon-pink: #ff3366;
            --neon-orange: #ff9d00;
            --neon-cyan: #00f0ff;
            --neon-yellow: #ffd000;
            
            --bg-red: rgba(239, 68, 68, 0.12); --text-red: #fca5a5; --border-red: rgba(239, 68, 68, 0.25);
            --bg-yellow: rgba(245, 158, 11, 0.12); --text-yellow: #fcd34d; --border-yellow: rgba(245, 158, 11, 0.25);
            --bg-green: rgba(16, 185, 129, 0.12); --text-green: #a7f3d0; --border-green: rgba(16, 185, 129, 0.25);
            --bg-blue: rgba(59, 130, 246, 0.12); --text-blue: #bfdbfe; --border-blue: rgba(59, 130, 246, 0.25);
            --bg-gray: rgba(100, 116, 139, 0.12); --text-gray: #cbd5e1; --border-gray: rgba(100, 116, 139, 0.25);
        }}
        
        body {{
            font-family: 'Space Grotesk', -apple-system, sans-serif;
            background-color: var(--bg);
            color: var(--text-main);
            margin: 0;
            padding: 30px;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
        }}
        
        .container {{
            max-width: 1100px;
            margin: 0 auto;
        }}
        
        /* SECTION 1: HEADER & LOGO */
        .header-section {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 30px;
            border-bottom: 1px solid var(--border);
            padding-bottom: 30px;
            margin-bottom: 40px;
        }}
        
        .header-left {{
            flex: 1 1 400px;
        }}
        
        .logo-row {{
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 15px;
        }}
        
        .logo-orb {{
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: var(--neon-cyan);
            box-shadow: 0 0 15px var(--neon-cyan), 0 0 30px var(--neon-cyan);
            position: relative;
        }}
        
        .logo-text {{
            font-family: 'Space Mono', monospace;
            font-size: 1.3rem;
            font-weight: 700;
            letter-spacing: 0.1em;
            color: var(--text-main);
        }}
        
        .header-left h1 {{
            margin: 0;
            font-size: 38px;
            font-weight: 700;
            letter-spacing: -1px;
            background: linear-gradient(135deg, #ffffff 40%, var(--text-muted) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        
        .header-left h2 {{
            margin: 8px 0 0 0;
            font-size: 16px;
            color: var(--neon-cyan);
            font-family: 'Space Mono', monospace;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }}
        
        .header-left p {{
            margin: 15px 0 0 0;
            color: var(--text-muted);
            font-size: 13px;
            font-family: 'Space Mono', monospace;
        }}
        
        .header-right {{
            flex: 0 1 350px;
            display: flex;
            justify-content: center;
        }}
        
        .preview-container {{
            position: relative;
            border-radius: 20px;
            padding: 2px;
            background: linear-gradient(135deg, var(--neon-blue) 0%, var(--neon-purple) 50%, var(--neon-cyan) 100%);
            box-shadow: 0 20px 40px rgba(0,0,0,0.6);
        }}
        
        .satellite-preview {{
            display: block;
            max-width: 100%;
            height: auto;
            max-height: 220px;
            border-radius: 18px;
            object-fit: cover;
            position: relative;
            z-index: 2;
        }}
        
        .preview-glow {{
            position: absolute;
            inset: -10px;
            filter: blur(25px);
            background: radial-gradient(circle, var(--neon-purple) 0%, transparent 80%);
            opacity: 0.25;
            z-index: 1;
            pointer-events: none;
        }}
        
        /* SECTION TITLE styling */
        .section-title {{
            font-size: 16px;
            font-weight: 600;
            margin-top: 30px;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: rgba(240, 237, 255, 0.9);
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: 'Space Mono', monospace;
        }}
        
        .section-title::after {{
            content: '';
            flex-grow: 1;
            height: 1px;
            background: linear-gradient(90deg, var(--border) 0%, transparent 100%);
        }}

        /* SCENE OVERVIEW GRID (6 Cards - Redesigned with individual colors) */
        .kpi-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 16px;
            margin-bottom: 40px;
        }}
        
        .kpi-card {{
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 24px 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(12px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            text-align: center;
            min-height: 150px;
        }}
        
        /* Highlighting cards colorfully */
        .kpi-card:nth-child(1) {{ --card-accent: var(--neon-blue); border-top: 2px solid var(--neon-blue); }}
        .kpi-card:nth-child(2) {{ --card-accent: var(--neon-green); border-top: 2px solid var(--neon-green); }}
        .kpi-card:nth-child(3) {{ --card-accent: var(--neon-cyan); border-top: 2px solid var(--neon-cyan); }}
        .kpi-card:nth-child(4) {{ --card-accent: var(--neon-purple); border-top: 2px solid var(--neon-purple); }}
        .kpi-card:nth-child(5) {{ --card-accent: var(--neon-pink); border-top: 2px solid var(--neon-pink); }}
        .kpi-card:nth-child(6) {{ --card-accent: var(--neon-orange); border-top: 2px solid var(--neon-orange); }}

        .kpi-card:hover {{
            transform: translateY(-4px);
            border-color: var(--card-accent);
            box-shadow: 0 15px 30px rgba(0,0,0,0.4), 0 0 15px rgba(255, 255, 255, 0.02);
        }}
        
        .svg-icon-cls {{
            width: 28px;
            height: 28px;
            margin-bottom: 12px;
            color: var(--card-accent, var(--neon-cyan));
            stroke: currentColor;
            stroke-width: 2;
        }}
        
        .kpi-val {{
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 6px;
            color: #ffffff;
            text-transform: capitalize;
            letter-spacing: -0.2px;
        }}
        
        .kpi-label {{
            font-size: 11px;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.8px;
            font-family: 'Space Mono', monospace;
        }}
        
        /* ENVIRONMENTAL INDICATORS (Vibrant individual themes) */
        .env-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
            gap: 16px;
            margin-bottom: 40px;
        }}
        
        .env-card {{
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 24px 16px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            backdrop-filter: blur(12px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.25);
            transition: all 0.3s ease;
        }}
        
        .env-card:nth-child(1) {{ --env-color: var(--neon-green); }}
        .env-card:nth-child(2) {{ --env-color: var(--neon-purple); }}
        .env-card:nth-child(3) {{ --env-color: var(--neon-blue); }}
        .env-card:nth-child(4) {{ --env-color: var(--neon-orange); }}
        .env-card:nth-child(5) {{ --env-color: var(--neon-pink); }}

        .env-card:hover {{
            transform: translateY(-3px);
            border-color: var(--env-color);
        }}
        
        .env-card .svg-icon-cls {{
            color: var(--env-color);
        }}

        .env-title {{
            font-size: 12px;
            font-weight: 600;
            margin-top: 8px;
            margin-bottom: 16px;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-family: 'Space Mono', monospace;
        }}
        
        .badge {{
            padding: 6px 14px;
            border-radius: 30px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-family: 'Space Mono', monospace;
            border: 1px solid transparent;
        }}
        
        .bg-red {{ background: var(--bg-red); color: var(--text-red); border-color: var(--border-red); }}
        .bg-yellow {{ background: var(--bg-yellow); color: var(--text-yellow); border-color: var(--border-yellow); }}
        .bg-green {{ background: var(--bg-green); color: var(--text-green); border-color: var(--border-green); }}
        .bg-blue {{ background: var(--bg-blue); color: var(--text-blue); border-color: var(--border-blue); }}
        .bg-gray {{ background: var(--bg-gray); color: var(--text-gray); border-color: var(--border-gray); }}
        
        /* BOTTOM GRID (Vibrant themed card outlines) */
        .bottom-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
            gap: 25px;
        }}
        
        @media (max-width: 800px) {{
            .bottom-grid {{
                grid-template-columns: 1fr;
            }}
        }}
        
        .findings-container, .recs-container {{
            display: flex;
            flex-direction: column;
            gap: 14px;
        }}
        
        .insight-card, .rec-card {{
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 20px 24px;
            display: flex;
            gap: 16px;
            align-items: flex-start;
            backdrop-filter: blur(12px);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }}
        
        .vibe-f-0 {{ --card-accent: var(--neon-blue); border-left: 3px solid var(--neon-blue); }}
        .vibe-f-1 {{ --card-accent: var(--neon-purple); border-left: 3px solid var(--neon-purple); }}
        .vibe-f-2 {{ --card-accent: var(--neon-cyan); border-left: 3px solid var(--neon-cyan); }}
        .vibe-f-3 {{ --card-accent: var(--neon-green); border-left: 3px solid var(--neon-green); }}

        .vibe-r-0 {{ --card-accent: var(--neon-orange); border-left: 3px solid var(--neon-orange); }}
        .vibe-r-1 {{ --card-accent: var(--neon-pink); border-left: 3px solid var(--neon-pink); }}
        .vibe-r-2 {{ --card-accent: var(--neon-yellow); border-left: 3px solid var(--neon-yellow); }}
        .vibe-r-3 {{ --card-accent: var(--neon-cyan); border-left: 3px solid var(--neon-cyan); }}

        .insight-card:hover, .rec-card:hover {{
            transform: scale(1.01) translateY(-2px);
            border-color: var(--card-accent);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }}
        
        .insight-icon, .rec-icon {{
            width: 38px;
            height: 38px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }}
        
        .insight-icon svg, .rec-icon svg {{
            width: 20px;
            height: 20px;
            stroke-width: 2.5;
        }}
        
        .insight-icon {{
            background: rgba(0, 229, 200, 0.08);
            color: var(--card-accent, var(--neon-cyan));
            border: 1px solid rgba(0, 229, 200, 0.15);
        }}
        
        .rec-icon {{
            background: rgba(108, 71, 255, 0.1);
            color: var(--card-accent, #bfaaff);
            border: 1px solid rgba(108, 71, 255, 0.15);
        }}
        
        .insight-body, .rec-body {{
            flex-grow: 1;
        }}
        
        .insight-headline, .rec-title {{
            margin: 0 0 4px 0;
            font-size: 15px;
            font-weight: 600;
            color: #ffffff;
        }}
        
        .insight-desc, .rec-desc {{
            margin: 0;
            font-size: 13.5px;
            color: var(--text-muted);
            line-height: 1.5;
        }}
        
        @media print {{
            body {{ background: #fff; color: #000; }}
            .container {{ max-width: 100%; padding: 0; }}
            .header-left h1 {{ color: #000; }}
            .kpi-card, .env-card, .insight-card, .rec-card {{
                background: #f8f9fa; border: 1px solid #dee2e6; color: #000;
                border-radius: 8px; box-shadow: none; height: auto; min-height: 0;
            }}
            .kpi-label, .env-title {{ color: #495057; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        
        <!-- HEADER -->
        <div class="header-section">
            <div class="header-left">
                <div class="logo-row">
                    <div class="logo-orb"></div>
                    <div class="logo-text">NOVA AI</div>
                </div>
                <h1>Geospatial Intelligence Report</h1>
                <h2>Satellite Interpretation Framework</h2>
                <p>Generated: {now}</p>
            </div>
            <div class="header-right">
                {img_tag}
            </div>
        </div>

        <!-- SECTION 1: SCENE OVERVIEW -->
        <div class="section-title">Scene Overview</div>
        <div class="kpi-grid">
            <div class="kpi-card">
                {svg_home}
                <div class="kpi-val" title="{analysis.get('dominant_land_cover', 'N/A')}">{analysis.get('dominant_land_cover', 'N/A')}</div>
                <div class="kpi-label">Primary Cover</div>
            </div>
            <div class="kpi-card">
                {svg_nature}
                <div class="kpi-val" title="{analysis.get('secondary_land_cover') or 'None'}">{analysis.get('secondary_land_cover') or 'None'}</div>
                <div class="kpi-label">Secondary Cover</div>
            </div>
            <div class="kpi-card">
                {svg_confidence}
                <div class="kpi-val">{analysis.get('confidence', 'N/A')}</div>
                <div class="kpi-label">Confidence</div>
            </div>
            <div class="kpi-card">
                {svg_status}
                <div class="kpi-val">{ed.get("overall_status", "Stable")}</div>
                <div class="kpi-label">Overall Status</div>
            </div>
            <div class="kpi-card">
                {svg_alert}
                <div class="kpi-val">{ed.get('risk_level', analysis.get('risk_level') or 'Low')}</div>
                <div class="kpi-label">Risk Level</div>
            </div>
            <div class="kpi-card">
                {svg_satellite}
                <div class="kpi-val">{ed.get("scene_type", "Natural")}</div>
                <div class="kpi-label">Scene Type</div>
            </div>
        </div>

        <!-- SECTION 2: ENVIRONMENTAL INDICATORS -->
        <div class="section-title">Environmental Indicators</div>
        <div class="env-grid">
            <div class="env-card">
                {svg_veg}
                <div class="env-title">Vegetation</div>
                <div class="badge {badge_color(ea.get('vegetation', 'Unknown'))}">{status_display(ea.get("vegetation", "Unknown"))}</div>
            </div>
            <div class="env-card">
                {svg_urban}
                <div class="env-title">Urban Density</div>
                <div class="badge {badge_color(ea.get('urban_density', 'Unknown'))}">{status_display(ea.get("urban_density", "Unknown"))}</div>
            </div>
            <div class="env-card">
                {svg_water}
                <div class="env-title">Water Presence</div>
                <div class="badge {badge_color(ea.get('water_presence', 'Unknown'))}">{status_display(ea.get("water_presence", "Unknown"))}</div>
            </div>
            <div class="env-card">
                {svg_industry}
                <div class="env-title">Industrial Activity</div>
                <div class="badge {badge_color(ea.get('industrial_activity', 'Unknown'))}">{status_display(ea.get("industrial_activity", "Unknown"))}</div>
            </div>
            <div class="env-card">
                {svg_alert}
                <div class="env-title">Environmental Risk</div>
                <div class="badge {badge_color(ea.get('environmental_risk', 'Unknown'))}">{status_display(ea.get("environmental_risk", "Unknown"))}</div>
            </div>
        </div>

        <!-- SECTION 3 & 4: KEY FINDINGS & RECOMMENDATIONS -->
        <div class="bottom-grid">
            <div>
                <div class="section-title">Key Findings</div>
                <div class="findings-container">
                    {findings_html}
                </div>
            </div>
            <div>
                <div class="section-title">AI Recommendations</div>
                <div class="recs-container">
                    {recs_html}
                </div>
            </div>
        </div>

    </div>
</body>
</html>"""
        return html

html_renderer = HTMLRenderer()
