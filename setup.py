#!/usr/bin/env python3
"""
ARIS Project Setup Script
This script helps set up the ARIS project with all necessary dependencies.
"""

import subprocess
import sys
import os
import platform

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        print(f"Current version: {version.major}.{version.minor}.{version.micro}")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")
    return True

def install_python_dependencies():
    """Install Python dependencies"""
    return run_command("pip install -r requirements.txt", "Installing Python dependencies")

def check_ollama():
    """Check if Ollama is installed"""
    try:
        result = subprocess.run("ollama --version", shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Ollama is already installed")
            return True
    except:
        pass
    
    print("❌ Ollama is not installed")
    print("Please install Ollama from https://ollama.ai")
    return False

def install_ollama_models():
    """Install recommended Ollama models"""
    models = ["gemma:2b", "llama3"]
    
    for model in models:
        if not run_command(f"ollama pull {model}", f"Installing {model}"):
            print(f"⚠️ Failed to install {model}, you can install it later with: ollama pull {model}")

def create_env_file():
    """Create .env file with default settings"""
    env_content = """# ARIS Configuration
FLASK_ENV=development
FLASK_DEBUG=True
OLLAMA_HOST=localhost
OLLAMA_PORT=11434
"""
    
    if not os.path.exists('.env'):
        with open('.env', 'w') as f:
            f.write(env_content)
        print("✅ Created .env file with default settings")
    else:
        print("ℹ️ .env file already exists")

def main():
    """Main setup function"""
    print("🚀 ARIS Project Setup")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install Python dependencies
    if not install_python_dependencies():
        print("❌ Failed to install Python dependencies")
        sys.exit(1)
    
    # Check Ollama
    if not check_ollama():
        print("\n📋 Ollama Installation Instructions:")
        print("1. Visit https://ollama.ai")
        print("2. Download and install Ollama for your platform")
        print("3. Run 'ollama serve' to start the service")
        print("4. Run this setup script again")
        sys.exit(1)
    
    # Install Ollama models
    print("\n🤖 Installing AI models...")
    install_ollama_models()
    
    # Create .env file
    create_env_file()
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Start Ollama: ollama serve")
    print("2. Start ARIS: python start_backend.py")
    print("3. Open http://localhost:5000 in your browser")
    print("\n📚 For more information, see README.md")

if __name__ == "__main__":
    main()
