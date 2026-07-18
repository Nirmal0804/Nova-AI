import os
import sys
import time
import torch
import open_clip
import requests
from backend.utils.logger import logger

CHECKPOINT_URL = (
    "https://huggingface.co/chendelong/RemoteCLIP/resolve/main/RemoteCLIP-ViT-L-14.pt"
)
EXPECTED_SIZE = 1_710_613_765  # bytes – exact size of the official checkpoint


class RemoteCLIPService:
    def __init__(self):
        self.model_name = "ViT-L-14"
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.preprocess = None
        self.tokenizer = None
        self.checkpoint_path = os.path.join("models", "RemoteCLIP-ViT-L-14.pt")

    # ------------------------------------------------------------------
    # Checkpoint management
    # ------------------------------------------------------------------

    def _checkpoint_valid(self) -> bool:
        """Returns True if the checkpoint file exists and has the expected size."""
        if not os.path.exists(self.checkpoint_path):
            return False
        size = os.path.getsize(self.checkpoint_path)
        if size != EXPECTED_SIZE:
            logger.warning(f"Checkpoint exists but has unexpected size ({size:,} vs {EXPECTED_SIZE:,}). Will re-download.")
            return False
        return True

    def _download_checkpoint(self):
        """
        Downloads the RemoteCLIP-ViT-L-14 checkpoint directly via HTTP streaming.
        Supports resume. Does NOT use huggingface_hub symlinks (fails on Windows
        without admin/Developer Mode).
        """
        os.makedirs("models", exist_ok=True)

        existing = os.path.getsize(self.checkpoint_path) if os.path.exists(self.checkpoint_path) else 0
        headers = {}
        if existing > 0:
            headers["Range"] = f"bytes={existing}-"
            logger.info(f"Resuming checkpoint download from {existing:,} bytes...")
        else:
            logger.info("Downloading RemoteCLIP-ViT-L-14.pt from Hugging Face...")

        try:
            response = requests.get(CHECKPOINT_URL, headers=headers, stream=True, timeout=60, allow_redirects=True)
        except requests.exceptions.ConnectionError as e:
            raise RuntimeError(f"Network error while downloading checkpoint: {e}")

        if response.status_code not in (200, 206):
            raise RuntimeError(f"Checkpoint download failed with HTTP {response.status_code}")

        total = int(response.headers.get("Content-Length", 0)) + existing
        downloaded = existing
        chunk_size = 1024 * 1024  # 1 MB
        log_interval = 50  # log a line every 50 MB
        log_counter = 0

        mode = "ab" if existing > 0 else "wb"
        with open(self.checkpoint_path, mode) as f:
            for chunk in response.iter_content(chunk_size=chunk_size):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    log_counter += 1
                    if log_counter % log_interval == 0 and total:
                        pct = downloaded / total * 100
                        logger.info(f"  Checkpoint download: {pct:.1f}% ({downloaded / 1e6:.0f} / {total / 1e6:.0f} MB)")

        final_size = os.path.getsize(self.checkpoint_path)
        if final_size != EXPECTED_SIZE:
            os.remove(self.checkpoint_path)
            raise RuntimeError(f"Downloaded checkpoint has wrong size ({final_size:,} bytes). File removed.")

        logger.info(f"Checkpoint downloaded successfully to {self.checkpoint_path}")

    # ------------------------------------------------------------------
    # Model loading
    # ------------------------------------------------------------------

    def load_model(self):
        """
        Loads RemoteCLIP ViT-L-14. Skips if already loaded (singleton pattern).
        Downloads the checkpoint automatically if missing or invalid.
        Falls back to CPU if CUDA is unavailable.
        """
        if self.model is not None:
            return

        logger.info(f"Initializing RemoteCLIP. Device: {self.device}")

        # 1. Ensure valid checkpoint
        if not self._checkpoint_valid():
            self._download_checkpoint()

        # 2. Build model architecture via open_clip
        try:
            logger.info("Building ViT-L-14 architecture via open_clip...")
            model, _, preprocess = open_clip.create_model_and_transforms(self.model_name)
            tokenizer = open_clip.get_tokenizer(self.model_name)
        except Exception as e:
            raise RuntimeError(f"open_clip model creation failed: {e}")

        # 3. Load RemoteCLIP state dict
        try:
            load_start = time.time()
            logger.info(f"Loading checkpoint weights from {self.checkpoint_path} ...")
            checkpoint = torch.load(self.checkpoint_path, map_location="cpu")

            # Defensive: some checkpoints wrap state_dict inside a dict
            state_dict = checkpoint.get("state_dict", checkpoint) if isinstance(checkpoint, dict) else checkpoint
            model.load_state_dict(state_dict)

            self.model = model.to(self.device)
            self.model.eval()
            self.preprocess = preprocess
            self.tokenizer = tokenizer

            logger.info(
                f"RemoteCLIP {self.model_name} loaded successfully in "
                f"{time.time() - load_start:.2f}s on {self.device}."
            )
        except Exception as e:
            logger.error(f"Failed to load RemoteCLIP weights: {e}")
            raise RuntimeError(f"Checkpoint loading failed: {e}")


# Singleton instance — model is NOT loaded at import time.
# Call remoteclip_service.load_model() to initialize.
remoteclip_service = RemoteCLIPService()
