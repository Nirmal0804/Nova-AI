from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import time

from backend.llm.openrouter import OpenRouterClient
from backend.llm.gpt_service import GPTService
from backend.utils.logger import logger

router = APIRouter(prefix="/api/chat", tags=["Chat"])

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    model: str
    provider: str
    usage: Dict[str, Any] = {}

# Dependency injection can be expanded later
provider = OpenRouterClient()
gpt_service = GPTService(provider)

@router.post("/test", response_model=ChatResponse)
async def test_chat(request: ChatRequest):
    logger.info("Received request on /api/chat/test")
    
    system_prompt = "You are Nova Ai, a helpful intelligent assistant."
    
    start_time = time.time()
    try:
        result = await gpt_service.generate_response(
            system_prompt=system_prompt,
            user_prompt=request.message
        )
        
        response_time = time.time() - start_time
        logger.info(f"Response received successfully in {response_time:.2f} seconds.")
        
        return ChatResponse(
            response=result["response"],
            model=result["model"],
            provider=result["provider"],
            usage=result.get("usage", {})
        )
        
    except ValueError as e:
        logger.error(f"Value Error: {str(e)}")
        if "API Key" in str(e):
            raise HTTPException(status_code=401, detail="API Key configuration error")
        if "MODEL_NAME" in str(e):
            raise HTTPException(status_code=500, detail="MODEL_NAME configuration error")
        raise HTTPException(status_code=500, detail="Internal configuration error")
    except Exception as e:
        response_time = time.time() - start_time
        logger.error(f"Error calling GPT service after {response_time:.2f} seconds: {str(e)}")
        # Check for OpenAI SDK exception types
        from openai import AuthenticationError, RateLimitError, APITimeoutError, APIStatusError, APIConnectionError
        if isinstance(e, AuthenticationError):
            raise HTTPException(status_code=401, detail="Authentication failed with LLM provider")
        if isinstance(e, APITimeoutError):
            raise HTTPException(status_code=504, detail="Timeout communicating with LLM provider")
        if isinstance(e, RateLimitError):
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        if isinstance(e, APIConnectionError):
            raise HTTPException(status_code=502, detail="Could not connect to LLM provider")
        if isinstance(e, APIStatusError):
            raise HTTPException(status_code=502, detail="Bad gateway or error from LLM provider")
            
        raise HTTPException(status_code=500, detail="Unexpected error occurred")
