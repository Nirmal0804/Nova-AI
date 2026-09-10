# Nova Ai

Nova Ai is a multimodal AI assistant capable of analyzing Earth Observation satellite images using RemoteCLIP and GPT-OSS (OpenRouter).

## Setup Instructions

### Backend
1. Python 3.9+ is recommended.
2. Navigate to the root directory `Nova Ai/`.
3. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/Scripts/activate # Windows
   # source venv/bin/activate # Unix
   ```
4. Install requirements:
   ```bash
   pip install -r backend/requirements.txt
   ```
5. Copy `.env.example` to `.env` and fill in your keys. **You must explicitly define a `MODEL_NAME`** as there are no hardcoded default models. Optionally set `OPENROUTER_BASE_URL` to override the default OpenRouter endpoint (`https://openrouter.ai/api/v1`).
6. Run the backend:
   ```bash
   python -m uvicorn backend.main:app --reload --port 8000
   ```
   Or `uvicorn backend.main:app --reload` from `Nova Ai/` directory.

### Frontend
1. Navigate to `frontend/`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Folder Explanation

- `backend/`: FastApi python application. Includes API, LLM integration, Vision processing, services, and configuration.
- `frontend/`: React + Vite application for presenting the user interface.
- `models/`: Storing ML model weights or architecture files (e.g. RemoteCLIP).
- `data/`: Storage for datasets and image caching.
- `docs/`: Project documentation.
