#!/usr/bin/env python3
"""
ARIS Backend Startup Script
This script helps you start the ARIS backend server with proper setup.
"""

import subprocess
import sys
import os
import time

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required")
        return False
    print(f"✅ Python {sys.version.split()[0]} detected")
    return True

def install_requirements():
    """Install required packages"""
    print("📦 Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        return False

def start_backend():
    """Start the backend server"""
    print("🚀 Starting ARIS backend server...")
    print("📁 Working directory:", os.getcwd())
    print("🌐 Server will be available at: http://localhost:5000")
    print("📱 Frontend will be available at: http://localhost:5000")
    print("\n" + "="*50)
    print("Press Ctrl+C to stop the server")
    print("="*50 + "\n")
    
    try:
        # Change to backend directory and run the API
        os.chdir("backend")
        subprocess.run([sys.executable, "api.py"])
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")

def main():
    print("🤖 ARIS Backend Startup Script")
    print("=" * 40)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install requirements
    if not install_requirements():
        print("⚠️  Continuing anyway...")
    
    # Start backend
    start_backend()

if __name__ == "__main__":
    main()
