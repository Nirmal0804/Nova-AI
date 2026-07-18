import React, { useState, useRef } from "react";
import { analyzeImage } from "./api";

// Map Earth Observation categories to modern color accents/themes
const CATEGORY_COLORS = {
    Forest: "#10b981",       // green
    Agriculture: "#84cc16",  // lime
    Water: "#0ea5e9",        // light blue
    Residential: "#a855f7",  // purple
    Industrial: "#f43f5e",   // rose
    Desert: "#eab308",       // yellow
    Unknown: "#64748b",      // slate
};

function App() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const fileInputRef = useRef(null);

    // ---------------------------------------------------------------------------
    // Local File Validation and Handlers
    // ---------------------------------------------------------------------------

    const validateAndSetFile = (file) => {
        if (!file) return;

        setError(null);
        const validExtensions = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        const fileExtension = file.name.substring(file.name.lastIndexOf(".") + 1).toLowerCase();

        // Check type
        if (!validExtensions.includes(file.type) && !["jpg", "jpeg", "png", "webp"].includes(fileExtension)) {
            setError("Unsupported file format. Please upload a JPG, JPEG, PNG, or WEBP image.");
            return;
        }

        // Check size limit: 20MB
        const maxBytes = 20 * 1024 * 1024;
        if (file.size > maxBytes) {
            setError("File exceeds the maximum size limit of 20MB.");
            return;
        }

        setSelectedFile(file);
        setImagePreview(URL.createObjectURL(file));
        setResult(null); // Clear previous results
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current.click();
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);
        setImagePreview(null);
        setError(null);
        setResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // ---------------------------------------------------------------------------
    // Pipeline Trigger
    // ---------------------------------------------------------------------------

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await analyzeImage(selectedFile);
            setResult(response);
        } catch (err) {
            setError(err.message || "An unexpected error occurred during prediction.");
        } finally {
            setLoading(false);
        }
    };

    // ---------------------------------------------------------------------------
    // Simple Renderer for GPT Analysis Markdown
    // ---------------------------------------------------------------------------

    const parseMarkdownToJsx = (text) => {
        if (!text) return null;

        // Normalizes carriage returns and splits by double newlines for paragraphs / sections
        const blocks = text.split(/\n\n+/);

        return blocks.map((block, index) => {
            const cleanBlock = block.trim();
            if (!cleanBlock) return null;

            // Match header formats
            // 1. "### Heading" or "## Heading"
            if (cleanBlock.startsWith("###")) {
                return <h3 key={index}>{cleanBlock.replace(/^###\s+/, "")}</h3>;
            }
            if (cleanBlock.startsWith("##") || cleanBlock.startsWith("**")) {
                // Strip out enclosing ** if it looks like a bold header
                let headerText = cleanBlock;
                if (cleanBlock.startsWith("**") && cleanBlock.endsWith("**") && !cleanBlock.includes("\n")) {
                    headerText = cleanBlock.substring(2, cleanBlock.length - 2);
                } else {
                    headerText = cleanBlock.replace(/^##\s+/, "");
                }
                return <h2 key={index}>{headerText}</h2>;
            }

            // Check if it is a list block
            if (cleanBlock.startsWith("- ") || cleanBlock.startsWith("* ")) {
                const items = cleanBlock.split(/\n[-*]\s+/).map(item => item.replace(/^[-*]\s+/, ""));
                return (
                    <ul key={index}>
                        {items.map((li, i) => (
                            <li key={i}>{formatInlineBold(li)}</li>
                        ))}
                    </ul>
                );
            }

            // Normal paragraph with potential inline bold tags
            return <p key={index}>{formatInlineBold(cleanBlock)}</p>;
        });
    };

    // Helper to convert inline **text** parameters to <strong> nodes
    const formatInlineBold = (str) => {
        const parts = str.split(/\*\*([^*]+)\*\*/g);
        if (parts.length === 1) return str;

        return parts.map((part, index) => {
            // Every odd index in the split array represents a bold block
            if (index % 2 === 1) {
                return <strong key={index}>{part}</strong>;
            }
            return part;
        });
    };

    // ---------------------------------------------------------------------------
    // Render View Components
    // ---------------------------------------------------------------------------

    const renderBadge = (category) => {
        const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.Unknown;
        return (
            <span
                style={{
                    color: color,
                    background: `${color}15`,
                    border: `1px solid ${color}35`,
                    padding: "0.2rem 0.6rem",
                    borderRadius: "6px",
                    display: "inline-block",
                    fontSize: "0.85em",
                    fontWeight: 600
                }}
            >
                {category}
            </span>
        );
    };

    return (
        <div className="app-container">

            {/* HEADER SECTION */}
            <header className="header">
                <div className="brand-title">
                    NovaAI
                    <span className="brand-badge">Satellite Analyst</span>
                </div>
                <p className="subtitle">
                    Secure cloud-free Earth Observation intelligence. Upload multispectral or standard satellite imagery
                    for instant scene semantic mapping and GPT-driven ecological analysis.
                </p>
            </header>

            {/* DASHBOARD CONTAINER */}
            <main className="dashboard-grid">

                {/* LEFT COLUMN: upload & preview interface */}
                <section className="card upload-container">
                    <div className="card-title">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                        Satellite Imagery Source
                    </div>

                    {/* Interactive drop zone */}
                    {!imagePreview ? (
                        <div
                            className={`dropzone ${dragActive ? "active" : ""}`}
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            onClick={triggerFileSelect}
                        >
                            <div className="upload-icon">✦</div>
                            <div className="upload-text">
                                Drag & drop image here or <strong>browse files</strong>
                            </div>
                            <div className="upload-subtext">Supports PNG, JPG, JPEG, WEBP (Max 20MB)</div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="file-input"
                                onChange={handleFileChange}
                                accept=".png,.jpg,.jpeg,.webp"
                            />
                        </div>
                    ) : (
                        <div className="preview-container">
                            <div className="preview-wrapper">
                                <img src={imagePreview} alt="Selected satellite tile preview" className="preview-img" />
                            </div>
                            <div className="preview-actions">
                                <button className="btn btn-secondary" onClick={triggerFileSelect} disabled={loading}>
                                    Replace File
                                </button>
                                <button className="btn btn-danger" onClick={handleRemoveImage} disabled={loading}>
                                    Remove
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="file-input"
                                    onChange={handleFileChange}
                                    accept=".png,.jpg,.jpeg,.webp"
                                />
                            </div>
                        </div>
                    )}

                    {/* Client-side Validation Errors */}
                    {error && (
                        <div className="feedback-box feedback-error">
                            <div style={{ fontWeight: 'bold', marginRight: '4px' }}>Error:</div>
                            <div>{error}</div>
                        </div>
                    )}

                    {/* Run Inference Button */}
                    {selectedFile && !error && (
                        <button
                            className="btn btn-primary"
                            onClick={handleAnalyze}
                            disabled={loading}
                            style={{ width: "100%", marginTop: "0.5rem" }}
                        >
                            {loading ? "Processing..." : "Analyze Imagery"}
                        </button>
                    )}
                </section>

                {/* RIGHT COLUMN: results visualization */}
                <section className="card block-results" style={{ minHeight: "410px" }}>

                    {/* Welcome/Empty State */}
                    {!loading && !result && (
                        <div className="empty-state">
                            <div className="empty-icon">🛰️</div>
                            <div className="empty-text">No Scene Loaded</div>
                            <div className="empty-subtext">
                                Please upload a satellite capture tile and click "Analyze Imagery" to generate the intelligence report.
                            </div>
                        </div>
                    )}

                    {/* Loading Visualizer */}
                    {loading && (
                        <div className="loading-box">
                            <div className="spinner"></div>
                            <div className="loading-text">Analyzing satellite image...</div>
                            <div className="loading-subtext">Running RemoteCLIP classification and assembling AI analyst report.</div>
                        </div>
                    )}

                    {/* Classification Report Output */}
                    {!loading && result && (
                        <div className="results-container">

                            {/* Card Header with Confidence Tag */}
                            <div style={{ position: "relative" }}>
                                <div className="card-title" style={{ borderBottom: "none", marginBottom: "0" }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="2" y1="12" x2="22" y2="12" />
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                    </svg>
                                    Classification Report
                                </div>

                                <span className={`confidence-band confidence-${result.confidence}`}>
                                    {result.confidence} Confidence
                                </span>
                            </div>

                            {/* Warnings (e.g. partial success warning) */}
                            {result.status === "partial_success" && (
                                <div className="feedback-box feedback-warning">
                                    <div style={{ fontWeight: 'bold', marginRight: '6px' }}>Warning:</div>
                                    <div>AI explanation unavailable. (Vision metrics are shown below).</div>
                                </div>
                            )}

                            {/* Categorization Metrics */}
                            <div className="metrics-row">
                                <div className="metric-card">
                                    <div className="metric-label">Dominant Cover</div>
                                    <div className="metric-value">
                                        {result.dominant_land_cover}
                                    </div>
                                    <div style={{ marginTop: "0.5rem" }}>
                                        {renderBadge(result.dominant_land_cover)}
                                    </div>
                                </div>

                                <div className="metric-card">
                                    <div className="metric-label">Secondary Cover</div>
                                    <div className="metric-value">
                                        {result.secondary_land_cover || "None detected"}
                                    </div>
                                    {result.secondary_land_cover && (
                                        <div style={{ marginTop: "0.5rem" }}>
                                            {renderBadge(result.secondary_land_cover)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Deterministic Rule Summary callout */}
                            <div className="summary-box">
                                {result.summary}
                            </div>

                            {/* GPT Analyst Narrative */}
                            {result.status === "success" && result.gpt_analysis && (
                                <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "1.5rem" }}>
                                    <div className="report-content">
                                        {parseMarkdownToJsx(result.gpt_analysis)}
                                    </div>
                                </div>
                            )}

                            {/* Provenance Metadata Details Footer */}
                            <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "1.25rem", marginTop: "1rem" }}>
                                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    Pipeline Provenance & Performance
                                </div>
                                <table className="metadata-table">
                                    <tbody>
                                        <tr>
                                            <td className="metadata-label">Vision Model</td>
                                            <td className="metadata-val">{result.metadata.vision_model}</td>
                                        </tr>
                                        <tr>
                                            <td className="metadata-label">LLM Reasoning Model</td>
                                            <td className="metadata-val">{result.metadata.llm_model}</td>
                                        </tr>
                                        <tr>
                                            <td className="metadata-label">Processing Time</td>
                                            <td className="metadata-val">{result.metadata.processing_time_ms} ms</td>
                                        </tr>
                                        <tr>
                                            <td className="metadata-label">Timestamp (UTC)</td>
                                            <td className="metadata-val">{result.metadata.timestamp}</td>
                                        </tr>
                                        <tr>
                                            <td className="metadata-label">API Version</td>
                                            <td className="metadata-val">v{result.metadata.version}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    )}

                </section>

            </main>
        </div>
    );
}

export default App;
