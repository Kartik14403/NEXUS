#!/usr/bin/env python3
"""
Test script to verify Ollama gemma:2b integration
"""

import requests
import json

def test_ollama_direct():
    """Test Ollama directly"""
    print("🧪 Testing Ollama directly...")
    try:
        response = requests.post("http://localhost:11434/api/generate", json={
            "model": "gemma:2b",
            "prompt": "Hello, how are you?",
            "stream": False
        })
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Ollama response: {data.get('response', 'No response')[:100]}...")
            return True
        else:
            print(f"❌ Ollama error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Ollama connection error: {e}")
        return False

def test_backend_health():
    """Test backend health endpoint"""
    print("🧪 Testing backend health...")
    try:
        response = requests.get("http://localhost:5000/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend health: {data}")
            return data.get('ollama') == 'connected'
        else:
            print(f"❌ Backend health error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend connection error: {e}")
        return False

def test_backend_chat():
    """Test backend chat endpoint"""
    print("🧪 Testing backend chat...")
    try:
        response = requests.post("http://localhost:5000/execute", json={
            "command": "Hello, how are you?"
        })
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend chat response: {data.get('response', 'No response')[:100]}...")
            return True
        else:
            print(f"❌ Backend chat error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend chat connection error: {e}")
        return False

def main():
    print("🤖 ARIS Ollama Integration Test")
    print("=" * 40)
    
    # Test 1: Direct Ollama
    ollama_ok = test_ollama_direct()
    
    # Test 2: Backend health
    health_ok = test_backend_health()
    
    # Test 3: Backend chat
    chat_ok = test_backend_chat()
    
    print("\n📊 Test Results:")
    print(f"Ollama Direct: {'✅' if ollama_ok else '❌'}")
    print(f"Backend Health: {'✅' if health_ok else '❌'}")
    print(f"Backend Chat: {'✅' if chat_ok else '❌'}")
    
    if ollama_ok and health_ok and chat_ok:
        print("\n🎉 All tests passed! Ollama gemma:2b is working with ARIS!")
    else:
        print("\n⚠️ Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    main()
