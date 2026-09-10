# 🛰️ NovaAI

### Multimodal Earth Observation Intelligence with RemoteCLIP and LLM Reasoning

NovaAI is a multimodal Earth Observation (EO) analysis system that combines **RemoteCLIP-based satellite image understanding** with **LLM reasoning** to turn satellite imagery into structured scene intelligence.

The system is designed around a staged analysis pipeline:

**Satellite Image → RemoteCLIP Vision → EO Interpretation → Prompt Construction → LLM Analysis → Professional Report**

It provides land-cover classification, confidence-aware interpretation, AI-generated analysis, risk assessment, provenance metadata, and an HTML-based professional report.

---

## ✨ Key Features

- 🛰️ **Satellite image analysis** using RemoteCLIP ViT-L/14
- 🌍 **Zero-shot Earth Observation classification** using candidate land-cover labels
- 🧠 **EO interpretation layer** that converts vision scores into structured scene context
- 🤖 **LLM-powered reasoning** through OpenRouter's OpenAI-compatible API
- 📊 **Structured analysis responses** with dominant and secondary land-cover classes
- 📝 **Professional AI reports** generated through a configurable report model
- 📄 **Unified HTML report rendering** with embedded imagery and analysis
- ⚡ **GPU acceleration** when CUDA is available, with CPU fallback
- ♻️ **RemoteCLIP singleton loading** to avoid reloading the large model for every request
- 🛡️ **Fault-tolerant pipeline** — LLM failures can return a `partial_success` response while preserving vision results
- 🔎 **Pipeline provenance** including vision model, LLM model, report model, processing time, timestamp, and API version
- 🖼️ **Frontend drag-and-drop image upload** with JPG/JPEG/PNG/WEBP validation and a 20 MB client-side limit

---

## 🧠 Architecture

```text
┌──────────────────────────────┐
│      Satellite Image         │
│   PNG / JPG / JPEG / WEBP    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Image Validation & Loading    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ RemoteCLIP ViT-L/14          │
│ Vision Encoder               │
│                              │
│ • Image embeddings           │
│ • Cosine similarities        │
│ • Zero-shot scores           │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ EO Interpreter               │
│                              │
│ • Dominant land cover        │
│ • Secondary land cover       │
│ • Relative confidence        │
│ • Scene summary              │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Prompt Builder               │
│ Structured EO Context        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ OpenRouter LLM               │
│ Configurable model           │
└──────────────┬───────────────┘
               │
               ├──────────────────────┐
               ▼                      ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│ Analyst Narrative        │  │ Professional Report      │
│ GPT/LLM analysis         │  │ Configurable report LLM  │
└──────────────┬───────────┘  └──────────────┬───────────┘
               │                             │
               └──────────────┬──────────────┘
                              ▼
                 ┌──────────────────────────┐
                 │ Unified AnalysisResponse │
                 │ + HTML Report            │
                 └──────────────────────────┘
```

---

## 🔬 Analysis Pipeline

### 1. Image validation

The backend validates the uploaded image before processing it and converts it into the expected image representation.

### 2. RemoteCLIP inference

NovaAI loads the **RemoteCLIP ViT-L/14** checkpoint and computes:

- Image embeddings
- Embedding statistics
- Zero-shot cosine similarity
- Softmax-based confidence scores
- Inference and total processing time

The RemoteCLIP checkpoint is downloaded automatically when it is missing or invalid.

### 3. Earth Observation interpretation

The raw zero-shot outputs are passed to a dedicated EO interpreter that derives structured scene information such as:

- Dominant land-cover class
- Secondary land-cover class
- Relative confidence
- Scene summary

### 4. LLM reasoning

The structured EO context is transformed into a prompt and sent to a configurable LLM through OpenRouter.

The LLM layer is intentionally separated from the vision pipeline so the vision output remains useful even when the external LLM is unavailable.

### 5. Professional report generation

When the LLM stage succeeds, NovaAI can generate a professional report containing structured sections such as:

- Executive dashboard
- Environmental assessment
- Key findings
- Recommendations

The report output is merged with deterministic fallbacks to preserve structural integrity when the report model is unavailable or returns invalid JSON.

### 6. Unified report rendering

The backend renders the final report into HTML, including the analyzed image, classification information, risk level, findings, recommendations, and supporting metadata.

---

## 🏗️ Project Structure

```text
Nova-AI/
│
├── backend/
│   ├── api/
│   │   ├── analyze.py
│   │   ├── chat.py
│   │   ├── insights.py
│   │   ├── interpreter.py
│   │   ├── report.py
│   │   └── vision.py
│   │
│   ├── config/
│   │   └── settings.py
│   │
│   ├── interpreter/
│   │   ├── eo_interpreter.py
│   │   ├── eo_rules.py
│   │   └── eo_schema.py
│   │
│   ├── llm/
│   │   ├── base.py
│   │   ├── gpt_service.py
│   │   └── openrouter.py
│   │
│   ├── prompts/
│   │   ├── prompt_builder.py
│   │   └── templates.py
│   │
│   ├── report/
│   │   ├── claude_prompt_builder.py
│   │   ├── html_renderer.py
│   │   ├── pdf_generator.py
│   │   ├── report_service.py
│   │   ├── schemas.py
│   │   └── templates.py
│   │
│   ├── schemas/
│   │   ├── analysis.py
│   │   └── prompt.py
│   │
│   ├── services/
│   │   ├── analysis_service.py
│   │   └── question_service.py
│   │
│   ├── utils/
│   │   └── logger.py
│   │
│   ├── vision/
│   │   ├── image_loader.py
│   │   ├── inference.py
│   │   ├── labels.py
│   │   ├── preprocessing.py
│   │   └── remoteclip.py
│   │
│   └── main.py
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── models/
├── data/
├── docs/
├── .env.example
├── .gitignore
└── README.md
```

---

## 🛠️ Tech Stack

### Backend

- Python 3.9+
- FastAPI
- Uvicorn
- PyTorch
- OpenCLIP
- RemoteCLIP
- Pillow
- Pydantic Settings
- OpenAI-compatible async client
- Tenacity
- OpenRouter

### Frontend

- React 18
- Vite
- JavaScript / JSX
- CSS

### AI / ML

- RemoteCLIP ViT-L/14
- Zero-shot image-text similarity
- Cosine similarity
- Confidence scoring
- LLM-based EO reasoning
- Structured report generation

---

## ⚙️ Configuration

Create a `.env` file in the project root:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
MODEL_NAME=your_primary_model
REPORT_MODEL=your_report_model
LOG_LEVEL=INFO
```

`MODEL_NAME` must be explicitly configured. `REPORT_MODEL` controls the model used for professional report generation.

Do **not** commit `.env` or API keys to GitHub.

---

## 🚀 Installation

### Backend

```bash
git clone https://github.com/Nirmal0804/Nova-AI.git
cd Nova-AI

python -m venv venv
```

#### Windows

```bash
venv\Scriptsctivate
```

#### Linux / macOS

```bash
source venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r backend/requirements.txt
```

Configure environment variables:

```bash
cp .env.example .env
```

On Windows, copy `.env.example` to `.env` manually if `cp` is unavailable.

Start the API:

```bash
python -m uvicorn backend.main:app --reload --port 8000
```

---

## 💻 Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will start the development server and provide the local frontend URL.

---

## 🛰️ RemoteCLIP Model

NovaAI uses the **RemoteCLIP ViT-L/14** checkpoint.

The application manages the checkpoint automatically:

1. Checks whether the checkpoint exists.
2. Validates the expected file size.
3. Downloads the checkpoint when required.
4. Supports resuming an interrupted download.
5. Loads the model once and reuses it through a singleton service.
6. Uses CUDA when available and falls back to CPU otherwise.

The checkpoint is large, so the first model initialization can take significantly longer than subsequent inference requests.

---

## 📡 API Overview

The backend exposes API modules for:

- Image analysis
- Chat / LLM interaction
- Insights
- EO interpretation
- Vision processing
- Professional report generation

The primary analysis flow is exposed through the analysis API and returns a structured `AnalysisResponse`.

A successful response can include:

```text
status
dominant_land_cover
secondary_land_cover
confidence
summary
gpt_analysis
professional_report
warning
insight
classes
flags
title
risk_level
metadata
```

---

## 📊 Output & Provenance

NovaAI keeps model provenance in the final analysis response.

Example metadata fields:

```text
Vision Model
LLM Reasoning Model
Report Model
Processing Time
Timestamp (UTC)
API Version
```

This makes the pipeline easier to inspect and helps distinguish model output from deterministic EO interpretation.

---

## 🛡️ Fault Tolerance

NovaAI does not make the external LLM a single point of failure.

If the LLM request fails:

```text
RemoteCLIP
    ↓
EO Interpretation
    ↓
Vision Results
    ↓
partial_success
```

The system can still return the available vision classification and EO summary.

Professional reports also use fallback structures when the report model is unavailable or produces invalid JSON.

---

## 🔐 Security Notes

- Store API keys only in environment variables.
- Never commit `.env`.
- Do not expose OpenRouter credentials in frontend code.
- API requests should be protected appropriately before production deployment.
- The current frontend is designed primarily as a local/development interface.

---

## ⚠️ Current Limitations

NovaAI is a research/prototype system rather than a production-grade satellite intelligence platform.

Important limitations include:

- RemoteCLIP zero-shot classification depends on the candidate label set.
- Confidence scores should not be interpreted as calibrated geospatial probabilities.
- LLM-generated explanations may contain hallucinations and should be independently verified.
- Satellite scene understanding is limited by image quality, resolution, sensor characteristics, and the available semantic labels.
- The RemoteCLIP ViT-L/14 checkpoint requires substantial storage and compute resources.
- External LLM functionality depends on OpenRouter availability, API limits, and configured models.
- Production deployments require stronger authentication, rate limiting, observability, and data governance.

---

## 🔭 Future Directions

Potential extensions include:

- Multi-sensor and multispectral analysis
- AOI-aware geospatial processing
- Temporal satellite change detection
- Vegetation and environmental indices
- Geospatial database integration
- Satellite metadata ingestion
- Map-based visualization
- More specialized EO foundation models
- Retrieval-augmented geospatial knowledge
- Automated PDF report delivery
- Batch satellite scene analysis
- Production-grade authentication and deployment

---

## 🎯 Project Goal

NovaAI aims to bridge the gap between **raw Earth Observation imagery** and **human-readable geospatial intelligence** by combining specialized vision models with language-model reasoning.

Instead of returning only a classification label, the system attempts to provide an interpretable analysis pipeline with:

**Vision → Interpretation → Reasoning → Reporting → Provenance**

---

## 📄 License

Add the project's chosen license before distributing NovaAI publicly.

---

## 👤 Author

**Nirmal P**

GitHub: [@Nirmal0804](https://github.com/Nirmal0804)

