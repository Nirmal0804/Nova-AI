from openai import AsyncOpenAI, AuthenticationError, APIConnectionError, RateLimitError, APITimeoutError, APIStatusError
from typing import Dict, Any
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from backend.config.settings import settings
from backend.utils.logger import logger
from backend.llm.base import BaseLLMProvider


class OpenRouterClient(BaseLLMProvider):
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.model = settings.MODEL_NAME
        self.base_url = settings.OPENROUTER_BASE_URL.rstrip("/")
        self.provider_name = "OpenRouter"

        # Initialize the OpenAI-compatible async client pointed at OpenRouter
        self.client = AsyncOpenAI(
            api_key=self.api_key,
            base_url=self.base_url,
            timeout=30.0,
            default_headers={
                "HTTP-Referer": "http://localhost:8000",
                "X-Title": "Nova Ai"
            }
        )

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((APIConnectionError, APITimeoutError)),
        reraise=True
    )
    async def _make_request(self, messages: list) -> Any:
        logger.info(f"Sending request to OpenRouter for model: {self.model}")
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages
            )
            return response

        except AuthenticationError:
            logger.error("OpenRouter Auth Error: invalid or missing API key.")
            raise
        except RateLimitError:
            logger.error("OpenRouter rate limit exceeded.")
            raise
        except APITimeoutError:
            logger.error("OpenRouter request timed out.")
            raise
        except APIConnectionError as e:
            logger.error(f"Connection error to OpenRouter: {str(e)}")
            raise
        except APIStatusError as e:
            logger.error(f"OpenRouter API status error: {e.status_code}")
            raise
        except Exception as e:
            logger.error("Unexpected error occurred while calling OpenRouter")
            raise

    async def generate_response(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        if not self.api_key or self.api_key == "your_api_key_here":
            logger.error("API Key is missing or invalid.")
            raise ValueError("Invalid completely or missing API Key")

        if not self.model:
            logger.error("MODEL_NAME is missing or not configured.")
            raise ValueError("MODEL_NAME is missing or not configured")

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        response = await self._make_request(messages)

        # Extract the necessary format
        try:
            response_text = response.choices[0].message.content
            usage = {}
            if response.usage:
                usage = {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens,
                }
            model_used = response.model or self.model

            logger.info("Successfully received response from OpenRouter.")

            return {
                "response": response_text,
                "usage": usage,
                "model": model_used,
                "provider": self.provider_name
            }
        except (AttributeError, IndexError) as e:
            logger.error("Unexpected API response format from OpenRouter.")
            raise ValueError("Unexpected API response format") from e
