"""
Download RemoteCLIP-ViT-L-14.pt directly from Hugging Face without using
the huggingface_hub cache/symlink system (which requires admin on Windows).

Run from the project root:
    python download_checkpoint.py
"""
import os
import sys
import requests

CHECKPOINT_URL = (
    "https://huggingface.co/chendelong/RemoteCLIP/resolve/main/RemoteCLIP-ViT-L-14.pt"
)
DEST_PATH = os.path.join("models", "RemoteCLIP-ViT-L-14.pt")
EXPECTED_SIZE = 1_710_613_765  # bytes


def download():
    os.makedirs("models", exist_ok=True)

    # Resume support: check if partial file already exists
    existing_size = 0
    if os.path.exists(DEST_PATH):
        existing_size = os.path.getsize(DEST_PATH)
        if existing_size == EXPECTED_SIZE:
            print(f"Checkpoint already fully downloaded at {DEST_PATH} ({existing_size:,} bytes). Nothing to do.")
            return
        print(f"Resuming from {existing_size:,} bytes...")

    headers = {}
    if existing_size > 0:
        headers["Range"] = f"bytes={existing_size}-"

    print(f"Downloading from:\n  {CHECKPOINT_URL}")
    print(f"Saving to:        {DEST_PATH}\n")

    response = requests.get(CHECKPOINT_URL, headers=headers, stream=True, timeout=60, allow_redirects=True)

    if response.status_code not in (200, 206):
        print(f"ERROR: Server returned HTTP {response.status_code}")
        sys.exit(1)

    total = int(response.headers.get("Content-Length", 0)) + existing_size
    downloaded = existing_size
    chunk_size = 1024 * 1024  # 1 MB

    mode = "ab" if existing_size > 0 else "wb"
    with open(DEST_PATH, mode) as f:
        for chunk in response.iter_content(chunk_size=chunk_size):
            if chunk:
                f.write(chunk)
                downloaded += len(chunk)
                pct = downloaded / total * 100 if total else 0
                mb_done = downloaded / 1024 / 1024
                mb_total = total / 1024 / 1024
                print(f"\r  {pct:.1f}%  {mb_done:.0f} / {mb_total:.0f} MB", end="", flush=True)

    print()  # newline after progress
    final_size = os.path.getsize(DEST_PATH)
    if final_size != EXPECTED_SIZE:
        print(f"WARNING: Expected {EXPECTED_SIZE:,} bytes but got {final_size:,}. File may be corrupt.")
        sys.exit(1)

    print(f"\nDownload complete. Checkpoint saved to: {DEST_PATH}")


if __name__ == "__main__":
    download()
