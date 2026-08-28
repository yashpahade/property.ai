"""
Props.ai Unified Launcher & Verification Script
Starts FastAPI Backend with full RAG Intelligence, PostGIS/Geospatial indexing, and Ready Reckoner benchmarks.
"""

import sys
import os
import subprocess
import time

def start_backend():
    print("=" * 60)
    print("✦ Starting Props.ai Real Estate Intelligence Backend...")
    print("✦ Ready Reckoner, IGR Maharashtra, MahaRERA & All-India RAG Engine")
    print("=" * 60)
    
    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
    
    cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
    try:
        subprocess.run(cmd, cwd=backend_dir)
    except KeyboardInterrupt:
        print("\nStopping Props.ai backend...")

if __name__ == "__main__":
    start_backend()
