# NEXUS - AI Assistant

NEXUS is a modern, ChatGPT-style AI assistant built with Flask backend and vanilla JavaScript frontend. It features a beautiful dark/light theme interface with dynamic chat history, collapsible messages, and support for multiple AI models through Ollama.

![NEXUS Interface](https://img.shields.io/badge/Interface-ChatGPT%20Style-blue)
![Python](https://img.shields.io/badge/Python-3.8+-green)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![Flask](https://img.shields.io/badge/Flask-2.0+-red)

## ✨ Features

- 🤖 **Multiple AI Models**: Support for Gemma, Llama, and Code Llama models
- 🎨 **Modern UI**: ChatGPT-style interface with dark/light themes
- 💬 **Dynamic Chat History**: Organized by Recent, 7 Days, and 30 Days
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔄 **Collapsible Messages**: Long responses are automatically collapsed
- ⚡ **Real-time Notifications**: Connection status and user feedback
- 🎯 **Smart Scrolling**: Scroll-to-top button and optimized message display
- ⚙️ **Customizable Settings**: AI model selection and user preferences
- 💾 **Local Storage**: Chat history saved locally in browser

## 🚀 Quick Start

### Prerequisites

Before running NEXUS, make sure you have the following installed:

1. **Python 3.8+** - [Download here](https://www.python.org/downloads/)
2. **Ollama** - AI model runner
3. **Git** - For cloning the repository

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/NEXUS-Project.git
   cd NEXUS-Project
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Install and setup Ollama**
   
   **Windows:**
   ```bash
   # Download and install from https://ollama.ai
   # Or use winget
   winget install Ollama.Ollama
   ```

   **macOS:**
   ```bash
   # Download and install from https://ollama.ai
   # Or use Homebrew
   brew install ollama
   ```

   **Linux:**
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

4. **Pull AI models**
   ```bash
   # Install recommended models (choose one or more)
   ollama pull gemma:2b          # Lightweight, fast model
   ollama pull llama3            # Balanced performance
   ollama pull llama3.1          # Latest Llama model
   ollama pull codellama         # Code-focused model
   ```

5. **Start Ollama service**
   ```bash
   ollama serve
   ```

6. **Run ARIS backend**
   ```bash
   python start_backend.py
   ```

7. **Open the application**
   - Navigate to `http://localhost:5000` in your browser
   - The frontend will be served automatically

## 🎯 Usage

### Basic Usage

1. **Start a conversation**: Type your message in the input field and press Enter
2. **Use example prompts**: Click on the suggested prompts on the welcome screen
3. **Manage conversations**: Use the sidebar to view and switch between chat sessions
4. **Customize settings**: Click the settings button to change AI model and preferences

### Available Commands

ARIS supports various commands:

- **General Chat**: Ask questions, get explanations, creative writing
- **Code Help**: Python programming, debugging, code examples
- **File Operations**: Create Word documents, open applications
- **Web Search**: Search Google or YouTube
- **System Info**: Get current time, date, weather
- **Math Calculations**: Basic arithmetic operations

### AI Model Selection

In the settings, you can choose between different AI models:

- **Gemma 2B**: Fast, lightweight, good for general tasks
- **Llama 3**: Balanced performance and quality
- **Llama 3.1**: Latest version with improved capabilities
- **Code Llama**: Specialized for programming tasks

## 🛠️ Development

### Project Structure

```
ARIS-Project/
├── backend/
│   ├── api.py              # Flask API endpoints
│   ├── assistant.py        # AI assistant logic
│   ├── requirements.txt    # Python dependencies
│   └── start_backend.py    # Backend startup script
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── style.css           # CSS styles
│   └── script.js           # JavaScript functionality
├── static/
│   └── icons/              # Static assets
├── README.md               # This file
├── LICENSE                 # License file
└── .gitignore             # Git ignore rules
```

### Backend API Endpoints

- `GET /` - Serves the frontend
- `POST /execute` - Processes user commands
- `GET /health` - Health check and Ollama status

### Frontend Features

- **Dynamic Sidebar**: Real-time chat history management
- **Message System**: Collapsible long messages with smooth animations
- **Theme System**: Dark/light theme with persistent settings
- **Notification System**: Real-time feedback and status updates
- **Responsive Design**: Mobile-friendly interface

## 🔧 Configuration

### Environment Variables

You can customize ARIS by setting these environment variables:

```bash
export FLASK_ENV=development  # Development mode
export FLASK_DEBUG=True       # Enable debug mode
export OLLAMA_HOST=localhost  # Ollama server host
export OLLAMA_PORT=11434      # Ollama server port
```

### Customization

- **Themes**: Modify CSS variables in `frontend/style.css`
- **AI Models**: Add new models in the settings dropdown
- **Commands**: Extend functionality in `backend/assistant.py`
- **UI Components**: Customize interface in `frontend/script.js`

## 🐛 Troubleshooting

### Common Issues

1. **"Cannot connect to backend server"**
   - Ensure the backend is running on port 5000
   - Check if `python start_backend.py` is running

2. **"Ollama connection failed"**
   - Make sure Ollama is installed and running
   - Run `ollama serve` in a separate terminal
   - Verify models are installed with `ollama list`

3. **Models not loading**
   - Check if the model is installed: `ollama list`
   - Pull the model: `ollama pull model_name`
   - Restart Ollama service

4. **Frontend not loading**
   - Ensure you're accessing `http://localhost:5000`
   - Check browser console for errors
   - Verify all files are in the correct directories

### Debug Mode

Enable debug mode for detailed logging:

```bash
export FLASK_DEBUG=True
python start_backend.py
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

### Development Setup

1. Clone your fork
2. Install dependencies: `pip install -r backend/requirements.txt`
3. Install Ollama and models
4. Run the development server
5. Make your changes
6. Test thoroughly
7. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ollama** - For providing the AI model runtime
- **Flask** - For the Python web framework
- **Font Awesome** - For the beautiful icons
- **OpenAI** - For inspiration from ChatGPT's interface design

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [Issues](https://github.com/yourusername/ARIS-Project/issues)
3. Create a new issue with detailed information
4. Join our community discussions

## 🔮 Roadmap

- [ ] Voice input/output support
- [ ] File upload and processing
- [ ] Plugin system for custom commands
- [ ] Multi-language support
- [ ] Cloud deployment options
- [ ] Mobile app version
- [ ] Advanced AI model management

---

**Made with ❤️ by the ARIS Team**

*ARIS - Your intelligent assistant for the modern world*