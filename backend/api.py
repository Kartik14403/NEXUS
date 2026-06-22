from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from assistant import execute_command
import os
import requests

app = Flask(__name__, static_folder="../frontend", static_url_path="")
CORS(app)  # Enable CORS for all routes

@app.route("/")
def serve_index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def serve_static_files(path):
    return send_from_directory(app.static_folder, path)

@app.route("/execute", methods=["POST"])
def execute():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"response": "No data received."}), 400
            
        command = data.get("command", "").strip()
        model = data.get("model", "gemma:2b")
        
        if not command:
            return jsonify({"response": "No command received. Please enter a message."}), 400
            
        print(f"📝 Received command: {command}")
        print(f"🤖 Using model: {model}")
        result = execute_command(command, model)
        
        if not result:
            result = "I'm sorry, I couldn't process that request. Please try again."
            
        print(f"🤖 Sending response: {result[:100]}...")
        return jsonify({"response": result})
        
    except Exception as e:
        error_msg = f"Error processing request: {str(e)}"
        print(f"❌ Error: {error_msg}")
        return jsonify({"response": error_msg}), 500

@app.route("/health", methods=["GET"])
def health_check():
    # Check if Ollama is running
    ollama_status = "disconnected"
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            ollama_status = "connected"
    except:
        pass
    
    return jsonify({
        "status": "healthy", 
        "message": "NEXUS backend is running",
        "ollama": ollama_status,
        "ai_model": "gemma:2b" if ollama_status == "connected" else "fallback"
    })

if __name__ == "__main__":
    print("🚀 Starting NEXUS backend server...")
    print("📁 Serving frontend from:", app.static_folder)
    print("🌐 Server will be available at: http://localhost:5000")
    app.run(debug=True, host="0.0.0.0", port=5000)
