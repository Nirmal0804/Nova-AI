import os

folders = [
    "backend/api",
    "backend/config",
    "backend/llm",
    "backend/vision",
    "backend/interpreter",
    "backend/prompts",
    "backend/services",
    "backend/schemas",
    "backend/utils",
    "models",
    "data",
    "docs"
]

for folder in folders:
    os.makedirs(folder, exist_ok=True)

print("Folders created successfully.")
