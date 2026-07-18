from typing import Dict, Any
from backend.llm.base import BaseLLMProvider

class GPTService:
    def __init__(self, provider: BaseLLMProvider):
        self.provider = provider
        
    async def generate_response(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        """
        Wraps the LLM provider to ensure consistent behavior and logging if needed.
        """
        return await self.provider.generate_response(system_prompt, user_prompt)
