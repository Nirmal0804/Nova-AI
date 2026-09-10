from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import time

from backend.llm.openrouter import OpenRouterClient
from backend.llm.gpt_service import GPTService
from backend.utils.logger import logger
from backend.config.settings import settings

router = APIRouter(prefix="/api/chat", tags=["Chat"])

class ChatRequest(BaseModel):
    message: str

class ChatMessageItem(BaseModel):
    role: str
    text: str

class StreamChatRequest(BaseModel):
    question: str
    result: Dict[str, Any]
    history: List[ChatMessageItem]

class ChatResponse(BaseModel):
    response: str
    model: str
    provider: str
    usage: Dict[str, Any] = {}

# Dependency injection can be expanded later
provider = OpenRouterClient()
gpt_service = GPTService(provider)

@router.post("/stream")
async def stream_chat(request: StreamChatRequest):
    logger.info(f"Received streaming chat request. Question: {request.question[:40]}...")
    
    # 1. Ground response context in results
    system_prompt = f"""You are NovaAI, a helpful geospatial intelligence AI assistant.
You are grounded in the following Earth Observation (EO) Analysis Result:
Dominant Land Cover: {request.result.get('dominant_land_cover', 'N/A')}
Secondary Land Cover: {request.result.get('secondary_land_cover', 'N/A')}
Confidence: {request.result.get('confidence', 'N/A')}
Risk Level: {request.result.get('risk_level', 'N/A')}
Scene Type: {request.result.get('scene_type', 'N/A')}

Summary:
{request.result.get('summary', 'No summary available.')}

Grounded analysis details:
{request.result.get('gpt_analysis', '')}

Answer user questions accurately, professionally, and simply based on this context and any chat history. Keep your response extremely simple, concise, and focused — strictly maximum 3 to 4 sentences or bullet points (about 3-4 lines of content)."""

    messages = [{"role": "system", "content": system_prompt}]
    
    # 2. Append history
    for msg in request.history:
        role = "assistant" if msg.role == "assistant" else "user"
        messages.append({"role": role, "content": msg.text})
        
    # 3. Append current question
    messages.append({"role": "user", "content": request.question})
    
    # 4. Stream response
    async def event_generator():
        try:
            client = OpenRouterClient()
            client.model = settings.MODEL_NAME
            
            logger.info(f"Streaming from OpenRouter for model: {client.model} / token limit: 3000")
            
            response = await client.client.chat.completions.create(
                model=client.model,
                messages=messages,
                stream=True,
                max_tokens=3000
            )
            
            async for chunk in response:
                content = chunk.choices[0].delta.content or ""
                if content:
                    yield content
                    
        except Exception as e:
            logger.error(f"Error during chat streaming: {str(e)}")
            yield f" [Error during response generation: {str(e)}]"

    return StreamingResponse(event_generator(), media_type="text/plain")

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
