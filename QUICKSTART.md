# NEXUS Quick Start Guide

Get NEXUS up and running in 5 minutes! 🚀

## Prerequisites

- **Python 3.8+** installed
- **Git** installed
- **Internet connection** for downloading models

## Installation

### 1. Clone and Setup
```bash
git clone https://github.com/yourusername/NEXUS-Project.git
cd NEXUS-Project
python setup.py
```

### 2. Install Ollama

**Windows:**
```bash
# Download from https://ollama.ai or use:
winget install Ollama.Ollama
```

**macOS:**
```bash
# Download from https://ollama.ai or use:
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 3. Start Services

**Terminal 1 - Start Ollama:**
```bash
ollama serve
```

**Terminal 2 - Start NEXUS:**
```bash
python start_backend.py
```

### 4. Open NEXUS
Navigate to `http://localhost:5000` in your browser.

## Install AI Models

Choose one or more models:

```bash
# Lightweight and fast
ollama pull gemma:2b

# Balanced performance
ollama pull llama3

# Latest model
ollama pull llama3.1

# Code-focused
ollama pull codellama
```

## First Use

1. **Start chatting**: Type your message and press Enter
2. **Try examples**: Click the suggested prompts
3. **Change model**: Go to Settings → AI Model
4. **Manage chats**: Use the sidebar for chat history

## Troubleshooting

**"Cannot connect to backend"**
- Make sure `python start_backend.py` is running

**"Ollama connection failed"**
- Run `ollama serve` in a separate terminal
- Check if models are installed: `ollama list`

**Models not working**
- Install a model: `ollama pull gemma:2b`
- Restart Ollama service

## Need Help?

- 📖 Full documentation: [README.md](README.md)
- 🐛 Report issues: [GitHub Issues](https://github.com/yourusername/ARIS-Project/issues)
- 💬 Community: [Discussions](https://github.com/yourusername/ARIS-Project/discussions)

---

**That's it! You're ready to chat with ARIS! 🤖✨**
