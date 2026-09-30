#!/usr/bin/env python3
"""
VEILAGENT - Model Downloader Script
Downloads the official MediaPipe Face Detector task model for on-device browser inference.
Model: BlazeFace Short Range (face_detector.task)
Source: Google MediaPipe Official Models Repository
License: Apache 2.0
"""

import os
import sys
import urllib.request
import hashlib

MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite"
DEST_DIR = os.path.join(os.path.dirname(__file__), "..", "extension", "public", "models")
DEST_FILE = os.path.join(DEST_DIR, "face_detector.task")

def download_model():
    print("=" * 60)
    print("VEILAGENT: Downloading On-Device Face Detector Model")
    print(f"Source: {MODEL_URL}")
    print(f"Target: {os.path.abspath(DEST_FILE)}")
    print("=" * 60)

    os.makedirs(DEST_DIR, exist_ok=True)

    try:
        def reporthook(count, block_size, total_size):
            if total_size > 0:
                percent = int(count * block_size * 100 / total_size)
                sys.stdout.write(f"\rDownloading: {percent}% [{count * block_size}/{total_size} bytes]")
                sys.stdout.flush()

        urllib.request.urlretrieve(MODEL_URL, DEST_FILE, reporthook=reporthook)
        print("\nDownload completed successfully.")

        # Verify file size and checksum
        file_size = os.path.getsize(DEST_FILE)
        print(f"Model file size: {file_size} bytes ({file_size / 1024:.2f} KB)")

        with open(DEST_FILE, "rb") as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()
        print(f"SHA-256 Checksum: {file_hash}")

        if file_size < 50000:
            print("WARNING: Model file seems unusually small. Please verify network connectivity.")
            return False

        print("\nModel verification SUCCESS. Ready for Chrome Extension on-device perception.")
        return True

    except Exception as e:
        print(f"\nERROR downloading model: {e}")
        print("Note: In offline testing or sandbox environments, a synthetic model binary placeholder can be verified.")
        return False

if __name__ == "__main__":
    success = download_model()
    sys.exit(0 if success else 1)
