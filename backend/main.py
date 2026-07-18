from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.config.settings import settings
from backend.utils.logger import logger
from backend.api.chat import router as chat_router
from backend.api.vision import router as vision_router
from backend.api.interpreter import router as interpreter_router
from backend.api.analyze import router as analyze_router
from backend.api.insights import router as insights_router

app = FastAPI(
    title="Nova Ai API",
    version="1.0.0"
)

# CORS enabled
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(vision_router)
app.include_router(interpreter_router)
app.include_router(analyze_router)
app.include_router(insights_router)

@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting up Nova Ai API. Model: {settings.MODEL_NAME}")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error"}
    )

@app.get("/health")
async def health_check():
    return {"status": "success", "message": "API is healthy"}
