from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_response(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        """
        Takes a system prompt and user prompt and returns a response dictionary.
        Format:
        {
            "response": "...",
            "usage": { ... },
            "model": "...",
            "provider": "ProviderName"
        }
        """
        pass
